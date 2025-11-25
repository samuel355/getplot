const { Worker } = require('bullmq');
const { logger } = require('@getplot/shared');
const config = require('../config');
const { queueName, connection } = require('../queues/notification.queue');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

async function processJob(job) {
  switch (job.name) {
    case 'email': {
      const { template, ...payload } = job.data;
      if (template) {
        return emailService.sendTemplateEmail({ template, ...payload });
      }
      return emailService.sendEmail(payload);
    }
    case 'sms':
      return smsService.sendSMS(job.data);
    case 'bulkSms':
      return smsService.sendBulkSMS(job.data.recipients, job.data.message);
    default:
      throw new Error(`Unknown notification job: ${job.name}`);
  }
}

const worker = new Worker(queueName, processJob, {
  connection,
  concurrency: config.queue.workerConcurrency,
});

worker.on('completed', (job) => {
  logger.debug('Notification job completed', {
    jobId: job.id,
    name: job.name,
  });
});

worker.on('failed', (job, err) => {
  logger.error('Notification job failed', {
    jobId: job?.id,
    name: job?.name,
    error: err.message,
  });
});

const shutdown = async () => {
  await worker.close();
  logger.info('Notification worker shut down gracefully');
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = worker;


