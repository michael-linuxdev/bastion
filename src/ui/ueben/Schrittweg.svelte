<script lang="ts">
  // Zwischenschritte nach einem falschen Ergebnis (VERMITTLUNG §3.6, K-29):
  // ein Schritt nach dem anderen, zwei Versuche je Schritt. Beim ersten Fehler
  // kommt ein Hinweis zur Ursache, beim zweiten zeigt Bastion den Schritt und
  // rechnet damit weiter. „Weiter ohne Weg“ ist immer möglich.
  import { leseZahl } from '../../core/learning/auswertung';
  import { bruch } from '../../core/learning/bruch';
  import type { SchrittErgebnis } from '../../core/learning/ereignis';
  import type { Loesung, SchrittAufgabe, Wert } from '../../core/learning/generator';
  import { fuelle, zahlText } from '../../core/learning/text';
  import {
    pruefeSchritt,
    VERSUCHE,
    type VorlagenSchritt,
  } from '../../core/learning/zwischenschritte';
  import { t, type TextSchluessel } from '../texte/texte';
  import Textteile from './Textteile.svelte';

  let {
    schritte,
    berechne,
    platzhalter,
    onfertig,
    onueberspringen,
  }: {
    schritte: readonly VorlagenSchritt[];
    /** Schritt aus dem Generator mit den bisherigen gültigen Eingaben */
    berechne: (id: string, bisher: Readonly<Record<string, Loesung>>) => SchrittAufgabe;
    /** Platzhalter der Aufgabe */
    platzhalter: Readonly<Record<string, Wert>>;
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
  <ol class="schritte">
    {#each erledigt as e, i (e.vorlage.id)}
      <li class="erledigt" class:verbessert={!e.ergebnis.richtig || e.ergebnis.versuche > 1}>
        <span><Textteile teile={fuelle(e.frage, werte(undefined))} /></span>
        <strong>
          {#if !e.ergebnis.richtig}{t('weg.richtig-ist')}{:else}✓{/if}
          {alsText(e.eingabe)}
        </strong>
        <span class="unsichtbar">{t('weg.schritt')} {i + 1}</span>
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
        {#if aktuell.typ === 'bruch-eingabe'}
          <div class="bruch">
            <label>{t('weg.zaehler')} <input inputmode="numeric" bind:value={zaehler} /></label>
            <label>{t('weg.nenner')} <input inputmode="numeric" bind:value={nenner} /></label>
          </div>
        {:else}
          <label class="feld"
            >{t('weg.antwort')} <input inputmode="decimal" bind:value={feld} /></label
          >
        {/if}
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
    margin-block-start: var(--abstand-m);
  }

  .weg p {
    margin-block: 0;
  }

  .titel {
    font-weight: 800;
  }

  .schritte {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding-inline-start: var(--abstand-m);
  }

  .erledigt {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    color: var(--farbe-text-leise);
  }

  .erledigt strong {
    color: var(--farbe-erfolg);
  }

  .erledigt.verbessert strong {
    color: var(--farbe-akzent-warm);
  }

  .aktuell {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
  }

  .nummer {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
  }

  .frage {
    font-weight: 600;
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

  .bruch input {
    inline-size: 6rem;
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
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .fazit {
    font-weight: 700;
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
