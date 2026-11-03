import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AtlasManifest } from '../../src/ui/bastion/grafik/atlas.ts';
import { kulisseFuer } from '../../src/ui/bastion/grafik/kulisse.ts';

/** Bäume, Büsche, Hecken und Teiche je Jahreszeit (G13, `g13_jahreszeiten.py`) */
const JZ = ['fruehling', 'herbst', 'winter'] as const;
const UMGEBUNG = [
  'bastion/umgebung/baum_a',
  'bastion/umgebung/baum_b',
  'bastion/umgebung/busch',
  'dorf/umgebung/baum_a',
  'dorf/umgebung/baum_b',
  'garten/umgebung/strauch_a',
  'garten/umgebung/strauch_b',
] as const;

describe('Atlas: Jahreszeiten (G13)', () => {
  const manifest = JSON.parse(
    readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8'),
  ) as AtlasManifest;
  const nachId = new Map(manifest.eintraege.map((e) => [e.id, e]));

  it('jedes Umgebungsbild mit Laub hat Frühling, Herbst und Winter – mit Datei', () => {
    for (const id of UMGEBUNG)
      for (const jz of JZ) {
        const e = nachId.get(`${id}_${jz}`);
        expect(e, `${id}_${jz}`).toBeDefined();
        expect(existsSync(resolve('public/grafik/atlas', e?.datei ?? '-')), e?.datei).toBe(true);
        // gleicher Fußpunkt wie das Sommerbild, damit der Baum nicht springt
        expect(e?.anker).toEqual(nachId.get(id)?.anker);
      }
  });

  it('jedes Kulisse-Ding mit Jahreszeit hat alle drei Bilder', () => {
    for (const thema of ['bastion', 'dorf', 'garten'] as const) {
      const k = kulisseFuer(thema);
      expect(k?.jahreszeitDinge.length).toBeGreaterThan(0);
      for (const name of k?.jahreszeitDinge ?? []) {
        expect([...(k?.dinge ?? []), ...(k?.weitere ?? []), ...(k?.flaechen ?? [])]).toContain(
          name,
        );
        for (const jz of JZ)
          expect(
            existsSync(resolve(`public/grafik/atlas/kulisse/${thema}/dinge/${name}_${jz}.png`)),
            `${thema}/${name}_${jz}`,
          ).toBe(true);
      }
    }
  });
});
