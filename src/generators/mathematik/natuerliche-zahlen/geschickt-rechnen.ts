import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, mische, verlange, zahl } from '../../hilfen';

export interface GeschicktParameter {
  /** Stufenzahl, die sich ergänzen lässt: 10, 100 oder 1000. */
  readonly stufe: number;
}

/**
 * „Rechne geschickt: 37 + 48 + 63“ bzw. „25 · 17 · 4“ (Vertauschen, Zusammenfassen).
 * Vorlage M.ZO.NZ.REGELN.GESCHICKT
 */
export const geschicktRechnen: Generator<GeschicktParameter> = {
  id: 'nz.geschickt-rechnen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: [],

  erzeuge(seed, p) {
    verlange([10, 100, 1000].includes(p.stufe), 'stufe: 10, 100 oder 1000');
    const r = rng(seed);
    if (r.int(0, 1) === 0) {
      // Addition: zwei Summanden ergänzen sich zur Stufenzahl
      const a = r.int(1, p.stufe - 1);
      const c = p.stufe - a;
      const b = r.int(Math.ceil(p.stufe / 10), p.stufe - 1);
      const [x, y, z] = mische(r, [a, b, c]) as [number, number, number];
      return {
        platzhalter: { aufgabe: de(`${zahlDeutsch(x)} + ${zahlDeutsch(y)} + ${zahlDeutsch(z)}`) },
        loesung: zahl(a + b + c),
        loesungsweg: [
          de(
            `Vertausche und fasse zusammen: ${zahlDeutsch(a)} + ${zahlDeutsch(c)} = ${zahlDeutsch(p.stufe)}`,
          ),
          de(`${zahlDeutsch(p.stufe)} + ${zahlDeutsch(b)} = ${zahlDeutsch(a + b + c)}`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(a + b + c), []),
      };
    }
    // Multiplikation: 2·5, 4·25, 8·125 ergeben Stufenzahlen
    const paare =
      p.stufe === 10
        ? [[2, 5]]
        : p.stufe === 100
          ? [
              [4, 25],
              [2, 50],
              [20, 5],
            ]
          : [
              [8, 125],
              [4, 250],
              [2, 500],
            ];
    const [a, c] = r.pick(paare) as [number, number];
    const b = r.int(3, p.stufe === 10 ? 19 : 99);
    const [x, y, z] = mische(r, [a, b, c]) as [number, number, number];
    return {
      platzhalter: { aufgabe: de(`${zahlDeutsch(x)} · ${zahlDeutsch(y)} · ${zahlDeutsch(z)}`) },
      loesung: zahl(a * b * c),
      loesungsweg: [
        de(`Vertausche und fasse zusammen: ${a} · ${c} = ${zahlDeutsch(a * c)}`),
        de(`${zahlDeutsch(a * c)} · ${b} = ${zahlDeutsch(a * b * c)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(a * b * c), []),
    };
  },
};

export interface VerteilungsParameter {
  readonly faktor_max: number; // 3 … 20
  readonly stufe: number; // 10, 100 oder 1000
}

/** „Rechne geschickt: 7 · 98“ (Verteilungsgesetz) – Vorlage M.ZO.NZ.REGELN.VERTEILEN */
export const verteilungsgesetz: Generator<VerteilungsParameter> = {
  id: 'nz.verteilungsgesetz',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['nur-ein-teil-multipliziert'],

  erzeuge(seed, p) {
    verlange(p.faktor_max >= 3 && p.faktor_max <= 20, 'faktor_max: 3 … 20');
    verlange([10, 100, 1000].includes(p.stufe), 'stufe: 10, 100 oder 1000');
    const r = rng(seed);
    const a = r.int(3, p.faktor_max);
    const d = r.int(1, 3) * (r.int(0, 1) === 0 ? 1 : -1); // 98 = 100 − 2, 102 = 100 + 2
    const b = p.stufe + d;
    const richtig = a * b;
    return {
      platzhalter: { a, b },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`${zahlDeutsch(b)} = ${zahlDeutsch(p.stufe)} ${d < 0 ? '−' : '+'} ${Math.abs(d)}`),
        de(
          `${a} · ${zahlDeutsch(p.stufe)} ${d < 0 ? '−' : '+'} ${a} · ${Math.abs(d)} = ${zahlDeutsch(a * p.stufe)} ${d < 0 ? '−' : '+'} ${a * Math.abs(d)}`,
        ),
        de(`= ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['nur-ein-teil-multipliziert', zahl(a * p.stufe + d)],
      ]),
    };
  },
};
