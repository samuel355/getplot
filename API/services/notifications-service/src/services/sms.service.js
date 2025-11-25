const { database, logger } = require('@getplot/shared');
const config = require('../config');
const AfricaTalkingProvider = require('./sms/providers/africastalking.provider');
const ArkeselProvider = require('./sms/providers/arkesel.provider');

const PROVIDER_MAP = {
  africastalking: AfricaTalkingProvider,
  arkesel: ArkeselProvider,
};

class SMSService {
  constructor() {
    this.providerName = config.sms.provider || 'africastalking';
    this.provider = this._createProvider(this.providerName);
  }

  _createProvider(name) {
    const Provider = PROVIDER_MAP[name];
    if (!Provider) {
      logger.warn(`SMS provider '${name}' is not supported`);
      return null;
    }

    const providerConfig = config.sms[name] || {};
    const instance = new Provider(providerConfig);

    if (!instance.isConfigured()) {
      logger.warn(`SMS provider '${name}' missing configuration`);
      return null;
    }

    return instance;
  }

  _ensureProvider() {
    if (!this.provider) {
      this.provider = this._createProvider(this.providerName);
    }

    return this.provider;
  }

  _normalizePhone(to) {
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    const trimmed = `${to}`.trim();
    if (!trimmed) {
      throw new Error('Recipient phone number is required');
    }

    const digits = trimmed.replace(/[^\d+]/g, '');
    if (!/^\+?\d{10,15}$/.test(digits)) {
      throw new Error('Phone number must be in international format (e.g. +233241234567)');
    }

    return digits.startsWith('+') ? digits : `+${digits.replace(/^\+/, '')}`;
  }

  async sendSMS({ to, message }) {
    if (!message) {
      throw new Error('SMS message body is required');
    }

    const normalizedPhone = this._normalizePhone(to);
    const provider = this._ensureProvider();
    if (!provider) {
      logger.warn('SMS not sent - provider not configured', { provider: this.providerName });
      return { success: false, message: 'SMS provider not configured' };
    }

    try {
      const result = await provider.sendSMS({ to: normalizedPhone, message });

      await this._logSuccess({
        to: result.to || normalizedPhone,
        message,
        status: result.status || 'sent',
        provider: provider.name,
        messageId: result.messageId || null,
      });

      logger.info('SMS sent successfully', {
        to: result.to || normalizedPhone,
        provider: provider.name,
        messageId: result.messageId,
      });

      return {
        success: (result.status || '').toLowerCase() === 'sent',
        ...result,
      };
    } catch (error) {
      await this._logFailure({
        to: normalizedPhone,
        message,
        provider: provider.name,
        error,
      });

      logger.error('SMS sending failed', {
        to: normalizedPhone,
        provider: provider.name,
        error: error.message,
      });

      throw error;
    }
  }

  async sendBulkSMS(recipientsInput = [], messageInput) {
    let recipients = recipientsInput;
    let message = messageInput;

    if (!Array.isArray(recipientsInput) && typeof recipientsInput === 'object' && recipientsInput !== null) {
      recipients = recipientsInput.recipients;
      message = messageInput || recipientsInput.message;
    }

    if (!message) {
      throw new Error('SMS message body is required');
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients array is required');
    }

    return Promise.all(
      recipients.map((to) =>
        this.sendSMS({ to, message })
          .then((result) => ({ to, success: true, result }))
          .catch((error) => ({ to, success: false, error: error.message }))
      )
    );
  }

  async _logSuccess({ to, message, status, provider, messageId }) {
    try {
      await database.query(
        `INSERT INTO notifications.sms_logs (to_phone, message, status, provider, message_id, sent_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [to, message, status, provider, messageId]
      );
    } catch (error) {
      logger.error('Failed to log SMS success', { error: error.message });
    }
  }

  async _logFailure({ to, message, provider, error }) {
    try {
      await database.query(
        `INSERT INTO notifications.sms_logs (to_phone, message, status, provider, error_message)
         VALUES ($1, $2, $3, $4, $5)`,
        [to, message, 'failed', provider, error.message]
      );
    } catch (logError) {
      logger.error('Failed to log SMS failure', { error: logError.message });
    }
  }
}

module.exports = new SMSService();

