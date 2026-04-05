// StatCard.jsx — a metric card for the dashboard
// Shows a number (e.g. "120") with a label ("Total Students")
// and an optional trend indicator.

export default function StatCard({ label, value, icon, color = 'purple', sub }) {
  const COLORS = {
    purple: { bg: 'bg-purple-50',  icon: 'bg-purple-100 text-purple-700', text: 'text-purple-700' },
    teal:   { bg: 'bg-teal-50',    icon: 'bg-teal-100   text-teal-700',   text: 'text-teal-700'   },
    amber:  { bg: 'bg-amber-50',   icon: 'bg-amber-100  text-amber-700',  text: 'text-amber-700'  },
    red:    { bg: 'bg-red-50',     icon: 'bg-red-100    text-red-700',    text: 'text-red-700'    },
    blue:   { bg: 'bg-blue-50',    icon: 'bg-blue-100   text-blue-700',   text: 'text-blue-700'   },
    green:  { bg: 'bg-green-50',   icon: 'bg-green-100  text-green-700',  text: 'text-green-700'  },
  }
  const c = COLORS[color] || COLORS.purple

  return (
    <div className={`card p-5 ${c.bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${c.icon} text-2xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
