require('@getplot/shared/utils/loadEnv');

module.exports = {
  // Server
  port: process.env.PROPERTIES_SERVICE_PORT || process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  
  // Cache TTL (seconds)
  cache: {
    propertiesList: 300, // 5 minutes
    propertyDetails: 600, // 10 minutes
    searchResults: 180, // 3 minutes
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

