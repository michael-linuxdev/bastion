<script lang="ts">
  // Elternbereich (KONZEPT §10, DATENMODELL §5.2, D-12, D-14): PIN beim ersten
  // Öffnen festlegen, Wiederherstellungscode einmalig zeigen, danach Bericht.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import {
    mitCodeZuruecksetzen,
    pinFestlegen,
    pinGesetzt,
    pinPruefen,
    type Zustand,
  } from '../plattform/ablage';
  import { pinGueltig } from '../plattform/pin';
  import { t, type TextSchluessel } from '../texte/texte';
  import Bericht from './Bericht.svelte';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    aufgaben,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
  } = $props();

  type Schritt = 'laden' | 'einrichten' | 'code' | 'gesperrt' | 'zuruecksetzen' | 'offen';
  let schritt = $state<Schritt>('laden');
  let pin = $state('');
  let pin2 = $state('');
  let wiederherstellung = $state('');
  let code = $state('');
  let fehler = $state<TextSchluessel | undefined>(undefined);
  let beschaeftigt = $state(false);

  void pinGesetzt().then((ja) => (schritt = ja ? 'gesperrt' : 'einrichten'));

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
    schritt = 'code';
  }

  async function entsperren(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    beschaeftigt = true;
    const ok = await pinPruefen(pin);
    beschaeftigt = false;
    if (!ok) return (fehler = 'eltern.pin-falsch');
    leeren();
    schritt = 'offen';
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

<section class="eltern">
  <h2>{t('eltern.ueberschrift')}</h2>

  {#if schritt === 'einrichten' || schritt === 'zuruecksetzen'}
    <form onsubmit={schritt === 'einrichten' ? festlegen : zuruecksetzen}>
      {#if schritt === 'einrichten'}
        <p>{t('eltern.einrichten')}</p>
      {:else}
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
        schritt = 'offen';
      }}>{t('eltern.code-notiert')}</button
    >
  {:else if schritt === 'gesperrt'}
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
  {:else if schritt === 'offen'}
    <p class="leise">{t('eltern.transparenz')}</p>
    <Bericht {kompetenzen} {vorlagen} {zustand} {aufgaben} />
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
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    justify-self: start;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
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
</style>
