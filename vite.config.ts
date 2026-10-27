import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Unterordner, unter dem die App ausgeliefert wird (z. B. "/bastion/" auf GitHub Pages).
  base: process.env['BASE_PATH'] ?? '/',
  plugins: [
    svelte(),
    VitePWA({
      // Update nur nach Zustimmung – nie mitten in einer Sitzung (PLAN 0.8).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Bastion',
        short_name: 'Bastion',
        description: 'Offline-fähige Lern-App – baue deine Bastion.',
        lang: 'de',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f7f4ee',
        theme_color: '#8a4b14',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App-Hülle vollständig vorab speichern: danach startet sie ohne Netz (A1).
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    target: 'es2022',
  },
  test: {
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
    // Der dauerhafte Modul-Zwischenspeicher bemerkt neue Dateien hinter
    // import.meta.glob (src/generators/index.ts) nicht – lieber verlässlich als schnell.
    fsModuleCache: false,
  },
});
