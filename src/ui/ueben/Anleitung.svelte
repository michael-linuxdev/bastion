<script lang="ts">
  // Zeichen-Anleitung (LEHRPLAN L-10): Schritt für Schritt zum Nachmachen auf
  // Papier. Nicht bewertet; die Prüfliste am Ende wird nicht gespeichert.
  import type { Anleitung } from '../../core/learning/anleitung';
  import { alsText, fuelle } from '../../core/learning/text';
  import { anleitungsBilder } from '../../generators/anleitungen';
  import { t } from '../texte/texte';
  import Textteile from './Textteile.svelte';

  let { anleitung, onzurueck }: { anleitung: Anleitung; onzurueck: () => void } = $props();

  let schritt = $state(0);
  const bilder = $derived(anleitungsBilder.get(anleitung.bilder)?.bilder() ?? []);
  const anzahl = $derived(anleitung.schritte.length);
  const fertig = $derived(schritt >= anzahl);
  const bild = $derived(bilder[schritt]);
</script>

<section class="anleitung">
  <button class="zurueck" onclick={onzurueck}>← {t('uebung.zurueck')}</button>
  <h2>{alsText(fuelle(anleitung.titel.de, {}))}</h2>
  <p class="leise">
    {t('anleitung.material')}
    <Textteile teile={fuelle(anleitung.material.de, {})} />
  </p>

  {#if !fertig}
    <p class="stand" aria-live="polite">
      {t('anleitung.schritt')}
      {schritt + 1}
      {t('anleitung.von')}
      {anzahl}
    </p>
    {#key schritt}
      {#if bild}
        <figure class="bild" role="img" aria-label={bild.beschreibung.de}>
          <!-- SVG stammt aus unserem Code (src/generators/anleitungen), kein Paketinhalt;
               der Test dort schließt Skripte und Verweise aus. -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html bild.svg}
        </figure>
      {/if}
      <p class="text"><Textteile teile={fuelle(anleitung.schritte[schritt]?.de ?? '', {})} /></p>
    {/key}
    <div class="knoepfe">
      {#if schritt > 0}
        <button onclick={() => (schritt -= 1)}>{t('anleitung.zurueck')}</button>
      {/if}
      <button class="haupt" onclick={() => (schritt += 1)}>
        {schritt + 1 < anzahl ? t('anleitung.weiter') : t('anleitung.fertig')}
      </button>
    </div>
  {:else}
    <h3>{t('anleitung.pruefen')}</h3>
    <ul class="pruefen">
      {#each anleitung.pruefen as punkt, i (i)}
        <li>
          <label><input type="checkbox" /> <Textteile teile={fuelle(punkt.de, {})} /></label>
        </li>
      {/each}
    </ul>
    <p class="leise">{t('anleitung.nur-fuer-dich')}</p>
    <div class="knoepfe">
      <button onclick={() => (schritt = 0)}>{t('anleitung.nochmal')}</button>
      <button class="haupt" onclick={onzurueck}>{t('anleitung.zum-ueben')}</button>
    </div>
  {/if}
</section>

<style>
  .anleitung {
    display: grid;
    gap: var(--abstand-s);
  }

  h2 {
    margin-block: 0;
  }

  .stand,
  .leise {
    color: var(--farbe-text-leise);
  }

  .bild {
    margin-inline: 0;
    max-inline-size: 26rem;
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .bild :global(svg) {
    inline-size: 100%;
    block-size: auto;
    display: block;
  }

  .text {
    font-size: 1.25rem;
  }

  .pruefen {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .pruefen label {
    display: flex;
    gap: var(--abstand-s);
    align-items: baseline;
  }

  .pruefen input {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    flex-shrink: 0;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }

  .zurueck {
    justify-self: start;
    border-color: transparent;
    padding-inline: 0;
  }
</style>
