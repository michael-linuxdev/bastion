import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  atlasEintrag,
  atlasWesenId,
  type AtlasManifest,
} from '../../src/ui/bastion/grafik/atlas.ts';

/** Pflicht-Gebäude je Thema (Epoche 1) laut GRAFIK-SPRITES.md §8 P3. */
const ROLLEN = [
  'kern_s1',
  'kern_s2',
  'kern_s3',
  'werkstatt_s1',
  'wissen_s1',
  'wissen_s2',
  'turm_s1',
  'turm_s2',
  'eingang_s1',
  'einfassung_s1',
  'ursprung_s1',
  'zeichen_s1',
  'flaeche_s1',
  'denkmal_s1',
] as const;

const THEMEN = ['bastion', 'unterwasser', 'weltraum'] as const;

const BODEN = ['flaeche', 'rand', 'flaeche_b', 'flaeche_hell'] as const;

/** Abend-Fenster wo Gebäude Öffnungen haben (GRAFIK-SPRITES.md §3). */
const FENSTER: Record<(typeof THEMEN)[number], readonly string[]> = {
  bastion: [
    'kern_s1_fenster',
    'kern_s2_fenster',
    'kern_s3_fenster',
    'werkstatt_s1_fenster',
    'wissen_s1_fenster',
    'wissen_s2_fenster',
    'turm_s1_fenster',
    'turm_s2_fenster',
  ],
  unterwasser: [
    'kern_s1_fenster',
    'kern_s2_fenster',
    'kern_s3_fenster',
    'werkstatt_s1_fenster',
    'wissen_s1_fenster',
    'wissen_s2_fenster',
  ],
  weltraum: [
    'kern_s1_fenster',
    'kern_s2_fenster',
    'kern_s3_fenster',
    'werkstatt_s1_fenster',
    'wissen_s1_fenster',
    'wissen_s2_fenster',
  ],
};

const WESEN: Record<(typeof THEMEN)[number], readonly string[]> = {
  bastion: ['moewe', 'fuchs', 'wache'],
  unterwasser: ['fisch', 'qualle', 'krebs'],
  weltraum: ['drohne', 'roboter'],
};

describe('atlas P3 Bastion/Unterwasser/Weltraum', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('hat Version und behält frühere Chargen', () => {
    expect(manifest.version).toBe(1);
    expect(ids.has('dorf/e1/kern_s1')).toBe(true);
    expect(ids.has('garten/e1/kern_s1')).toBe(true);
    expect(ids.has('himmel/sonne')).toBe(true);
  });

  for (const thema of THEMEN) {
    it(`${thema}: alle Gebäude-Rollen Epoche 1`, () => {
      for (const rolle of ROLLEN) {
        const id = `${thema}/e1/${rolle}`;
        expect(ids.has(id), id).toBe(true);
        const e = manifest.eintraege.find((x) => x.id === id);
        expect(e?.datei.startsWith(`gebaeude/${thema}/`)).toBe(true);
        expect(e?.anker.y).toBe(1);
        expect(e?.pixel.w).toBeGreaterThan(0);
      }
      expect(atlasEintrag(manifest, thema, 1, 'kern', 1)?.datei).toContain('kern_s1');
    });

    it(`${thema}: Abend-Fenster deckungsgleich`, () => {
      for (const rolle of FENSTER[thema]) {
        const id = `${thema}/e1/${rolle}`;
        expect(ids.has(id), id).toBe(true);
        const fenster = manifest.eintraege.find((x) => x.id === id);
        const basis = manifest.eintraege.find((x) => x.id === id.replace(/_fenster$/, ''));
        expect(fenster?.pixel.w).toBe(basis?.pixel.w);
        expect(fenster?.pixel.h).toBe(basis?.pixel.h);
        expect(fenster?.anker).toEqual(basis?.anker);
      }
    });

    it(`${thema}: Boden-Kacheln`, () => {
      for (const k of BODEN) {
        expect(ids.has(`boden/${thema}/e1/${k}`), `boden/${thema}/e1/${k}`).toBe(true);
      }
    });

    it(`${thema}: Wesen-Frames idle/walk/react`, () => {
      for (const art of WESEN[thema]) {
        for (let i = 0; i < 3; i++) expect(ids.has(atlasWesenId(thema, art, 'idle', i))).toBe(true);
        for (let i = 0; i < 4; i++) expect(ids.has(atlasWesenId(thema, art, 'walk', i))).toBe(true);
        for (let i = 0; i < 2; i++)
          expect(ids.has(atlasWesenId(thema, art, 'react', i))).toBe(true);
      }
    });

    it(`${thema}: referenzierte PNGs existieren`, () => {
      const eintraege = manifest.eintraege.filter(
        (e) =>
          e.id.startsWith(`${thema}/`) ||
          e.id.startsWith(`boden/${thema}/`) ||
          e.id.startsWith(`wesen/${thema}/`),
      );
      expect(eintraege.length).toBeGreaterThanOrEqual(ROLLEN.length);
      for (const e of eintraege) {
        const pfad = resolve('public/grafik/atlas', e.datei);
        expect(() => readFileSync(pfad), e.datei).not.toThrow();
      }
    });
  }
});
