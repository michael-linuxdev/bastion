import { describe, expect, it } from 'vitest';
import type { Verdacht } from './fehlerschueler';
import { leseGrenze, meldung, vergleiche, zaehle } from './fehlerschueler-grenze';

const fund = (art: Verdacht['art']): Verdacht => ({ feld: 'f', art, text: 't', wo: [] });
const null5 = { A: 0, B: 0, C: 0, D: 0, E: 0 };

describe('Fehler-Schüler als Sperrklinke (B4)', () => {
  it('zählt Funde je Art', () => {
    expect(zaehle([fund('A'), fund('A'), fund('E')])).toEqual({ ...null5, A: 2, E: 1 });
  });

  it('mehr Funde als erlaubt: nicht ok, mit Art und Zahl', () => {
    const m = meldung(vergleiche({ ...null5, B: 3 }, { ...null5, B: 2 }));
    expect(m.ok).toBe(false);
    expect(m.text).toContain('Art B');
    expect(m.text).toContain('3 Funde, erlaubt sind 2');
  });

  it('weniger Funde: ok, aber Hinweis, die Grenze zu senken', () => {
    const m = meldung(vergleiche({ ...null5, C: 0 }, { ...null5, C: 2 }));
    expect(m.ok).toBe(true);
    expect(m.text).toContain('auf 0 senken');
  });

  it('gleich viele: ok', () => {
    expect(meldung(vergleiche(null5, null5))).toMatchObject({ ok: true });
  });

  it('Grenzdatei: alle Arten Pflicht, ganze Zahlen, nichts anderes', () => {
    expect(leseGrenze({ ...null5, $kommentar: 'x' })).toEqual(null5);
    expect(() => leseGrenze({ A: 1 })).toThrow(/B muss/);
    expect(() => leseGrenze({ ...null5, A: 1.5 })).toThrow(/A muss/);
    expect(() => leseGrenze({ ...null5, F: 1 })).toThrow(/unbekannte/);
    expect(() => leseGrenze([])).toThrow();
  });
});

describe('Grenzdatei im Repository', () => {
  it('ist gültig', async () => {
    const { readFileSync } = await import('node:fs');
    const json = JSON.parse(
      readFileSync('tools/inhalte/fehlerschueler-grenze.json', 'utf8'),
    ) as unknown;
    expect(() => leseGrenze(json)).not.toThrow();
  });
});
