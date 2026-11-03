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
  import { entwurfAusgeliefert } from '../plattform/paketstand';
  // Hub als ruhige Übersicht (Design A1–A4 + Danach J37 + V–Z): Bastion-Ort, drei Türen,
  // Vertrauen, nie-geübt; erste Minute = ein Satz + Üben; Nebenkacheln nach „Mehr entdecken“ / Rückkehr.
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
    heuteGeuebt = false,
    geradeDran,
    klassenarbeit,
    sichern,
    testphase = false,
    offenThema = undefined,
    nieGeuebt = false,
    /** Noch keine Aufgabe bearbeitet: erste Minute = ein Satz + ein Einstieg (J37) */
    erstesMal = false,
    onziel,
    children,
    unten,
  }: {
    heute: Date;
    rueckkehr: boolean;
    faellig: number;
    offeneFehler: number;
    basebau: boolean;
    /** Heute schon geübt – ruhige Markierung ohne Streak (Design L53) */
    heuteGeuebt?: boolean;
    /** Anzahl der Themen „Gerade dran“ (L-18) */
    geradeDran: number;
    /** Termin „JJJJ-MM-TT“ */
    klassenarbeit: string | undefined;
    sichern: boolean;
    /** Testprotokoll eingeschaltet: sichtbarer Hinweis (K-14, D-18) */
    testphase?: boolean;
    /** Offene Übung vom „Später weiter“ (N78) */
    offenThema?: string | undefined;
    /** Noch nie geübt (Y121): Satz + Wiederholen/Werkstatt ausgeblendet */
    nieGeuebt?: boolean;
    erstesMal?: boolean;
    onziel: (z: Ziel) => void;
    children?: Snippet;
    /** L16: Freiwilliges (z. B. „Über mich“) unter den Türen, nicht davor */
    unten?: Snippet;
  } = $props();

  const datum = (d: Date, mitTag = true) =>
    d.toLocaleDateString('de-DE', {
      ...(mitTag ? { weekday: 'long' as const } : {}),
      day: 'numeric',
      month: 'long',
    });
</script>

<div class="startseite register-ort" class:knapp={nieGeuebt}>
  <!-- O3 (Wunsch PV): Bastion als Banner wie der Titel eines Spiels – Bild und Name in einem -->
  <header class="banner" class:ohne-bild={!basebau}>
    {#if basebau}
      <!-- O7: Antippen des Bilds öffnet die Bastion – nur Abkürzung für Finger und Maus;
           Tastatur und Screenreader nutzen die Tür „Bastion“ darunter (gleiches Ziel). -->
      <span class="bild antippbar" aria-hidden="true" onclick={() => onziel('bastion')}
        ><MiniBastion lebendig /></span
      >
    {/if}
    <p class="titel ort-name">{t('start.ueberschrift')}</p>
  </header>

  <div class="kopf">
    {#if erstesMal}
      <p class="gruss">{t('start.erste-minute')}</p>
    {:else if rueckkehr}
      <p class="datum">{datum(heute)}</p>
      <p class="gruss" role="status">
        {t('rueckkehr.gruss')}{#if basebau}
          {tt('rueckkehr.bastion')}{/if}
      </p>
      {#if faellig > 0}<p class="leise">{t('rueckkehr.hinweis')}</p>{/if}
    {:else if nieGeuebt}
      <p class="gruss">{t('start.gruss-kurz')}</p>
      <p class="einladung">{t('start.nie-geuebt')}</p>
    {:else}
      <!-- L17: nach dem ersten Üben kein „Willkommen“ mehr, sondern ein ruhiger Gruß -->
      <p class="gruss">{t('start.gruss')}</p>
    {/if}
    {#if heuteGeuebt}
      <p class="leise heute" role="status">{t('start.heute-geuebt')}</p>
    {/if}
    {#if testphase}<p class="leise test" role="note">{t('test.hinweis')}</p>{/if}
  </div>

  {@render children?.()}

  {#if offenThema}
    <button class="offen" onclick={() => onziel('ueben')}>
      <Symbol name="ueben" />
      <span>{t('hub.offen-weiter').replace('{thema}', offenThema)}</span>
    </button>
  {/if}

  <!-- O3 (Wunsch PV): immer alle Türen und Kacheln; was gerade nichts hat, ist ruhig ausgegraut -->
  <div class="tueren" class:ohne-bastion={!basebau} role="group" aria-label={t('hub.tueren')}>
    <button
      class="tuer ueben"
      aria-label={t('start.ueben')}
      aria-describedby="ueben-dran"
      onclick={() => onziel('ueben')}
    >
      <span class="tuer-titel ort-name"><Symbol name="ueben" /> {t('hub.ort-ueben')}</span>
      <span class="ueben-dran" id="ueben-dran"
        >{nieGeuebt
          ? t('start.nie-geuebt-ueben')
          : geradeDran === 0
            ? t('start.ueben-frei')
            : geradeDran === 1
              ? t('start.gerade-dran-eins')
              : `${t('start.gerade-dran')}: ${geradeDran} ${t('start.themen')}`}</span
      >
    </button>

    {#if basebau}
      <button class="tuer neben" onclick={() => onziel('bastion')}>
        <span class="tuer-titel ort-name"><Symbol name="bastion" /> {t('hub.ort-bastion')}</span>
        <span class="tuer-info">{t('hub.bastion-info')}</span>
      </button>
    {/if}

    <button class="tuer neben" onclick={() => onziel('mehr')}>
      <span class="tuer-titel ort-name"><Symbol name="mehr" /> {t('hub.ort-mehr')}</span>
      <span class="tuer-info">{t('hub.mehr-info')}</span>
    </button>
  </div>

  <div class="kacheln">
    <button class="kachel" disabled={faellig === 0} onclick={() => onziel('wiederholen')}>
      <span class="kachel-name"
        ><Symbol name="wiederholen" />
        {t('wiederholen.knopf')}{#if faellig > 0}<span class="zahl" aria-hidden="true"
            >{faellig}</span
          >{/if}</span
      >
      <span class="kachel-info"
        >{faellig === 0
          ? t('start.nichts-dran')
          : faellig === 1
            ? t('wiederholen.eine')
            : `${faellig} ${t('wiederholen.mehrere')}`}</span
      >
    </button>
    <button class="kachel warm" disabled={offeneFehler === 0} onclick={() => onziel('werkstatt')}>
      <span class="kachel-name"
        ><Symbol name="werkstatt" />
        {t('werkstatt.knopf')}{#if offeneFehler > 0}<span class="zahl" aria-hidden="true"
            >{offeneFehler}</span
          >{/if}</span
      >
      <span class="kachel-info"
        >{offeneFehler === 0
          ? t('start.keine-fehler')
          : offeneFehler === 1
            ? t('werkstatt.offen-eins')
            : `${offeneFehler} ${t('werkstatt.offen-mehrere')}`}</span
      >
    </button>
    <button class="kachel" onclick={() => onziel('diagnose')}>
      <span class="kachel-name"><Symbol name="diagnose" /> {t('diagnose.knopf')}</span>
      <span class="kachel-info">{t('start.diagnose-info')}</span>
    </button>
    <button class="kachel" onclick={() => onziel('stand')}>
      <span class="kachel-name"><Symbol name="stand" /> {t('stand.knopf')}</span>
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

  {@render unten?.()}

  <!-- Vertrauen und F2-Vermerk (ARCHITEKTUR T-20) ruhig am Ende, nicht vor den Türen (O1) -->
  <footer class="fuss">
    <p role="note">{t('start.vertrauen')}</p>
    {#if entwurfAusgeliefert}<p role="note" data-entwurf>{t('entwurf.vermerk')}</p>{/if}
  </footer>
</div>

<style>
  .startseite {
    display: flex;
    flex-direction: column;
    min-block-size: calc(
      100dvh - env(safe-area-inset-top) - var(--abstand-l) - env(safe-area-inset-bottom) -
        var(--abstand-s)
    );
    background: var(--farbe-hintergrund);
  }
  .startseite > :global(*) {
    flex-shrink: 0;
  }
  .startseite > .fuss {
    margin-block-start: auto;
  }

  /* O3: Banner wie der Titel eines Spiels. Das Bild ist 2 : 1 gemalt; feste Seitenverhältnisse,
     damit „cover“ die Türme nicht abschneidet. Der Schleier unten hält den Namen lesbar. */
  .banner {
    position: relative;
    aspect-ratio: 16 / 10;
    max-block-size: 22rem;
    margin-block-end: var(--abstand-m);
    border-radius: var(--radius-karte);
    overflow: hidden;
    box-shadow: 0 6px 22px var(--farbe-schatten);
  }
  .banner .bild {
    position: absolute;
    inset: 0;
    display: block;
  }
  .banner::after {
    content: '';
    position: absolute;
    inset: 45% 0 0;
    background: linear-gradient(
      to bottom,
      transparent,
      color-mix(in srgb, var(--farbe-akzent) 55%, black 45%)
    );
    opacity: 0.75;
    pointer-events: none;
  }
  .banner.ohne-bild {
    aspect-ratio: auto;
    min-block-size: 7rem;
    background: var(--farbe-akzent);
  }
  .banner.ohne-bild::after {
    content: none;
  }
  .titel {
    position: absolute;
    z-index: 1;
    inset-inline-start: var(--abstand-m);
    inset-block-end: 0.35rem;
    margin: 0;
    font-size: clamp(2.6rem, 13vw, 4.25rem);
    font-weight: 1000;
    line-height: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    /* Gold wie ein Spieltitel; Kontur und Schatten aus dem Akzent */
    color: color-mix(in srgb, var(--farbe-akzent-warm) 12%, #ffe08a);
    -webkit-text-stroke: 0.1em color-mix(in srgb, var(--farbe-akzent) 45%, black);
    paint-order: stroke fill;
    text-shadow:
      0 0.06em 0 color-mix(in srgb, var(--farbe-akzent) 35%, black),
      0 0.14em 0.3em rgb(0 0 0 / 0.35);
    transform: rotate(-2deg);
    transform-origin: left bottom;
  }
  .kopf {
    margin-block-end: var(--abstand-s);
  }
  .datum {
    color: var(--farbe-text-leise);
    font-weight: 700;
    margin-block-end: 0.25rem;
  }
  .gruss {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.3;
    margin-block-end: 0.25rem;
  }
  .leise {
    color: var(--farbe-text-leise);
  }
  .einladung {
    margin-block: 0;
    color: var(--farbe-text-leise);
    font-size: 1.05rem;
    line-height: 1.4;
  }
  .fuss {
    padding-block: var(--abstand-m) var(--abstand-s);
    color: var(--farbe-text-leise);
    font-size: 0.85rem;
    text-align: center;
  }
  .fuss p {
    margin-block: 0 0.25rem;
  }
  .test {
    font-size: 0.875rem;
    margin-block-end: var(--abstand-s);
  }
  .heute {
    font-size: 0.95rem;
    margin-block-end: var(--abstand-s);
  }

  .offen {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    inline-size: 100%;
    min-block-size: 3rem;
    margin-block-end: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px dashed var(--farbe-akzent);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    font-weight: 700;
    text-align: start;
  }

  button {
    font: inherit;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .tueren {
    display: grid;
    gap: var(--abstand-s);
    grid-template-columns: 1fr 1fr;
    margin-block-end: var(--abstand-s);
  }
  .tueren.ohne-bastion {
    grid-template-columns: 1fr;
  }
  .tuer.ueben {
    grid-column: 1 / -1;
    display: grid;
    gap: 0.25rem;
    inline-size: 100%;
    min-block-size: 4.25rem;
    padding-block: 0.85rem;
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    text-align: start;
  }
  .tuer.neben {
    display: grid;
    gap: 0.2rem;
    align-content: center;
    min-block-size: 4.25rem;
    padding: 0.75rem;
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    text-align: start;
  }
  .tuer-titel {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.05rem;
    font-weight: 800;
  }
  /* O4: alle Symbole auf hellen Kacheln in der Akzentfarbe */
  .tuer.neben .tuer-titel :global(svg) {
    color: var(--farbe-akzent);
  }
  .tuer.ueben .tuer-titel {
    font-size: 1.5rem;
  }
  .ueben-dran {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .kacheln {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--abstand-s);
    margin-block-end: var(--abstand-s);
  }
  /* O1: Kacheln sehen aus wie die Nebentüren – Symbol und Name in einer Zeile, Info darunter */
  .kachel {
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 0.2rem;
    min-block-size: 4.25rem;
    padding: 0.75rem;
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    text-align: start;
  }
  .kachel.warm {
    border-block-start: 3px solid var(--farbe-akzent-warm);
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
  /* O7: Zahl-Plakette wie in Spielen – ruhig, ohne Rot, ohne Blinken (R1) */
  .kachel .kachel-name {
    justify-self: stretch;
  }
  .zahl {
    margin-inline-start: auto;
    min-inline-size: 1.6rem;
    block-size: 1.6rem;
    padding-inline: 0.4rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    font-size: 0.85rem;
    font-weight: 800;
  }
  .kachel.warm .zahl {
    background: var(--farbe-akzent-warm);
  }
  .antippbar {
    cursor: pointer;
  }
  .kachel-name {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    font-weight: 800;
    color: var(--farbe-text);
    font-size: 1.05rem;
  }
  .kachel-name :global(svg) {
    color: var(--farbe-akzent);
    flex-shrink: 0;
  }
  .kachel:disabled .kachel-name,
  .kachel:disabled .kachel-name :global(svg) {
    color: var(--farbe-text-leise);
  }
  .tuer-info,
  .kachel-info {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--farbe-text-leise);
    line-height: 1.35;
  }

  .hinweis {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--abstand-m);
    margin-block-end: var(--abstand-s);
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

  @media (width >= 36rem) {
    .banner {
      aspect-ratio: 2 / 1;
    }
  }

  /* V112: Querformat (Handy quer) – Türen ohne winzige Tap-Ziele */
  @media (orientation: landscape) and (height < 32rem) {
    .tueren {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .tuer,
    .kachel {
      min-block-size: max(3.25rem, var(--ziel));
    }
    .banner {
      aspect-ratio: 3 / 1;
    }
  }
</style>
