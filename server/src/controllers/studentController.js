// studentController.js — handles all HTTP requests for /api/students
//
// A controller's job is:
//   1. Read data from the request (req.body, req.params, req.query)
//   2. Call the model to do the database work
//   3. Send back a JSON response (res.json)
//
// Controllers should NOT contain SQL. That's the model's job.
// Controllers should NOT contain business rules. That's a service's job.
// This keeps each layer thin and testable.
//
// 'async' functions + try/catch + next(error):
//   If anything throws, we call next(error) which sends it to errorHandler.js
//   This avoids writing error responses in every function.

const studentModel        = require('../models/studentModel');
const { generateStudentId } = require('../utils/generateId');
const logger              = require('../utils/logger');
const pool                = require('../config/db');

// ── GET ALL — GET /api/students ───────────────────────────────
// Query params: ?search=ravi&page=2&limit=10&status=Active
const getAllStudents = async (req, res, next) => {
  try {
    const { search, page, limit, status } = req.query;

    const result = await studentModel.getAllStudents({
      search: search || '',
      page:   parseInt(page)  || 1,
      limit:  parseInt(limit) || 20,
      status: status || '',
    });

    logger.info(`GET /api/students — returned ${result.students.length} records`);

    res.json({
      success: true,
      data:    result.students,
      pagination: {
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error); // passes to errorHandler.js
  }
};

// ── GET ONE — GET /api/students/:id ──────────────────────────
const getStudent = async (req, res, next) => {
  try {
    // req.params.id comes from the URL: /api/students/42 → id = "42"
    const student = await studentModel.getStudentById(req.params.id);

    if (!student) {
      // Return a 404 — the resource doesn't exist
      return res.status(404).json({
        success: false,
        error: `Student with ID ${req.params.id} not found`,
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// ── CREATE — POST /api/students ───────────────────────────────
const createStudent = async (req, res, next) => {
  try {
    // Destructure all expected fields from the request body
    const { full_name, email, phone, guardian_name, guardian_phone,
            room_id, admission_date } = req.body;

    // ── Validation ────────────────────────────────────────────
    // Always validate user input BEFORE touching the database.
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'full_name and email are required fields',
      });
    }

    // Simple email format check using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Check if email is already taken
    const existingStudent = await studentModel.getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'A student with this email already exists',
      });
    }

    // ── Generate student ID ───────────────────────────────────
    const student_id = await generateStudentId(); // e.g. "HMS-2024-006"

    // ── Insert into database ──────────────────────────────────
    const insertId = await studentModel.createStudent({
      student_id, full_name, email, phone,
      guardian_name, guardian_phone, room_id, admission_date,
    });

    // If a room was assigned, update its occupancy count
    if (room_id) {
      await pool.query(
        `UPDATE rooms
         SET current_occupancy = current_occupancy + 1,
             status = IF(current_occupancy + 1 >= capacity, 'Full', 'Available')
         WHERE id = ?`,
        [room_id]
      );
    }

    logger.info(`Student created: ${student_id} (${full_name})`);

    // 201 = Created — the standard status code for successful resource creation
    res.status(201).json({
      success:    true,
      message:    'Student created successfully',
      student_id, // return the generated HMS-YYYY-NNN id
      id:         insertId,
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE — PUT /api/students/:id ────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check student exists first
    const existing = await studentModel.getStudentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // If email is being changed, check it's not taken by someone else
    if (req.body.email && req.body.email !== existing.email) {
      const emailTaken = await studentModel.getStudentByEmail(req.body.email);
      if (emailTaken) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
    }

    const affectedRows = await studentModel.updateStudent(id, req.body);

    if (affectedRows === 0) {
      return res.status(400).json({ success: false, error: 'No fields were updated' });
    }

    // Fetch and return the updated record
    const updated = await studentModel.getStudentById(id);

    logger.info(`Student updated: ID ${id}`);
    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// ── UPLOAD PHOTO — POST /api/students/:id/photo ───────────────
// Multer middleware runs BEFORE this and puts the file in req.file
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const student = await studentModel.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // req.file.filename is the name Multer gave the saved file (e.g. "photo-123.jpg")
    // We store a relative URL path so it can be served as: GET /uploads/photo-123.jpg
    const photoUrl = `uploads/${req.file.filename}`;

    await studentModel.updateStudentPhoto(req.params.id, photoUrl);

    logger.info(`Photo uploaded for student ID ${req.params.id}: ${photoUrl}`);
    res.json({ success: true, message: 'Photo uploaded successfully', photo_url: photoUrl });
  } catch (error) {
    next(error);
  }
};

// ── DELETE — DELETE /api/students/:id ────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Free up the room occupancy before deleting
    if (student.room_id) {
      await pool.query(
        `UPDATE rooms
         SET current_occupancy = GREATEST(current_occupancy - 1, 0),
             status = 'Available'
         WHERE id = ?`,
        [student.room_id]
      );
    }

    await studentModel.deleteStudent(req.params.id);

    logger.info(`Student deleted: ${student.student_id} (${student.full_name})`);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  uploadPhoto,
  deleteStudent,
};
