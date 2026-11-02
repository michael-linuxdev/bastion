/**
 * Umgebung am Rand des Bauplatzes im Thema `bastion` (G3, GRAFIK-SPRITES §12.7):
 * feste Plätze für Bäume, Büsche und Steine, ohne Zufall. Die Plätze liegen knapp
 * außerhalb der Felder (Spalte oder Reihe unter 0 bzw. über der Bauplatzgröße),
 * damit nie ein Gebäude verdeckt oder blockiert wird. Sie sind für 12 × 12 Felder
 * gesetzt und werden auf größere Bauplätze (spätere Epochen) umgerechnet.
 */
export type UmgebungArt = 'baum_a' | 'baum_b' | 'busch' | 'stein';

export interface UmgebungPlatz {
  readonly x: number;
  readonly y: number;
  readonly art: UmgebungArt;
  /** Größe (1 = wie im Atlas) */
  readonly s: number;
}

const PLAETZE_12: readonly UmgebungPlatz[] = [
  // hinten links (Spalte < 0) und hinten rechts (Reihe < 0)
  { x: -1.1, y: 1.2, art: 'baum_a', s: 1 },
  { x: -1.0, y: 3.4, art: 'busch', s: 1 },
  { x: -1.2, y: 6.1, art: 'baum_b', s: 1 },
  { x: -1.0, y: 9.3, art: 'stein', s: 1 },
  { x: 1.6, y: -1.1, art: 'baum_b', s: 1 },
  { x: 4.2, y: -1.2, art: 'baum_a', s: 1.05 },
  { x: 7.4, y: -1.0, art: 'stein', s: 0.9 },
  { x: 9.8, y: -1.15, art: 'baum_a', s: 0.95 },
  // vorne rechts und vorne links: nur Niedriges, damit nichts den Bauplatz verdeckt
  { x: 12.1, y: 2.5, art: 'busch', s: 0.9 },
  { x: 12.15, y: 7.6, art: 'stein', s: 1 },
  { x: 3.4, y: 12.1, art: 'stein', s: 0.85 },
  { x: 8.8, y: 12.15, art: 'busch', s: 0.9 },
];

export function inselUmgebung(breite: number, tiefe: number): readonly UmgebungPlatz[] {
  const fx = breite / 12;
  const fy = tiefe / 12;
  return PLAETZE_12.map((p) => ({
    ...p,
    x: p.x < 0 ? p.x : p.x >= 12 ? breite + (p.x - 12) : p.x * fx,
    y: p.y < 0 ? p.y : p.y >= 12 ? tiefe + (p.y - 12) : p.y * fy,
  }));
}
