const { asyncHandler, ResponseHandler, validators } = require('@getplot/shared');
const propertiesService = require('../services/properties.service');

class PropertiesController {
  /**
   * @route   GET /api/v1/properties
   * @desc    Get all properties with filters
   * @access  Public
   */
  getProperties = asyncHandler(async (req, res) => {
    const filters = {
      location: req.query.location,
      status: req.query.status,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      minSize: req.query.minSize ? parseFloat(req.query.minSize) : undefined,
      maxSize: req.query.maxSize ? parseFloat(req.query.maxSize) : undefined,
      sortBy: req.query.sortBy || 'createdAt',
      order: req.query.order || 'desc',
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    };

    const result = await propertiesService.getProperties(filters);

    return ResponseHandler.paginated(res, result.properties, result.pagination, 'Properties retrieved successfully');
  });

  /**
   * @route   GET /api/v1/properties/:id
   * @desc    Get single property
   * @access  Public
   */
  getPropertyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { location } = req.query;

    const property = await propertiesService.getPropertyById(id, location);

    return ResponseHandler.success(res, property, 'Property retrieved successfully');
  });

  /**
   * @route   GET /api/v1/properties/location/:location
   * @desc    Get properties by location (for maps)
   * @access  Public
   */
  getPropertiesByLocation = asyncHandler(async (req, res) => {
    const { location } = req.params;

    const properties = await propertiesService.getPropertiesByLocation(location);

    return ResponseHandler.success(res, properties, 'Properties retrieved successfully');
  });

  /**
   * @route   POST /api/v1/properties/search
   * @desc    Advanced property search
   * @access  Public
   */
  searchProperties = asyncHandler(async (req, res) => {
    const { filters, page, limit } = req.body;

    const result = await propertiesService.searchProperties(
      filters,
      page || 1,
      limit || 20
    );

    return ResponseHandler.paginated(res, result.properties, result.pagination, 'Search completed successfully');
  });

  /**
   * @route   GET /api/v1/properties/stats
   * @desc    Get property statistics
   * @access  Public
   */
  getStatistics = asyncHandler(async (req, res) => {
    const { location } = req.query;

    const stats = await propertiesService.getStatistics(location);

    return ResponseHandler.success(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * @route   PUT /api/v1/properties/:id/status
   * @desc    Update property status (internal use by transactions service)
   * @access  Private/Service
   */
  updatePropertyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { location, status, customerData } = req.body;

    const property = await propertiesService.updatePropertyStatus(
      id,
      location,
      status,
      customerData
    );

    return ResponseHandler.success(res, property, 'Property status updated successfully');
  });
}

module.exports = new PropertiesController();

