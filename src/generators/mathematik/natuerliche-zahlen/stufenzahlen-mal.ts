import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

export interface StufenzahlenParameter {
  /** Höchstzahl angehängter Nullen insgesamt (2 … 8). */
  readonly nullen_max: number;
  /** Größte Ziffer vor den Nullen (2 … 9); bei M auch zweistellig bis 25. */
  readonly vorne_max: number;
}

/** „Berechne im Kopf: 40 · 300“ – Vorlage M.ZO.NZ.MULT.STUFENZAHLEN */
export const stufenzahlenMal: Generator<StufenzahlenParameter> = {
  id: 'nz.stufenzahlen-mal',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['null-zu-wenig', 'null-zu-viel'],

  erzeuge(seed, p) {
    verlange(p.nullen_max >= 2 && p.nullen_max <= 8, 'nullen_max: 2 … 8');
    verlange(p.vorne_max >= 2 && p.vorne_max <= 25, 'vorne_max: 2 … 25');
    const r = rng(seed);
    const n1 = r.int(1, p.nullen_max - 1);
    const n2 = r.int(1, p.nullen_max - n1);
    const a = r.int(2, p.vorne_max) * 10 ** n1;
    const b = r.int(2, 9) * 10 ** n2;
    const richtig = a * b;
    return {
      platzhalter: { a, b },
      loesung: zahl(richtig),
      loesungsweg: [
        de(
          `Rechne zuerst ohne Nullen: ${a / 10 ** n1} · ${b / 10 ** n2} = ${(a / 10 ** n1) * (b / 10 ** n2)}`,
        ),
        de(`Hänge dann alle Nullen an: ${n1} + ${n2} = ${n1 + n2} Nullen.`),
        de(`${zahlDeutsch(a)} · ${zahlDeutsch(b)} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['null-zu-wenig', zahl(richtig / 10)],
        ['null-zu-viel', zahl(richtig * 10)],
      ]),
    };
  },
};
