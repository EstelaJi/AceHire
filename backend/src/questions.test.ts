import { Pool } from 'pg';
import { v4 as uuid } from 'uuid';
import request from 'superagent';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Mock the database for testing
interface InterviewQuestion {
  id?: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

// Test database setup
const testPool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5431/interview_app'
});

// Test app setup
const testApp = express();
testApp.use(cors());
testApp.use(express.json());

// Test endpoints
let server: http.Server;

const initializeTestDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS interview_questions (
      id VARCHAR(255) PRIMARY KEY,
      question TEXT NOT NULL,
      level VARCHAR(50) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
      type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
      industry VARCHAR(255),
      explanation TEXT NOT NULL,
      examples JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await testPool.query(createTableQuery);
};

const clearTestDb = async () => {
  await testPool.query('DROP TABLE IF EXISTS interview_questions');
};

// GET /api/questions
const getQuestions = async (req: express.Request, res: express.Response) => {
  try {
    const result = await testPool.query(
      'SELECT * FROM interview_questions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch questions', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// POST /api/questions
const postQuestion = async (req: express.Request, res: express.Response) => {
  try {
    const { question, level, type, industry, explanation, examples } = req.body;
    
    if (!question || !level || !type || !explanation || !examples) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const validLevels: string[] = ['easy', 'medium', 'hard'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
    }
    
    const validTypes: string[] = ['behavior', 'technical', 'product', 'system design'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
    }
    
    const id = uuid();
    
    const result = await testPool.query(
      'INSERT INTO interview_questions (id, question, level, type, industry, explanation, examples) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, question, level, type, industry, explanation, JSON.stringify(examples)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create question', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Setup routes
testApp.get('/api/questions', getQuestions);
testApp.post('/api/questions', postQuestion);

// Test suite
const runTests = async () => {
  console.log('\n=== Running Question API Tests ===\n');
  
  let passed = 0;
  let failed = 0;

  const logTest = (name: string, status: 'PASS' | 'FAIL', error?: string) => {
    const color = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(`${color}[${status}]${reset} ${name}`);
    if (error) {
      console.log(`      Error: ${error}`);
    }
    if (status === 'PASS') passed++;
    else failed++;
  };

  // Test 1: POST /api/questions - Valid question
  try {
    const newQuestion = {
      question: 'Tell me about yourself?',
      level: 'easy',
      type: 'behavior',
      industry: 'software',
      explanation: 'Assesses communication skills',
      examples: ['I am a software engineer', 'I have 5 years of experience']
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(newQuestion)
      .set('Content-Type', 'application/json');

    if (response.status === 201 && response.body.id && response.body.question === newQuestion.question) {
      logTest('POST /api/questions - Valid question', 'PASS');
    } else {
      logTest('POST /api/questions - Valid question', 'FAIL', `Expected status 201, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - Valid question', 'FAIL', error.message);
  }

  // Test 2: POST /api/questions - Missing required fields
  try {
    const incompleteQuestion = {
      level: 'easy',
      type: 'behavior'
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(incompleteQuestion)
      .set('Content-Type', 'application/json')
      .ok(() => true);

    if (response.status === 400 && response.body.error === 'Missing required fields') {
      logTest('POST /api/questions - Missing required fields', 'PASS');
    } else {
      logTest('POST /api/questions - Missing required fields', 'FAIL', `Expected status 400, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - Missing required fields', 'FAIL', error.message);
  }

  // Test 3: POST /api/questions - Invalid level
  try {
    const invalidLevelQuestion = {
      question: 'Test question?',
      level: 'invalid',
      type: 'behavior',
      explanation: 'Test explanation',
      examples: ['Example 1']
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(invalidLevelQuestion)
      .set('Content-Type', 'application/json')
      .ok(() => true);

    if (response.status === 400 && response.body.error.includes('Invalid level')) {
      logTest('POST /api/questions - Invalid level', 'PASS');
    } else {
      logTest('POST /api/questions - Invalid level', 'FAIL', `Expected status 400, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - Invalid level', 'FAIL', error.message);
  }

  // Test 4: POST /api/questions - Invalid type
  try {
    const invalidTypeQuestion = {
      question: 'Test question?',
      level: 'easy',
      type: 'invalid',
      explanation: 'Test explanation',
      examples: ['Example 1']
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(invalidTypeQuestion)
      .set('Content-Type', 'application/json')
      .ok(() => true);

    if (response.status === 400 && response.body.error.includes('Invalid type')) {
      logTest('POST /api/questions - Invalid type', 'PASS');
    } else {
      logTest('POST /api/questions - Invalid type', 'FAIL', `Expected status 400, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - Invalid type', 'FAIL', error.message);
  }

  // Test 5: GET /api/questions - Fetch all questions
  try {
    const response = await request.get('http://localhost:3001/api/questions');

    if (response.status === 200 && Array.isArray(response.body)) {
      logTest('GET /api/questions - Fetch all questions', 'PASS');
      console.log(`      Retrieved ${response.body.length} questions`);
    } else {
      logTest('GET /api/questions - Fetch all questions', 'FAIL', `Expected status 200, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('GET /api/questions - Fetch all questions', 'FAIL', error.message);
  }

  // Test 6: POST /api/questions - With null industry
  try {
    const questionWithNullIndustry = {
      question: 'What is your greatest strength?',
      level: 'medium',
      type: 'behavior',
      industry: null,
      explanation: 'Assesses self-awareness',
      examples: ['My greatest strength is problem solving']
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(questionWithNullIndustry)
      .set('Content-Type', 'application/json');

    if (response.status === 201 && response.body.id) {
      logTest('POST /api/questions - With null industry', 'PASS');
    } else {
      logTest('POST /api/questions - With null industry', 'FAIL', `Expected status 201, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - With null industry', 'FAIL', error.message);
  }

  // Test 7: POST /api/questions - System design type
  try {
    const systemDesignQuestion = {
      question: 'How would you design a URL shortener?',
      level: 'hard',
      type: 'system design',
      industry: 'software',
      explanation: 'Tests system design skills',
      examples: ['I would use a hash function', 'I would use a base62 encoding']
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(systemDesignQuestion)
      .set('Content-Type', 'application/json');

    if (response.status === 201 && response.body.type === 'system design') {
      logTest('POST /api/questions - System design type', 'PASS');
    } else {
      logTest('POST /api/questions - System design type', 'FAIL', `Expected status 201, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - System design type', 'FAIL', error.message);
  }

  // Test 8: POST /api/questions - Multiple examples
  try {
    const multiExampleQuestion = {
      question: 'Describe a challenging project?',
      level: 'medium',
      type: 'behavior',
      industry: 'software',
      explanation: 'Assesses project experience',
      examples: [
        'I led a team of 5 developers',
        'We delivered the project 2 weeks early',
        'We used agile methodology'
      ]
    };

    const response = await request
      .post('http://localhost:3001/api/questions')
      .send(multiExampleQuestion)
      .set('Content-Type', 'application/json');

    if (response.status === 201 && 
        Array.isArray(response.body.examples) && 
        response.body.examples.length === 3) {
      logTest('POST /api/questions - Multiple examples', 'PASS');
    } else {
      logTest('POST /api/questions - Multiple examples', 'FAIL', `Expected status 201 and 3 examples, got ${response.status}`);
    }
  } catch (error: any) {
    logTest('POST /api/questions - Multiple examples', 'FAIL', error.message);
  }

  // Summary
  console.log('\n=== Test Summary ===\n');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log('\n=====================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed! ✅\n');
  }
};

// Main execution
const main = async () => {
  try {
    // Initialize test database
    await clearTestDb();
    await initializeTestDb();

    // Start test server
    server = testApp.listen(3001, async () => {
      console.log('Test server running on http://localhost:3001');
      
      try {
        await runTests();
      } finally {
        // Cleanup
        await clearTestDb();
        await testPool.end();
        server.close();
      }
    });
  } catch (error) {
    console.error('Error during test setup:', error);
    await testPool.end();
    process.exit(1);
  }
};

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
