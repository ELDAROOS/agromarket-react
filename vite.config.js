import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    coverage: { provider: 'v8', include: ['src/**/*.{js,jsx}'], exclude: ['src/main.jsx', 'src/test/**'], reporter: ['text', 'html', 'json-summary'] },
  },
  server: { port: 5173, strictPort: true },
})
