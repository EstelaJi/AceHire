import request from 'supertest';
import express from 'express';
import { createMockQuestionRoutes } from './mockQuestionRoutes';

describe('Question API', () => {
  let app: express.Application;

  beforeAll(() => {
    // Setup Express app with mock routes
    app = express();
    app.use(express.json());
    app.use('/api/questions', createMockQuestionRoutes());
  });

  describe('POST /api/questions', () => {
    it('should create a new question successfully', async () => {
      const newQuestion = {
        question: 'What is your greatest strength?',
        level: 'easy',
        type: 'behavior',
        industry: 'general',
        explanation: 'This question assesses self-awareness and confidence.',
        examples: [
          'My greatest strength is my ability to adapt to new situations quickly.',
          'I believe my greatest strength is my problem-solving skills.'
        ]
      };

      const response = await request(app)
        .post('/api/questions')
        .send(newQuestion)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.question).toBe(newQuestion.question);
      expect(response.body.level).toBe(newQuestion.level);
      expect(response.body.type).toBe(newQuestion.type);
      expect(response.body.industry).toBe(newQuestion.industry);
      expect(response.body.explanation).toBe(newQuestion.explanation);
      expect(response.body.examples).toEqual(newQuestion.examples);
    });

    it('should return 400 when missing required fields', async () => {
      const incompleteQuestion = {
        question: 'What is your greatest weakness?',
        level: 'medium'
        // Missing required fields: type, explanation, examples
      };

      await request(app)
        .post('/api/questions')
        .send(incompleteQuestion)
        .expect(400);
    });

    it('should return 400 for invalid level', async () => {
      const invalidQuestion = {
        question: 'What is your greatest weakness?',
        level: 'invalid', // Invalid level
        type: 'behavior',
        explanation: 'This question assesses self-awareness.',
        examples: ['I sometimes focus too much on details.']
      };

      await request(app)
        .post('/api/questions')
        .send(invalidQuestion)
        .expect(400);
    });

    it('should return 400 for invalid type', async () => {
      const invalidQuestion = {
        question: 'What is your greatest weakness?',
        level: 'medium',
        type: 'invalid', // Invalid type
        explanation: 'This question assesses self-awareness.',
        examples: ['I sometimes focus too much on details.']
      };

      await request(app)
        .post('/api/questions')
        .send(invalidQuestion)
        .expect(400);
    });

    it('should return 400 for empty examples array', async () => {
      const invalidQuestion = {
        question: 'What is your greatest weakness?',
        level: 'medium',
        type: 'behavior',
        explanation: 'This question assesses self-awareness.',
        examples: [] // Empty examples array
      };

      await request(app)
        .post('/api/questions')
        .send(invalidQuestion)
        .expect(400);
    });
  });

  describe('GET /api/questions', () => {
    it('should return all questions', async () => {
      const response = await request(app)
        .get('/api/questions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check structure of returned questions
      response.body.forEach((question: any) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('level');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('explanation');
        expect(question).toHaveProperty('examples');
        expect(Array.isArray(question.examples)).toBe(true);
      });
    });

    it('should filter questions by level', async () => {
      const response = await request(app)
        .get('/api/questions?level=easy')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned questions should have level 'easy'
      response.body.forEach((question: any) => {
        expect(question.level).toBe('easy');
      });
    });

    it('should filter questions by type', async () => {
      const response = await request(app)
        .get('/api/questions?type=technical')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned questions should have type 'technical'
      response.body.forEach((question: any) => {
        expect(question.type).toBe('technical');
      });
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/questions?limit=2')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/questions/:id', () => {
    it('should return a question by ID', async () => {
      const response = await request(app)
        .get('/api/questions/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('question');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('explanation');
      expect(response.body).toHaveProperty('examples');
    });

    it('should return 404 for non-existent question', async () => {
      await request(app)
        .get('/api/questions/999')
        .expect(404);
    });

    it('should return 400 for invalid ID', async () => {
      await request(app)
        .get('/api/questions/invalid')
        .expect(400);
    });
  });

  describe('PUT /api/questions/:id', () => {
    it('should update a question successfully', async () => {
      const updatedQuestion = {
        question: 'Updated question text',
        level: 'hard',
        type: 'technical',
        industry: 'finance',
        explanation: 'Updated explanation',
        examples: ['Updated example 1', 'Updated example 2']
      };

      const response = await request(app)
        .put('/api/questions/1')
        .send(updatedQuestion)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.question).toBe(updatedQuestion.question);
      expect(response.body.level).toBe(updatedQuestion.level);
      expect(response.body.type).toBe(updatedQuestion.type);
      expect(response.body.industry).toBe(updatedQuestion.industry);
      expect(response.body.explanation).toBe(updatedQuestion.explanation);
      expect(response.body.examples).toEqual(updatedQuestion.examples);
    });

    it('should return 404 for non-existent question', async () => {
      const updatedQuestion = {
        question: 'Updated question text',
        level: 'hard',
        type: 'technical',
        explanation: 'Updated explanation',
        examples: ['Updated example 1']
      };

      await request(app)
        .put('/api/questions/999')
        .send(updatedQuestion)
        .expect(404);
    });

    it('should return 400 for invalid level', async () => {
      const updatedQuestion = {
        level: 'invalid' // Invalid level
      };

      await request(app)
        .put('/api/questions/1')
        .send(updatedQuestion)
        .expect(400);
    });
  });

  describe('DELETE /api/questions/:id', () => {
    it('should delete a question successfully', async () => {
      await request(app)
        .delete('/api/questions/1')
        .expect(204);

      // Verify the question is deleted
      await request(app)
        .get('/api/questions/1')
        .expect(404);
    });

    it('should return 404 for non-existent question', async () => {
      await request(app)
        .delete('/api/questions/999')
        .expect(404);
    });
  });

  describe('GET /api/questions/random', () => {
    it('should return random questions', async () => {
      const response = await request(app)
        .get('/api/questions/random')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      
      // Check structure of returned questions
      response.body.forEach((question: any) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('level');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('explanation');
        expect(question).toHaveProperty('examples');
      });
    });

    it('should return 400 for invalid count', async () => {
      const response = await request(app)
        .get('/api/questions/random?count=invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should filter random questions by level', async () => {
      const response = await request(app)
        .get('/api/questions/random?count=2&level=easy')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
      
      // All returned questions should have level 'easy'
      response.body.forEach((question: any) => {
        expect(question.level).toBe('easy');
      });
    });
  });
});