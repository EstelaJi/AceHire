import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.postgresUrl });

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export async function getQuestions(filters?: {
  level?: 'easy' | 'medium' | 'hard';
  type?: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
}): Promise<Question[]> {
  let query = 'SELECT * FROM questions WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.level) {
    query += ` AND level = $${paramIndex}`;
    params.push(filters.level);
    paramIndex++;
  }

  if (filters?.type) {
    query += ` AND type = $${paramIndex}`;
    params.push(filters.type);
    paramIndex++;
  }

  if (filters?.industry) {
    query += ` AND industry = $${paramIndex}`;
    params.push(filters.industry);
    paramIndex++;
  }

  query += ' ORDER BY id';

  const result = await pool.query<Question>(query, params);
  return result.rows;
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const result = await pool.query<Question>('SELECT * FROM questions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getAllQuestions(): Promise<Question[]> {
  const result = await pool.query<Question>('SELECT * FROM questions ORDER BY id');
  return result.rows;
}
