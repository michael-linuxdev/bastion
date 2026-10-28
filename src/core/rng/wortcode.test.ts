import { describe, expect, it } from 'vitest';
import { normalisiereCode, wortcode, WOERTER } from './wortcode';
import { quelleAusSeed } from './zufallsquelle';

describe('Wort-Codes', () => {
  it('256 verschiedene, tippbare Wörter', () => {
    expect(WOERTER).toHaveLength(256);
    expect(new Set(WOERTER).size).toBe(256);
    for (const w of WOERTER) expect(w).toMatch(/^[a-z]{2,8}$/);
  });
  it('vier Wörter, wiederholbar mit gleicher Quelle', () => {
    const a = wortcode(quelleAusSeed(1));
    expect(a.split(' ')).toHaveLength(4);
    expect(wortcode(quelleAusSeed(1))).toBe(a);
    expect(wortcode(quelleAusSeed(2))).not.toBe(a);
  });
  it('normalisiert Eingaben', () => {
    expect(normalisiereCode('  Apfel   Baum\tHund kuh ')).toBe('apfel baum hund kuh');
  });
});
