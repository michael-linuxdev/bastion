<script lang="ts">
  // Anleitungsbild (anleitungsbild@1): ein Bild aus einer Zeichen-Anleitung als Bild der
  // Erstvermittlung. Passt die Angabe nicht, erscheint nichts.
  import { anleitungsbild, type AnleitungsbildParameter } from './anleitungsbild';

  let { parameter }: { parameter: AnleitungsbildParameter } = $props();
  const b = $derived(anleitungsbild(parameter));
</script>

{#if b}
  <div class="anleitungsbild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
{/if}

<style>
  .anleitungsbild {
    max-inline-size: 18rem;
    margin-block: var(--abstand-s);
    color: var(--farbe-text);
  }

  .anleitungsbild :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }
</style>
