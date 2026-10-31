<script lang="ts" module>
  export type Ziel =
    | 'ueben'
    | 'themen'
    | 'diagnose'
    | 'stand'
    | 'wiederholen'
    | 'werkstatt'
    | 'bastion'
    | 'klassenarbeit'
    | 'sicherung'
    | 'profil'
    | 'eltern'
    | 'mehr';
</script>

<script lang="ts">
  // Startseite: primäre Türen oben (Üben / Bastion / Mehr), Nebenkacheln darunter (§T101).
  import type { Snippet } from 'svelte';
  import MiniBastion from '../grafik/MiniBastion.svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import { tt } from '../bastion/thema.svelte';
  import { t } from '../texte/texte';

  let {
    heute,
    rueckkehr,
    faellig,
    offeneFehler,
    basebau,
    geradeDran,
    klassenarbeit,
    sichern,
    testphase = false,
    onziel,
    children,
  }: {
    heute: Date;
    rueckkehr: boolean;
    faellig: number;
    offeneFehler: number;
    basebau: boolean;
    /** Anzahl der Themen „Gerade dran“ (L-18) */
    geradeDran: number;
    /** Termin „JJJJ-MM-TT“ */
    klassenarbeit: string | undefined;
    sichern: boolean;
    /** Testprotokoll eingeschaltet: sichtbarer Hinweis (K-14, D-18) */
    testphase?: boolean;
    onziel: (z: Ziel) => void;
    children?: Snippet;
  } = $props();

  const datum = (d: Date, mitTag = true) =>
    d.toLocaleDateString('de-DE', {
      ...(mitTag ? { weekday: 'long' as const } : {}),
      day: 'numeric',
      month: 'long',
    });
</script>

<div class="startseite">
  <header class="kopf">
    <p class="marke">{t('start.ueberschrift')}</p>
    <p class="datum">{datum(heute)}</p>
    {#if rueckkehr}
      <p class="gruss" role="status">
        {t('rueckkehr.gruss')}{#if basebau}
          {tt('rueckkehr.bastion')}{/if}
      </p>
      {#if faellig > 0}<p class="leise">{t('rueckkehr.hinweis')}</p>{/if}
    {:else}
      <p class="gruss">{t('start.gruss')}</p>
    {/if}
    {#if testphase}<p class="leise test" role="note">{t('test.hinweis')}</p>{/if}
  </header>

  {@render children?.()}

  <!-- §T101: primäre Türen zuerst above the fold -->
  <div class="tueren" role="navigation" aria-label={t('hub.tueren')}>
    <button
      class="tuer ueben"
      aria-label={t('start.ueben')}
      aria-describedby="ueben-dran"
      onclick={() => onziel('ueben')}
    >
      <span class="ueben-titel"><Symbol name="ueben" /> {t('start.ueben')}</span>
      <span class="ueben-dran" id="ueben-dran"
        >{geradeDran === 0
          ? t('start.ueben-frei')
          : geradeDran === 1
            ? t('start.gerade-dran-eins')
            : `${t('start.gerade-dran')}: ${geradeDran} ${t('start.themen')}`}</span
      >
    </button>

    {#if basebau}
      <button class="tuer bastion" onclick={() => onziel('bastion')}>
        <span class="bild"><MiniBastion /></span>
        <span class="bastion-name">{tt('bastion.knopf')}</span>
      </button>
    {/if}

    <button class="tuer mehr" onclick={() => onziel('mehr')}>
      <Symbol name="mehr" />
      <span class="kachel-name">{t('hub.mehr')}</span>
      <span class="kachel-info">{t('hub.mehr-info')}</span>
    </button>
  </div>

  <div class="neben" aria-label={t('hub.neben')}>
    <button class="kachel" disabled={faellig === 0} onclick={() => onziel('wiederholen')}>
      <Symbol name="wiederholen" />
      <span class="kachel-name">{t('wiederholen.knopf')}</span>
      <span class="kachel-info"
        >{faellig === 0
          ? t('start.nichts-dran')
          : faellig === 1
            ? t('wiederholen.eine')
            : `${faellig} ${t('wiederholen.mehrere')}`}</span
      >
    </button>
    <button class="kachel warm" disabled={offeneFehler === 0} onclick={() => onziel('werkstatt')}>
      <Symbol name="werkstatt" />
      <span class="kachel-name">{t('werkstatt.knopf')}</span>
      <span class="kachel-info"
        >{offeneFehler === 0
          ? t('start.keine-fehler')
          : offeneFehler === 1
            ? t('werkstatt.offen-eins')
            : `${offeneFehler} ${t('werkstatt.offen-mehrere')}`}</span
      >
    </button>
    <button class="kachel" onclick={() => onziel('diagnose')}>
      <Symbol name="diagnose" />
      <span class="kachel-name">{t('diagnose.knopf')}</span>
      <span class="kachel-info">{t('start.diagnose-info')}</span>
    </button>
    <button class="kachel" onclick={() => onziel('stand')}>
      <Symbol name="stand" />
      <span class="kachel-name">{t('stand.knopf')}</span>
      <span class="kachel-info">{t('start.stand-info')}</span>
    </button>
  </div>

  {#if klassenarbeit}
    <p class="hinweis">
      <span>{t('ka.am')} {datum(new Date(`${klassenarbeit}T12:00:00`))}</span>
      <button class="dezent" onclick={() => onziel('klassenarbeit')}>{t('ka.vorbereiten')}</button>
    </p>
  {/if}
  {#if sichern}
    <p class="hinweis">
      <span>{t('sicherung.erinnerung')}</span>
      <button class="dezent" onclick={() => onziel('sicherung')}>{t('sicherung.erstellen')}</button>
    </p>
  {/if}
</div>

<style>
  .startseite {
    display: flex;
    flex-direction: column;
    gap: var(--abstand-s);
    min-block-size: calc(
      100dvh - env(safe-area-inset-top) - var(--abstand-l) - env(safe-area-inset-bottom) -
        var(--abstand-s)
    );
  }
  .startseite > :global(*) {
    flex-shrink: 0;
  }
  .kopf {
    margin-block-end: 0;
  }
  .marke {
    font-family: var(--schrift-display, var(--schrift));
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--farbe-akzent);
    margin-block: 0 0.15rem;
    line-height: 1.1;
  }
  .datum {
    color: var(--farbe-text-leise);
    font-weight: 700;
    margin-block: 0 0.15rem;
    font-size: 0.95rem;
  }
  .gruss {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    margin-block: 0;
  }
  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0.15rem 0;
  }
  .test {
    font-size: 0.875rem;
  }

  button {
    font: inherit;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .tueren {
    display: grid;
    gap: var(--abstand-s);
    grid-template-columns: 1fr;
  }

  .tuer {
    display: grid;
    gap: 0.2rem;
    inline-size: 100%;
    padding-block: 0.7rem;
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    text-align: start;
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }

  .tuer.ueben {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    min-block-size: 4rem;
  }
  .ueben-titel {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.4rem;
    font-weight: 800;
  }
  .ueben-dran {
    font-size: 0.95rem;
  }

  .tuer.bastion {
    position: relative;
    padding: 0;
    overflow: hidden;
    background: var(--farbe-flaeche);
    min-block-size: 7rem;
    max-block-size: 11rem;
  }
  .bastion .bild {
    display: block;
    block-size: 7rem;
    max-block-size: 11rem;
  }
  .bastion-name {
    position: absolute;
    inset-block-start: var(--abstand-s);
    inset-inline-start: var(--abstand-s);
    padding-block: 0.125rem;
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    font-weight: 800;
  }

  .tuer.mehr {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 3.25rem;
    background: var(--farbe-flaeche);
    color: var(--farbe-akzent);
  }
  .tuer.mehr .kachel-name {
    font-weight: 800;
    color: var(--farbe-text);
  }
  .tuer.mehr .kachel-info {
    flex: 1 1 100%;
    font-size: 0.875rem;
    color: var(--farbe-text-leise);
  }

  .neben {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--abstand-s);
    margin-block-start: var(--abstand-s);
  }
  .kachel {
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 0.2rem;
    min-block-size: 4.5rem;
    padding: 0.65rem;
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 1px 6px var(--farbe-schatten);
    text-align: start;
    color: var(--farbe-akzent);
  }
  .kachel.warm {
    border-block-start: 4px solid var(--farbe-akzent-warm);
  }
  .kachel:disabled {
    cursor: default;
    box-shadow: none;
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text-leise);
  }
  .kachel.warm:disabled {
    border-block-start-color: transparent;
  }
  .kachel-name {
    font-weight: 800;
    color: var(--farbe-text);
  }
  .kachel-info {
    font-size: 0.8rem;
    color: var(--farbe-text-leise);
    line-height: 1.3;
  }

  .hinweis {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--abstand-m);
    margin-block: 0;
    padding-block: 0;
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-hinweis-rand);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
  }
  .hinweis .dezent {
    color: var(--farbe-text);
    font-weight: 700;
  }
</style>
