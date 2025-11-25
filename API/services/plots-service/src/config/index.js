require('@getplot/shared/utils/loadEnv');

module.exports = {
  port: process.env.PLOTS_SERVICE_PORT || process.env.PORT || 3007,
  nodeEnv: process.env.NODE_ENV || 'development',
  cache: {
    listTTL: parseInt(process.env.PLOTS_CACHE_TTL, 10) || 300, // seconds
    detailTTL: parseInt(process.env.PLOTS_DETAIL_TTL, 10) || 600,
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

