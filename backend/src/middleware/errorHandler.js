const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console/file
  logger.error(`${err.name || 'Error'}: ${err.message}`, { stack: err.stack, path: req.originalUrl, method: req.method });

  // Mongoose bad ObjectId casting
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized, invalid token';
    error = new Error(message);
    error.statusCode = 401;
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized, token expired';
    error = new Error(message);
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
