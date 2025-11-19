const plotsService = require('../services/plots.service');

exports.getPlots = async (req, res, next) => {
  try {
    const data = await plotsService.getPlots(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPlotById = async (req, res, next) => {
  try {
    const plot = await plotsService.getPlotById(req.params.id, req.query.location);
    res.json({ success: true, data: plot });
  } catch (error) {
    next(error);
  }
};

exports.getLocationPlots = async (req, res, next) => {
  try {
    const plots = await plotsService.getPlotsByLocation(req.params.location);
    res.json({ success: true, data: plots });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await plotsService.getStatistics(req.query.location);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

