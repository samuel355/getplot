const request = require('supertest');
const gateway = require('../../gateway/src/app');
const { database } = require('@getplot/shared');

describe('E2E: Complete User Journey', () => {
  let accessToken;
  let refreshToken;
  let userId;
  let propertyId;

  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    // Cleanup test data
    if (userId) {
      await database.query('DELETE FROM auth.users WHERE id = $1', [userId]);
    }
    await database.disconnect();
  });

  describe('User Registration and Authentication Flow', () => {
    it('should complete registration → login → profile flow', async () => {
      const testEmail = `e2e-${Date.now()}@test.com`;
      const testPassword = 'TestPass123!';

      // Step 1: Register
      const registerRes = await request(gateway)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'E2E',
          lastName: 'Test',
          phone: '+233241234567',
          country: 'Ghana'
        })
        .expect(201);

      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.data.user).toBeDefined();
      expect(registerRes.body.data.tokens).toBeDefined();

      accessToken = registerRes.body.data.tokens.accessToken;
      refreshToken = registerRes.body.data.tokens.refreshToken;
      userId = registerRes.body.data.user.id;

      // Step 2: Get profile
      const profileRes = await request(gateway)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.email).toBe(testEmail);

      // Step 3: Logout
      const logoutRes = await request(gateway)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutRes.body.success).toBe(true);

      // Step 4: Login again
      const loginRes = await request(gateway)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
      accessToken = loginRes.body.data.tokens.accessToken;
    });
  });

  describe('Property Browsing and Search Flow', () => {
    it('should browse properties → search → view details', async () => {
      // Step 1: Browse all properties
      const browseRes = await request(gateway)
        .get('/api/v1/properties?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(browseRes.body.success).toBe(true);
      expect(browseRes.body.data).toBeDefined();

      if (browseRes.body.data.properties && browseRes.body.data.properties.length > 0) {
        propertyId = browseRes.body.data.properties[0].id;

        // Step 2: View property details
        const detailsRes = await request(gateway)
          .get(`/api/v1/properties/${propertyId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(detailsRes.body.success).toBe(true);
        expect(detailsRes.body.data.id).toBe(propertyId);
      }

      // Step 3: Search properties
      const searchRes = await request(gateway)
        .post('/api/v1/properties/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          location: 'yabi',
          status: 'available',
          minPrice: 10000,
          maxPrice: 100000
        })
        .expect(200);

      expect(searchRes.body.success).toBe(true);
    });
  });

  describe('Property Management Flow', () => {
    it('should save property → view saved → unsave', async () => {
      if (!propertyId) {
        // Get a property first
        const propertiesRes = await request(gateway)
          .get('/api/v1/properties?limit=1')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        if (propertiesRes.body.data.properties && propertiesRes.body.data.properties.length > 0) {
          propertyId = propertiesRes.body.data.properties[0].id;
        }
      }

      if (propertyId) {
        // Step 1: Save property
        const saveRes = await request(gateway)
          .post(`/api/v1/users/saved-properties/${propertyId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201);

        expect(saveRes.body.success).toBe(true);

        // Step 2: View saved properties
        const savedRes = await request(gateway)
          .get('/api/v1/users/saved-properties')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(savedRes.body.success).toBe(true);

        // Step 3: Unsave property
        const unsaveRes = await request(gateway)
          .delete(`/api/v1/users/saved-properties/${propertyId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(unsaveRes.body.success).toBe(true);
      }
    });
  });

  describe('Profile Management Flow', () => {
    it('should update profile → update preferences', async () => {
      // Step 1: Update profile
      const updateRes = await request(gateway)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+233241234568'
        })
        .expect(200);

      expect(updateRes.body.success).toBe(true);

      // Step 2: Update preferences
      const prefsRes = await request(gateway)
        .put('/api/v1/users/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notificationsEmail: true,
          notificationsSms: false,
          language: 'en',
          currency: 'GHS'
        })
        .expect(200);

      expect(prefsRes.body.success).toBe(true);
    });
  });
});

