/**
 * Standardized API Response Handlers
 */

class ResponseHandler {
  /**
   * Send success response
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send created response
   */
  static created(res, data, message = 'Resource created successfully') {
    return ResponseHandler.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(res, error, statusCode = 500) {
    const response = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An error occurred',
      },
      timestamp: new Date().toISOString(),
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development') {
      response.error.stack = error.stack;
      response.error.details = error.errors || null;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasMore: pagination.page * pagination.limit < pagination.total,
      },
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send forbidden response
   */
  static forbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send not found response
   */
  static notFound(res, resource = 'Resource') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send conflict response
   */
  static conflict(res, message = 'Resource already exists') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send too many requests response
   */
  static tooManyRequests(res, retryAfter = null) {
    const response = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
      timestamp: new Date().toISOString(),
    };

    if (retryAfter) {
      response.error.retryAfter = retryAfter;
    }

    return res.status(429).json(response);
  }
}

module.exports = ResponseHandler;

