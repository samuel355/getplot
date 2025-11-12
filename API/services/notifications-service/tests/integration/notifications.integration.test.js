const request = require('supertest');
const app = require('../../../src/app');

describe('Notifications API - Integration Tests', () => {
  describe('POST /api/v1/notifications/email', () => {
    it('should require service authentication', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test',
          body: 'Test body'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/email')
        .set('X-Service-Key', 'test-service-key')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/notifications/sms', () => {
    it('should require service authentication', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/sms')
        .send({
          to: '+233241234567',
          message: 'Test message'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/sms')
        .set('X-Service-Key', 'test-service-key')
        .send({
          to: 'invalid-phone',
          message: 'Test message'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/notifications/bulk-email', () => {
    it('should handle bulk email sending', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/bulk-email')
        .set('X-Service-Key', 'test-service-key')
        .send({
          recipients: ['user1@example.com', 'user2@example.com'],
          subject: 'Test',
          body: 'Test body'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

