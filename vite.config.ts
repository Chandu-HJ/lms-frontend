
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/lms-frontend/",
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
})
