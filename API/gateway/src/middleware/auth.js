const { JWTHelper, ResponseHandler, logger } = require('@getplot/shared');

/**
 * Authenticate requests
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = JWTHelper.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return ResponseHandler.unauthorized(res, error.message);
  }
}

/**
 * Authorize based on roles
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
 * Optional authentication
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
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};

