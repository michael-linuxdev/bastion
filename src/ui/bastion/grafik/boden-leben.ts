/**
 * Boden mit Leben (Wunsch PV, 03.11.2026, Schritt 7): kleine Einzelheiten auf freien
 * Feldern der Insel – Grasbüschel, Blumen und Blüten im Frühling und Sommer, Laub im Herbst,
 * Spuren im Winter. Fest aus der Lage des Feldes (kein Zufall), bebaute Felder bleiben frei.
 * Rein: keine Browser-APIs; die Bühne zeichnet die Liste.
 */
import type { Jahreszeit } from './jahreszeit';
import { feldSchluessel } from './pfad';

export type BodenArt = 'buesche' | 'bluete' | 'laub' | 'spur';

export interface BodenDetail {
  /** Lage in Feldern (Mitte des Details) */
  readonly x: number;
  readonly y: number;
  readonly art: BodenArt;
  readonly farbe: string;
}

const BLUETEN: Readonly<Record<Jahreszeit, readonly string[]>> = {
  fruehling: ['#f4b6cc', '#fbf3f6', '#f2d35c', '#c9a6e6'],
  sommer: ['#e0504c', '#f2c94a', '#6d8fe0', '#fbf3f6'],
  herbst: ['#d77a32', '#c4482e', '#e2ac40', '#9c6a3a'],
  winter: [],
};
const GRAS: Readonly<Record<Jahreszeit, string>> = {
  fruehling: '#5fa53f',
  sommer: '#4d8f35',
  herbst: '#8a8a3e',
  winter: '#9fb6a8',
};

function misch(x: number, y: number, k: number): number {
  const h = (Math.imul(x + 211, 2654435761) ^ Math.imul(y + 977, 2246822519) ^ (k * 131)) >>> 0;
  return ((h >>> 9) % 10000) / 10000;
}

/** Einzelheiten auf allen freien Feldern des Bauplatzes */
export function bodenLeben(
  breite: number,
  tiefe: number,
  jz: Jahreszeit,
  belegt: ReadonlySet<string>,
): readonly BodenDetail[] {
  const aus: BodenDetail[] = [];
  for (let y = 0; y < tiefe; y++)
    for (let x = 0; x < breite; x++) {
      if (belegt.has(feldSchluessel(x, y))) continue;
      const anzahl = 1 + Math.floor(misch(x, y, 1) * 3.4);
      for (let k = 0; k < anzahl; k++) {
        const px = x + 0.18 + misch(x, y, 10 + k) * 0.64;
        const py = y + 0.18 + misch(x, y, 20 + k) * 0.64;
        const wahl = misch(x, y, 30 + k);
        const bunt = BLUETEN[jz];
        let art: BodenArt = 'buesche';
        if (jz === 'winter') art = wahl < 0.18 ? 'spur' : 'buesche';
        else if (jz === 'herbst') art = wahl < 0.5 ? 'laub' : 'buesche';
        else if (wahl < (jz === 'fruehling' ? 0.45 : 0.28)) art = 'bluete';
        const farbe =
          art === 'bluete' || art === 'laub'
            ? (bunt[Math.floor(misch(x, y, 40 + k) * bunt.length)] ?? '#ffffff')
            : art === 'spur'
              ? '#9fb4c8'
              : GRAS[jz];
        aus.push({ x: px, y: py, art, farbe });
      }
    }
  return aus;
}
