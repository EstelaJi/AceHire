import express from 'express';
import { questionRepository } from '../database/repositories/QuestionRepository';

export const questionsRouter = express.Router();

questionsRouter.get('/', async (req, res) => {
  try {
    const filters = {
      level: req.query.level as string,
      type: req.query.type as string,
      industry: req.query.industry as string,
      search: req.query.search as string,
    };

    const questions = await questionRepository.findAll(filters);

    const formattedQuestions = questions.map(q => ({
      id: q.id.toString(),
      question: q.question_text,
      level: q.level,
      type: q.type,
      industry: q.industry,
      explanation: q.explanation,
      examples: q.examples,
    }));

    res.json({
      success: true,
      data: formattedQuestions,
      count: formattedQuestions.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
    });
  }
});

questionsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID',
      });
    }

    const question = await questionRepository.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    const formattedQuestion = {
      id: question.id.toString(),
      question: question.question_text,
      level: question.level,
      type: question.type,
      industry: question.industry,
      explanation: question.explanation,
      examples: question.examples,
    };

    res.json({
      success: true,
      data: formattedQuestion,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question',
    });
  }
});
