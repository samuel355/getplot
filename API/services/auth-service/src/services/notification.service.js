const axios = require('axios');
const { logger } = require('@getplot/shared');
const config = require('../config');

class NotificationService {
  constructor() {
    this.baseUrl = config.services.notifications;
  }

  async sendEmail(payload) {
    if (!this.baseUrl) {
      logger.warn('Notifications service URL missing; email skipped', { payload });
      return { success: false, message: 'Notifications service unavailable' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/notifications/email`, payload, {
        timeout: 10000,
      });

      return response.data?.data ?? { success: true };
    } catch (error) {
      logger.error('Notifications service email error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async sendVerificationEmail(to, token) {
    if (!token) {
      logger.warn('Verification email skipped: token missing', { to });
      return { success: false, message: 'Token missing' };
    }

    const verificationLink = `${config.frontend.baseUrl.replace(/\/$/, '')}/verify-email?token=${token}`;

    return this.sendEmail({
      to,
      template: 'email_verification',
      data: { verificationLink },
    });
  }

  async sendPasswordResetEmail(to, token) {
    if (!token) {
      logger.warn('Password reset email skipped: token missing', { to });
      return { success: false, message: 'Token missing' };
    }

    const resetLink = `${config.frontend.baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

    return this.sendEmail({
      to,
      template: 'password_reset',
      data: { resetLink },
    });
  }
}

module.exports = new NotificationService();


