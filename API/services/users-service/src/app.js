const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('@getplot/shared');
const config = require('./config');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'users-service',
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

app.use('/api/v1/users', usersRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

