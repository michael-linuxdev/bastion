import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import {
  blattStufe,
  loesungAlsText,
  neueBlattNummer,
  ohneAufgaben,
  ohneBegriffe,
  optionenGueltig,
  punkteFuer,
  punkteSumme,
  ziehe,
  type BlattEingabe,
} from './arbeitsblatt';
import type { Generator, Instanz } from './generator';
import type { GeneratorVorlage } from './vorlage';

/** Kleiner Generator: a + b mit Lösungsweg aus `schritte` Zeilen. */
const plus: Generator<{ max: number; schritte: number }> = {
  id: 'test.plus',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: [],
  erzeuge(seed: number, p: { max: number; schritte: number }) {
    const a = (seed % p.max) + 1;
    const b = (Math.floor(seed / p.max) % p.max) + 1;
    return {
      platzhalter: { a, b },
      loesung: { typ: 'zahl', wert: a + b },
      loesungsweg: Array.from({ length: p.schritte }, () => ({ de: `${a} + ${b}` })),
      fehlerbilder: [],
    };
  },
} as unknown as Generator<{ max: number; schritte: number }>;

const kompetenz = (id: string) => ({ id, titel: { de: id } }) as unknown as Kompetenz;
const vorlage = (id: string, kompetenzId: string, niveaus: string[]) =>
  ({
    id,
    kompetenz: kompetenzId,
    quelle: 'generator',
    generator: 'test.plus@1',
    niveaus,
    parameter: { G: { max: 9, schritte: 1 }, M: { max: 99, schritte: 3 } },
    text: { aufgabe: { de: 'Rechne [[Summe]] {a} + {b}.' } },
  }) as unknown as GeneratorVorlage;

const eingabe: BlattEingabe = {
  kompetenzen: [kompetenz('K1'), kompetenz('K2')],
  vorlagen: [vorlage('V1', 'K1', ['G', 'M']), vorlage('V2', 'K2', ['G'])],
  generatoren: new Map([['test.plus@1', plus as Generator<unknown>]]),
};

describe('Aufgabenblatt im Kern', () => {
  it('gleiche Blatt-Nr. ergibt dasselbe Blatt, eine andere ein anderes', () => {
    const a = ziehe(eingabe, { niveau: 'G', anzahl: 6, seed: 7 });
    expect(ziehe(eingabe, { niveau: 'G', anzahl: 6, seed: 7 })).toEqual(a);
    expect(ziehe(eingabe, { niveau: 'G', anzahl: 6, seed: 8 })).not.toEqual(a);
    expect(a.map((x) => x.nr)).toEqual([1, 2, 3, 4, 5, 6]);
    // nach Vorlage geordnet, jede gleich oft
    expect(a.map((x) => x.vorlage.id)).toEqual(['V1', 'V1', 'V1', 'V2', 'V2', 'V2']);
  });

  it('meldet Kompetenzen ohne Aufgaben auf dem Niveau', () => {
    expect(ohneAufgaben(eingabe, 'M').map((k) => k.id)).toEqual(['K2']);
    expect(() => ziehe(eingabe, { niveau: 'M', anzahl: 4, seed: 1 })).toThrow(/K2/);
  });

  it('Punkte: Auswahl 1, sonst Schritte im Lösungsweg, 2 bis 4; Summe', () => {
    const i = (n: number, optionen = false) =>
      ({
        loesungsweg: Array.from({ length: n }, () => ({ de: '' })),
        ...(optionen ? { optionen: [] } : {}),
      }) as unknown as Instanz;
    expect(punkteFuer(i(0, true))).toBe(1);
    expect(punkteFuer(i(0))).toBe(2);
    expect(punkteFuer(i(3))).toBe(3);
    expect(punkteFuer(i(9))).toBe(4);
    const blatt = ziehe(eingabe, { niveau: 'G', anzahl: 4, seed: 3 });
    expect(punkteSumme(blatt)).toBe(8);
  });

  it('Review-Stufe des Blatts: ohne Vermerk 0', () => {
    expect(blattStufe(ziehe(eingabe, { niveau: 'G', anzahl: 2, seed: 1 }))).toBe(0);
    expect(blattStufe([])).toBe(0);
  });

  it('Grenzen, neue Blatt-Nr., Text-Hilfen', () => {
    expect(optionenGueltig({ niveau: 'G', anzahl: 12, seed: 7 })).toBe(true);
    expect(optionenGueltig({ niveau: 'G', anzahl: 0, seed: 7 })).toBe(false);
    expect(optionenGueltig({ niveau: 'G', anzahl: 61, seed: 7 })).toBe(false);
    expect(optionenGueltig({ niveau: 'G', anzahl: 5, seed: -1 })).toBe(false);
    expect(neueBlattNummer(7)).toBe(neueBlattNummer(7));
    expect(neueBlattNummer(7)).not.toBe(7);
    expect(neueBlattNummer(7)).toBeGreaterThanOrEqual(1);
    expect(neueBlattNummer(7)).toBeLessThanOrEqual(99_999);
    expect(ohneBegriffe('der [[Nenner]] bleibt')).toBe('der Nenner bleibt');
    expect(loesungAlsText({ typ: 'bruch', wert: { zaehler: 3, nenner: 4 } })).toBe('3/4');
    expect(
      loesungAlsText({ typ: 'auswahl', wert: 1 }, [{ text: { de: 'x' } }, { text: { de: '12' } }]),
    ).toBe('B (12)');
    expect(loesungAlsText({ typ: 'reihenfolge', wert: [2, 5] })).toBe('2 < 5');
  });
});
