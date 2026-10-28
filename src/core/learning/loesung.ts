import { gleichGeschrieben } from './bruch';
import type { Fehlerbild, Loesung } from './generator';

/** Exakt gleiche Lösung (gleiche Art, gleicher Wert, Brüche gleich geschrieben). */
export function gleicheLoesung(a: Loesung, b: Loesung): boolean {
  switch (a.typ) {
    case 'bruch':
      return b.typ === 'bruch' && gleichGeschrieben(a.wert, b.wert);
    case 'zahl':
    case 'auswahl':
      return b.typ === a.typ && a.wert === b.wert;
    case 'reihenfolge':
      return (
        b.typ === 'reihenfolge' &&
        a.wert.length === b.wert.length &&
        a.wert.every((x, i) => x === b.wert[i])
      );
    case 'punkt':
      return b.typ === 'punkt' && a.wert.x === b.wert.x && a.wert.y === b.wert.y;
    case 'mit-rest':
      return (
        b.typ === 'mit-rest' && a.wert.quotient === b.wert.quotient && a.wert.rest === b.wert.rest
      );
  }
}

/**
 * Baut die Fehlerbild-Liste aus Kandidaten in Vorrang-Reihenfolge: lässt
 * fehlende (undefined), mit der Lösung identische und doppelte Antworten weg
 * (INHALTSFORMAT §7).
 */
export function fehlerbilderAus(
  richtig: Loesung,
  kandidaten: readonly (readonly [string, Loesung | undefined])[],
): Fehlerbild[] {
  const ergebnis: Fehlerbild[] = [];
  for (const [id, antwort] of kandidaten) {
    if (!antwort) continue;
    if (gleicheLoesung(antwort, richtig)) continue;
    if (ergebnis.some((f) => gleicheLoesung(f.antwort, antwort))) continue;
    ergebnis.push({ id, antwort });
  }
  return ergebnis;
}
