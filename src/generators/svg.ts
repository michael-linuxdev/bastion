// Kleiner SVG-Baukasten für Aufgabenbilder (INHALTSFORMAT I-11).
// Regeln: keine Verweise nach außen, keine Skripte; Farben über currentColor,
// damit Bilder im hellen und dunklen Design funktionieren.
import type { Bild, Sprachobjekt } from '../core/learning/generator';

const r2 = (x: number) => Math.round(x * 100) / 100;
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function bild(
  breite: number,
  hoehe: number,
  inhalt: readonly string[],
  beschreibung: Sprachobjekt,
): Bild {
  return {
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" ` +
      `fill="none" stroke="currentColor" stroke-width="2" font-family="system-ui, sans-serif">` +
      inhalt.join('') +
      '</svg>',
    beschreibung,
  };
}

export const linie = (x1: number, y1: number, x2: number, y2: number, breite = 2) =>
  `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke-width="${breite}"/>`;

export const rechteck = (x: number, y: number, b: number, h: number, gefuellt = false) =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(b)}" height="${r2(h)}"` +
  (gefuellt ? ' fill="currentColor" fill-opacity="0.35"' : '') +
  '/>';

export const kreis = (cx: number, cy: number, radius: number, gefuellt = false) =>
  `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(radius)}"` +
  (gefuellt ? ' fill="currentColor"' : '') +
  '/>';

/** Kreissektor von winkel1 bis winkel2 (Grad, 0 = oben, im Uhrzeigersinn). */
export function sektor(
  cx: number,
  cy: number,
  radius: number,
  w1: number,
  w2: number,
  gefuellt: boolean,
): string {
  const p = (w: number) => [
    cx + radius * Math.sin((w * Math.PI) / 180),
    cy - radius * Math.cos((w * Math.PI) / 180),
  ];
  const [x1, y1] = p(w1) as [number, number];
  const [x2, y2] = p(w2) as [number, number];
  const gross = w2 - w1 > 180 ? 1 : 0;
  return (
    `<path d="M${r2(cx)} ${r2(cy)} L${r2(x1)} ${r2(y1)} A${r2(radius)} ${r2(radius)} 0 ${gross} 1 ${r2(x2)} ${r2(y2)} Z"` +
    (gefuellt ? ' fill="currentColor" fill-opacity="0.35"' : '') +
    '/>'
  );
}

export const text = (x: number, y: number, inhalt: string, groesse = 16) =>
  `<text x="${r2(x)}" y="${r2(y)}" font-size="${groesse}" text-anchor="middle" fill="currentColor" stroke="none">${esc(inhalt)}</text>`;

/** Pfeilspitze nach unten bei (x, y) – Markierung auf dem Zahlenstrahl. */
export const markierung = (x: number, y: number) =>
  `<path d="M${r2(x - 7)} ${r2(y - 14)} L${r2(x + 7)} ${r2(y - 14)} L${r2(x)} ${r2(y)} Z" fill="currentColor" stroke="none"/>`;

/** Koordinatensystem (1. Quadrant) von 0 … xmax bzw. ymax; liefert Umrechnung in Bildkoordinaten. */
export function koordinatensystem(xmax: number, ymax: number, raster = 30, beschriftungAlle = 1) {
  const rand = 30;
  const breite = rand + xmax * raster + 20;
  const hoehe = rand + ymax * raster + 20;
  const px = (x: number) => rand + x * raster;
  const py = (y: number) => 20 + (ymax - y) * raster;
  const teile: string[] = [];
  for (let x = 0; x <= xmax; x++) teile.push(linie(px(x), py(0), px(x), py(ymax), 0.5));
  for (let y = 0; y <= ymax; y++) teile.push(linie(px(0), py(y), px(xmax), py(y), 0.5));
  teile.push(linie(px(0), py(0), px(xmax), py(0), 2), linie(px(0), py(0), px(0), py(ymax), 2));
  for (let x = 0; x <= xmax; x += beschriftungAlle)
    teile.push(text(px(x), py(0) + 18, String(x), 12));
  for (let y = beschriftungAlle; y <= ymax; y += beschriftungAlle)
    teile.push(text(px(0) - 12, py(y) + 4, String(y), 12));
  return { breite, hoehe, px, py, teile };
}

/** Koordinatensystem mit vier Quadranten von −max … max; liefert Umrechnung in Bildkoordinaten. */
export function koordinatensystem4(max: number, raster = 26) {
  const rand = 20;
  const seite = 2 * rand + 2 * max * raster;
  const px = (x: number) => rand + (x + max) * raster;
  const py = (y: number) => rand + (max - y) * raster;
  const teile: string[] = [];
  for (let t = -max; t <= max; t++) {
    teile.push(linie(px(t), py(-max), px(t), py(max), 0.5));
    teile.push(linie(px(-max), py(t), px(max), py(t), 0.5));
  }
  teile.push(linie(px(-max), py(0), px(max), py(0), 2), linie(px(0), py(-max), px(0), py(max), 2));
  const beschriftung = (t: number) => (t < 0 ? `−${-t}` : String(t));
  for (let t = -max; t <= max; t++) {
    if (t === 0) continue;
    teile.push(text(px(t), py(0) + 16, beschriftung(t), 11));
    teile.push(text(px(0) - 15, py(t) + 4, beschriftung(t), 11));
  }
  teile.push(text(px(0) - 10, py(0) + 16, '0', 11));
  return { breite: seite, hoehe: seite, px, py, teile };
}

/** Punkt mit Beschriftung im Koordinatensystem. */
export const punkt = (x: number, y: number, name: string) =>
  kreis(x, y, 4, true) + text(x + 12, y - 8, name, 14);

/** Vieleck (Linienzug, geschlossen). */
export const vieleck = (punkte: readonly (readonly [number, number])[], gefuellt = false) =>
  `<polygon points="${punkte.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ')}"` +
  (gefuellt ? ' fill="currentColor" fill-opacity="0.25"' : '') +
  '/>';

/** Punkt auf einem Kreis; Winkel in Grad, mathematisch (0° = rechts, gegen den Uhrzeigersinn). */
export const aufKreis = (
  cx: number,
  cy: number,
  radius: number,
  grad: number,
): [number, number] => [
  cx + radius * Math.cos((grad * Math.PI) / 180),
  cy - radius * Math.sin((grad * Math.PI) / 180),
];

/** Winkelbogen von grad1 bis grad2 (mathematisch, gegen den Uhrzeigersinn). */
export function bogen(
  cx: number,
  cy: number,
  radius: number,
  grad1: number,
  grad2: number,
): string {
  const [x1, y1] = aufKreis(cx, cy, radius, grad1);
  const [x2, y2] = aufKreis(cx, cy, radius, grad2);
  const gross = (grad2 - grad1 + 360) % 360 > 180 ? 1 : 0;
  return `<path d="M${r2(x1)} ${r2(y1)} A${r2(radius)} ${r2(radius)} 0 ${gross} 0 ${r2(x2)} ${r2(y2)}" stroke-width="1.5"/>`;
}

/** Kästchen im Raster als gefülltes Quadrat (Zeile 0 = oben). */
export const kaestchen = (x0: number, y0: number, groesse: number, spalte: number, zeile: number) =>
  rechteck(x0 + spalte * groesse, y0 + zeile * groesse, groesse, groesse, true);

/** Raster aus n × m Kästchen. */
export function raster(
  x0: number,
  y0: number,
  groesse: number,
  spalten: number,
  zeilen: number,
): string[] {
  const t: string[] = [];
  for (let s = 0; s <= spalten; s++)
    t.push(linie(x0 + s * groesse, y0, x0 + s * groesse, y0 + zeilen * groesse, 0.5));
  for (let z = 0; z <= zeilen; z++)
    t.push(linie(x0, y0 + z * groesse, x0 + spalten * groesse, y0 + z * groesse, 0.5));
  return t;
}
