const EmailService = require('@getplot/notifications-service/src/services/email.service');
const SMSService = require('@getplot/notifications-service/src/services/sms.service');

// Mock only the specific fs methods we need for email templates, not the entire fs module
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    promises: {
      readFile: jest.fn(), // Only mock readFile for template testing
    },
  };
});

// Mock other dependencies
jest.mock('nodemailer');
jest.mock('ejs');
jest.mock('@getplot/shared');
jest.mock('../../src/config', () => ({
  email: {
    user: 'test@example.com',
    password: 'password',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    from: 'noreply@getoneplot.com',
    fromName: 'GetOnePlot'
  }
}));

const { database, logger } = require('@getplot/shared');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs').promises;

describe('NotificationsService - Unit Tests', () => {
  describe('EmailService', () => {
    describe('sendEmail', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        // Setup transporter for sendEmail tests
        EmailService.transporter = {
          sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
        };
      });

      it('should validate required parameters', async () => {
        await expect(EmailService.sendEmail({})).rejects.toThrow();
      });

      it('should require recipient email', async () => {
        await expect(
          EmailService.sendEmail({
            to: null,
            subject: 'Test',
            body: 'Test body',
          })
        ).rejects.toThrow();
      });

      it('should require subject', async () => {
        await expect(
          EmailService.sendEmail({
            to: 'test@example.com',
            subject: null,
            body: 'Test body',
          })
        ).rejects.toThrow();
      });

      it('should send email successfully', async () => {
        database.query.mockResolvedValue({ rows: [] });

        const result = await EmailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<h1>Test</h1>',
          text: 'Test text'
        });

        expect(EmailService.transporter.sendMail).toHaveBeenCalledWith({
          from: '"GetOnePlot" <noreply@getoneplot.com>',
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<h1>Test</h1>',
          text: 'Test text',
          attachments: []
        });
        expect(result.success).toBe(true);
        expect(result.messageId).toBe('123');
      });

      it('should handle missing transporter', async () => {
        EmailService.transporter = null;

        const result = await EmailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<h1>Test</h1>'
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email service not configured');
      });

      it('should handle SMTP errors', async () => {
        EmailService.transporter = {
          sendMail: jest.fn().mockRejectedValue(new Error('SMTP error'))
        };

        await expect(
          EmailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test',
            html: '<h1>Test</h1>'
          })
        ).rejects.toThrow('SMTP error');
      });
    });

    describe('renderTemplate', () => {
      it('should render template successfully', async () => {
        const mockTemplate = '<h1>Hello <%= username %></h1>';
        fs.readFile.mockResolvedValue(mockTemplate);
        ejs.render.mockReturnValue('<h1>Hello John</h1>');

        process.env.FRONTEND_URL = 'http://localhost:3000';

        const result = await EmailService.renderTemplate('welcome', {
          to: 'test@example.com',
          username: 'John'
        });

        expect(fs.readFile).toHaveBeenCalledWith(
          expect.stringContaining('welcome.ejs'),
          'utf8'
        );
        expect(result).toBe('<h1>Hello John</h1>');
      });

      it('should throw error when template file not found', async () => {
        fs.readFile.mockRejectedValue(new Error('File not found'));

        await expect(
          EmailService.renderTemplate('nonexistent', {})
        ).rejects.toThrow('Failed to render template nonexistent: File not found');
      });
    });

    describe('sendTemplateEmail', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        EmailService.sendEmail = jest.fn().mockResolvedValue({ success: true });
      });

      it('should send template email successfully', async () => {
        EmailService.renderTemplate = jest.fn().mockResolvedValue(`
          <!DOCTYPE html>
          <html>
          <head><title>Test Email</title></head>
          <body><h1>Hello World</h1></body>
          </html>
        `);

        await EmailService.sendTemplateEmail({
          to: 'test@example.com',
          template: 'welcome',
          data: { username: 'John' }
        });

        expect(EmailService.renderTemplate).toHaveBeenCalledWith('welcome', {
          to: 'test@example.com',
          username: 'John'
        });
        expect(EmailService.sendEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          subject: 'Test Email',
          html: expect.any(String),
          attachments: []
        });
      });

      it('should use default subject when no title found', async () => {
        EmailService.renderTemplate = jest.fn().mockResolvedValue('<h1>No title here</h1>');
        EmailService.getDefaultSubject = jest.fn().mockReturnValue('Default Subject');

        await EmailService.sendTemplateEmail({
          to: 'test@example.com',
          template: 'unknown'
        });

        expect(EmailService.getDefaultSubject).toHaveBeenCalledWith('unknown');
        expect(EmailService.sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({ subject: 'Default Subject' })
        );
      });
    });

    describe('getDefaultSubject', () => {
      it('should return mapped subject for known templates', () => {
        expect(EmailService.getDefaultSubject('welcome')).toBe('Welcome to GetOnePlot - Start Your Real Estate Journey!');
        expect(EmailService.getDefaultSubject('reset-password')).toBe('Reset Your GetOnePlot Password');
      });

      it('should return default subject for unknown templates', () => {
        expect(EmailService.getDefaultSubject('unknown')).toBe('Notification from GetOnePlot');
      });
    });

    describe('Specific Email Methods', () => {
      beforeEach(() => {
        EmailService.sendTemplateEmail = jest.fn().mockResolvedValue({ success: true });
      });

      it('should send welcome email', async () => {
        await EmailService.sendWelcomeEmail('test@example.com', 'John Doe');

        expect(EmailService.sendTemplateEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          template: 'welcome',
          data: { username: 'John Doe' }
        });
      });

      it('should send verification email', async () => {
        process.env.FRONTEND_URL = 'http://localhost:3000';
        const token = 'verification-token-123';

        await EmailService.sendVerificationEmail('test@example.com', 'John', token);

        expect(EmailService.sendTemplateEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          template: 'verify-email',
          data: {
            username: 'John',
            verificationLink: 'http://localhost:3000/verify-email?token=verification-token-123'
          }
        });
      });

      it('should send password reset email', async () => {
        process.env.FRONTEND_URL = 'http://localhost:3000';
        const token = 'reset-token-456';

        await EmailService.sendPasswordResetEmail('test@example.com', 'John Smith', token);

        expect(EmailService.sendTemplateEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          template: 'reset-password',
          data: {
            fullname: 'John Smith',
            resetLink: 'http://localhost:3000/reset-password?token=reset-token-456'
          }
        });
      });

      it('should send purchase confirmation email', async () => {
        const plotData = { id: 1, name: 'Plot A' };
        const transactionId = 'txn-123';
        const purchaseDate = '2024-01-01';

        await EmailService.sendPurchaseConfirmation(
          'test@example.com',
          'John',
          plotData,
          transactionId,
          purchaseDate
        );

        expect(EmailService.sendTemplateEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          template: 'purchase-plot',
          data: {
            username: 'John',
            plot: plotData,
            transactionId,
            purchaseDate
          }
        });
      });

      it('should send reservation confirmation email', async () => {
        const plotData = { id: 2, name: 'Plot B' };
        const reservationId = 'res-456';
        const validUntil = '2024-12-31';

        await EmailService.sendReservationConfirmation(
          'test@example.com',
          'Jane',
          plotData,
          reservationId,
          validUntil
        );

        expect(EmailService.sendTemplateEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          template: 'reserve-plot',
          data: {
            username: 'Jane',
            plot: plotData,
            reservationId,
            validUntil
          }
        });
      });
    });

    describe('generateTextVersion', () => {
      it('should convert HTML to plain text', () => {
        const html = `
          <style>body { color: red; }</style>
          <script>alert('test');</script>
          <h1>Main Title</h1>
          <p>This is a paragraph with a <a href="http://example.com">link</a>.</p>
          <div>Some content</div>
          <br>
          <p>Another paragraph</p>
        `;

        const result = EmailService.generateTextVersion(html);

        expect(result).not.toMatch(/<style|<\/style>/);
        expect(result).not.toMatch(/<script|<\/script>/);
        expect(result).toMatch(/Main Title/);
        expect(result).toMatch(/link \(http:\/\/example.com\)/);
        expect(result).toMatch(/Some content/);
      });
    });

    describe('sendDatabaseTemplateEmail', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        EmailService.sendEmail = jest.fn().mockResolvedValue({ success: true });
      });

      it('should send email with database template', async () => {
        const mockTemplate = {
          rows: [{
            subject: 'Welcome <%= username %>',
            content: '<h1>Hello <%= username %></h1>'
          }]
        };
        database.query.mockResolvedValueOnce(mockTemplate);

        ejs.render
          .mockReturnValueOnce('Welcome John')
          .mockReturnValueOnce('<h1>Hello John</h1>');

        await EmailService.sendDatabaseTemplateEmail({
          to: 'test@example.com',
          template: 'welcome',
          data: { username: 'John' }
        });

        expect(database.query).toHaveBeenCalledWith(
          'SELECT subject, content FROM notifications.templates WHERE name = $1 AND is_active = true',
          ['welcome']
        );
        expect(EmailService.sendEmail).toHaveBeenCalledWith({
          to: 'test@example.com',
          subject: 'Welcome John',
          html: '<h1>Hello John</h1>',
          attachments: []
        });
      });

      it('should throw error when template not found', async () => {
        database.query.mockResolvedValue({ rows: [] });

        await expect(
          EmailService.sendDatabaseTemplateEmail({
            to: 'test@example.com',
            template: 'nonexistent',
            data: {}
          })
        ).rejects.toThrow("Template 'nonexistent' not found");
      });
    });

    describe('sendBulkEmail', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should validate recipients array', async () => {
        await expect(
          EmailService.sendBulkEmail({
            recipients: [],
            subject: 'Test',
            body: 'test body',
          })
        ).rejects.toThrow('Recipients array must contain at least one email address');

        await expect(
          EmailService.sendBulkEmail({
            recipients: null,
            subject: 'Test',
            body: 'test body',
          })
        ).rejects.toThrow();
      });

      it('should validate email format', async () => {
        await expect(
          EmailService.sendBulkEmail({
            recipients: ['invalid-email', 'user2@example.com'],
            subject: 'Test',
            body: 'test body',
          })
        ).rejects.toThrow('Invalid email addresses: invalid-email');
      });

      it('should handle multiple recipients', async () => {
        const mockSend = jest.fn().mockResolvedValue({ success: true });
        EmailService.sendEmail = mockSend;

        const result = await EmailService.sendBulkEmail({
          recipients: ['user1@example.com', 'user2@example.com'],
          subject: 'Test',
          body: 'test body',
        });

        expect(mockSend).toHaveBeenCalledTimes(2);
        expect(result.total).toBe(2);
        expect(result.successful).toBe(2);
        expect(result.failed).toBe(0);
      });

      it('should handle template emails', async () => {
        const mockSendTemplate = jest.fn().mockResolvedValue({ success: true });
        EmailService.sendTemplateEmail = mockSendTemplate;

        const result = await EmailService.sendBulkEmail({
          recipients: ['user1@example.com', 'user2@example.com'],
          template: 'welcome',
          templateData: { username: 'testuser' },
        });

        expect(mockSendTemplate).toHaveBeenCalledTimes(2);
        expect(result.successful).toBe(2);
      });

      it('should continue sending when some emails fail', async () => {
        const mockSend = jest.fn()
          .mockResolvedValueOnce({ success: true })
          .mockRejectedValueOnce(new Error('SMTP error'))
          .mockResolvedValueOnce({ success: true });

        EmailService.sendEmail = mockSend;

        const result = await EmailService.sendBulkEmail({
          recipients: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
          subject: 'Test',
          body: 'test body',
        });

        expect(mockSend).toHaveBeenCalledTimes(3);
        expect(result.total).toBe(3);
        expect(result.successful).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].recipient).toBe('user2@example.com');
      });

      it('should handle attachments', async () => {
        const mockSend = jest.fn().mockResolvedValue({ success: true });
        EmailService.sendEmail = mockSend;

        const attachments = [{ filename: 'test.pdf', content: 'base64encodedcontent' }];

        await EmailService.sendBulkEmail({
          recipients: ['user1@example.com'],
          subject: 'Test',
          body: 'test body',
          attachments,
        });

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            attachments: expect.any(Array),
          })
        );
      });
    });

    describe('sendBulkEmailConcurrent', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should send bulk emails concurrently in batches', async () => {
        const mockSend = jest.fn().mockResolvedValue({ success: true });
        EmailService.sendEmail = mockSend;

        const recipients = Array.from({ length: 8 }, (_, i) => `user${i}@example.com`);

        const result = await EmailService.sendBulkEmailConcurrent({
          recipients,
          subject: 'Test Subject',
          body: '<h1>Test</h1>',
          batchSize: 3
        });

        expect(result.total).toBe(8);
        expect(result.successful).toBe(8);
        expect(result.failed).toBe(0);
        expect(mockSend).toHaveBeenCalledTimes(8);
      });

      it('should handle failures in concurrent batches', async () => {
        const mockSend = jest.fn()
          .mockResolvedValueOnce({ success: true })
          .mockRejectedValueOnce(new Error('SMTP error'))
          .mockResolvedValueOnce({ success: true });
        EmailService.sendEmail = mockSend;

        const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

        const result = await EmailService.sendBulkEmailConcurrent({
          recipients,
          subject: 'Test',
          body: 'test body',
          batchSize: 2
        });

        expect(result.total).toBe(3);
        expect(result.successful).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.errors[0].recipient).toBe('user2@example.com');
      });
    });
  });

  describe('SMSService', () => {
    describe('sendSMS', () => {
      it('should validate required parameters', async () => {
        await expect(SMSService.sendSMS({})).rejects.toThrow();
      });

      it('should require phone number', async () => {
        await expect(
          SMSService.sendSMS({
            to: null,
            message: 'Test message',
          })
        ).rejects.toThrow();
      });

      it('should require message', async () => {
        await expect(
          SMSService.sendSMS({
            to: '+233241234567',
            message: null,
          })
        ).rejects.toThrow();
      });

      it('should validate phone number format', async () => {
        await expect(
          SMSService.sendSMS({
            to: 'invalid-phone',
            message: 'Test message',
          })
        ).rejects.toThrow();
      });
    });

    describe('sendBulkSMS', () => {
      it('should validate recipients array', async () => {
        await expect(
          SMSService.sendBulkSMS({
            recipients: [],
            message: 'Test message',
          })
        ).rejects.toThrow();
      });
    });
  });
});