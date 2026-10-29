<script lang="ts">
  // Abspieler der Erstvermittlung (VERMITTLUNG §2): ein Schritt nach dem anderen,
  // Antworten mit Rückmeldung, Verzweigung nach der Sequenz. Gespeichert wird
  // über `onantwort` und `onende` (Ereignis `vermittlung`, DATENMODELL §4.7).
  import { untrack } from 'svelte';
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
  import { fuelle } from '../../core/learning/text';
  import type { Schritt, Vermittlung } from '../../core/learning/vermittlung';
  import { t, type TextSchluessel } from '../texte/texte';
  import Textteile from '../ueben/Textteile.svelte';
  import { WERKZEUG_KOMPONENTEN } from './werkzeuge';

  let {
    vermittlung,
    titel,
    fehlvorstellungen,
    kompetenzName,
    onantwort,
    onende,
    onvoraussetzung,
    onzurueck,
  }: {
    vermittlung: Vermittlung;
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
  let schritt = $state<Schritt | undefined>(untrack(() => erster(vermittlung)));
  /** Rückweg zur Voraussetzung, solange er angeboten wird */
  let rueckweg = $state<Extract<Ziel, { art: 'voraussetzung' }> | undefined>(undefined);
  let bewertung = $state<Bewertung | undefined>(undefined);
  let gewaehlt = $state<number | undefined>(undefined);
  let feld = $state('');
  let zaehler = $state('');
  let nenner = $state('');
  let hinweis = $state<TextSchluessel | undefined>(undefined);
  let karte = $state<HTMLElement | undefined>(undefined);
  /** Kurzfassung zum Nachschlagen: nur Beispiele und Merksätze (VERMITTLUNG §2.4) */
  let kurz = $state(false);

  const nummer = $derived(schritt ? vermittlung.schritte.indexOf(schritt) + 1 : 0);
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
    if (schritt) zeige(naechstes(vermittlung, schritt, beantwortet ? bewertung : undefined));
  }
</script>

<section class="vermittlung">
  <button class="zurueck" onclick={onzurueck}>← {t('uebung.zurueck')}</button>
  <header class="kopf">
    <h2>{titel}</h2>
    <progress
      max={vermittlung.schritte.length}
      value={nummer}
      aria-label={t('vermittlung.fortschritt')}
    ></progress>
    <button class="dezent umschalten" aria-pressed={kurz} onclick={() => (kurz = !kurz)}
      >{kurz ? t('vermittlung.ganz') : t('vermittlung.kurzfassung')}</button
    >
  </header>

  {#if kurz}
    {#each kurzfassung(vermittlung) as s (s.id)}
      <article class="karte">
        <p class="typ">{t(`vermittlung.typ.${s.typ}`)}</p>
        <p class="text"><Textteile teile={fuelle(s.text.de, {})} /></p>
        {#if s.bild}
          {@const Bild = WERKZEUG_KOMPONENTEN[s.bild.werkzeug]}
          {#if Bild}<div class="werkzeug"><Bild parameter={s.bild.parameter ?? {}} /></div>{/if}
        {/if}
      </article>
    {/each}
  {:else if rueckweg}
    <article class="karte" aria-live="polite">
      <p class="text">{t('vermittlung.voraussetzung')}</p>
      <p class="voraussetzung">{kompetenzName(rueckweg.kompetenz) ?? rueckweg.kompetenz}</p>
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
        <p class="typ">{t(`vermittlung.typ.${schritt.typ}`)}</p>
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
          <form id="vermittlung-antwort" onsubmit={pruefen}>
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
                  <input inputmode="numeric" bind:value={zaehler} disabled={beantwortet} /></label
                >
                <label
                  >{t('vermittlung.bruch-nenner')}
                  <input inputmode="numeric" bind:value={nenner} disabled={beantwortet} /></label
                >
              </div>
            {:else}
              <label class="feld"
                >{t('vermittlung.antwort')}
                <input inputmode="decimal" bind:value={feld} disabled={beantwortet} /></label
              >
            {/if}
            {#if hinweis}<p class="hinweis" role="alert">{t(hinweis)}</p>{/if}
          </form>
        {/if}

        {#if beantwortet && bewertung && 'richtig' in bewertung}
          <div class="rueckmeldung" class:richtig={bewertung.richtig} role="status">
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

        <div class="knoepfe">
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

  progress {
    inline-size: 100%;
    block-size: 0.5rem;
    accent-color: var(--farbe-akzent);
  }

  .zurueck {
    font: inherit;
    justify-self: start;
    min-block-size: var(--ziel);
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
  }

  .karte {
    display: grid;
    gap: var(--abstand-m);
    background: var(--farbe-flaeche);
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    padding: var(--abstand-m);
    scroll-margin-block-start: var(--abstand-m);
  }

  .karte > :global(*) {
    margin-block: 0;
  }

  .typ {
    font-size: 0.875rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
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
  }

  .knoepfe .haupt {
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
