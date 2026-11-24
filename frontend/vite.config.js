import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url && (req.url.startsWith('/api/docs') || req.url.startsWith('/api-docs'))) {
            return req.url; // Serve index.html from Vite frontend instead of proxying to backend!
          }
        }
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-icons')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'vendor-map';
          }
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/jszip') || id.includes('node_modules/qrcode')) {
            return 'vendor-utils';
          }
        }
      }
    }
  }
})
