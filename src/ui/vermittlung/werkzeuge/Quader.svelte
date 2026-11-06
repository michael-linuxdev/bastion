<script lang="ts">
  // Quader (quader@1): Schrägbild mit Maßen, aus Einheitswürfeln, oder das Netz. Interaktiv
  // legen Knöpfe Schichten hinein oder nehmen sie weg (ohne Ziehen, VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import { gefuellt, quaderAus, quaderBild, schichtenText, type QuaderParameter } from './quader';

  let { parameter, interaktiv = false }: { parameter: QuaderParameter; interaktiv?: boolean } =
    $props();

  let zustand = $state(untrack(() => quaderAus(parameter)));
  const b = $derived(quaderBild(zustand));
  const fuellen = $derived(interaktiv && zustand.schichten !== undefined && !zustand.netz);
</script>

<figure class="quader">
  {#if fuellen}
    <p class="anleitung">{t('werkzeug.quader.anleitung')}</p>
  {/if}
  <div class="bild" role="img" aria-label={b.beschreibung.de}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG aus dem eigenen Baukasten, ohne Fremdinhalt -->
    {@html b.svg}
  </div>
  {#if fuellen}
    <figcaption class="stand" aria-live="polite">
      <strong>{schichtenText(zustand)}</strong>
    </figcaption>
  {/if}
</figure>
{#if fuellen && zustand.schichten !== undefined}
  <div class="steuerung" role="group" aria-label={t('werkzeug.quader.fuellen')}>
    <button
      type="button"
      class="zweit"
      disabled={zustand.schichten <= 0}
      onclick={() => (zustand = gefuellt(zustand, -1))}>{t('werkzeug.quader.weniger')}</button
    >
    <button
      type="button"
      class="zweit"
      disabled={zustand.schichten >= zustand.hoehe}
      onclick={() => (zustand = gefuellt(zustand, 1))}>{t('werkzeug.quader.mehr')}</button
    >
  </div>
{/if}

<style>
  .quader {
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
</style>
