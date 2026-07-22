const { Pool } = require('pg');
require('dotenv').config();

// Single postgres pool using env vars (matches docker-compose single-instance setup)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// For queries that need to fan out (kept for API compatibility)
const scatterGatherQuery = async (text, params) => {
  return query(text, params);
};

module.exports = { query, scatterGatherQuery, pool };