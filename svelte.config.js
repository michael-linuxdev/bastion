import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Nur Svelte-5-Schreibweise (Runes) erlaubt – ARCHITEKTUR T-3.
    runes: true,
  },
};
