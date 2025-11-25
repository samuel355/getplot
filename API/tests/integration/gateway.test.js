const request = require('supertest');
const gateway = require('../../gateway/src/app');

describe('Gateway - Integration Tests', () => {
  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('api-gateway');
    });

    it('should return liveness probe', async () => {
      const response = await request(gateway)
        .get('/health/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
    });

    it('should return readiness probe', async () => {
      const response = await request(gateway)
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.checks).toBeDefined();
    });
  });

  describe('API Documentation', () => {
    it('should return API documentation', async () => {
      const response = await request(gateway)
        .get('/api-docs')
        .expect(200);

      expect(response.body.message).toBe('API Documentation');
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple rapid requests
      const requests = Array(110).fill(null).map(() =>
        request(gateway).get('/api/v1/properties')
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited (429)
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    }, 30000); // Longer timeout for this test
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      // Helmet adds security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});

