import { describe, expect, it } from 'vitest';
import { auswerten, leseBruch, leseFaktoren, leseUhrzeit, leseZahl } from './auswertung';
import { bruch } from './bruch';
import type { Instanz } from './generator';

describe('leseZahl (I-5)', () => {
  it.each([
    ['42', 42],
    [' 42 ', 42],
    ['+7', 7],
    ['007', 7],
    ['3,25', 3.25],
    ['-4', -4],
    ['−4', -4],
  ])('liest %s', (e, w) => expect(leseZahl(e)).toEqual({ ok: true, wert: w }));

  it('akzeptiert den Punkt mit Hinweis', () => {
    expect(leseZahl('3.5')).toEqual({ ok: true, wert: 3.5, hinweis: 'punkt-statt-komma' });
  });
  it('lehnt Tausendertrennzeichen ab', () => {
    expect(leseZahl('3 500')).toEqual({ ok: false, grund: 'tausendertrenner' });
  });
  it.each(['', '  '])('meldet leere Eingabe', (e) =>
    expect(leseZahl(e)).toEqual({ ok: false, grund: 'leer' }),
  );
  it.each(['abc', '3,', '1,2,3', '3/4'])('lehnt %s ab', (e) =>
    expect(leseZahl(e)).toEqual({ ok: false, grund: 'keine-zahl' }),
  );
});

describe('leseBruch', () => {
  it('liest einfache, gemischte und ganze Zahlen', () => {
    expect(leseBruch('3/4')).toEqual({ ok: true, wert: bruch(3, 4) });
    expect(leseBruch(' 3 / 4 ')).toEqual({ ok: true, wert: bruch(3, 4) });
    expect(leseBruch('1 3/4')).toEqual({ ok: true, wert: bruch(7, 4) });
    expect(leseBruch('2')).toEqual({ ok: true, wert: bruch(2, 1) });
  });
  it('lehnt Nenner 0 und Unsinn ab', () => {
    expect(leseBruch('3/0')).toEqual({ ok: false, grund: 'nenner-null' });
    expect(leseBruch('drei')).toEqual({ ok: false, grund: 'keine-zahl' });
  });
});

describe('leseFaktoren und leseUhrzeit', () => {
  it('liest Faktoren in jeder Schreibweise und sortiert', () => {
    for (const e of ['3 · 2 · 3', '3*2*3', '3 2 3', '3x2x3', '3, 2, 3'])
      expect(leseFaktoren(e)).toEqual({ ok: true, wert: [2, 3, 3] });
  });
  it('liest Uhrzeiten', () => {
    expect(leseUhrzeit('7:45')).toEqual({ ok: true, wert: 465 });
    expect(leseUhrzeit('07.05 Uhr')).toEqual({ ok: true, wert: 425 });
    expect(leseUhrzeit('25:00')).toEqual({ ok: false, grund: 'keine-zahl' });
  });
});

const zahlAufgabe: Instanz = {
  platzhalter: {},
  loesung: { typ: 'zahl', wert: 0.3 },
  loesungsweg: [],
  fehlerbilder: [{ id: 'komma-falsch', antwort: { typ: 'zahl', wert: 3 } }],
};
const bruchAufgabe: Instanz = {
  platzhalter: {},
  loesung: { typ: 'bruch', wert: bruch(3, 4) },
  loesungsweg: [],
  fehlerbilder: [
    { id: 'nicht-vollstaendig', antwort: { typ: 'bruch', wert: bruch(6, 8) } },
    { id: 'subtrahiert', antwort: { typ: 'bruch', wert: bruch(3, 5) } },
  ],
};

describe('auswerten', () => {
  it('Zahlen ohne Gleitkomma-Rauschen', () => {
    expect(auswerten(zahlAufgabe, { typ: 'zahl', wert: 0.1 + 0.2 })).toEqual({ richtig: true });
    expect(auswerten(zahlAufgabe, { typ: 'zahl', wert: 3 })).toEqual({
      richtig: false,
      fehlerbild: 'komma-falsch',
    });
    expect(auswerten(zahlAufgabe, { typ: 'zahl', wert: 7 })).toEqual({ richtig: false });
  });

  it('Brüche: beliebig, gekürzt, exakt', () => {
    const b = (z: number, n: number) => ({ typ: 'bruch', wert: bruch(z, n) }) as const;
    expect(auswerten(bruchAufgabe, b(9, 12))).toEqual({ richtig: true });
    expect(auswerten(bruchAufgabe, b(9, 12), 'gekuerzt')).toEqual({
      richtig: false,
      hinweis: 'nicht-gekuerzt',
    });
    expect(auswerten(bruchAufgabe, b(6, 8), 'gekuerzt')).toEqual({
      richtig: false,
      fehlerbild: 'nicht-vollstaendig',
    });
    expect(auswerten(bruchAufgabe, b(3, 4), 'gekuerzt')).toEqual({ richtig: true });
    expect(auswerten(bruchAufgabe, b(6, 8), 'exakt')).toEqual({
      richtig: false,
      fehlerbild: 'nicht-vollstaendig',
    });
    expect(auswerten(bruchAufgabe, b(3, 5))).toEqual({ richtig: false, fehlerbild: 'subtrahiert' });
    // wertgleich zu einem Fehlerbild: 6/10 = 3/5
    expect(auswerten(bruchAufgabe, b(6, 10))).toEqual({
      richtig: false,
      fehlerbild: 'subtrahiert',
    });
  });

  it('Auswahl und Punkte exakt', () => {
    const a: Instanz = { ...zahlAufgabe, loesung: { typ: 'auswahl', wert: 2 }, fehlerbilder: [] };
    expect(auswerten(a, { typ: 'auswahl', wert: 2 })).toEqual({ richtig: true });
    expect(auswerten(a, { typ: 'auswahl', wert: 1 })).toEqual({ richtig: false });
    const p: Instanz = { ...a, loesung: { typ: 'punkt', wert: { x: 2, y: 5 } } };
    expect(auswerten(p, { typ: 'punkt', wert: { x: 5, y: 2 } })).toEqual({ richtig: false });
  });
});
