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
