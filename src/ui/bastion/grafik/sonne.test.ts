import { describe, expect, it } from 'vitest';
import { istNacht, sonnenzeitenMitteleuropa, szeneAbend, tagImJahr } from './sonne';

describe('sonne', () => {
  it('Tag im Jahr ist stabil', () => {
    expect(tagImJahr(new Date(2026, 0, 1))).toBe(1);
    expect(tagImJahr(new Date(2026, 11, 31))).toBe(365);
  });

  it('Sommer hat längere Tage als Winter', () => {
    const sommer = sonnenzeitenMitteleuropa(new Date(2026, 5, 21));
    const winter = sonnenzeitenMitteleuropa(new Date(2026, 11, 21));
    expect(sommer.untergangMin - sommer.aufgangMin).toBeGreaterThan(
      winter.untergangMin - winter.aufgangMin,
    );
    expect(winter.untergangMin).toBeLessThan(17 * 60);
    expect(sommer.untergangMin).toBeGreaterThan(20 * 60);
  });

  it('Nacht vor Aufgang und nach Untergang', () => {
    const z = { aufgangMin: 7 * 60, untergangMin: 18 * 60 };
    expect(istNacht(new Date(2026, 5, 1, 6, 0), z)).toBe(true);
    expect(istNacht(new Date(2026, 5, 1, 12, 0), z)).toBe(false);
    expect(istNacht(new Date(2026, 5, 1, 19, 0), z)).toBe(true);
  });

  it('szeneAbend folgt Modus und Sonne', () => {
    const mittag = new Date(2026, 5, 21, 12, 0);
    const spaet = new Date(2026, 11, 21, 20, 0);
    expect(szeneAbend('hell', spaet)).toBe(false);
    expect(szeneAbend('dunkel', mittag)).toBe(true);
    expect(szeneAbend('system', mittag)).toBe(false);
    expect(szeneAbend('system', spaet)).toBe(true);
  });
});
