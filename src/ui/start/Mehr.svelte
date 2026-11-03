<script lang="ts">
  // „Mehr“: zwei Zonen – Für dich / Für Erwachsene (§T102–§T104). Keine Suche.
  // O2: ohne doppelte Überschriften und Versionszeile; Vertrauen in einer Zeile am Ende.
  // Design-Ideen K47: Offline-Hinweis einmalig, kein Dauerbanner.
  import { onMount } from 'svelte';
  import Symbol, { type SymbolName } from '../grafik/Symbol.svelte';
  import { offlineHinweisGesehen, offlineHinweisSetzen } from '../plattform/ablage';
  import { t } from '../texte/texte';
  import type { Ziel } from './Startseite.svelte';

  let {
    eltern,
    offline,
    onziel,
  }: {
    /** Elternbereich anbieten (nicht bei Erwachsenen, L-15) */
    eltern: boolean;
    offline: boolean;
    onziel: (z: Ziel | 'start') => void;
  } = $props();

  let offlineZeigen = $state(false);

  onMount(() => {
    if (!offline) return;
    void offlineHinweisGesehen().then((gesehen) => {
      offlineZeigen = !gesehen;
    });
  });

  $effect(() => {
    if (offline) {
      void offlineHinweisGesehen().then((gesehen) => {
        offlineZeigen = !gesehen;
      });
    } else offlineZeigen = false;
  });

  function offlineOk() {
    offlineZeigen = false;
    void offlineHinweisSetzen();
  }

  type Eintrag = { ziel: Ziel; name: string; info: string; symbol: SymbolName };
  // O2: jeder Eintrag mit eigenem Symbol und einer Zeile, was dort wartet
  const fuerDich = $derived<Eintrag[]>([
    { ziel: 'themen', name: t('mehr.themen'), info: t('mehr.themen-info'), symbol: 'ueben' },
    { ziel: 'stand', name: t('stand.knopf'), info: t('start.stand-info'), symbol: 'stand' },
    { ziel: 'klassenarbeit', name: t('ka.knopf'), info: t('mehr.ka-info'), symbol: 'kalender' },
    {
      ziel: 'profil',
      name: t('profil.knopf'),
      info: t('mehr.profil-info'),
      symbol: 'person',
    },
    {
      ziel: 'sicherung',
      name: t('sicherung.knopf'),
      info: t('mehr.sicherung-info'),
      symbol: 'sicherung',
    },
  ]);
</script>

<section class="mehr">
  <button class="zurueck" onclick={() => onziel('start')}>
    <Symbol name="zurueck" />
    {t('uebung.zurueck')}
  </button>
  <h2>{t('mehr.ueberschrift')}</h2>

  {#if offlineZeigen}
    <p class="offline" role="status">
      <span>{t('start.offline')}</span>
      <button type="button" class="haupt" onclick={offlineOk}>{t('start.offline-ok')}</button>
    </p>
  {/if}

  <section class="zone" aria-labelledby="mehr-dich">
    <h3 id="mehr-dich">{t('mehr.fuer-dich')}</h3>
    <ul class="liste">
      {#each fuerDich as e (e.ziel)}
        <li>
          <!-- Name als Beschriftung, Info als Beschreibung: Screenreader hören „Sicherung“ zuerst -->
          <button
            class="eintrag"
            aria-label={e.name}
            aria-describedby="mehr-info-{e.ziel}"
            onclick={() => onziel(e.ziel)}
          >
            <Symbol name={e.symbol} />
            <span class="name">{e.name}</span>
            <span class="info" id="mehr-info-{e.ziel}">{e.info}</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>

  {#if eltern}
    <section class="zone" aria-labelledby="mehr-erwachsene">
      <h3 id="mehr-erwachsene">{t('mehr.fuer-erwachsene')}</h3>
      <ul class="liste">
        <li>
          <button
            class="eintrag"
            aria-label={t('eltern.knopf')}
            aria-describedby="mehr-info-eltern"
            onclick={() => onziel('eltern')}
          >
            <Symbol name="eltern" />
            <span class="name">{t('eltern.knopf')}</span>
            <span class="info" id="mehr-info-eltern">{t('mehr.eltern-info')}</span>
          </button>
        </li>
      </ul>
    </section>
  {/if}

  <p class="fuss" role="note">{t('mehr.versprechen')}</p>
</section>

<style>
  .mehr {
    display: grid;
    gap: var(--abstand-m);
  }
  .zurueck {
    font: inherit;
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
    min-block-size: var(--ziel);
  }
  .zurueck :global(svg) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }
  h2 {
    margin: 0;
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    color: var(--farbe-akzent);
  }
  h3 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--farbe-text-leise);
  }
  .zone {
    display: grid;
    gap: var(--abstand-s);
  }
  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  /* O2: Einträge wie die Kacheln der Startseite – Symbol, Name, eine Zeile Info */
  .eintrag {
    font: inherit;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--abstand-s);
    row-gap: 0.1rem;
    align-items: center;
    inline-size: 100%;
    min-block-size: 4rem;
    padding: 0.7rem var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    color: var(--farbe-text);
    text-align: start;
    cursor: pointer;
  }
  .eintrag :global(svg) {
    grid-row: 1 / span 2;
    color: var(--farbe-akzent);
  }
  .name {
    font-weight: 800;
    font-size: 1.05rem;
  }
  .info {
    grid-column: 2;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--farbe-text-leise);
  }
  .fuss {
    margin: 0;
    padding-block: var(--abstand-s);
    color: var(--farbe-text-leise);
    font-size: 0.85rem;
    text-align: center;
  }
  .offline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
    margin: 0;
    padding: var(--abstand-s) var(--abstand-m);
    border: 2px solid var(--farbe-hinweis-rand);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
  }
</style>
