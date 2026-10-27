import { describe, expect, it } from 'vitest';
import { pflichttests } from '../../pflichttests';
import {
  malOhneUebertrag,
  schriftlichDividieren,
  schriftlichMultiplizieren,
} from './schriftlich-mult-div';

const stellen = (n: number) => String(n).length;

pflichttests(schriftlichMultiplizieren, {
  niveaus: {
    G: { stellen_a_min: 2, stellen_a_max: 4, stellen_b: 1 },
    M: { stellen_a_min: 3, stellen_a_max: 4, stellen_b: 2 },
  },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: Number(BigInt(i.platzhalter['a'] as number) * BigInt(i.platzhalter['b'] as number)),
  }),
  grenzverletzungen(i, p) {
    const a = i.platzhalter['a'] as number;
    const b = i.platzhalter['b'] as number;
    const f: string[] = [];
    if (stellen(a) < p.stellen_a_min || stellen(a) > p.stellen_a_max) f.push(`a = ${a}`);
    if (stellen(b) !== p.stellen_b || b < 2) f.push(`b = ${b}`);
    return f;
  },
  mindestensVerschieden: { G: 98, M: 98 },
});

for (const [name, mit_rest] of [
  ['ohne Rest', false],
  ['mit Rest', true],
] as const) {
  describe(name, () => {
    pflichttests(schriftlichDividieren, {
      niveaus: {
        G: { stellen_min: 3, stellen_max: 4, mit_rest },
        M: { stellen_min: 4, stellen_max: 6, mit_rest },
      },
      unabhaengigeLoesung(i) {
        const a = BigInt(i.platzhalter['a'] as number);
        const b = BigInt(i.platzhalter['b'] as number);
        return mit_rest
          ? { typ: 'mit-rest', wert: { quotient: Number(a / b), rest: Number(a % b) } }
          : { typ: 'zahl', wert: Number(a / b) };
      },
      grenzverletzungen(i, p) {
        const a = i.platzhalter['a'] as number;
        const b = i.platzhalter['b'] as number;
        const f: string[] = [];
        if (b < 2 || b > 9) f.push(`Teiler ${b}`);
        if (stellen(a) < 2 || stellen(a) > p.stellen_max) f.push(`Dividend ${a}`);
        if (!mit_rest && a % b !== 0) f.push('Rest, obwohl ohne Rest verlangt');
        if (mit_rest && a % b === 0) f.push('kein Rest, obwohl mit Rest verlangt');
        return f;
      },
      mindestensVerschieden: { G: 95, M: 98 },
    });
  });
}

describe('malOhneUebertrag', () => {
  it('bildet den typischen Fehler nach', () => {
    expect(malOhneUebertrag(347, 6)).toBe(1842); // 3·6=18, 4·6=24→4, 7·6=42→2
  });
});
