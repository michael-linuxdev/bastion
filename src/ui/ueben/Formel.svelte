<script lang="ts">
  // Eine Formel, die die eigene Teilmenge nicht kann, mit KaTeX gesetzt (T-22). Bis KaTeX
  // geladen ist, steht das LaTeX als Text da; das dauert nur beim ersten Mal einen Augenblick.
  import { formelHtml, katexLaden } from './formel';

  let { tex }: { tex: string } = $props();
</script>

{#await katexLaden()}
  <span class="formel laedt">{tex}</span>
{:then k}
  <!-- HTML nur aus KaTeX mit trust: false, siehe formel.ts -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <span class="formel">{@html formelHtml(k, tex)}</span>
{:catch}
  <span class="formel">{tex}</span>
{/await}

<style>
  .formel {
    white-space: nowrap;
  }
  .laedt {
    color: var(--farbe-text-leise);
  }
</style>
