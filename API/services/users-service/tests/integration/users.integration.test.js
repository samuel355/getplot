const request = require('supertest');
const app = require('../../../src/app');
const { database } = require('@getplot/shared');

describe('Users API - Integration Tests', () => {
  let testUserId;
  let accessToken;

  beforeAll(async () => {
    await database.connect();
    // Note: In real tests, you'd create a test user via auth service
    testUserId = 'test-user-id';
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe('GET /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return user profile with valid token', async () => {
      // Note: In real tests, get token from auth service
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should update profile with valid data', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+233241234567'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/users/preferences', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/preferences')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/preferences', () => {
    it('should update user preferences', async () => {
      const response = await request(app)
        .put('/api/v1/users/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notificationsEmail: true,
          notificationsSms: false,
          language: 'en',
          currency: 'GHS'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/users/saved-properties', () => {
    it('should return saved properties', async () => {
      const response = await request(app)
        .get('/api/v1/users/saved-properties')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/users/saved-properties/:propertyId', () => {
    it('should save property', async () => {
      const response = await request(app)
        .post('/api/v1/users/saved-properties/test-property-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/saved-properties/:propertyId', () => {
    it('should unsave property', async () => {
      const response = await request(app)
        .delete('/api/v1/users/saved-properties/test-property-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

