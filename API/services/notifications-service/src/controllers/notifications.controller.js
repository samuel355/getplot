const { asyncHandler, ResponseHandler } = require('@getplot/shared');
const { notificationQueue } = require('../queues/notification.queue');

class NotificationsController {
  /**
   * @route   POST /api/v1/notifications/email
   * @desc    Send email
   * @access  Service-to-service
   */
  sendEmail = asyncHandler(async (req, res) => {
    const { to, template, subject, html, data, attachments } = req.body;

    const errors = [];
    if (!to) {
      errors.push({ field: 'to', message: 'Recipient email is required' });
    }

    const isTemplateEmail = Boolean(template);
    const hasCustomContent = Boolean(subject && html);

    if (!isTemplateEmail && !hasCustomContent) {
      errors.push({
        field: 'template',
        message: 'Provide a template or both subject and html content',
      });
    }

    if (errors.length) {
      return ResponseHandler.validationError(res, errors);
    }

    const payload = {
      to,
      template: template || null,
      subject: subject || null,
      html: html || null,
      data: data || {},
      attachments: attachments || [],
    };

    const job = await notificationQueue.add(isTemplateEmail ? 'email' : 'email', payload);

    return ResponseHandler.success(
      res,
      { queued: true, jobId: job.id },
      'Email queued for delivery',
      202
    );
  });

  /**
   * @route   POST /api/v1/notifications/sms
   * @desc    Send SMS
   * @access  Service-to-service
   */
  sendSMS = asyncHandler(async (req, res) => {
    const { to, message } = req.body;

    const errors = [];
    if (!to) {
      errors.push({ field: 'to', message: 'Recipient phone number is required' });
    }
    if (!message) {
      errors.push({ field: 'message', message: 'Message content is required' });
    }

    if (errors.length) {
      return ResponseHandler.validationError(res, errors);
    }

    const job = await notificationQueue.add('sms', { to, message });

    return ResponseHandler.success(
      res,
      { queued: true, jobId: job.id },
      'SMS queued for delivery',
      202
    );
  });

  /**
   * @route   POST /api/v1/notifications/bulk-sms
   * @desc    Send bulk SMS
   * @access  Service-to-service/Admin
   */
  sendBulkSMS = asyncHandler(async (req, res) => {
    const { recipients, message } = req.body;

    const errors = [];
    if (!Array.isArray(recipients) || recipients.length === 0) {
      errors.push({ field: 'recipients', message: 'At least one recipient is required' });
    }
    if (!message) {
      errors.push({ field: 'message', message: 'Message content is required' });
    }

    if (errors.length) {
      return ResponseHandler.validationError(res, errors);
    }

    const job = await notificationQueue.add('bulkSms', { recipients, message });

    return ResponseHandler.success(
      res,
      { queued: true, jobId: job.id },
      'Bulk SMS queued for processing',
      202
    );
  });
}

module.exports = new NotificationsController();

