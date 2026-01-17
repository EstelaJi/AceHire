import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.postgresUrl,
});

export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('✗ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}
