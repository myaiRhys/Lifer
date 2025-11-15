import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// Use capital L to match GitHub Pages URL
// GitHub provides: https://myairhys.github.io/Lifer/
const baseUrl = '/Lifer/'

export default defineConfig({
  base: baseUrl,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'robots.txt'],
      manifest: {
        name: 'Lifer - Atomic Habits System',
        short_name: 'Lifer',
        description: 'Complete behavioral change system with gamification, habit tracking, and productivity tools based on James Clear, Robert Greene, and David Goggins principles',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: baseUrl,
        start_url: baseUrl,
        categories: ['productivity', 'lifestyle', 'health-fitness', 'education'],
        icons: [
          {
            src: `${baseUrl}icons/icon-192.svg`,
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: `${baseUrl}icons/icon-512.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: `${baseUrl}icons/apple-touch-icon.svg`,
            sizes: '180x180',
            type: 'image/svg+xml'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your main dashboard',
            url: `${baseUrl}#dashboard`,
            icons: [{ src: `${baseUrl}icons/icon-192.svg`, sizes: '192x192' }]
          },
          {
            name: 'Add Task',
            short_name: 'Task',
            description: 'Create a new task',
            url: `${baseUrl}#tasks`,
            icons: [{ src: `${baseUrl}icons/icon-192.svg`, sizes: '192x192' }]
          },
          {
            name: 'Practices',
            short_name: 'Habits',
            description: 'Log your daily practices',
            url: `${baseUrl}#practices`,
            icons: [{ src: `${baseUrl}icons/icon-192.svg`, sizes: '192x192' }]
          },
          {
            name: 'Focus Timer',
            short_name: 'Focus',
            description: 'Start a focus session',
            url: `${baseUrl}#focus`,
            icons: [{ src: `${baseUrl}icons/icon-192.svg`, sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
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
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigateFallback: null, // Prevent navigation fallback for offline - let app handle it
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false // Disable in dev for faster reloads
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
