import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js', // Подключаем PostCSS конфигурацию
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    pdfjs: ['pdfjs-dist'],
                },
            },
        },
    },
    base: '/pdf_to_base64/',
    build: {
        outDir: 'dist',
        assetsDir: './', // Важно для GitHub Pages
    },
});
