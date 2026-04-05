// authApi.js — all API calls related to authentication
// Each function returns the response data directly so components
// don't have to unwrap response.data everywhere.

import api from './axiosInstance'

// POST /api/auth/login
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password })
  return response.data  // { success, token, user }
}

// GET /api/auth/me — get current user's profile
export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

// POST /api/auth/register (Admin only)
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}
