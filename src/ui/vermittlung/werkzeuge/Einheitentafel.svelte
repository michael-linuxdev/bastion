<script lang="ts">
  // Einheitentafel (einheitentafel@1): Stellenwerttafel für Größen. Interaktiv wählt ein Knopf
  // je Einheit, wo das Komma steht; fehlende Stellen füllt die Tafel mit 0 (ohne Ziehen,
  // VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    einheitentafelAus,
    einheitentafelBild,
    gelesenIn,
    lesungText,
    type EinheitentafelParameter,
  } from './einheitentafel';

  let {
    parameter,
    interaktiv = false,
  }: { parameter: EinheitentafelParameter; interaktiv?: boolean } = $props();

  let zustand = $state(untrack(() => einheitentafelAus(parameter)));
  const b = $derived(einheitentafelBild(zustand, !interaktiv));
  const stand = $derived(lesungText(zustand) ?? t('werkzeug.einheitentafel.tippen'));
</script>

<figure class="einheitentafel">
  {#if interaktiv}
    <p class="anleitung">{t('werkzeug.einheitentafel.anleitung')}</p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv}
    <figcaption class="stand" aria-live="polite"><strong>{stand}</strong></figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="steuerung" role="group" aria-label={t('werkzeug.einheitentafel.waehlen')}>
    {#each zustand.einheiten as einheit, i (i)}
      <button
        type="button"
        class="zweit"
        aria-pressed={zustand.ziel === i}
        aria-label={`${t('werkzeug.einheitentafel.lesen-in')} ${einheit.name}`}
        onclick={() => (zustand = gelesenIn(zustand, i))}>{einheit.name}</button
      >
    {/each}
  </div>
{/if}

<style>
  .einheitentafel {
    margin: 0;
    margin-block: var(--abstand-s);
  }

  .bild {
    max-inline-size: 24rem;
    color: var(--farbe-text);
  }

  .bild :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  .anleitung,
  .stand {
    margin-block: var(--abstand-s);
    color: var(--farbe-text-leise);
  }

  .stand strong {
    color: var(--farbe-text);
    font-variant-numeric: tabular-nums;
  }

  .steuerung {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .steuerung .zweit {
    min-inline-size: var(--ziel);
  }

  .steuerung .zweit[aria-pressed='true'] {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
  }
</style>
