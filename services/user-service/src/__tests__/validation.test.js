const request = require('supertest');
const app = require('../app');

// ========================
// Tests
// ========================
describe('Input Validation', () => {

  // Health check
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.service).toBe('user-service');
  });

  // Unknown route
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // SQL injection attempt
  it('should handle SQL injection safely', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: "' OR '1'='1",
        password: "' OR '1'='1"
      });

    // Should not return 200 (SQL injection failed)
    expect(res.status).not.toBe(200);
  });

  // Extra long username
  it('should reject username longer than 30 chars', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'a'.repeat(31),
        email: 'long@test.com',
        password: 'password123',
        full_name: 'Long Username'
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  //Empty strings
  it('should reject empty string fields', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: '',
        email: '',
        password: '',
        full_name: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  // Wrong content type
  it('should handle missing content-type gracefully', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .set('Content-Type', 'text/plain')
      .send('username=test&password=test');

    expect([400, 401]).toContain(res.status);
  });
});