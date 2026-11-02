/**
 * G3 Bewohner (GRAFIK.md §4.4): jedes Bild, das die Bühne wählen kann, liegt im Atlas.
 * Erzeugt mit `tools/grafik/sprites-g3-bewohner.py`; fehlt ein Bild, zeichnet der Code.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';
import {
  atlasBewohnerId,
  type BewohnerArt,
  type BewohnerZyklus,
} from '../../src/ui/bastion/grafik/bewohner.ts';

const ARTEN: readonly BewohnerArt[] = [
  'zwerg',
  'gaertner',
  'bibliothek',
  'torhueter',
  'handwerk',
  'imker',
];
const ZYKLEN: Readonly<Record<BewohnerZyklus, number>> = { idle: 3, arbeit: 4, react: 2 };

describe('atlas G3 Bewohner', () => {
  const manifest = JSON.parse(
    readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8'),
  ) as AtlasManifest;
  const ids = new Map(manifest.eintraege.map((e) => [e.id, e] as const));

  for (const art of ARTEN) {
    it(`${art}: alle Bilder 64 × 64 mit Anker unten Mitte`, () => {
      for (const [zyklus, n] of Object.entries(ZYKLEN) as [BewohnerZyklus, number][]) {
        for (let i = 0; i < n; i++) {
          const id = atlasBewohnerId(art, zyklus, i);
          const e = ids.get(id);
          expect(e, id).toBeDefined();
          expect(e?.datei).toBe(`${id}.png`);
          expect(e?.pixel).toEqual({ w: 64, h: 64 });
          expect(e?.anker).toEqual({ x: 0.5, y: 1 });
          expect(() => readFileSync(resolve('public/grafik/atlas', e?.datei ?? ''))).not.toThrow();
        }
      }
    });
  }
});
