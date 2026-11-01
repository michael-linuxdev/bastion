import { describe, expect, it } from 'vitest';
import { fehlbetraege, restLerneinheiten } from './fehlt';

const k = (fleiss: number, behalten: number, koennen: number, schritt: number) => ({
  fleiss,
  behalten,
  koennen,
  schritt,
});

describe('fehlbetraege', () => {
  it('nennt nur, was fehlt, mit der fehlenden Menge', () => {
    expect(fehlbetraege(k(250, 80, 2, 8), { fleiss: 120, behalten: 80, koennen: 1 })).toEqual([
      { ressource: 'fleiss', fehlt: 130 },
      { ressource: 'koennen', fehlt: 1 },
    ]);
  });

  it('ist leer, wenn alles reicht', () => {
    expect(fehlbetraege(k(10, 0, 0, 1), { fleiss: 10, behalten: 0, koennen: 0 })).toEqual([]);
  });

  it('behandelt negative Stände wie null', () => {
    expect(fehlbetraege(k(5, 0, 0, 0), { fleiss: -3, behalten: 0, koennen: 0 })).toEqual([
      { ressource: 'fleiss', fehlt: 5 },
    ]);
  });
});

describe('restLerneinheiten', () => {
  it('zieht den Vorrat an Bauschritten ab', () => {
    expect(restLerneinheiten(k(0, 0, 0, 6), 2)).toBe(4);
  });

  it('ist 0, wenn der Vorrat reicht', () => {
    expect(restLerneinheiten(k(0, 0, 0, 3), 5)).toBe(0);
  });
});
