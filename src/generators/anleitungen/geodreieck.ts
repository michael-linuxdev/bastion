// Geodreieck als SVG für Zeichen-Anleitungen (LEHRPLAN L-10).
// Grundlage: lange Kante waagerecht, Nullpunkt in ihrer Mitte bei (0|0),
// Spitze nach oben. Lage über Verschieben und Drehen (Grad, im Uhrzeigersinn).

export interface GeodreieckOptionen {
  /** Länge der langen Kante */
  readonly breite?: number;
  /** Hilfslinien parallel zur langen Kante, Abstände in Bildpunkten */
  readonly hilfslinien?: readonly number[];
  /** Winkelskala (Bogen mit Strichen alle 10°) zeigen */
  readonly skala?: boolean;
}

const r2 = (x: number) => Math.round(x * 100) / 100;

export function geodreieck(
  x: number,
  y: number,
  drehung: number,
  { breite = 240, hilfslinien = [], skala = false }: GeodreieckOptionen = {},
): string {
  const h = breite / 2;
  const t: string[] = [
    `<polygon points="${-h},0 ${h},0 0,${-h}" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>`,
    // Mittellinie vom Nullpunkt zur Spitze
    `<line x1="0" y1="0" x2="0" y2="${r2(-h * 0.9)}" stroke-width="1"/>`,
  ];
  // Zentimeterstriche an der langen Kante
  for (let s = -h + 10; s < h; s += 10)
    t.push(
      `<line x1="${r2(s)}" y1="0" x2="${r2(s)}" y2="${s % 50 === 0 ? -8 : -4}" stroke-width="0.75"/>`,
    );
  for (const d of hilfslinien)
    t.push(
      `<line x1="${r2(-h + d + 6)}" y1="${-d}" x2="${r2(h - d - 6)}" y2="${-d}" stroke-width="0.75" stroke-dasharray="4 3"/>`,
    );
  if (skala) {
    const r = h * 0.62;
    t.push(`<path d="M${r2(-r)} 0 A${r2(r)} ${r2(r)} 0 0 1 ${r2(r)} 0" stroke-width="0.75"/>`);
    for (let w = 0; w <= 180; w += 10) {
      const a = (w * Math.PI) / 180;
      const innen = w % 30 === 0 ? r - 9 : r - 5;
      t.push(
        `<line x1="${r2(r * Math.cos(a))}" y1="${r2(-r * Math.sin(a))}" x2="${r2(innen * Math.cos(a))}" y2="${r2(-innen * Math.sin(a))}" stroke-width="0.75"/>`,
      );
    }
  }
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(drehung)})">${t.join('')}</g>`;
}
