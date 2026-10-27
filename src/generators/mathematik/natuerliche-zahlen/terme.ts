import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

export interface TermParameter {
  readonly zahl_max: number; // 9 … 99
  readonly klammern: boolean;
}

/**
 * „Berechne: 18 + 6 · 7“ (Punkt vor Strich) bzw. „(18 + 6) · 7 − 5“ (Klammern).
 * Vorlagen M.ZO.NZ.TERME… liegen bei M.SF.NZ.TERME: PUNKT-VOR-STRICH und KLAMMERN.
 */
export const termBerechnen: Generator<TermParameter> = {
  id: 'nz.term-berechnen',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['von-links-gerechnet', 'klammer-uebersehen'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 9 && p.zahl_max <= 99, 'zahl_max: 9 … 99');
    const r = rng(seed);
    const a = r.int(2, p.zahl_max);
    const b = r.int(2, Math.min(p.zahl_max, 20));
    const c = r.int(2, 9);
    const plus = r.int(0, 1) === 0;
    if (!p.klammern) {
      // a ± b · c
      const bc = b * c;
      const aa = plus ? a : a + bc; // Ergebnis nie negativ
      const richtig = plus ? aa + bc : aa - bc;
      const vonLinks = plus ? (aa + b) * c : (aa - b) * c;
      return {
        platzhalter: { term: de(`${zahlDeutsch(aa)} ${plus ? '+' : '−'} ${b} · ${c}`) },
        loesung: zahl(richtig),
        loesungsweg: [
          de(`Punkt vor Strich: zuerst ${b} · ${c} = ${bc}`),
          de(`${zahlDeutsch(aa)} ${plus ? '+' : '−'} ${bc} = ${zahlDeutsch(richtig)}`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(richtig), [
          ['von-links-gerechnet', vonLinks >= 0 ? zahl(vonLinks) : undefined],
        ]),
      };
    }
    // (a ± b) · c − d   mit d kleiner als das Produkt
    const innen = plus ? a + b : Math.max(a, b) - Math.min(a, b) + 1;
    const [x, y] = plus ? [a, b] : [Math.max(a, b) + 1, Math.min(a, b)];
    const d = r.int(1, Math.max(1, innen * c - 1));
    const richtig = innen * c - d;
    const ohneKlammer = plus ? x + y * c - d : x - y * c - d;
    return {
      platzhalter: {
        term: de(`(${zahlDeutsch(x)} ${plus ? '+' : '−'} ${y}) · ${c} − ${zahlDeutsch(d)}`),
      },
      loesung: zahl(richtig),
      loesungsweg: [
        de(
          `Zuerst die Klammer: ${zahlDeutsch(x)} ${plus ? '+' : '−'} ${y} = ${zahlDeutsch(innen)}`,
        ),
        de(`Dann Punkt vor Strich: ${zahlDeutsch(innen)} · ${c} = ${zahlDeutsch(innen * c)}`),
        de(`${zahlDeutsch(innen * c)} − ${zahlDeutsch(d)} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['klammer-uebersehen', ohneKlammer >= 0 ? zahl(ohneKlammer) : undefined],
      ]),
    };
  },
};
