const request = require('supertest');
const app = require('../../../src/app');
const { database } = require('@getplot/shared');

describe('Transactions API - Integration Tests', () => {
  let testUserId;
  let testPropertyId;
  let accessToken;

  beforeAll(async () => {
    await database.connect();
    
    // Create test user (mock auth)
    testUserId = 'test-user-id';
    testPropertyId = 'test-property-id';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await database.query(
        'DELETE FROM transactions.transactions WHERE user_id = $1',
        [testUserId]
      );
    }
    await database.disconnect();
  });

  describe('POST /api/v1/transactions/reserve', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/reserve')
        .send({
          propertyId: testPropertyId,
          location: 'yabi',
          depositAmount: 50000
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/reserve')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/transactions/user/:userId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/transactions/user/${testUserId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return user transactions', async () => {
      const response = await request(app)
        .get(`/api/v1/transactions/user/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/test-id')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

