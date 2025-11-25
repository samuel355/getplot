const request = require('supertest');
const app = require('../../../src/app');
const { database } = require('@getplot/shared');

describe('Properties API - Integration Tests', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe('GET /api/v1/properties', () => {
    it('should return properties list', async () => {
      const response = await request(app)
        .get('/api/v1/properties')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.properties) || response.body.data.properties).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/properties?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by location', async () => {
      const response = await request(app)
        .get('/api/v1/properties?location=yabi')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/properties?status=available')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/properties/:id', () => {
    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/v1/properties/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/properties/location/:location', () => {
    it('should return properties for valid location', async () => {
      const response = await request(app)
        .get('/api/v1/properties/location/yabi')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid location', async () => {
      const response = await request(app)
        .get('/api/v1/properties/location/invalid-location')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/properties/search', () => {
    it('should perform search with filters', async () => {
      const response = await request(app)
        .post('/api/v1/properties/search')
        .send({
          location: 'yabi',
          status: 'available',
          minPrice: 10000,
          maxPrice: 100000
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle empty search filters', async () => {
      const response = await request(app)
        .post('/api/v1/properties/search')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

