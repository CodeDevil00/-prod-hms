// app.js — creates and configures the Express application
//
// Think of this file as the "wiring diagram" of the server.
// It connects all the pieces together:
//   middleware → routes → error handler
//
// server.js (the entry point) imports this file and starts listening.
// Keeping them separate makes testing easier — you can test the app
// without actually starting the server.

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const path         = require('path');
const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// ── Import route files ───────────────────────────────────────
// Each route file handles one module's endpoints
const authRoutes       = require('./routes/authRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const roomRoutes       = require('./routes/roomRoutes');
const feeRoutes        = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const visitorRoutes    = require('./routes/visitorRoutes');
const complaintRoutes  = require('./routes/complaintRoutes');
const messRoutes       = require('./routes/messRoutes');
const noticeRoutes     = require('./routes/noticeRoutes');

const app = express(); // create the Express application

// ── MIDDLEWARE ────────────────────────────────────────────────
// Middleware runs on EVERY request, in order, before the route handler.

// 1. CORS — Cross-Origin Resource Sharing
//    Allows React (port 5173 in dev) to call our API (port 3000).
//    Without this, the browser blocks requests between different origins.
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? false                           // in production, React is served by Express itself
//     : 'http://localhost:5173',        // allow Vite dev server
//   credentials: true,                  // allow cookies and Authorization headers
// }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// 2. JSON body parser
//    Reads the JSON body from POST/PUT requests and puts it in req.body.
//    Without this, req.body would be undefined.
app.use(express.json());

// 3. URL-encoded body parser
//    Handles traditional HTML form submissions (not JSON).
//    { extended: true } allows nested objects in form data.
app.use(express.urlencoded({ extended: true }));

// 4. Morgan — HTTP request logger
//    Logs every request like: POST /api/students 201 45ms
//    'combined' format includes IP address and User-Agent header.
//    We pipe Morgan's output through Winston so it goes to the log file.
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// 5. Serve uploaded files (student photos) as static files
//    A request to GET /uploads/photo-123.jpg will return the actual image file.
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ── ROUTES ───────────────────────────────────────────────────
// Each line mounts a router at a base path.
// e.g. anything starting with /api/students goes to studentRoutes.

app.use('/api/auth',       authRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/rooms',      roomRoutes);
app.use('/api/fees',       feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/visitors',   visitorRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess',       messRoutes);
app.use('/api/notices',    noticeRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────────
// A simple endpoint to verify the server is running.
// Used by Docker health checks and monitoring tools.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 HANDLER ──────────────────────────────────────────────
// If no route above matched, the request falls through to here.
// We send a 404 instead of letting Express send its default HTML error.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────
// Must be registered LAST, after all routes.
// Any error thrown in a route or controller lands here.
app.use(errorHandler);

module.exports = app;
