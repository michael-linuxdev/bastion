import { describe, expect, it } from 'vitest';
import { klassenarbeitAus, klassenarbeitText, nochUeben } from './klassenarbeit';

describe('Klassenarbeit (L-19)', () => {
  it('liest Termin und Themen; vorbei oder kaputt ergibt nichts', () => {
    const k = { termin: '2026-11-12', themen: ['A', 'B'] };
    expect(klassenarbeitAus(klassenarbeitText(k), '2026-10-28')).toEqual(k);
    expect(klassenarbeitAus(klassenarbeitText(k), '2026-11-12')).toEqual(k);
    expect(klassenarbeitAus(klassenarbeitText(k), '2026-11-13')).toBeUndefined();
    expect(klassenarbeitAus('{kaputt', '2026-10-28')).toBeUndefined();
    expect(
      klassenarbeitAus(klassenarbeitText({ termin: '2026-11-12', themen: [] }), '2026-10-28'),
    ).toBeUndefined();
  });

  it('schlägt zuerst Neues und Unsicheres vor, Gefestigtes nicht', () => {
    const status = {
      A: 'gefestigt',
      B: 'gekonnt',
      C: 'neu',
      D: 'auffrischen',
      E: 'in-arbeit',
    } as const;
    expect(
      nochUeben(
        { termin: '2026-11-12', themen: ['A', 'B', 'C', 'D', 'E'] },
        (id) => status[id as keyof typeof status],
      ),
    ).toEqual(['C', 'E', 'D', 'B']);
  });
});
