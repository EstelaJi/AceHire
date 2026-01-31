import express from 'express';
import { mockQuestionService } from './mockQuestionService';

export function createMockQuestionRoutes(): express.Router {
  const router = express.Router();

  // GET /api/questions - Get all questions with optional filtering
  router.get('/', async (req, res) => {
    try {
      const { level, type, limit } = req.query;
      
      const questions = await mockQuestionService.getAllQuestions(
        level as string,
        type as string,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/questions/random - Get random questions
  router.get('/random', async (req, res) => {
    try {
      const { count, level } = req.query;
      
      const questionCount = count ? parseInt(count as string) : 1;
      
      if (isNaN(questionCount) || questionCount <= 0) {
        return res.status(400).json({ error: 'Invalid count parameter' });
      }
      
      const questions = await mockQuestionService.getRandomQuestions(
        questionCount,
        level as string
      );
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching random questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/questions/:id - Get a specific question by ID
  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }
      
      const question = await mockQuestionService.getQuestionById(id);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  // POST /api/questions - Create a new question
  router.post('/', async (req, res) => {
    try {
      const { question, level, type, industry, explanation, examples } = req.body;
      
      // Validate required fields
      if (!question || !level || !type || !explanation || !examples) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Validate level
      if (!['easy', 'medium', 'hard'].includes(level)) {
        return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
      }
      
      // Validate type
      if (!['behavior', 'technical', 'product', 'system design'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
      }
      
      // Validate examples
      if (!Array.isArray(examples) || examples.length === 0) {
        return res.status(400).json({ error: 'Examples must be a non-empty array' });
      }
      
      const newQuestion = await mockQuestionService.createQuestion({
        question,
        level,
        type,
        industry,
        explanation,
        examples
      });
      
      res.status(201).json(newQuestion);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/questions/:id - Update a question
  router.put('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }
      
      const { question, level, type, industry, explanation, examples } = req.body;
      
      // Validate level if provided
      if (level && !['easy', 'medium', 'hard'].includes(level)) {
        return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
      }
      
      // Validate type if provided
      if (type && !['behavior', 'technical', 'product', 'system design'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
      }
      
      // Validate examples if provided
      if (examples && (!Array.isArray(examples) || examples.length === 0)) {
        return res.status(400).json({ error: 'Examples must be a non-empty array' });
      }
      
      const updatedQuestion = await mockQuestionService.updateQuestion(id, {
        question,
        level,
        type,
        industry,
        explanation,
        examples
      });
      
      if (!updatedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/questions/:id - Delete a question
  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }
      
      const deleted = await mockQuestionService.deleteQuestion(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}