// DashboardPage.jsx — shows at-a-glance stats for the hostel

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import api from '../api/axiosInstance'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts from multiple endpoints in parallel using Promise.all
        // This is faster than fetching them one by one sequentially
        const [studentsRes, roomsRes, feesRes, complaintsRes] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/rooms'),
          api.get('/fees?limit=1'),
          api.get('/complaints?limit=1'),
        ])

        const rooms = roomsRes.data.data || []
        const availableRooms = rooms.filter(r => r.status === 'Available').length

        setStats({
          totalStudents:   studentsRes.data.pagination?.total || 0,
          totalRooms:      rooms.length,
          availableRooms,
          pendingFees:     feesRes.data.pagination?.total || 0,
          openComplaints:  complaintsRes.data.pagination?.total || 0,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])  // [] = run once when component mounts

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getTimeOfDay()}, {user?.username}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening in your hostel today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/students">
          <StatCard label="Total Students" value={stats?.totalStudents}
                    icon="🎓" color="purple" />
        </Link>
        <Link to="/rooms">
          <StatCard label="Available Rooms" value={stats?.availableRooms}
                    sub={`of ${stats?.totalRooms} total`}
                    icon="🛏️" color="teal" />
        </Link>
        <Link to="/fees">
          <StatCard label="Pending Fees"  value={stats?.pendingFees}
                    icon="💰" color="amber" />
        </Link>
        <Link to="/complaints">
          <StatCard label="Open Complaints" value={stats?.openComplaints}
                    icon="🔧" color="red" />
        </Link>
      </div>

      {/* Quick links */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add student',   to: '/students',   icon: '➕' },
            { label: 'Record fee',    to: '/fees',       icon: '💳' },
            { label: 'Log attendance',to: '/attendance', icon: '✅' },
            { label: 'Post notice',   to: '/notices',    icon: '📢' },
          ].map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl
                         border border-gray-200 hover:border-primary-300
                         hover:bg-primary-50 transition-colors text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
