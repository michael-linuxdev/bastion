import { describe, expect, it } from 'vitest';
import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { STELLEN } from './stellen';
import { zifferAnStelle } from './ziffer-an-stelle';

// G: bis zur Million (Grundschul-Zahlraum erweitert), M: bis Hundertmilliarden.
const NIVEAUS = {
  G: { stellen_min: 4, stellen_max: 7 },
  M: { stellen_min: 7, stellen_max: 12 },
};

const stelleVon = (name: Sprachobjekt) => STELLEN.findIndex((s) => s.de === name.de);

pflichttests(zifferAnStelle, {
  niveaus: NIVEAUS,
  unabhaengigeLoesung(instanz) {
    // Zweiter Weg: über die Zeichenkette, von rechts indiziert.
    const text = String(instanz.platzhalter['zahl']);
    const stelle = stelleVon(instanz.platzhalter['stelle'] as Sprachobjekt);
    return { typ: 'zahl', wert: Number(text[text.length - 1 - stelle]) };
  },
  grenzverletzungen(instanz, p) {
    const fehler: string[] = [];
    const zahl = instanz.platzhalter['zahl'] as number;
    const anzahl = String(zahl).length;
    const stelle = stelleVon(instanz.platzhalter['stelle'] as Sprachobjekt);
    if (anzahl < p.stellen_min || anzahl > p.stellen_max) fehler.push(`${anzahl} Stellen`);
    if (stelle < 0 || stelle >= anzahl) fehler.push(`Stelle ${stelle} gibt es in ${zahl} nicht`);
    return fehler;
  },
  mindestensVerschieden: { G: 95, M: 95 },
});

describe('nz.ziffer-an-stelle – Einzelfälle', () => {
  it('erkennt das Abzählen von links als Fehlerbild', () => {
    for (let s = 0; s < 1000; s++) {
      const i = zifferAnStelle.erzeuge(s, NIVEAUS.G);
      const f = i.fehlerbilder.find((x) => x.id === 'von-links-gezaehlt');
      if (!f) continue;
      const text = String(i.platzhalter['zahl']);
      const stelle = stelleVon(i.platzhalter['stelle'] as Sprachobjekt);
      expect(f.antwort).toEqual({ typ: 'zahl', wert: Number(text[stelle]) });
      return;
    }
    throw new Error('kein Fall mit Fehlerbild „von links gezählt“ gefunden');
  });

  it('nennt im Lösungsweg die gefragte Stelle', () => {
    const i = zifferAnStelle.erzeuge(3, NIVEAUS.M);
    expect(i.loesungsweg.at(-1)?.de).toContain((i.platzhalter['stelle'] as Sprachobjekt).de);
  });

  it('weist unsinnige Parameter ab', () => {
    expect(() => zifferAnStelle.erzeuge(1, { stellen_min: 4, stellen_max: 13 })).toThrow(
      RangeError,
    );
    expect(() => zifferAnStelle.erzeuge(1, { stellen_min: 8, stellen_max: 7 })).toThrow(RangeError);
  });
});
