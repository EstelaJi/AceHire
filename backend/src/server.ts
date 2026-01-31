import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketServer, Socket } from 'socket.io';
import { createClient } from 'redis';
import { Pool } from 'pg';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import FormData from 'form-data';
import { config } from './config';
import questionRoutes from './routes/questions';

type Role = 'ai' | 'candidate';

interface Message {
  role: Role;
  text: string;
  ts: number;
}

interface InterviewMeta {
  industry: string | null;
  level: string | null;
  messages: Message[];
  engineSessionId?: string;
}

interface CandidateTextPayload {
  text?: string;
}

interface CandidateAudioPayload {
  blob?: Blob | ArrayBuffer | Buffer | string;
}

interface InterviewStartPayload {
  industry?: string | null;
  level?: string | null;
}

interface AiAnalyzeResponse {
  reply?: string;
}

interface AiTranscribeResponse {
  text?: string;
}

interface AiQuestionResponse {
  question?: string;
}

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/questions', questionRoutes);

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*' }
});

const redis = createClient({ url: config.redisUrl });
redis.on('error', err => console.error('Redis error', err));

const pool = new Pool({ connectionString: config.postgresUrl });

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', detail: (err as Error).message });
  }
});

const interviews = new Map<string, InterviewMeta>(); // sessionId -> meta

async function sendInitialQuestion(sessionId: string, meta: InterviewMeta) {
  try {
    const { data } = await axios.post<AiQuestionResponse>(`${config.aiServiceUrl}/question`, {
      industry: meta.industry,
      level: meta.level
    });
    const question = data.question || 'Tell me about yourself.';
    meta.messages.push({ role: 'ai', text: question, ts: Date.now() });
    io.to(sessionId).emit('ai:message', { text: question });
  } catch (err) {
    console.error('AI question fetch failed', (err as Error).message);
    const fallback = 'Tell me about yourself.';
    meta.messages.push({ role: 'ai', text: fallback, ts: Date.now() });
    io.to(sessionId).emit('ai:message', { text: fallback });
  }
}

io.on('connection', socket => {
  const sessionId = uuid();
  const meta: InterviewMeta = { industry: null, level: null, messages: [] };

  interviews.set(sessionId, meta);
  socket.join(sessionId);
  socket.emit('system:welcome', { sessionId });

  socket.on('interview:start', async (payload: InterviewStartPayload = {}) => {
    meta.industry = payload.industry ?? null;
    meta.level = payload.level ?? null;
    try {
      console.log(`Starting interview engine for ${meta.industry} ${meta.level} role`);
      const { data } = await axios.post<{ session_id: string; question: string }>(
        `${config.aiServiceUrl}/engine/start`,
        {
          job_description: `${meta.industry || 'general'} ${meta.level || ''} role`,
          candidate_info: { level: meta.level, industry: meta.industry }
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );
      meta.engineSessionId = data.session_id;
      const first = data.question || 'Tell me about yourself.';
      meta.messages.push({ role: 'ai', text: first, ts: Date.now() });
      io.to(sessionId).emit('ai:message', { text: first });
      console.log(`Interview engine started successfully, session: ${data.session_id}`);
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: unknown }; message?: string };
      if (axiosError.response) {
        console.error(`Engine start failed: ${axiosError.response.status}`, axiosError.response.data);
        io.to(sessionId).emit('system:error', {
          message: `Failed to start interview engine: ${axiosError.response.status}. Using fallback.`
        });
      } else {
        console.error('Engine start failed:', (err as Error).message);
        io.to(sessionId).emit('system:error', {
          message: `Failed to start interview engine: ${(err as Error).message}. Using fallback.`
        });
      }
      await sendInitialQuestion(sessionId, meta);
    }
  });

  socket.on('candidate:text', async (payload: CandidateTextPayload = {}) => {
    const text = payload.text?.trim() || '';
    meta.messages.push({ role: 'candidate', text, ts: Date.now() });
    io.to(sessionId).emit('candidate:text:ack', { text });
    try {
      if (meta.engineSessionId) {
        const { data } = await axios.post(`${config.aiServiceUrl}/engine/next`, {
          session_id: meta.engineSessionId,
          text
        });
        if (data.action === 'ask_question') {
          const aiText = data.question;
          meta.messages.push({ role: 'ai', text: aiText, ts: Date.now() });
          io.to(sessionId).emit('ai:message', { text: aiText });
        } else if (data.action === 'end_interview') {
          io.to(sessionId).emit('interview:report', data.report);
        }
      } else {
        const { data } = await axios.post<AiAnalyzeResponse>(`${config.aiServiceUrl}/analyze`, {
          text,
          industry: meta.industry,
          level: meta.level
        });
        const aiText = data.reply || 'AI 回复占位符';
        meta.messages.push({ role: 'ai', text: aiText, ts: Date.now() });
        io.to(sessionId).emit('ai:message', { text: aiText });
      }
    } catch (err) {
      console.error('AI service failed', (err as Error).message);
      io.to(sessionId).emit('system:error', { message: 'AI 服务暂不可用' });
    }
  });

  socket.on('candidate:audio', async (payload: CandidateAudioPayload = {}) => {
    if (!payload.blob) {
      console.error('No audio blob received');
      return;
    }
    try {
      await redis.lPush('audio_queue', JSON.stringify({ sessionId, createdAt: Date.now() }));
      
      // Convert blob to Buffer for FormData
      let audioBuffer: Buffer;
      if (Buffer.isBuffer(payload.blob)) {
        audioBuffer = payload.blob;
      } else if (payload.blob instanceof ArrayBuffer) {
        audioBuffer = Buffer.from(payload.blob);
      } else if (typeof payload.blob === 'string') {
        // Base64 encoded string
        audioBuffer = Buffer.from(payload.blob, 'base64');
      } else {
        // Blob object - convert to ArrayBuffer first
        console.error('Unsupported blob type, expected Buffer or ArrayBuffer');
        io.to(sessionId).emit('system:error', { message: 'Unsupported audio format' });
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      
      console.log(`Sending audio to AI service for transcription, size: ${audioBuffer.length} bytes`);
      
      const { data } = await axios.post<AiTranscribeResponse>(
        `${config.aiServiceUrl}/transcribe`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000, // 30 second timeout for transcription
        }
      );
      
      const transcript = data.text || '';
      console.log(`Transcription result: ${transcript.substring(0, 100)}...`);
      
      if (meta.engineSessionId && transcript) {
        const { data: next } = await axios.post(`${config.aiServiceUrl}/engine/next`, {
          session_id: meta.engineSessionId,
          text: transcript
        });
        if (next.action === 'ask_question') {
          meta.messages.push({ role: 'candidate', text: transcript, ts: Date.now() });
          meta.messages.push({ role: 'ai', text: next.question, ts: Date.now() });
          io.to(sessionId).emit('candidate:text:ack', { text: transcript });
          io.to(sessionId).emit('ai:message', { text: next.question });
        } else if (next.action === 'end_interview') {
          io.to(sessionId).emit('interview:report', next.report);
        }
      } else if (transcript) {
        // If no engine session, use fallback analyze endpoint
        meta.messages.push({ role: 'candidate', text: transcript, ts: Date.now() });
        io.to(sessionId).emit('candidate:text:ack', { text: transcript });
        
        const { data: analyzeData } = await axios.post<AiAnalyzeResponse>(`${config.aiServiceUrl}/analyze`, {
          text: transcript,
          industry: meta.industry,
          level: meta.level
        });
        const aiText = analyzeData.reply || 'Thank you for your answer.';
        meta.messages.push({ role: 'ai', text: aiText, ts: Date.now() });
        io.to(sessionId).emit('ai:message', { text: aiText });
      } else {
        const aiText = 'Audio received, but transcription was empty. Please try again.';
        meta.messages.push({ role: 'ai', text: aiText, ts: Date.now() });
        io.to(sessionId).emit('ai:message', { text: aiText });
      }
    } catch (err) {
      console.error('Audio handling failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Audio handling failed';
      const axiosError = err as { response?: { status?: number; data?: unknown }; message?: string };
      
      if (axiosError.response) {
        console.error(`AI service error: ${axiosError.response.status}`, axiosError.response.data);
        io.to(sessionId).emit('system:error', { 
          message: `Audio transcription failed: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}` 
        });
      } else {
        io.to(sessionId).emit('system:error', { 
          message: `Audio handling failed: ${errorMessage}` 
        });
      }
    }
  });

  socket.on('interview:report', () => {
    const questionCount = meta.messages.filter(m => m.role === 'ai').length;
    const answerCount = meta.messages.filter(m => m.role === 'candidate').length;
    const summary =
      meta.messages.slice(-3).map(m => `${m.role === 'ai' ? 'AI' : '你'}: ${m.text}`).join(' | ') ||
      'No conversation';
    io.to(sessionId).emit('interview:report', {
      industry: meta.industry,
      level: meta.level,
      questionCount,
      answerCount,
      summary
    });
  });

  socket.on('disconnect', () => {
    socket.leave(sessionId);
    interviews.delete(sessionId);
  });
});

async function start() {
  await redis.connect();
  server.listen(config.port, () => {
    console.log(`API server listening on http://localhost:${config.port}`);
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});

