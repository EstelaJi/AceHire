import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config';

async function runMigrations() {
  const pool = new Pool({ connectionString: config.postgresUrl });
  
  try {
    console.log('Running database migrations...');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    const executedFilenames = executedMigrations.map(row => row.filename);
    
    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedFilenames.includes(file)) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(filePath, 'utf8');
        
        await pool.query('BEGIN');
        try {
          await pool.query(migrationSQL);
          await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          console.error(`Error running migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { runMigrations };