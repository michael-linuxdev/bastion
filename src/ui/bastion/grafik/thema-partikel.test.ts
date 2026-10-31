import { describe, expect, it } from 'vitest';
import { istLandBildart } from './thema-partikel';

describe('istLandBildart', () => {
  it('zählt Bastion, Dorf und Garten als Land', () => {
    expect(istLandBildart('insel')).toBe(true);
    expect(istLandBildart('dorf')).toBe(true);
    expect(istLandBildart('garten')).toBe(true);
  });

  it('schließt Unterwasser und Weltraum aus', () => {
    expect(istLandBildart('unterwasser')).toBe(false);
    expect(istLandBildart('weltraum')).toBe(false);
  });
});
