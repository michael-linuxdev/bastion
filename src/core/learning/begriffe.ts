/**
 * Fachbegriffe mit Erklärung (LEHRPLAN L-7, INHALTSFORMAT §11.1): In Texten
 * steht ein Begriff als [[Form]]. Beim ersten Vorkommen in jedem Text muss er
 * markiert sein, damit Lernende ihn antippen und die Erklärung lesen können.
 * Rein: dieselben Regeln gelten für Prüfung, Markierung und Anzeige.
 */
import type { Sprachobjekt } from './generator';

export interface Begriff {
  readonly id: string;
  readonly wort: Sprachobjekt;
  /** Schreibweisen, wie sie in Texten vorkommen (Groß-/Kleinschreibung zählt) */
  readonly formen: readonly string[];
  readonly erklaerung: Sprachobjekt;
}

/** Form → Begriff */
export type Begriffskarte = ReadonlyMap<string, Begriff>;

export function begriffskarte(begriffe: readonly Begriff[]): Begriffskarte {
  return new Map(begriffe.flatMap((b) => b.formen.map((f) => [f, b] as const)));
}

export interface Fundstelle {
  readonly form: string;
  readonly begriff?: Begriff;
  readonly markiert: boolean;
  /** Position im Text (bei markierten: der öffnenden Klammern) */
  readonly start: number;
  readonly ende: number;
}

const maskiert = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Alle Vorkommen von Begriffen in einem Text, markiert oder nicht, in Reihenfolge.
 * Platzhalter {…} und Formeln $…$ werden übersprungen.
 */
export function fundstellen(text: string, karte: Begriffskarte): Fundstelle[] {
  const formen = [...karte.keys()].sort((a, b) => b.length - a.length).map(maskiert);
  const frei =
    formen.length > 0 ? new RegExp(`(?<!\\p{L})(?:${formen.join('|')})(?!\\p{L})`, 'gu') : null;
  const zu = (form: string) => {
    const begriff = karte.get(form);
    return begriff ? { begriff } : {};
  };
  const funde: Fundstelle[] = [];
  for (const m of text.matchAll(/\[\[([^\]]*)\]\]|\{[a-z_]+\}|\$[^$]*\$|[^[{$]+|[[{$]/g)) {
    const start = m.index;
    if (m[1] !== undefined) {
      funde.push({
        form: m[1],
        ...zu(m[1]),
        markiert: true,
        start,
        ende: start + m[0].length,
      });
    } else if (frei && !m[0].startsWith('{') && !m[0].startsWith('$')) {
      for (const f of m[0].matchAll(frei))
        funde.push({
          form: f[0],
          ...zu(f[0]),
          markiert: false,
          start: start + f.index,
          ende: start + f.index + f[0].length,
        });
    }
  }
  return funde;
}

/** Begriffe, deren erstes Vorkommen im Text nicht markiert ist (L-7). */
export function unmarkiert(text: string, karte: Begriffskarte): Fundstelle[] {
  const gesehen = new Set<string>();
  return fundstellen(text, karte).filter((f) => {
    const id = f.begriff?.id ?? f.form;
    if (gesehen.has(id)) return false;
    gesehen.add(id);
    return !f.markiert;
  });
}

/** Markiert das erste Vorkommen jedes Begriffs (Hilfe für Autorinnen und Autoren). */
export function markiere(text: string, karte: Begriffskarte): string {
  let ergebnis = text;
  for (const f of unmarkiert(text, karte).reverse())
    ergebnis = `${ergebnis.slice(0, f.start)}[[${f.form}]]${ergebnis.slice(f.ende)}`;
  return ergebnis;
}
