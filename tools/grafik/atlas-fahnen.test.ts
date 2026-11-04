import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';

/** Wehende Fahnen (G18): Lage der Tücher im Gebäudebild */
const ATLAS = resolve('public/grafik/atlas');
const manifest = JSON.parse(readFileSync(`${ATLAS}/manifest.json`, 'utf8')) as AtlasManifest;

describe('Fahnen im Atlas (G18)', () => {
  const mitFahne = manifest.eintraege.filter((e) => e.fahnen && e.fahnen.length > 0);

  it('der Bergfried der Bastion trägt ab Stufe 2 eine Fahne', () => {
    expect(mitFahne.length).toBeGreaterThan(15);
    expect(mitFahne.map((e) => e.id)).toContain('bastion/e1/kern_s2');
  });

  it('das Banner der Bastion hängt am Mast und trägt ein Wappen', () => {
    const banner = mitFahne
      .find((e) => e.id === 'bastion/e1/zeichen_s1')
      ?.fahnen?.find((f) => f.haengt);
    expect(banner?.wappen?.farbe).toMatch(/^#[0-9a-f]{6}$/);
    const w = banner?.wappen;
    if (banner && w) {
      // Wappen auf dem Tuch, zwischen oberem und unterem Rand
      expect(w.y).toBeGreaterThan(banner.y);
      expect(w.y).toBeLessThan(banner.y + banner.h);
    }
  });

  it('jedes Tuch liegt ganz im Bild und hat eine Farbe', () => {
    for (const e of mitFahne)
      for (const f of e.fahnen ?? []) {
        const links = e.pixel.w / 2 + f.x;
        const oben = e.pixel.h + f.y;
        expect(links, e.id).toBeGreaterThanOrEqual(0);
        expect(links + f.b, e.id).toBeLessThanOrEqual(e.pixel.w);
        expect(oben + f.s, e.id).toBeGreaterThanOrEqual(-2);
        expect(oben + f.h, e.id).toBeLessThanOrEqual(e.pixel.h);
        expect(f.farbe, e.id).toMatch(/^#[0-9a-f]{6}$/);
      }
  });
});
