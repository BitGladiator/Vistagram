require('dotenv').config({ path: '.env.test' });

jest.setTimeout(30000);

// Silence logs during tests
global.console.log = jest.fn();
global.console.error = jest.fn();

// Close database pool after all tests
afterAll(async () => {
  const { pool } = require('../config/database');
  await pool.end();
});