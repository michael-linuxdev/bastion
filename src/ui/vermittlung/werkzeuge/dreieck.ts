// Dreieck (VERMITTLUNG §2.3, Werkzeug dreieck@1): rechtwinkliges Dreieck mit Ecken A, B, C,
// rechtem Winkel an einer Ecke und beschrifteten Seiten. Reine Logik; das Bild kommt aus
// `dreieckSkizze` der Pythagoras-Generatoren, damit Erklärung und Aufgabe gleich aussehen.
import type { Bild } from '../../../core/learning/generator';
import { dreieckSkizze } from '../../../generators/mathematik/pythagoras/skizze';

export interface DreieckParameter {
  /** Ecke mit dem rechten Winkel (Standard C) */
  readonly rechts?: string;
  /** Beschriftung der Seiten a, b, c, z. B. { c: 'c = 5 cm', a: 'Gegenkathete' } */
  readonly seiten?: Readonly<Record<string, unknown>>;
}

const ECKEN = ['A', 'B', 'C'] as const;
type Ecke = (typeof ECKEN)[number];

/** Parameter prüfen: unbekannte Ecke → C; nur Seiten a, b, c mit Text, höchstens 16 Zeichen. */
export function dreieckAus(p: DreieckParameter): {
  rechts: Ecke;
  seiten: Record<string, string>;
} {
  const rechts = ECKEN.includes(p.rechts as Ecke) ? (p.rechts as Ecke) : 'C';
  const seiten: Record<string, string> = {};
  for (const s of ['a', 'b', 'c']) {
    const w = p.seiten?.[s];
    if (typeof w === 'string' && w.trim() && w.length <= 16) seiten[s] = w;
    else if (typeof w === 'number') seiten[s] = `${s} = ${String(w).replace('.', ',')}`;
  }
  return { rechts, seiten };
}

export function dreieckBild(p: DreieckParameter): Bild {
  const { rechts, seiten } = dreieckAus(p);
  return dreieckSkizze(rechts, seiten, 2);
}
