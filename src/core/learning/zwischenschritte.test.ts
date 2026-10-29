import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import type { Generator, Loesung } from './generator';
import { musterweg, pruefeSchritt, pruefeSchritte } from './zwischenschritte';

const b = (z: number, n: number): Loesung => ({ typ: 'bruch', wert: bruch(z, n) });
const zahl = (wert: number): Loesung => ({ typ: 'zahl', wert });

// Kleiner Generator: 1/2 + 1/3 mit gemeinsamem Nenner, Erweitern und Summe
const g: Generator<object> = {
  id: 'test.addieren',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: [],
  erzeuge: () => ({
    platzhalter: { a: bruch(1, 2), b: bruch(1, 3) },
    loesung: b(5, 6),
    loesungsweg: [],
    fehlerbilder: [],
  }),
  schritte: [
    { id: 'nenner', fehlerbildIds: ['summe'] },
    { id: 'summe', fehlerbildIds: ['nenner-addiert'], platzhalter: ['hn'] },
  ],
  schritt: (_seed, _p, id, bisher) => {
    const n = bisher['nenner']?.typ === 'zahl' ? bisher['nenner'].wert : 6;
    return id === 'nenner'
      ? {
          loesung: zahl(6),
          fehlerbilder: [{ id: 'summe', antwort: zahl(5) }],
          auchRichtig: (e) => e.typ === 'zahl' && e.wert > 0 && e.wert % 6 === 0,
        }
      : {
          loesung: b((5 * n) / 6, n),
          fehlerbilder: [{ id: 'nenner-addiert', antwort: b((5 * n) / 6, 2 * n) }],
          platzhalter: { hn: n },
        };
  },
};

describe('Zwischenschritte (INHALTSFORMAT §17)', () => {
  it('richtig, anderer richtiger Weg, bekannter und unbekannter Fehler', () => {
    const [nenner] = musterweg(g, 1, {});
    if (!nenner) throw new Error('kein Schritt');
    expect(pruefeSchritt(nenner.aufgabe, zahl(6))).toEqual({ richtig: true });
    expect(pruefeSchritt(nenner.aufgabe, zahl(12))).toEqual({ richtig: true });
    expect(pruefeSchritt(nenner.aufgabe, zahl(5))).toEqual({ richtig: false, fehlerbild: 'summe' });
    expect(pruefeSchritt(nenner.aufgabe, zahl(7))).toEqual({ richtig: false });
  });

  it('wer einen größeren Nenner wählt, rechnet damit weiter', () => {
    const summe = g.schritt?.(1, {}, 'summe', { nenner: zahl(12) });
    expect(summe?.loesung).toEqual(b(10, 12));
  });

  it('Musterweg endet beim Ergebnis der Aufgabe', () => {
    const weg = musterweg(g, 1, {});
    expect(weg.map((s) => s.id)).toEqual(['nenner', 'summe']);
    expect(weg.at(-1)?.aufgabe.loesung).toEqual(g.erzeuge(1, {}).loesung);
  });

  it('Vorlage: Schritte passen zum Generator, Fehlerbilder mit fv, bekannte Platzhalter', () => {
    const gut = [
      {
        id: 'nenner',
        frage: { de: 'Welcher gemeinsame Nenner passt zu {a} und {b}?' },
        typ: 'zahl-eingabe',
        fehlerbilder: { summe: { de: 'Nicht addieren.', fv: 'FV.BR.NENNER-ADDIERT' } },
      },
      {
        id: 'summe',
        frage: { de: 'Addiere mit dem Nenner {hn} (du hast {nenner} gewählt).' },
        typ: 'bruch-eingabe',
        fehlerbilder: { 'nenner-addiert': { de: 'Nenner bleibt.', fv: 'FV.BR.NENNER-ADDIERT' } },
      },
    ];
    expect(pruefeSchritte(gut, g)).toEqual([]);
    expect(pruefeSchritte(undefined, g)).toEqual([]);
    const schlecht = [
      { ...gut[1], typ: 'text', frage: { de: '{unbekannt}' }, fehlerbilder: { x: { de: 'ohne' } } },
    ];
    expect(pruefeSchritte(schlecht, g)).toEqual([
      'schritte: erwartet nenner, summe in dieser Reihenfolge',
      'schritte[0]: Platzhalter {unbekannt} ist unbekannt',
      'schritte[0]: typ muss zahl-eingabe oder bruch-eingabe sein',
      'schritte[0]: fehlerbilder.x ohne fv (F6)',
      'schritte[0]: Fehlerbild „x“ kennt der Generator nicht',
      'schritte[0]: Rückmeldung für „summe“ fehlt',
    ]);
    expect(pruefeSchritte(gut, { platzhalter: [] })).toContain(
      'schritte: Der Generator kennt keine Zwischenschritte',
    );
  });
});
