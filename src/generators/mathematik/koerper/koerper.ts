import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';
import { bild, linie, text } from '../../svg';

/** Schrägbild eines Quaders (Breite a, Tiefe b, Höhe c): Tiefe unter 45°, verkürzt auf die Hälfte. */
export function schraegbild(a: number, b: number, c: number, einheit: string): string[] {
  const k = 0.5 * Math.SQRT1_2; // Verkürzung · cos 45°
  const s = Math.min(200 / (a + b * k), 150 / (c + b * k));
  const [dx, dy] = [b * s * k, -b * s * k];
  const x0 = (320 - (a * s + dx)) / 2;
  const hoehe = c * s - dy; // dy ist negativ
  const y0 = (210 - hoehe) / 2 + 5 + hoehe; // unten bleibt Platz für die Beschriftung
  const p = (x: number, y: number, z: number): [number, number] => [
    x0 + x * s + z * dx,
    y0 - y * s + z * dy,
  ];
  const kante = (p1: [number, number], p2: [number, number], verdeckt = false) =>
    linie(p1[0], p1[1], p2[0], p2[1], 2).replace(
      '/>',
      verdeckt ? ' stroke-dasharray="5 4"/>' : '/>',
    );
  const [A, B, C, D] = [p(0, 0, 0), p(a, 0, 0), p(a, c, 0), p(0, c, 0)]; // vorne
  const [E, F, G, H] = [p(0, 0, 1), p(a, 0, 1), p(a, c, 1), p(0, c, 1)]; // hinten
  return [
    kante(A, B),
    kante(B, C),
    kante(C, D),
    kante(D, A),
    kante(B, F),
    kante(C, G),
    kante(D, H),
    kante(F, G),
    kante(G, H),
    kante(A, E, true),
    kante(E, F, true),
    kante(E, H, true),
    text((A[0] + B[0]) / 2, A[1] + 20, `${zahlDeutsch(a)} ${einheit}`, 13),
    text(
      A[0] - 10 - 3.6 * (String(c).length + einheit.length + 1),
      (A[1] + D[1]) / 2 + 5,
      `${zahlDeutsch(c)} ${einheit}`,
      13,
    ),
    text(
      (B[0] + F[0]) / 2 + 12 + 3.6 * (String(b).length + einheit.length + 1),
      (B[1] + F[1]) / 2 + 8,
      `${zahlDeutsch(b)} ${einheit}`,
      13,
    ),
  ];
}

function kanten(r: Rng, wuerfel: boolean, max: number): [number, number, number] {
  const a = r.int(2, max);
  return wuerfel ? [a, a, a] : [a, r.int(2, max), r.int(2, max)];
}

export interface VolumenParameter {
  readonly wuerfel: boolean;
  readonly max: number;
}

/** Volumen eines Quaders oder Würfels – Vorlagen M.GM.KP.VOLUMEN.QUADER und .WUERFEL */
export const volumen: Generator<VolumenParameter> = {
  id: 'kp.volumen',
  version: 1,
  platzhalter: ['angabe', 'einheit'],
  fehlerbildIds: ['kanten-addiert', 'nur-grundflaeche', 'oberflaeche-berechnet'],

  erzeuge(seed, p) {
    verlange(p.max >= 3 && p.max <= 30, 'max: 3 … 30');
    const r = rng(seed);
    const [a, b, c] = kanten(r, p.wuerfel, p.max);
    const e = r.pick(['cm', 'dm', 'm']);
    const V = a * b * c;
    const loesung = zahl(V);
    return {
      platzhalter: {
        angabe: de(
          p.wuerfel
            ? `Ein Würfel hat die Kantenlänge ${a} ${e}.`
            : `Ein Quader ist ${a} ${e} breit, ${b} ${e} tief und ${c} ${e} hoch.`,
        ),
        einheit: de(`${e}³`),
      },
      bild: bild(
        320,
        230,
        schraegbild(a, b, c, e),
        de(
          p.wuerfel
            ? `Schrägbild eines Würfels mit ${a} ${e} Kantenlänge.`
            : `Schrägbild eines Quaders, ${a} ${e} breit, ${b} ${e} tief und ${c} ${e} hoch.`,
        ),
      ),
      loesung,
      loesungsweg: [
        de(
          p.wuerfel ? 'Volumen des Würfels: V = a · a · a.' : 'Volumen des Quaders: V = a · b · c.',
        ),
        de(`V = ${a} ${e} · ${b} ${e} · ${c} ${e} = ${zahlDeutsch(V)} ${e}³`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['kanten-addiert', zahl(a + b + c)],
        ['nur-grundflaeche', zahl(a * b)],
        ['oberflaeche-berechnet', zahl(2 * (a * b + a * c + b * c))],
      ]),
    };
  },
};

export interface KanteFehltParameter {
  readonly max: number;
}

/** Fehlende Kante aus dem Volumen – Vorlage M.GM.KP.VOLUMEN.KANTE-FEHLT */
export const kanteFehlt: Generator<KanteFehltParameter> = {
  id: 'kp.kante-fehlt',
  version: 1,
  platzhalter: ['angabe', 'einheit'],
  fehlerbildIds: ['nur-durch-eine-kante', 'subtrahiert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const [a, b, c] = kanten(r, false, p.max);
    const e = r.pick(['cm', 'dm', 'm']);
    const V = a * b * c;
    const loesung = zahl(c);
    return {
      platzhalter: {
        angabe: de(
          `Ein Quader hat das Volumen ${zahlDeutsch(V)} ${e}³. Er ist ${a} ${e} breit und ${b} ${e} tief.`,
        ),
        einheit: de(e),
      },
      loesung,
      loesungsweg: [
        de(`Grundfläche: ${a} ${e} · ${b} ${e} = ${a * b} ${e}²`),
        de(`Höhe = Volumen : Grundfläche = ${zahlDeutsch(V)} : ${a * b} = ${c} ${e}`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['nur-durch-eine-kante', zahl(V / a)],
        ['subtrahiert', V - a - b > 0 ? zahl(V - a - b) : undefined],
      ]),
    };
  },
};

export interface OberflaecheParameter {
  readonly wuerfel: boolean;
  readonly gegeben: 'kanten' | 'flaechen'; // flaechen: die drei verschiedenen Seitenflächen
  readonly max: number;
}

/** Oberflächeninhalt von Würfel oder Quader – Vorlagen M.GM.KP.OBERFLAECHE.WUERFEL und .QUADER */
export const oberflaeche: Generator<OberflaecheParameter> = {
  id: 'kp.oberflaeche',
  version: 1,
  platzhalter: ['angabe', 'einheit'],
  fehlerbildIds: ['nur-eine-flaeche', 'nur-drei-flaechen', 'vier-flaechen', 'volumen-berechnet'],

  erzeuge(seed, p) {
    verlange(!(p.wuerfel && p.gegeben === 'flaechen'), 'Würfel nur mit gegebener Kante');
    const r = rng(seed);
    const [a, b, c] = kanten(r, p.wuerfel, p.max);
    const e = r.pick(['cm', 'dm', 'm']);
    const [ab, ac, bc] = [a * b, a * c, b * c];
    const O = 2 * (ab + ac + bc);
    const loesung = zahl(O);
    const angabe = p.wuerfel
      ? `Ein Würfel hat die Kantenlänge ${a} ${e}.`
      : p.gegeben === 'kanten'
        ? `Ein Quader ist ${a} ${e} breit, ${b} ${e} tief und ${c} ${e} hoch.`
        : `Die drei verschiedenen Seitenflächen eines Quaders sind ${ab} ${e}², ${ac} ${e}² und ${bc} ${e}² groß.`;
    return {
      platzhalter: { angabe: de(angabe), einheit: de(`${e}²`) },
      bild: bild(
        320,
        230,
        schraegbild(a, b, c, e),
        de(
          p.wuerfel
            ? `Schrägbild eines Würfels mit ${a} ${e} Kantenlänge.`
            : `Schrägbild eines Quaders, ${a} ${e} breit, ${b} ${e} tief und ${c} ${e} hoch.`,
        ),
      ),
      loesung,
      loesungsweg: p.wuerfel
        ? [
            de('Ein Würfel hat 6 gleich große quadratische Flächen: O = 6 · a · a.'),
            de(`O = 6 · ${a} ${e} · ${a} ${e} = 6 · ${a * a} ${e}² = ${zahlDeutsch(O)} ${e}²`),
          ]
        : [
            de(
              'Ein Quader hat 6 Flächen, je zwei sind gleich groß: O = 2 · (a · b + a · c + b · c).',
            ),
            de(
              `O = 2 · (${ab} + ${ac} + ${bc}) ${e}² = 2 · ${ab + ac + bc} ${e}² = ${zahlDeutsch(O)} ${e}²`,
            ),
          ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['nur-eine-flaeche', p.wuerfel ? zahl(a * a) : undefined],
        ['nur-drei-flaechen', p.wuerfel ? undefined : zahl(ab + ac + bc)],
        ['vier-flaechen', p.wuerfel ? zahl(4 * a * a) : undefined],
        ['volumen-berechnet', p.gegeben === 'kanten' ? zahl(a * b * c) : undefined],
      ]),
    };
  },
};
