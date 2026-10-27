import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

export interface GleichungParameter {
  readonly zahl_max: number; // 20 … 10 000
  /** Erlaubte Rechenarten: 2 = nur + und −, 4 = auch · und : */
  readonly rechenarten: number;
}

/** „Löse: x + 540 = 684“ – Vorlage M.SF.NZ.GLEICHUNGEN.UMKEHRAUFGABE */
export const gleichungUmkehr: Generator<GleichungParameter> = {
  id: 'nz.gleichung-umkehr',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['gleiche-rechenart'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 20 && p.zahl_max <= 10_000, 'zahl_max: 20 … 10 000');
    verlange(p.rechenarten === 2 || p.rechenarten === 4, 'rechenarten: 2 oder 4');
    const r = rng(seed);
    const art = r.int(0, p.rechenarten - 1);
    const z = (n: number) => zahlDeutsch(n);
    if (art === 0) {
      const x = r.int(1, p.zahl_max);
      const a = r.int(1, p.zahl_max);
      return {
        platzhalter: { gleichung: de(`x + ${z(a)} = ${z(x + a)}`) },
        loesung: zahl(x),
        loesungsweg: [de(`Umkehraufgabe: x = ${z(x + a)} − ${z(a)}`), de(`x = ${z(x)}`)],
        fehlerbilder: fehlerbilderAus(zahl(x), [['gleiche-rechenart', zahl(x + 2 * a)]]),
      };
    }
    if (art === 1) {
      const x = r.int(2, p.zahl_max);
      const a = r.int(1, x - 1);
      return {
        platzhalter: { gleichung: de(`x − ${z(a)} = ${z(x - a)}`) },
        loesung: zahl(x),
        loesungsweg: [de(`Umkehraufgabe: x = ${z(x - a)} + ${z(a)}`), de(`x = ${z(x)}`)],
        fehlerbilder: fehlerbilderAus(zahl(x), [
          ['gleiche-rechenart', x - 2 * a >= 0 ? zahl(x - 2 * a) : undefined],
        ]),
      };
    }
    const a = r.int(2, 12);
    const x = r.int(2, Math.max(2, Math.floor(p.zahl_max / a)));
    if (art === 2) {
      return {
        platzhalter: { gleichung: de(`${a} · x = ${z(a * x)}`) },
        loesung: zahl(x),
        loesungsweg: [de(`Umkehraufgabe: x = ${z(a * x)} : ${a}`), de(`x = ${z(x)}`)],
        fehlerbilder: fehlerbilderAus(zahl(x), [['gleiche-rechenart', zahl(a * a * x)]]),
      };
    }
    return {
      platzhalter: { gleichung: de(`x : ${a} = ${z(x)}`) },
      loesung: zahl(a * x),
      loesungsweg: [de(`Umkehraufgabe: x = ${z(x)} · ${a}`), de(`x = ${z(a * x)}`)],
      fehlerbilder: fehlerbilderAus(zahl(a * x), [
        ['gleiche-rechenart', x % a === 0 ? zahl(x / a) : undefined],
      ]),
    };
  },
};

export interface UngleichungParameter {
  readonly zahl_max: number; // 20 … 1000
}

/** „Gib die größte natürliche Zahl y an, für die gilt: y + 10 < 25“ – Vorlage …GLEICHUNGEN.UNGLEICHUNG */
export const ungleichungGroesste: Generator<UngleichungParameter> = {
  id: 'nz.ungleichung-groesste',
  version: 1,
  platzhalter: ['ungleichung'],
  fehlerbildIds: ['grenze-mitgezaehlt'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 20 && p.zahl_max <= 1000, 'zahl_max: 20 … 1000');
    const r = rng(seed);
    const a = r.int(1, p.zahl_max - 2);
    const b = r.int(a + 2, p.zahl_max);
    const richtig = b - a - 1;
    return {
      platzhalter: { ungleichung: de(`y + ${zahlDeutsch(a)} < ${zahlDeutsch(b)}`) },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Für y + ${zahlDeutsch(a)} = ${zahlDeutsch(b)} wäre y = ${zahlDeutsch(b - a)}.`),
        de(
          `Es soll aber kleiner sein – die größte passende natürliche Zahl ist ${zahlDeutsch(richtig)}.`,
        ),
        de(
          `Probe: ${zahlDeutsch(richtig)} + ${zahlDeutsch(a)} = ${zahlDeutsch(b - 1)} < ${zahlDeutsch(b)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [['grenze-mitgezaehlt', zahl(b - a)]]),
    };
  },
};
