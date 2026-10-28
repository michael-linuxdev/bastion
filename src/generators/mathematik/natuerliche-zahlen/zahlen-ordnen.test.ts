import { describe, expect, it } from 'vitest';
import { pflichttests } from '../../pflichttests';
import { zahlenOrdnen } from './zahlen-ordnen';

const NIVEAUS = {
  G: { anzahl: 4, stellen: 4 },
  M: { anzahl: 5, stellen: 7 },
};

pflichttests(zahlenOrdnen, {
  niveaus: NIVEAUS,
  unabhaengigeLoesung(instanz) {
    // Zweiter Weg: BigInt-Vergleich statt Zahlvergleich.
    const folge = [...(instanz.elemente ?? [])].sort((a, b) =>
      BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0,
    );
    return { typ: 'reihenfolge', wert: folge };
  },
  grenzverletzungen(instanz, p) {
    const fehler: string[] = [];
    const e = instanz.elemente ?? [];
    if (e.length !== p.anzahl) fehler.push(`${e.length} statt ${p.anzahl} Zahlen`);
    if (new Set(e).size !== e.length) fehler.push('doppelte Zahl');
    for (const z of e) {
      const n = String(z).length;
      if (n < p.stellen || n > p.stellen + 1) fehler.push(`${z} hat ${n} Stellen`);
    }
    const sortiert = [...e].sort((a, b) => a - b);
    if (e.every((x, i) => x === sortiert[i])) fehler.push('schon geordnet angezeigt');
    return fehler;
  },
  mindestensVerschieden: { G: 95, M: 95 },
});

describe('nz.zahlen-ordnen – Einzelfälle', () => {
  it('enthält immer die Falle „wie Wörter sortiert“', () => {
    for (let s = 0; s < 2000; s++) {
      const ids = zahlenOrdnen.erzeuge(s, NIVEAUS.G).fehlerbilder.map((f) => f.id);
      expect(ids).toContain('wie-woerter-sortiert');
    }
  });

  it('weist unsinnige Parameter ab', () => {
    expect(() => zahlenOrdnen.erzeuge(1, { anzahl: 2, stellen: 4 })).toThrow(RangeError);
    expect(() => zahlenOrdnen.erzeuge(1, { anzahl: 4, stellen: 12 })).toThrow(RangeError);
  });
});
