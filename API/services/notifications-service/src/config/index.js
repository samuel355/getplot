const path = require('path');
const fs = require('fs');
// Load env from API/env.local
let envPath = path.join(__dirname, '../../../env.local');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), 'env.local');
  if (!fs.existsSync(envPath) && process.cwd().includes('API')) {
    const apiRoot = process.cwd().split('/API/')[0] + '/API';
    envPath = path.join(apiRoot, 'env.local');
  }
}
require('dotenv').config({ path: envPath });

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
  
  // SMS (Africa's Talking)
  sms: {
    username: process.env.AFRICASTALKING_USERNAME,
    apiKey: process.env.AFRICASTALKING_API_KEY,
    senderId: process.env.AFRICASTALKING_SENDER_ID || 'GetPlot',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

