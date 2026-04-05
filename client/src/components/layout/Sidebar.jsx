// Sidebar.jsx — the left navigation panel
// NavLink from React Router automatically adds an 'active' class
// when the current URL matches its 'to' prop.

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Each nav item: icon (emoji for simplicity), label, route, and which roles can see it
const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard',   to: '/',            roles: ['Admin', 'Warden', 'Student'] },
  { icon: '🎓', label: 'Students',    to: '/students',    roles: ['Admin', 'Warden'] },
  { icon: '🛏️', label: 'Rooms',       to: '/rooms',       roles: ['Admin', 'Warden'] },
  { icon: '💰', label: 'Fees',        to: '/fees',        roles: ['Admin', 'Warden'] },
  { icon: '📋', label: 'Attendance',  to: '/attendance',  roles: ['Admin', 'Warden', 'Student'] },
  { icon: '🍽️', label: 'Mess',        to: '/mess',        roles: ['Admin', 'Warden', 'Student'] },
  { icon: '🔧', label: 'Complaints',  to: '/complaints',  roles: ['Admin', 'Warden', 'Student'] },
  { icon: '📢', label: 'Notices',     to: '/notices',     roles: ['Admin', 'Warden', 'Student'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter nav items based on current user's role
  const visibleItems = NAV_ITEMS.filter(item =>
    user && item.roles.includes(user.role)
  )

  return (
    <aside className="w-64 bg-primary-700 text-white flex flex-col
                      min-h-screen flex-shrink-0">
      {/* Logo / App name */}
      <div className="px-6 py-5 border-b border-primary-600">
        <h1 className="text-xl font-bold">🏨 HMS</h1>
        <p className="text-primary-100 text-xs mt-0.5">Hostel Management</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}  // 'end' prevents Dashboard from matching all routes
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
               font-medium transition-colors duration-100
               ${isActive
                 ? 'bg-white/20 text-white'
                 : 'text-primary-100 hover:bg-white/10 hover:text-white'
               }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout at the bottom */}
      <div className="px-4 py-4 border-t border-primary-600">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar circle with first letter of username */}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center
                          justify-center text-sm font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-primary-200">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-primary-200
                     hover:text-white transition-colors py-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
