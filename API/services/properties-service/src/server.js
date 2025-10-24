const app = require('./app');
const config = require('./config');
const { database, redis, logger } = require('@getplot/shared');

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

async function startServer() {
  try {
    await database.connect();
    logger.info('Database connected');

    await redis.connect();
    logger.info('Redis connected');

    const server = app.listen(config.port, () => {
      logger.info(`Properties Service running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Starting graceful shutdown...');

      server.close(async () => {
        logger.info('HTTP server closed');
        await database.disconnect();
        await redis.disconnect();
        process.exit(0);
      });

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

