import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Nur Svelte-5-Schreibweise (Runes) erlaubt – ARCHITEKTUR T-3.
    // `export let` und `$:` sind damit Compilerfehler.
    runes: true,
  },
  // Jede Compilerwarnung bricht den Build ab – darunter veraltete Syntax
  // wie `on:click` und Barrierefreiheitshinweise (A5).
  onwarn(warning) {
    throw new Error(`Svelte-Warnung als Fehler (${warning.code}): ${warning.message}`);
  },
};
