const express = require('express');
const usersController = require('../controllers/users.controller');

const router = express.Router();

// All routes require authentication (handled by API Gateway)

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);

router.get('/preferences', usersController.getPreferences);
router.put('/preferences', usersController.updatePreferences);

router.get('/saved-properties', usersController.getSavedProperties);
router.post('/saved-properties/:propertyId', usersController.saveProperty);
router.delete('/saved-properties/:propertyId', usersController.unsaveProperty);

router.get('/activity', usersController.getActivityLogs);

module.exports = router;

