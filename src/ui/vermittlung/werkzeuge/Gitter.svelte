<script lang="ts">
  // Gitter (gitter@1): Koordinatensystem oder Rasterpapier mit Punkten und Figuren. Interaktiv
  // wird ein Punkt mit vier Knöpfen bewegt, sein Bildpunkt wandert mit (ohne Ziehen, §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    bewegt,
    bildpunkt,
    gitterAus,
    gitterBild,
    koordinaten,
    type GitterParameter,
  } from './gitter';

  let { parameter, interaktiv = false }: { parameter: GitterParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => gitterAus(parameter)));
  const b = $derived(gitterBild(zustand));
  const bp = $derived(bildpunkt(zustand));
  const bpImGitter = $derived(
    bp !== undefined && bp.x >= 0 && bp.y >= 0 && bp.x <= zustand.xmax && bp.y <= zustand.ymax,
  );
</script>

<figure class="gitter">
  {#if interaktiv && zustand.beweglich}
    <p class="anleitung">
      {t(bp ? 'werkzeug.gitter.anleitung-bild' : 'werkzeug.gitter.anleitung')}
    </p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv && zustand.beweglich}
    <figcaption class="stand" aria-live="polite">
      <strong>{zustand.beweglich.name}{koordinaten(zustand.beweglich)}</strong>
      {#if bp}
        · <strong>{bp.name}{bpImGitter ? koordinaten(bp) : ''}</strong>
        {#if !bpImGitter}{t('werkzeug.gitter.ausserhalb')}{/if}
      {/if}
    </figcaption>
  {/if}
</figure>
{#if interaktiv && zustand.beweglich}
  <div class="steuerung" role="group" aria-label={t('werkzeug.gitter.bewegen')}>
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.gitter.nach-links')}
      disabled={zustand.beweglich.x <= 0}
      onclick={() => (zustand = bewegt(zustand, -1, 0))}>←</button
    >
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.gitter.nach-rechts')}
      disabled={zustand.beweglich.x >= zustand.xmax}
      onclick={() => (zustand = bewegt(zustand, 1, 0))}>→</button
    >
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.gitter.nach-oben')}
      disabled={zustand.beweglich.y >= zustand.ymax}
      onclick={() => (zustand = bewegt(zustand, 0, 1))}>↑</button
    >
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.gitter.nach-unten')}
      disabled={zustand.beweglich.y <= 0}
      onclick={() => (zustand = bewegt(zustand, 0, -1))}>↓</button
    >
  </div>
{/if}

<style>
  .gitter {
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
    font-size: 1.25rem;
  }
</style>
