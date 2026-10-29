<script lang="ts" module>
  export type Ziel =
    | 'ueben'
    | 'diagnose'
    | 'stand'
    | 'wiederholen'
    | 'werkstatt'
    | 'bastion'
    | 'klassenarbeit'
    | 'sicherung'
    | 'profil'
    | 'eltern';
</script>

<script lang="ts">
  // Startseite in Richtung A (GRAFIK §1): Datum und Begrüßung, kleine Ansicht der
  // Bastion, großer Knopf „Üben“, vier Kacheln, Hinweis auf die Klassenarbeit nur
  // mit Datum (kein Countdown, R2). Rückfragen (Schuljahr, Profil) kommen als `children`.
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
    eltern,
    offline,
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
    /** Elternbereich anbieten (nicht bei Erwachsenen, L-15) */
    eltern: boolean;
    offline: boolean;
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

<header class="kopf">
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
</header>

{@render children?.()}

{#if basebau}
  <button class="karte bastion" onclick={() => onziel('bastion')}>
    <span class="bild"><MiniBastion /></span>
    <span class="bastion-name">{tt('bastion.knopf')}</span>
  </button>
{/if}

<button
  class="ueben"
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

<div class="kacheln">
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

<p class="versprechen">{t('start.versprechen')}</p>
<p class="weiteres">
  <button class="dezent" onclick={() => onziel('sicherung')}>{t('sicherung.knopf')}</button>
  <button class="dezent" onclick={() => onziel('profil')}>{t('profil.knopf')}</button>
  <button class="dezent" onclick={() => onziel('klassenarbeit')}>{t('ka.knopf')}</button>
  {#if eltern}
    <button class="dezent" onclick={() => onziel('eltern')}>{t('eltern.knopf')}</button>
  {/if}
</p>
{#if offline}
  <p class="offline" role="status">{t('start.offline')}</p>
{/if}

<style>
  .kopf {
    margin-block-end: var(--abstand-m);
  }
  .datum {
    color: var(--farbe-text-leise);
    font-weight: 700;
    margin-block-end: 0.25rem;
  }
  .gruss {
    font-size: 1.625rem;
    font-weight: 800;
    line-height: 1.25;
    margin-block-end: var(--abstand-s);
  }
  .leise {
    color: var(--farbe-text-leise);
  }

  button {
    font: inherit;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .karte {
    display: block;
    inline-size: 100%;
    padding: 0;
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    overflow: hidden;
    text-align: start;
    margin-block-end: var(--abstand-m);
  }
  .bastion .bild {
    display: block;
    block-size: 10rem;
  }
  .bastion-name {
    display: block;
    padding: var(--abstand-s) var(--abstand-m);
    font-weight: 800;
  }

  .ueben {
    display: grid;
    gap: 0.25rem;
    inline-size: 100%;
    min-block-size: 5rem;
    padding: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    text-align: start;
    margin-block-end: var(--abstand-m);
  }
  .ueben-titel {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.5rem;
    font-weight: 800;
  }
  .ueben-dran {
    font-size: 1rem;
  }

  .kacheln {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--abstand-s);
    margin-block-end: var(--abstand-m);
  }
  .kachel {
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 0.25rem;
    min-block-size: 7rem;
    padding: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
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
    font-size: 0.9375rem;
    color: var(--farbe-text-leise);
    line-height: 1.35;
  }

  .hinweis {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--abstand-m);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-hinweis-rand);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
  }
  .hinweis .dezent {
    color: var(--farbe-text);
    font-weight: 700;
  }

  .versprechen {
    color: var(--farbe-text-leise);
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }
  .weiteres {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--abstand-l);
  }
  .offline {
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }
</style>
