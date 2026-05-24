import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Create a reusable connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err.message);
});

export default pool;
