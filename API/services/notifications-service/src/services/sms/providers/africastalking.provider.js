const axios = require('axios');

class AfricaTalkingProvider {
  constructor(config = {}) {
    this.config = config;
    this.baseUrl = 'https://api.africastalking.com/version1/messaging';
    this.name = 'africastalking';
  }

  isConfigured() {
    return Boolean(this.config.username && this.config.apiKey);
  }

  formatPhone(to = '') {
    const trimmed = `${to}`.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('+')) {
      return trimmed;
    }

    return `+${trimmed.replace(/^\+/, '')}`;
  }

  async sendSMS({ to, message }) {
    const phoneNumber = this.formatPhone(to);

    const response = await axios.post(
      this.baseUrl,
      new URLSearchParams({
        username: this.config.username,
        to: phoneNumber,
        message,
        from: this.config.senderId,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey: this.config.apiKey,
          Accept: 'application/json',
        },
      }
    );

    const recipient = response.data?.SMSMessageData?.Recipients?.[0] || {};

    return {
      to: phoneNumber,
      messageId: recipient.messageId,
      status: recipient.status === 'Success' ? 'sent' : recipient.status || 'failed',
      cost: recipient.cost,
      providerResponse: response.data,
    };
  }
}

module.exports = AfricaTalkingProvider;


