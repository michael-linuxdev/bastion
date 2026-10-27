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

export type Loesung =
  | { readonly typ: 'bruch'; readonly wert: Bruch }
  | { readonly typ: 'zahl'; readonly wert: number }
  /** Aufgabentyp `ordnen`: die Elemente in der richtigen Reihenfolge. */
  | { readonly typ: 'reihenfolge'; readonly wert: readonly number[] };

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
  readonly loesung: Loesung;
  readonly loesungsweg: readonly Sprachobjekt[];
  /** Erwartbare falsche Antworten; nie gleich der Lösung, untereinander verschieden. */
  readonly fehlerbilder: readonly Fehlerbild[];
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
}
