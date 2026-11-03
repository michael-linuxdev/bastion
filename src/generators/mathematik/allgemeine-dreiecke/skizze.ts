// Skizze eines beliebigen Dreiecks ABC (Klasse 10, Feld AD: Sinus- und Kosinussatz) für Aufgaben
// und das Werkzeug dreieck@1. Die Form folgt den Winkeln α und β; A unten links, B unten
// rechts, C oben. Eigenes kleines Modul, damit die App-Hülle nicht alle Generatoren lädt.
import type { Bild } from '../../../core/learning/generator';
import { de } from '../../hilfen';
import { bild, bogen, text, vieleck } from '../../svg';

export interface DreieckWinkel {
  /** Innenwinkel bei A in Grad */
  readonly alpha: number;
  /** Innenwinkel bei B in Grad */
  readonly beta: number;
}

const BREITE = 390;
const HOEHE = 220;
const RAND = 40;
const MIN_BREITE = 150;
const rad = (g: number) => (g * Math.PI) / 180;

/** Ecken in Pixeln: c liegt waagerecht unten, das Dreieck füllt den Rahmen. */
export function ecken(w: DreieckWinkel): Record<'A' | 'B' | 'C', [number, number]> {
  const gamma = 180 - w.alpha - w.beta;
  // Einheitsdreieck mit c = 1
  const b = Math.sin(rad(w.beta)) / Math.sin(rad(gamma));
  const cx = b * Math.cos(rad(w.alpha));
  const cy = b * Math.sin(rad(w.alpha));
  const xs = [0, 1, cx];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const s = Math.min((BREITE - 2 * RAND - 60) / (maxX - minX), (HOEHE - 2 * RAND) / cy);
  // Sehr schmale Dreiecke in die Breite ziehen, damit die Beschriftung Platz hat
  // (die Skizze ist ohnehin nicht maßstäblich)
  const sx = Math.max(s, MIN_BREITE / (maxX - minX));
  const x0 = (BREITE - sx * (maxX - minX)) / 2 - sx * minX;
  const y0 = HOEHE - RAND;
  return { A: [x0, y0], B: [x0 + sx, y0], C: [x0 + sx * cx, y0 - s * cy] };
}

/**
 * Skizze mit Seiten a, b, c und Winkeln α, β, γ. `seiten` und `winkel` beschriften
 * („a = 5 cm“, „α = 40°“); ohne Angabe stehen nur die Namen.
 */
export function allgemeinesDreieck(
  w: DreieckWinkel,
  seiten: Readonly<Record<string, string>>,
  winkelText: Readonly<Record<string, string>>,
): Bild {
  const P = ecken(w);
  const gamma = 180 - w.alpha - w.beta;
  const richtung = (von: [number, number], nach: [number, number]) =>
    (Math.atan2(von[1] - nach[1], nach[0] - von[0]) * 180) / Math.PI;
  const teile = [vieleck([P.A, P.B, P.C])];
  // Eckpunkte
  teile.push(text(P.A[0] - 16, P.A[1] + 16, 'A', 14));
  teile.push(text(P.B[0] + 6, P.B[1] + 16, 'B', 14));
  teile.push(text(P.C[0] - 4, P.C[1] - 8, 'C', 14));
  // Winkelbögen; Namen innen auf der Winkelhalbierenden (Text ist mittig ausgerichtet)
  const winkelAn = (e: 'A' | 'B' | 'C', g1: number, g2: number, name: string) => {
    teile.push(bogen(P[e][0], P[e][1], 22, g1, g2));
    const mitte = rad((g1 + g2) / 2);
    const t = winkelText[name] ?? name;
    const r = 34 + 3.2 * t.length;
    teile.push(text(P[e][0] + r * Math.cos(mitte), P[e][1] - r * Math.sin(mitte) + 4, t, 12));
  };
  winkelAn('A', 0, w.alpha, 'α');
  winkelAn('B', 180 - w.beta, 180, 'β');
  const zuA = richtung(P.C, P.A);
  const zuB = richtung(P.C, P.B);
  winkelAn('C', Math.min(zuA, zuB), Math.max(zuA, zuB), 'γ');
  // Seiten: in der Mitte, senkrecht nach außen versetzt (weg vom Schwerpunkt)
  const sx = (P.A[0] + P.B[0] + P.C[0]) / 3;
  const sy = (P.A[1] + P.B[1] + P.C[1]) / 3;
  const seite = (p: [number, number], q: [number, number], name: string) => {
    const t = seiten[name] ?? name;
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const lang = Math.hypot(q[0] - p[0], q[1] - p[1]);
    let nx = -(q[1] - p[1]) / lang;
    let ny = (q[0] - p[0]) / lang;
    if (nx * (mx - sx) + ny * (my - sy) < 0) [nx, ny] = [-nx, -ny];
    // Abstand: Text ist etwa 3,3 Pixel je halbes Zeichen breit und 12 Pixel hoch
    const abstand = 10 + Math.abs(nx) * 3.3 * t.length + Math.abs(ny) * 8;
    teile.push(text(mx + abstand * nx, my + abstand * ny + 4, t, 13));
  };
  seite(P.B, P.C, 'a');
  seite(P.A, P.C, 'b');
  seite(P.A, P.B, 'c');
  const besch = [...Object.values(seiten), ...Object.values(winkelText)].join(', ');
  return bild(
    BREITE,
    HOEHE,
    teile,
    de(
      `Skizze eines Dreiecks ABC, nicht maßstäblich, mit den Winkeln α bei A, β bei B und γ bei C (γ etwa ${Math.round(gamma)}°).${besch ? ` ${besch}.` : ''}`,
    ),
  );
}
