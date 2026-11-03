import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { atlasDatei, type AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';

/** Scharf beim Zoomen (G17): @2x-Bilder in doppelter Größe */
const ATLAS = resolve('public/grafik/atlas');
const manifest = JSON.parse(readFileSync(`${ATLAS}/manifest.json`, 'utf8')) as AtlasManifest;

function pngGroesse(pfad: string): { w: number; h: number } {
  const b = readFileSync(pfad);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

describe('Atlas in doppelter Größe (G17)', () => {
  it('alle Gebäude haben ein @2x-Bild, doppelt so groß wie das Original', () => {
    const gebaeude = manifest.eintraege.filter((e) => e.datei.startsWith('gebaeude/'));
    expect(gebaeude.length).toBeGreaterThan(100);
    for (const e of gebaeude) {
      expect(e.hd, e.id).toBe(true);
      const hd = `${ATLAS}/${atlasDatei(e, 3)}`;
      expect(existsSync(hd), hd).toBe(true);
      const g = pngGroesse(hd);
      // gleiche Form, doppelte Größe (±2 Pixel Rand)
      expect(Math.abs(g.w - 2 * e.pixel.w), e.id).toBeLessThanOrEqual(2);
      expect(Math.abs(g.h - 2 * e.pixel.h), e.id).toBeLessThanOrEqual(4);
    }
  });

  it('jedes Ding der Kulisse hat ein @2x-Bild (sonst wäre es auf dem Handy kaputt)', () => {
    for (const thema of ['bastion', 'dorf', 'garten', 'unterwasser', 'weltraum']) {
      const ordner = `${ATLAS}/kulisse/${thema}/dinge`;
      for (const datei of readdirSync(ordner).filter(
        (d) => d.endsWith('.png') && !d.includes('@2x'),
      ))
        expect(
          existsSync(`${ordner}/${datei.replace(/\.png$/, '@2x.png')}`),
          `${thema}/${datei}`,
        ).toBe(true);
    }
  });

  it('niedrige Pixeldichte lädt weiter das kleine Bild', () => {
    const e = manifest.eintraege.find((x) => x.hd);
    if (!e) throw new Error('kein hd');
    expect(atlasDatei(e, 1)).toBe(e.datei);
    expect(atlasDatei(e, 2)).toBe(e.datei.replace(/\.png$/, '@2x.png'));
  });
});
