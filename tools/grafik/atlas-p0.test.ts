import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  atlasEintrag,
  atlasWesenId,
  type AtlasManifest,
} from '../../src/ui/bastion/grafik/atlas.ts';

/** Pflicht-IDs der Sprite-Charge P0 (Dorf Epoche 1) laut GRAFIK-SPRITES.md §8. */
const P0_GEBAEUDE = [
  'dorf/e1/kern_s1',
  'dorf/e1/kern_s2',
  'dorf/e1/kern_s3',
  'dorf/e1/werkstatt_s1',
  'dorf/e1/wissen_s1',
  'dorf/e1/wissen_s2',
  'dorf/e1/turm_s1',
  'dorf/e1/turm_s2',
  'dorf/e1/eingang_s1',
  'dorf/e1/einfassung_s1',
  'dorf/e1/ursprung_s1',
  'dorf/e1/zeichen_s1',
  'dorf/e1/flaeche_s1',
  'dorf/e1/denkmal_s1',
] as const;

const P0_BODEN = ['boden/dorf/e1/flaeche', 'boden/dorf/e1/rand'] as const;

describe('atlas P0 Dorf', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('hat Version und Einträge', () => {
    expect(manifest.version).toBe(1);
    expect(manifest.eintraege.length).toBeGreaterThanOrEqual(P0_GEBAEUDE.length);
  });

  it('enthält alle Gebäude-Rollen der Epoche 1 (inkl. höhere Stufen im Katalog)', () => {
    for (const id of P0_GEBAEUDE) {
      expect(ids.has(id), id).toBe(true);
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e?.datei.endsWith('.png')).toBe(true);
      expect(e?.anker.y).toBe(1);
      expect(e?.pixel.w).toBeGreaterThan(0);
      expect(e?.pixel.h).toBeGreaterThan(0);
    }
    expect(atlasEintrag(manifest, 'dorf', 1, 'kern', 1)?.datei).toContain('kern_s1');
  });

  it('enthält Boden-Kacheln', () => {
    for (const id of P0_BODEN) expect(ids.has(id), id).toBe(true);
  });

  it('enthält Wesen-Frames (idle/walk/react) für Huhn, Katze, Spatz', () => {
    for (const art of ['huhn', 'katze', 'spatz'] as const) {
      for (let i = 0; i < 3; i++) expect(ids.has(atlasWesenId('dorf', art, 'idle', i))).toBe(true);
      for (let i = 0; i < 4; i++) expect(ids.has(atlasWesenId('dorf', art, 'walk', i))).toBe(true);
      for (let i = 0; i < 2; i++) expect(ids.has(atlasWesenId('dorf', art, 'react', i))).toBe(true);
    }
  });

  it('referenzierte PNG-Dateien existieren', () => {
    for (const e of manifest.eintraege) {
      const pfad = resolve('public/grafik/atlas', e.datei);
      expect(() => readFileSync(pfad), e.datei).not.toThrow();
    }
  });
});
