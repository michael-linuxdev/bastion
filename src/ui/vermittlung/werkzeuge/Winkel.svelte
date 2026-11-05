<script lang="ts">
  // Winkel (winkel@1): Winkel mit Bogen, auf Wunsch am Winkelmesser. Interaktiv mit Knöpfen
  // für größer und kleiner; die Winkelart steht dabei (VERMITTLUNG §2.3, ohne Ziehen).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import { geaendert, winkelart, winkelAus, winkelBild, type WinkelParameter } from './winkel';

  let { parameter, interaktiv = false }: { parameter: WinkelParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => winkelAus(parameter)));
  const b = $derived(winkelBild(zustand));
  const art = $derived(t(`werkzeug.winkel.art.${winkelart(zustand.grad)}`));
  const max = $derived(zustand.winkelmesser ? 180 : 360);
</script>

<figure class="winkel">
  {#if interaktiv}
    <p class="anleitung">{t('werkzeug.winkel.anleitung')}</p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv}
    <figcaption class="stand" aria-live="polite">
      <strong>{zustand.name} = {zustand.grad}°</strong> · {art}
    </figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="steuerung" role="group" aria-label={t('werkzeug.winkel.aendern')}>
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.winkel.kleiner')}
      disabled={zustand.grad <= 0}
      onclick={() => (zustand = geaendert(zustand, -zustand.schritt))}>−</button
    >
    <span class="wert">{zustand.grad}°</span>
    <button
      type="button"
      class="zweit"
      aria-label={t('werkzeug.winkel.groesser')}
      disabled={zustand.grad >= max}
      onclick={() => (zustand = geaendert(zustand, zustand.schritt))}>+</button
    >
  </div>
{/if}

<style>
  .winkel {
    margin: 0;
    margin-block: var(--abstand-s);
  }

  .bild {
    max-inline-size: 20rem;
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
    align-items: center;
    gap: var(--abstand-s);
  }

  .steuerung .zweit {
    min-inline-size: var(--ziel);
    font-size: 1.25rem;
  }

  .wert {
    min-inline-size: 3.5rem;
    text-align: center;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
