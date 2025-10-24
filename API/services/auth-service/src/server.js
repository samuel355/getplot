const app = require('./app');
const config = require('./config');
const { database, redis, logger } = require('@getplot/shared');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

async function startServer() {
  try {
    // Connect to database
    await database.connect();
    logger.info('Database connected');

    // Connect to Redis
    await redis.connect();
    logger.info('Redis connected');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Auth Service running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Starting graceful shutdown...');

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await database.disconnect();
        logger.info('Database disconnected');

        // Close Redis connection
        await redis.disconnect();
        logger.info('Redis disconnected');

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

