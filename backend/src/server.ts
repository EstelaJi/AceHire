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

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface CodeEvaluationRequest {
  problemId: string;
  code: string;
  language: 'javascript' | 'python' | 'java';
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface CodeEvaluationResponse {
  passed: boolean;
  score: number;
  feedback: string;
  testResults: Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual?: string;
    error?: string;
  }>;
}

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*' }
});

const redis = createClient({ url: config.redisUrl });
redis.on('error', err => console.error('Redis error', err));

const pool = new Pool({ connectionString: config.postgresUrl });

// Store coding problems in memory for demo purposes
const codingProblems = new Map<string, CodingProblem>();

// Sample coding problems
const sampleProblems: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}`,
      python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
    },
    testCases: [
      {
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]'
      },
      {
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]'
      },
      {
        input: '[3,3], 6',
        expectedOutput: '[0,1]'
      }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'medium',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4'
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // Your code here
}`,
      python: `def search(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    # Your code here`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
    }
}`
    },
    testCases: [
      {
        input: '[-1,0,3,5,9,12], 9',
        expectedOutput: '4'
      },
      {
        input: '[-1,0,3,5,9,12], 2',
        expectedOutput: '-1'
      }
    ]
  },
  {
    id: 'merge-k-sorted',
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
        explanation: 'The linked-lists are: [1->4->5, 1->3->4, 2->6]. Merging them into one sorted list: 1->1->2->3->4->4->5->6'
      }
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10^4.'
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
    // Your code here
}`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
def mergeKLists(lists):
    """
    :type lists: List[ListNode]
    :rtype: ListNode
    """
    # Your code here`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Your code here
    }
}`
    },
    testCases: [
      {
        input: '[[1,4,5],[1,3,4],[2,6]]',
        expectedOutput: '[1,1,2,3,4,4,5,6]'
      }
    ]
  }
];

// Initialize sample problems
sampleProblems.forEach(problem => {
  codingProblems.set(problem.id, problem);
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', detail: (err as Error).message });
  }
});

// API routes for coding interview
app.post('/api/coding/generate', async (req, res) => {
  try {
    const { difficulty } = req.body;
    
    // Filter problems by difficulty
    const filteredProblems = Array.from(codingProblems.values())
      .filter(problem => problem.difficulty === difficulty);
    
    if (filteredProblems.length === 0) {
      return res.status(404).json({ error: `No problems found for difficulty: ${difficulty}` });
    }
    
    // Select a random problem
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const selectedProblem = filteredProblems[randomIndex];
    
    res.json(selectedProblem);
  } catch (error) {
    console.error('Error generating problem:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
});

app.post('/api/coding/evaluate', async (req, res) => {
  try {
    const { problemId, code, language, testCases } = req.body as CodeEvaluationRequest;
    
    // Get the problem
    const problem = codingProblems.get(problemId);
    if (!problem) {
      return res.status(404).json({ error: `Problem not found: ${problemId}` });
    }
    
    // Evaluate code using AI service
    try {
      const { data } = await axios.post(`${config.aiServiceUrl}/code-evaluate`, {
        problem: {
          title: problem.title,
          description: problem.description,
          constraints: problem.constraints
        },
        code,
        language,
        testCases
      });
      
      res.json(data);
    } catch (error) {
      console.error('Error calling AI service for code evaluation:', error);
      
      // Fallback to simple test case evaluation
      const testResults = [];
      let passedCount = 0;
      
      for (const testCase of testCases) {
        try {
          // This is a simplified evaluation - in a real implementation,
          // you would need a proper code execution environment
          const result = await evaluateCodeSafely(code, language, testCase.input);
          const passed = result === testCase.expectedOutput;
          
          testResults.push({
            passed,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result
          });
          
          if (passed) passedCount++;
        } catch (error) {
          testResults.push({
            passed: false,
            input: testCase.input,
            expected: testCase.expectedOutput,
            error: (error as Error).message
          });
        }
      }
      
      const score = Math.round((passedCount / testCases.length) * 100);
      const passed = score === 100;
      
      let feedback = '';
      if (passed) {
        feedback = 'Excellent! All test cases passed. Your solution is correct.';
      } else {
        feedback = `Your solution passed ${passedCount} out of ${testCases.length} test cases. Keep trying!`;
      }
      
      res.json({
        passed,
        score,
        feedback,
        testResults
      });
    }
  } catch (error) {
    console.error('Error evaluating code:', error);
    res.status(500).json({ error: 'Failed to evaluate code' });
  }
});

// Simple code evaluation function (for demonstration purposes)
async function evaluateCodeSafely(code: string, language: string, input: string): Promise<string> {
  // This is a very simplified version - in production, you would use a proper
  // sandboxed code execution environment like Docker containers
  
  try {
    let result = '';
    
    if (language === 'javascript') {
      // For JavaScript, we'll use a simple eval with basic safety checks
      // WARNING: This is NOT secure for production use
      const wrappedCode = `
        ${code}
        
        // Try to extract the main function and call it with the input
        let result;
        try {
          // Parse input based on common patterns
          const inputParts = input.split(',').map(s => s.trim());
          const numsStr = inputParts[0].replace(/[\[\]]/g, '').split(',').map(n => parseInt(n.trim()));
          const target = parseInt(inputParts[1]);
          
          // Call the function (assuming it's named based on the problem)
          if (typeof twoSum === 'function') {
            result = twoSum(numsStr, target);
          } else if (typeof search === 'function') {
            result = search(numsStr, target);
          }
        } catch (e) {
          result = 'Error: ' + e.message;
        }
        
        result;
      `;
      
      result = eval(wrappedCode);
    } else if (language === 'python') {
      // For Python, we would need to use a Python interpreter
      // This is just a placeholder for demonstration
      result = 'Python evaluation not implemented in this demo';
    } else if (language === 'java') {
      // For Java, we would need to compile and run the code
      // This is just a placeholder for demonstration
      result = 'Java evaluation not implemented in this demo';
    }
    
    return JSON.stringify(result);
  } catch (error) {
    throw new Error(`Code execution failed: ${(error as Error).message}`);
  }
}

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

