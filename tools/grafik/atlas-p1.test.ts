import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  atlasHimmelId,
  atlasLaubId,
  atlasSchneeDachId,
  atlasWetterId,
  type AtlasManifest,
} from '../../src/ui/bastion/grafik/atlas.ts';

/** Pflicht-IDs der Sprite-Charge P1 (Wetter-Himmel) laut GRAFIK-SPRITES.md §5/§8. */
const P1_HIMMEL = [
  atlasHimmelId('sonne'),
  atlasHimmelId('mond'),
  atlasHimmelId('wolke_1'),
  atlasHimmelId('wolke_2'),
] as const;

const P1_WETTER = [
  atlasWetterId('regen_tropfen'),
  atlasWetterId('schnee_flocke'),
  atlasWetterId('nebel'),
] as const;

const P1_AUFLAGE = [
  atlasSchneeDachId([1, 1]),
  atlasSchneeDachId([2, 2]),
  atlasSchneeDachId([3, 3]),
  atlasLaubId(1),
  atlasLaubId(2),
  atlasLaubId(3),
] as const;

describe('atlas P1 Wetter-Himmel', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('enthält Sonne, Mond und zwei Wolken', () => {
    for (const id of P1_HIMMEL) {
      expect(ids.has(id), id).toBe(true);
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e?.datei.startsWith('himmel/')).toBe(true);
      expect(e?.pixel.w).toBeGreaterThan(0);
      expect(e?.pixel.h).toBeGreaterThan(0);
    }
  });

  it('enthält Regen, Schnee und Nebel', () => {
    for (const id of P1_WETTER) expect(ids.has(id), id).toBe(true);
  });

  it('enthält Schnee-Dach 1×1/2×2/3×3 und Laub 1…3', () => {
    for (const id of P1_AUFLAGE) expect(ids.has(id), id).toBe(true);
  });

  it('referenzierte P1-PNGs existieren', () => {
    const p1 = [...P1_HIMMEL, ...P1_WETTER, ...P1_AUFLAGE];
    for (const id of p1) {
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e, id).toBeDefined();
      if (!e) continue;
      const pfad = resolve('public/grafik/atlas', e.datei);
      expect(() => readFileSync(pfad), e.datei).not.toThrow();
    }
  });
});
