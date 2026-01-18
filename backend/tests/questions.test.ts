import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { QuestionService } from '../src/services/questionService';

const app = express();
app.use(express.json());

let mockPool: any;
let questionService: QuestionService;

beforeAll(() => {
  mockPool = {
    query: jest.fn()
  };
  questionService = new QuestionService(mockPool);

  app.get('/api/questions', async (req, res) => {
    try {
      const { level, type } = req.query;
      let questions;
      
      if (level) {
        questions = await questionService.getQuestionsByLevel(level as string);
      } else if (type) {
        questions = await questionService.getQuestionsByType(type as string);
      } else {
        questions = await questionService.getAllQuestions();
      }
      
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch questions', detail: (err as Error).message });
    }
  });

  app.post('/api/questions', async (req, res) => {
    try {
      const { question, level, type, industry, explanation, examples } = req.body;
      
      if (!question || !level || !type || !explanation || !examples) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const validLevels = ['easy', 'medium', 'hard'];
      const validTypes = ['behavior', 'technical', 'product', 'system design'];
      
      if (!validLevels.includes(level)) {
        return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
      }
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
      }
      
      if (!Array.isArray(examples)) {
        return res.status(400).json({ error: 'Examples must be an array' });
      }
      
      const newQuestion = await questionService.createQuestion({
        question,
        level,
        type,
        industry,
        explanation,
        examples
      });
      
      res.status(201).json(newQuestion);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create question', detail: (err as Error).message });
    }
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/questions', () => {
  it('should create a new question with valid data', async () => {
    const newQuestion = {
      id: '1234567890',
      question: 'Test question',
      level: 'easy',
      type: 'behavior',
      industry: 'software',
      explanation: 'Test explanation',
      examples: ['Example 1', 'Example 2'],
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPool.query.mockResolvedValue({ rows: [newQuestion] });

    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        industry: 'software',
        explanation: 'Test explanation',
        examples: ['Example 1', 'Example 2']
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: '1234567890',
      question: 'Test question',
      level: 'easy',
      type: 'behavior',
      industry: 'software',
      explanation: 'Test explanation',
      examples: ['Example 1', 'Example 2']
    });
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO interview_questions'),
      expect.any(Array)
    );
  });

  it('should return 400 when question is missing', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        level: 'easy',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 when level is missing', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 when type is missing', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 when explanation is missing', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 when examples is missing', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        explanation: 'Test explanation'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required fields' });
  });

  it('should return 400 when level is invalid', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'invalid',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid level. Must be easy, medium, or hard' });
  });

  it('should return 400 when type is invalid', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'invalid',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
  });

  it('should return 400 when examples is not an array', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: 'not an array'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Examples must be an array' });
  });

  it('should create question without optional industry field', async () => {
    const newQuestion = {
      id: '1234567890',
      question: 'Test question',
      level: 'easy',
      type: 'behavior',
      industry: null,
      explanation: 'Test explanation',
      examples: ['Example 1'],
      created_at: new Date(),
      updated_at: new Date()
    };

    mockPool.query.mockResolvedValue({ rows: [newQuestion] });

    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: '1234567890',
      question: 'Test question',
      level: 'easy',
      type: 'behavior',
      industry: null,
      explanation: 'Test explanation',
      examples: ['Example 1']
    });
  });

  it('should return 500 when database error occurs', async () => {
    mockPool.query.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'Test question',
        level: 'easy',
        type: 'behavior',
        explanation: 'Test explanation',
        examples: ['Example 1']
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to create question',
      detail: 'Database connection failed'
    });
  });
});

describe('GET /api/questions', () => {
  it('should return all questions when no query params', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'Question 1',
        level: 'easy',
        type: 'behavior',
        industry: 'software',
        explanation: 'Explanation 1',
        examples: ['Example 1'],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        question: 'Question 2',
        level: 'medium',
        type: 'technical',
        industry: 'software',
        explanation: 'Explanation 2',
        examples: ['Example 2'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockPool.query.mockResolvedValue({ rows: mockQuestions });

    const response = await request(app).get('/api/questions');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      id: '1',
      question: 'Question 1',
      level: 'easy',
      type: 'behavior'
    });
  });

  it('should return questions filtered by level', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'Easy Question',
        level: 'easy',
        type: 'behavior',
        industry: 'software',
        explanation: 'Explanation',
        examples: ['Example'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockPool.query.mockResolvedValue({ rows: mockQuestions });

    const response = await request(app).get('/api/questions?level=easy');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].level).toBe('easy');
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE level = $1'),
      ['easy']
    );
  });

  it('should return questions filtered by type', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'Technical Question',
        level: 'medium',
        type: 'technical',
        industry: 'software',
        explanation: 'Explanation',
        examples: ['Example'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockPool.query.mockResolvedValue({ rows: mockQuestions });

    const response = await request(app).get('/api/questions?type=technical');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toBe('technical');
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE type = $1'),
      ['technical']
    );
  });

  it('should return 500 when database error occurs', async () => {
    mockPool.query.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/api/questions');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to fetch questions',
      detail: 'Database connection failed'
    });
  });
});
