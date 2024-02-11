import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/user': "http://ms-asr-store-user-deployment",
      '/api/items': "http://ms-asr-store-item-deployment",
      '/api/cart': "http://ms-asr-store-cart-deployment",
      '/api/order': "http://ms-asr-store-order-deployment",
      '/api/admin': "http://ms-asr-store-admin-deployment",
      '/images': "http://ms-asr-store-item-deployment",
    },
  },
});
