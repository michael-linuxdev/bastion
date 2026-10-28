import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from './ereignis';
import type { KompetenzStand } from './fortschritt';
import { tagesbilanz } from './heute';

const e = (teil: Partial<AufgabeEreignis>) =>
  ({
    tag: '2026-10-28',
    modus: 'ueben',
    kompetenz: 'A',
    niveau: 'G',
    ergebnis: 'richtig',
    ...teil,
  }) as AufgabeEreignis;
const s = (teil: Partial<KompetenzStand>) =>
  ({ kompetenz: 'A', niveau: 'G', ...teil }) as KompetenzStand;

describe('Was habe ich heute gekonnt?', () => {
  it('zählt nur den Lerntag, ohne Übersprungenes', () => {
    const b = tagesbilanz(
      [
        e({}),
        e({ kompetenz: 'B', ergebnis: 'falsch' }),
        e({ niveau: 'M' }),
        e({}),
        e({ tag: '2026-10-27' }),
        e({ ergebnis: 'uebersprungen', kompetenz: 'C' }),
        e({ modus: 'wiederholen', kompetenz: 'B' }),
        e({ modus: 'fehlerwerkstatt', korrigiert: 'X' }),
        e({ modus: 'fehlerwerkstatt', korrigiert: 'Y', ergebnis: 'falsch' }),
      ],
      [
        s({ gekonntAm: '2026-10-28' }),
        s({ kompetenz: 'B', gekonntAm: '2026-10-01', gefestigtAm: '2026-10-28' }),
        s({ kompetenz: 'C', gekonntAm: '2026-10-27' }),
      ],
      '2026-10-28',
    );
    expect(b).toEqual({
      aufgaben: 7,
      themen: [
        { kompetenz: 'A', niveau: 'G' },
        { kompetenz: 'B', niveau: 'G' },
        { kompetenz: 'A', niveau: 'M' },
      ],
      gekonnt: [{ kompetenz: 'A', niveau: 'G' }],
      gefestigt: [{ kompetenz: 'B', niveau: 'G' }],
      aufgearbeitet: 1,
      wiederholt: 1,
    });
  });
  it('leerer Tag', () => {
    expect(tagesbilanz([], [], '2026-10-28').aufgaben).toBe(0);
  });
});
