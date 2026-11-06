import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, verlange, zahl } from '../../hilfen';
import { aufKreis, bild, bogen, linie, text } from '../../svg';

const ARTEN = ['spitz', 'recht', 'stumpf', 'gestreckt', 'überstumpf'];
const artVon = (w: number) => (w < 90 ? 0 : w === 90 ? 1 : w < 180 ? 2 : w === 180 ? 3 : 4);

/** Rechter-Winkel-Zeichen: kleines Quadrat mit Punkt am Scheitel (cx, cy). */
export function rechterWinkel(cx: number, cy: number, start: number): string[] {
  const [ax, ay] = aufKreis(cx, cy, 20, start);
  const [bx, by] = aufKreis(cx, cy, 28.28, start + 45);
  const [ex, ey] = aufKreis(cx, cy, 20, start + 90);
  const [px, py] = aufKreis(cx, cy, 10, start + 45);
  return [
    linie(ax, ay, bx, by, 1.5),
    linie(bx, by, ex, ey, 1.5),
    `<circle cx="${Math.round(px * 100) / 100}" cy="${Math.round(py * 100) / 100}" r="2" fill="currentColor" stroke="none"/>`,
  ];
}

export interface WinkelartParameter {
  readonly ueberstumpf: boolean;
}

/** „Welche Winkelart hat α?“ – Vorlage M.RF.GF.WINKEL.ART */
export const winkelart: Generator<WinkelartParameter> = {
  id: 'gf.winkelart',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['spitz-stumpf-verwechselt', 'innen-statt-aussen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = r.int(0, p.ueberstumpf ? 4 : 3);
    const w = [r.int(4, 16) * 5, 90, r.int(20, 34) * 5, 180, r.int(39, 68) * 5][art] ?? 90;
    const start = r.int(0, 3) * 90 + r.pick([0, 15, 30]); // Lage des ersten Schenkels
    const [cx, cy] = [150, 110];
    const [x1, y1] = aufKreis(cx, cy, 100, start);
    const [x2, y2] = aufKreis(cx, cy, 100, start + w);
    const [lx, ly] = aufKreis(cx, cy, 50, start + w / 2);
    const teile = [
      linie(cx, cy, x1, y1, 2.5),
      linie(cx, cy, x2, y2, 2.5),
      ...(w === 90 ? rechterWinkel(cx, cy, start) : [bogen(cx, cy, 30, start, start + w)]),
      text(lx, ly + 5, 'α', 16),
    ];
    const loesung = auswahl(art);
    return {
      platzhalter: {},
      bild: bild(300, 220, teile, de(`Ein Winkel α, der ${w}° groß ist.`)),
      optionen: ARTEN.slice(0, p.ueberstumpf ? 5 : 4).map((a) => ({ text: de(a) })),
      loesung,
      loesungsweg: [
        de(
          'spitz: kleiner als 90° · recht: genau 90° · stumpf: zwischen 90° und 180° · gestreckt: genau 180°' +
            (p.ueberstumpf ? ' · überstumpf: größer als 180°' : ''),
        ),
        de(`α = ${w}° ist ${ARTEN[art] ?? ''}.`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['spitz-stumpf-verwechselt', art === 0 ? auswahl(2) : art === 2 ? auswahl(0) : undefined],
        ['innen-statt-aussen', art === 4 ? auswahl(artVon(360 - w)) : undefined],
      ]),
    };
  },
};

/**
 * Maße des Winkelmessers (B12): Bildfläche, Mittelpunkt, Radius des Bogens und Länge der
 * Schenkel. Das Bild ist knapp so hoch wie der Halbkreis, damit es am Handy die volle Breite
 * bekommt (Seitenverhältnis fast 2 : 1); 1 Einheit ist dort etwa 1 px.
 */
export const WINKELMESSER = {
  breite: 324,
  hoehe: 170,
  cx: 162,
  cy: 164,
  radius: 148,
  schenkel: 160,
  schrift: 14,
} as const;

/**
 * Winkelmesser mit Mittelpunkt (cx, cy): Halbkreis, Striche alle 5° (lang alle 20°, mittel
 * alle 10°), äußere Skala 0 … 180 von rechts, innere 180 … 0. Beschriftet ist jede 20°-Marke
 * (B12): Mehr Zahlen passen in der lesbaren Größe (14 px am Handy) nicht nebeneinander.
 * `schenkel` liegt zwischen Strichen und Zahlen: Die Zahlen bleiben über den Schenkeln
 * lesbar, die Striche unter den Schenkeln zeigen die Lage. Auch das Werkzeug winkel@1
 * zeichnet damit, Aufgabe und Erklärung sehen gleich aus.
 */
export function winkelmesserTeile(
  cx: number,
  cy: number,
  schenkel: readonly string[] = [],
): string[] {
  const { radius: r, schrift } = WINKELMESSER;
  const striche: string[] = [
    `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z" stroke-width="1.5"/>`,
  ];
  const zahlen: string[] = [];
  for (let g = 0; g <= 180; g += 5) {
    const laenge = g % 20 === 0 ? 17 : g % 10 === 0 ? 12 : 7;
    const [a1, b1] = aufKreis(cx, cy, r, g);
    const [a2, b2] = aufKreis(cx, cy, r - laenge, g);
    striche.push(linie(a1, b1, a2, b2, g % 10 === 0 ? 1.4 : 0.8));
    if (g % 20 === 0) {
      // 0 und 180 etwas nach oben, damit sie nicht auf der Grundlinie stehen
      const lage = Math.min(Math.max(g, 5), 175);
      const [ax, ay] = aufKreis(cx, cy, r - 30, lage);
      const [ix, iy] = aufKreis(cx, cy, r - 58, lage);
      const mitte = schrift * 0.36; // Ziffern senkrecht mittig auf den Punkt
      zahlen.push(
        text(ax, ay + mitte, String(g), schrift),
        text(ix, iy + mitte, String(180 - g), schrift),
      );
    }
  }
  return [...striche, ...schenkel, ...zahlen];
}

export interface WinkelAblesenParameter {
  readonly schritt: number; // 10 oder 5
  readonly beide_seiten: boolean; // true: erster Schenkel auch links (innere Skala)
}

/** Winkel am abgebildeten Winkelmesser ablesen – Vorlage M.RF.GF.WINKEL.ABLESEN */
export const winkelAblesen: Generator<WinkelAblesenParameter> = {
  id: 'gf.winkel-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['falsche-skala'],

  erzeuge(seed, p) {
    verlange(p.schritt === 5 || p.schritt === 10, 'schritt: 5 oder 10');
    const r = rng(seed);
    let w = r.int(10 / p.schritt, 170 / p.schritt) * p.schritt;
    if (w === 90) w = r.pick([80, 100]); // bei 90° sind beide Skalen gleich
    const links = p.beide_seiten && r.int(0, 1) === 1;
    const { cx, cy, schenkel: l } = WINKELMESSER;
    const erster = links ? 180 : 0;
    const zweiter = links ? 180 - w : w;
    const [ex, ey] = aufKreis(cx, cy, l, erster);
    const [zx, zy] = aufKreis(cx, cy, l, zweiter);
    const teile = winkelmesserTeile(cx, cy, [
      linie(cx, cy, ex, ey, 2.5),
      linie(cx, cy, zx, zy, 2.5),
      bogen(cx, cy, 34, Math.min(erster, zweiter), Math.max(erster, zweiter)),
    ]);
    const skala = (g: number) => `${g} auf der äußeren und ${180 - g} auf der inneren Skala`;
    const loesung = zahl(w);
    return {
      platzhalter: {},
      bild: bild(
        WINKELMESSER.breite,
        WINKELMESSER.hoehe,
        teile,
        de(
          `Ein Winkelmesser liegt mit seinem Mittelpunkt am Scheitel eines Winkels. ` +
            `Der erste Schenkel zeigt auf ${skala(erster)}, der zweite auf ${skala(zweiter)}.`,
        ),
      ),
      loesung,
      einheit: '°',
      loesungsweg: [
        de(
          `Lies auf der Skala ab, die beim ersten Schenkel bei 0 beginnt – hier die ${links ? 'innere' : 'äußere'}.`,
        ),
        de(`α = ${w}°`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [['falsche-skala', zahl(180 - w)]]),
    };
  },
};
