const request = require('supertest');
const gateway = require('../../src/app');
const { redis } = require('@getplot/shared');

describe('Gateway - Integration Tests', () => {
  beforeAll(async () => {
    // Ensure Redis is connected for readiness checks
    if (!redis.isConnected) {
      await redis.connect();
    }
  });

  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('api-gateway');
      expect(response.body.version).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return liveness probe', async () => {
      const response = await request(gateway)
        .get('/health/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
    });

    it('should return readiness probe with Redis check', async () => {
      const response = await request(gateway)
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.redis).toBeDefined();
    });
  });

  describe('API Documentation', () => {
    it('should return API documentation', async () => {
      const response = await request(gateway)
        .get('/api-docs')
        .expect(200);

      expect(response.body.message).toBe('API Documentation');
      expect(response.body.version).toBe('v1');
      expect(response.body.baseUrl).toBe('/api/v1');
      expect(response.body.services).toBeDefined();
    });

    it('should list all service endpoints', async () => {
      const response = await request(gateway)
        .get('/api-docs')
        .expect(200);

      expect(response.body.services.auth).toBe('/api/v1/auth');
      expect(response.body.services.properties).toBe('/api/v1/properties');
      expect(response.body.services.transactions).toBe('/api/v1/transactions');
      expect(response.body.services.users).toBe('/api/v1/users');
      expect(response.body.services.notifications).toBe('/api/v1/notifications');
    });
  });

  describe('Request Routing', () => {
    it('should proxy requests to services', async () => {
      // This will fail if services aren't running, but tests the routing
      const response = await request(gateway)
        .get('/api/v1/properties')
        .expect((res) => {
          // Either 200 (service running) or 503 (service down)
          expect([200, 503]).toContain(res.status);
        });

      // If service is down, should return proper error
      if (response.status === 503) {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(gateway)
        .options('/api/v1/properties')
        .expect((res) => {
          // Should return 200 or 204 for OPTIONS
          expect([200, 204]).toContain(res.status);
        });
    });
  });

  describe('Security Headers', () => {
    it('should include security headers (Helmet)', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      // Helmet adds these headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(gateway)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should skip rate limiting for health endpoints', async () => {
      // Make multiple requests to health endpoint
      const requests = Array(10).fill(null).map(() =>
        request(gateway).get('/health')
      );

      const responses = await Promise.all(requests);
      
      // All should succeed (not rate limited)
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    }, 10000);
  });
});

