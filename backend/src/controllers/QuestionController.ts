import { Request, Response } from 'express';
import { QuestionService } from '../services/QuestionService';
import { CreateQuestionRequest, UpdateQuestionRequest, QuestionFilter } from '../models/Question';

export class QuestionController {
  constructor(private questionService: QuestionService) {}

  async getQuestions(req: Request, res: Response) {
    try {
      const filter: QuestionFilter = {
        level: req.query.level as any,
        type: req.query.type as any,
        industry: req.query.industry as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const questions = await this.questionService.getAllQuestions(filter);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  }

  async getQuestionById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const question = await this.questionService.getQuestionById(id);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  }

  async createQuestion(req: Request, res: Response) {
    try {
      const questionData: CreateQuestionRequest = req.body;
      
      // Validate required fields
      if (!questionData.question || !questionData.level || !questionData.type || !questionData.explanation || !questionData.examples) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate level
      if (!['easy', 'medium', 'hard'].includes(questionData.level)) {
        return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
      }

      // Validate type
      if (!['behavior', 'technical', 'product', 'system design'].includes(questionData.type)) {
        return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
      }

      // Validate examples is an array
      if (!Array.isArray(questionData.examples) || questionData.examples.length === 0) {
        return res.status(400).json({ error: 'Examples must be a non-empty array' });
      }

      const question = await this.questionService.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  }

  async updateQuestion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const updateData: UpdateQuestionRequest = req.body;

      // Validate level if provided
      if (updateData.level && !['easy', 'medium', 'hard'].includes(updateData.level)) {
        return res.status(400).json({ error: 'Invalid level. Must be easy, medium, or hard' });
      }

      // Validate type if provided
      if (updateData.type && !['behavior', 'technical', 'product', 'system design'].includes(updateData.type)) {
        return res.status(400).json({ error: 'Invalid type. Must be behavior, technical, product, or system design' });
      }

      // Validate examples if provided
      if (updateData.examples && (!Array.isArray(updateData.examples) || updateData.examples.length === 0)) {
        return res.status(400).json({ error: 'Examples must be a non-empty array' });
      }

      const question = await this.questionService.updateQuestion(id, updateData);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json(question);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }

  async deleteQuestion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const deleted = await this.questionService.deleteQuestion(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  }

  async getRandomQuestions(req: Request, res: Response) {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : 5;
      
      if (isNaN(count) || count <= 0 || count > 50) {
        return res.status(400).json({ error: 'Count must be a positive number not exceeding 50' });
      }

      const filter: QuestionFilter = {
        level: req.query.level as any,
        type: req.query.type as any,
        industry: req.query.industry as string
      };

      const questions = await this.questionService.getRandomQuestions(count, filter);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching random questions:', error);
      res.status(500).json({ error: 'Failed to fetch random questions' });
    }
  }
}