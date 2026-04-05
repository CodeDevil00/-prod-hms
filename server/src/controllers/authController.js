// authController.js — handles login, logout, and current user
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const logger = require('../utils/logger');

// ── LOGIN — POST /api/auth/login ──────────────────────────────
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    // Fetch user from database
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?', [username]
    );
    const user = rows[0];

    if (!user) {
      // Use the same message for wrong username OR wrong password
      // (never reveal which one is wrong — security best practice)
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    // bcrypt.compare hashes the plain password and checks it against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    // Create JWT token — the payload contains non-sensitive identifying info
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${username} (${user.role})`);

    // Send token and safe user info (never send password_hash to client)
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ME — GET /api/auth/me ─────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user was set by the protect middleware (auth.js)
    const [rows] = await pool.query(
      'SELECT id, username, role, linked_student_id, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// ── REGISTER (Admin creates users) — POST /api/auth/register ─
const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    // Hash password before storing — NEVER store plain text passwords
    // 12 = cost factor (higher = slower = more secure). 10-12 is standard.
    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, role || 'Student']
    );

    logger.info(`New user created: ${username} (${role})`);
    res.status(201).json({ success: true, message: 'User created', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Username already exists' });
    }
    next(error);
  }
};

module.exports = { login, getMe, register };
