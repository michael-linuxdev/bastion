// Einheitskreis (Klasse 10, Feld TF) für Aufgaben und das Werkzeug einheitskreis@1:
// Kreis mit Radius 1, Punkt P zum Winkel α, cos α als waagerechte und sin α als senkrechte
// Strecke. Eigenes kleines Modul, damit die App-Hülle nicht alle Generatoren lädt.
import type { Bild } from '../../../core/learning/generator';
import { de } from '../../hilfen';
import { aufKreis, bild, bogen, gestrichelt, kreis, linie, text } from '../../svg';

const RADIUS = 110;
const RAND_Y = 40;
const RAND_X = 100;
const BREITE = 2 * (RADIUS + RAND_X);
const HOEHE = 2 * (RADIUS + RAND_Y);
/** halbe Textbreite bei Schriftgröße 12, grob geschätzt */
const halb = (t: string) => 3.4 * t.length;

/** Winkel auf 0 … 360 bringen (360 bleibt 360, damit eine volle Drehung zeigbar ist). */
export function normiert(grad: number): number {
  if (grad === 360) return 360;
  return ((grad % 360) + 360) % 360;
}

/** Sinus und Kosinus eines Winkels in Grad, ohne Rundungsrauschen bei 0, ±0,5 und ±1. */
export function sinCos(grad: number): { sin: number; cos: number } {
  const r = (grad * Math.PI) / 180;
  const glatt = (w: number) => {
    const g = Math.round(w * 1e9) / 1e9;
    return Object.is(g, -0) ? 0 : g;
  };
  return { sin: glatt(Math.sin(r)), cos: glatt(Math.cos(r)) };
}

/** Quadrant 1 … 4; 0, wenn P auf einer Achse liegt. */
export function quadrant(grad: number): 0 | 1 | 2 | 3 | 4 {
  const g = normiert(grad);
  if (g % 90 === 0) return 0;
  return (Math.floor(g / 90) + 1) as 1 | 2 | 3 | 4;
}

const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b));

/** Bogenmaß als Vielfaches von π, z. B. 150 → „5π/6“, 180 → „π“; sonst gerundet „≈ 0,79“. */
export function bogenmassText(grad: number): string {
  if (!Number.isInteger(grad))
    return `≈ ${zahlText(Math.round(((grad * Math.PI) / 180) * 100) / 100)}`;
  if (grad === 0) return '0';
  const t = ggt(Math.abs(grad), 180);
  const z = grad / t;
  const n = 180 / t;
  const zaehler = `${z < 0 ? '−' : ''}${Math.abs(z) === 1 ? '' : Math.abs(z)}π`;
  return n === 1 ? zaehler : `${zaehler}/${n}`;
}

/** Zahl deutsch mit höchstens zwei Stellen nach dem Komma, Minus als „−“. */
export function zahlText(w: number): string {
  const g = Math.round(w * 100) / 100;
  const s = String(Math.abs(g)).replace('.', ',');
  return g < 0 ? `−${s}` : s;
}

export interface EinheitskreisOptionen {
  /** sin als senkrechte Strecke zeigen (Standard ja) */
  readonly sin?: boolean;
  /** cos als waagerechte Strecke zeigen (Standard ja) */
  readonly cos?: boolean;
  /** Werte an den Strecken anschreiben (Standard ja); in Aufgaben aus, wenn sie gesucht sind */
  readonly werte?: boolean;
  /** Spiegelpunkt zum Vergleich, etwa 30° zu 150° (gestrichelt) */
  readonly vergleich?: number;
}

/** Das Bild zum Winkel α in Grad. Die Beschreibung nennt Winkel und Lage von P. */
export function einheitskreisBild(grad: number, o: EinheitskreisOptionen = {}): Bild {
  const g = normiert(grad);
  const { sin, cos } = sinCos(g);
  const zeigeSin = o.sin !== false;
  const zeigeCos = o.cos !== false;
  const werte = o.werte !== false;
  const mx = BREITE / 2;
  const my = HOEHE / 2;
  const px = (x: number) => mx + x * RADIUS;
  const py = (y: number) => my - y * RADIUS;
  const teile: string[] = [];
  // Achsen und Kreis
  teile.push(
    linie(px(-1.3), py(0), px(1.3), py(0), 1.5),
    linie(px(0), py(-1.3), px(0), py(1.3), 1.5),
  );
  teile.push(kreis(mx, my, RADIUS));
  teile.push(text(px(1) + 10, py(0) + 16, '1', 12), text(px(-1) - 12, py(0) + 16, '−1', 12));
  teile.push(text(px(0) - 10, py(1) + 16, '1', 12), text(px(0) - 14, py(-1) - 6, '−1', 12));
  teile.push(text(px(1.3) + 10, py(0) + 4, 'x', 12), text(px(0) + 12, py(1.3) + 8, 'y', 12));
  // Vergleichspunkt
  if (typeof o.vergleich === 'number') {
    const v = sinCos(normiert(o.vergleich));
    teile.push(gestrichelt(px(0), py(0), px(v.cos), py(v.sin)));
    teile.push(kreis(px(v.cos), py(v.sin), 4));
  }
  // Winkelbogen und Radius; α über 180° in die Mitte des unteren Bogenteils, damit es nicht
  // auf der Beschriftung von cos liegt
  if (g > 0) teile.push(bogen(mx, my, 18, 0, g === 360 ? 359.9 : g));
  const [wx, wy] = aufKreis(mx, my, 30, g <= 180 ? g / 2 : 180 + (g - 180) / 2);
  if (g > 0) teile.push(text(wx, wy + 4, 'α', 13));
  teile.push(linie(px(0), py(0), px(cos), py(sin), 2));
  // cos waagerecht auf der x-Achse, sin senkrecht vom Fußpunkt zu P
  if (zeigeCos && Math.abs(cos) > 1e-9) {
    teile.push(linie(px(0), py(0), px(cos), py(0), 5));
    const t = werte ? `cos α = ${zahlText(cos)}` : 'cos α';
    // auf der Seite der x-Achse ohne P, mit Abstand zum Winkelbogen
    const lage = Math.max(Math.abs(cos) * (RADIUS / 2), 24 + halb(t));
    teile.push(text(mx + Math.sign(cos) * lage, py(0) + (sin >= 0 ? 20 : -10), t, 12));
  }
  if (zeigeSin && Math.abs(sin) > 1e-9) {
    teile.push(linie(px(cos), py(0), px(cos), py(sin), 5));
    const t = werte ? `sin α = ${zahlText(sin)}` : 'sin α';
    const versatz = (cos >= 0 ? 1 : -1) * (10 + halb(t));
    teile.push(text(px(cos) + versatz, py(sin / 2) + 4, t, 12));
  }
  teile.push(kreis(px(cos), py(sin), 5, true));
  // P etwas außerhalb; auf der x-Achse darüber, damit es nicht auf „1“ oder „x“ liegt
  const aufX = Math.abs(sin) < 0.2;
  const aufY = Math.abs(cos) < 0.2;
  teile.push(text(px(cos * 1.14) + (aufY ? 12 : 0), py(sin * 1.14) + (aufX ? -10 : 5), 'P', 14));
  const lage = werte ? ` P liegt bei (${zahlText(cos)} | ${zahlText(sin)}).` : '';
  return bild(BREITE, HOEHE, teile, {
    ...de(`Einheitskreis mit dem Winkel α = ${g}°.${lage}`),
  });
}
