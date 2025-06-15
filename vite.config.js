import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist','pdfjs-dist/build/pdf.worker.min.mjs', 'pdfjs-dist/build/pdf.mjs'],
  },
    assetsInclude: ['**/pdfjs-dist/build/*.mjs'],
server: {
    fs: {
      strict: false // Разрешаем доступ к node_modules
    }
  }
})
