// Histogramm (VERMITTLUNG §2.3, Werkzeug histogramm@1): Säulen über Klassen „von bis unter“.
// Reine Logik; das Bild kommt aus `histogramm` der Statistik-Generatoren, damit Erklärung und
// Aufgabe gleich aussehen.
import type { Bild } from '../../../core/learning/generator';
import { histogramm } from '../../../generators/mathematik/statistik/statistik';

export interface HistogrammParameter {
  /** Klassengrenzen, eine mehr als Säulen, aufsteigend, z. B. [0, 10, 20, 30] */
  readonly grenzen?: readonly unknown[];
  /** Anzahl der Werte je Klasse, ganze Zahlen von 0 bis 12 */
  readonly haeufig?: readonly unknown[];
}

export const MAX_SAEULEN = 8;

/** Parameter prüfen; bei Unsinn ein kleines Standard-Histogramm. */
export function histogrammAus(p: HistogrammParameter): { grenzen: number[]; haeufig: number[] } {
  const g = Array.isArray(p.grenzen) ? p.grenzen : [];
  const h = Array.isArray(p.haeufig) ? p.haeufig : [];
  const zahlen = (l: readonly unknown[]) => l.every((x) => Number.isInteger(x));
  const ok =
    h.length >= 1 &&
    h.length <= MAX_SAEULEN &&
    g.length === h.length + 1 &&
    zahlen(g) &&
    zahlen(h) &&
    (g as number[]).every((x, i) => i === 0 || x > (g[i - 1] as number)) &&
    (h as number[]).every((x) => x >= 0 && x <= 12) &&
    (h as number[]).some((x) => x > 0);
  return ok
    ? { grenzen: g as number[], haeufig: h as number[] }
    : { grenzen: [0, 10, 20], haeufig: [1, 1] };
}

export function histogrammBild(p: HistogrammParameter): Bild {
  const { grenzen, haeufig } = histogrammAus(p);
  return histogramm(grenzen, haeufig);
}
