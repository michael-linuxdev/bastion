import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import {
  blattAbfrage,
  blattStufe,
  loesungAlsText,
  neueBlattNummer,
  ohneAufgaben,
  leseBlattAbfrage,
  ohneBegriffe,
  optionenGueltig,
  punkteFuer,
  punkteSumme,
  ziehe,
  type BlattAngaben,
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

describe('Adresse der Druckseite (iPhone-App druckt nicht selbst)', () => {
  const angaben: BlattAngaben = {
    kompetenzen: ['M.ZO.BR.ERWEITERN', 'M.ZO.BR.ADD-SUB'],
    niveau: 'M',
    anzahl: 12,
    nr: 7,
    loesungen: true,
    punkte: false,
    titel: 'Probe & Übung: 3/4 = ?',
    datum: '2026-11-02',
  };

  it('liest genau die Angaben zurück, die sie schreibt', () => {
    expect(leseBlattAbfrage(blattAbfrage(angaben))).toEqual(angaben);
    const ohne = { ...angaben, titel: '', datum: '', loesungen: false, punkte: true };
    expect(leseBlattAbfrage(blattAbfrage(ohne))).toEqual(ohne);
  });

  it('nimmt auch ein führendes Fragezeichen und „+“ für Leerzeichen', () => {
    expect(leseBlattAbfrage('?blatt=1&k=M.ZO.BR.ERWEITERN&n=G&a=6&nr=7&t=Mein+Blatt')).toEqual({
      kompetenzen: ['M.ZO.BR.ERWEITERN'],
      niveau: 'G',
      anzahl: 6,
      nr: 7,
      loesungen: true,
      punkte: false,
      titel: 'Mein Blatt',
      datum: '',
    });
  });

  it('lehnt fehlende und ungültige Angaben ab', () => {
    const gut = 'blatt=1&k=M.ZO.BR.ERWEITERN&n=G&a=6&nr=7';
    expect(leseBlattAbfrage(gut)).toBeDefined();
    for (const schlecht of [
      '',
      'k=M.ZO.BR.ERWEITERN&n=G&a=6&nr=7',
      gut.replace('n=G', 'n=X'),
      gut.replace('a=6', 'a=0'),
      gut.replace('a=6', 'a=61'),
      gut.replace('nr=7', 'nr=-1'),
      gut.replace('nr=7', 'nr=100000'),
      gut.replace('k=M.ZO.BR.ERWEITERN', 'k=<script>'),
      gut.replace('k=M.ZO.BR.ERWEITERN', 'k='),
      `${gut}&d=morgen`,
      `${gut}&t=%E0%A4%A`,
    ])
      expect(leseBlattAbfrage(schlecht), schlecht).toBeUndefined();
  });
});
