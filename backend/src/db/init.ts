import { runMigrations } from './migrate';
import { seedQuestions } from './seed';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Run migrations first
    await runMigrations();
    
    // Then seed the data
    await seedQuestions();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };