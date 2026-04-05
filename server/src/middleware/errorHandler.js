// errorHandler.js — catches ALL errors from any route in one place
//
// Without this, you'd have to write try/catch in every controller.
// With this, if any controller throws an error or calls next(error),
// Express automatically routes it here and sends a clean JSON response.
//
// In Express, a middleware with 4 parameters (err, req, res, next)
// is automatically treated as an error handler. That's the convention.

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error details for the developer (server-side only)
  logger.error(`${req.method} ${req.url} — ${err.message}`);

  // Determine the HTTP status code.
  // If the error object has a statusCode we set, use it.
  // Otherwise default to 500 (Internal Server Error).
  const statusCode = err.statusCode || 500;

  // Build the response object.
  // In development, include the full error stack so you can debug.
  // In production, never expose internal details to users.
  const response = {
    success: false,
    error:   err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
