import { describe, expect, it } from 'vitest';
import { farbenMitJahreszeit, jahreszeitAusDatum, schattieren } from './jahreszeit';

describe('jahreszeit', () => {
  it('ordnet Monate meteorologisch zu', () => {
    expect(jahreszeitAusDatum(new Date(2026, 2, 1))).toBe('fruehling');
    expect(jahreszeitAusDatum(new Date(2026, 5, 15))).toBe('sommer');
    expect(jahreszeitAusDatum(new Date(2026, 9, 1))).toBe('herbst');
    expect(jahreszeitAusDatum(new Date(2026, 11, 31))).toBe('winter');
    expect(jahreszeitAusDatum(new Date(2026, 0, 10))).toBe('winter');
  });

  it('schattieren bleibt im Hex-Rahmen', () => {
    expect(schattieren('#808080', 20)).toMatch(/^#[0-9a-f]{6}$/);
    expect(schattieren('#010101', -50)).toBe('#000000');
  });

  it('Sommer lässt die Palette gleich, Winter hellt den Boden auf', () => {
    const basis = {
      boden: '#886644',
      raster: '#775533',
      himmel: '#D6ECF3',
      wolke: '#FFFFFF',
      licht: '#FFC85A',
      dach: '#C4603A',
      abend: false,
    };
    expect(farbenMitJahreszeit(basis, 'sommer')).toEqual(basis);
    expect(farbenMitJahreszeit(basis, 'winter').boden).not.toBe(basis.boden);
  });
});
