const express = require('express');
const propertiesController = require('../controllers/properties.controller');

const router = express.Router();

// Public routes
router.get('/', propertiesController.getProperties);
router.get('/stats', propertiesController.getStatistics);
router.get('/location/:location', propertiesController.getPropertiesByLocation);
router.post('/search', propertiesController.searchProperties);
router.get('/:id', propertiesController.getPropertyById);

// Service-to-service routes (should be protected by API key in production)
router.put('/:id/status', propertiesController.updatePropertyStatus);

module.exports = router;

