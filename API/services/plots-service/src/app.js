const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { logger, errorHandler, notFound } = require('@getplot/shared');
const config = require('./config');
const plotsRoutes = require('./routes/plots.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'plots-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', plotsRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

