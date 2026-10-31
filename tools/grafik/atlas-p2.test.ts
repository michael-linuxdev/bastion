import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  atlasEintrag,
  atlasWesenId,
  type AtlasManifest,
} from '../../src/ui/bastion/grafik/atlas.ts';

/** Pflicht-IDs der Sprite-Charge P2 (Garten Epoche 1) laut GRAFIK-SPRITES.md §8. */
const P2_GEBAEUDE = [
  'garten/e1/kern_s1',
  'garten/e1/kern_s2',
  'garten/e1/kern_s3',
  'garten/e1/werkstatt_s1',
  'garten/e1/wissen_s1',
  'garten/e1/wissen_s2',
  'garten/e1/turm_s1',
  'garten/e1/turm_s2',
  'garten/e1/eingang_s1',
  'garten/e1/einfassung_s1',
  'garten/e1/ursprung_s1',
  'garten/e1/zeichen_s1',
  'garten/e1/flaeche_s1',
  'garten/e1/denkmal_s1',
] as const;

const P2_BODEN = [
  'boden/garten/e1/flaeche',
  'boden/garten/e1/rand',
  'boden/garten/e1/flaeche_b',
  'boden/garten/e1/flaeche_hell',
] as const;

/** Abend-Fenster für Baumhaus, Schuppen, Gewächshaus (GRAFIK-SPRITES.md §3). */
const P2_FENSTER = [
  'garten/e1/kern_s1_fenster',
  'garten/e1/kern_s2_fenster',
  'garten/e1/kern_s3_fenster',
  'garten/e1/werkstatt_s1_fenster',
  'garten/e1/wissen_s1_fenster',
  'garten/e1/wissen_s2_fenster',
] as const;

describe('atlas P2 Garten', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('hat Version und Einträge inkl. P2', () => {
    expect(manifest.version).toBe(1);
    expect(manifest.eintraege.length).toBeGreaterThanOrEqual(P2_GEBAEUDE.length + P2_BODEN.length);
  });

  it('enthält alle Gebäude-Rollen der Epoche 1 (inkl. höhere Stufen im Katalog)', () => {
    for (const id of P2_GEBAEUDE) {
      expect(ids.has(id), id).toBe(true);
      const e = manifest.eintraege.find((x) => x.id === id);
      expect(e?.datei.endsWith('.png')).toBe(true);
      expect(e?.datei.startsWith('gebaeude/garten/')).toBe(true);
      expect(e?.anker.y).toBe(1);
      expect(e?.pixel.w).toBeGreaterThan(0);
      expect(e?.pixel.h).toBeGreaterThan(0);
    }
    expect(atlasEintrag(manifest, 'garten', 1, 'kern', 1)?.datei).toContain('kern_s1');
  });

  it('enthält Abend-Fenster-Layer deckungsgleich zu den Gebäude-Sprites', () => {
    for (const id of P2_FENSTER) {
      expect(ids.has(id), id).toBe(true);
      const fenster = manifest.eintraege.find((x) => x.id === id);
      const basis = manifest.eintraege.find((x) => x.id === id.replace(/_fenster$/, ''));
      expect(fenster?.datei.endsWith('_fenster.png')).toBe(true);
      expect(fenster?.pixel.w).toBe(basis?.pixel.w);
      expect(fenster?.pixel.h).toBe(basis?.pixel.h);
      expect(fenster?.anker).toEqual(basis?.anker);
    }
  });

  it('enthält Boden-Kacheln', () => {
    for (const id of P2_BODEN) expect(ids.has(id), id).toBe(true);
  });

  it('enthält Wesen-Frames (idle/walk/react) für Biene, Schnecke, Schmetterling', () => {
    for (const art of ['biene', 'schnecke', 'schmetterling'] as const) {
      for (let i = 0; i < 3; i++)
        expect(ids.has(atlasWesenId('garten', art, 'idle', i))).toBe(true);
      for (let i = 0; i < 4; i++)
        expect(ids.has(atlasWesenId('garten', art, 'walk', i))).toBe(true);
      for (let i = 0; i < 2; i++)
        expect(ids.has(atlasWesenId('garten', art, 'react', i))).toBe(true);
    }
  });

  it('referenzierte P2-PNGs existieren', () => {
    const p2 = manifest.eintraege.filter(
      (e) =>
        e.id.startsWith('garten/') ||
        e.id.startsWith('boden/garten/') ||
        e.id.startsWith('wesen/garten/'),
    );
    expect(p2.length).toBeGreaterThanOrEqual(P2_GEBAEUDE.length);
    for (const e of p2) {
      const pfad = resolve('public/grafik/atlas', e.datei);
      expect(() => readFileSync(pfad), e.datei).not.toThrow();
    }
  });
});
