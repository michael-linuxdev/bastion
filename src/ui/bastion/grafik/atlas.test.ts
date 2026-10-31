import { describe, expect, it } from 'vitest';
import {
  atlasBodenId,
  atlasEintrag,
  atlasFensterId,
  atlasHimmelId,
  atlasId,
  atlasLaubId,
  atlasSchneeDachId,
  atlasWetterId,
} from './atlas';

describe('atlas', () => {
  it('bildet stabile IDs nach GRAFIK-SPRITES', () => {
    expect(atlasId('dorf', 1, 'kern', 2)).toBe('dorf/e1/kern_s2');
    expect(atlasFensterId('dorf', 1, 'kern', 2)).toBe('dorf/e1/kern_s2_fenster');
    expect(atlasFensterId('garten', 1, 'wissen', 1)).toBe('garten/e1/wissen_s1_fenster');
    expect(atlasBodenId('dorf', 1, 'flaeche')).toBe('boden/dorf/e1/flaeche');
    expect(atlasBodenId('dorf', 1, 'rand')).toBe('boden/dorf/e1/rand');
    expect(atlasBodenId('dorf', 1, 'flaeche_hell')).toBe('boden/dorf/e1/flaeche_hell');
    expect(atlasHimmelId('sonne')).toBe('himmel/sonne');
    expect(atlasHimmelId('wolke_2')).toBe('himmel/wolke_2');
    expect(atlasWetterId('regen_tropfen')).toBe('wetter/regen_tropfen');
    expect(atlasSchneeDachId([2, 2])).toBe('auflage/schnee_dach_2x2');
    expect(atlasLaubId(3)).toBe('auflage/laub_3');
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
