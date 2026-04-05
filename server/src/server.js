// server.js — the entry point for the backend
//
// This file does ONE thing: start the HTTP server on a port.
// All the real configuration is in app.js.
// Keeping them separate means you can import 'app' in tests
// without actually binding to a port.

// path.resolve(__dirname, '../../../.env') walks up from server/src/ to the project root.
// This works regardless of which directory you run npm from.
// __dirname is always the directory of THIS file — reliable, never changes.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app    = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// app.listen starts the HTTP server and begins accepting connections
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV}`);
  logger.info(`   Database:    ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
});

// Graceful shutdown — when Ctrl+C is pressed (SIGTERM/SIGINT),
// finish existing requests before closing.
// This is important in production to not drop active connections.
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});
