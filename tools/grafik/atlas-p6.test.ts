import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { atlasBelagerungId, type AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';

/** Pflicht-IDs der Sprite-Charge P6 (Belagerungs-Himmel / Rauch) laut GRAFIK-SPRITES.md §8. */
const P6 = [
  atlasBelagerungId('himmel'),
  atlasBelagerungId('rauch_1'),
  atlasBelagerungId('rauch_2'),
  atlasBelagerungId('rauch_3'),
] as const;

describe('atlas P6 Belagerung', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('behält frühere Chargen und Version', () => {
    expect(manifest.version).toBe(1);
    expect(ids.has('dorf/e1/kern_s1')).toBe(true);
    expect(ids.has('himmel/sonne')).toBe(true);
    expect(ids.has('bastion/e2/kern_s4')).toBe(true);
  });

  it('enthält Spannungs-Himmel und drei Rauch-Overlays', () => {
    for (const id of P6) {
      expect(ids.has(id), id).toBe(true);
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e?.datei.startsWith('belagerung/')).toBe(true);
      expect(e?.pixel.w).toBeGreaterThan(0);
      expect(e?.pixel.h).toBeGreaterThan(0);
      expect(e?.anker.x).toBe(0.5);
    }
  });

  it('referenzierte P6-PNGs existieren', () => {
    for (const id of P6) {
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e, id).toBeDefined();
      if (!e) continue;
      const pfad = resolve('public/grafik/atlas', e.datei);
      expect(() => readFileSync(pfad), e.datei).not.toThrow();
    }
  });
});
