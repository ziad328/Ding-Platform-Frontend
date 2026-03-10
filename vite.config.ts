import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
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
