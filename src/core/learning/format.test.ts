import { describe, expect, it } from 'vitest';
import { zahlDeutsch } from './format';

describe('zahlDeutsch', () => {
  it('gliedert ab fünf Stellen in Dreiergruppen', () => {
    expect(zahlDeutsch(7)).toBe('7');
    expect(zahlDeutsch(4382)).toBe('4382');
    expect(zahlDeutsch(43825)).toBe('43 825');
    expect(zahlDeutsch(4382517)).toBe('4 382 517');
    expect(zahlDeutsch(100000000000)).toBe('100 000 000 000');
  });

  it('schreibt negative Zahlen mit echtem Minuszeichen', () => {
    expect(zahlDeutsch(-12345)).toBe('−12 345');
  });

  it('weist Kommazahlen ab', () => {
    expect(() => zahlDeutsch(1.5)).toThrow(RangeError);
  });
});
