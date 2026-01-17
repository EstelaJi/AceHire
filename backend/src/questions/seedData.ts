import { Pool } from 'pg';
import { questions } from '../../../frontend/src/home/questionsData';

export async function seedQuestions(pool: Pool) {
  try {
    console.log('Seeding questions database...');
    
    // Check if questions already exist
    const existing = await pool.query('SELECT COUNT(*) FROM questions');
    const count = parseInt(existing.rows[0].count);
    
    if (count > 0) {
      console.log(`Database already has ${count} questions. Skipping seed.`);
      return;
    }
    
    // Insert all questions
    const insertQuery = `
      INSERT INTO questions (id, question, level, type, industry, explanation, examples)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    for (const q of questions) {
      await pool.query(insertQuery, [
        q.id,
        q.question,
        q.level,
        q.type,
        q.industry,
        q.explanation,
        JSON.stringify(q.examples),
      ]);
    }
    
    console.log(`Successfully seeded ${questions.length} questions`);
  } catch (err) {
    console.error('Error seeding questions:', err);
  }
}
