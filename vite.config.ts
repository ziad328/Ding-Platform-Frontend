import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // HTTP API calls: /api/v1/* → https://ding-platform-backend.onrender.com/api/v1/*
      '/api/v1': {
        target: 'https://ding-platform-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket: /socket.io/* → backend (for dev socket connections)
      '/socket.io': {
        target: 'https://ding-platform-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router': ['react-router-dom'],
          'animation': ['framer-motion', 'motion'],
          'state': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'forms': ['formik', 'yup'],
          'ui': ['notistack', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
