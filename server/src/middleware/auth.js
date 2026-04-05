// auth.js — middleware that protects routes
//
// How JWT authentication works:
// 1. User logs in with username + password
// 2. Server checks the password and if correct, creates a JWT token
//    (a signed string that contains the user's id and role)
// 3. Server sends the token back to the client
// 4. Client stores it (localStorage) and sends it with every future request
//    in the Authorization header: "Bearer eyJhbGciOi..."
// 5. THIS middleware runs on every protected route:
//    it reads the token, verifies it, and puts the user info on req.user
// 6. The controller then knows WHO is making the request

const jwt    = require('jsonwebtoken');
const logger = require('../utils/logger');

// 'protect' is the main middleware — add it to any route that needs login
const protect = (req, res, next) => {
  try {
    // Read the Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // If there's no header at all, reject immediately
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please log in.',
      });
    }

    // Split "Bearer eyJhbG..." and take the second part (the actual token)
    const token = authHeader.split(' ')[1];

    // jwt.verify checks:
    //   1. Was this token signed with our JWT_SECRET? (not tampered with)
    //   2. Has it expired?
    // If either check fails, it throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req.user so controllers can use it
    // decoded will contain: { id, username, role, iat, exp }
    req.user = decoded;

    logger.debug(`Auth OK — user ${decoded.username} (${decoded.role})`);

    next(); // all good — move on to the actual route handler
  } catch (error) {
    // jwt.verify throws 'JsonWebTokenError' for invalid tokens
    // and 'TokenExpiredError' for expired ones
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

// 'restrictTo' is a factory — it returns a middleware that checks the role.
// Usage: router.delete('/students/:id', protect, restrictTo('Admin'), controller)
// This means: must be logged in AND must be Admin to delete.
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user was set by the 'protect' middleware above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This action requires: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
