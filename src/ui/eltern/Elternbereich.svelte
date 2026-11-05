<script lang="ts">
  // Elternbereich (KONZEPT §10, DATENMODELL §5.2, D-12, D-14): PIN beim ersten
  // Öffnen festlegen, Wiederherstellungscode einmalig zeigen, danach Bericht.
  import KlassenWahl from '../ueben/KlassenWahl.svelte';
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { ERINNERUNG_WAHL } from '../../core/sicherung/sicherung';
  import {
    erinnerungAlle,
    erinnerungSetzen,
    letzteSicherungAm,
    mitCodeZuruecksetzen,
    pinAusSicherung,
    pinFestlegen,
    pinGesetzt,
    pinPruefen,
    pinVermerke,
    type Zustand,
  } from '../plattform/ablage';
  import { istDauerhaft } from '../plattform/speicher';
  import PinVermerke from './PinVermerke.svelte';
  import { pinGueltig } from '../plattform/pin';
  import { t, type TextSchluessel } from '../texte/texte';
  import Bericht from './Bericht.svelte';
  import BasebauSchalter from '../bastion/BasebauSchalter.svelte';
  import TestRohstoffe from '../bastion/TestRohstoffe.svelte';
  import Testphase from './Testphase.svelte';
  import Aufgabenblatt from './Aufgabenblatt.svelte';
  import { entwurfAusgeliefert } from '../plattform/paketstand';
  import WetterEinstellung from '../bastion/WetterEinstellung.svelte';
  import Seitenkopf from '../start/Seitenkopf.svelte';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    aufgaben,
    basebau = $bindable(true),
    klasse = $bindable(5),
    schulart = $bindable(undefined),
    onzurueck,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    /** Basebau-Schalter (R7) – auch Eltern dürfen ihn umlegen (B-13) */
    basebau?: boolean;
    /** gewählte Klasse – für den Bericht für die Lehrkraft (L-13) */
    klasse?: number;
    /** Klasse und Schulart pflegen auch Eltern (L-17) */
    schulart?: 'oberschule' | 'gymnasium' | undefined;
    /** O6: Zurück im gemeinsamen Seitenkopf */
    onzurueck: () => void;
  } = $props();

  /** O5: Abschnitte des offenen Elternbereichs, in dieser Reihenfolge */
  const ABSCHNITTE: readonly { id: string; titel: TextSchluessel }[] = [
    { id: 'bericht', titel: 'eltern.abschnitt-bericht' },
    { id: 'klasse', titel: 'eltern.abschnitt-klasse' },
    { id: 'sicherung', titel: 'eltern.abschnitt-sicherung' },
    { id: 'bastion', titel: 'eltern.abschnitt-bastion' },
    { id: 'blatt', titel: 'eltern.abschnitt-blatt' },
    { id: 'test', titel: 'eltern.abschnitt-test' },
  ];

  /** O8: Nur der Bericht ist zu Beginn aufgeklappt */
  let offen = $state<Record<string, boolean>>({ bericht: true });

  type Schritt = 'laden' | 'einrichten' | 'code' | 'gesperrt' | 'zuruecksetzen' | 'offen';
  let schritt = $state<Schritt>('laden');
  let pin = $state('');
  let pin2 = $state('');
  let wiederherstellung = $state('');
  let code = $state('');
  let fehler = $state<TextSchluessel | undefined>(undefined);
  /** O20: Rückmeldung zur Wiederholung schon beim Tippen, nicht erst nach dem Absenden */
  const pin2Stand = $derived(
    pin2.length === 0
      ? undefined
      : pin2 === pin && pinGueltig(pin)
        ? 'passt'
        : pin2.length >= pin.length && pin2 !== pin
          ? 'anders'
          : undefined,
  );
  let beschaeftigt = $state(false);

  let ausSicherung = $state(false);
  let vermerke = $state<readonly string[]>([]);
  let letzte = $state<number | undefined>(undefined);
  let dauerhaft = $state(false);
  let erinnerung = $state<number>(30);

  async function laden() {
    [ausSicherung, vermerke] = await Promise.all([pinAusSicherung(), pinVermerke()]);
    schritt = (await pinGesetzt()) ? 'gesperrt' : 'einrichten';
  }
  void laden();

  async function oeffnen() {
    schritt = 'offen';
    [letzte, dauerhaft, erinnerung] = await Promise.all([
      letzteSicherungAm(),
      istDauerhaft(),
      erinnerungAlle(),
    ]);
  }

  function leeren() {
    pin = '';
    pin2 = '';
    wiederherstellung = '';
    fehler = undefined;
  }

  async function festlegen(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    if (!pinGueltig(pin)) return (fehler = 'eltern.pin-ungueltig');
    if (pin !== pin2) return (fehler = 'eltern.pin-ungleich');
    beschaeftigt = true;
    code = await pinFestlegen(pin);
    beschaeftigt = false;
    leeren();
    ausSicherung = false;
    vermerke = await pinVermerke();
    schritt = 'code';
  }

  async function entsperren(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    beschaeftigt = true;
    const ok = await pinPruefen(pin);
    beschaeftigt = false;
    if (!ok) return (fehler = 'eltern.pin-falsch');
    leeren();
    await oeffnen();
  }

  async function zuruecksetzen(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    if (!pinGueltig(pin)) return (fehler = 'eltern.pin-ungueltig');
    if (pin !== pin2) return (fehler = 'eltern.pin-ungleich');
    beschaeftigt = true;
    const neu = await mitCodeZuruecksetzen(wiederherstellung, pin);
    beschaeftigt = false;
    if (!neu) return (fehler = 'eltern.code-falsch');
    code = neu;
    leeren();
    schritt = 'code';
  }
</script>

<section class="eltern register-werkstatt" id="eltern-oben" data-eltern>
  <Seitenkopf titel={t('eltern.ueberschrift')} marke={t('eltern.nur-erwachsene')} {onzurueck}>
    <!-- F2 (ARCHITEKTUR T-20): Vermerk, solange Inhalte unter Stufe 2 ausgeliefert werden -->
    {#if entwurfAusgeliefert}<p class="entwurf" role="note" data-entwurf>
        {t('entwurf.vermerk')}
      </p>{/if}
  </Seitenkopf>
  {#if schritt !== 'laden'}<PinVermerke {vermerke} />{/if}

  {#if schritt === 'einrichten' || schritt === 'zuruecksetzen'}
    <form onsubmit={schritt === 'einrichten' ? festlegen : zuruecksetzen}>
      {#if schritt === 'einrichten'}
        <p class="schutz">{t('eltern.schutz')}</p>
        <p>{t('eltern.einrichten')}</p>
        {#if ausSicherung}<p class="hinweis">{t('eltern.pin-aus-sicherung')}</p>{/if}
      {:else}
        <!-- §U106: lokaler Hinweis ohne Cloud-Reset-Mythos -->
        <p class="hinweis">{t('eltern.vergessen-hinweis')}</p>
        <label
          >{t('eltern.code-eingeben')}
          <input autocomplete="off" bind:value={wiederherstellung} /></label
        >
      {/if}
      <label
        >{schritt === 'einrichten' ? t('eltern.pin') : t('eltern.neue-pin')}
        <input
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="8"
          autocomplete="new-password"
          aria-describedby="pin-regel"
          bind:value={pin}
        /></label
      >
      <!-- O20: die Regel steht nur hier und zeigt während der Eingabe, ob sie erfüllt ist -->
      <p class="regel" class:erfuellt={pinGueltig(pin)} id="pin-regel">
        {#if pinGueltig(pin)}<span aria-hidden="true">✓ </span>{/if}{t('eltern.pin-regel')}
      </p>
      <label
        >{t('eltern.pin-wiederholen')}
        <input
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="8"
          autocomplete="new-password"
          aria-describedby="pin-gleich"
          bind:value={pin2}
        /></label
      >
      <p class="regel" class:erfuellt={pin2Stand === 'passt'} id="pin-gleich" aria-live="polite">
        {#if pin2Stand === 'passt'}<span aria-hidden="true">✓ </span>{t('eltern.pin-passt')}
        {:else if pin2Stand === 'anders' && fehler !== 'eltern.pin-ungleich'}{t(
            'eltern.pin-ungleich',
          )}{/if}
      </p>
      {#if fehler}<p class="fehler" role="alert">{t(fehler)}</p>{/if}
      <button class="haupt" disabled={beschaeftigt}>
        {schritt === 'einrichten' ? t('eltern.festlegen') : t('eltern.zuruecksetzen')}
      </button>
    </form>
  {:else if schritt === 'code'}
    <div class="code-karte">
      <h3>{t('eltern.code-titel')}</h3>
      <p>{t('eltern.code-text')}</p>
      <p class="code">{code}</p>
      <button
        class="haupt"
        onclick={() => {
          code = '';
          void oeffnen();
        }}>{t('eltern.code-notiert')}</button
      >
    </div>
  {:else if schritt === 'gesperrt'}
    <p class="schutz">{t('eltern.schutz')}</p>
    <form onsubmit={entsperren}>
      <label
        >{t('eltern.pin')}
        <input
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="8"
          autocomplete="current-password"
          bind:value={pin}
        /></label
      >
      {#if fehler}<p class="fehler" role="alert">{t(fehler)}</p>{/if}
      <button class="haupt" disabled={beschaeftigt}>{t('eltern.entsperren')}</button>
    </form>
    <button
      class="leise-knopf"
      onclick={() => {
        leeren();
        schritt = 'zuruecksetzen';
      }}>{t('eltern.vergessen')}</button
    >
    <!-- §U106: lokaler Hinweis, kein Cloud-Reset -->
    <p class="hinweis">{t('eltern.vergessen-hinweis')}</p>
  {:else if schritt === 'offen'}
    <p class="leise">{t('eltern.transparenz')}</p>

    <!-- O5: eine Seite, aber gegliedert – Sprungleiste zu den Abschnitten -->
    <!-- O8: bleibt beim Scrollen oben; ein Tipp klappt den Abschnitt auf -->
    <nav class="sprung" aria-label={t('eltern.inhalt')}>
      {#each ABSCHNITTE as a (a.id)}
        <a href="#abschnitt-{a.id}" onclick={() => (offen[a.id] = true)}>{t(a.titel)}</a>
      {/each}
    </nav>

    <details class="abschnitt" id="abschnitt-bericht" bind:open={offen.bericht}>
      <summary><h3>{t('eltern.abschnitt-bericht')}</h3></summary>
      <Bericht {kompetenzen} {vorlagen} {zustand} {aufgaben} {klasse} />
    </details>

    <details class="abschnitt" id="abschnitt-klasse" bind:open={offen.klasse}>
      <summary><h3>{t('eltern.klasse-titel')}</h3></summary>
      <KlassenWahl bind:klasse bind:schulart mitSchulart />
    </details>

    <details class="abschnitt" id="abschnitt-sicherung" bind:open={offen.sicherung}>
      <summary><h3>{t('eltern.abschnitt-sicherung')}</h3></summary>
      <p>
        {#if letzte === undefined}{t('eltern.sicherung-keine')}{:else}{t('eltern.sicherung-letzte')}
          {new Date(letzte).toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{/if}
      </p>
      <p class="leise">
        {dauerhaft ? t('eltern.speicher-dauerhaft') : t('eltern.speicher-unsicher')}
      </p>
      <label class="wahl"
        >{t('eltern.erinnerung')}
        <select
          value={erinnerung}
          onchange={(e) => {
            erinnerung = Number(e.currentTarget.value);
            void erinnerungSetzen(erinnerung);
          }}
        >
          {#each ERINNERUNG_WAHL as tage (tage)}
            <option value={tage}>{t(`eltern.erinnerung-${tage}` as TextSchluessel)}</option>
          {/each}
        </select></label
      >
    </details>

    <!-- §U108: echte Bastion und Probe klar getrennt -->
    <details class="abschnitt" id="abschnitt-bastion" bind:open={offen.bastion}>
      <summary><h3>{t('eltern.abschnitt-bastion')}</h3></summary>
      <p class="leise">{t('eltern.kind-bastion-text')}</p>
      <div class="teil">
        <h4>{t('eltern.basebau-demo-titel')}</h4>
        <BasebauSchalter bind:an={basebau} durch="eltern" />
      </div>
      <div class="teil">
        <h4>{t('eltern.probe-titel')}</h4>
        <TestRohstoffe />
      </div>
      <div class="teil">
        <WetterEinstellung durch="eltern" />
      </div>
    </details>

    <details class="abschnitt" id="abschnitt-blatt" bind:open={offen.blatt}>
      <summary><h3>{t('eltern.abschnitt-blatt')}</h3></summary>
      <Aufgabenblatt {kompetenzen} {vorlagen} {klasse} />
    </details>

    <details class="abschnitt" id="abschnitt-test" bind:open={offen.test}>
      <summary><h3>{t('eltern.abschnitt-test')}</h3></summary>
      <Testphase />
    </details>

    <footer class="fuss">
      <a class="nach-oben" href="#eltern-oben">{t('eltern.nach-oben')}</a>
      <p class="leise">{t('eltern.ehrlich')}</p>
      <button
        class="zweit"
        onclick={() => {
          leeren();
          schritt = 'gesperrt';
        }}>{t('eltern.sperren')}</button
      >
    </footer>
  {/if}
</section>

<style>
  /* O5: gleiche Sprache wie Start und „Mehr“ – Karten, runde Ecken, Knöpfe aus grund.css */
  .eltern {
    display: grid;
    gap: var(--abstand-m);
  }
  h3 {
    margin: 0;
    font-size: 1.15rem;
  }
  h4 {
    margin: 0;
    font-size: 1rem;
  }
  p {
    margin: 0;
  }
  .entwurf,
  .leise,
  .schutz {
    color: var(--farbe-text-leise);
  }
  .entwurf {
    font-size: 0.9rem;
  }

  .sprung {
    position: sticky;
    inset-block-start: 0;
    z-index: 2;
    display: flex;
    gap: var(--abstand-s);
    margin-inline: calc(-1 * var(--abstand-s));
    padding: var(--abstand-s);
    overflow-x: auto;
    scrollbar-width: none;
    background: var(--farbe-hintergrund);
  }
  .sprung a {
    flex: none;
  }
  .sprung a {
    display: inline-flex;
    align-items: center;
    min-block-size: 2.5rem;
    padding-inline: 0.85rem;
    border-radius: 999px;
    background: var(--farbe-flaeche);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    color: var(--farbe-text);
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .abschnitt,
  form,
  .code-karte {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    scroll-margin-block-start: 4rem;
  }
  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-block-size: var(--ziel);
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary::after {
    content: '';
    inline-size: 0.6rem;
    block-size: 0.6rem;
    border-inline-end: 2px solid currentColor;
    border-block-end: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.15s;
  }
  details[open] > summary::after {
    transform: rotate(-135deg);
  }
  details:not([open]) {
    padding-block: 0.25rem;
  }
  /* Die Bausteine Aufgabenblatt und Testphase bringen eine eigene Überschrift mit.
     Die Karte nennt den Abschnitt schon; die innere bleibt nur für Screenreader (Name der Region). */
  #abschnitt-blatt :global(h3#eltern-blatt),
  #abschnitt-test :global(:not(summary) > h3) {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* Bericht sitzt schon in einer Karte: kein zweiter Rahmen */
  #abschnitt-bericht :global(.bericht) {
    padding: 0;
    border: none;
    background: transparent;
  }
  .nach-oben {
    justify-self: start;
    color: var(--farbe-text);
    font-weight: 700;
  }
  .regel {
    font-size: 0.9rem;
    color: var(--farbe-text-leise);
  }
  .regel:empty {
    display: none;
  }
  .regel.erfuellt {
    color: var(--farbe-akzent);
    font-weight: 700;
  }
  form {
    max-inline-size: 28rem;
  }
  .teil {
    display: grid;
    gap: var(--abstand-s);
    padding-block-start: var(--abstand-s);
    border-block-start: 1px solid var(--farbe-rand);
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-weight: 600;
  }

  /* Felder und Knöpfe – auch in den Bausteinen darunter (Testphase, Aufgabenblatt, Wetter) */
  .eltern :global(input:not([type='checkbox']):not([type='radio'])),
  .eltern :global(select) {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: 0.75rem;
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }
  /* O8: PIN groß und mit Abstand zwischen den Ziffern, gut zu treffen und zu zählen */
  input[type='password'] {
    font-size: 1.75rem;
    letter-spacing: 0.5em;
    max-inline-size: 16rem;
    min-block-size: 3.5rem;
  }
  .wahl select {
    justify-self: start;
  }
  .eltern :global(button:not(.haupt):not(.zweit):not(.leise-knopf):not([aria-pressed])) {
    font: inherit;
    font-weight: 700;
    justify-self: start;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
    cursor: pointer;
  }
  .eltern :global(button:disabled) {
    cursor: default;
    opacity: 0.6;
  }
  .eltern :global(.haupt),
  .eltern :global(.zweit) {
    justify-self: start;
  }

  .leise-knopf {
    font: inherit;
    justify-self: start;
    min-block-size: var(--ziel);
    padding-inline: 0;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    text-decoration: underline;
    cursor: pointer;
  }

  .code {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    padding: var(--abstand-s) var(--abstand-m);
    border: 2px dashed var(--farbe-akzent);
    border-radius: var(--radius);
  }

  .fehler {
    color: var(--farbe-akzent-warm, var(--farbe-akzent));
    font-weight: 700;
  }

  .hinweis {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .fuss {
    display: grid;
    gap: var(--abstand-s);
    padding-block: var(--abstand-s);
  }

  /* K49: stärkere Fokus-Ringe für Tastatur / Eltern-Tablets */
  .eltern :global(:focus-visible) {
    outline: 4px solid var(--farbe-akzent);
    outline-offset: 3px;
  }
</style>
