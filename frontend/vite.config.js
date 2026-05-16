import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/clusters': 'http://localhost:8000',
      '/members': 'http://localhost:8000',
      '/job-seekers': 'http://localhost:8000',
      '/matching': 'http://localhost:8000',
      '/financial': 'http://localhost:8000',
      '/sim-transfer': 'http://localhost:8000',
      '/webhooks': 'http://localhost:8000',
    }
  }
})
