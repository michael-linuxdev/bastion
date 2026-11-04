<script lang="ts">
  // O14 (Wunsch PV, Vorbild einbuergerung): Auf Handy und Tablet im Browser zuerst die
  // Anleitung zum Installieren. „Ohne Installation weiter“ merkt sich das Gerät (O17), auf
  // iPhone und iPad nur bis zum nächsten Öffnen.
  // Ruhig: kein Zähler, kein Druck – nur die Schritte und drei Gründe.
  import { geraet, ohneInstallationWeiter } from '../plattform/installation.svelte';
  import { t } from '../texte/texte';
  import InstallSchritte from './InstallSchritte.svelte';

  let kopiert = $state(false);
  async function adresseKopieren() {
    try {
      await navigator.clipboard.writeText(location.href);
      kopiert = true;
    } catch {
      kopiert = false;
    }
  }

  let titel = $state<HTMLHeadingElement>();
  $effect(() => titel?.focus());
</script>

<div class="sperre" role="dialog" aria-modal="true" aria-labelledby="sperre-titel">
  <div class="innen">
    <p class="marke ort-name" aria-hidden="true">{t('start.ueberschrift')}</p>
    <h2 id="sperre-titel" tabindex="-1" bind:this={titel}>{t('installieren.sperre-titel')}</h2>
    <section class="karte" aria-labelledby="sperre-so">
      <h3 id="sperre-so">{t('installieren.so-gehts')}</h3>
      <InstallSchritte {geraet} erkannt />
      {#if geraet.browser === 'inapp' || geraet.browser === 'other'}
        <button type="button" class="zweit" onclick={() => void adresseKopieren()}
          >{t('installieren.adresse-kopieren')}</button
        >
        {#if kopiert}<p role="status">{t('installieren.adresse-kopiert')}</p>{/if}
      {/if}
    </section>
    <!-- O17: Erst die Warnung (iPhone/iPad), dann gleich der Weg ohne Installation – nicht
         als blasser Link ganz unten, den man erst nach dem Scrollen findet -->
    {#if geraet.system === 'ios' && geraet.browser !== 'inapp'}
      <p class="wichtig" role="note">{t('installieren.ios-wichtig')}</p>
    {/if}
    <button type="button" class="weiter" onclick={ohneInstallationWeiter}
      >{t('installieren.weiter')}</button
    >
    <ul class="warum" aria-label={t('installieren.warum')}>
      <li>{t('installieren.warum-1')}</li>
      <li>{t('installieren.warum-2')}</li>
      <li>{t('installieren.warum-3')}</li>
    </ul>
  </div>
</div>

<style>
  /* Hinter der Anleitung scrollt die Startseite nicht mit */
  :global(body:has(.sperre)) {
    overflow: hidden;
  }
  .sperre {
    position: fixed;
    inset: 0;
    z-index: 50;
    overflow-y: auto;
    background: var(--farbe-hintergrund);
  }
  .innen {
    display: grid;
    gap: var(--abstand-m);
    max-inline-size: 34rem;
    margin-inline: auto;
    padding: calc(var(--abstand-l) + env(safe-area-inset-top)) var(--abstand-m)
      calc(var(--abstand-l) + env(safe-area-inset-bottom));
  }
  .marke {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 1000;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--farbe-akzent);
  }
  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 6vw, 2.1rem);
    line-height: 1.15;
  }
  h2:focus {
    outline: none;
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .karte {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-block-start: 4px solid var(--farbe-akzent);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }
  .zweit {
    justify-self: start;
  }
  .warum {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  .warum li {
    position: relative;
    padding-inline-start: 2rem;
  }
  .warum li::before {
    content: '✓';
    position: absolute;
    inset-inline-start: 0;
    inline-size: 1.4rem;
    block-size: 1.4rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: color-mix(in srgb, var(--farbe-akzent) 15%, var(--farbe-flaeche));
    color: var(--farbe-akzent);
    font-weight: 800;
    font-size: 0.8rem;
  }
  .wichtig {
    margin: 0;
    padding: var(--abstand-s) var(--abstand-m);
    border: 2px solid var(--farbe-hinweis-rand);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
  }
  .weiter {
    font: inherit;
    font-weight: 700;
    justify-self: stretch;
    min-block-size: var(--ziel);
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    cursor: pointer;
  }
</style>
