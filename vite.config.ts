import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types')
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    hmr: {
      overlay: true,
      port: 5174,
      clientPort: 5174
    },
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        timeout: 10000
      }
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    },
    cors: true,
    force: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false,
    target: 'esnext',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-core': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    assetsInlineLimit: 4096,
    cssCodeSplit: true
  },
  css: {
    postcss: './postcss.config.js'
  },
  publicDir: 'public',
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'lucide-react'
    ],
    exclude: ['electron']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: true
  },
  clearScreen: false,
  logLevel: 'info'
}); 