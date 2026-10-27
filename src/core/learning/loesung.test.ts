import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import { fehlerbilderAus, gleicheLoesung } from './loesung';

describe('gleicheLoesung', () => {
  it('vergleicht alle Lösungsarten exakt', () => {
    expect(gleicheLoesung({ typ: 'zahl', wert: 3 }, { typ: 'zahl', wert: 3 })).toBe(true);
    expect(gleicheLoesung({ typ: 'zahl', wert: 3 }, { typ: 'auswahl', wert: 3 })).toBe(false);
    expect(
      gleicheLoesung({ typ: 'bruch', wert: bruch(1, 2) }, { typ: 'bruch', wert: bruch(2, 4) }),
    ).toBe(false);
    expect(
      gleicheLoesung({ typ: 'reihenfolge', wert: [1, 2] }, { typ: 'reihenfolge', wert: [1, 2] }),
    ).toBe(true);
    expect(
      gleicheLoesung(
        { typ: 'punkt', wert: { x: 1, y: 2 } },
        { typ: 'punkt', wert: { x: 2, y: 1 } },
      ),
    ).toBe(false);
  });
});

describe('fehlerbilderAus', () => {
  it('lässt fehlende, richtige und doppelte Antworten weg – in Vorrang-Reihenfolge', () => {
    const richtig = { typ: 'zahl', wert: 5 } as const;
    expect(
      fehlerbilderAus(richtig, [
        ['a', { typ: 'zahl', wert: 7 }],
        ['b', undefined],
        ['c', { typ: 'zahl', wert: 5 }],
        ['d', { typ: 'zahl', wert: 7 }],
        ['e', { typ: 'zahl', wert: 8 }],
      ]).map((f) => f.id),
    ).toEqual(['a', 'e']);
  });
});
