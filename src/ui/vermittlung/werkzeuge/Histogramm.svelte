<script lang="ts">
  // Histogramm (histogramm@1): Säulen über Klassen als Bild in der Erstvermittlung (Statistik).
  // Nutzt dieselbe Darstellung wie die Aufgaben.
  import { histogrammBild, type HistogrammParameter } from './histogramm';

  let { parameter }: { parameter: HistogrammParameter } = $props();
  const b = $derived(histogrammBild(parameter));
</script>

<div class="histogramm" role="img" aria-label={b.beschreibung.de}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
  {@html b.svg}
</div>

<style>
  .histogramm {
    max-inline-size: 20rem;
    margin-block: var(--abstand-s);
    color: var(--farbe-text);
  }

  .histogramm :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }
</style>
