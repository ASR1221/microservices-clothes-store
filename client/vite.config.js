import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const env = loadEnv(
  'all',
  "",
);
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/user': env.VITE_USER_SERVICE_URL,
      '/api/items': env.VITE_ITEM_SERVICE_URL,
      '/api/cart': env.VITE_CART_SERVICE_URL,
      '/api/order': env.VITE_ORDER_SERVICE_URL,
      '/api/admin': env.VITE_ADMIN_SERVICE_URL,
      '/images': env.VITE_ITEM_SERVICE_URL,
    },
  },
});
