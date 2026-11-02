import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import { alsText, fuelle, platzhalterIn, texZahl } from './text';

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

  it('setzt Brüche aus Platzhaltern als Formel für KaTeX', () => {
    expect(fuelle('Erweitere {b}.', { b: bruch(3, 4) })).toEqual([
      { art: 'text', text: 'Erweitere ', fett: false },
      { art: 'formel', tex: '\\frac{3}{4}' },
      { art: 'text', text: '.', fett: false },
    ]);
    expect(fuelle('{b}', { b: bruch(-3, 4) })).toEqual([{ art: 'formel', tex: '-\\frac{3}{4}' }]);
  });

  it('jede Formel geht an KaTeX, Platzhalter als LaTeX-Zahl eingesetzt', () => {
    expect(fuelle('$\\sqrt{ {q} }$', { q: 81 })).toEqual([{ art: 'formel', tex: '\\sqrt{ 81 }' }]);
    expect(fuelle('${b}^2$', { b: 7 })).toEqual([{ art: 'formel', tex: '7^2' }]);
    expect(fuelle('$\\sqrt{ {q} }$', { q: 0.49 })).toEqual([
      { art: 'formel', tex: '\\sqrt{ 0{,}49 }' },
    ]);
    expect(fuelle('$\\frac{3}{4}$', {})).toEqual([{ art: 'formel', tex: '\\frac{3}{4}' }]);
  });

  it('Zahlen für KaTeX: Komma, Tausender, Minus', () => {
    expect(texZahl(2.5)).toBe('2{,}5');
    expect(texZahl(48312)).toBe('48\\,312');
    expect(texZahl(-7)).toBe('-7');
  });

  it('Rechenausdrücke in Text-Platzhaltern werden Formeln', () => {
    expect(fuelle('**Berechne**: {term}', { term: { de: '(−3)³' } })).toEqual([
      { art: 'text', text: 'Berechne', fett: true },
      { art: 'text', text: ': ', fett: false },
      { art: 'formel', tex: '(-3)^{3}' },
    ]);
    expect(fuelle('in {einheit}.', { einheit: { de: 'm²' } })).toEqual([
      { art: 'text', text: 'in m².', fett: false },
    ]);
  });

  it('meldet fehlende Platzhalter', () => {
    expect(() => fuelle('{fehlt}', {})).toThrow('fehlt');
  });

  it('lässt keine Steuerzeichen aus Inhalten durch', () => {
    expect(alsText(fuelle('a < b & c', {}))).toBe('a < b & c');
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
