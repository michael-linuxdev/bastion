/**
 * Hinterhof in der Pixi-Szene (B-25, GRAFIK §7): Felder hinter dem Bauplatz
 * (kleinere Feld-Y). Plätze als Objekte; volle Felder mit Wappen/Denkmal.
 */
import type { HinterhofFeld } from '../../../core/learning/hinterhof';
import type { Thema } from '../../../core/policy/einstellung';
import { punkt } from './iso';
import type { Stift } from './dorf';

/** Objektfarbe je Thema und Füllung */
function objektFarbe(thema: Thema, fuellung: 'G' | 'M'): string {
  if (fuellung === 'M') return '#c0c8d4'; // Silber
  // Bronze / Themenfarbe
  switch (thema) {
    case 'garten':
      return '#c4783a';
    case 'weltraum':
      return '#e8d080';
    case 'dorf':
      return '#b88850';
    case 'unterwasser':
      return '#7ec8c0';
    default:
      return '#cd7f32';
  }
}

/**
 * Zeichnet den Hinterhof oberhalb des Bauplatzes (y negativ).
 * Ein Feld = eine Reihe; Plätze als kleine Kreise/Rauten.
 */
export function hinterhofZeichnen(
  st: Stift,
  felder: readonly HinterhofFeld[],
  thema: Thema,
  abend: boolean,
): void {
  const startY = -3.2;
  felder.forEach((feld, fi) => {
    const y = startY + fi * 0.55;
    const breite = Math.max(4, Math.min(11, feld.plaetze.length * 0.45 + 1));
    const x0 = (12 - breite) / 2;
    // Beet / Regal-Boden
    const a = punkt(x0, y);
    const b = punkt(x0 + breite, y);
    const c = punkt(x0 + breite, y + 0.45);
    const d = punkt(x0, y + 0.45);
    st.flaeche([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y], abend ? '#2a3428' : '#5a6a48');
    feld.plaetze.forEach((p, pi) => {
      const px = x0 + 0.35 + pi * (breite / Math.max(1, feld.plaetze.length));
      const pt = punkt(px, y + 0.22);
      if (p.fuellung === 'offen') {
        st.kreis(pt.x, pt.y - 2, 3.5, abend ? '#3a4438' : '#8a9a78');
      } else {
        st.kreis(pt.x, pt.y - 4, 4, objektFarbe(thema, p.fuellung));
        if (p.vorwissen) st.kreis(pt.x, pt.y - 4, 2, abend ? '#88a0ff' : '#4060c0');
      }
    });
    // Volle Felder: kleines Wappen/Denkmal am Rand
    if (feld.gefuellt > 0 && feld.gefuellt === feld.plaetze.length) {
      const w = punkt(x0 + breite + 0.3, y + 0.2);
      st.flaeche(
        [w.x, w.y - 14, w.x + 8, w.y - 8, w.x, w.y - 2, w.x - 8, w.y - 8],
        objektFarbe(thema, 'M'),
      );
    }
  });
}

/** Kamera-Ziel: Mitte des Hinterhof-Bereichs in Bildpunkten */
export function hinterhofMitte(felderAnzahl: number): { x: number; y: number } {
  const y = -3.2 + (Math.max(1, felderAnzahl) * 0.55) / 2;
  return punkt(6, y);
}
