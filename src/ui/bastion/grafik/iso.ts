// Schräg von oben (isometrisch, GRAFIK §1): Umrechnung zwischen Feldern des
// Bauplatzes und Bildpunkten der Bühne. Ohne PixiJS, damit Tests und das
// Antippen dieselbe Rechnung nutzen.
import { BAUPLATZ, type Position } from '../../../core/bastion/katalog';

/** Breite und Höhe einer Raute in Bildpunkten (2 : 1) */
export const RAUTE_B = 48;
export const RAUTE_H = 24;
/** Platz über dem Bauplatz für Himmel und hohe Gebäude */
export const HIMMEL = 120;
/** Dicke der Insel */
export const INSEL = 18;
const RAND = 24;

const SPANNE = BAUPLATZ.breite + BAUPLATZ.tiefe;
export const BUEHNE_B = (SPANNE * RAUTE_B) / 2 + 2 * RAND;
export const BUEHNE_H = HIMMEL + (SPANNE * RAUTE_H) / 2 + INSEL + RAND;
const MITTE_X = (BAUPLATZ.tiefe * RAUTE_B) / 2 + RAND;

/** Bildpunkt einer Feldecke (gx, gy dürfen gebrochen sein; 0.5/0.5 = Feldmitte) */
export function punkt(gx: number, gy: number): { x: number; y: number } {
  return {
    x: MITTE_X + ((gx - gy) * RAUTE_B) / 2,
    y: HIMMEL + ((gx + gy) * RAUTE_H) / 2,
  };
}

/** Feld unter einem Bildpunkt – oder undefined neben dem Bauplatz */
export function feldUnter(x: number, y: number): Position | undefined {
  const u = (x - MITTE_X) / (RAUTE_B / 2);
  const v = (y - HIMMEL) / (RAUTE_H / 2);
  const gx = Math.floor((u + v) / 2);
  const gy = Math.floor((v - u) / 2);
  return gx >= 0 && gy >= 0 && gx < BAUPLATZ.breite && gy < BAUPLATZ.tiefe
    ? { x: gx, y: gy }
    : undefined;
}
