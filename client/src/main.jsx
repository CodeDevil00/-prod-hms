// main.jsx — the very first file React runs
//
// It does three things:
// 1. Imports the global CSS (Tailwind)
// 2. Wraps the app in context providers (Auth, Toast)
// 3. Mounts the React app into the <div id="root"> in index.html
//
// Provider order matters: inner providers can use outer ones.
// ToastProvider is inside AuthProvider so Toast can read auth if needed.

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import './index.css'                          // Tailwind base styles
import App              from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// document.getElementById('root') finds <div id="root"> in index.html
// createRoot().render() tells React to take control of that div
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode runs checks in development to catch bugs early.
        It renders components twice intentionally — don't be surprised
        if you see double console.log output in dev mode. */}
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
)
