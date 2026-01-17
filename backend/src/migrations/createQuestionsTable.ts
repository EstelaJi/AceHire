import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.postgresUrl });

async function createQuestionsTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(50) PRIMARY KEY,
        question TEXT NOT NULL,
        level VARCHAR(10) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
        type VARCHAR(20) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
        industry VARCHAR(50),
        explanation TEXT NOT NULL,
        examples JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_industry ON questions(industry)
    `);

    await client.query('COMMIT');
    console.log('Questions table created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating questions table:', err);
    throw err;
  } finally {
    client.release();
  }
}

createQuestionsTable()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
