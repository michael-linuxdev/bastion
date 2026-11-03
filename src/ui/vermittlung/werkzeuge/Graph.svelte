<script lang="ts">
  // Graph (graph@1): Funktionsgraphen als Bild; interaktiv mit Reglern für a, d und e
  // der ersten Kurve (Bedarfsliste B8 „Parameter am Graphen“).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    REGLER,
    graphBild,
    kurvenAus,
    reglerAus,
    term,
    type GraphParameter,
    type ReglerName,
  } from './graph';

  let { parameter, interaktiv = false }: { parameter: GraphParameter; interaktiv?: boolean } =
    $props();

  const start = untrack(() => kurvenAus(parameter));
  const erste = start[0] ?? kurvenAus({})[0];
  let werte = $state({ a: erste?.a ?? 1, d: erste?.d ?? 0, e: erste?.e ?? 0 });
  const regler = $derived(interaktiv ? reglerAus(parameter) : []);
  const kurven = $derived(
    interaktiv && erste ? [{ ...erste, ...werte }, ...start.slice(1)] : kurvenAus(parameter),
  );
  const b = $derived(graphBild(parameter, kurven));
  // Term unter dem Bild nur bei genau einer durchgezogenen Kurve; sonst nennt ihn die Beschreibung
  const durchgezogen = $derived(kurven.filter((k) => !k.vergleich));
  const haupt = $derived(durchgezogen.length === 1 ? durchgezogen[0] : undefined);
</script>

<figure class="graph">
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if haupt}
    <figcaption class="term" aria-live={interaktiv ? 'polite' : undefined}>
      {term(haupt)}
    </figcaption>
  {/if}
</figure>
{#if interaktiv && regler.length > 0}
  <div class="regler" role="group" aria-label={t('werkzeug.graph.regler')}>
    <p class="hinweis">{t('werkzeug.graph.regler')}</p>
    {#each regler as name (name)}
      {@const r = REGLER[name as ReglerName]}
      <label>
        <span class="name">{name} = {String(werte[name]).replace('.', ',').replace('-', '−')}</span>
        <input type="range" min={r.min} max={r.max} step={r.schritt} bind:value={werte[name]} />
      </label>
    {/each}
  </div>
{/if}

<style>
  .graph {
    margin: 0;
    margin-block: var(--abstand-s);
  }

  .bild {
    max-inline-size: 22rem;
    color: var(--farbe-text);
  }

  .bild :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  .term {
    font-weight: 700;
    margin-block-start: var(--abstand-s);
  }

  .regler {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 22rem;
  }

  .regler label {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    align-items: center;
    gap: var(--abstand-s);
  }

  .regler input {
    inline-size: 100%;
    accent-color: var(--farbe-akzent-warm);
  }

  .hinweis {
    margin: 0;
    color: var(--farbe-text-leise);
  }

  .name {
    font-variant-numeric: tabular-nums;
  }
</style>
