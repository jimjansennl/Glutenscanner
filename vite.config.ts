import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }
import { execSync } from 'node:child_process'

function appVersion(): string {
  const date = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'Europe/Amsterdam' })
  let sha = process.env.VERCEL_GIT_COMMIT_SHA ?? ''
  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD').toString().trim()
    } catch {
      sha = ''
    }
  }
  return `${pkg.version} · ${date}${sha ? ` · ${sha.slice(0, 7)}` : ''}`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Echte app op het beginscherm: eigen icoon, schermvullend en offline bruikbaar.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Glutenscanner',
        short_name: 'Glutenscanner',
        description: 'Scan een barcode, etiket of menukaart en zie meteen of er gluten in zit.',
        lang: 'nl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // De app zelf (inclusief barcodelezer) staat meteen offline klaar.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
        // Tekstherkenning (±10 MB) pas bewaren bij de eerste foto, niet bij elk bezoek.
        globIgnores: ['tesseract/**'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Populaire producten voor scannen zonder internet (zie scripts/fetch-popular.mjs).
            urlPattern: ({ url }) => url.pathname.startsWith('/offline/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'offline-producten', expiration: { maxEntries: 2 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/tesseract/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tekstherkenning', expiration: { maxEntries: 20 } },
          },
          {
            // Eerder gescande producten: ook zonder internet weer op te zoeken.
            urlPattern: /^https:\/\/world\.openfoodfacts\.org\/api\/v2\/product\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'producten',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.href.startsWith('https://world.openfoodfacts.org/api/v2/search') && !url.searchParams.has('app'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'alternatieven',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 100, maxAgeSeconds: 14 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/images\.openfoodfacts\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'productfoto',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  define: {
    // Versie = datum van de build + korte code van de commit, zodat je ziet dat je de nieuwste hebt.
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
})
