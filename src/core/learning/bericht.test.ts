import { describe, expect, it } from 'vitest';
import { einzelne, isoWoche, wochen } from './bericht';
import type { AufgabeEreignis } from './ereignis';

const e = (tag: string, ts: number, ergebnis: AufgabeEreignis['ergebnis'] = 'richtig') =>
  ({ tag, ts, ergebnis }) as AufgabeEreignis;

describe('Elternbericht', () => {
  it('ISO-Wochen auch über den Jahreswechsel', () => {
    expect(isoWoche('2026-10-28')).toEqual({ woche: '2026-W44', montag: '2026-10-26' });
    expect(isoWoche('2027-01-01')).toEqual({ woche: '2026-W53', montag: '2026-12-28' });
    expect(isoWoche('2024-12-30')).toEqual({ woche: '2025-W01', montag: '2024-12-30' });
    expect(isoWoche('2026-01-01')).toEqual({ woche: '2026-W01', montag: '2025-12-29' });
  });

  it('fasst Wochen zusammen: Aufgaben, richtig, Lerntage', () => {
    const w = wochen([
      e('2026-10-26', 1),
      e('2026-10-26', 2, 'falsch'),
      e('2026-10-28', 3),
      e('2026-10-28', 4, 'uebersprungen'),
      e('2026-11-02', 5),
    ]);
    expect(w).toEqual([
      { woche: '2026-W45', montag: '2026-11-02', aufgaben: 1, richtig: 1, lerntage: 1 },
      { woche: '2026-W44', montag: '2026-10-26', aufgaben: 3, richtig: 2, lerntage: 2 },
    ]);
  });

  it('einzelne Aufgaben neueste zuerst', () => {
    expect(einzelne([e('a', 1), e('b', 3), e('c', 2)]).map((x) => x.ts)).toEqual([3, 2, 1]);
  });
});
