const request = require('supertest');
const app = require('../app');
const { query } = require('../config/database');

// ========================
// Test Data
// ========================
const testUser = {
  username: 'profiletestuser',
  email: 'profiletest@example.com',
  password: 'password123',
  full_name: 'Profile Test User'
};

let userId = null;
let authToken = null;

// ========================
// Setup & Teardown
// ========================
beforeAll(async () => {
  // Clean up
  await query(
    `DELETE FROM users WHERE username = $1`,
    [testUser.username]
  );

  // Register and get token
  const res = await request(app)
    .post('/api/v1/users/register')
    .send(testUser);

  userId = res.body.data.user.user_id;
  authToken = res.body.data.token;
});

afterAll(async () => {
  await query(
    `DELETE FROM users WHERE username = $1`,
    [testUser.username]
  );
});

// ========================
// Tests
// ========================
describe('GET /api/v1/users/:user_id', () => {

  // Get existing user
  it('should return user profile by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.user_id).toBe(userId);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.user.full_name).toBe(testUser.full_name);
  });

  // Password never exposed
  it('should never expose password in response', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`);

    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  // Non-existent user
  it('should return 404 for non-existent user', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app)
      .get(`/api/v1/users/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  // Invalid UUID format
  it('should return 400 or 500 for invalid UUID', async () => {
    const res = await request(app)
      .get('/api/v1/users/not-a-valid-uuid');

    expect([400, 500]).toContain(res.status);
  });
});