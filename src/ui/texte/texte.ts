// Oberflächentexte kommen aus einer Textdatei pro Sprache, nie hart aus dem
// Code (CLAUDE.md). Ab Phase 5 übernimmt Paraglide JS (ARCHITEKTUR T-11).
import de from './de.json';

export type TextSchluessel = Exclude<keyof typeof de, 'sprache' | 'richtung'>;

const aktuell = de;

/** Liefert den Oberflächentext zu einem Schlüssel. */
export function t(schluessel: TextSchluessel): string {
  return aktuell[schluessel];
}

/** Sprache und Schreibrichtung für `<html lang dir>`. */
export const sprache = { code: aktuell.sprache, richtung: aktuell.richtung } as const;
