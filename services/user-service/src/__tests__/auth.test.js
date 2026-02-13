const request = require('supertest');
const app = require('../app');
const { query } = require('../config/database');

// ========================
// Test Data
// ========================
const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  full_name: 'Test User'
};

// ========================
// Helpers
// ========================

// Clean up test users before/after tests
const cleanupTestUser = async (username) => {
  await query(
    `DELETE FROM users WHERE username = $1`,
    [username]
  );
};

// ========================
// Tests
// ========================

describe('POST /api/v1/users/register', () => {

  // Clean up before and after each test
  beforeEach(async () => {
    await cleanupTestUser(validUser.username);
  });

  afterEach(async () => {
    await cleanupTestUser(validUser.username);
  });

  // Happy path
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.token).toBeDefined();

    // Check returned user data
    expect(res.body.data.user.username).toBe(validUser.username);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.full_name).toBe(validUser.full_name);

    // Password should NEVER be in response
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  // Duplicate username
  it('should return 409 if username already exists', async () => {
    // Register first time
    await request(app)
      .post('/api/v1/users/register')
      .send(validUser);

    // Try to register again with same username
    const res = await request(app)
      .post('/api/v1/users/register')
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });

  // Missing fields
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser'
        // missing email, password, full_name
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Short username
  it('should return 400 if username is too short', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        ...validUser,
        username: 'ab' // less than 3 chars
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Short password
  it('should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        ...validUser,
        password: '123' // less than 8 chars
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Invalid email
  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        ...validUser,
        email: 'not-a-valid-email'
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  // Empty body
  it('should return 400 if body is empty', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

describe('POST /api/v1/users/login', () => {

  // Register a user before login tests
  beforeAll(async () => {
    await cleanupTestUser(validUser.username);
    await request(app)
      .post('/api/v1/users/register')
      .send(validUser);
  });

  // Cleanup after all login tests
  afterAll(async () => {
    await cleanupTestUser(validUser.username);
  });

  // Happy path - login with username
  it('should login successfully with username', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: validUser.username,
        password: validUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe(validUser.username);
  });

  // Login with email
  it('should login successfully with email', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: validUser.email,
        password: validUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  // Wrong password
  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: validUser.username,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // Wrong username
  it('should return 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'userDoesNotExist',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // Missing fields
  it('should return 400 if username or password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: validUser.username
        // missing password
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Token is valid JWT
  it('should return a valid JWT token', async () => {
    const jwt = require('jsonwebtoken');

    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: validUser.username,
        password: validUser.password
      });

    const token = res.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.user_id).toBeDefined();
    expect(decoded.username).toBe(validUser.username);
  });
});