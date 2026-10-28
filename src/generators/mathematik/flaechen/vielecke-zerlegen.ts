// Flächeninhalt von Vielecken – Klasse 7 (LEHRPLAN §8c, M.GM.FL.VIELECKE):
// durch Zerlegen in Rechteck und Dreiecke und durch Ergänzen zu einem Rechteck.
// Alle Maße in ganzen Zentimetern; Flächeninhalte gehen auf halbe cm² auf.
import { zahlText } from '../../../core/learning/text';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, zahl } from '../../hilfen';
import { bild, text, vieleck } from '../../svg';

const S = 22; // Pixel je cm
const cm = (x: number) => `${zahlText(x)} cm`;

// ---------------------------------------------------------------------------
// Zerlegen (M.GM.FL.VIELECKE.ZERLEGEN)

export interface ZerlegenParameter {
  /** false: „Haus“ (Rechteck + Dreieck); true: Rechteck mit zwei Dreiecken links und rechts */
  readonly zwei_dreiecke: boolean;
}

/** „Berechne den Flächeninhalt der Figur.“ – Maße stehen am Bild */
export const vieleckZerlegen: Generator<ZerlegenParameter> = {
  id: 'fl.vieleck-zerlegen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['dreieck-nicht-halbiert', 'dreieck-vergessen', 'umfang-statt-flaeche'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.int(3, 8); // Breite des Rechtecks
    const h = r.int(2, 5); // Höhe des Rechtecks
    const x0 = 30;
    const y0 = 30;
    if (!p.zwei_dreiecke) {
      // Haus: Dreieck mit Grundseite b und Höhe t auf dem Rechteck
      const t = r.int(2, 4);
      const spitze = r.int(0, b); // Spitze irgendwo über der Grundseite
      const punkte: [number, number][] = [
        [x0, y0 + (t + h) * S],
        [x0 + b * S, y0 + (t + h) * S],
        [x0 + b * S, y0 + t * S],
        [x0 + spitze * S, y0],
        [x0, y0 + t * S],
      ];
      const rechteckF = b * h;
      const dreieckF = (b * t) / 2;
      const wert = rechteckF + dreieckF;
      const richtig = zahl(wert);
      const teile = [
        vieleck(punkte, true),
        `<line x1="${x0}" y1="${y0 + t * S}" x2="${x0 + b * S}" y2="${y0 + t * S}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
        `<line x1="${x0 + spitze * S}" y1="${y0}" x2="${x0 + spitze * S}" y2="${y0 + t * S}" stroke-width="1.5" stroke-dasharray="2 3"/>`,
        text(x0 + (b * S) / 2, y0 + (t + h) * S + 18, cm(b), 13),
        text(x0 + b * S + 26, y0 + (t + h / 2) * S + 4, cm(h), 13),
        text(x0 + spitze * S + (spitze < b / 2 ? 26 : -26), y0 + t * S - 8, cm(t), 12),
      ];
      return {
        platzhalter: {},
        bild: bild(
          x0 + b * S + 70,
          y0 + (t + h) * S + 32,
          teile,
          de(
            `Ein „Haus“: unten ein Rechteck, ${cm(b)} breit und ${cm(h)} hoch, darauf ein Dreieck mit derselben Grundseite und der Höhe ${cm(t)}.`,
          ),
        ),
        loesung: richtig,
        loesungsweg: [
          de(`Rechteck: ${b} · ${h} = ${rechteckF} cm²`),
          de(`Dreieck: ${b} · ${t} : 2 = ${zahlText(dreieckF)} cm²`),
          de(`Zusammen: ${zahlText(wert)} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['dreieck-nicht-halbiert', zahl(rechteckF + b * t)],
          ['dreieck-vergessen', zahl(rechteckF)],
        ]),
      };
    }
    // Rechteck in der Mitte, links und rechts je ein rechtwinkliges Dreieck (wie ein Trapez)
    const l = r.int(1, 4);
    let rr = r.int(1, 4);
    if (rr === l) rr = l === 4 ? 3 : l + 1;
    const punkte: [number, number][] = [
      [x0, y0 + h * S],
      [x0 + (l + b + rr) * S, y0 + h * S],
      [x0 + (l + b) * S, y0],
      [x0 + l * S, y0],
    ];
    const rechteckF = b * h;
    const dreiecke = (l * h) / 2 + (rr * h) / 2;
    const wert = rechteckF + dreiecke;
    const richtig = zahl(wert);
    const gestrichelt = (x: number) =>
      `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + h * S}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    const teile = [
      vieleck(punkte, true),
      gestrichelt(x0 + l * S),
      gestrichelt(x0 + (l + b) * S),
      text(x0 + (l * S) / 2, y0 + h * S + 22, cm(l), 12),
      text(x0 + (l + b / 2) * S, y0 + h * S + 22, cm(b), 12),
      text(x0 + (l + b + rr / 2) * S, y0 + h * S + 22, cm(rr), 12),
      text(x0 + (l + b) * S + 24, y0 + (h * S) / 2 + 4, cm(h), 12),
    ];
    return {
      platzhalter: {},
      bild: bild(
        x0 + (l + b + rr) * S + 40,
        y0 + h * S + 36,
        teile,
        de(
          `Ein Viereck, zerlegt in ein Rechteck (${cm(b)} breit, ${cm(h)} hoch) und zwei rechtwinklige Dreiecke links und rechts mit den Grundseiten ${cm(l)} und ${cm(rr)} und der Höhe ${cm(h)}.`,
        ),
      ),
      loesung: richtig,
      loesungsweg: [
        de(`Rechteck: ${b} · ${h} = ${rechteckF} cm²`),
        de(`Dreiecke: ${l} · ${h} : 2 + ${rr} · ${h} : 2 = ${zahlText(dreiecke)} cm²`),
        de(`Zusammen: ${zahlText(wert)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['dreieck-nicht-halbiert', zahl(rechteckF + l * h + rr * h)],
        ['dreieck-vergessen', zahl(rechteckF)],
        ['umfang-statt-flaeche', zahl(l + b + rr + b + 2 * h)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ergänzen (M.GM.FL.VIELECKE.ERGAENZEN)

export interface ErgaenzenParameter {
  /** Anzahl abgeschnittener Ecken: 1 oder 2 */
  readonly ecken: 1 | 2;
}

/** Rechteck mit abgeschnittenen Ecken: „Berechne den Flächeninhalt.“ */
export const vieleckErgaenzen: Generator<ErgaenzenParameter> = {
  id: 'fl.vieleck-ergaenzen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['ecken-nicht-abgezogen', 'ecke-nicht-halbiert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.int(5, 9);
    const h = r.int(4, 7);
    const x0 = 46;
    const y0 = 20;
    // abgeschnittene Ecken: rechts oben, ggf. links oben – Katheten u × v
    const u1 = r.int(1, 3);
    const v1 = r.int(1, 3);
    // die beiden Ecken dürfen sich oben nicht berühren
    const u2 = p.ecken === 2 ? r.int(1, Math.min(3, b - u1 - 1)) : 0;
    const v2 = p.ecken === 2 ? r.int(1, 3) : 0;
    const punkte: [number, number][] = [
      [x0, y0 + h * S],
      [x0 + b * S, y0 + h * S],
      [x0 + b * S, y0 + v1 * S],
      [x0 + (b - u1) * S, y0],
      ...(p.ecken === 2
        ? ([
            [x0 + u2 * S, y0],
            [x0, y0 + v2 * S],
          ] as [number, number][])
        : ([[x0, y0]] as [number, number][])),
    ];
    const ecken = (u1 * v1) / 2 + (u2 * v2) / 2;
    const wert = b * h - ecken;
    const richtig = zahl(wert);
    const gestrichelt = (xa: number, ya: number, xb: number, yb: number) =>
      `<line x1="${xa}" y1="${ya}" x2="${xb}" y2="${yb}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    const teile = [
      vieleck(punkte, true),
      gestrichelt(x0 + (b - u1) * S, y0, x0 + b * S, y0),
      gestrichelt(x0 + b * S, y0, x0 + b * S, y0 + v1 * S),
      ...(p.ecken === 2
        ? [gestrichelt(x0, y0, x0 + u2 * S, y0), gestrichelt(x0, y0, x0, y0 + v2 * S)]
        : []),
      text(x0 + (b * S) / 2, y0 + h * S + 18, cm(b), 13),
      text(x0 - 24, y0 + (h * S) / 2 + 30, cm(h), 12),
      text(x0 + (b - u1 / 2) * S, y0 - 6, cm(u1), 11),
      text(x0 + b * S + 22, y0 + (v1 * S) / 2 + 4, cm(v1), 11),
      ...(p.ecken === 2
        ? [
            text(x0 + (u2 / 2) * S, y0 - 6, cm(u2), 11),
            text(x0 - 24, y0 + (v2 * S) / 2 + 4, cm(v2), 11),
          ]
        : []),
    ];
    return {
      platzhalter: {},
      bild: bild(
        x0 + b * S + 54,
        y0 + h * S + 30,
        teile,
        de(
          `Ein Rechteck, ${cm(b)} breit und ${cm(h)} hoch, bei dem ${p.ecken === 2 ? 'zwei Ecken' : 'eine Ecke'} als rechtwinklige Dreiecke abgeschnitten ${p.ecken === 2 ? 'sind' : 'ist'}: ` +
            `rechts oben mit den Seiten ${cm(u1)} und ${cm(v1)}` +
            (p.ecken === 2 ? `, links oben mit den Seiten ${cm(u2)} und ${cm(v2)}` : '') +
            '.',
        ),
      ),
      loesung: richtig,
      loesungsweg: [
        de(`Ergänze zum Rechteck: ${b} · ${h} = ${b * h} cm²`),
        de(
          `Abgeschnitten: ${p.ecken === 2 ? `${u1} · ${v1} : 2 + ${u2} · ${v2} : 2` : `${u1} · ${v1} : 2`} = ${zahlText(ecken)} cm²`,
        ),
        de(`${b * h} − ${zahlText(ecken)} = ${zahlText(wert)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['ecken-nicht-abgezogen', zahl(b * h)],
        ['ecke-nicht-halbiert', zahl(b * h - u1 * v1 - u2 * v2)],
      ]),
    };
  },
};
