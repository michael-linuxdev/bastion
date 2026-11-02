import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import { alsText, einfacheFormel, fuelle, platzhalterIn } from './text';

const SCHMAL = String.fromCharCode(0x202f); // Tausendergliederung in der Anzeige

describe('fuelle', () => {
  it('setzt Platzhalter deutsch ein und erkennt fett', () => {
    expect(
      fuelle('**Runde** {zahl} auf {stelle}.', { zahl: 48312, stelle: { de: 'Hunderter' } }),
    ).toEqual([
      { art: 'text', text: 'Runde', fett: true },
      { art: 'text', text: ` 48${SCHMAL}312 auf Hunderter.`, fett: false },
    ]);
    expect(alsText(fuelle('{x} m', { x: 2.5 }))).toBe('2,5 m');
  });

  it('setzt Brüche als eigenen Teil', () => {
    expect(fuelle('Erweitere {b}.', { b: bruch(3, 4) })).toEqual([
      { art: 'text', text: 'Erweitere ', fett: false },
      { art: 'bruch', zaehler: '3', nenner: '4', fett: false },
      { art: 'text', text: '.', fett: false },
    ]);
  });

  it('versteht die Formel-Teilmenge', () => {
    expect(fuelle('$\\sqrt{ {q} }$', { q: 81 })).toEqual([{ art: 'wurzel', text: '81' }]);
    expect(fuelle('${b}^2$', { b: 7 })).toEqual([
      { art: 'text', text: '7', fett: false },
      { art: 'hoch', text: '2' },
    ]);
    expect(alsText(fuelle('${f} \\cdot 10^{ {e} }$', { f: 3, e: 4 }))).toBe('3 · 10^4');
    expect(fuelle('$\\frac{3}{4}$', {})).toEqual([
      { art: 'bruch', zaehler: '3', nenner: '4', fett: false },
    ]);
    expect(alsText(fuelle('$\\frac{ {z} }{8} + 1$', { z: 5 }))).toBe('5/8 + 1');
  });

  it('meldet fehlende Platzhalter', () => {
    expect(() => fuelle('{fehlt}', {})).toThrow('fehlt');
  });

  it('lässt keine Steuerzeichen aus Inhalten durch', () => {
    expect(alsText(fuelle('a < b & c', {}))).toBe('a < b & c');
  });
});

describe('Formeln über die eigene Teilmenge hinaus (KaTeX, T-22)', () => {
  it('einfache Formeln der Klassen 5–8 bleiben bei der eigenen Teilmenge', () => {
    for (const tex of [
      '\\frac{3}{4}',
      '\\sqrt{16}',
      '2^{10}',
      '3^2 \\cdot 4',
      'x^2 + 5',
      '10^6',
      '\\frac{a}{b}',
    ])
      expect(einfacheFormel(tex), tex).toBe(true);
    expect(fuelle('$\\frac{3}{4}$ und $2^{3}$', {}).some((t) => t.art === 'formel')).toBe(false);
  });

  it('alles andere wird ein Textteil „formel“ mit dem eingesetzten LaTeX', () => {
    for (const tex of [
      '\\sqrt{x+1}',
      '\\sqrt[3]{8}',
      'x_{1,2}',
      '\\frac{x+1}{x-2}',
      '\\int_0^2 x\\,dx',
      '\\vec{a}',
      '\\binom{n}{k}',
      '\\frac{\\pi}{2}',
      '\\lim_{x \\to \\infty} f(x)',
    ])
      expect(einfacheFormel(tex), tex).toBe(false);
    expect(fuelle('Löse $\\sqrt{x+{a}} = {b}$.', { a: 1, b: 5 })).toEqual([
      { art: 'text', text: 'Löse ', fett: false },
      { art: 'formel', tex: '\\sqrt{x+1} = 5' },
      { art: 'text', text: '.', fett: false },
    ]);
  });

  it('der reine Text zeigt das LaTeX', () => {
    expect(alsText([{ art: 'formel', tex: '\\vec{a}' }])).toBe('\\vec{a}');
  });
});

describe('Platzhalter in Formeln', () => {
  it('{name} direkt hinter Befehl, Klammer, ^ oder _ ist LaTeX, sonst Platzhalter', () => {
    expect(platzhalterIn('$\\vec{a} + \\binom{n}{k} + x^{n} + y_{i}$')).toEqual([]);
    expect(platzhalterIn('$\\sqrt{ {radikand} } = {wert}$ und {aussen}')).toEqual([
      'radikand',
      'wert',
      'aussen',
    ]);
    expect(fuelle('$\\vec{a} = {k} \\cdot \\vec{b}$', { k: 3 })).toEqual([
      { art: 'formel', tex: '\\vec{a} = 3 \\cdot \\vec{b}' },
    ]);
  });
});
