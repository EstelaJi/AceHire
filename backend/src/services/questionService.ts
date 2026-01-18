import { Pool } from 'pg';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string | null;
  explanation: string;
  examples: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateQuestionInput {
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export class QuestionService {
  constructor(private pool: Pool) {}

  async getAllQuestions(): Promise<Question[]> {
    const result = await this.pool.query(
      'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM interview_questions ORDER BY id'
    );
    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      level: row.level,
      type: row.type,
      industry: row.industry,
      explanation: row.explanation,
      examples: row.examples,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const result = await this.pool.query(
      'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM interview_questions WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      id: row.id,
      question: row.question,
      level: row.level,
      type: row.type,
      industry: row.industry,
      explanation: row.explanation,
      examples: row.examples,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async getQuestionsByLevel(level: string): Promise<Question[]> {
    const result = await this.pool.query(
      'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM interview_questions WHERE level = $1 ORDER BY id',
      [level]
    );
    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      level: row.level,
      type: row.type,
      industry: row.industry,
      explanation: row.explanation,
      examples: row.examples,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async getQuestionsByType(type: string): Promise<Question[]> {
    const result = await this.pool.query(
      'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM interview_questions WHERE type = $1 ORDER BY id',
      [type]
    );
    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      level: row.level,
      type: row.type,
      industry: row.industry,
      explanation: row.explanation,
      examples: row.examples,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const id = Date.now().toString();
    const result = await this.pool.query(
      `INSERT INTO interview_questions (id, question, level, type, industry, explanation, examples)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, question, level, type, industry, explanation, examples, created_at, updated_at`,
      [id, input.question, input.level, input.type, input.industry || null, input.explanation, JSON.stringify(input.examples)]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      question: row.question,
      level: row.level,
      type: row.type,
      industry: row.industry,
      explanation: row.explanation,
      examples: row.examples,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
