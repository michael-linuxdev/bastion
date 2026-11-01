<script lang="ts">
  // Zwischenschritte nach einem falschen Ergebnis (VERMITTLUNG §3.6, K-29):
  // ein Schritt nach dem anderen, zwei Versuche je Schritt. Beim ersten Fehler
  // kommt ein Hinweis zur Ursache, beim zweiten zeigt Bastion den Schritt und
  // rechnet damit weiter. „Weiter ohne Weg“ ist immer möglich.
  import { leseZahl } from '../../core/learning/auswertung';
  import { bruch } from '../../core/learning/bruch';
  import type { SchrittErgebnis } from '../../core/learning/ereignis';
  import type { Loesung, SchrittAufgabe, Wert } from '../../core/learning/generator';
  import { tastenFuer } from '../../core/learning/tastatur';
  import { fuelle, zahlText } from '../../core/learning/text';
  import {
    pruefeSchritt,
    VERSUCHE,
    type VorlagenSchritt,
  } from '../../core/learning/zwischenschritte';
  import { t, type TextSchluessel } from '../texte/texte';
  import Tastatur from '../eingabe/Tastatur.svelte';
  import Textteile from './Textteile.svelte';

  let {
    schritte,
    berechne,
    platzhalter,
    vorzeichen = false,
    onfertig,
    onueberspringen,
  }: {
    schritte: readonly VorlagenSchritt[];
    /** Schritt aus dem Generator mit den bisherigen gültigen Eingaben */
    berechne: (id: string, bisher: Readonly<Record<string, Loesung>>) => SchrittAufgabe;
    /** Platzhalter der Aufgabe */
    platzhalter: Readonly<Record<string, Wert>>;
    /** Negative Eingaben möglich: Minustaste (Instanz.vorzeichen) */
    vorzeichen?: boolean | undefined;
    onfertig: (ergebnisse: SchrittErgebnis[]) => void;
    onueberspringen: () => void;
  } = $props();

  interface Erledigt {
    readonly vorlage: VorlagenSchritt;
    readonly frage: string;
    readonly eingabe: Loesung;
    readonly ergebnis: SchrittErgebnis;
  }

  let erledigt = $state<Erledigt[]>([]);
  let fehler = $state<NonNullable<SchrittErgebnis['fehler']>[number][]>([]);
  let hinweis = $state<string | undefined>(undefined);
  let lesefehler = $state<TextSchluessel | undefined>(undefined);
  let feld = $state('');
  let zaehler = $state('');
  let nenner = $state('');
  let fertig = $state(false);

  const bisher = $derived(Object.fromEntries(erledigt.map((e) => [e.vorlage.id, e.eingabe])));
  const aktuell = $derived(fertig ? undefined : schritte[erledigt.length]);
  const aufgabe = $derived(aktuell ? berechne(aktuell.id, bisher) : undefined);

  const alsWert = (l: Loesung): Wert =>
    l.typ === 'bruch' ? l.wert : l.typ === 'zahl' ? l.wert : { de: '' };
  const alsText = (l: Loesung) =>
    l.typ === 'bruch'
      ? `${zahlText(l.wert.zaehler)}/${zahlText(l.wert.nenner)}`
      : l.typ === 'zahl'
        ? zahlText(l.wert)
        : '';

  function werte(a: SchrittAufgabe | undefined, eingabe?: Loesung) {
    const eingaben = Object.fromEntries(Object.entries(bisher).map(([k, v]) => [k, alsWert(v)]));
    return {
      ...platzhalter,
      ...(a?.platzhalter ?? {}),
      ...eingaben,
      ...(eingabe ? { eingabe: alsWert(eingabe) } : {}),
    };
  }

  function lesen(): Loesung | undefined {
    if (!aktuell) return undefined;
    if (aktuell.typ === 'zahl-eingabe') {
      const z = leseZahl(feld);
      if (!z.ok) return void (lesefehler = `eingabe.${z.grund}`);
      return { typ: 'zahl', wert: z.wert };
    }
    const z = leseZahl(zaehler);
    const n = leseZahl(nenner);
    if (!z.ok) return void (lesefehler = `eingabe.${z.grund}`);
    if (!n.ok) return void (lesefehler = `eingabe.${n.grund}`);
    if (n.wert === 0) return void (lesefehler = 'eingabe.nenner-null');
    return { typ: 'bruch', wert: bruch(z.wert, n.wert) };
  }

  function abschliessen(s: VorlagenSchritt, eingabe: Loesung, richtig: boolean, versuche: number) {
    const ergebnis: SchrittErgebnis = {
      id: s.id,
      versuche,
      richtig,
      ...(fehler.length > 0 ? { fehler: [...fehler] } : {}),
    };
    erledigt = [...erledigt, { vorlage: s, frage: s.frage.de, eingabe, ergebnis }];
    fehler = [];
    hinweis = undefined;
    feld = zaehler = nenner = '';
    if (erledigt.length === schritte.length) {
      fertig = true;
      // Schnappschuss: IndexedDB speichert keine Proxys von $state
      onfertig($state.snapshot(erledigt).map((e) => e.ergebnis));
    }
  }

  function pruefen(e: SubmitEvent) {
    e.preventDefault();
    const s = aktuell;
    const a = aufgabe;
    if (!s || !a) return;
    lesefehler = undefined;
    const eingabe = lesen();
    if (!eingabe) return;
    const r = pruefeSchritt(a, eingabe);
    if (r.richtig) return abschliessen(s, eingabe, true, fehler.length + 1);
    const fv = r.fehlerbild ? s.fehlerbilder[r.fehlerbild]?.fv : undefined;
    fehler = [
      ...fehler,
      { ...(r.fehlerbild ? { fehlerbild: r.fehlerbild } : {}), ...(fv ? { fv } : {}), eingabe },
    ];
    if (fehler.length >= VERSUCHE) return abschliessen(s, a.loesung, false, VERSUCHE);
    const text = r.fehlerbild ? s.fehlerbilder[r.fehlerbild]?.de : undefined;
    hinweis = text;
  }

  /** Erster Schritt, in dem etwas schiefging – dort lag der Fehler. */
  const fehlerBei = $derived(erledigt.find((e) => !e.ergebnis.richtig || e.ergebnis.versuche > 1));
</script>

<div class="weg">
  <p class="titel">{t('weg.frage')}</p>

  <ol class="checkliste" aria-label={t('weg.frage')}>
    {#each schritte as s, i (s.id)}
      {@const e = erledigt[i]}
      {@const istAktuell = !fertig && i === erledigt.length}
      <li
        class="check"
        class:erledigt={!!e}
        class:aktuell={istAktuell}
        class:verbessert={e && (!e.ergebnis.richtig || e.ergebnis.versuche > 1)}
        aria-current={istAktuell ? 'step' : undefined}
      >
        <span class="marke" aria-hidden="true">
          {#if e}{#if e.ergebnis.richtig && e.ergebnis.versuche === 1}✓{:else}·{/if}{:else}{i +
              1}{/if}
        </span>
        {#if e}
          <span class="check-text"><Textteile teile={fuelle(e.frage, werte(undefined))} /></span>
          <strong class="check-wert">
            {#if !e.ergebnis.richtig}{t('weg.richtig-ist')}{/if}
            {alsText(e.eingabe)}
          </strong>
        {:else if istAktuell}
          <span class="check-text leise">{t('weg.schritt')} {i + 1}</span>
        {:else}
          <span class="check-text leise">{t('weg.schritt')} {i + 1}</span>
        {/if}
      </li>
    {/each}
  </ol>

  {#if aktuell && aufgabe}
    {#key erledigt.length}
      <form class="aktuell" onsubmit={pruefen} aria-live="polite">
        <p class="nummer">
          {t('weg.schritt')}
          {erledigt.length + 1}
          {t('weg.von')}
          {schritte.length}
        </p>
        <p class="frage"><Textteile teile={fuelle(aktuell.frage.de, werte(aufgabe))} /></p>
        <div class="feld-karte">
          {#if aktuell.typ === 'bruch-eingabe'}
            <div class="bruch">
              <label
                >{t('weg.zaehler')}
                <input inputmode="none" data-tastatur="zaehler" bind:value={zaehler} /></label
              >
              <label
                >{t('weg.nenner')}
                <input inputmode="none" data-tastatur="nenner" bind:value={nenner} /></label
              >
            </div>
          {:else}
            <label class="feld"
              >{t('weg.antwort')}
              <input inputmode="none" data-tastatur="feld" bind:value={feld} /></label
            >
          {/if}
          <div class="tastatur-anbindung">
            <Tastatur
              tasten={tastenFuer({
                loesung: aktuell.typ === 'bruch-eingabe' ? 'bruch' : 'zahl',
                instanz: { vorzeichen },
              })}
            />
          </div>
        </div>
        {#if lesefehler}<p class="leise" role="alert">{t(lesefehler)}</p>{/if}
        {#if fehler.length > 0}
          <div class="hinweis" role="status">
            <p>{t('weg.nochmal')}</p>
            {#if hinweis}
              {@const letzte = fehler.at(-1)?.eingabe}
              <p><Textteile teile={fuelle(hinweis, werte(aufgabe, letzte))} /></p>
            {/if}
          </div>
        {/if}
        <div class="knoepfe">
          <button type="submit" class="haupt">{t('weg.pruefen')}</button>
          <button type="button" class="dezent" onclick={onueberspringen}>{t('weg.ohne')}</button>
        </div>
      </form>
    {/key}
  {:else if fertig}
    <p class="fazit" role="status">
      {#if fehlerBei}
        {t('weg.fehler-hier')}
        <strong><Textteile teile={fuelle(fehlerBei.frage, werte(undefined))} /></strong>
      {:else}
        {t('weg.alles-richtig')}
      {/if}
    </p>
  {/if}
</div>

<style>
  .weg {
    display: grid;
    gap: var(--abstand-s);
    margin-block-start: var(--abstand-s);
  }

  .weg p {
    margin-block: 0;
  }

  .titel {
    font-weight: 700;
    font-size: 1.0625rem;
  }

  .checkliste {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .check {
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr) auto;
    gap: var(--abstand-s);
    align-items: center;
    padding-block: 0.35rem;
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    color: var(--farbe-text-leise);
  }

  .check.erledigt {
    background: transparent;
  }

  .check.aktuell {
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
    font-weight: 600;
    box-shadow: inset 0 0 0 2px var(--farbe-akzent);
  }

  .marke {
    display: grid;
    place-items: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border-radius: 999px;
    background: var(--farbe-flaeche-leise);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .check.erledigt .marke {
    background: var(--farbe-erfolg);
    color: var(--farbe-auf-akzent);
  }

  .check.verbessert .marke {
    background: var(--farbe-akzent-warm);
  }

  .check-wert {
    color: var(--farbe-erfolg);
    font-size: 0.9375rem;
  }

  .check.verbessert .check-wert {
    color: var(--farbe-akzent-warm);
  }

  .aktuell {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    border: 2px solid var(--farbe-akzent);
  }

  .nummer {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .frage {
    font-weight: 600;
    font-size: 1.125rem;
  }

  .feld-karte {
    display: grid;
    gap: var(--abstand-s);
  }

  .tastatur-anbindung {
    padding-block-start: var(--abstand-s);
    border-block-start: 1px solid var(--farbe-rand);
  }

  .bruch {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-m);
  }

  .bruch label,
  .feld {
    display: grid;
    gap: 0.25rem;
  }

  .bruch input,
  .feld input {
    font: inherit;
    font-size: 1.375rem;
    font-variant-numeric: tabular-nums;
    min-block-size: var(--ziel);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
  }

  .bruch input {
    inline-size: 6.5rem;
    text-align: center;
  }

  .feld input {
    inline-size: 10rem;
  }

  .hinweis {
    display: grid;
    gap: 0.25rem;
    padding-inline-start: var(--abstand-s);
    border-inline-start: 4px solid var(--farbe-akzent-warm);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    align-items: center;
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .fazit {
    font-weight: 700;
  }
</style>
