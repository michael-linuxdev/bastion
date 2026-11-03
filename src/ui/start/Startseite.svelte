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

  let mehrSichtbar = $state(false);

  const ersteMinute = $derived(erstesMal && !mehrSichtbar);

  const datum = (d: Date, mitTag = true) =>
    d.toLocaleDateString('de-DE', {
      ...(mitTag ? { weekday: 'long' as const } : {}),
      day: 'numeric',
      month: 'long',
    });
</script>

<div class="startseite register-ort" class:erste-minute={ersteMinute} class:knapp={nieGeuebt}>
  <header class="kopf">
    <p class="marke ort-name">{t('start.ueberschrift')}</p>
    {#if ersteMinute}
      <p class="gruss erste">{t('start.erste-minute')}</p>
    {:else if rueckkehr}
      <p class="datum">{datum(heute)}</p>
      <p class="gruss" role="status">
        {t('rueckkehr.gruss')}{#if basebau}
          {tt('rueckkehr.bastion')}{/if}
      </p>
      {#if faellig > 0}<p class="leise">{t('rueckkehr.hinweis')}</p>{/if}
    {:else if nieGeuebt}
      <!-- Noch nie geübt: Gruß und Einladung in einem Satz (O1) -->
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
  </header>

  {@render children?.()}

  {#if offenThema}
    <button class="offen" onclick={() => onziel('ueben')}>
      <Symbol name="ueben" />
      <span>{t('hub.offen-weiter').replace('{thema}', offenThema)}</span>
    </button>
  {/if}

  {#if basebau}
    <div class="ort bastion" aria-hidden="true">
      <!-- L17: ohne eigenes Schild – die Tür „Bastion“ darunter benennt den Ort -->
      <span class="bild"><MiniBastion lebendig /></span>
    </div>
  {/if}

  <div class="tueren" class:ohne-bastion={!basebau} role="group" aria-label={t('hub.tueren')}>
    <button
      class="tuer ueben"
      aria-label={ersteMinute ? t('start.erste-minute-ueben') : t('start.ueben')}
      aria-describedby={ersteMinute ? undefined : 'ueben-dran'}
      onclick={() => onziel('ueben')}
    >
      <span class="tuer-titel ort-name"
        ><Symbol name="ueben" />
        {ersteMinute ? t('start.erste-minute-ueben') : t('hub.ort-ueben')}</span
      >
      {#if !ersteMinute}
        <span class="ueben-dran" id="ueben-dran"
          >{nieGeuebt
            ? t('start.nie-geuebt-ueben')
            : geradeDran === 0
              ? t('start.ueben-frei')
              : geradeDran === 1
                ? t('start.gerade-dran-eins')
                : `${t('start.gerade-dran')}: ${geradeDran} ${t('start.themen')}`}</span
        >
      {/if}
    </button>

    {#if basebau}
      <button class="tuer neben" class:breit={ersteMinute} onclick={() => onziel('bastion')}>
        <span class="tuer-titel ort-name"><Symbol name="bastion" /> {t('hub.ort-bastion')}</span>
        {#if !ersteMinute}<span class="tuer-info">{t('hub.bastion-info')}</span>{/if}
      </button>
    {/if}

    {#if !ersteMinute}
      <button class="tuer neben" onclick={() => onziel('mehr')}>
        <span class="tuer-titel ort-name"><Symbol name="mehr" /> {t('hub.ort-mehr')}</span>
        <span class="tuer-info">{t('hub.mehr-info')}</span>
      </button>
    {/if}
  </div>

  {#if ersteMinute}
    <button class="dezent mehr-auf" onclick={() => (mehrSichtbar = true)}
      >{t('start.mehr-entdecken')}</button
    >
  {:else}
    <!-- Nebenkacheln immer erreichbar (Fehlerwerkstatt auch in der ersten Sitzung);
         beim Erstbesuch ohne Infozeilen (A3), sonst kleiner als die Türen (A1);
         nie geübt ohne Wiederholen/Werkstatt (Y121). -->
    <div class="kacheln" class:erst={!rueckkehr}>
      {#if !nieGeuebt}
        <button class="kachel" disabled={faellig === 0} onclick={() => onziel('wiederholen')}>
          <span class="kachel-name"><Symbol name="wiederholen" /> {t('wiederholen.knopf')}</span>
          {#if rueckkehr || faellig > 0}
            <span class="kachel-info"
              >{faellig === 0
                ? t('start.nichts-dran')
                : faellig === 1
                  ? t('wiederholen.eine')
                  : `${faellig} ${t('wiederholen.mehrere')}`}</span
            >
          {/if}
        </button>
        <button
          class="kachel warm"
          disabled={offeneFehler === 0}
          onclick={() => onziel('werkstatt')}
        >
          <span class="kachel-name"><Symbol name="werkstatt" /> {t('werkstatt.knopf')}</span>
          {#if rueckkehr || offeneFehler > 0}
            <span class="kachel-info"
              >{offeneFehler === 0
                ? t('start.keine-fehler')
                : offeneFehler === 1
                  ? t('werkstatt.offen-eins')
                  : `${offeneFehler} ${t('werkstatt.offen-mehrere')}`}</span
            >
          {/if}
        </button>
      {/if}
      <button class="kachel" onclick={() => onziel('diagnose')}>
        <span class="kachel-name"><Symbol name="diagnose" /> {t('diagnose.knopf')}</span>
        {#if rueckkehr}<span class="kachel-info">{t('start.diagnose-info')}</span>{/if}
      </button>
      <button class="kachel" onclick={() => onziel('stand')}>
        <span class="kachel-name"><Symbol name="stand" /> {t('stand.knopf')}</span>
        {#if rueckkehr}<span class="kachel-info">{t('start.stand-info')}</span>{/if}
      </button>
    </div>

    {#if klassenarbeit}
      <p class="hinweis">
        <span>{t('ka.am')} {datum(new Date(`${klassenarbeit}T12:00:00`))}</span>
        <button class="dezent" onclick={() => onziel('klassenarbeit')}>{t('ka.vorbereiten')}</button
        >
      </p>
    {/if}
    {#if sichern}
      <p class="hinweis">
        <span>{t('sicherung.erinnerung')}</span>
        <button class="dezent" onclick={() => onziel('sicherung')}
          >{t('sicherung.erstellen')}</button
        >
      </p>
    {/if}
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
    background:
      radial-gradient(
        120% 60% at 50% -10%,
        color-mix(in srgb, var(--farbe-himmel) 70%, transparent),
        transparent 70%
      ),
      var(--farbe-hintergrund);
  }
  .startseite > :global(*) {
    flex-shrink: 0;
  }
  /* O1: Das Startbild ist 2 : 1 gemalt. Feste Seitenverhältnisse statt „Rest der Höhe füllen“,
     sonst schneidet „cover“ am Desktop und beim ersten Start die Türme oben ab. */
  .startseite > .bastion {
    aspect-ratio: 16 / 10;
    max-block-size: 22rem;
    display: flex;
    flex-direction: column;
  }
  .startseite > .fuss {
    margin-block-start: auto;
  }
  .startseite:not(:has(> .bastion)) > .tueren {
    flex: 1 1 auto;
  }
  .kopf {
    margin-block-end: var(--abstand-s);
  }
  .marke {
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    color: var(--farbe-akzent);
    margin-block-end: 0.15rem;
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
  .gruss.erste {
    font-size: 1.25rem;
    font-weight: 700;
    max-inline-size: 22rem;
  }
  .mehr-auf {
    justify-self: start;
    margin-block-end: var(--abstand-m);
    font-weight: 700;
  }
  .erste-minute .tuer.ueben {
    min-block-size: 5rem;
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

  .ort {
    display: block;
    inline-size: 100%;
    margin-block-end: var(--abstand-s);
  }
  .bastion {
    position: relative;
    border-radius: var(--radius-karte);
    overflow: hidden;
    box-shadow: 0 4px 18px var(--farbe-schatten);
  }
  .bastion .bild {
    display: block;
    flex: 1 1 0;
    min-block-size: 0;
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
  .tuer.neben.breit {
    grid-column: 1 / -1;
  }
  .tuer-titel {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.05rem;
    font-weight: 800;
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
    .startseite > .bastion {
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
    .startseite > .bastion {
      aspect-ratio: 2 / 1;
      inline-size: min(100%, 24rem);
      margin-inline: auto;
    }
  }
</style>
