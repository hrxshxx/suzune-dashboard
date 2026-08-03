import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // In dev the API runs as a separate process; proxy so cookies stay same-origin.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API ?? 'http://localhost:3099',
        changeOrigin: false,
      },
    },
  },
  plugins: [react()],
})
