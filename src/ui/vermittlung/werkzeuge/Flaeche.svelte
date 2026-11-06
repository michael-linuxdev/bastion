<script lang="ts">
  // Fläche (flaeche@1): Rechteck oder Figur aus Rechtecken mit Maßen am Rand. Interaktiv legen
  // Knöpfe Reihen von Einheitsquadraten aus, und bei mehreren Rechtecken zeigt ein Knopf die
  // Zerlegung (ohne Ziehen, VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    ausgelegt,
    figurHoehe,
    flaecheAus,
    flaecheBild,
    reihenText,
    umgeschaltet,
    type FlaecheParameter,
  } from './flaeche';

  let { parameter, interaktiv = false }: { parameter: FlaecheParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => flaecheAus(parameter)));
  const b = $derived(flaecheBild(zustand));
  const mehrere = $derived(zustand.rechtecke.length > 1);
</script>

<figure class="flaeche">
  {#if interaktiv}
    <p class="anleitung">
      {t(
        zustand.reihen !== undefined
          ? 'werkzeug.flaeche.anleitung'
          : 'werkzeug.flaeche.anleitung-zerlegen',
      )}
    </p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv && zustand.reihen !== undefined}
    <figcaption class="stand" aria-live="polite"><strong>{reihenText(zustand)}</strong></figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="steuerung" role="group" aria-label={t('werkzeug.flaeche.aendern')}>
    {#if zustand.reihen !== undefined}
      <button
        type="button"
        class="zweit"
        disabled={zustand.reihen <= 0}
        onclick={() => (zustand = ausgelegt(zustand, -1))}>{t('werkzeug.flaeche.weniger')}</button
      >
      <button
        type="button"
        class="zweit"
        disabled={zustand.reihen >= figurHoehe(zustand)}
        onclick={() => (zustand = ausgelegt(zustand, 1))}>{t('werkzeug.flaeche.mehr')}</button
      >
    {/if}
    {#if mehrere}
      <button
        type="button"
        class="zweit"
        aria-pressed={zustand.zerlegt}
        onclick={() => (zustand = umgeschaltet(zustand))}>{t('werkzeug.flaeche.zerlegen')}</button
      >
    {/if}
  </div>
{/if}

<style>
  .flaeche {
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
