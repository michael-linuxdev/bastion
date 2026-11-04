// Stabdiagramm (VERMITTLUNG §2.3, Werkzeug stabdiagramm@1): Wahrscheinlichkeitsverteilung einer
// Zufallsgröße als Stäbe (Klasse 10, Feld ZG). Reine Logik; das Bild kommt aus `stabdiagramm`
// der ZG-Generatoren, damit Erklärung und Aufgabe gleich aussehen.
import type { Bild } from '../../../core/learning/generator';
import { stabdiagramm } from '../../../generators/mathematik/zufallsgroessen/stabdiagramm';

export interface StabdiagrammParameter {
  /** Werte der Zufallsgröße, ganze Zahlen, aufsteigend, höchstens 8 */
  readonly werte?: readonly unknown[];
  /** Wahrscheinlichkeiten je Wert (0 … 1), zusammen 1; null für einen gesuchten Wert */
  readonly p?: readonly unknown[];
}

export const MAX_STAEBE = 8;

/** Parameter prüfen; bei Unsinn ein Münzwurf mit zwei Werten. */
export function stabdiagrammAus(p: StabdiagrammParameter): {
  werte: number[];
  p: (number | undefined)[];
} {
  const w = Array.isArray(p.werte) ? p.werte : [];
  const q = Array.isArray(p.p) ? p.p : [];
  const ok =
    w.length >= 1 &&
    w.length <= MAX_STAEBE &&
    q.length === w.length &&
    w.every((x, i) => Number.isInteger(x) && (i === 0 || (x as number) > (w[i - 1] as number))) &&
    q.every((x) => x === null || (typeof x === 'number' && x >= 0 && x <= 1));
  const summe = q.reduce<number>((s, x) => s + (typeof x === 'number' ? x : 0), 0);
  const vollstaendig = q.every((x) => typeof x === 'number');
  if (!ok || summe > 1 + 1e-9 || (vollstaendig && Math.abs(summe - 1) > 1e-9))
    return { werte: [0, 1], p: [0.5, 0.5] };
  return {
    werte: w as number[],
    p: q.map((x) => (typeof x === 'number' ? x : undefined)),
  };
}

export function stabdiagrammBild(p: StabdiagrammParameter): Bild {
  const s = stabdiagrammAus(p);
  return stabdiagramm(s.werte, s.p);
}
