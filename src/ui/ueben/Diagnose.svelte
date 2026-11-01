<script lang="ts">
  // Diagnose (LEHRPLAN §7): adaptiver Gang durch den Graphen, ohne Hilfen und
  // ohne Richtig/Falsch-Anzeige während des Tests, Pausenpunkt nach der ersten
  // Etappe, Ergebnis als „Hier stehst du – hier geht es weiter“ statt Punktzahl.
  import { nachGraph, type Kompetenz } from '../../core/competence/kompetenz';
  import { auswerten, type Bruchform } from '../../core/learning/auswertung';
  import {
    diagnose,
    empfehlungen,
    kann,
    standKlasse,
    type Antwort,
  } from '../../core/learning/diagnose';
  import { KLASSEN } from './klassen';
  import type { Instanz, Loesung } from '../../core/learning/generator';
  import { fuelle } from '../../core/learning/text';
  import { vorlagenFuer } from '../../core/learning/uebung';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { generatoren } from '../../generators';
  import type { Antwortdaten } from '../plattform/ablage';
  import { neuerSeed } from '../plattform/zufall';
  import { t } from '../texte/texte';
  import Eingabe from './Eingabe.svelte';
  import KlassenWahl from './KlassenWahl.svelte';
  import { nachBereich } from './reihenfolge';
  import Textteile from './Textteile.svelte';

  let {
    kompetenzen,
    vorlagen,
    paketVon,
    antworten = $bindable(),
    klasse = $bindable(5),
    auswahl,
    uebergreifend = $bindable(false),
    probe = false,
    /** Hinweis-Joker aus Türmen (Bewährungsprobe Üben, BASEBAU §5.6) */
    joker = 0,
    onklasse,
    onergebnis,
    onueben,
    onende,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    paketVon: ReadonlyMap<string, string>;
    /** Antworten dieses Diagnosegangs – beim Elternteil gehalten, damit „Später“ weitergeht */
    antworten: Antwort[];
    /** Klassenstufe der Diagnose; wählbar, solange noch nichts beantwortet ist */
    klasse?: number;
    /** Nur diese Kompetenzen prüfen (Wechsel begleiten, L-12) – statt einer ganzen Klasse */
    auswahl?: readonly string[] | undefined;
    /** Wiedereinstieg (L-16): alle Klassen in einem Gang statt einer Klasse */
    uebergreifend?: boolean;
    /** Probe-Klassenarbeit (L-19): Antworten zählen als Prüfung, nicht als Diagnose */
    probe?: boolean;
    /** Verbleibende Joker (0 = keine Anzeige / Ernstfall) */
    joker?: number;
    /** Nach dem Wiedereinstieg: in der Übersicht diese Klasse zeigen */
    onklasse?: (klasse: number) => void;
    onergebnis: (daten: Antwortdaten) => void;
    onueben: (k: Kompetenz) => void;
    onende: () => void;
  } = $props();

  let jokerVerbrauch = $state(0);
  const jokerRest = $derived(Math.max(0, joker - jokerVerbrauch));

  // Nur Kompetenzen der gewählten Klasse mit Aufgaben auf Niveau G, in Graphreihenfolge
  const themen = $derived(
    nachGraph(nachBereich(kompetenzen)).filter(
      (k) =>
        (auswahl
          ? auswahl.includes(k.id)
          : uebergreifend
            ? Math.min(...k.klassenstufe_typisch) <= (KLASSEN[KLASSEN.length - 1] ?? 5)
            : k.klassenstufe_typisch.includes(klasse)) &&
        vorlagenFuer(vorlagen, k.id, 'G').length > 0,
    ),
  );
  const stand = $derived(diagnose(themen, antworten));
  let gestartet = $state(false);
  let pauseGesehen = $state(false);

  interface Aufgabe {
    readonly kompetenz: Kompetenz;
    readonly vorlage: GeneratorVorlage;
    readonly instanz: Instanz;
    readonly seed: number;
    readonly beginn: number;
  }

  function neueAufgabe(): Aufgabe | undefined {
    const kompetenz = themen.find((k) => k.id === stand.naechste);
    if (!kompetenz) return undefined;
    // Vorlagen reihum, damit zwei Antworten aus zwei Vorlagen stammen
    const schon = antworten.filter((a) => a.kompetenz === kompetenz.id).length;
    const auswahl = vorlagenFuer(vorlagen, kompetenz.id, 'G');
    const vorlage = auswahl[schon % auswahl.length];
    const generator = vorlage ? generatoren.get(vorlage.generator) : undefined;
    if (!vorlage || !generator) return undefined;
    const seed = neuerSeed();
    return {
      kompetenz,
      vorlage,
      instanz: generator.erzeuge(seed, vorlage.parameter['G']),
      seed,
      beginn: Date.now(),
    };
  }

  let aufgabe = $state<Aufgabe | undefined>(undefined);

  function starte() {
    gestartet = true;
    aufgabe = neueAufgabe();
  }

  function beantwortet(antwort: Loesung) {
    if (!aufgabe) return;
    const form = (aufgabe.vorlage.antwort?.['form'] ?? 'beliebig') as Bruchform;
    const ergebnis = auswerten(aufgabe.instanz, antwort, form);
    weiter(antwort, ergebnis.richtig ? ergebnis : { richtig: false });
  }

  function weissNicht() {
    if (!aufgabe) return;
    // „Weiß ich nicht“ ist eine ehrliche Antwort und zählt wie eine falsche – ohne Schnappschuss-Antwort
    weiter(aufgabe.instanz.loesung, { richtig: false }, true);
  }

  /** Einen Joker verbrauchen: Aufgabe gilt als richtig (nur Bewährungsprobe Üben). */
  function jokerNutzen() {
    if (!aufgabe || jokerRest <= 0) return;
    jokerVerbrauch += 1;
    weiter(aufgabe.instanz.loesung, { richtig: true }, false, true);
  }

  function weiter(
    antwort: Loesung,
    ergebnis: { richtig: boolean },
    unbekannt = false,
    mitJoker = false,
  ) {
    if (!aufgabe) return;
    onergebnis({
      modus: probe ? 'pruefung' : 'diagnose',
      kompetenz: aufgabe.kompetenz.id,
      vorlage: aufgabe.vorlage.id,
      niveau: 'G',
      generator: aufgabe.vorlage.generator,
      seed: aufgabe.seed,
      paket: paketVon.get(aufgabe.vorlage.id) ?? '',
      hilfen: mitJoker ? 1 : 0,
      dauerMs: Date.now() - aufgabe.beginn,
      platzhalter: aufgabe.instanz.platzhalter,
      loesung: aufgabe.instanz.loesung,
      antwort: unbekannt ? { typ: 'auswahl', wert: -1 } : antwort,
      ergebnis,
    });
    antworten.push({ kompetenz: aufgabe.kompetenz.id, richtig: ergebnis.richtig });
    aufgabe = neueAufgabe();
  }

  const titel = (id: string) => themen.find((k) => k.id === id);
  const sitzt = $derived(themen.filter((k) => kann(stand, k.id)));
  const weiterMit = $derived(
    empfehlungen(themen, stand)
      .map(titel)
      .filter((k): k is Kompetenz => k !== undefined),
  );
  const pause = $derived(stand.aufgaben >= 15 && !pauseGesehen && stand.naechste !== undefined);
  /** Stand im Sinne einer Klasse (L-16) – nur beim Wiedereinstieg */
  const standK = $derived(uebergreifend ? standKlasse(themen, stand) : undefined);
  const weiterKlasse = $derived(
    standK === undefined ? undefined : Math.min(standK + 1, KLASSEN[KLASSEN.length - 1] ?? 5),
  );
</script>

<section class="diagnose">
  <h2>{probe ? t('ka.probe') : t('diagnose.ueberschrift')}</h2>
  {#if joker > 0}
    <p class="leise" role="status">{t('bastion.bewaehrung-joker')}: {jokerRest}</p>
  {/if}

  {#if !gestartet && stand.naechste && !pause}
    <p>{probe ? t('ka.probe-einleitung') : t('diagnose.einleitung')}</p>
    {#if antworten.length === 0 && !auswahl}
      <fieldset class="umfang">
        <legend>{t('diagnose.umfang')}</legend>
        <label
          ><input type="radio" value={false} bind:group={uebergreifend} />
          {t('diagnose.eine-klasse')}</label
        >
        <label
          ><input type="radio" value={true} bind:group={uebergreifend} />
          {t('diagnose.alle-klassen')}</label
        >
      </fieldset>
      {#if !uebergreifend}<KlassenWahl bind:klasse />{/if}
    {/if}
    <p class="leise">{t('diagnose.dauer')}</p>
    <button class="haupt" onclick={starte}
      >{antworten.length === 0 ? t('diagnose.starten') : t('diagnose.weiter')}</button
    >
  {:else if pause}
    <p>{t('diagnose.halbzeit')}</p>
    <div class="knoepfe">
      <button
        class="haupt"
        onclick={() => {
          pauseGesehen = true;
          aufgabe ??= neueAufgabe();
          gestartet = true;
        }}>{t('diagnose.weiter')}</button
      >
      <button onclick={onende}>{t('diagnose.spaeter')}</button>
    </div>
  {:else if stand.naechste}
    {#if aufgabe}
      {#key aufgabe}
        <article class="aufgabe">
          <p class="text">
            <Textteile
              teile={fuelle(aufgabe.vorlage.text.aufgabe.de, aufgabe.instanz.platzhalter)}
              erklaeren={false}
            />
          </p>
          {#if aufgabe.instanz.bild}
            <figure class="bild" role="img" aria-label={aufgabe.instanz.bild.beschreibung.de}>
              <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                   die Pflicht-Tests schließen Skripte und Verweise aus. -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html aufgabe.instanz.bild.svg}
            </figure>
          {/if}
          <Eingabe
            instanz={aufgabe.instanz}
            typ={aufgabe.vorlage.typ}
            gesperrt={false}
            onantwort={beantwortet}
          />
          <div class="knoepfe">
            <button type="submit" form="antwort" class="haupt">{t('diagnose.weiter')}</button>
            <button onclick={weissNicht}>{t('diagnose.weiss-nicht')}</button>
            {#if jokerRest > 0}
              <button onclick={jokerNutzen}>{t('bastion.bewaehrung-joker-nutzen')}</button>
            {/if}
          </div>
        </article>
      {/key}
    {/if}
  {:else}
    <h3>{t('diagnose.ergebnis')}</h3>
    {#if uebergreifend && standK !== undefined}
      <p class="stand">
        {standK < 5 ? t('diagnose.stand-unter') : `${t('diagnose.stand')} ${standK}.`}
      </p>
      {#if weiterKlasse !== undefined && onklasse}
        <p>
          <button class="zweit" onclick={() => onklasse(weiterKlasse)}
            >{t('diagnose.klasse-zeigen')} {weiterKlasse}</button
          >
        </p>
      {/if}
    {/if}
    <div class="landkarte" aria-label={t('diagnose.landkarte')}>
      {#if sitzt.length > 0}
        <section class="feld sitzt">
          <h4>{t('diagnose.sitzt')}</h4>
          <ul class="steine">
            {#each sitzt as k (k.id)}
              <li class="stein sitzt">{k.titel.de}</li>
            {/each}
          </ul>
        </section>
      {/if}
      {#if weiterMit.length > 0}
        <section class="feld wackelt">
          <h4>
            {probe ? t('ka.probe-noch') : auswahl ? t('diagnose.luecken') : t('diagnose.wackelt')}
          </h4>
          <ul class="steine">
            {#each weiterMit as k, i (k.id)}
              <li class="stein wackelt" class:naechster={i === 0}>
                <span>{k.titel.de}</span>
                {#if i === 0}<span class="naechster-label">{t('diagnose.naechster')}</span>{/if}
                <button class="haupt" onclick={() => onueben(k)}>{t('diagnose.ueben')}</button>
              </li>
            {/each}
          </ul>
        </section>
      {:else}
        <p>
          {probe
            ? t('ka.probe-alles')
            : auswahl
              ? t('diagnose.keine-luecken')
              : t('diagnose.alles')}
        </p>
      {/if}
    </div>
    {#if stand.getestet.size + stand.gefolgert.size < themen.length}
      <p class="leise">{t('diagnose.noch-offen')}</p>
    {/if}
  {/if}
</section>

<style>
  .umfang {
    display: grid;
    gap: var(--abstand-s);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .umfang label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .stand {
    font-weight: 600;
  }

  .landkarte {
    display: grid;
    gap: var(--abstand-m);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche-leise);
    border: 1px solid var(--farbe-rand);
  }

  .feld h4 {
    margin-block: 0 var(--abstand-s);
    font-size: 1rem;
  }

  .steine {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .stein {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem var(--abstand-s);
    padding-block: 0.45rem;
    padding-inline: 0.75rem;
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    font-size: 0.95rem;
  }

  .stein.sitzt {
    border-inline-start: 4px solid var(--farbe-erfolg);
  }

  .stein.wackelt {
    border-inline-start: 4px solid var(--farbe-akzent-warm);
  }

  .stein.naechster {
    outline: 2px solid var(--farbe-akzent);
    outline-offset: 1px;
  }

  .naechster-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--farbe-akzent);
  }

  .diagnose {
    display: grid;
    gap: var(--abstand-s);
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .aufgabe {
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding-block: var(--abstand-m);
    padding-inline: var(--abstand-m);
  }

  .text {
    font-size: 1.25rem;
    margin-block-start: 0;
  }

  .bild {
    margin-inline: 0;
    max-inline-size: 26rem;
  }

  .bild :global(svg) {
    inline-size: 100%;
    block-size: auto;
  }

  /* L19: gefärbte Teile in derselben warmen Farbe wie der Bruchstreifen der Erklärung */
  .bild :global([fill-opacity='0.35']) {
    fill: var(--farbe-akzent-warm);
    fill-opacity: 1;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
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
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
  }
</style>
