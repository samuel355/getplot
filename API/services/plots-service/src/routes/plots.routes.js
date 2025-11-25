const express = require('express');
const plotsController = require('../controllers/plots.controller');

const router = express.Router();

router.get('/plots', plotsController.getPlots);
router.get('/plots/stats', plotsController.getStatistics);
router.get('/plots/location/:location', plotsController.getLocationPlots);
router.get('/plots/:id', plotsController.getPlotById);

module.exports = router;

