import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173, // React dev server runs here

    // The proxy is the most important setting for development.
    //
    // Problem: React runs on port 5173, Express runs on port 3000.
    // When React calls fetch('/api/students'), the browser sends it
    // to port 5173 — but our API is on 3000. This causes an error.
    //
    // Solution: Tell Vite "any request starting with /api,
    // forward it to http://localhost:3000".
    // The browser sees it as the same origin (no CORS issue).
    // In production, Nginx or Express itself handles this.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true, // changes the Host header to match the target
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true, // also proxy uploaded files (student photos)
      },
    },
  },

  build: {
    outDir: 'dist', // production build goes into client/dist/
  },
})
