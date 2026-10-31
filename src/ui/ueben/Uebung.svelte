<script lang="ts">
  // Eine Übungsrunde: Aufgabe zeigen, Antwort prüfen, gezielte Rückmeldung zum
  // Fehlerbild, Hilfen, Lösungsweg. Welche Aufgabe als Nächstes kommt, bestimmt
  // `auftrag` – reihum zu einer Kompetenz (Üben) oder aus der Liste fälliger
  // Karten (Wiederholen). Ohne Zeitdruck und ohne Punkte (R1, R2).
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { auswerten, type Bruchform, type Ergebnis } from '../../core/learning/auswertung';
  import type { Generator, Instanz, Loesung } from '../../core/learning/generator';
  import { fuelle } from '../../core/learning/text';
  import { antwortText } from '../../core/learning/werkstatt';
  import { generatoren } from '../../generators';
  import type { Antwortdaten } from '../plattform/ablage';
  import { neuerSeed } from '../plattform/zufall';
  import { t } from '../texte/texte';
  import type { Auftrag } from './auftrag';
  import Eingabe from './Eingabe.svelte';
  import Schrittweg from './Schrittweg.svelte';
  import FvRueckmeldung from './FvRueckmeldung.svelte';
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import type { FvStand, FvZustand } from '../../core/learning/fv-diagnose';
  import type { SchrittErgebnis } from '../../core/learning/ereignis';
  import { untrack } from 'svelte';
  import Textteile from './Textteile.svelte';

  let {
    ueberschrift,
    stufe,
    anzahl,
    auftrag,
    modus,
    paketVon,
    onzurueck,
    onfertig,
    onergebnis,
    vorschlag,
    onwechsel,
    onerklaerung,
    fehlvorstellungen,
    fvStaende,
    rueckwegArt,
    onrueckweg,
    onnutzung,
  }: {
    ueberschrift: string;
    /** Niveau, als Schild neben der Überschrift */
    stufe?: string;
    /** Bekannte Länge der Runde (Wiederholen, Fehlerwerkstatt); sonst Blöcke zu fünf (R5) */
    anzahl?: number;
    /** Der n-te Auftrag dieser Runde; undefined = Runde zu Ende. */
    auftrag: (n: number) => Auftrag | undefined;
    modus: 'ueben' | 'wiederholen' | 'fehlerwerkstatt';
    paketVon: ReadonlyMap<string, string>;
    onzurueck: () => void;
    /** „Fertig für heute“ → Abschlussbildschirm */
    onfertig?: () => void;
    onergebnis: (daten: Antwortdaten) => void;
    /** Rückweg bei Fehlern (LEHRPLAN §7): Vorschlag nach mehreren Fehlern in Folge */
    vorschlag?: (kompetenz: string, fehlerInFolge: number) => Kompetenz | undefined;
    onwechsel?: (k: Kompetenz) => void;
    /** Erstvermittlung dieser Kompetenz ansehen (VERMITTLUNG §2.4), nur wenn es eine gibt */
    onerklaerung?: (() => void) | undefined;
    /** Fehlerkatalog und Diagnose (VERMITTLUNG §3.3) für die Rückmeldung */
    fehlvorstellungen?: ReadonlyMap<string, Fehlvorstellung>;
    fvStaende?: ReadonlyMap<string, FvStand>;
    /** Welcher Rückweg passt: zur Erklärung, zur Grundlage oder keiner */
    rueckwegArt?: (
      fv: Fehlvorstellung,
      zustand: FvZustand | undefined,
    ) => 'erklaerung' | 'grundlage' | undefined;
    onrueckweg?: (fv: Fehlvorstellung, art: 'erklaerung' | 'grundlage') => void;
    /** Nutzungsprotokoll der Testphase (D-18): Hilfen und „Weiter ohne Weg“ */
    onnutzung?: (was: 'hilfe' | 'weg-uebersprungen', ziel: string) => void;
  } = $props();
  let fehlerInFolge = $state(0);
  const BLOCK = 5;

  interface Aufgabe extends Auftrag {
    readonly instanz: Instanz;
    readonly generator: Generator<unknown> | undefined;
    readonly seed: number;
    readonly nummer: number;
    /** Zeitpunkt, zu dem die Aufgabe erschien – nur für die Bearbeitungsdauer im Ereignis. */
    readonly beginn: number;
  }

  let nummer = $state(0);
  let ergebnis = $state<Ergebnis | undefined>(undefined);
  let kommaHinweis = $state(false);
  let hilfen = $state(0);
  let wegOffen = $state(false);

  function erzeuge(n: number): Aufgabe | undefined {
    const a = auftrag(n);
    const generator = a ? generatoren.get(a.vorlage.generator) : undefined;
    if (!a || !generator) return undefined;
    const seed = a.seed ?? neuerSeed();
    return {
      ...a,
      generator,
      instanz: generator.erzeuge(seed, a.vorlage.parameter[a.niveau]),
      seed,
      nummer: n,
      beginn: Date.now(),
    };
  }

  let aufgabe = $derived(erzeuge(nummer));

  /**
   * Zwischenschritte (K-29): Nach einem falschen Ergebnis fragt Bastion nach dem Weg,
   * wenn die Vorlage Schritte hat. Das Ereignis wird erst danach gespeichert, damit
   * die Schritte darin stehen (D-17).
   */
  let weg = $state<'aus' | 'laeuft' | 'fertig'>('aus');
  // raw: das Ereignis muss sich in IndexedDB speichern lassen (kein Proxy)
  let ausstehend = $state.raw<Antwortdaten | undefined>(undefined);
  /** Schritte der letzten Antwort – ihre Fehlvorstellungen zählen für die Rückmeldung */
  let letzteSchritte = $state.raw<readonly SchrittErgebnis[]>([]);

  function speichern(schritte?: SchrittErgebnis[]) {
    if (!ausstehend) return;
    letzteSchritte = schritte ?? [];
    onergebnis(schritte ? { ...ausstehend, schritte } : ausstehend);
    ausstehend = undefined;
    weg = 'fertig';
  }

  // Verlässt jemand die Übung mitten im Weg, wird das Ergebnis ohne Schritte gespeichert.
  $effect(() => () => {
    const a = untrack(() => ausstehend);
    if (a) onergebnis(a);
  });

  function beantwortet(antwort: Loesung, hinweis?: 'punkt-statt-komma') {
    if (!aufgabe) return;
    const form = (aufgabe.vorlage.antwort?.['form'] ?? 'beliebig') as Bruchform;
    ergebnis = auswerten(aufgabe.instanz, antwort, form);
    kommaHinweis = hinweis === 'punkt-statt-komma';
    const daten: Antwortdaten = {
      modus,
      ...(aufgabe.korrigiert ? { korrigiert: aufgabe.korrigiert } : {}),
      kompetenz: aufgabe.kompetenz.id,
      vorlage: aufgabe.vorlage.id,
      niveau: aufgabe.niveau,
      generator: aufgabe.vorlage.generator,
      seed: aufgabe.seed,
      paket: paketVon.get(aufgabe.vorlage.id) ?? '',
      hilfen,
      dauerMs: Date.now() - aufgabe.beginn,
      platzhalter: aufgabe.instanz.platzhalter,
      loesung: aufgabe.instanz.loesung,
      antwort,
      ergebnis,
    };
    const mitWeg =
      !ergebnis.richtig &&
      (aufgabe.vorlage.schritte?.length ?? 0) > 0 &&
      aufgabe.generator?.schritt !== undefined;
    if (mitWeg) {
      ausstehend = daten;
      weg = 'laeuft';
    } else onergebnis(daten);
    if (!ergebnis.richtig) wegOffen = !mitWeg;
    fehlerInFolge = ergebnis.richtig ? 0 : fehlerInFolge + 1;
  }

  function weiter() {
    weg = 'aus';
    letzteSchritte = [];
    ergebnis = undefined;
    kommaHinweis = false;
    hilfen = 0;
    wegOffen = false;
    nummer += 1;
  }

  /** Erledigte Aufgaben dieser Runde – nur Menge, keine Zeit und kein Urteil (R1, R2) */
  const erledigt = $derived(nummer + (ergebnis ? 1 : 0));
  /** Punkte für den Fortschritt: die ganze Runde oder der laufende Fünferblock */
  const punkte = $derived.by(() => {
    if (anzahl !== undefined) return { gesamt: anzahl, voll: Math.min(erledigt, anzahl) };
    const imBlock = erledigt % BLOCK;
    return { gesamt: BLOCK, voll: imBlock === 0 && erledigt > 0 ? BLOCK : imBlock };
  });
  /** Nach jedem vollen Block: ein natürlicher Pausenpunkt (R5) */
  const pause = $derived(anzahl === undefined && ergebnis !== undefined && erledigt % BLOCK === 0);

  const rueckwegZu = $derived(
    ergebnis && !ergebnis.richtig && aufgabe && vorschlag
      ? vorschlag(aufgabe.kompetenz.id, fehlerInFolge)
      : undefined,
  );

  /** Erkannte Fehlvorstellungen dieser Antwort: Fehlerbild des Ergebnisses und der Schritte */
  const fvs = $derived.by((): Fehlvorstellung[] => {
    if (!ergebnis || ergebnis.richtig || !aufgabe || weg === 'laeuft' || !fehlvorstellungen)
      return [];
    const aus = ergebnis.fehlerbild
      ? aufgabe.vorlage.fehlerbilder[ergebnis.fehlerbild]?.fv
      : undefined;
    const ids = new Set(
      [aus, ...letzteSchritte.flatMap((s) => (s.fehler ?? []).map((f) => f.fv))].filter(
        (x): x is string => x !== undefined,
      ),
    );
    return [...ids].flatMap((id) => {
      const fv = fehlvorstellungen.get(id);
      return fv ? [fv] : [];
    });
  });

  const rueckmeldung = $derived.by(() => {
    if (!ergebnis || ergebnis.richtig || !aufgabe) return undefined;
    if (ergebnis.fehlerbild) {
      const text = aufgabe.vorlage.fehlerbilder[ergebnis.fehlerbild];
      if (text) return fuelle(text.de, aufgabe.instanz.platzhalter);
    }
    if (ergebnis.hinweis) return fuelle(t(`uebung.${ergebnis.hinweis}`), {});
    return undefined;
  });
</script>

<section class="uebung">
  <button class="zurueck" onclick={onzurueck}>← {t('uebung.zurueck')}</button>
  <header class="kopf">
    <h2>{ueberschrift}</h2>
    {#if stufe}<span class="stufe">{stufe}</span>{/if}
    {#if onerklaerung}
      <button class="zweit erklaerung" onclick={onerklaerung}>{t('vermittlung.knopf')}</button>
    {/if}
    {#if aufgabe || erledigt > 0}
      <span
        class="punkte"
        role="img"
        aria-label="{punkte.voll} {t('uebung.von')} {punkte.gesamt} {t('uebung.erledigt')}"
      >
        {#each Array.from({ length: punkte.gesamt }, (_, i) => i) as i (i)}
          <span class="punkt" class:voll={i < punkte.voll}></span>
        {/each}
      </span>
    {/if}
  </header>

  {#if !aufgabe}
    <p>
      {nummer === 0
        ? t('uebung.keine-aufgaben')
        : modus === 'wiederholen'
          ? t('wiederholen.fertig')
          : t('werkstatt.fertig')}
    </p>
  {:else}
    {#key aufgabe}
      <article class="aufgabe" aria-live="polite">
        {#if modus !== 'ueben'}
          <p class="herkunft">
            {aufgabe.kompetenz.titel.de} · {t(`niveau.${aufgabe.niveau === 'G' ? 'G' : 'M'}`)}
          </p>
        {/if}
        <p class="text">
          <Textteile teile={fuelle(aufgabe.vorlage.text.aufgabe.de, aufgabe.instanz.platzhalter)} />
        </p>
        {#if aufgabe.instanz.bild}
          <figure class="bild" role="img" aria-label={aufgabe.instanz.bild.beschreibung.de}>
            <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                 die Pflicht-Tests schließen Skripte und Verweise aus. -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html aufgabe.instanz.bild.svg}
          </figure>
        {/if}

        {#if aufgabe.frueher}
          <p class="damals">
            {t('werkstatt.damals')}
            <strong
              >{antwortText(
                aufgabe.frueher,
                aufgabe.instanz.optionen,
                aufgabe.vorlage.typ === 'uhrzeit-eingabe',
              )}</strong
            >
          </p>
        {/if}

        <Eingabe
          instanz={aufgabe.instanz}
          typ={aufgabe.vorlage.typ}
          tastatur={aufgabe.vorlage.tastatur}
          gesperrt={ergebnis !== undefined}
          onantwort={beantwortet}
        />

        <div class="knoepfe">
          {#if ergebnis === undefined}
            <button type="submit" form="antwort" class="haupt">{t('uebung.pruefen')}</button>
            {#if hilfen < aufgabe.vorlage.hilfen.length}
              <button
                class="zweit"
                onclick={() => {
                  hilfen += 1;
                  onnutzung?.('hilfe', `tipp:${aufgabe?.vorlage.id ?? ''}`);
                }}
              >
                {hilfen === 0 ? t('uebung.hilfe') : t('uebung.weitere-hilfe')}
              </button>
            {/if}
          {/if}
        </div>

        {#if hilfen > 0 && ergebnis === undefined}
          <ul class="hilfen">
            {#each aufgabe.vorlage.hilfen.slice(0, hilfen) as hilfe, i (i)}
              <li><Textteile teile={fuelle(hilfe.de, aufgabe.instanz.platzhalter)} /></li>
            {/each}
          </ul>
        {/if}

        {#if ergebnis}
          <div class="rueckmeldung" class:richtig={ergebnis.richtig} role="status">
            <p class="urteil">{ergebnis.richtig ? t('uebung.richtig') : t('uebung.falsch')}</p>
            {#if weg !== 'laeuft'}
              {#if rueckmeldung}<p><Textteile teile={rueckmeldung} /></p>{/if}
              {#if kommaHinweis}<p>{t('uebung.punkt-statt-komma')}</p>{/if}
            {/if}
          </div>
          {#if weg !== 'aus' && aufgabe.vorlage.schritte && aufgabe.generator?.schritt}
            {@const g = aufgabe.generator}
            {@const a = aufgabe}
            <Schrittweg
              schritte={a.vorlage.schritte ?? []}
              berechne={(id, bisher) =>
                (g.schritt as NonNullable<typeof g.schritt>)(
                  a.seed,
                  a.vorlage.parameter[a.niveau],
                  id,
                  bisher,
                )}
              platzhalter={a.instanz.platzhalter}
              vorzeichen={a.instanz.vorzeichen}
              onfertig={(s) => speichern(s)}
              onueberspringen={() => {
                speichern();
                wegOffen = true;
                onnutzung?.('weg-uebersprungen', a.vorlage.id);
              }}
            />
          {/if}
          {#if weg !== 'laeuft'}
            {#each fvs as fv (fv.id)}
              {@const zustand = fvStaende?.get(fv.id)?.zustand}
              {@const art = rueckwegArt?.(fv, zustand)}
              <FvRueckmeldung
                {fv}
                {zustand}
                rueckweg={art}
                onrueckweg={() => art && onrueckweg?.(fv, art)}
              />
            {/each}
            <details class="weg" bind:open={wegOffen}>
              <summary
                onclick={() => {
                  // nur das Öffnen von Hand zählt, nicht das automatische nach einem Fehler
                  if (!wegOffen) onnutzung?.('hilfe', `loesungsweg:${aufgabe?.vorlage.id ?? ''}`);
                }}>{t('uebung.loesungsweg')}</summary
              >
              <ol>
                {#each aufgabe.instanz.loesungsweg as schritt, i (i)}
                  <li>{schritt.de}</li>
                {/each}
              </ol>
            </details>
            {#if rueckwegZu && onwechsel}
              {@const ziel = rueckwegZu}
              <div class="rueckweg">
                <p>{t('rueckweg.text')} <strong>{ziel.titel.de}</strong></p>
                <button class="zweit" onclick={() => onwechsel(ziel)}>{t('rueckweg.knopf')}</button>
              </div>
            {/if}
            {#if pause}<p class="pause">{t('uebung.pause')}</p>{/if}
            <div class="knoepfe">
              <button class="haupt" onclick={weiter}>{t('uebung.weiter')}</button>
            </div>
          {/if}
        {/if}
      </article>
    {/key}
  {/if}
  {#if onfertig && nummer + (ergebnis ? 1 : 0) > 0}
    <button class="zweit fertig" onclick={onfertig}>{t('abschluss.knopf')}</button>
  {/if}
</section>

<style>
  .uebung {
    display: grid;
    gap: var(--abstand-m);
  }

  .kopf {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s) var(--abstand-m);
  }

  h2 {
    margin-block: 0;
    font-size: 1.375rem;
  }

  .stufe {
    font-size: 0.875rem;
    font-weight: 700;
    padding-block: 0.125rem;
    padding-inline: var(--abstand-s);
    border-radius: 999px;
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text-leise);
  }

  .punkte {
    display: flex;
    gap: 0.375rem;
    margin-inline-start: auto;
  }

  .punkt {
    inline-size: 0.625rem;
    block-size: 0.625rem;
    border-radius: 50%;
    background: var(--farbe-flaeche-leise);
    box-shadow: inset 0 0 0 1.5px var(--farbe-text-leise);
  }

  .punkt.voll {
    background: var(--farbe-akzent);
    box-shadow: none;
  }

  .aufgabe {
    background: var(--farbe-flaeche);
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    padding: var(--abstand-m);
  }

  .rueckweg {
    margin-block: var(--abstand-m);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-hinweis-flaeche);
  }

  .damals {
    color: var(--farbe-text-leise);
  }

  .herkunft {
    color: var(--farbe-text-leise);
    font-size: 1rem;
    margin-block-start: 0;
  }

  .text {
    font-size: 1.375rem;
    font-weight: 600;
    line-height: 1.4;
    margin-block-start: 0;
  }

  .bild {
    margin-inline: auto;
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

  .knoepfe .haupt {
    padding-inline: var(--abstand-l);
  }

  .fertig {
    justify-self: start;
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

  .hilfen {
    color: var(--farbe-text-leise);
  }

  .rueckmeldung {
    margin-block-start: var(--abstand-m);
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
    font-size: 1.25rem;
  }

  .rueckmeldung.richtig .urteil {
    color: var(--farbe-erfolg);
  }

  .weg {
    margin-block: var(--abstand-m);
  }

  .weg summary {
    cursor: pointer;
    font-weight: 700;
    min-block-size: var(--ziel);
    display: flex;
    align-items: center;
  }

  .pause {
    color: var(--farbe-text-leise);
  }
</style>
