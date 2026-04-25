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
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Extract exact package name (supports scoped packages like @reduxjs/toolkit)
          const match = id.match(/node_modules[/\\]((@[^/\\]+[/\\])?[^/\\]+)/)
          if (!match) return
          const pkg = match[1].replace(/\\/g, '/')

          if (['react', 'react-dom', 'scheduler'].includes(pkg))
            return 'react-vendor'
          if (['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-persist', 'immer'].includes(pkg))
            return 'state'
          if (['react-router-dom', 'react-router', '@remix-run/router'].includes(pkg))
            return 'router'
          if (['framer-motion', 'motion'].includes(pkg))
            return 'animation'
          if (['formik', 'yup'].includes(pkg))
            return 'forms'
          if (['notistack', 'lucide-react'].includes(pkg))
            return 'ui'
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
