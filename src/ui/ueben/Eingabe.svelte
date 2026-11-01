<script lang="ts">
  // Antwortfeld passend zur Art der Lösung. Liest die Eingabe mit dem Kern
  // (INHALTSFORMAT §5.1) und meldet entweder eine Antwort oder einen Lesefehler.
  import {
    leseFaktoren,
    leseUhrzeit,
    leseZahl,
    type Gelesen,
  } from '../../core/learning/auswertung';
  import { bruch } from '../../core/learning/bruch';
  import type { Instanz, Loesung } from '../../core/learning/generator';
  import type { Aufgabentyp } from '../../core/learning/vorlage';
  import { tastenFuer, type Taste } from '../../core/learning/tastatur';
  import Tastatur from '../eingabe/Tastatur.svelte';
  import { t, type TextSchluessel } from '../texte/texte';
  import { fuelle, zahlText } from '../../core/learning/text';
  import Textteile from './Textteile.svelte';

  let {
    instanz,
    typ,
    gesperrt,
    tastatur,
    ergebnis,
    onantwort,
    onbereit,
  }: {
    instanz: Instanz;
    typ: Aufgabentyp;
    gesperrt: boolean;
    /** Tasten aus der Vorlage (INHALTSFORMAT §5.2) */
    tastatur?: readonly Taste[] | undefined;
    /** Nach dem Prüfen: Rahmen an Ergebnis koppeln */
    ergebnis?: 'richtig' | 'falsch' | undefined;
    onantwort: (antwort: Loesung, hinweis?: 'punkt-statt-komma') => void;
    /** Ob Prüfen sinnvoll ist (nicht leer) */
    onbereit?: ((bereit: boolean) => void) | undefined;
  } = $props();

  let feld1 = $state('');
  let feld2 = $state('');
  let gewaehlt = $state<number | undefined>(undefined);
  // Beschreibbares $derived: startet mit den gemischten Elementen, Verschieben überschreibt es.
  let reihe = $derived<number[]>([...(instanz.elemente ?? [])]);
  let fehler = $state<TextSchluessel | undefined>(undefined);

  const art = $derived(instanz.loesung.typ);
  /** Faktoren und Uhrzeiten brauchen Zeichen, die die Tastatur nicht hat: Systemtastatur */
  const mitTastatur = $derived(
    art !== 'auswahl' &&
      art !== 'reihenfolge' &&
      typ !== 'faktoren-eingabe' &&
      typ !== 'uhrzeit-eingabe',
  );
  const tasten = $derived(tastenFuer({ loesung: art, vorlage: tastatur, instanz }));

  const bereit = $derived.by(() => {
    if (art === 'auswahl') return gewaehlt !== undefined;
    if (art === 'reihenfolge' && typ === 'ordnen') return reihe.length > 0;
    if (art === 'bruch' || art === 'punkt' || art === 'mit-rest')
      return feld1.trim() !== '' && feld2.trim() !== '';
    return feld1.trim() !== '';
  });

  $effect(() => {
    onbereit?.(bereit);
  });

  /** Uhrzeit-Vorschau für das Zifferblatt (§R95) */
  const uhrVorschau = $derived.by(() => {
    if (typ !== 'uhrzeit-eingabe') return undefined;
    const g = leseUhrzeit(feld1);
    if (!g.ok) return undefined;
    return { stunden: Math.floor(g.wert / 60) % 12, minuten: g.wert % 60, roh: g.wert };
  });

  function zahlen(...gelesen: Gelesen<number>[]): number[] | undefined {
    for (const g of gelesen) {
      if (!g.ok) {
        fehler = `eingabe.${g.grund}`;
        return undefined;
      }
    }
    return gelesen.map((g) => (g.ok ? g.wert : NaN));
  }

  function pruefen(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    if (gesperrt || !bereit) return;
    fehler = undefined;
    if (art === 'auswahl') {
      if (gewaehlt === undefined) fehler = 'eingabe.auswahl';
      else onantwort({ typ: 'auswahl', wert: gewaehlt });
    } else if (art === 'reihenfolge' && typ === 'ordnen') {
      onantwort({ typ: 'reihenfolge', wert: [...reihe] });
    } else if (art === 'reihenfolge') {
      const g = leseFaktoren(feld1);
      if (g.ok) onantwort({ typ: 'reihenfolge', wert: g.wert });
      else fehler = `eingabe.${g.grund}`;
    } else if (art === 'zahl') {
      const g = typ === 'uhrzeit-eingabe' ? leseUhrzeit(feld1) : leseZahl(feld1);
      if (g.ok) onantwort({ typ: 'zahl', wert: g.wert }, g.hinweis);
      else fehler = `eingabe.${g.grund}`;
    } else if (art === 'bruch') {
      const z = zahlen(leseZahl(feld1), leseZahl(feld2));
      if (!z) return;
      const [zaehler = 0, nenner = 0] = z;
      if (nenner === 0) fehler = 'eingabe.nenner-null';
      else if (!Number.isInteger(zaehler) || !Number.isInteger(nenner) || nenner < 0)
        fehler = 'eingabe.keine-zahl';
      else onantwort({ typ: 'bruch', wert: bruch(zaehler, nenner) });
    } else if (art === 'punkt') {
      const z = zahlen(leseZahl(feld1), leseZahl(feld2));
      if (z) onantwort({ typ: 'punkt', wert: { x: z[0] ?? NaN, y: z[1] ?? NaN } });
    } else {
      const z = zahlen(leseZahl(feld1), leseZahl(feld2));
      if (z) onantwort({ typ: 'mit-rest', wert: { quotient: z[0] ?? NaN, rest: z[1] ?? NaN } });
    }
  }

  function verschiebe(i: number, um: number) {
    const j = i + um;
    if (j < 0 || j >= reihe.length) return;
    const neu = [...reihe];
    [neu[i], neu[j]] = [neu[j] ?? 0, neu[i] ?? 0];
    reihe = neu;
  }
</script>

<form
  onsubmit={pruefen}
  class="eingabe"
  class:richtig={ergebnis === 'richtig'}
  class:falsch={ergebnis === 'falsch'}
  id="antwort"
>
  <div class="feld-karte">
    {#if art === 'auswahl'}
      <fieldset class="optionen" class:bilder={instanz.optionen?.some((o) => o.bild)}>
        <legend class="unsichtbar">{t('eingabe.antwort')}</legend>
        {#each instanz.optionen ?? [] as option, i (i)}
          <label class="option" class:gewaehlt={gewaehlt === i}>
            <input type="radio" name="option" value={i} bind:group={gewaehlt} disabled={gesperrt} />
            {#if option.bild}
              <span class="bild" role="img" aria-label={option.bild.beschreibung.de}>
                <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                     die Pflicht-Tests schließen Skripte und Verweise aus. -->
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html option.bild.svg}
              </span>
            {/if}
            {#if option.text}<span><Textteile teile={fuelle(option.text.de, {})} /></span>{/if}
            {#if !option.text && !option.bild}{t('eingabe.option')} {i + 1}{/if}
          </label>
        {/each}
      </fieldset>
    {:else if art === 'reihenfolge' && typ === 'ordnen'}
      <ol class="reihe">
        {#each reihe as wert, i (wert)}
          <li>
            <span class="platz" aria-hidden="true">{i + 1}</span>
            <span class="wert">{zahlText(wert)}</span>
            <span class="griffe">
              <button
                type="button"
                class="griff"
                onclick={() => verschiebe(i, -1)}
                disabled={gesperrt || i === 0}
                aria-label="{zahlText(wert)} {t('eingabe.nach-vorn')}">↑</button
              >
              <button
                type="button"
                class="griff"
                onclick={() => verschiebe(i, 1)}
                disabled={gesperrt || i === reihe.length - 1}
                aria-label="{zahlText(wert)} {t('eingabe.nach-hinten')}">↓</button
              >
            </span>
          </li>
        {/each}
      </ol>
    {:else if art === 'bruch'}
      <span class="bruchfelder">
        <label
          ><span class="unsichtbar">{t('eingabe.zaehler')}</span>
          <input
            inputmode="none"
            data-tastatur="zaehler"
            autocomplete="off"
            bind:value={feld1}
            disabled={gesperrt}
          /></label
        >
        <label
          ><span class="unsichtbar">{t('eingabe.nenner')}</span>
          <input
            inputmode="none"
            data-tastatur="nenner"
            autocomplete="off"
            bind:value={feld2}
            disabled={gesperrt}
          /></label
        >
      </span>
    {:else if art === 'punkt'}
      <span class="paar">
        (<label
          ><span class="unsichtbar">{t('eingabe.x')}</span>
          <input
            inputmode="none"
            data-tastatur="feld"
            autocomplete="off"
            bind:value={feld1}
            disabled={gesperrt}
          /></label
        >
        |
        <label
          ><span class="unsichtbar">{t('eingabe.y')}</span>
          <input
            inputmode="none"
            data-tastatur="feld"
            autocomplete="off"
            bind:value={feld2}
            disabled={gesperrt}
          /></label
        >)
      </span>
    {:else if art === 'mit-rest'}
      <span class="mit-rest">
        <label class="hauptfeld"
          >{t('eingabe.ergebnis')}
          <input
            inputmode="none"
            data-tastatur="feld"
            autocomplete="off"
            bind:value={feld1}
            disabled={gesperrt}
          /></label
        >
        <label class="restfeld"
          ><span class="rest-label">{t('eingabe.rest')}</span>
          <input
            inputmode="none"
            data-tastatur="feld"
            autocomplete="off"
            bind:value={feld2}
            disabled={gesperrt}
          /></label
        >
      </span>
    {:else if typ === 'uhrzeit-eingabe'}
      <div class="uhr">
        <div
          class="zifferblatt"
          role="img"
          aria-label={uhrVorschau
            ? `${String(Math.floor(uhrVorschau.roh / 60)).padStart(2, '0')}:${String(uhrVorschau.minuten).padStart(2, '0')}`
            : t('eingabe.uhrzeit-blatt')}
        >
          <span class="marke m12">12</span>
          <span class="marke m3">3</span>
          <span class="marke m6">6</span>
          <span class="marke m9">9</span>
          {#if uhrVorschau}
            <span
              class="zeiger stunde"
              style="--winkel: {uhrVorschau.stunden * 30 + uhrVorschau.minuten * 0.5}deg"
            ></span>
            <span class="zeiger minute" style="--winkel: {uhrVorschau.minuten * 6}deg"></span>
          {/if}
          <span class="mitte"></span>
        </div>
        <label class="einzeln uhr-feld">
          <span class="unsichtbar">{t('eingabe.antwort')}</span>
          <input
            inputmode={mitTastatur ? 'none' : 'text'}
            data-tastatur={mitTastatur ? 'feld' : undefined}
            autocomplete="off"
            bind:value={feld1}
            disabled={gesperrt}
            placeholder={t('eingabe.uhrzeit-platzhalter')}
          />
        </label>
        <p class="hinweis">{t('eingabe.uhrzeit-hinweis')}</p>
      </div>
    {:else}
      <label class="einzeln">
        <span class="unsichtbar">{t('eingabe.antwort')}</span>
        <input
          inputmode={mitTastatur ? 'none' : 'text'}
          data-tastatur={mitTastatur ? 'feld' : undefined}
          autocomplete="off"
          bind:value={feld1}
          disabled={gesperrt}
        />
      </label>
      {#if typ === 'faktoren-eingabe'}<p class="hinweis">{t('eingabe.faktoren-hinweis')}</p>{/if}
    {/if}

    {#if mitTastatur && !gesperrt}
      <div class="tastatur-anbindung">
        <Tastatur {tasten} />
      </div>
    {/if}
  </div>

  {#if fehler}<p class="fehler" role="alert">{t(fehler)}</p>{/if}
</form>

<style>
  .eingabe {
    margin-block: 0;
  }

  .feld-karte {
    display: grid;
    gap: var(--abstand-s);
  }

  .tastatur-anbindung {
    margin-block-start: var(--abstand-s);
    padding-block-start: var(--abstand-s);
    border-block-start: 1px solid var(--farbe-rand);
  }

  @media (orientation: landscape) and (max-block-size: 30rem) {
    .eingabe {
      margin-block: var(--abstand-s);
    }
  }

  input:not([type='radio']) {
    font: inherit;
    font-size: 1.375rem;
    font-variant-numeric: tabular-nums;
    inline-size: 10rem;
    min-block-size: var(--ziel);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }

  .richtig input:not([type='radio']),
  .richtig .option {
    border-color: var(--farbe-erfolg);
    background: color-mix(in srgb, var(--farbe-erfolg) 8%, var(--farbe-flaeche));
  }

  .falsch input:not([type='radio']),
  .falsch .option.gewaehlt {
    border-color: var(--farbe-akzent-warm);
    background: color-mix(in srgb, var(--farbe-akzent-warm) 8%, var(--farbe-flaeche));
  }

  input:focus-visible {
    outline: 3px solid var(--farbe-akzent);
  }

  .bruchfelder {
    display: inline-flex;
    flex-direction: column;
    gap: var(--abstand-s);
    align-items: center;
  }

  .bruchfelder label:first-child {
    border-block-end: 3px solid currentColor;
    padding-block-end: var(--abstand-s);
  }

  .bruchfelder input,
  .paar input {
    inline-size: 6.5rem;
    text-align: center;
    font-size: 1.5rem;
  }

  .paar {
    display: inline-flex;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.375rem;
  }

  /* §R96: Rest nachgeordnet, nicht gleichwertig */
  .mit-rest {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--abstand-m);
    font-size: 1.25rem;
  }

  .hauptfeld {
    display: grid;
    gap: 0.25rem;
    font-weight: 700;
  }

  .hauptfeld input {
    inline-size: 7rem;
    font-size: 1.5rem;
    border-color: var(--farbe-akzent);
  }

  .restfeld {
    display: grid;
    gap: 0.25rem;
    color: var(--farbe-text-leise);
    font-size: 1rem;
    font-weight: 500;
  }

  .restfeld input {
    inline-size: 4.5rem;
    font-size: 1.1rem;
    border-style: dashed;
    background: var(--farbe-flaeche-leise);
  }

  .rest-label {
    font-size: 0.875rem;
  }

  .mit-rest input {
    text-align: center;
  }

  .optionen {
    border: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .optionen.bilder {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    cursor: pointer;
    font-size: 1.125rem;
  }

  .bilder .option {
    flex-direction: column;
  }

  .option.gewaehlt {
    border-color: var(--farbe-akzent);
    background: color-mix(in srgb, var(--farbe-akzent) 10%, var(--farbe-flaeche));
  }

  .bild {
    display: block;
    inline-size: 100%;
  }

  .bild :global(svg) {
    inline-size: 100%;
    block-size: auto;
  }

  .reihe {
    display: grid;
    gap: var(--abstand-s);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .reihe li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--abstand-s);
    font-size: 1.25rem;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
  }

  .platz {
    display: grid;
    place-items: center;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text-leise);
    font-size: 0.875rem;
    font-weight: 700;
  }

  .reihe .wert {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .griffe {
    display: flex;
    gap: 0.25rem;
  }

  .griff {
    font: inherit;
    font-size: 1.125rem;
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
    cursor: pointer;
  }

  .griff:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* §R95: Zifferblatt-Metapher */
  .uhr {
    display: grid;
    justify-items: start;
    gap: var(--abstand-s);
  }

  .zifferblatt {
    position: relative;
    inline-size: 8.5rem;
    block-size: 8.5rem;
    border-radius: 50%;
    border: 3px solid var(--farbe-rand);
    background: radial-gradient(
      circle at 50% 45%,
      var(--farbe-flaeche) 0%,
      var(--farbe-flaeche-leise) 100%
    );
    box-shadow: inset 0 0 0 1px var(--farbe-schatten);
  }

  .marke {
    position: absolute;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--farbe-text-leise);
  }

  .m12 {
    inset-block-start: 0.35rem;
    inset-inline-start: 50%;
    translate: -50% 0;
  }

  .m6 {
    inset-block-end: 0.35rem;
    inset-inline-start: 50%;
    translate: -50% 0;
  }

  .m3 {
    inset-inline-end: 0.45rem;
    inset-block-start: 50%;
    translate: 0 -50%;
  }

  .m9 {
    inset-inline-start: 0.45rem;
    inset-block-start: 50%;
    translate: 0 -50%;
  }

  .zeiger {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    transform-origin: 50% 100%;
    translate: -50% -100%;
    rotate: var(--winkel);
    border-radius: 999px;
    background: var(--farbe-text);
  }

  .zeiger.stunde {
    inline-size: 0.22rem;
    block-size: 2.1rem;
  }

  .zeiger.minute {
    inline-size: 0.16rem;
    block-size: 2.9rem;
    background: var(--farbe-akzent);
  }

  .mitte {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    inline-size: 0.55rem;
    block-size: 0.55rem;
    border-radius: 50%;
    background: var(--farbe-text);
    translate: -50% -50%;
  }

  .uhr-feld input {
    inline-size: 8.5rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
  }

  .hinweis {
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }

  .fehler {
    color: var(--farbe-text-leise);
    margin-block: var(--abstand-s) 0;
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
