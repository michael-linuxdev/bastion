// Gemeinsame Bausteine für Generatoren. Rein; Zufall nur über das übergebene Rng.
import type { Loesung, Sprachobjekt } from '../core/learning/generator';
import type { Rng } from '../core/rng/rng';

/** Zufällige natürliche Zahl mit genau `stellen` Stellen. */
export function zahlMitStellen(r: Rng, stellen: number): number {
  let z = r.int(1, 9);
  for (let i = 1; i < stellen; i++) z = z * 10 + r.int(0, 9);
  return z;
}

/** Gemischte Kopie (Fisher-Yates mit dem Seed-Zufall). */
export function mische<T>(r: Rng, liste: readonly T[]): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export const zahl = (wert: number): Loesung => ({ typ: 'zahl', wert });
export const auswahl = (wert: number): Loesung => ({ typ: 'auswahl', wert });
export const de = (text: string): Sprachobjekt => ({ de: text });

/** Rundet auf ein Vielfaches von `einheit` (kaufmännisch: ab 5 auf). */
export function runde(n: number, einheit: number): number {
  return Math.floor(n / einheit + 0.5) * einheit;
}

/** Prüft Generator-Parameter und meldet Unsinn früh. */
export function verlange(bedingung: boolean, meldung: string): void {
  if (!bedingung) throw new RangeError(meldung);
}
