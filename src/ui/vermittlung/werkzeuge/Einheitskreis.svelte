<script lang="ts">
  // Einheitskreis (einheitskreis@1): Punkt P zum Winkel α, sin und cos als Strecken.
  // Interaktiv mit Regler für den Winkel (Pfeiltasten genügen) und Umschalter Grad/Bogenmaß.
  import { untrack } from 'svelte';
  import { einheitskreisBild } from '../../../generators/mathematik/trigonometrische-funktionen/einheitskreis';
  import { t } from '../../texte/texte';
  import { anzeige, einheitskreisAus, type EinheitskreisParameter } from './einheitskreis';

  let {
    parameter,
    interaktiv = false,
  }: { parameter: EinheitskreisParameter; interaktiv?: boolean } = $props();

  const start = untrack(() => einheitskreisAus(parameter));
  let winkel = $state(start.winkel);
  let einheit = $state(start.einheit);
  const b = $derived(
    einheitskreisBild(winkel, {
      werte: start.werte,
      ...(start.vergleich === undefined ? {} : { vergleich: start.vergleich }),
    }),
  );
  const a = $derived(anzeige(winkel, einheit));
  const quadrantText = $derived(
    a.quadrant === 0
      ? t('werkzeug.einheitskreis.achse')
      : `${a.quadrant}. ${t('werkzeug.einheitskreis.quadrant')}`,
  );
</script>

<figure class="einheitskreis">
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv}
    <figcaption class="werte" aria-live="polite">
      <span>α = {a.winkel}</span>
      {#if start.werte}
        <span>sin α = {a.sin}</span>
        <span>cos α = {a.cos}</span>
      {/if}
      <span class="leise">{quadrantText}</span>
    </figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="regler" role="group" aria-label={t('werkzeug.einheitskreis.regler')}>
    <p class="hinweis">{t('werkzeug.einheitskreis.regler')}</p>
    <label>
      <span class="name">α = {a.winkel}</span>
      <input
        type="range"
        min="0"
        max="360"
        step={start.schritt}
        bind:value={winkel}
        aria-valuetext={a.winkel}
      />
    </label>
    <div class="einheit" role="group" aria-label={t('werkzeug.einheitskreis.einheit')}>
      <button
        type="button"
        class="zweit"
        aria-pressed={einheit === 'grad'}
        onclick={() => (einheit = 'grad')}
      >
        {t('werkzeug.einheitskreis.grad')}
      </button>
      <button
        type="button"
        class="zweit"
        aria-pressed={einheit === 'bogen'}
        onclick={() => (einheit = 'bogen')}
      >
        {t('werkzeug.einheitskreis.bogen')}
      </button>
    </div>
  </div>
{/if}

<style>
  .einheitskreis {
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

  .werte {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s) var(--abstand-m);
    margin-block-start: var(--abstand-s);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .leise,
  .hinweis {
    color: var(--farbe-text-leise);
    font-weight: 400;
  }

  .hinweis {
    margin: 0;
  }

  .regler {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 22rem;
  }

  .regler label {
    display: grid;
    grid-template-columns: 6rem 1fr;
    align-items: center;
    gap: var(--abstand-s);
  }

  .regler input {
    inline-size: 100%;
    accent-color: var(--farbe-akzent-warm);
  }

  .name {
    font-variant-numeric: tabular-nums;
  }

  .einheit {
    display: flex;
    gap: var(--abstand-s);
  }

  .einheit button[aria-pressed='true'] {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
  }
</style>
