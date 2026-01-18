import { Pool } from 'pg';
import { config } from '../src/config';
import { questions } from '../../frontend/src/home/questionsData';

const pool = new Pool({ connectionString: config.postgresUrl });

async function migrateQuestions() {
  try {
    console.log('Starting question migration...');

    for (const q of questions) {
      await pool.query(
        `INSERT INTO interview_questions (id, question, level, type, industry, explanation, examples)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           question = EXCLUDED.question,
           level = EXCLUDED.level,
           type = EXCLUDED.type,
           industry = EXCLUDED.industry,
           explanation = EXCLUDED.explanation,
           examples = EXCLUDED.examples,
           updated_at = CURRENT_TIMESTAMP`,
        [q.id, q.question, q.level, q.type, q.industry || null, q.explanation, JSON.stringify(q.examples)]
      );
      console.log(`Migrated question: ${q.id}`);
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateQuestions();
