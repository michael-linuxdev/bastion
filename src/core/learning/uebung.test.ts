import { describe, expect, it } from 'vitest';
import { naechsteVorlage, vorlagenFuer } from './uebung';
import type { GeneratorVorlage } from './vorlage';

const v = (id: string, kompetenz: string, niveaus: ('G' | 'M')[]) =>
  ({ id, kompetenz, niveaus }) as unknown as GeneratorVorlage;
const alle = [v('K.B', 'K', ['G', 'M']), v('K.A', 'K', ['M']), v('L.A', 'L', ['G'])];

describe('Übung', () => {
  it('wählt die Vorlagen einer Kompetenz und eines Niveaus', () => {
    expect(vorlagenFuer(alle, 'K', 'M').map((x) => x.id)).toEqual(['K.A', 'K.B']);
    expect(vorlagenFuer(alle, 'K', 'G').map((x) => x.id)).toEqual(['K.B']);
  });
  it('wechselt reihum', () => {
    const a = vorlagenFuer(alle, 'K', 'M');
    expect([0, 1, 2].map((i) => naechsteVorlage(a, i)?.id)).toEqual(['K.A', 'K.B', 'K.A']);
    expect(naechsteVorlage([], 0)).toBeUndefined();
  });
});
