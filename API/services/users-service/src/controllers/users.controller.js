const { asyncHandler, ResponseHandler } = require('@getplot/shared');
const usersService = require('../services/users.service');

class UsersController {
  /**
   * @route   GET /api/v1/users/profile
   * @desc    Get current user profile
   * @access  Private
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;

    const profile = await usersService.getProfile(userId);

    return ResponseHandler.success(res, profile, 'Profile retrieved successfully');
  });

  /**
   * @route   PUT /api/v1/users/profile
   * @desc    Update user profile
   * @access  Private
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const updates = req.body;

    const profile = await usersService.updateProfile(userId, updates);

    return ResponseHandler.success(res, profile, 'Profile updated successfully');
  });

  /**
   * @route   GET /api/v1/users/preferences
   * @desc    Get user preferences
   * @access  Private
   */
  getPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.sub;

    const preferences = await usersService.getPreferences(userId);

    return ResponseHandler.success(res, preferences, 'Preferences retrieved successfully');
  });

  /**
   * @route   PUT /api/v1/users/preferences
   * @desc    Update user preferences
   * @access  Private
   */
  updatePreferences = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const updates = req.body;

    const preferences = await usersService.updatePreferences(userId, updates);

    return ResponseHandler.success(res, preferences, 'Preferences updated successfully');
  });

  /**
   * @route   GET /api/v1/users/saved-properties
   * @desc    Get saved properties
   * @access  Private
   */
  getSavedProperties = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const filters = {
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    };

    const result = await usersService.getSavedProperties(userId, filters);

    return ResponseHandler.paginated(res, result.properties, result.pagination, 'Saved properties retrieved successfully');
  });

  /**
   * @route   POST /api/v1/users/saved-properties/:propertyId
   * @desc    Save a property
   * @access  Private
   */
  saveProperty = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { propertyId } = req.params;

    await usersService.saveProperty(userId, propertyId);

    return ResponseHandler.success(res, null, 'Property saved successfully');
  });

  /**
   * @route   DELETE /api/v1/users/saved-properties/:propertyId
   * @desc    Unsave a property
   * @access  Private
   */
  unsaveProperty = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { propertyId } = req.params;

    await usersService.unsaveProperty(userId, propertyId);

    return ResponseHandler.success(res, null, 'Property unsaved successfully');
  });

  /**
   * @route   GET /api/v1/users/activity
   * @desc    Get activity logs
   * @access  Private
   */
  getActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const filters = {
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    };

    const result = await usersService.getActivityLogs(userId, filters);

    return ResponseHandler.paginated(res, result.logs, result.pagination, 'Activity logs retrieved successfully');
  });
}

module.exports = new UsersController();

