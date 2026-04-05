// db.js — creates a MySQL connection POOL
//
// Why a pool and not a single connection?
// A pool keeps several connections open and reuses them.
// When 10 students log in at the same time, they each get
// their own connection from the pool instead of waiting.
// After their query finishes, the connection goes back
// into the pool for the next request.

const mysql = require('mysql2/promise');
const path  = require('path');
// db.js lives at server/src/config/ — three levels up reaches the project root
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// createPool sets up the pool of connections.
// All the values come from your .env file.
const pool = mysql.createPool({
  host:               process.env.DB_HOST,      // usually "localhost"
  port:               process.env.DB_PORT,      // MySQL default is 3306
  user:               process.env.DB_USER,      // e.g. "root"
  password:           process.env.DB_PASSWORD,  // your MySQL password
  database:           process.env.DB_NAME,      // "hostel_db"
  waitForConnections: true,    // if all connections are busy, wait (don't crash)
  connectionLimit:    10,      // max 10 connections open at once
  queueLimit:         0,       // 0 = unlimited queue
  timezone:           '+05:30' // Indian Standard Time (change for your timezone)
});

// Test that the database is reachable when the server starts.
// We get one connection, run a simple query, then release it back.
async function testConnection() {
  try {
    const connection = await pool.getConnection(); // grab one connection
    console.log('✅ MySQL connected successfully');
    connection.release(); // always release back to pool when done
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1); // stop the server — no point running without a database
  }
}

testConnection(); // run the test immediately when this file is loaded

// Export the pool so every model file can import it and run queries.
module.exports = pool;
