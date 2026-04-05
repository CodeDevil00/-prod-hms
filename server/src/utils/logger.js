// logger.js — sets up Winston logging
//
// What is logging?
// Every important event in your app should be recorded:
// "User X logged in", "Student created", "Database error on line 42".
// These logs help you debug problems even AFTER they happened.
//
// Winston has "levels" from most to least severe:
//   error > warn > info > http > debug
//
// In production (NODE_ENV=production) we only log 'warn' and above.
// In development we log everything including 'debug'.

const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// Make sure the logs/ folder exists — Winston won't create it automatically
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define the format for log messages.
// Each line will look like: 2024-08-01 10:23:45 [INFO]: Student created HMS-2024-006
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // add a timestamp
  winston.format.errors({ stack: true }),  // if it's an Error object, include the stack trace
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // printf lets us control exactly what each log line looks like
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const logger = winston.createLogger({
  // What level and above to capture — 'debug' = everything
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',

  format: logFormat,

  // "transports" = where logs are written to
  transports: [
    // 1. Write ALL logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize:  5242880,  // 5MB — when file reaches this size, start a new one
      maxFiles: 5,        // keep last 5 log files, delete older ones
    }),

    // 2. Write only errors to a separate error.log — easy to find problems
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level:    'error',
    }),
  ],
});

// In development, ALSO print logs to the terminal so you can see them live
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(), // colours: red for error, yellow for warn, etc.
      logFormat
    ),
  }));
}

module.exports = logger;
