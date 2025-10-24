const express = require('express');
const notificationsController = require('../controllers/notifications.controller');

const router = express.Router();

// Service-to-service routes (should be protected by API key in production)
router.post('/email', notificationsController.sendEmail);
router.post('/sms', notificationsController.sendSMS);
router.post('/bulk-sms', notificationsController.sendBulkSMS);

module.exports = router;

