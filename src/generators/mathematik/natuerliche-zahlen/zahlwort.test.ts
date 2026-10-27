import { describe, expect, it } from 'vitest';
import { zahlwort, zahlwortMoeglich } from './zahlwort';

describe('zahlwort', () => {
  it.each([
    [0, 'null'],
    [1, 'eins'],
    [11, 'elf'],
    [16, 'sechzehn'],
    [17, 'siebzehn'],
    [21, 'einundzwanzig'],
    [30, 'dreißig'],
    [77, 'siebenundsiebzig'],
    [100, 'einhundert'],
    [101, 'einhunderteins'],
    [110, 'einhundertzehn'],
    [1000, 'eintausend'],
    [1001, 'eintausendeins'],
    [2024, 'zweitausendvierundzwanzig'],
    [21_000, 'einundzwanzigtausend'],
    [340_005, 'dreihundertvierzigtausendfünf'],
    [1_000_000, 'eine Million'],
    [2_000_001, 'zwei Millionen eins'],
    [3_400_005, 'drei Millionen vierhunderttausendfünf'],
    [21_000_000, 'einundzwanzig Millionen'],
    [1_000_000_000, 'eine Milliarde'],
    [5_001_000_000, 'fünf Milliarden eine Million'],
    [
      999_999_999_999,
      'neunhundertneunundneunzig Milliarden neunhundertneunundneunzig Millionen ' +
        'neunhundertneunundneunzigtausendneunhundertneunundneunzig',
    ],
  ])('%i → %s', (n, wort) => {
    expect(zahlwort(n)).toBe(wort);
  });

  it('bildet „…eine Millionen“-Fälle nicht und meldet das vorher', () => {
    expect(zahlwortMoeglich(201_000_000)).toBe(false);
    expect(() => zahlwort(201_000_000)).toThrow(RangeError);
    expect(zahlwortMoeglich(1_000_000)).toBe(true);
    expect(zahlwortMoeglich(221_000_000)).toBe(true);
  });

  it('weist Zahlen außerhalb des Bereichs ab', () => {
    expect(() => zahlwort(-1)).toThrow(RangeError);
    expect(() => zahlwort(1e12)).toThrow(RangeError);
    expect(() => zahlwort(1.5)).toThrow(RangeError);
  });
});
