import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { QuestionService } from '../db/questionService';

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const mockPool = new Pool() as jest.Mocked<Pool>;

const mockDateString = '2026-01-31T12:39:18.700Z';
const mockQuestions = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    question: 'Test question?',
    level: 'easy',
    type: 'behavior',
    industry: 'software',
    explanation: 'Test explanation.',
    examples: ['Example 1', 'Example 2'],
    created_at: mockDateString,
    updated_at: mockDateString,
  },
];

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  const questionService = new QuestionService(mockPool);

  app.get('/api/questions', async (req, res) => {
    try {
      const { level, type } = req.query;
      const questions = await questionService.getAllQuestions(
        level as string | undefined,
        type as string | undefined
      );
      res.json(questions);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      res.status(500).json({ error: 'Failed to fetch questions', detail: (err as Error).message });
    }
  });

  app.get('/api/questions/:id', async (req, res) => {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (err) {
      console.error('Failed to fetch question:', err);
      res.status(500).json({ error: 'Failed to fetch question', detail: (err as Error).message });
    }
  });

  app.post('/api/questions', async (req, res) => {
    try {
      const { question, level, type, explanation, examples, industry } = req.body;
      
      if (!question || !level || !type || !explanation || !examples) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const validLevels = ['easy', 'medium', 'hard'];
      const validTypes = ['behavior', 'technical', 'product', 'system design'];
      
      if (!validLevels.includes(level)) {
        return res.status(400).json({ error: 'Invalid level value' });
      }
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type value' });
      }

      const newQuestion = await questionService.createQuestion({
        question,
        level,
        type,
        explanation,
        examples,
        industry,
      });
      
      res.status(201).json(newQuestion);
    } catch (err) {
      console.error('Failed to create question:', err);
      res.status(500).json({ error: 'Failed to create question', detail: (err as Error).message });
    }
  });

  app.put('/api/questions/:id', async (req, res) => {
    try {
      const { question, level, type, explanation, examples, industry } = req.body;
      
      const updatedQuestion = await questionService.updateQuestion(req.params.id, {
        question,
        level,
        type,
        explanation,
        examples,
        industry,
      });
      
      if (!updatedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json(updatedQuestion);
    } catch (err) {
      console.error('Failed to update question:', err);
      res.status(500).json({ error: 'Failed to update question', detail: (err as Error).message });
    }
  });

  app.delete('/api/questions/:id', async (req, res) => {
    try {
      const deleted = await questionService.deleteQuestion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.status(204).send();
    } catch (err) {
      console.error('Failed to delete question:', err);
      res.status(500).json({ error: 'Failed to delete question', detail: (err as Error).message });
    }
  });

  return app;
};

describe('Question API Endpoints', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  describe('GET /api/questions', () => {
    it('should return all questions', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockQuestions });

      const response = await request(app).get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        []
      );
    });

    it('should filter questions by level', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockQuestions });

      const response = await request(app).get('/api/questions?level=easy');

      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('level = $1'),
        ['easy']
      );
    });

    it('should filter questions by type', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockQuestions });

      const response = await request(app).get('/api/questions?type=behavior');

      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('type = $1'),
        ['behavior']
      );
    });

    it('should filter questions by level and type', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockQuestions });

      const response = await request(app).get('/api/questions?level=easy&type=behavior');

      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('level = $1'),
        ['easy', 'behavior']
      );
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/questions');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch questions');
    });
  });

  describe('GET /api/questions/:id', () => {
    it('should return a question by id', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockQuestions[0]] });

      const response = await request(app).get('/api/questions/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions[0]);
    });

    it('should return 404 when question not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/questions/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Question not found');
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/questions/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch question');
    });
  });

  describe('POST /api/questions', () => {
    const validQuestionData = {
      question: 'New test question?',
      level: 'medium',
      type: 'technical',
      explanation: 'New explanation.',
      examples: ['New example'],
      industry: 'software',
    };

    it('should create a new question', async () => {
      const createdQuestion = { ...validQuestionData, id: 'new-uuid', created_at: new Date(), updated_at: new Date() };
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [createdQuestion] });

      const response = await request(app)
        .post('/api/questions')
        .send(validQuestionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.question).toBe(validQuestionData.question);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = { question: 'Test?' };

      const response = await request(app)
        .post('/api/questions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 for invalid level value', async () => {
      const invalidData = { ...validQuestionData, level: 'invalid' };

      const response = await request(app)
        .post('/api/questions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid level value');
    });

    it('should return 400 for invalid type value', async () => {
      const invalidData = { ...validQuestionData, type: 'invalid' };

      const response = await request(app)
        .post('/api/questions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid type value');
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/questions')
        .send(validQuestionData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create question');
    });
  });

  describe('PUT /api/questions/:id', () => {
    const updateData = {
      question: 'Updated question?',
      level: 'hard',
      type: 'system design',
      explanation: 'Updated explanation.',
      examples: ['Updated example'],
      industry: 'product',
    };

    it('should update an existing question', async () => {
      const updatedQuestion = { ...updateData, id: '123e4567-e89b-12d3-a456-426614174000', created_at: new Date(), updated_at: new Date() };
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedQuestion] });

      const response = await request(app)
        .put('/api/questions/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.question).toBe(updateData.question);
    });

    it('should return 404 when updating non-existent question', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/questions/non-existent-id')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Question not found');
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/questions/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update question');
    });
  });

  describe('DELETE /api/questions/:id', () => {
    it('should delete an existing question', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app).delete('/api/questions/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(204);
    });

    it('should return 404 when deleting non-existent question', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/api/questions/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Question not found');
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).delete('/api/questions/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete question');
    });
  });
});
