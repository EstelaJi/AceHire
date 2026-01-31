import { Pool } from 'pg';
import { Question, CreateQuestionRequest, UpdateQuestionRequest, QuestionFilter } from '../models/Question';

export class QuestionService {
  constructor(private pool: Pool) {}

  async getAllQuestions(filter: QuestionFilter = {}): Promise<Question[]> {
    const { level, type, industry, limit = 50, offset = 0 } = filter;
    
    let query = 'SELECT * FROM interview_questions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (level) {
      query += ` AND level = $${paramIndex++}`;
      params.push(level);
    }
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (industry) {
      query += ` AND industry = $${paramIndex++}`;
      params.push(industry);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const { rows } = await this.pool.query(query, params);
    return rows.map(this.mapRowToQuestion);
  }

  async getQuestionById(id: number): Promise<Question | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM interview_questions WHERE id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToQuestion(rows[0]);
  }

  async createQuestion(questionData: CreateQuestionRequest): Promise<Question> {
    const { question, level, type, industry, explanation, examples } = questionData;
    
    const { rows } = await this.pool.query(
      `INSERT INTO interview_questions (question, level, type, industry, explanation, examples)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [question, level, type, industry || null, explanation, examples]
    );
    
    return this.mapRowToQuestion(rows[0]);
  }

  async updateQuestion(id: number, updateData: UpdateQuestionRequest): Promise<Question | null> {
    const { question, level, type, industry, explanation, examples } = updateData;
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (question !== undefined) {
      updateFields.push(`question = $${paramIndex++}`);
      params.push(question);
    }
    
    if (level !== undefined) {
      updateFields.push(`level = $${paramIndex++}`);
      params.push(level);
    }
    
    if (type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    
    if (industry !== undefined) {
      updateFields.push(`industry = $${paramIndex++}`);
      params.push(industry);
    }
    
    if (explanation !== undefined) {
      updateFields.push(`explanation = $${paramIndex++}`);
      params.push(explanation);
    }
    
    if (examples !== undefined) {
      updateFields.push(`examples = $${paramIndex++}`);
      params.push(examples);
    }
    
    if (updateFields.length === 0) {
      return this.getQuestionById(id);
    }
    
    // Add WHERE parameter
    params.push(id);
    
    const query = `
      UPDATE interview_questions 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, params);
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToQuestion(rows[0]);
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      'DELETE FROM interview_questions WHERE id = $1',
      [id]
    );
    
    return rowCount !== null && rowCount > 0;
  }

  async getRandomQuestions(count: number = 5, filter: QuestionFilter = {}): Promise<Question[]> {
    const { level, type, industry } = filter;
    
    let query = 'SELECT * FROM interview_questions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (level) {
      query += ` AND level = $${paramIndex++}`;
      params.push(level);
    }
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (industry) {
      query += ` AND industry = $${paramIndex++}`;
      params.push(industry);
    }
    
    query += ` ORDER BY RANDOM() LIMIT $${paramIndex++}`;
    params.push(count);
    
    const { rows } = await this.pool.query(query, params);
    return rows.map(this.mapRowToQuestion);
  }

  private mapRowToQuestion(row: any): Question {
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