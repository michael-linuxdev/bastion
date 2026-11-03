<script lang="ts">
  // O6: ein Kopf für alle Unterseiten außerhalb des Lernpfads (Mehr, Elternbereich, Über mich,
  // Sicherung): Zurück mit Symbol, große Überschrift in der Akzentfarbe, optional Marke und Hinweis.
  import type { Snippet } from 'svelte';
  import ZurueckKnopf from './ZurueckKnopf.svelte';

  let {
    titel,
    marke = undefined,
    onzurueck,
    children,
  }: {
    titel: string;
    /** kleine Marke über der Überschrift, z. B. „Nur für Erwachsene“ */
    marke?: string | undefined;
    onzurueck: () => void;
    /** leiser Hinweis unter der Überschrift */
    children?: Snippet;
  } = $props();
</script>

<header class="seitenkopf">
  <ZurueckKnopf onclick={onzurueck} />
  {#if marke}<p class="marke" role="note">{marke}</p>{/if}
  <h2>{titel}</h2>
  {@render children?.()}
</header>

<style>
  .seitenkopf {
    display: grid;
    gap: 0.35rem;
    margin-block-end: var(--abstand-s);
  }
  .marke {
    margin: 0;
    justify-self: start;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text-leise);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  h2 {
    margin: 0;
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    line-height: 1.15;
    color: var(--farbe-akzent);
  }
  .seitenkopf :global(p:not(.marke)) {
    margin: 0;
    color: var(--farbe-text-leise);
  }
</style>
