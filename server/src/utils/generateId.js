// generateId.js — creates unique student IDs like HMS-2024-001
//
// Format: HMS-YYYY-NNN
//   HMS  = Hostel Management System (prefix)
//   YYYY = current year
//   NNN  = 3-digit sequential number, padded with zeros
//
// We query the database to find the highest existing number
// for this year, then increment by 1.

const pool = require('../config/db');

async function generateStudentId() {
  const year = new Date().getFullYear(); // e.g. 2024
  const prefix = `HMS-${year}-`;        // e.g. "HMS-2024-"

  // Find the last student ID created this year
  // LIKE 'HMS-2024-%' matches all IDs from this year
  // ORDER BY id DESC LIMIT 1 gets the most recently created one
  const [rows] = await pool.query(
    `SELECT student_id FROM students
     WHERE student_id LIKE ?
     ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNumber = 1; // start from 001 if no students exist this year

  if (rows.length > 0) {
    // rows[0].student_id is something like "HMS-2024-007"
    // Split on "-" gives ["HMS", "2024", "007"]
    // We take the last part "007" and parse it as a number: 7
    // Then add 1 to get 8
    const lastId = rows[0].student_id;
    const lastNumber = parseInt(lastId.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  // padStart(3, '0') pads with zeros: 1 → "001", 12 → "012", 100 → "100"
  const paddedNumber = String(nextNumber).padStart(3, '0');

  return `${prefix}${paddedNumber}`; // e.g. "HMS-2024-008"
}

module.exports = { generateStudentId };
