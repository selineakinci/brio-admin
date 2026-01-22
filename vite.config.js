import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://macbook-pro-de-mathis.local:8000',
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
