// student.test.js — unit tests for student business logic
//
// What is unit testing?
// You isolate one small "unit" of code (a function) and verify
// it behaves correctly for different inputs — including edge cases.
//
// We use Jest (test runner) + Supertest (makes HTTP requests to Express).
//
// "Mocking" the database:
// We don't want tests to actually touch the real MySQL database.
// Instead we replace the model functions with fake versions that
// return predictable data. This makes tests fast and reliable.
//
// jest.mock('../src/models/studentModel') tells Jest:
// "replace every export from studentModel with a mock function".
// Then we set what each mock returns using .mockResolvedValue().

const request      = require('supertest')  // makes HTTP requests to our app
const app          = require('../src/app') // import the Express app (not server.js)
const studentModel = require('../src/models/studentModel')
const { generateStudentId } = require('../src/utils/generateId')

// Mock the entire model module — no real DB queries in tests
jest.mock('../src/models/studentModel')
jest.mock('../src/utils/generateId')

// Mock JWT so protected routes work without a real token
jest.mock('../src/middleware/auth', () => ({
  protect: (req, res, next) => {
    // Pretend every request is from an Admin user
    req.user = { id: 1, username: 'testadmin', role: 'Admin' }
    next()
  },
  restrictTo: (...roles) => (req, res, next) => next(),
}))

// ── describe groups related tests together ────────────────────
describe('GET /api/students', () => {

  // beforeEach runs before EVERY test in this describe block
  beforeEach(() => {
    jest.clearAllMocks() // reset all mocks between tests
  })

  // it() or test() defines a single test case
  it('should return a list of students with pagination', async () => {
    // Set what the mocked model function will return when called
    studentModel.getAllStudents.mockResolvedValue({
      students: [
        { id: 1, student_id: 'HMS-2024-001', full_name: 'Ravi Kumar',
          email: 'ravi@example.com', status: 'Active' },
      ],
      total: 1, page: 1, limit: 20, totalPages: 1,
    })

    // Make the actual HTTP request using Supertest
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', 'Bearer fake-token') // auth is mocked so any value works

    // Assertions — what we expect the response to look like
    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].full_name).toBe('Ravi Kumar')
    expect(res.body.pagination.total).toBe(1)
  })

  it('should support search query parameter', async () => {
    studentModel.getAllStudents.mockResolvedValue({
      students: [], total: 0, page: 1, limit: 20, totalPages: 0,
    })

    const res = await request(app)
      .get('/api/students?search=nobody')
      .set('Authorization', 'Bearer fake-token')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(0)
    // Verify the model was called with the search parameter
    expect(studentModel.getAllStudents).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'nobody' })
    )
  })
})

describe('POST /api/students', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should create a student and return 201', async () => {
    // Mock the helper and model functions
    generateStudentId.mockResolvedValue('HMS-2024-006')
    studentModel.getStudentByEmail.mockResolvedValue(null) // email not taken
    studentModel.createStudent.mockResolvedValue(42)       // returns new row ID

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', 'Bearer fake-token')
      .send({
        full_name: 'New Student',
        email:     'new@example.com',
        phone:     '9999999999',
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.student_id).toBe('HMS-2024-006')
    expect(res.body.id).toBe(42)
  })

  it('should return 400 if email already exists', async () => {
    studentModel.getStudentByEmail.mockResolvedValue({ id: 5 }) // email IS taken

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Duplicate', email: 'existing@example.com' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/already exists/i)
  })

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', 'Bearer fake-token')
      .send({ phone: '9999999999' }) // no full_name or email

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/required/i)
  })

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', 'Bearer fake-token')
      .send({ full_name: 'Test', email: 'not-an-email' })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/valid email/i)
  })
})

describe('DELETE /api/students/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should delete a student and return 200', async () => {
    studentModel.getStudentById.mockResolvedValue({
      id: 1, full_name: 'Ravi Kumar', student_id: 'HMS-2024-001', room_id: null,
    })
    studentModel.deleteStudent.mockResolvedValue(1)

    const res = await request(app)
      .delete('/api/students/1')
      .set('Authorization', 'Bearer fake-token')

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(studentModel.deleteStudent).toHaveBeenCalledWith('1')
  })

  it('should return 404 if student does not exist', async () => {
    studentModel.getStudentById.mockResolvedValue(undefined) // not found

    const res = await request(app)
      .delete('/api/students/999')
      .set('Authorization', 'Bearer fake-token')

    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
