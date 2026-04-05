// studentApi.js — all API calls for /api/students
// Keeping API calls here (not inside components) means:
//   - Easy to find and change all student API calls in one place
//   - Components stay clean — they just call these functions
//   - Easy to mock in tests

import api from './axiosInstance'

// GET /api/students?search=&page=&limit=&status=
export const getStudents = async (params = {}) => {
  const response = await api.get('/students', { params })
  return response.data  // { success, data: [...], pagination: {...} }
}

// GET /api/students/:id
export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`)
  return response.data  // { success, data: {...} }
}

// POST /api/students
export const createStudent = async (studentData) => {
  const response = await api.post('/students', studentData)
  return response.data  // { success, student_id, id, message }
}

// PUT /api/students/:id
export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData)
  return response.data
}

// DELETE /api/students/:id
export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`)
  return response.data
}

// POST /api/students/:id/photo
// Photo uploads use FormData (multipart), not JSON
export const uploadStudentPhoto = async (id, file) => {
  const formData = new FormData()
  // 'photo' must match the field name in upload.single('photo') on the server
  formData.append('photo', file)

  const response = await api.post(`/students/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
