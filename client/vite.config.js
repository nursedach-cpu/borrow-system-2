import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png', 'app-icon.svg'],
      manifest: {
        name: 'ระบบยืม-คืนอุปกรณ์',
        short_name: 'ยืม-คืน',
        description: 'ระบบยืม-คืนและติดตามเครื่องมือ',
        lang: 'th',
        theme_color: '#6a2c8f',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Don't precache API responses; cache built static assets only.
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            // Cache uploaded images (Cloudinary/local) for quick reloads.
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads') || url.hostname.includes('cloudinary'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'item-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
