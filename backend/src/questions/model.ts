import { Pool } from 'pg';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export async function createQuestionsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(255) PRIMARY KEY,
      question TEXT NOT NULL,
      level VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL,
      industry VARCHAR(255),
      explanation TEXT NOT NULL,
      examples JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
    CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
    CREATE INDEX IF NOT EXISTS idx_questions_industry ON questions(industry);
  `);
  console.log('Questions table created successfully');
}

export async function getAllQuestions(pool: Pool): Promise<Question[]> {
  const result = await pool.query('SELECT * FROM questions ORDER BY created_at');
  return result.rows;
}

export async function getQuestionById(pool: Pool, id: string): Promise<Question | null> {
  const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createQuestion(pool: Pool, question: Omit<Question, 'id'>): Promise<Question> {
  const { question: text, level, type, industry, explanation, examples } = question;
  const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const result = await pool.query(
    'INSERT INTO questions (id, question, level, type, industry, explanation, examples) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [id, text, level, type, industry, explanation, examples]
  );
  return result.rows[0];
}

export async function updateQuestion(pool: Pool, id: string, updates: Partial<Question>): Promise<Question | null> {
  const updateFields = Object.keys(updates).filter(key => key !== 'id').map((key, i) => `${key} = $${i + 1}`).join(', ');
  const updateValues = Object.values(updates).filter(val => val !== undefined);
  
  if (updateFields === '') {
    return getQuestionById(pool, id);
  }
  
  const result = await pool.query(
    `UPDATE questions SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateValues.length + 1} RETURNING *`,
    [...updateValues, id]
  );
  return result.rows[0] || null;
}

export async function deleteQuestion(pool: Pool, id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}
