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
  // Hub als ruhige Übersicht (Design A1–A4 + Danach J37): Bastion-Ort, drei Türen,
  // erste Minute = ein Satz + Üben; Nebenkacheln nach „Mehr entdecken“ / Rückkehr.
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
    /** Noch keine Aufgabe bearbeitet: erste Minute = ein Satz + ein Einstieg (J37) */
    erstesMal = false,
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
    erstesMal?: boolean;
    onziel: (z: Ziel) => void;
    children?: Snippet;
  } = $props();

  let hilfeOffen = $state(false);
  let mehrSichtbar = $state(false);

  const ersteMinute = $derived(erstesMal && !mehrSichtbar);

  const datum = (d: Date, mitTag = true) =>
    d.toLocaleDateString('de-DE', {
      ...(mitTag ? { weekday: 'long' as const } : {}),
      day: 'numeric',
      month: 'long',
    });
</script>

<div class="startseite register-ort" class:erste-minute={ersteMinute}>
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
    {:else}
      <p class="gruss ort-name">{t('start.gruss-kurz')}</p>
      <button
        type="button"
        class="hilfe"
        aria-expanded={hilfeOffen}
        aria-controls="hub-hilfe"
        onclick={() => (hilfeOffen = !hilfeOffen)}
      >
        <Symbol name="frage" />
        <span>{t('start.einstieg-hilfe')}</span>
      </button>
      {#if hilfeOffen}
        <p id="hub-hilfe" class="leise hilfe-text">{t('hub.tueren')}</p>
      {/if}
    {/if}
    {#if testphase}<p class="leise test" role="note">{t('test.hinweis')}</p>{/if}
  </header>

  {@render children?.()}

  {#if basebau}
    <div class="ort bastion" aria-hidden="true">
      <span class="bild"><MiniBastion lebendig /></span>
      <span class="bastion-name ort-name">
        <Symbol name="bastion" />
        {tt('bastion.knopf')}
      </span>
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
          >{geradeDran === 0
            ? t('start.ueben-frei')
            : geradeDran === 1
              ? t('start.gerade-dran-eins')
              : `${t('start.gerade-dran')}: ${geradeDran} ${t('start.themen')}`}</span
        >
      {/if}
    </button>

    {#if basebau}
      <button class="tuer neben" onclick={() => onziel('bastion')}>
        <span class="tuer-titel ort-name"><Symbol name="bastion" /> {t('hub.ort-bastion')}</span>
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
         beim Erstbesuch ohne Infozeilen (A3), sonst kleiner als die Türen (A1). -->
    <div class="kacheln" class:erst={!rueckkehr}>
      <button class="kachel" disabled={faellig === 0} onclick={() => onziel('wiederholen')}>
        <Symbol name="wiederholen" />
        <span class="kachel-name">{t('wiederholen.knopf')}</span>
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
      <button class="kachel warm" disabled={offeneFehler === 0} onclick={() => onziel('werkstatt')}>
        <Symbol name="werkstatt" />
        <span class="kachel-name">{t('werkstatt.knopf')}</span>
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
      <button class="kachel" onclick={() => onziel('diagnose')}>
        <Symbol name="diagnose" />
        <span class="kachel-name">{t('diagnose.knopf')}</span>
        {#if rueckkehr}<span class="kachel-info">{t('start.diagnose-info')}</span>{/if}
      </button>
      <button class="kachel" onclick={() => onziel('stand')}>
        <Symbol name="stand" />
        <span class="kachel-name">{t('stand.knopf')}</span>
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
  .startseite > .bastion {
    flex: 1 1 0;
    min-block-size: 7.5rem;
    max-block-size: 22rem;
    display: flex;
    flex-direction: column;
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
    margin-block-end: var(--abstand-s);
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
  .test {
    font-size: 0.875rem;
    margin-block-end: var(--abstand-s);
  }
  .hilfe {
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-block-size: var(--ziel);
    padding-inline: 0;
    border: none;
    background: transparent;
    color: var(--farbe-text-leise);
    cursor: pointer;
  }
  .hilfe :global(svg) {
    inline-size: 1.15rem;
    block-size: 1.15rem;
  }
  .hilfe-text {
    margin-block: 0.25rem var(--abstand-s);
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
  .bastion-name {
    position: absolute;
    inset-block-start: var(--abstand-s);
    inset-inline-start: var(--abstand-s);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding-block: 0.2rem;
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    box-shadow: 0 1px 6px var(--farbe-schatten);
  }
  .bastion-name :global(svg) {
    inline-size: 1.1rem;
    block-size: 1.1rem;
    color: var(--farbe-akzent);
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
    min-block-size: var(--ziel);
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
    font-size: 1.15rem;
  }
  .tuer.ueben .tuer-titel {
    font-size: 1.5rem;
  }
  .ueben-dran,
  .tuer-info {
    font-size: 0.95rem;
    font-weight: 600;
  }
  .tuer-info {
    color: var(--farbe-text-leise);
    font-size: 0.85rem;
  }

  .kacheln {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--abstand-s);
    margin-block-end: var(--abstand-s);
  }
  .kacheln.erst .kachel {
    min-block-size: var(--ziel);
    align-content: center;
  }
  .kachel {
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 0.2rem;
    min-block-size: 4.5rem;
    padding: 0.65rem 0.75rem;
    border: none;
    border-radius: var(--radius-karte);
    background: color-mix(in srgb, var(--farbe-flaeche) 88%, transparent);
    box-shadow: 0 1px 6px var(--farbe-schatten);
    text-align: start;
    color: var(--farbe-akzent);
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
    font-weight: 800;
    color: var(--farbe-text);
    font-size: 0.95rem;
  }
  .kachel-info {
    font-size: 0.8rem;
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
</style>
