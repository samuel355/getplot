const path = require('path');
// Load env from API/env.local (3 levels up from src/config/index.js)
require('dotenv').config({ path: path.join(__dirname, '../../../env.local') });

module.exports = {
  // Server
  port: process.env.GATEWAY_PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Service URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    properties: process.env.PROPERTIES_SERVICE_URL || 'http://localhost:3002',
    transactions: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3003',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3004',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};

