import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      port: 5173,
    }
  },
  // Fix PWA plugin issues and define global variables
  define: {
    __VITE_PWA__: false,
    global: 'globalThis',
  }
})