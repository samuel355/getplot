const config = require('../../src/config');

describe('Gateway Config - Unit Tests', () => {
  describe('Server Configuration', () => {
    it('should have port configuration', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
    });

    it('should have nodeEnv configuration', () => {
      expect(config.nodeEnv).toBeDefined();
      expect(['development', 'production', 'test']).toContain(config.nodeEnv);
    });
  });

  describe('Service URLs', () => {
    it('should have all service URLs configured', () => {
      expect(config.services).toBeDefined();
      expect(config.services.auth).toBeDefined();
      expect(config.services.properties).toBeDefined();
      expect(config.services.transactions).toBeDefined();
      expect(config.services.users).toBeDefined();
      expect(config.services.notifications).toBeDefined();
    });

    it('should have valid URL format for services', () => {
      Object.values(config.services).forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should have rate limit settings', () => {
      expect(config.rateLimit).toBeDefined();
      expect(config.rateLimit.windowMs).toBeDefined();
      expect(config.rateLimit.max).toBeDefined();
    });

    it('should have valid rate limit values', () => {
      expect(config.rateLimit.windowMs).toBeGreaterThan(0);
      expect(config.rateLimit.max).toBeGreaterThan(0);
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS settings', () => {
      expect(config.cors).toBeDefined();
      expect(Array.isArray(config.cors.origin)).toBe(true);
    });
  });
});

