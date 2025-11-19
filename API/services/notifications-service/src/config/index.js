require('@getplot/shared/utils/loadEnv');

module.exports = {
  port: process.env.NOTIFICATIONS_SERVICE_PORT || process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM_EMAIL || 'noreply@getplot.com',
    fromName: process.env.SMTP_FROM_NAME || 'Get Plot',
  },
  
  // SMS Providers
  sms: {
    provider: (process.env.SMS_PROVIDER || 'arkesel').toLowerCase(),
    africastalking: {
      username: process.env.AFRICASTALKING_USERNAME,
      apiKey: process.env.AFRICASTALKING_API_KEY,
      senderId: process.env.AFRICASTALKING_SENDER_ID || 'GetPlot',
    },
    arkesel: {
      apiKey: process.env.ARKESEL_SMS_API || process.env.ARKESEL_SMS_API_KEY,
      senderId: process.env.ARKESEL_SMS_SENDER_ID || 'GetPlot',
    },
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

