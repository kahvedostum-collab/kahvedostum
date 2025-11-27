import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Source map'leri production'da kapat (kod gizliliği)
    sourcemap: false,

    // Terser ile minification ve obfuscation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },

    // Chunk boyut uyarı limiti (KB)
    chunkSizeWarningLimit: 500,

    // Rollup optimizasyonları
    rollupOptions: {
      output: {
        // Manuel chunk ayırma (vendor splitting)
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['lucide-react', 'react-toastify', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
        // Chunk dosya isimlendirme (cache busting)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // CSS kod bölme
    cssCodeSplit: true,

    // Asset inline limiti (4KB altı inline olur)
    assetsInlineLimit: 4096,
  },
})
