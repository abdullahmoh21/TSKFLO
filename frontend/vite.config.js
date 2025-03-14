import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow connections from any IP
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:3200',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 80,
    host: '0.0.0.0',
  }
})
