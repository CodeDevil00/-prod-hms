// AuthContext.jsx — global authentication state
//
// PROBLEM: Many components need to know who is logged in.
// Without Context, you'd pass user data down as props through
// every component — called "prop drilling". It gets messy fast.
//
// SOLUTION: React Context.
// AuthContext holds the user and token once at the top level.
// Any component ANYWHERE in the tree can read it with useAuth().
// No props needed.
//
// Think of it like a TV broadcast — context is the signal,
// useAuth() is the TV that tunes in. The signal doesn't need
// to go through every wall to reach each TV.

import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../api/authApi'

// 1. Create the context — this is the "broadcast channel"
const AuthContext = createContext(null)

// 2. AuthProvider wraps the app (in main.jsx) and holds the state
export function AuthProvider({ children }) {
  // Read stored credentials from localStorage on first load
  // so the user stays logged in after a page refresh
  const [user, setUser]   = useState(() => {
    const stored = localStorage.getItem('hms_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'))
  const [loading, setLoading] = useState(false)

  // login: calls API, stores result in state AND localStorage
  const login = async (username, password) => {
    setLoading(true)
    try {
      const data = await loginApi(username, password)
      // data = { success: true, token: '...', user: { id, username, role } }
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('hms_token', data.token)
      localStorage.setItem('hms_user', JSON.stringify(data.user))
      return data
    } finally {
      setLoading(false)
    }
  }

  // logout: clear everything
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('hms_token')
    localStorage.removeItem('hms_user')
  }

  // Helper: check if current user has a given role
  const hasRole = (...roles) => user && roles.includes(user.role)
  const isAdmin   = () => hasRole('Admin')
  const isWarden  = () => hasRole('Admin', 'Warden')

  // 3. Provide the value to all children
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isWarden }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. useAuth — the custom hook components call to read context
// Usage: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
