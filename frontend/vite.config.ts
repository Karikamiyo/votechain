import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite — это сборщик. В режиме dev он поднимает свой сервер на 5173.
// Поскольку бэк на 8000, нужен прокси, чтобы /api/* шёл на бэк
// (иначе в браузере возникнут CORS-проблемы при разработке).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Алиас @ -> /src. Позволяет писать import Foo from '@/components/Foo'
    // вместо страшных '../../../components/Foo'.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // нужно для Docker (внутри контейнера слушать на всех интерфейсах)
    port: 5173,
    proxy: {
      // Все запросы к /api/* перенаправляются на Django (порт 8000).
      // В Docker имя хоста будет 'backend', сейчас — localhost.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
