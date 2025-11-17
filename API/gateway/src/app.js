const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound, logger } = require('@getplot/shared');
const config = require('./config');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy (important for rate limiting behind load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

app.get('/', (req, res) => {
  res
    .status(200)
    .json({
      status: 'alive',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      message: 'API Gateway is running',
    });
});
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/health/ready', async (req, res) => {
  try {
    const { redis } = require('@getplot/shared');
    const redisHealth = await redis.healthCheck();

    if (redisHealth.status === 'healthy') {
      return res.status(200).json({
        status: 'ready',
        checks: { redis: redisHealth },
      });
    }

    return res.status(503).json({
      status: 'not ready',
      checks: { redis: redisHealth },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'not ready',
      error: error.message,
    });
  }
});

// API Documentation placeholder
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: 'v1',
    baseUrl: '/api/v1',
    services: {
      auth: '/api/v1/auth',
      properties: '/api/v1/properties',
      transactions: '/api/v1/transactions',
      users: '/api/v1/users',
      notifications: '/api/v1/notifications',
      analytics: '/api/v1/analytics',
    },
    documentation: 'See /docs folder for detailed API documentation',
  });
});

// Apply rate limiting to all API routes
app.use('/api/v1', apiLimiter);

// API routes (proxied to microservices)
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
