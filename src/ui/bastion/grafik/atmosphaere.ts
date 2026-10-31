/**
 * Atmosphäre der Bastion-Grafik (GRAFIK §4.5, B-28): wann Bewegung läuft,
 * und wie stark. Rein und deterministisch – kein PixiJS, damit Tests und
 * Einstellungen dieselbe Regel nutzen.
 */

/** Darstellung der bewegten Schicht */
export type Bewegung = 'voll' | 'leicht' | 'aus';

export interface AtmosphaereEingabe {
  /** Einstellung `basebau.ruhig` */
  readonly ruhig: boolean;
  /** Einstellung `basebau.leicht` */
  readonly leicht: boolean;
  /** System `prefers-reduced-motion: reduce` */
  readonly systemRuhe: boolean;
}

/** „Ruhig“ und System-Ruhe schalten Bewegung aus; sonst „leicht“ oder „voll“. */
export function bewegungAus(e: AtmosphaereEingabe): Bewegung {
  if (e.ruhig || e.systemRuhe) return 'aus';
  if (e.leicht) return 'leicht';
  return 'voll';
}

/** Ob der Pixi-Ticker laufen soll (Wesen/Wolken/Aufstellen). */
export const tickerAn = (b: Bewegung): boolean => b !== 'aus';

/**
 * Wolken-Versatz in Bildpunkten: feste Periode, kein Zufall.
 * `leicht` halb so schnell. Bei `aus` immer 0 (Standbild).
 */
export function wolkenVersatz(ms: number, b: Bewegung, amplitude = 18): number {
  if (b === 'aus') return 0;
  const periode = b === 'leicht' ? 120_000 : 60_000;
  return Math.sin((ms / periode) * Math.PI * 2) * amplitude;
}

/** Dauer des Aufstell-Effekts neuer Gebäude in ms; 0 = sofort. */
export function aufstellDauerMs(b: Bewegung): number {
  if (b === 'aus') return 0;
  return b === 'leicht' ? 280 : 400;
}

/** Fortschritt 0…1 für Aufstellen (Ease-out). */
export function aufstellFortschritt(seitMs: number, dauerMs: number): number {
  if (dauerMs <= 0) return 1;
  const t = Math.min(1, Math.max(0, seitMs / dauerMs));
  return 1 - (1 - t) * (1 - t);
}
