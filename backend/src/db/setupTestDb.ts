import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

async function createTestDatabase() {
  // First connect to the default postgres database to create our test database
  const defaultConnection = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres'
  });

  try {
    // Drop the test database if it exists
    await defaultConnection.query('DROP DATABASE IF EXISTS test_interview_app');
    console.log('Dropped existing test database');

    // Create the test database
    await defaultConnection.query('CREATE DATABASE test_interview_app');
    console.log('Created test database');
  } catch (error) {
    console.error('Error creating test database:', error);
    throw error;
  } finally {
    await defaultConnection.end();
  }

  // Now connect to the test database and run migrations
  const testConnection = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/test_interview_app'
  });

  try {
    // Read and run the migration file
    const migrationPath = path.join(__dirname, '../db/migrations/001_create_interview_questions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await testConnection.query(migrationSQL);
    console.log('Test database migration completed');
  } catch (error) {
    console.error('Error running test migration:', error);
    throw error;
  } finally {
    await testConnection.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createTestDatabase()
    .then(() => {
      console.log('Test database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test database setup failed:', error);
      process.exit(1);
    });
}

export default createTestDatabase;