// App.jsx — the root component that sets up all routes
//
// React Router works like a traffic controller:
// it reads the current URL and decides which component to render.
//
// Route structure:
//   /login              → LoginPage (public, no auth needed)
//   /                   → MainLayout (protected wrapper)
//     /                 →   DashboardPage
//     /students         →   StudentsPage
//     /rooms            →   RoomsPage
//     ... etc
//
// MainLayout checks for login. If not logged in it redirects to /login.
// So all child routes under MainLayout are automatically protected.

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout      from './components/layout/MainLayout'
import LoginPage       from './pages/LoginPage'
import DashboardPage   from './pages/DashboardPage'
import StudentsPage    from './pages/StudentsPage'
import RoomsPage       from './pages/RoomsPage'
import FeesPage        from './pages/FeesPage'
import AttendancePage  from './pages/AttendancePage'
import MessPage        from './pages/MessPage'
import ComplaintsPage  from './pages/ComplaintsPage'
import NoticesPage     from './pages/NoticesPage'

// 404 page — shown when no route matches
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <p className="text-6xl mb-4">🔍</p>
      <p className="text-xl font-semibold">Page not found</p>
      <a href="/" className="text-primary-700 text-sm mt-2 hover:underline">
        Go to dashboard
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — no auth needed */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — all nested under MainLayout */}
        {/* MainLayout renders <Outlet /> where child routes appear */}
        <Route path="/" element={<MainLayout />}>
          <Route index          element={<DashboardPage />} />
          <Route path="students"   element={<StudentsPage />} />
          <Route path="rooms"      element={<RoomsPage />} />
          <Route path="fees"       element={<FeesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="mess"       element={<MessPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="notices"    element={<NoticesPage />} />
          <Route path="*"          element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
