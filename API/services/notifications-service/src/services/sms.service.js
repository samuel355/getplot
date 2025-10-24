const axios = require('axios');
const { database, logger } = require('@getplot/shared');
const config = require('../config');

class SMSService {
  constructor() {
    this.baseUrl = 'https://api.africastalking.com/version1/messaging';
    this.apiKey = config.sms.apiKey;
    this.username = config.sms.username;
  }

  /**
   * Send SMS
   */
  async sendSMS({ to, message }) {
    try {
      if (!this.apiKey || !this.username) {
        logger.warn('SMS not sent - configuration missing');
        return { success: false, message: 'SMS service not configured' };
      }

      // Ensure phone number is in international format
      const phoneNumber = to.startsWith('+') ? to : `+${to}`;

      const response = await axios.post(
        this.baseUrl,
        new URLSearchParams({
          username: this.username,
          to: phoneNumber,
          message,
          from: config.sms.senderId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      const result = response.data.SMSMessageData.Recipients[0];

      // Log to database
      await database.query(
        `INSERT INTO notifications.sms_logs (to_phone, message, status, provider, message_id, sent_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [phoneNumber, message, result.status === 'Success' ? 'sent' : 'failed', 'africastalking', result.messageId]
      );

      logger.info('SMS sent successfully', { to: phoneNumber, messageId: result.messageId });

      return {
        success: true,
        messageId: result.messageId,
        status: result.status,
      };
    } catch (error) {
      logger.error('SMS sending failed:', error);

      // Log error to database
      await database.query(
        `INSERT INTO notifications.sms_logs (to_phone, message, status, error_message)
         VALUES ($1, $2, $3, $4)`,
        [to, message, 'failed', error.message]
      );

      throw error;
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const to of recipients) {
      try {
        const result = await this.sendSMS({ to, message });
        results.push({ to, success: true, result });
      } catch (error) {
        results.push({ to, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new SMSService();

