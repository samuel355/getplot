const EmailService = require('../../../src/services/email.service');
const SMSService = require('../../../src/services/sms.service');

describe('NotificationsService - Unit Tests', () => {
  describe('EmailService', () => {
    describe('sendEmail', () => {
      it('should validate required parameters', async () => {
        await expect(
          EmailService.sendEmail({})
        ).rejects.toThrow();
      });

      it('should require recipient email', async () => {
        await expect(
          EmailService.sendEmail({
            to: null,
            subject: 'Test',
            body: 'Test body'
          })
        ).rejects.toThrow();
      });

      it('should require subject', async () => {
        await expect(
          EmailService.sendEmail({
            to: 'test@example.com',
            subject: null,
            body: 'Test body'
          })
        ).rejects.toThrow();
      });
    });

    describe('sendBulkEmail', () => {
      it('should validate recipients array', async () => {
        await expect(
          EmailService.sendBulkEmail({
            recipients: [],
            subject: 'Test',
            body: 'Test body'
          })
        ).rejects.toThrow();
      });

      it('should handle multiple recipients', async () => {
        // Mock email sending
        const mockSend = jest.fn().mockResolvedValue({ success: true });
        EmailService.sendEmail = mockSend;

        await EmailService.sendBulkEmail({
          recipients: ['user1@example.com', 'user2@example.com'],
          subject: 'Test',
          body: 'Test body'
        });

        expect(mockSend).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('SMSService', () => {
    describe('sendSMS', () => {
      it('should validate required parameters', async () => {
        await expect(
          SMSService.sendSMS({})
        ).rejects.toThrow();
      });

      it('should require phone number', async () => {
        await expect(
          SMSService.sendSMS({
            to: null,
            message: 'Test message'
          })
        ).rejects.toThrow();
      });

      it('should require message', async () => {
        await expect(
          SMSService.sendSMS({
            to: '+233241234567',
            message: null
          })
        ).rejects.toThrow();
      });

      it('should validate phone number format', async () => {
        await expect(
          SMSService.sendSMS({
            to: 'invalid-phone',
            message: 'Test message'
          })
        ).rejects.toThrow();
      });
    });

    describe('sendBulkSMS', () => {
      it('should validate recipients array', async () => {
        await expect(
          SMSService.sendBulkSMS({
            recipients: [],
            message: 'Test message'
          })
        ).rejects.toThrow();
      });
    });
  });
});

