// axiosInstance.js — creates a pre-configured axios client
//
// Instead of writing the full URL and headers in every API call,
// we create ONE axios instance that:
//   1. Knows the base URL (/api)
//   2. Automatically attaches the JWT token to every request
//   3. Catches 401 errors globally (token expired → redirect to login)
//
// Every api/*.js file imports this instance instead of raw axios.

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',     // all requests go to /api/... (proxied to Express by Vite)
  timeout: 15000,      // fail after 15 seconds — don't wait forever
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── REQUEST INTERCEPTOR ────────────────────────────────────────
// Runs before EVERY request is sent.
// We read the JWT token from localStorage and attach it.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token')
    if (token) {
      // HTTP convention: "Bearer <token>"
      // Express's auth.js middleware reads and verifies this
      config.headers.Authorization = `Bearer ${token}`
    }
    return config  // must return config or the request is cancelled
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────
// Runs after EVERY response is received.
// We use it to handle 401 (Unauthorized) globally.
api.interceptors.response.use(
  (response) => response,  // success — pass through unchanged

  (error) => {
    // 401 = token missing, expired, or invalid
    if (error.response?.status === 401) {
      // Clear stored credentials and send user to login
      localStorage.removeItem('hms_token')
      localStorage.removeItem('hms_user')
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
