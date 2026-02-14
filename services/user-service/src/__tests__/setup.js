// services/user-service/src/__tests__/setup.js
const path = require('path');

// Absolute path - works no matter where Jest runs from
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env.test')
});

// Jest globals (afterAll, beforeAll, etc.) are available via setupFilesAfterEnv
jest.setTimeout(30000);

// Clean up database pool after all tests
afterAll(async () => {
  const { pool } = require('../config/database');
  await pool.end();
});