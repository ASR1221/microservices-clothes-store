import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/user': "http://localhost:3001",
      '/api/items': "http://localhost:3002",
      '/api/cart': "http://localhost:3003",
      '/api/order': "http://localhost:3004",
      '/api/admin': "http://localhost:3005",
      '/images': "http://localhost:3002",
    },
  },
});
