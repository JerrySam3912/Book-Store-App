// Centralized error handling middleware
const logger = require('../utils/logger');
const { MESSAGES } = require('../utils/constants');

/**
 * Custom App Error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set default error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (err.statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: req.user?.id || 'anonymous'
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      user: req.user?.id || 'anonymous'
    });
  }

  // Development: send detailed error
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production: send sanitized error
  // Operational errors (trusted errors we created)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown errors: don't leak error details
  return res.status(500).json({
    status: 'error',
    message: MESSAGES.SERVER_ERROR
  });
};

/**
 * Handle 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(err);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please login again.', 401);
};

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again.', 401);
};

/**
 * Handle MySQL errors
 */
const handleMySQLError = (err) => {
  // Duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const message = err.sqlMessage || 'Duplicate entry';
    return new AppError(message, 409);
  }
  
  // Foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('Referenced resource does not exist', 400);
  }
  
  // Invalid data
  if (err.code === 'ER_BAD_NULL_ERROR') {
    return new AppError('Required field is missing', 400);
  }
  
  // Return generic error for other MySQL errors
  return new AppError('Database error occurred', 500);
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  handleJWTError,
  handleJWTExpiredError,
  handleMySQLError
};
