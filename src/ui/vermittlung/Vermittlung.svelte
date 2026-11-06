<script lang="ts">
  // Abspieler der Erstvermittlung (VERMITTLUNG §2): ein Schritt nach dem anderen,
  // Antworten mit Rückmeldung, Verzweigung nach der Sequenz. Gespeichert wird
  // über `onantwort` und `onende` (Ereignis `vermittlung`, DATENMODELL §4.7).
  import { untrack } from 'svelte';
  import ZurueckKnopf from '../start/ZurueckKnopf.svelte';
  import {
    bewerte,
    erster,
    kurzfassung,
    naechstes,
    richtigeAntwort,
    type Bewertung,
    type Eingabe,
    type Ziel,
  } from '../../core/learning/abspielen';
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import { tastenFuerVermittlung } from '../../core/learning/tastatur';
  import { fuelle } from '../../core/learning/text';
  import type { Schritt, Vermittlung } from '../../core/learning/vermittlung';
  import { t, type TextSchluessel } from '../texte/texte';
  import Tastatur from '../eingabe/Tastatur.svelte';
  import Textteile from '../ueben/Textteile.svelte';
  import { WERKZEUG_KOMPONENTEN } from './werkzeuge';

  let {
    vermittlung,
    start,
    titel,
    fehlvorstellungen,
    kompetenzName,
    onantwort,
    onende,
    onvoraussetzung,
    onzurueck,
  }: {
    vermittlung: Vermittlung;
    /** Schritt-ID für den Rückweg aus dem Fehlerkatalog; sonst der erste Schritt */
    start?: string | undefined;
    titel: string;
    fehlvorstellungen: ReadonlyMap<string, Fehlvorstellung>;
    /** Name einer Kompetenz für den Rückweg zur Voraussetzung */
    kompetenzName: (id: string) => string | undefined;
    onantwort: (schritt: Schritt, antwort: string, bewertung: Bewertung) => void;
    onende: () => void;
    onvoraussetzung: (kompetenz: string) => void;
    onzurueck: () => void;
  } = $props();

  // Startet beim ersten Schritt der Sequenz
  let schritt = $state<Schritt | undefined>(
    untrack(() => vermittlung.schritte.find((s) => s.id === start) ?? erster(vermittlung)),
  );
  /** Rückweg zur Voraussetzung, solange er angeboten wird */
  let rueckweg = $state<Extract<Ziel, { art: 'voraussetzung' }> | undefined>(undefined);
  let bewertung = $state<Bewertung | undefined>(undefined);
  let gewaehlt = $state<number | undefined>(undefined);
  let feld = $state('');
  let zaehler = $state('');
  let nenner = $state('');
  let hinweis = $state<TextSchluessel | undefined>(undefined);
  let karte = $state<HTMLElement | undefined>(undefined);
  let rueckmeldungEl = $state<HTMLElement | undefined>(undefined);
  let knoepfeEl = $state<HTMLElement | undefined>(undefined);
  /** Kurzfassung zum Nachschlagen: nur Beispiele und Merksätze (VERMITTLUNG §2.4) */
  let kurz = $state(false);

  /**
   * C2 (Q-O1): Liegt etwas unter dem Bildschirmrand (Prüfen-Knopf, Rückmeldung), rückt es ins
   * Bild – wie `sichtbarMachen` im Üben (L12).
   */
  function sichtbar(el: HTMLElement | undefined) {
    if (!el || typeof window === 'undefined') return;
    if (el.getBoundingClientRect().bottom <= window.innerHeight) return;
    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'end', behavior: ruhig ? 'auto' : 'smooth' });
  }

  // Nach dem Prüfen: Rückmeldung und Weiter-Knopf ins Bild
  $effect(() => {
    if (beantwortet) sichtbar(knoepfeEl ?? rueckmeldungEl);
  });

  // L6: über die ID suchen – `schritt` ist ein $state-Proxy, indexOf fand ihn nie (immer 0)
  const nummer = $derived(
    schritt ? vermittlung.schritte.findIndex((s) => s.id === schritt?.id) + 1 : 0,
  );
  const beantwortet = $derived(bewertung !== undefined && !('ungueltig' in bewertung));
  const fv = $derived(
    bewertung && 'richtig' in bewertung && !bewertung.richtig && bewertung.fv
      ? fehlvorstellungen.get(bewertung.fv)
      : undefined,
  );
  const art = $derived(
    schritt?.antwort && 'eingabe' in schritt.antwort ? schritt.antwort.eingabe.art : undefined,
  );

  function zeige(z: Ziel) {
    bewertung = undefined;
    gewaehlt = undefined;
    feld = zaehler = nenner = '';
    hinweis = undefined;
    if (z.art === 'schritt') {
      schritt = z.schritt;
      rueckweg = undefined;
    } else if (z.art === 'voraussetzung') rueckweg = z;
    else onende();
    karte?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function pruefen(e: SubmitEvent) {
    e.preventDefault();
    if (!schritt || beantwortet) return;
    let eingabe: Eingabe;
    let text: string;
    if (art === undefined) {
      if (gewaehlt === undefined) return void (hinweis = 'eingabe.auswahl');
      eingabe = { option: gewaehlt };
      text = String(gewaehlt);
    } else {
      text = art === 'bruch' ? `${zaehler.trim()}/${nenner.trim()}` : feld;
      eingabe = { text };
    }
    const b = bewerte(schritt, eingabe);
    if ('ungueltig' in b) return void (hinweis = 'eingabe.keine-zahl');
    hinweis = undefined;
    bewertung = b;
    onantwort(schritt, text, b);
  }

  function weiter() {
    if (schritt)
      zeige(
        naechstes(
          vermittlung,
          schritt,
          beantwortet ? bewertung : undefined,
          (id) => kompetenzName(id) !== undefined,
        ),
      );
  }
</script>

<section class="vermittlung">
  <ZurueckKnopf onclick={onzurueck} />
  <header class="kopf">
    <h2>{titel}</h2>
    {#if !kurz}
      <!-- B9 (Q-O1): Schrittzahl zur Leiste -->
      <p class="stand">
        {t('vermittlung.schritt')}
        {nummer}
        {t('uebung.von')}
        {vermittlung.schritte.length}
      </p>
    {/if}
    <!-- L6: eigene Leiste, gleich in allen Browsern -->
    <div
      class="fortschritt"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax={vermittlung.schritte.length}
      aria-valuenow={nummer}
      aria-label={t('vermittlung.fortschritt')}
    >
      <span style:inline-size="{(100 * nummer) / Math.max(1, vermittlung.schritte.length)}%"></span>
    </div>
  </header>

  {#if kurz}
    {#each kurzfassung(vermittlung) as s (s.id)}
      <article class="karte">
        <h3 class="typ">{t(`vermittlung.typ.${s.typ}`)}</h3>
        <p class="text"><Textteile teile={fuelle(s.text.de, {})} /></p>
        {#if s.bild}
          {@const Bild = WERKZEUG_KOMPONENTEN[s.bild.werkzeug]}
          {#if Bild}<div class="werkzeug"><Bild parameter={s.bild.parameter ?? {}} /></div>{/if}
        {/if}
      </article>
    {/each}
  {:else if rueckweg}
    <!-- B11 (Q-O1): Grund und Rückweg in Worten, Knöpfe direkt unter dem Text statt am Rand -->
    <article class="karte vorab" aria-live="polite">
      <p class="text">{t('vermittlung.voraussetzung')}</p>
      <p class="voraussetzung">{kompetenzName(rueckweg.kompetenz) ?? rueckweg.kompetenz}</p>
      <p class="grund">{t('vermittlung.voraussetzung-grund')}</p>
      <p class="grund">{t('vermittlung.voraussetzung-rueckweg')}</p>
      <div class="knoepfe">
        <button class="haupt" onclick={() => rueckweg && onvoraussetzung(rueckweg.kompetenz)}
          >{t('vermittlung.voraussetzung-ueben')}</button
        >
        {#if rueckweg.danach}
          <button
            class="zweit"
            onclick={() => rueckweg?.danach && zeige({ art: 'schritt', schritt: rueckweg.danach })}
            >{t('vermittlung.voraussetzung-weiter')}</button
          >
        {/if}
      </div>
    </article>
  {:else if schritt}
    {#key schritt}
      <article class="karte" bind:this={karte} aria-live="polite">
        <h3 class="typ">{t(`vermittlung.typ.${schritt.typ}`)}</h3>
        <p class="text"><Textteile teile={fuelle(schritt.text.de, {})} /></p>

        {#if schritt.bild}
          {@const Bild = WERKZEUG_KOMPONENTEN[schritt.bild.werkzeug]}
          {#if Bild}<div class="werkzeug">
              <Bild parameter={schritt.bild.parameter ?? {}} />
            </div>{/if}
        {/if}
        {#if schritt.werkzeug}
          {@const Werkzeug = WERKZEUG_KOMPONENTEN[schritt.werkzeug.id]}
          {#if Werkzeug}
            <div class="werkzeug">
              <Werkzeug parameter={schritt.werkzeug.parameter ?? {}} interaktiv />
            </div>
          {/if}
        {/if}

        {#if schritt.antwort}
          <form id="vermittlung-antwort" onsubmit={pruefen} onfocusin={() => sichtbar(knoepfeEl)}>
            {#if 'optionen' in schritt.antwort}
              <fieldset class="optionen" disabled={beantwortet}>
                <legend class="unsichtbar">{t('vermittlung.antwort')}</legend>
                {#each schritt.antwort.optionen as o, i (i)}
                  <label class="option" class:gewaehlt={gewaehlt === i}>
                    <input type="radio" name="option" value={i} bind:group={gewaehlt} />
                    <Textteile teile={fuelle(o.wert.de, {})} />
                  </label>
                {/each}
              </fieldset>
            {:else if art === 'bruch'}
              <div class="bruch-eingabe">
                <label
                  >{t('vermittlung.bruch-zaehler')}
                  <input
                    inputmode="none"
                    data-tastatur="zaehler"
                    bind:value={zaehler}
                    disabled={beantwortet}
                  /></label
                >
                <label
                  >{t('vermittlung.bruch-nenner')}
                  <input
                    inputmode="none"
                    data-tastatur="nenner"
                    bind:value={nenner}
                    disabled={beantwortet}
                  /></label
                >
              </div>
            {:else}
              <label class="feld"
                >{t('vermittlung.antwort')}
                <input
                  inputmode="none"
                  data-tastatur="feld"
                  bind:value={feld}
                  disabled={beantwortet}
                /></label
              >
            {/if}
            {#if schritt.antwort && 'eingabe' in schritt.antwort && !beantwortet}
              <Tastatur tasten={tastenFuerVermittlung(schritt.antwort.eingabe)} />
            {/if}
            {#if hinweis}<p class="hinweis" role="alert">{t(hinweis)}</p>{/if}
          </form>
        {/if}

        {#if beantwortet && bewertung && 'richtig' in bewertung}
          <div
            class="rueckmeldung"
            class:richtig={bewertung.richtig}
            role="status"
            bind:this={rueckmeldungEl}
          >
            <p class="urteil">
              {bewertung.richtig ? t('vermittlung.richtig') : t('vermittlung.falsch')}
            </p>
            {#if !bewertung.richtig}
              {#if fv}
                <p><Textteile teile={fuelle(fv.erklaerung.kurz.de, {})} /></p>
              {/if}
              {@const loesung = richtigeAntwort(schritt)}
              {#if loesung}
                <p>{t('vermittlung.richtig-ist')} <Textteile teile={fuelle(loesung, {})} /></p>
              {/if}
            {/if}
          </div>
        {/if}

        <div class="knoepfe" bind:this={knoepfeEl}>
          {#if schritt.typ === 'uebergang'}
            <button class="haupt" onclick={onende}>{t('vermittlung.jetzt-ueben')}</button>
          {:else if schritt.antwort && !beantwortet}
            <button type="submit" form="vermittlung-antwort" class="haupt"
              >{t('vermittlung.pruefen')}</button
            >
          {:else}
            <button class="haupt" onclick={weiter}>{t('vermittlung.weiter')}</button>
          {/if}
        </div>
      </article>
    {/key}
  {/if}
  <!-- D1 (Q-O1): Kurzfassung als Zweitknopf unter der Karte, nicht als Link über ihr -->
  <button class="zweit umschalten" aria-pressed={kurz} onclick={() => (kurz = !kurz)}
    >{kurz ? t('vermittlung.ganz') : t('vermittlung.kurzfassung')}</button
  >
</section>

<style>
  .vermittlung {
    display: grid;
    gap: var(--abstand-m);
  }

  .kopf {
    display: grid;
    gap: var(--abstand-s);
  }

  h2 {
    margin-block: 0;
    font-size: 1.375rem;
  }

  .umschalten {
    justify-self: start;
  }

  .stand {
    margin-block: 0;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
  }

  .fortschritt {
    inline-size: 100%;
    block-size: 0.5rem;
    border-radius: 999px;
    background: var(--farbe-flaeche-leise);
    box-shadow: inset 0 0 0 1px var(--farbe-rand);
    overflow: hidden;
  }

  .fortschritt span {
    display: block;
    block-size: 100%;
    background: var(--farbe-akzent);
    border-radius: inherit;
  }

  /* D1 (Q-O1): Die Karte füllt den Bildschirm, der Knopf steht immer unten – bei jedem Schritt
     an derselben Stelle. Auf niedrigen Bildschirmen (Querformat) wächst sie nur mit dem Inhalt. */
  .karte {
    display: flex;
    flex-direction: column;
    gap: var(--abstand-m);
    min-block-size: calc(100dvh - 15rem);
    background: var(--farbe-flaeche);
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    padding: var(--abstand-m);
    scroll-margin-block-start: var(--abstand-m);
  }

  @media (max-block-size: 36rem) {
    .karte {
      min-block-size: 0;
    }
  }

  .karte > :global(*) {
    margin-block: 0;
  }

  .typ {
    font-size: 1.0625rem;
    font-weight: 800;
    color: var(--farbe-akzent);
  }

  .text {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.45;
  }

  .voraussetzung {
    font-size: 1.25rem;
    font-weight: 800;
  }

  /* B11 (Q-O1): Die Karte zur Voraussetzung wächst nur mit dem Inhalt */
  .karte.vorab {
    min-block-size: 0;
  }

  .karte.vorab .knoepfe {
    margin-block-start: var(--abstand-s);
  }

  .grund {
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  .werkzeug {
    max-inline-size: 28rem;
  }

  .optionen {
    display: grid;
    gap: var(--abstand-s);
    margin: 0;
    padding: 0;
    border: none;
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .option input {
    accent-color: var(--farbe-akzent);
  }

  .option.gewaehlt {
    border-color: var(--farbe-akzent);
  }

  .bruch-eingabe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-m);
  }

  .bruch-eingabe label,
  .feld {
    display: grid;
    gap: 0.25rem;
  }

  .bruch-eingabe input {
    inline-size: 6rem;
  }

  .feld input {
    inline-size: 10rem;
  }

  .hinweis {
    color: var(--farbe-text-leise);
  }

  .rueckmeldung {
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border-inline-start: 6px solid var(--farbe-akzent-warm);
    background: var(--farbe-flaeche-leise);
  }

  .rueckmeldung.richtig {
    border-inline-start-color: var(--farbe-erfolg);
  }

  .rueckmeldung p:last-child {
    margin-block-end: 0;
  }

  .urteil {
    font-weight: 800;
    font-size: 1.125rem;
  }

  .rueckmeldung.richtig .urteil {
    color: var(--farbe-erfolg);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    margin-block-start: auto;
  }

  .knoepfe .haupt {
    flex: 1 1 12rem;
    padding-inline: var(--abstand-l);
  }

  .unsichtbar {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
