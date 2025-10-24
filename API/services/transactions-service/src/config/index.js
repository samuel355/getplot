require('dotenv').config();

module.exports = {
  port: process.env.TRANSACTIONS_SERVICE_PORT || process.env.PORT || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  
  // Payment Gateway (Paystack)
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    baseUrl: 'https://api.paystack.co',
  },
  
  // Business rules
  business: {
    minimumDepositPercentage: 30,
    plotHoldDurationHours: 24,
    currency: 'GHS',
  },
  
  // Bank account details
  accounts: {
    cedis: {
      bankName: process.env.CEDIS_BANK_NAME || 'Bank Name',
      accountName: process.env.CEDIS_ACCOUNT_NAME || 'Get Plot Ltd',
      accountNumber: process.env.CEDIS_ACCOUNT_NUMBER || '1234567890',
      branchName: process.env.CEDIS_BRANCH_NAME || 'Main Branch',
    },
    dollar: {
      bankName: process.env.DOLLAR_BANK_NAME || 'Bank Name',
      accountName: process.env.DOLLAR_ACCOUNT_NAME || 'Get Plot Ltd',
      accountNumber: process.env.DOLLAR_ACCOUNT_NUMBER || '0987654321',
      branchName: process.env.DOLLAR_BRANCH_NAME || 'Main Branch',
    },
  },
  
  // Services
  services: {
    properties: process.env.PROPERTIES_SERVICE_URL || 'http://localhost:3002',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

