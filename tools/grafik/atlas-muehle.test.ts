import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { atlasDatei, type AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';

/** Drehende Mühlenflügel (G19) */
const ATLAS = resolve('public/grafik/atlas');
const manifest = JSON.parse(readFileSync(`${ATLAS}/manifest.json`, 'utf8')) as AtlasManifest;
const nachId = new Map(manifest.eintraege.map((e) => [e.id, e]));

describe('Mühlenflügel im Atlas (G19)', () => {
  const muehlen = manifest.eintraege.filter((e) => e.fluegel);

  it('jede Stufe der Windmühle hat Flügel und ein Bild ohne Flügel (auch scharf)', () => {
    expect(muehlen.map((e) => e.id).sort()).toEqual([
      'dorf/e1/turm_s1',
      'dorf/e1/turm_s2',
      'dorf/e2/turm_s3',
      'dorf/e3/turm_s4',
      'dorf/e4/turm_s5',
    ]);
    for (const e of muehlen) {
      const ohne = nachId.get(e.fluegel?.ohne ?? '');
      expect(ohne, e.id).toBeDefined();
      if (!ohne) continue;
      expect(existsSync(`${ATLAS}/${ohne.datei}`), ohne.datei).toBe(true);
      expect(existsSync(`${ATLAS}/${atlasDatei(ohne, 3)}`), ohne.id).toBe(true);
      expect(ohne.pixel.w).toBe(e.pixel.w);
    }
  });

  it('die Nabe liegt im Bild, die Flügel sind kürzer als ein Feld', () => {
    for (const e of muehlen) {
      const f = e.fluegel;
      if (!f) continue;
      expect(Math.abs(f.x)).toBeLessThan(e.pixel.w / 2);
      expect(-f.y).toBeLessThan(e.pixel.h);
      expect(f.l).toBeGreaterThan(0.3);
      expect(f.l).toBeLessThan(1);
    }
  });
});
