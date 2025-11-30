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
          // React core libraries
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          // Redux state management
          'vendor-redux': [
            '@reduxjs/toolkit',
            'react-redux',
            'redux-persist'
          ],
          // UI and animation libraries
          'vendor-ui': [
            'framer-motion',
            'lucide-react',
            'notistack'
          ],
          // Form libraries
          'vendor-forms': [
            'formik',
            'yup'
          ]
        }
      }
    },
    // Increase chunk size warning limit since we're properly splitting
    chunkSizeWarningLimit: 1000
  }
})
