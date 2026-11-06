<script lang="ts">
  // Uhr (uhr@1): Zeigeruhr, mit Ende zwei Uhren und auf Wunsch die Zeitleiste in Etappen.
  // Interaktiv stellen Knöpfe die Uhr (das Ende) vor und zurück (ohne Ziehen, VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import { gestellt, standText, uhrAus, uhrBild, type UhrParameter } from './uhr';

  let { parameter, interaktiv = false }: { parameter: UhrParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => uhrAus(parameter)));
  const b = $derived(uhrBild(zustand));
  const stand = $derived(standText(zustand));
  const jetzt = $derived(zustand.bis ?? zustand.von);
  const untergrenze = $derived(zustand.bis === undefined ? 0 : zustand.von);
  const knoepfe = $derived([
    { minuten: -60, zeichen: '− 1 h', name: t('werkzeug.uhr.stunde-zurueck') },
    {
      minuten: -zustand.schritt,
      zeichen: `− ${zustand.schritt} min`,
      name: `${zustand.schritt} ${t('werkzeug.uhr.minuten-zurueck')}`,
    },
    {
      minuten: zustand.schritt,
      zeichen: `+ ${zustand.schritt} min`,
      name: `${zustand.schritt} ${t('werkzeug.uhr.minuten-vor')}`,
    },
    { minuten: 60, zeichen: '+ 1 h', name: t('werkzeug.uhr.stunde-vor') },
  ]);
</script>

<figure class="uhr">
  {#if interaktiv}
    <p class="anleitung">
      {t(zustand.bis === undefined ? 'werkzeug.uhr.anleitung' : 'werkzeug.uhr.anleitung-ende')}
    </p>
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
  <div class="steuerung" role="group" aria-label={t('werkzeug.uhr.stellen')}>
    {#each knoepfe as k (k.zeichen)}
      <button
        type="button"
        class="zweit"
        aria-label={k.name}
        disabled={k.minuten < 0 ? jetzt <= untergrenze : jetzt >= 24 * 60 - 1}
        onclick={() => (zustand = gestellt(zustand, k.minuten))}>{k.zeichen}</button
      >
    {/each}
  </div>
{/if}

<style>
  .uhr {
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
    font-variant-numeric: tabular-nums;
  }
</style>
