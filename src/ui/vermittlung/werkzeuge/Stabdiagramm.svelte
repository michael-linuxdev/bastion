<script lang="ts">
  // Stabdiagramm (stabdiagramm@1): Verteilung einer Zufallsgröße als Bild in der Erstvermittlung.
  // Nutzt dieselbe Darstellung wie die Aufgaben.
  import { stabdiagrammBild, type StabdiagrammParameter } from './stabdiagramm';

  let { parameter }: { parameter: StabdiagrammParameter } = $props();
  const b = $derived(stabdiagrammBild(parameter));
</script>

<div class="stabdiagramm" role="img" aria-label={b.beschreibung.de}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
  {@html b.svg}
</div>

<style>
  .stabdiagramm {
    max-inline-size: 20rem;
    margin-block: var(--abstand-s);
    color: var(--farbe-text);
  }

  .stabdiagramm :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }
</style>
