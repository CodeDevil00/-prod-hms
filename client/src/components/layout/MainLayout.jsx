// MainLayout.jsx — wraps every page that requires login
// It shows the Sidebar + the page content side by side.
// If the user is NOT logged in, it redirects to /login automatically.

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const { user } = useAuth()

  // If no user is logged in, redirect to the login page.
  // <Navigate> is React Router's way of programmatic redirect in JSX.
  // 'replace' means the login page won't be added to browser history —
  // pressing Back won't loop back to it.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Main content area — takes all remaining width */}
      <main className="flex-1 overflow-y-auto">
        {/* <Outlet /> renders whatever child route is currently active.
            e.g. if URL is /students, Outlet renders <StudentsPage /> */}
        <Outlet />
      </main>
    </div>
  )
}
