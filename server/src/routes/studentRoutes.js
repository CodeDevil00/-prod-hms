// studentRoutes.js — maps HTTP method + URL to the right controller function
//
// A route file answers the question: "When this URL is called, which function runs?"
// It should contain NO logic — just routing.
//
// express.Router() creates a mini-app that handles a subset of routes.
// app.js mounts it at '/api/students' so:
//   router.get('/')    becomes   GET /api/students
//   router.get('/:id') becomes   GET /api/students/42

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');
const upload     = require('../middleware/upload');

// Every route below requires login (protect middleware runs first)
// The protect middleware verifies the JWT token and sets req.user

// GET  /api/students          — list all students
// POST /api/students          — create a new student
router.route('/')
  .get(protect, controller.getAllStudents)
  .post(protect, restrictTo('Admin', 'Warden'), controller.createStudent);

// POST /api/students/:id/photo — upload a student's profile photo
// upload.single('photo') tells Multer to look for a field named 'photo' in the form data
router.post('/:id/photo',
  protect,
  upload.single('photo'), // runs Multer, saves file, puts info in req.file
  controller.uploadPhoto
);

// GET    /api/students/:id  — get one student
// PUT    /api/students/:id  — update a student
// DELETE /api/students/:id  — delete a student (Admin only)
router.route('/:id')
  .get(protect, controller.getStudent)
  .put(protect, restrictTo('Admin', 'Warden'), controller.updateStudent)
  .delete(protect, restrictTo('Admin'), controller.deleteStudent);

module.exports = router;
