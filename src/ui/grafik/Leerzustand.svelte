<script lang="ts">
  /**
   * Einheitlicher Leerzustand (Design-Ideen K52): Bildzeichen + Satz + optionaler Knopf.
   */
  import Symbol, { type SymbolName } from './Symbol.svelte';

  let {
    symbol = 'stand',
    text,
    knopf,
    onknopf,
  }: {
    symbol?: SymbolName;
    text: string;
    knopf?: string;
    onknopf?: () => void;
  } = $props();
</script>

<div class="leer" role="status">
  <span class="zeichen" aria-hidden="true"><Symbol name={symbol} /></span>
  <p>{text}</p>
  {#if knopf && onknopf}
    <button type="button" class="haupt" onclick={onknopf}>{knopf}</button>
  {/if}
</div>

<style>
  .leer {
    display: grid;
    justify-items: start;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche-leise);
  }

  .zeichen {
    display: grid;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-akzent);
    box-shadow: 0 1px 4px var(--farbe-schatten);
  }

  p {
    margin: 0;
    color: var(--farbe-text);
    max-inline-size: 36rem;
  }
</style>
