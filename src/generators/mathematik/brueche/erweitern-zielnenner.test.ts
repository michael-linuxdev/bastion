import { describe, expect, it } from 'vitest';
import { bruch, istGekuerzt, type Bruch } from '../../../core/learning/bruch';
import { pflichttests } from '../../pflichttests';
import { erweiternZielnenner } from './erweitern-zielnenner';

// Parameter wie in der Vorlage M.ZO.BR.ERWEITERN.ZIELNENNER (INHALTSFORMAT §4.1).
const NIVEAUS = {
  G: { nenner_max: 6, faktor_max: 5 },
  M: { nenner_max: 15, faktor_max: 12 },
};

pflichttests(erweiternZielnenner, {
  niveaus: NIVEAUS,
  unabhaengigeLoesung(instanz) {
    // Zweiter Weg: Faktor aus Ziel- und Ausgangsnenner, dann den Zähler hochrechnen.
    const ausgang = instanz.platzhalter['bruch'] as Bruch;
    const zielnenner = instanz.platzhalter['zielnenner'] as number;
    const faktor = zielnenner / ausgang.nenner;
    return { typ: 'bruch', wert: bruch(ausgang.zaehler * faktor, zielnenner) };
  },
  grenzverletzungen(instanz, p) {
    const fehler: string[] = [];
    const ausgang = instanz.platzhalter['bruch'] as Bruch;
    const zahl = (name: string) => instanz.platzhalter[name] as number;
    const [nenner, zielnenner, faktor] = [zahl('nenner'), zahl('zielnenner'), zahl('faktor')];
    if (ausgang.nenner !== nenner) fehler.push('{nenner} passt nicht zu {bruch}');
    if (nenner < 2 || nenner > p.nenner_max) fehler.push(`Nenner ${nenner} außerhalb`);
    if (faktor < 2 || faktor > p.faktor_max) fehler.push(`Faktor ${faktor} außerhalb`);
    if (zielnenner !== nenner * faktor) fehler.push('Zielnenner ≠ Nenner · Faktor');
    if (ausgang.zaehler < 1 || ausgang.zaehler >= ausgang.nenner) fehler.push('kein echter Bruch');
    if (!istGekuerzt(ausgang)) fehler.push('Ausgangsbruch nicht gekürzt');
    return fehler;
  },
  // G hat nur 44 mögliche Aufgaben (11 Brüche × 4 Faktoren), M über 700.
  mindestensVerschieden: { G: 25, M: 80 },
});

describe('bruch.erweitern-zielnenner – Einzelfälle', () => {
  it('liefert Lösungsweg und Fehlerbilder passend zur Aufgabe', () => {
    const instanz = erweiternZielnenner.erzeuge(42, NIVEAUS.M);
    const ausgang = instanz.platzhalter['bruch'] as Bruch;
    const faktor = instanz.platzhalter['faktor'] as number;
    expect(instanz.loesungsweg[0]?.de).toBe(
      `${ausgang.nenner * faktor} : ${ausgang.nenner} = ${faktor}`,
    );
    expect(instanz.fehlerbilder.map((f) => f.id)).toContain('nur-nenner');
  });

  it('meldet bei doppelter Fehler-Antwort nur das vorrangige Fehlerbild', () => {
    // 1/2 auf Nenner 4: „addiert“ ergibt 3/4, „falscher Faktor“ (·3) ebenfalls 3/4.
    for (let s = 0; s < 20_000; s++) {
      const instanz = erweiternZielnenner.erzeuge(s, NIVEAUS.G);
      const b = instanz.platzhalter['bruch'] as Bruch;
      if (b.zaehler === 1 && b.nenner === 2 && instanz.platzhalter['faktor'] === 2) {
        expect(instanz.fehlerbilder.map((f) => f.id)).toEqual(['addiert', 'nur-nenner']);
        return;
      }
    }
    throw new Error('Fall 1/2 → ?/4 in 20 000 Seeds nicht gefunden');
  });

  it('weist unsinnige Parameter ab', () => {
    expect(() => erweiternZielnenner.erzeuge(1, { nenner_max: 1, faktor_max: 5 })).toThrow(
      RangeError,
    );
    expect(() => erweiternZielnenner.erzeuge(1, { nenner_max: 6, faktor_max: 1 })).toThrow(
      RangeError,
    );
  });
});
