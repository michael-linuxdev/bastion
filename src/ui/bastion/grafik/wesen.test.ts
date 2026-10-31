import { describe, expect, it } from 'vitest';
import { bauplatzAktivSetzen } from './iso';
import { wesenAnzahl, wesenArten, wesenFliegt, wesenStarten } from './wesen';

describe('wesen', () => {
  it('jedes Thema hat Arten', () => {
    expect(wesenArten('dorf')).toHaveLength(3);
    expect(wesenArten('bastion')).toHaveLength(3);
    expect(wesenArten('weltraum')).toHaveLength(2);
    expect(wesenArten('unterwasser')).toHaveLength(3);
  });

  it('Anzahl steigt mit Gebäuden und ist bei leicht begrenzt', () => {
    expect(wesenAnzahl(0, false)).toBe(1);
    expect(wesenAnzahl(9, false)).toBe(4);
    expect(wesenAnzahl(20, false)).toBe(5);
    expect(wesenAnzahl(20, true)).toBe(3);
  });

  it('Startliste ist deterministisch', () => {
    bauplatzAktivSetzen({ breite: 12, tiefe: 12 });
    const a = wesenStarten('dorf', 6, false);
    const b = wesenStarten('dorf', 6, false);
    expect(a.map((w) => w.id)).toEqual(b.map((w) => w.id));
    expect(a.length).toBe(wesenAnzahl(6, false));
  });

  it('Bodenwesen starten neben Gebäuden, Flieger dürfen überqueren', () => {
    expect(wesenFliegt('huhn')).toBe(false);
    expect(wesenFliegt('spatz')).toBe(true);
  });
});
