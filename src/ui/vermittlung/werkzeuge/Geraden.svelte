<script lang="ts">
  // Geraden (geraden@1): Lage zweier Geraden als Bild; interaktiv wird h mit Knöpfen gedreht,
  // kurze Stücke lassen sich verlängern. Bedienung ohne Ziehen (VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    beschreibung,
    gedreht,
    geradenAus,
    geradenBild,
    lageVon,
    verlaengert,
    type GeradenParameter,
  } from './geraden';

  let { parameter, interaktiv = false }: { parameter: GeradenParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => geradenAus(parameter)));
  const b = $derived(geradenBild(zustand));
  const lage = $derived(t(`werkzeug.geraden.lage.${lageVon(zustand.winkel)}`));
</script>

<figure class="geraden">
  {#if interaktiv}
    <p class="anleitung">
      {t(zustand.kurz ? 'werkzeug.geraden.anleitung-kurz' : 'werkzeug.geraden.anleitung')}
    </p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv}
    <figcaption class="stand" aria-live="polite">
      {#if !zustand.kurz || zustand.verlaengert}
        <strong>{zustand.namen[0]} {t('werkzeug.geraden.und')} {zustand.namen[1]}: {lage}.</strong>
      {/if}
      {beschreibung(zustand)}
    </figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="steuerung" role="group" aria-label={t('werkzeug.geraden.drehen')}>
    {#if zustand.kurz}
      <button
        type="button"
        class="zweit"
        aria-pressed={zustand.verlaengert}
        onclick={() => (zustand = verlaengert(zustand, !zustand.verlaengert))}
        >{t(
          zustand.verlaengert ? 'werkzeug.geraden.kuerzen' : 'werkzeug.geraden.verlaengern',
        )}</button
      >
    {/if}
    {#if zustand.drehbar}
      <button
        type="button"
        class="zweit"
        aria-label={t('werkzeug.geraden.links')}
        onclick={() => (zustand = gedreht(zustand, zustand.schritt))}>↶</button
      >
      <span class="winkel">{zustand.winkel}°</span>
      <button
        type="button"
        class="zweit"
        aria-label={t('werkzeug.geraden.rechts')}
        onclick={() => (zustand = gedreht(zustand, -zustand.schritt))}>↷</button
      >
    {/if}
  </div>
{/if}

<style>
  .geraden {
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
  }

  .steuerung {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
  }

  .steuerung .zweit {
    min-inline-size: var(--ziel);
    font-size: 1.25rem;
  }

  .winkel {
    min-inline-size: 3rem;
    text-align: center;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
