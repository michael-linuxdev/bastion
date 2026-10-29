/**
 * Schnittstelle der Aufgabengeneratoren (INHALTSFORMAT §6).
 *
 * Die Typen liegen im Kern, weil auch die Auswertung sie braucht und
 * src/core nicht aus src/generators importieren darf (ARCHITEKTUR T-2).
 * Die Generatoren selbst liegen in src/generators und importieren von hier.
 */
import type { Bruch } from './bruch';

/** Text in mehreren Sprachen; zunächst nur Deutsch (INHALTSFORMAT I-3). */
export interface Sprachobjekt {
  readonly de: string;
}

/**
 * Wert eines Platzhalters im Vorlagentext, z. B. {bruch}, {nenner} oder {stelle}.
 * Texte (z. B. Stellennamen) sind Sprachobjekte, nie nackte Zeichenketten (I-3).
 */
export type Wert = number | Bruch | Sprachobjekt;

export interface Punkt {
  readonly x: number;
  readonly y: number;
}

export type Loesung =
  | { readonly typ: 'bruch'; readonly wert: Bruch }
  | { readonly typ: 'zahl'; readonly wert: number }
  /** Aufgabentyp `ordnen`: die Elemente in der richtigen Reihenfolge. */
  | { readonly typ: 'reihenfolge'; readonly wert: readonly number[] }
  /** Aufgabentypen `auswahl` und `bild-auswahl`: Index der richtigen Option. */
  | { readonly typ: 'auswahl'; readonly wert: number }
  /** Aufgabentyp `koordinaten-eingabe`. */
  | { readonly typ: 'punkt'; readonly wert: Punkt }
  /** Aufgabentyp `rest-eingabe`: Division mit Rest. */
  | {
      readonly typ: 'mit-rest';
      readonly wert: { readonly quotient: number; readonly rest: number };
    };

/**
 * Vom Generator erzeugtes Bild (INHALTSFORMAT I-11): SVG als Text, ohne
 * Verweise nach außen, mit Textbeschreibung für Screenreader (A5).
 */
export interface Bild {
  readonly svg: string;
  readonly beschreibung: Sprachobjekt;
}

/** Antwortmöglichkeit bei `auswahl` und `bild-auswahl`. */
export interface Option {
  readonly text?: Sprachobjekt;
  readonly bild?: Bild;
}

export interface Fehlerbild {
  /** Muss in der Vorlage unter `fehlerbilder` stehen. */
  readonly id: string;
  /** Die falsche Antwort, die dieses Fehlverständnis erzeugt. */
  readonly antwort: Loesung;
}

export interface Instanz {
  readonly platzhalter: Readonly<Record<string, Wert>>;
  /** Elemente zum Ordnen (Aufgabentyp `ordnen`) in der angezeigten, gemischten Reihenfolge. */
  readonly elemente?: readonly number[];
  /** Bild zur Aufgabe (Aufgabentypen `bild-zahl`, `koordinaten-eingabe` …). */
  readonly bild?: Bild;
  /** Antwortmöglichkeiten (Aufgabentypen `auswahl`, `bild-auswahl`). */
  readonly optionen?: readonly Option[];
  /** Antworten können negativ sein (ab Klasse 7): Die Eingabe bietet einen Knopf „±“, weil
   * Handy-Zahlentastaturen oft kein Minus haben. Gilt für jede Instanz des Generators,
   * damit der Knopf nichts über die Lösung verrät. */
  readonly vorzeichen?: boolean;
  readonly loesung: Loesung;
  readonly loesungsweg: readonly Sprachobjekt[];
  /** Erwartbare falsche Antworten; nie gleich der Lösung, untereinander verschieden. */
  readonly fehlerbilder: readonly Fehlerbild[];
}

/**
 * Ein Zwischenschritt (INHALTSFORMAT §17, K-29): richtige Eingabe, bekannte falsche
 * Eingaben und weitere richtige Wege. Berechnet aus Seed, Parametern und den
 * bisherigen gültigen Eingaben – so rechnet, wer einen anderen richtigen Weg
 * nimmt (z. B. einen größeren gemeinsamen Nenner), mit seinem Weg weiter.
 */
export interface SchrittAufgabe {
  /** Wird nach dem zweiten Fehlversuch gezeigt und gilt dann als Eingabe. */
  readonly loesung: Loesung;
  /** Bekannte falsche Eingaben dieses Schritts; nie richtig, untereinander verschieden. */
  readonly fehlerbilder: readonly Fehlerbild[];
  /** Weitere richtige Eingaben außer `loesung` (andere gültige Wege). */
  readonly auchRichtig?: (eingabe: Loesung) => boolean;
  /** Platzhalter für die Frage des Schritts, z. B. {nenner} */
  readonly platzhalter?: Readonly<Record<string, Wert>>;
}

export interface Generator<P> {
  /** Stabile ID, z. B. "bruch.erweitern-zielnenner". */
  readonly id: string;
  /** Steigt bei jeder Verhaltensänderung (INHALTSFORMAT §6.1, Regel 5). */
  readonly version: number;
  /** Namen aller Platzhalter, die jede Instanz füllt. */
  readonly platzhalter: readonly string[];
  /** IDs aller Fehlerbilder, die vorkommen können. */
  readonly fehlerbildIds: readonly string[];
  /** Rein und deterministisch: gleicher Seed + gleiche Parameter = gleiche Instanz. */
  erzeuge(seed: number, parameter: P): Instanz;
  /** Zwischenschritte (INHALTSFORMAT §17): IDs in Reihenfolge und Fehlerbild-IDs je Schritt. */
  readonly schritte?: readonly {
    readonly id: string;
    readonly fehlerbildIds: readonly string[];
    /** Platzhalter, die nur dieser Schritt liefert (SchrittAufgabe.platzhalter) */
    readonly platzhalter?: readonly string[];
  }[];
  /** Schritt `id` mit den bisherigen gültigen Eingaben; rein wie `erzeuge`. */
  schritt?(
    seed: number,
    parameter: P,
    id: string,
    bisher: Readonly<Record<string, Loesung>>,
  ): SchrittAufgabe;
}
