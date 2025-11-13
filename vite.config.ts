import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// Always use /lifer/ for GitHub Pages deployment
// For local dev, this works fine with the dev server
const baseUrl = '/lifer/'

export default defineConfig({
  base: baseUrl,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'robots.txt'],
      manifest: {
        name: 'Lifer - Life Tracker',
        short_name: 'Lifer',
        description: 'High-leverage life management system',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        scope: baseUrl,
        start_url: baseUrl,
        icons: [
          {
            src: `${baseUrl}icons/icon-192.svg`,
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: `${baseUrl}icons/icon-512.svg`,
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: `${baseUrl}icons/apple-touch-icon.svg`,
            sizes: '180x180',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['svelte'],
          'charts': ['chart.js'],
          'db': ['idb-keyval']
        }
      }
    }
  }
})
