const axios = require('axios');

class ArkeselProvider {
  constructor(config = {}) {
    this.config = config;
    this.baseUrl = 'https://sms.arkesel.com/sms/api';
    this.name = 'arkesel';
  }

  isConfigured() {
    return Boolean(this.config.apiKey);
  }

  formatPhone(to = '') {
    const digitsOnly = `${to}`.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return null;
    }

    // Arkesel accepts numbers without plus sign in international format (e.g., 23324....)
    return digitsOnly;
  }

  async sendSMS({ to, message }) {
    const phoneNumber = this.formatPhone(to);

    const response = await axios.get(this.baseUrl, {
      params: {
        action: 'send-sms',
        api_key: this.config.apiKey,
        to: phoneNumber,
        from: this.config.senderId || 'GetPlot',
        sms: message,
      },
    });

    const statusText = response.status === 200 ? 'sent' : 'failed';

    return {
      to: phoneNumber,
      status: statusText,
      messageId: response.data?.data?.message_id || response.data?.message_id || null,
      providerResponse: response.data,
    };
  }
}

module.exports = ArkeselProvider;


