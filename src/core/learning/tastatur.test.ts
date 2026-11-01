import { describe, expect, it } from 'vitest';
import { ohneDezimalzahlen, pruefeTastatur, tastenFuer, tastenFuerVermittlung } from './tastatur';

describe('Tastatur (INHALTSFORMAT §5.2)', () => {
  it('ohne Angabe nach Art der Lösung: Zahl mit Komma, Bruch mit Bruchstrich, kein Minus', () => {
    expect(tastenFuer({ loesung: 'zahl' })).toEqual({
      ziffern: true,
      komma: true,
      minus: false,
      bruchstrich: false,
      mal: false,
      doppelpunkt: false,
      variablen: [],
      einheiten: [],
    });
    const bruch = tastenFuer({ loesung: 'bruch' });
    expect([bruch.bruchstrich, bruch.komma, bruch.minus]).toEqual([true, false, false]);
    expect(tastenFuer({ loesung: 'punkt' }).komma).toBe(false);
  });

  it('L13: ohne Komma bei ganzen Zahlen; Malpunkt bei Faktoren, Doppelpunkt bei Uhrzeiten', () => {
    expect(tastenFuer({ loesung: 'zahl', ganzzahlig: true }).komma).toBe(false);
    expect(tastenFuer({ loesung: 'zahl', ganzzahlig: false }).komma).toBe(true);
    // Die Vorlage gewinnt weiter
    expect(
      tastenFuer({ loesung: 'zahl', ganzzahlig: true, vorlage: ['ziffern', 'komma'] }).komma,
    ).toBe(true);
    const f = tastenFuer({ loesung: 'reihenfolge', typ: 'faktoren-eingabe' });
    expect([f.ziffern, f.mal, f.komma]).toEqual([true, true, false]);
    const u = tastenFuer({ loesung: 'zahl', typ: 'uhrzeit-eingabe' });
    expect([u.doppelpunkt, u.komma]).toEqual([true, false]);
    expect(pruefeTastatur(['ziffern', 'mal', 'doppelpunkt'])).toEqual([]);
  });

  it('L13: ganzzahlig nur, wenn weder Lösung noch Aufgabe Dezimalzahlen enthalten', () => {
    expect(ohneDezimalzahlen({ typ: 'zahl', wert: 7433 }, { a: 7188, b: 245 })).toBe(true);
    expect(ohneDezimalzahlen({ typ: 'zahl', wert: 7 }, { a: 3.5, b: 3.5 })).toBe(false);
    expect(ohneDezimalzahlen({ typ: 'zahl', wert: 2.5 }, {})).toBe(false);
    expect(ohneDezimalzahlen({ typ: 'zahl', wert: 4 }, { t: { de: '2,5 kg' } })).toBe(false);
    expect(tastenFuerVermittlung({ art: 'zahl', loesung: '12' }).komma).toBe(false);
    expect(tastenFuerVermittlung({ art: 'zahl', loesung: '1,5' }).komma).toBe(true);
  });

  it('die Vorlage ersetzt die Vorgabe, die Instanz die Vorlage', () => {
    const vorlage = ['ziffern', { variable: 'x' }, { einheit: 'cm' }] as const;
    const v = tastenFuer({ loesung: 'zahl', vorlage });
    expect([v.komma, v.variablen, v.einheiten]).toEqual([false, ['x'], ['cm']]);
    const i = tastenFuer({ loesung: 'zahl', vorlage, instanz: { tastatur: ['ziffern', 'komma'] } });
    expect([i.komma, i.variablen]).toEqual([true, []]);
  });

  it('Minus nur, wenn negative Antworten vorkommen können', () => {
    expect(tastenFuer({ loesung: 'zahl', instanz: { vorzeichen: true } }).minus).toBe(true);
    expect(tastenFuer({ loesung: 'zahl', vorlage: ['ziffern'], instanz: {} }).minus).toBe(false);
    // vorzeichen schaltet Minus auch dann ein, wenn die Vorlage es nicht nennt
    expect(
      tastenFuer({ loesung: 'zahl', vorlage: ['ziffern'], instanz: { vorzeichen: true } }).minus,
    ).toBe(true);
  });

  it('Erstvermittlung: Minus nur bei negativer Lösung oder bekanntem negativen Fehler', () => {
    expect(tastenFuerVermittlung({ art: 'zahl', loesung: '12' }).minus).toBe(false);
    expect(tastenFuerVermittlung({ art: 'zahl', loesung: '-3' }).minus).toBe(true);
    expect(
      tastenFuerVermittlung({ art: 'zahl', loesung: '3', fehler: [{ wert: '−3' }] }).minus,
    ).toBe(true);
    expect(tastenFuerVermittlung({ art: 'bruch', loesung: '3/6' }).bruchstrich).toBe(true);
  });

  it('prüft die Form in der Vorlage', () => {
    expect(pruefeTastatur(undefined)).toEqual([]);
    expect(pruefeTastatur(['ziffern', 'minus', { variable: 'x' }, { einheit: 'cm²' }])).toEqual([]);
    expect(pruefeTastatur([])).toHaveLength(1);
    expect(pruefeTastatur(['plus'])).toHaveLength(1);
    expect(pruefeTastatur(['ziffern', 'ziffern'])).toEqual(['tastatur[1]: doppelt']);
    expect(pruefeTastatur([{ variable: 'xy' }, { einheit: 'c m' }, { farbe: 'rot' }])).toHaveLength(
      3,
    );
  });
});
