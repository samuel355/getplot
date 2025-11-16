const { apiLimiter, authLimiter, registerLimiter } = require('../../src/middleware/rateLimiter');
const config = require('../../src/config');

describe('Gateway Rate Limiter - Unit Tests', () => {
  describe('apiLimiter', () => {
    it('should be configured with correct settings', () => {
      expect(apiLimiter).toBeDefined();
      expect(apiLimiter.windowMs).toBe(config.rateLimit.windowMs);
      expect(apiLimiter.max).toBe(config.rateLimit.max);
    });

    it('should have skip function for health checks', () => {
      const mockReq = { path: '/health' };
      expect(apiLimiter.skip(mockReq)).toBe(true);
    });

    it('should not skip API routes', () => {
      const mockReq = { path: '/api/v1/properties' };
      expect(apiLimiter.skip(mockReq)).toBe(false);
    });
  });

  describe('authLimiter', () => {
    it('should be configured with strict settings', () => {
      expect(authLimiter).toBeDefined();
      expect(authLimiter.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(authLimiter.max).toBe(5); // 5 attempts
    });

    it('should skip successful requests', () => {
      expect(authLimiter.skipSuccessfulRequests).toBe(true);
    });
  });

  describe('registerLimiter', () => {
    it('should be configured with registration limits', () => {
      expect(registerLimiter).toBeDefined();
      expect(registerLimiter.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(registerLimiter.max).toBe(3); // 3 registrations
    });
  });
});

