import { describe, expect, it } from 'vitest';
import {
  auswerten,
  leseFelder,
  leseBruch,
  leseFaktoren,
  leseUhrzeit,
  leseZahl,
  rundeAuf,
} from './auswertung';
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

describe('gerundete Ergebnisse (B3)', () => {
  // √13 ≈ 3,6056 – verlangt: auf zwei Stellen
  const instanz: Instanz = {
    platzhalter: {},
    loesung: { typ: 'zahl', wert: 3.61 },
    runden: { stellen: 2, genau: Math.sqrt(13) },
    loesungsweg: [],
    fehlerbilder: [{ id: 'quadrat-vergessen', antwort: { typ: 'zahl', wert: 13 } }],
  };
  const zahl = (wert: number) => ({ typ: 'zahl', wert }) as const;

  it('richtig gerundet ist richtig', () => {
    expect(auswerten(instanz, zahl(3.61))).toEqual({ richtig: true });
  });

  it('abgeschnitten oder genauer: Hinweis „anders gerundet“', () => {
    expect(auswerten(instanz, zahl(3.6))).toEqual({ richtig: false, hinweis: 'anders-gerundet' });
    expect(auswerten(instanz, zahl(3.606))).toEqual({
      richtig: false,
      hinweis: 'anders-gerundet',
    });
  });

  it('weit weg bleibt falsch, Fehlerbilder werden weiter erkannt', () => {
    expect(auswerten(instanz, zahl(3.5))).toEqual({ richtig: false });
    expect(auswerten(instanz, zahl(13))).toEqual({
      richtig: false,
      fehlerbild: 'quadrat-vergessen',
    });
  });

  it('ohne Angabe zum Runden kein Hinweis', () => {
    const ohne: Instanz = {
      platzhalter: {},
      loesung: instanz.loesung,
      loesungsweg: [],
      fehlerbilder: instanz.fehlerbilder,
    };
    expect(auswerten(ohne, zahl(3.6))).toEqual({ richtig: false });
  });

  it('rundeAuf rundet wie in der Schule, auch bei x,xx5', () => {
    expect(rundeAuf(2.675, 2)).toBe(2.68);
    expect(rundeAuf(1.005, 2)).toBe(1.01);
    expect(rundeAuf(-2.5, 0)).toBe(-3);
    expect(rundeAuf(Math.PI, 3)).toBe(3.142);
  });
});

describe('mehrere Felder (B2)', () => {
  const zwei: Instanz = {
    platzhalter: {},
    loesung: { typ: 'felder', wert: [-3, 2] },
    felder: { namen: [{ de: 'x₁ =' }, { de: 'x₂ =' }], ungeordnet: true, keineLoesung: true },
    loesungsweg: [],
    fehlerbilder: [
      { id: 'vorzeichen', antwort: { typ: 'felder', wert: [-2, 3] } },
      { id: 'keine', antwort: { typ: 'felder', wert: [] } },
    ],
  };
  const felder = (...wert: number[]) => ({ typ: 'felder', wert }) as const;

  it('Reihenfolge egal, wenn ungeordnet', () => {
    expect(auswerten(zwei, felder(2, -3))).toEqual({ richtig: true });
    expect(auswerten(zwei, felder(-3, 2))).toEqual({ richtig: true });
  });

  it('Fehlerbilder auch in anderer Reihenfolge, „keine Lösung“ als leere Liste', () => {
    expect(auswerten(zwei, felder(3, -2))).toEqual({ richtig: false, fehlerbild: 'vorzeichen' });
    expect(auswerten(zwei, felder())).toEqual({ richtig: false, fehlerbild: 'keine' });
  });

  it('mit fester Reihenfolge (Scheitelpunkt) zählt die Reihenfolge', () => {
    const scheitel: Instanz = {
      platzhalter: {},
      loesung: { typ: 'felder', wert: [1, -2] },
      felder: { namen: [{ de: 'x =' }, { de: 'y =' }] },
      loesungsweg: [],
      fehlerbilder: [],
    };
    expect(auswerten(scheitel, felder(1, -2))).toEqual({ richtig: true });
    expect(auswerten(scheitel, felder(-2, 1))).toEqual({ richtig: false });
    expect(auswerten(scheitel, felder(1))).toEqual({ richtig: false });
  });
});

describe('leseFelder (B2)', () => {
  it('liest jedes Feld wie eine Zahl', () => {
    expect(leseFelder(['2', '−3,5'])).toEqual({ ok: true, wert: [2, -3.5] });
  });
  it('Punkt statt Komma: Hinweis', () => {
    expect(leseFelder(['1.5', '2'])).toEqual({
      ok: true,
      wert: [1.5, 2],
      hinweis: 'punkt-statt-komma',
    });
  });
  it('leeres oder falsches Feld: Lesefehler', () => {
    expect(leseFelder(['2', ''])).toEqual({ ok: false, grund: 'leer' });
    expect(leseFelder(['x', '2'])).toEqual({ ok: false, grund: 'keine-zahl' });
  });
  it('„keine Lösung“ ergibt die leere Liste, die Felder zählen nicht', () => {
    expect(leseFelder(['', 'x'], true)).toEqual({ ok: true, wert: [] });
  });
});
