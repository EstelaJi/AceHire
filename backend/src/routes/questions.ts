import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { QuestionService } from '../services/QuestionService';
import { Pool } from 'pg';
import { config } from '../config';

const router = Router();
const pool = new Pool({ connectionString: config.postgresUrl });
const questionService = new QuestionService(pool);
const questionController = new QuestionController(questionService);

// GET /api/questions - Get all questions with optional filtering
router.get('/', questionController.getQuestions.bind(questionController));

// GET /api/questions/random - Get random questions
router.get('/random', questionController.getRandomQuestions.bind(questionController));

// GET /api/questions/:id - Get a specific question by ID
router.get('/:id', questionController.getQuestionById.bind(questionController));

// POST /api/questions - Create a new question
router.post('/', questionController.createQuestion.bind(questionController));

// PUT /api/questions/:id - Update a question
router.put('/:id', questionController.updateQuestion.bind(questionController));

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', questionController.deleteQuestion.bind(questionController));

export default router;