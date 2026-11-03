/**
 * Wetter-Optik der Bühne (Auftrag Grafik Punkt 2, GRAFIK §4.3): Pfützen bei Regen,
 * Schneeflecken, ziehende Wolkenschatten bei Sturm, Farben des Regenbogens.
 * Rein: feste Plätze aus der Bauplatzgröße, kein Zufall; die Bewegung hängt nur an der
 * Zeit und steht bei „ruhig“ und „Bewegung reduzieren“ still.
 */
import type { Position } from '../../../core/bastion/katalog';

/** Feste Felder (kein Zufall), gleichmäßig über den Bauplatz verteilt */
function feldfolge(breite: number, tiefe: number, n: number, start: number): Position[] {
  const aus: Position[] = [];
  let x = start;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const gx = Math.floor((((x >> 8) % 1000) / 1000) * breite);
    x = (x * 1103515245 + 12345) % 2147483648;
    const gy = Math.floor((((x >> 8) % 1000) / 1000) * tiefe);
    aus.push({ x: gx, y: gy });
  }
  return aus;
}

/** Pfützen bei Regen: einige Felder, Größe 0,3–0,6 Feld */
export function pfuetzen(
  breite: number,
  tiefe: number,
): readonly { pos: Position; groesse: number }[] {
  const n = Math.max(4, Math.round((breite * tiefe) / 18));
  return feldfolge(breite, tiefe, n, 7).map((pos, i) => ({ pos, groesse: 0.3 + 0.1 * (i % 4) }));
}

/** Schneeverwehungen: mehr Flecken als Pfützen, auch kleinere */
export function schneeFlecken(
  breite: number,
  tiefe: number,
): readonly { pos: Position; groesse: number }[] {
  const n = Math.max(8, Math.round((breite * tiefe) / 8));
  return feldfolge(breite, tiefe, n, 31).map((pos, i) => ({ pos, groesse: 0.35 + 0.12 * (i % 5) }));
}

/**
 * Wolkenschatten bei Sturm: drei weiche Flecken, die über Insel und Meer ziehen.
 * `zeit` in Millisekunden; ohne Bewegung stehen sie an ihrem Startplatz.
 */
export function wolkenSchatten(
  zeit: number,
  breite: number,
  hoehe: number,
  bewegt: boolean,
): readonly { x: number; y: number; rx: number; ry: number }[] {
  const weg = breite + 400;
  return [0, 1, 2].map((i) => {
    const start = (i * weg) / 3;
    const v = 0.03 + i * 0.008; // Bildpunkte je Millisekunde
    const x = ((start + (bewegt ? zeit * v : 0)) % weg) - 200;
    return { x, y: hoehe * (0.35 + 0.2 * i), rx: 160 + 40 * i, ry: 60 + 14 * i };
  });
}

/** Regenbogen von außen nach innen, sanft (keine grellen Töne, R1) */
export const REGENBOGEN_FARBEN = [
  '#e46a6a',
  '#eea25e',
  '#f2d36a',
  '#8fcf74',
  '#6fb6dc',
  '#7f8fd6',
  '#a586c8',
] as const;
