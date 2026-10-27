import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

export interface QuadratParameter {
  readonly basis_max: number; // 3 … 20
  readonly wurzel: boolean; // false: n² berechnen, true: √(n²) berechnen
}

/** „Berechne 13²“ bzw. „Berechne √169“ – Vorlagen M.ZO.NZ.POTENZEN.QUADRAT und .WURZEL */
export const quadratzahl: Generator<QuadratParameter> = {
  id: 'nz.quadratzahl',
  version: 1,
  platzhalter: ['basis', 'quadrat'],
  fehlerbildIds: ['mal-zwei', 'halbiert'],

  erzeuge(seed, p) {
    verlange(p.basis_max >= 3 && p.basis_max <= 20, 'basis_max: 3 … 20');
    const r = rng(seed);
    const n = r.int(2, p.basis_max);
    const q = n * n;
    const richtig = p.wurzel ? n : q;
    return {
      platzhalter: { basis: n, quadrat: q },
      loesung: zahl(richtig),
      loesungsweg: p.wurzel
        ? [
            de(`Gesucht ist die Zahl, die mit sich selbst multipliziert ${q} ergibt.`),
            de(`${n} · ${n} = ${q}, also √${q} = ${n}`),
          ]
        : [de(`${n}² bedeutet ${n} · ${n}.`), de(`${n} · ${n} = ${zahlDeutsch(q)}`)],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['mal-zwei', p.wurzel ? undefined : zahl(2 * n)],
        ['halbiert', p.wurzel && q % 2 === 0 ? zahl(q / 2) : undefined],
      ]),
    };
  },
};

export interface ZehnerpotenzParameter {
  readonly exponent_max: number; // 2 … 12
  readonly mit_faktor: boolean; // 3 · 10⁵ statt 10⁵
}

/** „Gib als Zahl an: 3 · 10⁵“ – Vorlage M.ZO.NZ.POTENZEN.ZEHNERPOTENZ */
export const zehnerpotenz: Generator<ZehnerpotenzParameter> = {
  id: 'nz.zehnerpotenz',
  version: 1,
  platzhalter: ['faktor', 'exponent'],
  fehlerbildIds: ['null-zu-wenig', 'null-zu-viel', 'faktor-mal-exponent'],

  erzeuge(seed, p) {
    verlange(p.exponent_max >= 2 && p.exponent_max <= 12, 'exponent_max: 2 … 12');
    const r = rng(seed);
    const e = r.int(2, p.exponent_max);
    const f = p.mit_faktor ? r.int(2, 99) : 1;
    const richtig = f * 10 ** e;
    return {
      platzhalter: { faktor: f, exponent: e },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`10 hoch ${e} ist eine 1 mit ${e} Nullen.`),
        de(`${f === 1 ? '' : `${f} · `}10^${e} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['null-zu-wenig', zahl(richtig / 10)],
        ['null-zu-viel', zahl(richtig * 10)],
        ['faktor-mal-exponent', zahl(f * 10 * e)],
      ]),
    };
  },
};
