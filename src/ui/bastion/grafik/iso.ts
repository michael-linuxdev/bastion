// Schräg von oben (isometrisch, GRAFIK §1): Umrechnung zwischen Feldern des
// Bauplatzes und Bildpunkten der Bühne. Ohne PixiJS, damit Tests und das
// Antippen dieselbe Rechnung nutzen.
//
// Die aktive Bauplatzgröße folgt der freigeschalteten Epoche (BASEBAU §5.5).
// `bauplatzAktivSetzen` setzt sie vor dem Zeichnen; Standard ist Epoche 1.
import { BAUPLATZ, type Position } from '../../../core/bastion/katalog';

/** Breite und Höhe einer Raute in Bildpunkten (2 : 1) */
export const RAUTE_B = 48;
export const RAUTE_H = 24;
/** Platz über dem Bauplatz für Himmel und hohe Gebäude */
export const HIMMEL = 120;
/** Dicke der Insel */
export const INSEL = 18;
const RAND = 24;

export type BauplatzMass = { readonly breite: number; readonly tiefe: number };

let aktiv: BauplatzMass = BAUPLATZ;

/** Aktive Bauplatzgröße für Umrechnung und Bühnenmaß (G9). */
export function bauplatzAktiv(): BauplatzMass {
  return aktiv;
}

/** Vor dem Zeichnen / Antippen setzen – wenn die Epoche den Platz wachsen lässt. */
export function bauplatzAktivSetzen(platz: BauplatzMass): void {
  aktiv = platz;
}

/** Bühnenmaß aus Bauplatzgröße. */
export function buehneFuer(platz: BauplatzMass = aktiv): {
  readonly breite: number;
  readonly hoehe: number;
  readonly mitteX: number;
} {
  const spanne = platz.breite + platz.tiefe;
  return {
    breite: (spanne * RAUTE_B) / 2 + 2 * RAND,
    hoehe: HIMMEL + (spanne * RAUTE_H) / 2 + INSEL + RAND,
    mitteX: (platz.tiefe * RAUTE_B) / 2 + RAND,
  };
}

/** Breite/Höhe der aktuellen Bühne (Getter, damit Epoche 2–4 mitwachsen). */
export function buehneBreite(): number {
  return buehneFuer().breite;
}
export function buehneHoehe(): number {
  return buehneFuer().hoehe;
}

/**
 * Standard Epoche 1 – für Tests und Orte, die eine feste Zahl brauchen.
 * Laufzeit-Zeichnung nutzt `buehneBreite` / `buehneHoehe`.
 */
export const BUEHNE_B = buehneFuer(BAUPLATZ).breite;
export const BUEHNE_H = buehneFuer(BAUPLATZ).hoehe;

/** Bildpunkt einer Feldecke (gx, gy dürfen gebrochen sein; 0.5/0.5 = Feldmitte) */
export function punkt(gx: number, gy: number): { x: number; y: number } {
  const { mitteX } = buehneFuer();
  return {
    x: mitteX + ((gx - gy) * RAUTE_B) / 2,
    y: HIMMEL + ((gx + gy) * RAUTE_H) / 2,
  };
}

/** Feld unter einem Bildpunkt – oder undefined neben dem Bauplatz */
export function feldUnter(x: number, y: number): Position | undefined {
  const { mitteX } = buehneFuer();
  const u = (x - mitteX) / (RAUTE_B / 2);
  const v = (y - HIMMEL) / (RAUTE_H / 2);
  const gx = Math.floor((u + v) / 2);
  const gy = Math.floor((v - u) / 2);
  return gx >= 0 && gy >= 0 && gx < aktiv.breite && gy < aktiv.tiefe ? { x: gx, y: gy } : undefined;
}
