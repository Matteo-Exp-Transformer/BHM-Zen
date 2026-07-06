/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // PWA "banco di lavoro" (§13.3): app pensata per restare aperta al banco,
      // perfetta anche su mobile. Manifest minimo; icone reali col lavoro UI.
      manifest: {
        name: 'BHM — Business HACCP Manager',
        short_name: 'BHM',
        description: 'Il diario di lavoro HACCP del tuo ristorante',
        lang: 'it',
        display: 'standalone',
        start_url: '/',
        background_color: '#faf7f2',
        theme_color: '#b8552f',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // docs/ contiene artefatti storici Fase 3 (test archiviati) — non sono test del progetto
    exclude: ['node_modules/**', 'dist/**', 'docs/**'],
  },
})
