import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { istUlid, ulid } from './ulid';
import { quelleAusSeed, type ZufallsQuelle } from './zufallsquelle';

const konstant = (byte: number): ZufallsQuelle => ({ fuelle: (b) => b.fill(byte) });

describe('ulid', () => {
  it('kodiert den Zeitstempel wie die Referenz-Spezifikation', () => {
    // Beispielwert aus der ULID-Referenzumsetzung.
    expect(ulid(1469918176385, konstant(0)).slice(0, 10)).toBe('01ARYZ6S41');
  });

  it('kodiert die Grenzwerte korrekt', () => {
    expect(ulid(0, konstant(0))).toBe('00000000000000000000000000');
    expect(ulid(2 ** 48 - 1, konstant(0xff))).toBe('7ZZZZZZZZZZZZZZZZZZZZZZZZZ');
  });

  it('ist mit fester Quelle wiederholbar', () => {
    expect(ulid(1793127000000, quelleAusSeed(1))).toBe('01M5ZB59Y0QK9HWG6BAMMA3BC2');
  });

  it('hat immer die gültige Form', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 ** 48 - 1 }), fc.nat({ max: 0xffffffff }), (zeit, seed) => {
        expect(istUlid(ulid(zeit, quelleAusSeed(seed)))).toBe(true);
      }),
    );
  });

  it('sortiert sich nach der Zeit', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 ** 48 - 2 }), fc.nat({ max: 0xffffffff }), (zeit, seed) => {
        const frueher = ulid(zeit, konstant(0xff));
        const spaeter = ulid(zeit + 1, quelleAusSeed(seed));
        expect(frueher < spaeter).toBe(true);
      }),
    );
  });

  it('erzeugt keine Dubletten', () => {
    const quelle = quelleAusSeed(77);
    const ids = new Set(Array.from({ length: 10_000 }, () => ulid(1793127000000, quelle)));
    expect(ids.size).toBe(10_000);
  });

  it('weist ungültige Zeiten ab', () => {
    expect(() => ulid(-1, konstant(0))).toThrow(RangeError);
    expect(() => ulid(1.5, konstant(0))).toThrow(RangeError);
    expect(() => ulid(2 ** 48, konstant(0))).toThrow(RangeError);
  });

  it('istUlid erkennt falsche Formen', () => {
    expect(istUlid('01ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(true);
    expect(istUlid('01ARYZ6S41TSV4RRFFQ69G5FA')).toBe(false); // zu kurz
    expect(istUlid('01ARYZ6S41TSV4RRFFQ69G5FAI')).toBe(false); // I nicht im Alphabet
    expect(istUlid('81ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(false); // Zeitüberlauf
  });
});
