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

/** Ob die Bühne überhaupt bewegte Teile zeigt (Wesen, Wolken, Fahnen, Aufstellen). */
export const tickerAn = (b: Bewegung): boolean => b !== 'aus';

/**
 * Takt der bewegten Bühne in Bildern je Sekunde (GRAFIK §29, Q-G1). Sprites mit zwei bis
 * vier Bildern je Zyklus, ziehende Wolken und wehende Fahnen brauchen keine 60 Bilder;
 * 30 halbieren die Arbeit von Grafikprozessor und Hauptfaden (GRAFIK §4.5: „wenn knapp,
 * 30 fps anpeilen“).
 */
export const TAKT_HZ = 30;

export interface TaktEingabe {
  readonly bewegung: Bewegung;
  /** Gibt es gerade etwas zu bewegen (Wesen, Bewohner, Fahnen, Partikel, Aufstellen …)? */
  readonly bewegt: boolean;
  /** Die Kamera zoomt oder schwenkt gerade (Geste oder Kamerafahrt) */
  readonly kameraBewegt: boolean;
}

/**
 * Wie oft die Bühne je Sekunde zeichnet: 0 heißt, der Pixi-Ticker steht, und die Bühne
 * zeichnet nur noch ein Einzelbild, wenn sich etwas ändert (neues Gebäude, Auswahl).
 * - „ruhig“ oder System-Ruhe: 0 – vorher rechnete PixiJS trotzdem 60 Bilder je Sekunde.
 * - Kamera in Bewegung: 0 – das Bild steht, nur der Browser verschiebt und vergrößert es;
 *   so bleibt dem Gerät die Zeit für die Geste.
 * - nichts zu bewegen: 0.
 * - sonst TAKT_HZ.
 */
export function taktFuer(e: TaktEingabe): number {
  if (!tickerAn(e.bewegung)) return 0;
  if (e.kameraBewegt) return 0;
  if (!e.bewegt) return 0;
  return TAKT_HZ;
}

/** Nach so vielen Millisekunden ohne Kamera-Änderung gilt die Kamera wieder als ruhig. */
export const KAMERA_RUHE_MS = 150;

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
