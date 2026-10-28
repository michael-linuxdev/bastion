<script lang="ts">
  // Diagnose (LEHRPLAN §7): adaptiver Gang durch den Graphen, ohne Hilfen und
  // ohne Richtig/Falsch-Anzeige während des Tests, Pausenpunkt nach der ersten
  // Etappe, Ergebnis als „Hier stehst du – hier geht es weiter“ statt Punktzahl.
  import { nachGraph, type Kompetenz } from '../../core/competence/kompetenz';
  import { auswerten, type Bruchform } from '../../core/learning/auswertung';
  import { diagnose, empfehlungen, kann, type Antwort } from '../../core/learning/diagnose';
  import type { Instanz, Loesung } from '../../core/learning/generator';
  import { fuelle } from '../../core/learning/text';
  import { vorlagenFuer } from '../../core/learning/uebung';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { generatoren } from '../../generators';
  import type { Antwortdaten } from '../plattform/ablage';
  import { neuerSeed } from '../plattform/zufall';
  import { t } from '../texte/texte';
  import Eingabe from './Eingabe.svelte';
  import { nachBereich } from './reihenfolge';
  import Textteile from './Textteile.svelte';

  let {
    kompetenzen,
    vorlagen,
    paketVon,
    antworten = $bindable(),
    onergebnis,
    onueben,
    onende,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    paketVon: ReadonlyMap<string, string>;
    /** Antworten dieses Diagnosegangs – beim Elternteil gehalten, damit „Später“ weitergeht */
    antworten: Antwort[];
    onergebnis: (daten: Antwortdaten) => void;
    onueben: (k: Kompetenz) => void;
    onende: () => void;
  } = $props();

  // Nur Kompetenzen der Klasse 5 mit Aufgaben auf Niveau G, in Graphreihenfolge
  const klasse5 = $derived(
    nachGraph(nachBereich(kompetenzen)).filter(
      (k) => k.klassenstufe_typisch.includes(5) && vorlagenFuer(vorlagen, k.id, 'G').length > 0,
    ),
  );
  const stand = $derived(diagnose(klasse5, antworten));
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
    const kompetenz = klasse5.find((k) => k.id === stand.naechste);
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

  function weiter(antwort: Loesung, ergebnis: { richtig: boolean }, unbekannt = false) {
    if (!aufgabe) return;
    onergebnis({
      modus: 'diagnose',
      kompetenz: aufgabe.kompetenz.id,
      vorlage: aufgabe.vorlage.id,
      niveau: 'G',
      generator: aufgabe.vorlage.generator,
      seed: aufgabe.seed,
      paket: paketVon.get(aufgabe.vorlage.id) ?? '',
      hilfen: 0,
      dauerMs: Date.now() - aufgabe.beginn,
      platzhalter: aufgabe.instanz.platzhalter,
      loesung: aufgabe.instanz.loesung,
      antwort: unbekannt ? { typ: 'auswahl', wert: -1 } : antwort,
      ergebnis,
    });
    antworten.push({ kompetenz: aufgabe.kompetenz.id, richtig: ergebnis.richtig });
    aufgabe = neueAufgabe();
  }

  const titel = (id: string) => klasse5.find((k) => k.id === id);
  const sitzt = $derived(klasse5.filter((k) => kann(stand, k.id)));
  const weiterMit = $derived(
    empfehlungen(klasse5, stand)
      .map(titel)
      .filter((k): k is Kompetenz => k !== undefined),
  );
  const pause = $derived(stand.aufgaben >= 15 && !pauseGesehen && stand.naechste !== undefined);
</script>

<section class="diagnose">
  <h2>{t('diagnose.ueberschrift')}</h2>

  {#if !gestartet && stand.naechste && !pause}
    <p>{t('diagnose.einleitung')}</p>
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
          </div>
        </article>
      {/key}
    {/if}
  {:else}
    <h3>{t('diagnose.ergebnis')}</h3>
    {#if weiterMit.length > 0}
      <p>{t('diagnose.empfehlung')}</p>
      <ul class="liste">
        {#each weiterMit as k (k.id)}
          <li>
            <span>{k.titel.de}</span>
            <button class="haupt" onclick={() => onueben(k)}>{t('diagnose.ueben')}</button>
          </li>
        {/each}
      </ul>
    {:else}
      <p>{t('diagnose.alles')}</p>
    {/if}
    {#if sitzt.length > 0}
      <details>
        <summary>{t('diagnose.sitzt')} ({sitzt.length})</summary>
        <ul>
          {#each sitzt as k (k.id)}<li>{k.titel.de}</li>{/each}
        </ul>
      </details>
    {/if}
    {#if stand.getestet.size + stand.gefolgert.size < klasse5.length}
      <p class="leise">{t('diagnose.noch-offen')}</p>
    {/if}
  {/if}
</section>

<style>
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
    color: var(--farbe-hintergrund);
  }

  .liste {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .liste li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--abstand-s);
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
  }
</style>
