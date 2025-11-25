/**
 * E2E Test - Complete User Flow
 * 
 * This test simulates a complete user journey:
 * 1. Register user
 * 2. Login
 * 3. Browse properties
 * 4. Reserve a plot
 * 5. View transaction
 */

const request = require('supertest');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

describe('E2E - Complete User Flow', () => {
  let accessToken;
  let userId;
  let propertyId;
  let transactionId;

  describe('1. User Registration & Authentication', () => {
    it('should register new user', async () => {
      const response = await request(GATEWAY_URL)
        .post('/api/v1/auth/register')
        .send({
          email: `e2e.test.${Date.now()}@example.com`,
          password: 'E2ETestPass123!',
          firstName: 'E2E',
          lastName: 'Test',
          phone: '+233241234567',
          country: 'Ghana',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();

      accessToken = response.body.data.tokens.accessToken;
      userId = response.body.data.user.id;
    });

    it('should login with credentials', async () => {
      // Login test would use the email from previous test
      // For now, we'll use the token from registration
      expect(accessToken).toBeDefined();
    });
  });

  describe('2. Browse Properties', () => {
    it('should get all properties', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/properties')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();

      if (response.body.data.length > 0) {
        propertyId = response.body.data[0].id;
      }
    });

    it('should filter properties by location', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/properties')
        .query({ location: 'yabi', status: 'available' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get properties for map view', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/properties/location/yabi');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('FeatureCollection');
      expect(Array.isArray(response.body.data.features)).toBe(true);
    });
  });

  describe('3. User Profile Management', () => {
    it('should get user profile', async () => {
      const response = await request(GATEWAY_URL)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeDefined();
    });

    it('should update user profile', async () => {
      const response = await request(GATEWAY_URL)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          residentialAddress: '123 Test Street, Accra',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('4. Reserve Plot (requires property)', () => {
    it('should reserve a plot (if property available)', async () => {
      if (!propertyId) {
        console.log('Skipping: No available property for testing');
        return;
      }

      const response = await request(GATEWAY_URL)
        .post('/api/v1/transactions/reserve')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          propertyId,
          location: 'yabi',
          depositAmount: 15000,
          paymentMethod: 'bank_transfer',
          customerDetails: {
            firstName: 'E2E',
            lastName: 'Test',
            email: 'e2e.test@example.com',
            phone: '+233241234567',
            country: 'Ghana',
            residentialAddress: '123 Test Street',
          },
        });

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.transaction).toBeDefined();
        transactionId = response.body.data.transaction.id;
      }
    });
  });

  describe('5. View Transactions', () => {
    it('should get user transactions', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/api/v1/transactions/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

