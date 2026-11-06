<script lang="ts">
  // Eine Übungsrunde: Aufgabe zeigen, Antwort prüfen, gezielte Rückmeldung zum
  // Fehlerbild, Hilfen, Lösungsweg. Welche Aufgabe als Nächstes kommt, bestimmt
  // `auftrag` – reihum zu einer Kompetenz (Üben) oder aus der Liste fälliger
  // Karten (Wiederholen). Ohne Zeitdruck und ohne Punkte (R1, R2).
  // Ein-/Ausgabe: ein Arbeitsblatt, zwei Phasen (ueben-io-design P0/P1).
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import ZurueckKnopf from '../start/ZurueckKnopf.svelte';
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
  import Rechentext from './Rechentext.svelte';
  import Schrittweg from './Schrittweg.svelte';
  import FvRueckmeldung from './FvRueckmeldung.svelte';
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import type { FvStand, FvZustand } from '../../core/learning/fv-diagnose';
  import type { SchrittErgebnis } from '../../core/learning/ereignis';
  import { untrack } from 'svelte';
  import Textteile from './Textteile.svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import { soundUiErgebnis } from '../bastion/sound/sound';

  let {
    ueberschrift,
    stufe,
    anzahl,
    auftrag,
    modus,
    paketVon,
    onzurueck,
    onfertig,
    /** Offene Aufgabe merken und zum Hub (N78) */
    onspaeter,
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
    /** „Später weiter“ → Hub mit sichtbarer offener Aufgabe */
    onspaeter?: (kompetenz: string, titel: string) => void;
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
  /** Session-Zahnrad: Orientierung, ohne die Übung zu überfrachten */
  /** Großer Pausenblock (Einladung nach fünf Aufgaben, R5 / N77) */
  const BLOCK = 5;
  /** Früher ruhiger Atemzug nach wenigen Aufgaben (M65) */
  const ATEM = 3;

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
  let letzteAntwort = $state.raw<Loesung | undefined>(undefined);
  let kommaHinweis = $state(false);
  let hilfen = $state(0);
  let wegOffen = $state(false);
  let warumOffen = $state(false);
  let bereit = $state(false);

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

  /**
   * Die Aufgabe hängt nur an ihrer Nummer. Ohne untrack entstünde sie neu (mit neuem Seed),
   * sobald ein gespeichertes Ergebnis den Lernstand ändert – nach den Zwischenschritten stand
   * dann plötzlich eine andere Aufgabe da.
   */
  let aufgabe = $derived.by(() => {
    const n = nummer;
    return untrack(() => erzeuge(n));
  });

  /**
   * Zwischenschritte (K-29): Nach einem falschen Ergebnis fragt Bastion nach dem Weg,
   * wenn die Vorlage Schritte hat. Das Ereignis wird erst danach gespeichert, damit
   * die Schritte darin stehen (D-17).
   */
  let weg = $state<'aus' | 'laeuft' | 'fertig' | 'ohne'>('aus');
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
    // W116: optional leiser Cue nur beim Prüfen-Ergebnis, nie bei Tipps
    soundUiErgebnis(ergebnis.richtig);
    letzteAntwort = antwort;
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
    // Lösungsweg bleibt zu, bis jemand ihn öffnet (kein Sofort-Spoiler bei Schrittweg)
    wegOffen = false;
    warumOffen = false;
    fehlerInFolge = ergebnis.richtig ? 0 : fehlerInFolge + 1;
  }

  /**
   * L12: Tippt man in ein Antwortfeld und liegen Tastatur oder „Prüfen“ unter dem
   * Bildschirmrand, rückt die Arbeitsfläche ganz ins Bild – ohne selbst zu scrollen.
   */
  function sichtbarMachen(flaeche: HTMLElement) {
    if (typeof window === 'undefined') return;
    const unten = flaeche.getBoundingClientRect().bottom;
    if (unten <= window.innerHeight) return;
    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    flaeche.scrollIntoView({ block: 'end', behavior: ruhig ? 'auto' : 'smooth' });
  }

  function weiter() {
    weg = 'aus';
    letzteSchritte = [];
    ergebnis = undefined;
    letzteAntwort = undefined;
    kommaHinweis = false;
    hilfen = 0;
    wegOffen = false;
    warumOffen = false;
    bereit = false;
    nummer += 1;
  }

  /** Erledigte Aufgaben dieser Runde – nur Menge, keine Zeit und kein Urteil (R1, R2) */
  const erledigt = $derived(nummer + (ergebnis ? 1 : 0));
  /** Steine für den Fortschritt: die ganze Runde oder der laufende Fünferblock */
  const steine = $derived.by(() => {
    if (anzahl !== undefined) return { gesamt: anzahl, voll: Math.min(erledigt, anzahl) };
    const imBlock = erledigt % BLOCK;
    return { gesamt: BLOCK, voll: imBlock === 0 && erledigt > 0 ? BLOCK : imBlock };
  });
  /** Nach jedem vollen Block: Einladung zur Pause, kein Countdown (R5, N77) */
  const pause = $derived(anzahl === undefined && ergebnis !== undefined && erledigt % BLOCK === 0);
  /** Früher Atemzug nach 2–3 Aufgaben – ruhig, kein Modal (M65) */
  const atemzug = $derived(
    anzahl === undefined && ergebnis !== undefined && !pause && erledigt === ATEM,
  );

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

  /** Erwartete Form erst nach Schrittweg / ohne Schrittweg – kein Sofort-Spoiler */
  const erwarteteFormZeigen = $derived(
    !!ergebnis && !ergebnis.richtig && weg !== 'laeuft' && !!aufgabe && !!letzteAntwort,
  );

  const eigeneAntwortText = $derived(
    letzteAntwort && aufgabe
      ? antwortText(
          letzteAntwort,
          aufgabe.instanz.optionen,
          aufgabe.vorlage.typ === 'uhrzeit-eingabe',
          aufgabe.instanz.einheit,
        )
      : '',
  );

  const erwarteteAntwortText = $derived(
    aufgabe
      ? antwortText(
          aufgabe.instanz.loesung,
          aufgabe.instanz.optionen,
          aufgabe.vorlage.typ === 'uhrzeit-eingabe',
          aufgabe.instanz.einheit,
        )
      : '',
  );
</script>

<section class="uebung">
  <!-- B7 (Q-O1): oben nur Zurück und die Erklärung mit Wort; „Bildschirm drehen“ steht unter
       Mehr → Einstellungen (O19), nicht mehr mitten in der Übung -->
  <div class="oben">
    <ZurueckKnopf onclick={onzurueck} />
    {#if onerklaerung}
      <button class="erklaerung" onclick={onerklaerung}>
        <Symbol name="buch" />
        <span>{t('vermittlung.knopf')}</span>
      </button>
    {/if}
  </div>
  <header class="kopf">
    <div class="titel">
      <h2>{ueberschrift}</h2>
      {#if modus !== 'ueben' && aufgabe}
        <!-- B8 (Q-O1): Beim Wiederholen und in der Werkstatt steht das Thema in der Kopfzeile.
             Ohne Niveau (L-22): Lernende sehen es nicht -->
        <p class="herkunft">{aufgabe.kompetenz.titel.de}</p>
      {/if}
    </div>
    {#if stufe}<span class="stufe" aria-label="{t('niveau.stufe')}: {stufe}">{stufe}</span>{/if}
    {#if aufgabe || erledigt > 0}
      <span
        class="steine"
        role="img"
        aria-label="{steine.voll} {t('uebung.von')} {steine.gesamt} {t('uebung.erledigt')}"
      >
        {#each Array.from({ length: steine.gesamt }, (_, i) => i) as i (i)}
          <span class="stein" class:voll={i < steine.voll}></span>
        {/each}
        <!-- B9 (Q-O1): Zahl zu den Steinen -->
        <span class="steine-text">{steine.voll} {t('uebung.von')} {steine.gesamt}</span>
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
      <!-- V111: feste Reihenfolge Aufgabe → Eingabe → Urteil; live nur Urteil -->
      <article class="arbeitsblatt aufgabe" class:phase-rueckmeldung={ergebnis !== undefined}>
        <div class="prompt aufgabe-frage" id="aufgabe-frage">
          {#if aufgabe.vorlage.hilfsmittelfrei}
            <!-- B10: Teil-A-Aufgaben (Abitur, Realschulabschluss) ohne Taschenrechner -->
            <p class="ohne-rechner">
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                <rect
                  x="4"
                  y="2"
                  width="12"
                  height="16"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <rect x="6.5" y="4.5" width="7" height="3" fill="currentColor" />
                <line x1="2" y1="18" x2="18" y2="2" stroke="currentColor" stroke-width="1.8" />
              </svg>
              {t('uebung.ohne-rechner')}
            </p>
          {/if}
          <p class="text">
            <Textteile
              teile={fuelle(aufgabe.vorlage.text.aufgabe.de, aufgabe.instanz.platzhalter)}
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

          {#if aufgabe.frueher}
            <!-- B8 (Q-O1): Werkstatt-Hinweis als eine Zeile statt zwei Kästen -->
            <p class="damals-zeile">
              {t('werkstatt.damals')}
              <strong
                ><Rechentext
                  text={antwortText(
                    aufgabe.frueher,
                    aufgabe.instanz.optionen,
                    aufgabe.vorlage.typ === 'uhrzeit-eingabe',
                    aufgabe.instanz.einheit,
                  )}
                  erklaeren={false}
                /></strong
              >
              · {t('werkstatt.noch-einmal')}
            </p>
          {/if}

          {#if hilfen > 0 && ergebnis === undefined}
            <aside class="tipp-notiz" aria-label={t('uebung.hilfe')}>
              <p class="tipp-stand">
                {t('uebung.tipp-stand')}
                {hilfen}
                {t('uebung.von')}
                {aufgabe.vorlage.hilfen.length}
              </p>
              <ul class="hilfen">
                {#each aufgabe.vorlage.hilfen.slice(0, hilfen) as hilfe, i (i)}
                  <li><Textteile teile={fuelle(hilfe.de, aufgabe.instanz.platzhalter)} /></li>
                {/each}
              </ul>
            </aside>
          {/if}
        </div>

        <div
          class="arbeitsflaeche aufgabe-eingabe"
          id="aufgabe-eingabe"
          aria-describedby="aufgabe-frage"
          onfocusin={(e) => sichtbarMachen(e.currentTarget)}
        >
          {#if ergebnis === undefined}
            <Eingabe
              instanz={aufgabe.instanz}
              typ={aufgabe.vorlage.typ}
              tastatur={aufgabe.vorlage.tastatur}
              gesperrt={false}
              onantwort={beantwortet}
              onbereit={(b) => (bereit = b)}
            />

            <div class="knoepfe">
              <button
                type="submit"
                form="antwort"
                class="haupt pruefen"
                disabled={!bereit}
                aria-describedby={bereit ? undefined : 'pruefen-hinweis'}
              >
                {t('uebung.pruefen')}
              </button>
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
            </div>
            {#if !bereit}
              <!-- O22: Hinweis kräftiger und mit dem Knopf verbunden (Screenreader liest ihn mit) -->
              <p class="pruefen-hinweis" id="pruefen-hinweis">
                <span class="hinweis-punkt" aria-hidden="true">i</span>{t('uebung.pruefen-hinweis')}
              </p>
            {/if}
          {:else}
            <!-- B1 (Q-O1): ein Kasten statt zweier – Urteil als Überschrift, darunter
                 die Antwort in einer Zeile, dann die Ursache -->
            <div
              class="urteil-kasten"
              class:richtig={ergebnis.richtig}
              class:falsch={!ergebnis.richtig}
              id="aufgabe-urteil"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <p class="urteil">
                {ergebnis.richtig ? t('uebung.richtig-kurz') : t('uebung.falsch')}
              </p>
              <p class="antwort-zeile">
                <span class="spiegel-label">{t('uebung.deine-antwort')}</span>
                <strong class="spiegel-wert"
                  ><Rechentext text={eigeneAntwortText} erklaeren={false} /></strong
                >
                {#if erwarteteFormZeigen}
                  <span class="spiegel-label erwartet">{t('uebung.erwartet')}</span>
                  <strong class="spiegel-wert"
                    ><Rechentext text={erwarteteAntwortText} erklaeren={false} /></strong
                  >
                {/if}
              </p>
              {#if weg !== 'laeuft'}
                {#if rueckmeldung}<p class="ursache"><Textteile teile={rueckmeldung} /></p>{/if}
                {#if kommaHinweis}<p class="ursache">{t('uebung.punkt-statt-komma')}</p>{/if}
              {/if}
            </div>

            {#if ergebnis.richtig}
              {#if aufgabe.instanz.loesungsweg.length > 0}
                <details class="weg" bind:open={warumOffen}>
                  <summary>{t('uebung.warum')}</summary>
                  <ol>
                    {#each aufgabe.instanz.loesungsweg as schritt, i (i)}
                      <li>
                        <Rechentext text={schritt.de} platzhalter={aufgabe.instanz.platzhalter} />
                      </li>
                    {/each}
                  </ol>
                </details>
              {/if}
              {#if pause}
                <p class="pause atem" role="status">{t('uebung.pause')}</p>
              {:else if atemzug}
                <p class="pause atem" role="status">{t('uebung.pause-kurz')}</p>
              {/if}
              <div class="knoepfe">
                <button class="haupt" onclick={weiter}>{t('uebung.weiter')}</button>
                {#if onspaeter && aufgabe}
                  <button
                    class="dezent"
                    onclick={() => onspaeter(aufgabe.kompetenz.id, aufgabe.kompetenz.titel.de)}
                    >{t('uebung.spaeter')}</button
                  >
                {/if}
              </div>
            {:else if (weg === 'laeuft' || weg === 'fertig') && aufgabe.vorlage.schritte && aufgabe.generator?.schritt}
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
                  // L4: ohne Weg verschwinden Schrittfelder und Tastatur
                  weg = 'ohne';
                  // Nach „ohne Weg“ eine Tür: Lösungsweg als nächster klarer Schritt
                  wegOffen = true;
                  onnutzung?.('weg-uebersprungen', a.vorlage.id);
                }}
              />
            {/if}

            {#if !ergebnis.richtig && weg !== 'laeuft'}
              {#each fvs as fv (fv.id)}
                {@const zustand = fvStaende?.get(fv.id)?.zustand}
                {@const art = rueckwegArt?.(fv, zustand)}
                <FvRueckmeldung
                  {fv}
                  {zustand}
                  rueckweg={art}
                  kurzZeigen={!rueckmeldung}
                  onrueckweg={() => art && onrueckweg?.(fv, art)}
                />
              {/each}

              <details class="weg" bind:open={wegOffen}>
                <summary
                  onclick={() => {
                    if (!wegOffen) onnutzung?.('hilfe', `loesungsweg:${aufgabe?.vorlage.id ?? ''}`);
                  }}>{t('uebung.loesungsweg')}</summary
                >
                <ol>
                  {#each aufgabe.instanz.loesungsweg as schritt, i (i)}
                    <li>
                      <Rechentext text={schritt.de} platzhalter={aufgabe.instanz.platzhalter} />
                    </li>
                  {/each}
                </ol>
              </details>

              <!-- L7: Rückweg zur Grundlage nur, wenn keine Denkfehler-Karte schon einen Weg zeigt -->
              {#if rueckwegZu && onwechsel && fvs.length === 0}
                {@const ziel = rueckwegZu}
                <div class="rueckweg">
                  <p>{t('rueckweg.text')} <strong>{ziel.titel.de}</strong></p>
                  <button class="zweit" onclick={() => onwechsel(ziel)}
                    >{t('rueckweg.knopf')}</button
                  >
                </div>
              {/if}
              <!-- L7: nach einem Fehler nur die große Pause, kein Atemzug-Satz -->
              {#if pause}
                <p class="pause atem" role="status">{t('uebung.pause')}</p>
              {/if}
              <div class="knoepfe">
                <button class="haupt" onclick={weiter}>{t('uebung.weiter')}</button>
                {#if onspaeter && aufgabe}
                  <button
                    class="dezent"
                    onclick={() => onspaeter(aufgabe.kompetenz.id, aufgabe.kompetenz.titel.de)}
                    >{t('uebung.spaeter')}</button
                  >
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      </article>
    {/key}
  {/if}
  {#if onfertig && nummer + (ergebnis ? 1 : 0) > 0}
    <button class="dezent fertig" onclick={onfertig}>{t('abschluss.knopf')}</button>
  {/if}
</section>

<style>
  .uebung {
    display: grid;
    gap: var(--abstand-m);
  }

  .oben {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
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
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text-leise);
    letter-spacing: 0.02em;
  }

  /* B7 (Q-O1): Erklärung als Knopf mit Wort, rechts neben Zurück */
  .erklaerung {
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: 2.75rem;
    padding-block: 0;
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
    cursor: pointer;
    flex-shrink: 0;
  }

  .erklaerung :global(svg) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }

  .steine {
    display: flex;
    gap: 0.35rem;
    margin-inline-start: auto;
    align-items: center;
  }

  .stein {
    inline-size: 0.95rem;
    block-size: 0.65rem;
    border-radius: 0.2rem;
    background: var(--farbe-flaeche-leise);
    box-shadow: inset 0 0 0 2px var(--farbe-text-leise);
  }

  .steine-text {
    margin-inline-start: 0.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
  }

  .stein.voll {
    background: var(--farbe-akzent);
    box-shadow: none;
  }

  .arbeitsblatt {
    display: grid;
    gap: var(--abstand-m);
    background: var(--farbe-flaeche);
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    padding: var(--abstand-m);
  }

  /* K51: Aufgabentext mit Luft (das Label „Was wird gesucht?“ ist seit B5, Q-O1, weg) */
  .prompt {
    display: grid;
    gap: 0.5rem;
    padding-block: var(--abstand-s);
    margin-block-end: var(--abstand-s);
  }

  .arbeitsflaeche {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    border: 1px solid var(--farbe-rand);
  }

  /* B1/D5 (Q-O1): in der Rückmeldung kein zweiter Rahmen in der Karte */
  .phase-rueckmeldung .arbeitsflaeche {
    background: transparent;
    border: none;
    padding: 0;
    gap: var(--abstand-m);
  }

  .rueckweg {
    margin-block: var(--abstand-s);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-hinweis-flaeche);
  }

  .titel {
    display: grid;
    gap: 0.125rem;
  }

  /* B8 (Q-O1): Thema in der Kopfzeile, gut lesbar */
  .herkunft {
    font-size: 1rem;
    font-weight: 600;
    margin-block: 0;
  }

  /* B8 (Q-O1): Werkstatt-Hinweis als eine Zeile */
  .damals-zeile {
    margin-block: 0;
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }

  .damals-zeile strong {
    color: var(--farbe-text);
  }

  .ohne-rechner {
    display: inline-flex;
    inline-size: fit-content;
    justify-self: start;
    align-items: center;
    gap: var(--abstand-s);
    margin: 0;
    margin-block-start: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
    font-size: 0.9rem;
    font-weight: 700;
  }

  .text {
    font-size: 1.375rem;
    font-weight: 600;
    line-height: 1.55;
    margin-block: 0;
    max-inline-size: 36rem;
  }

  .bild {
    margin-inline: auto;
    margin-block: var(--abstand-s);
    /* B12: volle Breite der Karte; ohne das schrumpft die Figur auf 300 px (Standardbreite
       eines SVG ohne width), am Handy etwa 8 % kleiner als möglich */
    inline-size: 100%;
    max-inline-size: 28rem;
  }

  /* L12: Bild höchstens ein knappes Viertel der Bildschirmhöhe, damit Eingabe und Prüfen
     auf dem Handy ohne Scrollen erreichbar bleiben */
  .bild :global(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
    /* O22: etwas größer, damit Beschriftungen wie „a“ bis „d“ am Handy lesbar sind (vorher ≈ 9 px) */
    max-block-size: max(10rem, 28dvh);
  }
  /* O22: Beschriftungen kräftig und mit hellem Rand, damit sie auch über Linien lesbar bleiben */
  .bild :global(svg text) {
    font-weight: 700;
    paint-order: stroke fill;
    stroke: var(--farbe-flaeche);
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  /* L19: gefärbte Teile in derselben warmen Farbe wie der Bruchstreifen der Erklärung */
  .bild :global([fill-opacity='0.35']) {
    fill: var(--farbe-akzent-warm);
    fill-opacity: 1;
  }

  .tipp-notiz {
    margin-block-start: var(--abstand-s);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-inline-start: 3px solid var(--farbe-hinweis-rand);
    background: var(--farbe-hinweis-flaeche);
    border-radius: 0 var(--radius) var(--radius) 0;
    color: var(--farbe-text-leise);
  }

  .tipp-stand {
    margin-block: 0;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .hilfen {
    margin-block: 0.25rem 0;
    padding-inline-start: 1.1rem;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    align-items: center;
  }

  .knoepfe .haupt {
    padding-inline: var(--abstand-l);
  }

  .pruefen {
    font-weight: 700;
  }

  .pruefen-hinweis {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-block: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--farbe-text);
  }
  .hinweis-punkt {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    inline-size: 1.2rem;
    block-size: 1.2rem;
    border-radius: 50%;
    background: var(--farbe-hinweis-rand);
    color: var(--farbe-text);
    font-size: 0.75rem;
    font-weight: 800;
    font-style: italic;
  }

  .fertig {
    justify-self: start;
  }

  /* B1 (Q-O1): ein Kasten – Urteil, Antwortzeile, Ursache; nur ein farbiger Rand links */
  .urteil-kasten {
    display: grid;
    gap: 0.35rem;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border-inline-start: 5px solid var(--farbe-akzent-warm);
    background: var(--farbe-flaeche-leise);
  }

  .urteil-kasten.richtig {
    border-inline-start-color: var(--farbe-erfolg);
  }

  .urteil-kasten p {
    margin-block: 0;
  }

  .urteil {
    font-weight: 800;
    font-size: 1.25rem;
  }

  .urteil-kasten.richtig .urteil {
    color: var(--farbe-erfolg);
  }

  .antwort-zeile {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem var(--abstand-s);
    align-items: baseline;
  }

  .spiegel-label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--farbe-text-leise);
  }

  .spiegel-wert {
    font-size: 1.25rem;
  }

  .ursache {
    color: var(--farbe-text);
  }

  .weg {
    margin-block: var(--abstand-s);
  }

  /* L2: Pfeil zeigt, dass sich etwas aufklappen lässt; B1 (Q-O1): ohne Rahmen, damit
     „Nächste Aufgabe“ der einzige Knopf bleibt */
  .weg summary {
    cursor: pointer;
    font-weight: 700;
    min-block-size: var(--ziel);
    display: inline-flex;
    align-items: center;
    gap: var(--abstand-s);
    color: var(--farbe-akzent);
    list-style: none;
  }

  .weg summary::-webkit-details-marker {
    display: none;
  }

  .weg summary::before {
    content: '▸';
    display: inline-block;
    transition: transform 0.15s ease;
  }

  .weg[open] summary::before {
    transform: rotate(90deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .weg summary::before {
      transition: none;
    }
  }

  /* Querformat: Prüfen/Tastatur ohne Scroll-Kampf (Design L64) */
  @media (orientation: landscape) and (max-block-size: 30rem) {
    .uebung {
      gap: var(--abstand-s);
      min-block-size: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1rem);
      grid-template-rows: auto minmax(0, 1fr) auto;
    }

    .kopf {
      gap: 0.25rem var(--abstand-s);
    }

    h2 {
      font-size: 1.125rem;
    }

    .aufgabe {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto auto;
      gap: var(--abstand-s);
      min-block-size: 0;
      overflow: hidden;
      padding: var(--abstand-s);
    }

    .text {
      font-size: 1.125rem;
      overflow: auto;
      min-block-size: 0;
      max-block-size: 30dvh;
    }

    .bild {
      max-block-size: 18dvh;
      overflow: auto;
    }

    .knoepfe {
      position: sticky;
      inset-block-end: 0;
      padding-block: 0.25rem;
      background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
      z-index: 1;
    }

    .fertig {
      margin-block-start: 0;
    }
  }

  .pause {
    color: var(--farbe-text-leise);
  }

  .pause.atem {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .pause.atem::before {
    content: '';
    inline-size: 0.65rem;
    block-size: 0.65rem;
    border-radius: 50%;
    background: var(--farbe-akzent);
    opacity: 0.55;
    animation: atem 2.8s ease-in-out infinite;
  }

  @keyframes atem {
    0%,
    100% {
      transform: scale(0.85);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.75;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pause.atem::before {
      animation: none;
      opacity: 0.55;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .phase-rueckmeldung .urteil-kasten {
      animation: einblenden 180ms ease-out;
    }
  }

  @keyframes einblenden {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Querformat Lernen: Prompt links, Eingabe/Feedback rechts */
  @media (orientation: landscape) and (width >= 40rem) {
    .arbeitsblatt {
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      align-items: start;
      gap: var(--abstand-m);
    }

    .prompt {
      position: sticky;
      inset-block-start: var(--abstand-s);
    }

    .tipp-notiz {
      max-inline-size: 100%;
    }
  }
</style>
