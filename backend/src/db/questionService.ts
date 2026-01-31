import { Pool } from 'pg';
import { Question, CreateQuestionRequest } from './types';

export class QuestionService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getAllQuestions(level?: string, type?: string): Promise<Question[]> {
    let query = 'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM questions';
    const params: any[] = [];
    const conditions: string[] = [];

    if (level && level !== 'all') {
      params.push(level);
      conditions.push(`level = $${params.length}`);
    }

    if (type && type !== 'all') {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map((row: any) => ({
      ...row,
      examples: Array.isArray(row.examples) ? row.examples : []
    }));
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const query = 'SELECT id, question, level, type, industry, explanation, examples, created_at, updated_at FROM questions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      examples: Array.isArray(row.examples) ? row.examples : []
    };
  }

  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    const query = `
      INSERT INTO questions (question, level, type, industry, explanation, examples)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, question, level, type, industry, explanation, examples, created_at, updated_at
    `;
    
    const result = await this.pool.query(query, [
      data.question,
      data.level,
      data.type,
      data.industry || null,
      data.explanation,
      JSON.stringify(data.examples)
    ]);

    const row = result.rows[0];
    return {
      ...row,
      examples: Array.isArray(row.examples) ? row.examples : []
    };
  }

  async updateQuestion(id: string, data: Partial<CreateQuestionRequest>): Promise<Question | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.question !== undefined) {
      params.push(data.question);
      fields.push(`question = $${params.length}`);
    }

    if (data.level !== undefined) {
      params.push(data.level);
      fields.push(`level = $${params.length}`);
    }

    if (data.type !== undefined) {
      params.push(data.type);
      fields.push(`type = $${params.length}`);
    }

    if (data.industry !== undefined) {
      params.push(data.industry || null);
      fields.push(`industry = $${params.length}`);
    }

    if (data.explanation !== undefined) {
      params.push(data.explanation);
      fields.push(`explanation = $${params.length}`);
    }

    if (data.examples !== undefined) {
      params.push(JSON.stringify(data.examples));
      fields.push(`examples = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.getQuestionById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE questions
      SET ${fields.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, question, level, type, industry, explanation, examples, created_at, updated_at
    `;

    const result = await this.pool.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      examples: Array.isArray(row.examples) ? row.examples : []
    };
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const query = 'DELETE FROM questions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
