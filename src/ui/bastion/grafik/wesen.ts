/**
 * Friedliche Wesen in der Bastion-Szene (GRAFIK §4.4).
 * Anzahl steigt mit gebauten Gebäuden; bei „ruhig“ aus. Kein Zufall.
 */
import type { Thema } from '../../../core/policy/einstellung';
import { BUEHNE_B, BUEHNE_H, punkt } from './iso';

export type WesenArt = 'huhn' | 'katze' | 'spatz' | 'biene' | 'schnecke' | 'schmetterling';

export interface WesenArtInfo {
  readonly art: WesenArt;
  readonly farbe: string;
  readonly skala: number;
}

/** Arten je Thema – G4: Dorf vollständig, andere vorbereitet. */
export function wesenArten(thema: Thema): readonly WesenArtInfo[] {
  switch (thema) {
    case 'dorf':
      return [
        { art: 'huhn', farbe: '#e8dcc8', skala: 1 },
        { art: 'katze', farbe: '#c4a574', skala: 1.05 },
        { art: 'spatz', farbe: '#6b5a4a', skala: 0.75 },
      ];
    case 'garten':
      return [
        { art: 'biene', farbe: '#e6c35c', skala: 0.7 },
        { art: 'schnecke', farbe: '#b89b7a', skala: 0.85 },
        { art: 'schmetterling', farbe: '#d478a0', skala: 0.8 },
      ];
    default:
      return [];
  }
}

/**
 * Anzahl Wesen: leerer Platz 1, dann +1 je ~3 Gebäude, max. 5 (voll) bzw. 3 (leicht).
 */
export function wesenAnzahl(gebaeude: number, leicht: boolean): number {
  const max = leicht ? 3 : 5;
  if (gebaeude <= 0) return Math.min(1, max);
  return Math.min(max, 1 + Math.floor(gebaeude / 3));
}

export interface WesenZustand {
  readonly id: string;
  readonly art: WesenArt;
  readonly farbe: string;
  readonly skala: number;
  /** Position in Bildpunkten */
  x: number;
  y: number;
  /** Zielpunkt fürs Gehen */
  zx: number;
  zy: number;
  /** Blickrichtung: 1 rechts, -1 links */
  richtung: 1 | -1;
  /** Reaktion bis performance.now()-Zeitstempel */
  reactBis: number;
  phase: number;
}

/** Feste Wege auf dem Bauplatz (Feldmitten), deterministisch. */
const WEGE: readonly { x: number; y: number }[] = [
  { x: 2.5, y: 3.5 },
  { x: 5.5, y: 2.5 },
  { x: 8.5, y: 4.5 },
  { x: 4.5, y: 7.5 },
  { x: 9.5, y: 8.5 },
  { x: 3.5, y: 10.5 },
  { x: 7.5, y: 9.5 },
  { x: 10.5, y: 6.5 },
];

export function wegPunkt(index: number): { x: number; y: number } {
  const f = WEGE[index % WEGE.length] ?? { x: 2.5, y: 3.5 };
  const p = punkt(f.x, f.y);
  return {
    x: Math.min(BUEHNE_B - 8, Math.max(8, p.x)),
    y: Math.min(BUEHNE_H - 8, Math.max(40, p.y)),
  };
}

/** Startliste für n Wesen aus den Arten des Themas. */
export function wesenStarten(thema: Thema, gebaeude: number, leicht: boolean): WesenZustand[] {
  const arten = wesenArten(thema);
  if (arten.length === 0) return [];
  const n = wesenAnzahl(gebaeude, leicht);
  const aus: WesenZustand[] = [];
  for (let i = 0; i < n; i++) {
    const info = arten[i % arten.length];
    if (!info) continue;
    const start = wegPunkt(i * 2);
    const ziel = wegPunkt(i * 2 + 1);
    aus.push({
      id: `w-${i}-${info.art}`,
      art: info.art,
      farbe: info.farbe,
      skala: info.skala,
      x: start.x,
      y: start.y,
      zx: ziel.x,
      zy: ziel.y,
      richtung: (ziel.x >= start.x ? 1 : -1) as 1 | -1,
      reactBis: 0,
      phase: i * 0.7,
    });
  }
  return aus;
}

/** Einen Tick weiterbewegen; bei Ankunft neues Wegziel. */
export function wesenTick(w: WesenZustand, dt: number, jetzt: number, index: number): void {
  if (jetzt < w.reactBis) {
    // kurze Hopser-Reaktion
    w.y -= Math.sin(((w.reactBis - jetzt) / 400) * Math.PI) * 0.4;
    return;
  }
  const dx = w.zx - w.x;
  const dy = w.zy - w.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    const neu = wegPunkt(index * 3 + Math.floor(jetzt / 5000));
    w.zx = neu.x;
    w.zy = neu.y;
    w.richtung = neu.x >= w.x ? 1 : -1;
    return;
  }
  const speed =
    (w.art === 'spatz' || w.art === 'biene' || w.art === 'schmetterling' ? 28 : 16) * dt;
  w.x += (dx / dist) * speed;
  w.y += (dy / dist) * speed;
  w.phase += dt * 6;
}

export function wesenReagieren(w: WesenZustand, jetzt: number): void {
  w.reactBis = jetzt + 400;
}
