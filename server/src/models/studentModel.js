// studentModel.js — all SQL queries for the students table
//
// A "model" in MVC architecture is the layer that talks to the database.
// Controllers call these functions. Controllers never write SQL directly.
// This separation means if you ever change your database,
// you only update the model — the controller stays the same.
//
// Every function here uses:
//   pool.query(sql, [params]) — runs a SQL query
//   Returns [rows, fields] — we destructure and use 'rows'
//   ? placeholders — ALWAYS use these for user input (prevents SQL injection)
//   SQL injection example: if name = "'; DROP TABLE students; --"
//   With ? placeholders, mysql2 escapes the string safely.

const pool = require('../config/db');

// ── GET ALL STUDENTS ──────────────────────────────────────────
// Supports: search by name/email, pagination, filtering by status
// JOIN with rooms so we get the room_number alongside student data
async function getAllStudents({ search = '', page = 1, limit = 20, status = '' } = {}) {
  const offset = (page - 1) * limit; // page 1 → offset 0, page 2 → offset 20

  // Build the WHERE clause dynamically based on what filters were passed
  let whereClause = 'WHERE 1=1'; // "1=1" is always true — a safe base to append AND to
  const params = [];

  if (search) {
    // LIKE '%search%' matches anywhere in the string
    whereClause += ' AND (s.full_name LIKE ? OR s.email LIKE ? OR s.student_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    whereClause += ' AND s.status = ?';
    params.push(status);
  }

  // Main query — LEFT JOIN means we include students even if room_id is NULL
  const [rows] = await pool.query(
    `SELECT
       s.id, s.student_id, s.full_name, s.email, s.phone,
       s.guardian_name, s.guardian_phone, s.photo_url,
       s.admission_date, s.status, s.created_at,
       r.room_number, r.room_type, r.floor
     FROM students s
     LEFT JOIN rooms r ON s.room_id = r.id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Count query — same filters, no pagination, so we know total pages
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM students s ${whereClause}`,
    params
  );

  return {
    students: rows,
    total: countRows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countRows[0].total / limit),
  };
}

// ── GET ONE STUDENT ───────────────────────────────────────────
async function getStudentById(id) {
  const [rows] = await pool.query(
    `SELECT
       s.*,
       r.room_number, r.room_type, r.floor, r.price_per_month
     FROM students s
     LEFT JOIN rooms r ON s.room_id = r.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0]; // returns undefined if not found — controller handles that
}

// ── GET BY STUDENT_ID STRING ──────────────────────────────────
async function getStudentByStudentId(studentId) {
  const [rows] = await pool.query(
    'SELECT * FROM students WHERE student_id = ?',
    [studentId]
  );
  return rows[0];
}

// ── CREATE STUDENT ────────────────────────────────────────────
async function createStudent({ student_id, full_name, email, phone,
  guardian_name, guardian_phone, room_id, admission_date }) {

  const [result] = await pool.query(
    `INSERT INTO students
       (student_id, full_name, email, phone, guardian_name, guardian_phone, room_id, admission_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [student_id, full_name, email, phone,
     guardian_name || null, guardian_phone || null,
     room_id || null, admission_date || new Date()]
  );

  // result.insertId is the auto-increment ID of the newly created row
  return result.insertId;
}

// ── UPDATE STUDENT ────────────────────────────────────────────
async function updateStudent(id, fields) {
  // Build SET clause dynamically — only update fields that were provided
  // e.g. if only 'phone' was sent, only phone gets updated
  const allowedFields = ['full_name', 'email', 'phone', 'guardian_name',
    'guardian_phone', 'room_id', 'admission_date', 'status'];

  const updates = [];
  const params  = [];

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = ?`); // e.g. "phone = ?"
      params.push(fields[field]);
    }
  }

  if (updates.length === 0) return 0; // nothing to update

  params.push(id); // the WHERE clause parameter comes last

  const [result] = await pool.query(
    `UPDATE students SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return result.affectedRows; // 1 if updated, 0 if student not found
}

// ── UPDATE PHOTO ──────────────────────────────────────────────
async function updateStudentPhoto(id, photoUrl) {
  const [result] = await pool.query(
    'UPDATE students SET photo_url = ? WHERE id = ?',
    [photoUrl, id]
  );
  return result.affectedRows;
}

// ── DELETE STUDENT ────────────────────────────────────────────
async function deleteStudent(id) {
  const [result] = await pool.query(
    'DELETE FROM students WHERE id = ?',
    [id]
  );
  return result.affectedRows; // 1 if deleted, 0 if not found
}

// ── CHECK EMAIL UNIQUE ────────────────────────────────────────
// Used before creating a student to ensure no duplicate email
async function getStudentByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id FROM students WHERE email = ?',
    [email]
  );
  return rows[0];
}

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByStudentId,
  createStudent,
  updateStudent,
  updateStudentPhoto,
  deleteStudent,
  getStudentByEmail,
};
