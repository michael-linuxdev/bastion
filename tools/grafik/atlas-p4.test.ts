import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  atlasHinterhofId,
  atlasMinibatId,
  type AtlasManifest,
  type HinterhofTeil,
} from '../../src/ui/bastion/grafik/atlas.ts';

const THEMEN = ['bastion', 'garten', 'weltraum', 'dorf', 'unterwasser'] as const;

const HINTERHOF: readonly HinterhofTeil[] = [
  'platz_g',
  'platz_m',
  'platz_offen',
  'wappen_voll',
  'denkmal_voll',
];

describe('atlas P4 Hinterhof/MiniBastion', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('hat Version und behält frühere Chargen', () => {
    expect(manifest.version).toBe(1);
    expect(ids.has('dorf/e1/kern_s1')).toBe(true);
    expect(ids.has('garten/e1/kern_s1')).toBe(true);
    expect(ids.has('bastion/e1/kern_s1')).toBe(true);
    expect(ids.has('himmel/sonne')).toBe(true);
  });

  for (const thema of THEMEN) {
    it(`${thema}: Hinterhof-Objekte laut GRAFIK-SPRITES §7`, () => {
      for (const teil of HINTERHOF) {
        const id = atlasHinterhofId(thema, teil);
        expect(ids.has(id), id).toBe(true);
        const e = manifest.eintraege.find((x) => x.id === id);
        expect(e?.datei).toBe(`hinterhof/${thema}/${teil}.png`);
        expect(e?.anker.y).toBe(1);
        expect(e?.pixel.w).toBeGreaterThan(0);
      }
    });

    it(`${thema}: MiniBastion-Standbild 2∶1 @2x`, () => {
      const id = atlasMinibatId(thema);
      expect(ids.has(id), id).toBe(true);
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e?.datei).toBe(`minibat/${thema}/standbild.png`);
      expect(e?.pixel.w).toBe(960);
      expect(e?.pixel.h).toBe(480);
    });

    it(`${thema}: referenzierte PNGs existieren`, () => {
      const eintraege = manifest.eintraege.filter(
        (e) => e.id.startsWith(`hinterhof/${thema}/`) || e.id === atlasMinibatId(thema),
      );
      expect(eintraege.length).toBe(HINTERHOF.length + 1);
      for (const e of eintraege) {
        const pfad = resolve('public/grafik/atlas', e.datei);
        expect(() => readFileSync(pfad), e.datei).not.toThrow();
      }
    });
  }
});
