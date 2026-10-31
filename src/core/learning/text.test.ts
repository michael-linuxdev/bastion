import { describe, expect, it } from 'vitest';
import { bruch } from './bruch';
import { alsText, fuelle } from './text';

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
