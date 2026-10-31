import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../../core/competence/kompetenz';
import type { GeneratorVorlage } from '../../core/learning/vorlage';
import type { Zustand } from '../plattform/ablage';
import { naechsteKompetenz } from './naechste';

const k = (id: string, klasse = 5, vor: string[] = []): Kompetenz =>
  ({
    id,
    klassenstufe_typisch: [klasse],
    voraussetzungen: vor,
  }) as unknown as Kompetenz;

const v = (kompetenz: string): GeneratorVorlage =>
  ({
    id: `${kompetenz}.v`,
    kompetenz,
    niveaus: ['G'],
  }) as unknown as GeneratorVorlage;

const leer: Zustand = { staende: new Map(), karten: [] };

describe('naechsteKompetenz', () => {
  it('nimmt zuerst ein offenes Thema aus Gerade-dran', () => {
    const a = k('A');
    const b = k('B');
    expect(naechsteKompetenz([a, b], [v('A'), v('B')], ['B', 'A'], 'G', 5, leer, 0)?.id).toBe('B');
  });

  it('fällt auf empfohlen bzw. erstes Klassenthema zurück', () => {
    const grund = k('GRUND');
    const darauf = k('DARAUF', 5, ['GRUND']);
    expect(
      naechsteKompetenz([grund, darauf], [v('GRUND'), v('DARAUF')], [], 'G', 5, leer, 0)?.id,
    ).toBe('GRUND');
  });
});
