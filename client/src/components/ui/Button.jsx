// Button.jsx — a single reusable button that handles all variants
// Instead of repeating className="bg-blue-600 text-white..." everywhere,
// you write <Button variant="primary">Save</Button>
// and this component applies the right Tailwind classes automatically.

const VARIANTS = {
  primary: 'bg-primary-700 text-white hover:bg-primary-600 focus:ring-primary-500',
  danger:  'bg-red-600   text-white hover:bg-red-700    focus:ring-red-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400 bg-white',
  ghost:   'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  onClick,
  type     = 'button',
  className = '',
  ...props          // spread any extra props (e.g. aria-label)
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {/* Show a spinner when loading — replaces the button text */}
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
