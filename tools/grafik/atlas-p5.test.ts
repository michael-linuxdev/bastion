import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { GebaeudeTyp } from '../../src/core/bastion/katalog.ts';
import {
  atlasBodenEintrag,
  atlasEintrag,
  atlasFensterEintrag,
  type AtlasManifest,
} from '../../src/ui/bastion/grafik/atlas.ts';

const THEMEN = ['bastion', 'garten', 'weltraum', 'dorf', 'unterwasser'] as const;
const EPOCHEN = [2, 3, 4] as const;

/** Neue Stufen laut Katalog G9 / BASEBAU §5.5 (ab Epoche). */
const NEU: Record<(typeof EPOCHEN)[number], readonly string[]> = {
  2: ['kern_s4', 'kern_s5', 'werkstatt_s2', 'wissen_s3', 'turm_s3', 'eingang_s2'],
  3: ['kern_s6', 'kern_s7', 'werkstatt_s3', 'wissen_s4', 'turm_s4'],
  4: ['kern_s8', 'kern_s9', 'wissen_s5', 'turm_s5'],
};

/** Alle Stufen, die in der Epoche baubar sind (P5 liefert reife Optik). */
const STUFEN_BIS: Record<(typeof EPOCHEN)[number], Record<string, readonly number[]>> = {
  2: {
    kern: [1, 2, 3, 4, 5],
    werkstatt: [1, 2],
    wissen: [1, 2, 3],
    turm: [1, 2, 3],
    eingang: [1, 2],
    einfassung: [1],
    ursprung: [1],
    zeichen: [1],
    flaeche: [1],
    denkmal: [1],
  },
  3: {
    kern: [1, 2, 3, 4, 5, 6, 7],
    werkstatt: [1, 2, 3],
    wissen: [1, 2, 3, 4],
    turm: [1, 2, 3, 4],
    eingang: [1, 2],
    einfassung: [1],
    ursprung: [1],
    zeichen: [1],
    flaeche: [1],
    denkmal: [1],
  },
  4: {
    kern: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    werkstatt: [1, 2, 3],
    wissen: [1, 2, 3, 4, 5],
    turm: [1, 2, 3, 4, 5],
    eingang: [1, 2],
    einfassung: [1],
    ursprung: [1],
    zeichen: [1],
    flaeche: [1],
    denkmal: [1],
  },
};

const FENSTER_ROLLEN = ['kern', 'werkstatt', 'wissen', 'turm'] as const;
const BODEN = ['flaeche', 'rand', 'flaeche_b', 'flaeche_hell'] as const;

describe('atlas P5 Epoche 2–4', () => {
  const roh = readFileSync(resolve('public/grafik/atlas/manifest.json'), 'utf8');
  const manifest = JSON.parse(roh) as AtlasManifest;
  const ids = new Set(manifest.eintraege.map((e) => e.id));

  it('hat Version und behält frühere Chargen', () => {
    expect(manifest.version).toBe(1);
    expect(ids.has('dorf/e1/kern_s1')).toBe(true);
    expect(ids.has('garten/e1/kern_s1')).toBe(true);
    expect(ids.has('bastion/e1/kern_s1')).toBe(true);
    expect(ids.has('hinterhof/dorf/platz_g')).toBe(true);
    expect(ids.has('minibat/bastion/standbild')).toBe(true);
    expect(ids.has('himmel/sonne')).toBe(true);
  });

  for (const thema of THEMEN) {
    for (const epoche of EPOCHEN) {
      it(`${thema}/e${epoche}: Katalog-Stufen G9 inkl. Neu`, () => {
        for (const rolle of NEU[epoche]) {
          const id = `${thema}/e${epoche}/${rolle}`;
          expect(ids.has(id), id).toBe(true);
        }
        for (const [rolle, stufen] of Object.entries(STUFEN_BIS[epoche])) {
          for (const stufe of stufen) {
            const id = `${thema}/e${epoche}/${rolle}_s${stufe}`;
            expect(ids.has(id), id).toBe(true);
            const e = manifest.eintraege.find((x) => x.id === id);
            expect(e?.datei).toBe(`gebaeude/${thema}/e${epoche}/${rolle}_s${stufe}.png`);
            expect(e?.anker.y).toBe(1);
            expect(e?.pixel.w).toBeGreaterThan(0);
          }
        }
        const beispielStufe = epoche === 2 ? 4 : epoche === 3 ? 6 : 8;
        expect(atlasEintrag(manifest, thema, epoche, 'kern', beispielStufe)?.datei).toContain(
          `e${epoche}/kern_s${beispielStufe}`,
        );
      });

      it(`${thema}/e${epoche}: Abend-Fenster deckungsgleich`, () => {
        for (const rolle of FENSTER_ROLLEN) {
          for (const stufe of STUFEN_BIS[epoche][rolle] ?? []) {
            const basisId = `${thema}/e${epoche}/${rolle}_s${stufe}`;
            const fensterId = `${basisId}_fenster`;
            expect(ids.has(fensterId), fensterId).toBe(true);
            const fenster = manifest.eintraege.find((x) => x.id === fensterId);
            const basis = manifest.eintraege.find((x) => x.id === basisId);
            expect(fenster?.pixel.w).toBe(basis?.pixel.w);
            expect(fenster?.pixel.h).toBe(basis?.pixel.h);
            expect(fenster?.anker).toEqual(basis?.anker);
            expect(
              atlasFensterEintrag(manifest, thema, epoche, rolle as GebaeudeTyp, stufe)?.id,
            ).toBe(fensterId);
          }
        }
      });

      it(`${thema}/e${epoche}: Boden-Kacheln`, () => {
        for (const k of BODEN) {
          expect(ids.has(`boden/${thema}/e${epoche}/${k}`), `boden/${thema}/e${epoche}/${k}`).toBe(
            true,
          );
        }
        expect(atlasBodenEintrag(manifest, thema, epoche, 'flaeche')?.id).toBe(
          `boden/${thema}/e${epoche}/flaeche`,
        );
      });
    }

    it(`${thema}: referenzierte P5-PNGs existieren`, () => {
      const p5 = manifest.eintraege.filter(
        (e) =>
          e.id.startsWith(`${thema}/e2/`) ||
          e.id.startsWith(`${thema}/e3/`) ||
          e.id.startsWith(`${thema}/e4/`) ||
          e.id.startsWith(`boden/${thema}/e2/`) ||
          e.id.startsWith(`boden/${thema}/e3/`) ||
          e.id.startsWith(`boden/${thema}/e4/`),
      );
      expect(p5.length).toBeGreaterThan(0);
      for (const e of p5) {
        const pfad = resolve('public/grafik/atlas', e.datei);
        expect(() => readFileSync(pfad), e.datei).not.toThrow();
      }
    });
  }

  it('Epoche-Fallback: fehlende e3 nutzt e2/e1', () => {
    const nurTeil = {
      version: 1,
      eintraege: [
        {
          id: 'dorf/e1/kern_s3',
          datei: 'gebaeude/dorf/e1/kern_s3.png',
          felder: [3, 3] as const,
          anker: { x: 0.5, y: 1 },
          pixel: { w: 10, h: 10 },
        },
        {
          id: 'dorf/e2/kern_s4',
          datei: 'gebaeude/dorf/e2/kern_s4.png',
          felder: [3, 3] as const,
          anker: { x: 0.5, y: 1 },
          pixel: { w: 12, h: 12 },
        },
      ],
    };
    expect(atlasEintrag(nurTeil, 'dorf', 3, 'kern', 3)?.id).toBe('dorf/e1/kern_s3');
    expect(atlasEintrag(nurTeil, 'dorf', 3, 'kern', 4)?.id).toBe('dorf/e2/kern_s4');
    expect(atlasFensterEintrag(manifest, 'dorf', 2, 'kern', 1)?.id).toMatch(/fenster$/);
    expect(atlasBodenEintrag(manifest, 'dorf', 4, 'flaeche')?.id).toMatch(/boden\/dorf\/e/);
  });
});
