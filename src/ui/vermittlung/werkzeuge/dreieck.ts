// Dreieck (VERMITTLUNG §2.3, Werkzeug dreieck@1): rechtwinkliges Dreieck mit Ecken A, B, C,
// rechtem Winkel an einer Ecke und beschrifteten Seiten; mit `winkel` ein beliebiges Dreieck
// (ab Klasse 10, Sinus- und Kosinussatz). Reine Logik; das Bild kommt aus
// `dreieckSkizze` der Pythagoras-Generatoren, damit Erklärung und Aufgabe gleich aussehen.
import type { Bild } from '../../../core/learning/generator';
import { allgemeinesDreieck } from '../../../generators/mathematik/allgemeine-dreiecke/skizze';
import { dreieckSkizze } from '../../../generators/mathematik/pythagoras/skizze';

export interface DreieckParameter {
  /** Ecke mit dem rechten Winkel (Standard C) */
  readonly rechts?: string;
  /** Beschriftung der Seiten a, b, c, z. B. { c: 'c = 5 cm', a: 'Gegenkathete' } */
  readonly seiten?: Readonly<Record<string, unknown>>;
  /** Beliebiges Dreieck: Innenwinkel bei A und B in Grad; dann zählt `rechts` nicht */
  readonly winkel?: { readonly alpha?: unknown; readonly beta?: unknown };
  /** Beschriftung der Winkel α, β, γ, z. B. { α: 'α = 40°', γ: 'γ = ?' } */
  readonly winkeltexte?: Readonly<Record<string, unknown>>;
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

/** Winkel prüfen: beide zwischen 10° und 160°, zusammen höchstens 170°; sonst kein beliebiges Dreieck. */
export function winkelAus(
  p: DreieckParameter,
): { alpha: number; beta: number; texte: Record<string, string> } | undefined {
  const a = p.winkel?.alpha;
  const b = p.winkel?.beta;
  if (typeof a !== 'number' || typeof b !== 'number') return undefined;
  if (a < 10 || b < 10 || a > 160 || b > 160 || a + b > 170) return undefined;
  const texte: Record<string, string> = {};
  for (const n of ['α', 'β', 'γ']) {
    const w = p.winkeltexte?.[n];
    if (typeof w === 'string' && w.trim() && w.length <= 12) texte[n] = w;
  }
  return { alpha: a, beta: b, texte };
}

export function dreieckBild(p: DreieckParameter): Bild {
  const { rechts, seiten } = dreieckAus(p);
  const w = winkelAus(p);
  if (w) return allgemeinesDreieck({ alpha: w.alpha, beta: w.beta }, seiten, w.texte);
  return dreieckSkizze(rechts, seiten, 2);
}
