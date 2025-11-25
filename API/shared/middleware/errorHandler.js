const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 23505 || err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // PostgreSQL errors
  if (err.code && err.code.startsWith('22')) {
    // Data exception
    error = new AppError('Data validation error', 400);
  }

  if (err.code && err.code.startsWith('23')) {
    // Integrity constraint violation
    if (err.code === '23505') {
      error = new AppError('Duplicate entry', 409);
    } else if (err.code === '23503') {
      error = new AppError('Foreign key constraint violation', 400);
    } else {
      error = new AppError('Database constraint violation', 400);
    }
  }

  // Operational errors vs Programming errors
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || status.toUpperCase(),
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.errors,
      }),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle 404 - Not Found
 */
function notFound(req, res, next) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

/**
 * Async handler wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};

