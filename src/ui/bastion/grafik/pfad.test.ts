import { describe, expect, it } from 'vitest';
import type { Bauwerk } from '../../../core/bastion/katalog';
import { bauplatzAktivSetzen } from './iso';
import { belegteFelder, feldFrei, freiesFeld, pfadSuchen } from './pfad';

const PLATZ = { breite: 12, tiefe: 12 };

function bau(id: string, x: number, y: number, typ: Bauwerk['typ'] = 'turm'): Bauwerk {
  return { id, typ, stufe: 1, pos: { x, y } };
}

describe('pfad', () => {
  it('belegte Felder decken die Gebäudegrundfläche ab', () => {
    // kern ist 3×3
    const belegt = belegteFelder([bau('k', 2, 2, 'kern')]);
    expect(belegt.has('2,2')).toBe(true);
    expect(belegt.has('4,4')).toBe(true);
    expect(belegt.has('5,2')).toBe(false);
  });

  it('Pfad geht um ein Hindernis herum, nicht hindurch', () => {
    bauplatzAktivSetzen(PLATZ);
    // Wand aus Türmen in der Mitte
    const wand = [bau('a', 5, 3), bau('b', 5, 4), bau('c', 5, 5), bau('d', 5, 6)];
    const belegt = belegteFelder(wand);
    const weg = pfadSuchen({ x: 2, y: 4 }, { x: 8, y: 4 }, belegt, PLATZ);
    expect(weg.length).toBeGreaterThan(2);
    for (const p of weg) {
      expect(feldFrei(p.x, p.y, belegt, PLATZ)).toBe(true);
    }
    // Direkt durch die Wandspalte auf y=3..6 geht es nicht
    expect(weg.some((p) => p.x === 5 && p.y >= 3 && p.y <= 6)).toBe(false);
  });

  it('freiesFeld ist deterministisch und meidet Gebäude', () => {
    const belegt = belegteFelder([bau('k', 0, 0, 'kern')]);
    const a = freiesFeld(7, belegt, PLATZ);
    const b = freiesFeld(7, belegt, PLATZ);
    expect(a).toEqual(b);
    expect(feldFrei(a.x, a.y, belegt, PLATZ)).toBe(true);
  });

  it('Vorhaben-Geister belegen Felder wie fertige Gebäude', () => {
    const vorhaben = [
      {
        id: 'v1',
        gebaeude: 'g1',
        typ: 'turm' as const,
        stufe: 1,
        pos: { x: 4, y: 4 },
        bedarf: 3,
        fortschritt: 1,
        erstattbar: 1,
        begonnen: 0,
      },
    ];
    const belegt = belegteFelder([], vorhaben);
    expect(belegt.has('4,4')).toBe(true);
    expect(belegt.has('5,5')).toBe(false);
  });
});
