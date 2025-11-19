const { Queue, QueueEvents } = require('bullmq');
const { logger } = require('@getplot/shared');
const config = require('../config');

function buildConnection() {
  if (config.redis.url) {
    return {
      connection: {
        url: config.redis.url,
      },
    };
  }

  return {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
    },
  };
}

const { connection } = buildConnection();
const queueName = config.queue.name || 'notifications:jobs';

const notificationQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: {
    attempts: config.queue.defaultAttempts,
    backoff: {
      type: 'exponential',
      delay: config.queue.backoffDelay,
    },
    removeOnComplete: config.queue.removeOnComplete,
    removeOnFail: false,
  },
});

const queueEvents = new QueueEvents(queueName, { connection });

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Notification job failed', { jobId, failedReason });
});

queueEvents.on('completed', ({ jobId }) => {
  logger.debug('Notification job completed', { jobId });
});

queueEvents.on('error', (error) => {
  logger.error('Notification queue events error', { error: error.message });
});

module.exports = {
  notificationQueue,
  queueEvents,
  queueName,
  connection,
};


