import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import type { AufgabeEreignis } from './ereignis';
import { antwortText, gruppiere, offeneFehler } from './werkstatt';

let n = 0;
const e = (teil: Partial<AufgabeEreignis>): AufgabeEreignis => ({
  id: `E${(n += 1)}`,
  art: 'aufgabe',
  v: 1,
  profil: 'P',
  ts: n,
  tag: '2026-10-28',
  geraet: 'g',
  sitzung: 'S',
  modus: 'ueben',
  kompetenz: 'K',
  vorlage: 'K.A',
  niveau: 'G',
  quelle: { generator: 'g', version: 1, seed: n },
  paket: 'p',
  ergebnis: 'falsch',
  hilfen: 0,
  dauerMs: 1,
  faellig: false,
  bewertung: 'nochmal',
  schnappschuss: {
    platzhalter: {},
    loesung: { typ: 'zahl', wert: 1 },
    antwort: { typ: 'zahl', wert: 2 },
  },
  ...teil,
});

describe('Fehlerwerkstatt', () => {
  it('findet offene Fehler; richtig korrigierte sind erledigt, falsch korrigierte und Diagnose nicht', () => {
    const a = e({ fehlerbild: 'addiert' });
    const b = e({ fehlerbild: 'addiert' });
    const c = e({});
    const richtig = e({ ergebnis: 'richtig', korrigiert: a.id, modus: 'fehlerwerkstatt' });
    const nochFalsch = e({ korrigiert: b.id, modus: 'fehlerwerkstatt' });
    const diagnose = e({ modus: 'diagnose' });
    const offen = offeneFehler([
      a,
      b,
      c,
      richtig,
      nochFalsch,
      e({ ergebnis: 'richtig' }),
      diagnose,
    ]);
    expect(offen.map((x) => x.id)).toEqual([b.id, c.id]);
  });

  it('gruppiert nach Fehlerbild; Fehler ohne Muster je Kompetenz; häufigste zuerst', () => {
    const liste = [
      e({ fehlerbild: 'x' }),
      e({ vorlage: 'K.B' }),
      e({ fehlerbild: 'x' }),
      e({ fehlerbild: 'x', niveau: 'M' }),
      e({ vorlage: 'K.A' }),
      e({ vorlage: 'K.C' }),
    ];
    const g = gruppiere(liste);
    expect(g.map((x) => [x.kompetenz, x.niveau, x.fehlerbild ?? '-', x.fehler.length])).toEqual([
      ['K', 'G', '-', 3],
      ['K', 'G', 'x', 2],
      ['K', 'M', 'x', 1],
    ]);
  });

  it('gruppiert nach Fehlvorstellung über Vorlagen und Kompetenzen hinweg (U3j)', () => {
    const liste = [
      e({ fehlerbild: 'nur-nenner', vorlage: 'K.A' }),
      e({ fehlerbild: 'nur-nenner-gekuerzt', vorlage: 'L.B', kompetenz: 'L' }),
      e({ fehlerbild: 'anders' }),
    ];
    const fv = (x: AufgabeEreignis) =>
      x.fehlerbild?.startsWith('nur-nenner') ? 'FV.BR.NUR-NENNER' : undefined;
    const g = gruppiere(liste, fv);
    expect(g.map((x) => [x.fv ?? '-', x.fehlerbild, x.fehler.length])).toEqual([
      ['FV.BR.NUR-NENNER', 'nur-nenner', 2],
      ['-', 'anders', 1],
    ]);
  });

  it('macht Antworten lesbar', () => {
    expect(antwortText({ typ: 'zahl', wert: 4.5 })).toBe('4,5');
    expect(antwortText({ typ: 'zahl', wert: 465 }, [], true)).toBe('7:45');
    expect(antwortText({ typ: 'bruch', wert: bruch(3, 5) })).toBe('3/5');
    expect(
      antwortText({ typ: 'auswahl', wert: 1 }, [{ text: { de: 'a' } }, { text: { de: 'b' } }]),
    ).toBe('b');
    expect(antwortText({ typ: 'punkt', wert: { x: 2, y: 5 } })).toBe('(2 | 5)');
    expect(antwortText({ typ: 'mit-rest', wert: { quotient: 7, rest: 2 } })).toBe('7 Rest 2');
    expect(antwortText({ typ: 'reihenfolge', wert: [2, 3, 3] })).toBe('2, 3, 3');
  });
});
