const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('@getplot/shared');
const config = require('./config');
const propertiesRoutes = require('./routes/properties.routes');

const app = express();

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
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'properties-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/health/ready', async (req, res) => {
  try {
    const { database, redis } = require('@getplot/shared');
    
    const dbHealth = await database.healthCheck();
    const redisHealth = await redis.healthCheck();

    if (dbHealth.status === 'healthy' && redisHealth.status === 'healthy') {
      return res.status(200).json({
        status: 'ready',
        checks: { database: dbHealth, redis: redisHealth },
      });
    }

    return res.status(503).json({
      status: 'not ready',
      checks: { database: dbHealth, redis: redisHealth },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'not ready',
      error: error.message,
    });
  }
});

// API routes
app.use('/api/v1/properties', propertiesRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;

