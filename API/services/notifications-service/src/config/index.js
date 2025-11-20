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
  
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  queue: {
    name: process.env.NOTIFICATIONS_QUEUE_NAME || 'notifications-jobs',
    defaultAttempts: parseInt(process.env.NOTIFICATIONS_QUEUE_ATTEMPTS, 10) || 3,
    backoffDelay: parseInt(process.env.NOTIFICATIONS_QUEUE_BACKOFF_MS, 10) || 2000,
    removeOnComplete: process.env.NOTIFICATIONS_QUEUE_REMOVE_ON_COMPLETE === 'false' ? false : true,
    workerConcurrency: parseInt(process.env.NOTIFICATIONS_WORKER_CONCURRENCY, 10) || 5,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

