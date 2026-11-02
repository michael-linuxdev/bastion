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
  import WetterEinstellung from '../bastion/WetterEinstellung.svelte';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    aufgaben,
    basebau = $bindable(true),
    klasse = $bindable(5),
    schulart = $bindable(undefined),
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
  } = $props();

  type Schritt = 'laden' | 'einrichten' | 'code' | 'gesperrt' | 'zuruecksetzen' | 'offen';
  let schritt = $state<Schritt>('laden');
  let pin = $state('');
  let pin2 = $state('');
  let wiederherstellung = $state('');
  let code = $state('');
  let fehler = $state<TextSchluessel | undefined>(undefined);
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

<section class="eltern register-werkstatt" data-eltern>
  <p class="badge" role="note">{t('eltern.nur-erwachsene')}</p>
  <h2>{t('eltern.ueberschrift')}</h2>
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
          autocomplete="new-password"
          bind:value={pin}
        /></label
      >
      <label
        >{t('eltern.pin-wiederholen')}
        <input
          type="password"
          inputmode="numeric"
          autocomplete="new-password"
          bind:value={pin2}
        /></label
      >
      {#if fehler}<p class="fehler" role="alert">{t(fehler)}</p>{/if}
      <button class="haupt" disabled={beschaeftigt}>
        {schritt === 'einrichten' ? t('eltern.festlegen') : t('eltern.zuruecksetzen')}
      </button>
    </form>
  {:else if schritt === 'code'}
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
  {:else if schritt === 'gesperrt'}
    <p class="schutz">{t('eltern.schutz')}</p>
    <form onsubmit={entsperren}>
      <label
        >{t('eltern.pin')}
        <input
          type="password"
          inputmode="numeric"
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
    <Bericht {kompetenzen} {vorlagen} {zustand} {aufgaben} {klasse} />
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
    <h3>{t('eltern.klasse-titel')}</h3>
    <KlassenWahl bind:klasse bind:schulart mitSchulart />
    <!-- §U108: Basebau/Demo klar von Kind-Bastion getrennt -->
    <section class="werkstatt-block" aria-labelledby="eltern-kind-bastion">
      <h3 id="eltern-kind-bastion">{t('eltern.kind-bastion-titel')}</h3>
      <p class="leise">{t('eltern.kind-bastion-text')}</p>
    </section>
    <section class="werkstatt-block demo" aria-labelledby="eltern-basebau">
      <h3 id="eltern-basebau">{t('eltern.basebau-demo-titel')}</h3>
      <p class="leise">{t('eltern.basebau-demo-text')}</p>
      <BasebauSchalter bind:an={basebau} durch="eltern" />
    </section>
    <section class="werkstatt-block" aria-labelledby="eltern-probe">
      <h3 id="eltern-probe">{t('eltern.probe-titel')}</h3>
      <TestRohstoffe />
    </section>
    <WetterEinstellung durch="eltern" />
    <Testphase />
    <Aufgabenblatt {kompetenzen} {vorlagen} {klasse} />
    <p class="leise">{t('eltern.ehrlich')}</p>
    <button
      onclick={() => {
        leeren();
        schritt = 'gesperrt';
      }}>{t('eltern.sperren')}</button
    >
  {/if}
</section>

<style>
  .eltern {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: 4px;
    background: color-mix(in srgb, var(--farbe-flaeche-leise) 85%, var(--farbe-text) 4%);
    border: 1px solid var(--farbe-rand);
  }

  .badge {
    margin: 0;
    justify-self: start;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    color: var(--farbe-text-leise);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  h2 {
    margin-block: 0 var(--abstand-s);
    font-size: 1.25rem;
  }

  form {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 22rem;
  }

  label {
    display: grid;
    gap: 0.2rem;
  }

  input {
    font: inherit;
    font-size: 1.25rem;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 1px solid var(--farbe-rand);
    border-radius: 2px;
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: 2px;
    border: 1px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    justify-self: start;
  }

  .haupt {
    background: var(--farbe-text);
    color: var(--farbe-flaeche);
    border-color: var(--farbe-text);
  }

  .leise-knopf {
    border-color: transparent;
    padding-inline: 0;
    text-decoration: underline;
  }

  .code {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 0.03em;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px dashed var(--farbe-akzent);
    border-radius: var(--radius);
  }

  .fehler {
    color: var(--farbe-akzent);
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .wahl select {
    font: inherit;
    justify-self: start;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-s);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }

  .hinweis {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .werkstatt-block {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
  }

  .werkstatt-block.demo {
    border: 2px dashed var(--farbe-rand);
  }

  .werkstatt-block h3 {
    margin-block: 0;
  }

  /* K49: stärkere Fokus-Ringe für Tastatur / Eltern-Tablets */
  .eltern :focus-visible {
    outline: 4px solid var(--farbe-akzent);
    outline-offset: 4px;
  }

  .eltern input:focus-visible,
  .eltern select:focus-visible,
  .eltern button:focus-visible {
    outline: 4px solid var(--farbe-akzent);
    outline-offset: 3px;
  }

  .schutz {
    color: var(--farbe-text-leise);
    margin-block-end: 0;
  }
</style>
