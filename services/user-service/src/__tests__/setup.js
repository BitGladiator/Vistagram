// Test environment setup
// Runs before all tests

require('dotenv').config({ path: '.env.test' });

// Increase timeout for database operations
jest.setTimeout(30000);

// Silence console.log during tests (optional)
// Comment these out if you want to see logs
global.console.log = jest.fn();
global.console.error = jest.fn();