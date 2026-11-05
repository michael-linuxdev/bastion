<script lang="ts">
  // Körpernetz (koerpernetz@1): Würfelnetz mit Buchstaben, auf Wunsch mit Schrägbild.
  // Interaktiv wählt ein Knopf je Buchstabe das Quadrat als Boden; das gegenüberliegende
  // wird hervorgehoben (ohne Ziehen, VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    doppelte,
    gegenueber,
    koerpernetzAus,
    koerpernetzBild,
    mitBoden,
    type KoerpernetzParameter,
  } from './koerpernetz';

  let { parameter, interaktiv = false }: { parameter: KoerpernetzParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => koerpernetzAus(parameter)));
  const b = $derived(koerpernetzBild(zustand));
  const stand = $derived.by(() => {
    if (zustand.boden === undefined) return t('werkzeug.koerpernetz.tippen');
    const boden = zustand.buchstaben[zustand.boden] ?? '';
    if (zustand.istNetz) {
      const g = gegenueber(zustand, zustand.boden);
      return `${t('werkzeug.koerpernetz.boden')} ${boden}, ${t('werkzeug.koerpernetz.gegenueber')} ${zustand.buchstaben[g ?? 0] ?? ''}.`;
    }
    const gruppen = doppelte(zustand, zustand.boden)
      .map((g) => g.map((i) => zustand.buchstaben[i] ?? '').join(` ${t('werkzeug.geraden.und')} `))
      .join('; ');
    return `${t('werkzeug.koerpernetz.boden')} ${boden}. ${t('werkzeug.koerpernetz.doppelt')} ${gruppen}.`;
  });
</script>

<figure class="koerpernetz">
  {#if interaktiv}
    <p class="anleitung">{t('werkzeug.koerpernetz.anleitung')}</p>
  {/if}
  <div class="bild" class:breit={zustand.schraegbild} role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if interaktiv}
    <figcaption class="stand" aria-live="polite">{stand}</figcaption>
  {/if}
</figure>
{#if interaktiv}
  <div class="steuerung" role="group" aria-label={t('werkzeug.koerpernetz.waehlen')}>
    {#each zustand.buchstaben as buchstabe, i (i)}
      <button
        type="button"
        class="zweit"
        aria-pressed={zustand.boden === i}
        onclick={() => (zustand = mitBoden(zustand, zustand.boden === i ? undefined : i))}
        >{buchstabe}</button
      >
    {/each}
  </div>
{/if}

<style>
  .koerpernetz {
    margin: 0;
    margin-block: var(--abstand-s);
  }

  .bild {
    max-inline-size: 14rem;
    color: var(--farbe-text);
  }

  .bild.breit {
    max-inline-size: 24rem;
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
