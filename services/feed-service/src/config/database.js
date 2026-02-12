const { Pool } = require('pg');
require('dotenv').config();

// Posts database pool
const postsPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.POSTS_DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Social database pool
const socialPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.SOCIAL_DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

postsPool.on('connect', () => {
  console.log('Connected to PostgreSQL (vistagram_posts)');
});

socialPool.on('connect', () => {
  console.log('Connected to PostgreSQL (vistagram_social)');
});

// Query helpers
const queryPosts = async (text, params) => {
  try {
    const res = await postsPool.query(text, params);
    return res;
  } catch (error) {
    console.error('Posts DB query error:', error);
    throw error;
  }
};

const querySocial = async (text, params) => {
  try {
    const res = await socialPool.query(text, params);
    return res;
  } catch (error) {
    console.error('Social DB query error:', error);
    throw error;
  }
};

module.exports = {
  queryPosts,
  querySocial
};