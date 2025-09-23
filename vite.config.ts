import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      port: 5173,
    }
  },
  // Fix PWA plugin issues
  define: {
    __VITE_PWA__: false
  }
})