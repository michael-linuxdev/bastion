<script lang="ts">
  // Dreieck (dreieck@1): rechtwinkliges Dreieck als Bild in der Erstvermittlung (Pythagoras,
  // Trigonometrie). Nutzt dieselbe Skizze wie die Aufgaben, damit beides gleich aussieht.
  import { dreieckBild, type DreieckParameter } from './dreieck';

  let { parameter }: { parameter: DreieckParameter } = $props();
  const b = $derived(dreieckBild(parameter));
</script>

<div class="dreieck" role="img" aria-label={b.beschreibung.de}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
  {@html b.svg}
</div>

<style>
  .dreieck {
    max-inline-size: 20rem;
    margin-block: var(--abstand-s);
    color: var(--farbe-text);
  }

  .dreieck :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }
</style>
