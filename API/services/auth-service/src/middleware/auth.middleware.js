const { JWTHelper, ResponseHandler, logger } = require('@getplot/shared');

/**
 * Verify JWT token and attach user to request
 */
function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = JWTHelper.verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return ResponseHandler.unauthorized(res, error.message);
  }
}

/**
 * Check if user has required role
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ResponseHandler.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
}

/**
 * Optional authentication - don't fail if no token
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = JWTHelper.verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};

