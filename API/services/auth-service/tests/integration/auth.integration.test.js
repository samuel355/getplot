const request = require('supertest');
const app = require('../../src/app');
const { database } = require('@getplot/shared');

describe('Auth API - Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await database.connect();

    // Clean up test data
    await database.query("DELETE FROM app_auth.users WHERE email LIKE '%test@example.com%'");
  });

  afterAll(async () => {
    // Clean up
    if (testUser) {
      await database.query('DELETE FROM app_auth.users WHERE id = $1', [testUser.id]);
    }
    await database.disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
          phone: '+233241234567',
          country: 'Ghana',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('integration.test@example.com');
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      testUser = response.body.data.user;
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
          phone: '+233241234567',
          country: 'Ghana',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'another.test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration.test@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration.test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

