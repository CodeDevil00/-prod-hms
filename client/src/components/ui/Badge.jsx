// Badge.jsx — coloured pill for status values like Active, Paid, Pending

const COLORS = {
  // Student status
  Active:       'bg-green-100  text-green-800',
  Inactive:     'bg-gray-100   text-gray-600',
  Graduated:    'bg-blue-100   text-blue-800',
  // Fee status
  Paid:         'bg-green-100  text-green-800',
  Pending:      'bg-amber-100  text-amber-800',
  Overdue:      'bg-red-100    text-red-800',
  // Complaint status
  Open:         'bg-red-100    text-red-700',
  'In-Progress':'bg-amber-100  text-amber-800',
  Resolved:     'bg-green-100  text-green-700',
  Closed:       'bg-gray-100   text-gray-600',
  // Room status
  Available:    'bg-green-100  text-green-800',
  Full:         'bg-red-100    text-red-800',
  Maintenance:  'bg-amber-100  text-amber-800',
  // Priority
  High:         'bg-red-100    text-red-800',
  Medium:       'bg-amber-100  text-amber-800',
  Low:          'bg-blue-100   text-blue-800',
  // Roles
  Admin:        'bg-purple-100 text-purple-800',
  Warden:       'bg-blue-100   text-blue-800',
  Student:      'bg-teal-100   text-teal-800',
}

export default function Badge({ label, className = '' }) {
  const colorClass = COLORS[label] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
