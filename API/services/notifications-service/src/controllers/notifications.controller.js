const { asyncHandler, ResponseHandler } = require('@getplot/shared');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

class NotificationsController {
  /**
   * @route   POST /api/v1/notifications/email
   * @desc    Send email
   * @access  Service-to-service
   */
  sendEmail = asyncHandler(async (req, res) => {
    const { to, template, subject, html, data, attachments } = req.body;

    let result;
    if (template) {
      result = await emailService.sendTemplateEmail({ to, template, data, attachments });
    } else {
      result = await emailService.sendEmail({ to, subject, html, attachments });
    }

    return ResponseHandler.success(res, result, 'Email sent successfully');
  });

  /**
   * @route   POST /api/v1/notifications/sms
   * @desc    Send SMS
   * @access  Service-to-service
   */
  sendSMS = asyncHandler(async (req, res) => {
    const { to, message } = req.body;

    const result = await smsService.sendSMS({ to, message });

    return ResponseHandler.success(res, result, 'SMS sent successfully');
  });

  /**
   * @route   POST /api/v1/notifications/bulk-sms
   * @desc    Send bulk SMS
   * @access  Service-to-service/Admin
   */
  sendBulkSMS = asyncHandler(async (req, res) => {
    const { recipients, message } = req.body;

    const results = await smsService.sendBulkSMS(recipients, message);

    return ResponseHandler.success(res, results, 'Bulk SMS processed');
  });
}

module.exports = new NotificationsController();

