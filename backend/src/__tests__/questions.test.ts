import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/interview_db',
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        level VARCHAR(20) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
        type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
        industry VARCHAR(100),
        explanation TEXT NOT NULL,
        examples TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

app.get('/api/questions', async (req, res) => {
  try {
    const { level, type, industry } = req.query;
    let query = 'SELECT * FROM questions';
    const params: any[] = [];
    const conditions: string[] = [];

    if (level) {
      conditions.push(`level = $${params.length + 1}`);
      params.push(level);
    }
    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    if (industry) {
      conditions.push(`industry = $${params.length + 1}`);
      params.push(industry);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { question, level, type, industry, explanation, examples } = req.body;

    if (!question || !level || !type || !explanation || !examples) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['easy', 'medium', 'hard'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    if (!['behavior', 'technical', 'product', 'system design'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const result = await pool.query(
      `INSERT INTO questions (question, level, type, industry, explanation, examples)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [question, level, type, industry, explanation, examples]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create question:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/questions', () => {
  it('should create a new question successfully', async () => {
    const newQuestion = {
      question: 'Test question: What is your greatest strength?',
      level: 'easy',
      type: 'behavior',
      industry: 'general',
      explanation: 'This is a test explanation.',
      examples: ['Example 1', 'Example 2'],
    };

    const response = await request(app)
      .post('/api/questions')
      .send(newQuestion)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(201);
    expect(response.body.question).toBe(newQuestion.question);
    expect(response.body.level).toBe(newQuestion.level);
    expect(response.body.type).toBe(newQuestion.type);
    expect(response.body.industry).toBe(newQuestion.industry);
    expect(response.body.explanation).toBe(newQuestion.explanation);
    expect(response.body.examples).toEqual(newQuestion.examples);
    expect(response.body.id).toBeDefined();
  });

  it('should return 400 when required fields are missing', async () => {
    const incompleteQuestion = {
      question: 'Test question without required fields',
    };

    const response = await request(app)
      .post('/api/questions')
      .send(incompleteQuestion)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');
  });

  it('should return 400 when level is invalid', async () => {
    const invalidQuestion = {
      question: 'Test question with invalid level',
      level: 'invalid_level',
      type: 'behavior',
      industry: 'general',
      explanation: 'Test explanation',
      examples: ['Example 1'],
    };

    const response = await request(app)
      .post('/api/questions')
      .send(invalidQuestion)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid level');
  });

  it('should return 400 when type is invalid', async () => {
    const invalidQuestion = {
      question: 'Test question with invalid type',
      level: 'easy',
      type: 'invalid_type',
      industry: 'general',
      explanation: 'Test explanation',
      examples: ['Example 1'],
    };

    const response = await request(app)
      .post('/api/questions')
      .send(invalidQuestion)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid type');
  });
});

describe('GET /api/questions', () => {
  it('should return all questions', async () => {
    const response = await request(app)
      .get('/api/questions')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter questions by level', async () => {
    const response = await request(app)
      .get('/api/questions?level=easy')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    response.body.forEach((q: any) => {
      expect(q.level).toBe('easy');
    });
  });

  it('should filter questions by type', async () => {
    const response = await request(app)
      .get('/api/questions?type=behavior')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    response.body.forEach((q: any) => {
      expect(q.type).toBe('behavior');
    });
  });

  it('should filter questions by industry', async () => {
    const response = await request(app)
      .get('/api/questions?industry=general')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    response.body.forEach((q: any) => {
      expect(q.industry).toBe('general');
    });
  });

  it('should filter questions by multiple criteria', async () => {
    const response = await request(app)
      .get('/api/questions?level=easy&type=behavior')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    response.body.forEach((q: any) => {
      expect(q.level).toBe('easy');
      expect(q.type).toBe('behavior');
    });
  });
});
