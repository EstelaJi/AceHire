import { Pool } from 'pg';
import { config } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: config.postgresUrl });

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/001_create_interview_questions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await pool.query(sql);
    console.log('✓ Migration completed successfully!');
  } catch (err) {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
