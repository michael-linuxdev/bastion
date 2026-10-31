import { describe, expect, it } from 'vitest';
import { wesenAnzahl, wesenArten, wesenStarten } from './wesen';

describe('wesen', () => {
  it('Dorf hat drei Arten, Bastion vorerst keine', () => {
    expect(wesenArten('dorf')).toHaveLength(3);
    expect(wesenArten('bastion')).toHaveLength(0);
  });

  it('Anzahl steigt mit Gebäuden und ist bei leicht begrenzt', () => {
    expect(wesenAnzahl(0, false)).toBe(1);
    expect(wesenAnzahl(9, false)).toBe(4);
    expect(wesenAnzahl(20, false)).toBe(5);
    expect(wesenAnzahl(20, true)).toBe(3);
  });

  it('Startliste ist deterministisch', () => {
    const a = wesenStarten('dorf', 6, false);
    const b = wesenStarten('dorf', 6, false);
    expect(a.map((w) => w.id)).toEqual(b.map((w) => w.id));
    expect(a.length).toBe(wesenAnzahl(6, false));
  });
});
