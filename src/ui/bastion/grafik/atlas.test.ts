import { describe, expect, it } from 'vitest';
import { atlasEintrag, atlasId } from './atlas';

describe('atlas', () => {
  it('bildet stabile IDs nach GRAFIK-SPRITES', () => {
    expect(atlasId('dorf', 1, 'kern', 2)).toBe('dorf/e1/kern_s2');
  });

  it('findet Einträge oder liefert undefined für Fallback', () => {
    const m = {
      version: 1,
      eintraege: [
        {
          id: 'garten/e1/wissen_s1',
          datei: 'gebaeude/garten/e1/wissen_s1.png',
          felder: [2, 2] as const,
          anker: { x: 0.5, y: 1 },
          pixel: { w: 192, h: 200 },
        },
      ],
    };
    expect(atlasEintrag(m, 'garten', 1, 'wissen', 1)?.datei).toContain('wissen_s1');
    expect(atlasEintrag(m, 'garten', 1, 'kern', 1)).toBeUndefined();
    expect(atlasEintrag(null, 'dorf', 1, 'kern', 1)).toBeUndefined();
  });
});
