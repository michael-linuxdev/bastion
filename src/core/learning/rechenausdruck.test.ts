import { describe, expect, it } from 'vitest';
import { alsFormeln } from './rechenausdruck';

describe('alsFormeln', () => {
  it('schreibt Brüche und ganze Rechenketten als eine Formel', () => {
    expect(alsFormeln('20/30 + 57/30 = 77/30')).toBe(
      '$\\frac{20}{30} + \\frac{57}{30} = \\frac{77}{30}$',
    );
    expect(alsFormeln('Pfad T, N: 2/10 · 9/10 = 18/100.')).toBe(
      'Pfad T, N: $\\frac{2}{10} \\cdot \\frac{9}{10} = \\frac{18}{100}$.',
    );
    expect(alsFormeln('Umkehraufgabe: x = 1/7 : 1/2')).toBe(
      'Umkehraufgabe: $x = \\frac{1}{7} : \\frac{1}{2}$',
    );
  });

  it('Klammern über und unter dem Bruchstrich fallen weg', () => {
    expect(alsFormeln('(1 · 1)/(2 · 12) = 1/24')).toBe(
      '$\\frac{1 \\cdot 1}{2 \\cdot 12} = \\frac{1}{24}$',
    );
  });

  it('Doppelpunkt ohne Leerzeichen davor ist Satzzeichen, nicht geteilt', () => {
    expect(alsFormeln('Kehrwert von 1/12: 12/1')).toBe(
      'Kehrwert von $\\frac{1}{12}$: $\\frac{12}{1}$',
    );
  });

  it('Wurzeln, Hochzahlen, Minus, Komma, Prozent und Periode', () => {
    expect(alsFormeln('√(9 + 16) = √25 = 5, aber √9 + √16 = 3 + 4 = 7.')).toBe(
      '$\\sqrt{9 + 16} = \\sqrt{25} = 5$, aber $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$.',
    );
    expect(alsFormeln('also ist ⁵√−243 = −3.')).toBe('also ist $\\sqrt[5]{-243} = -3$.');
    expect(alsFormeln('√(4/121) = 2/11')).toBe('$\\sqrt{\\frac{4}{121}} = \\frac{2}{11}$');
    expect(alsFormeln('f(−1) = (−1)² − 9 = −8')).toBe('f(−1) = $(-1)^{2} - 9 = -8$');
    expect(alsFormeln('1/8 = 12,5 %')).toBe('$\\frac{1}{8} = 12{,}5\\,\\%$');
    expect(alsFormeln('5/7 = 0,7̅1̅4̅2̅8̅5̅')).toBe('$\\frac{5}{7} = 0{,}\\overline{714285}$');
    expect(alsFormeln('11/12 = 0,916̅')).toBe('$\\frac{11}{12} = 0{,}91\\overline{6}$');
    expect(alsFormeln('4·x² + 16·x + 16')).toBe('$4 \\cdot x^{2} + 16 \\cdot x + 16$');
  });

  it('lässt Text, Einheiten und Rechnungen ohne Bruch, Wurzel oder Hochzahl stehen', () => {
    for (const s of [
      '2 · 2 = 4, und 4 ist gerade.',
      '15 m³ = 15 000 dm³',
      'O = 2 · (16 + 56 + 14)  m² = 172 m²',
      '360° : 5 · 1 = 72°',
      'Die Uhr zeigt 7:30.',
      'rot/blau',
      'Berechne den Flächeninhalt in m².',
    ])
      expect(alsFormeln(s)).toBe(s);
  });

  it('Lücke und Funktionswert', () => {
    expect(alsFormeln('(x + 1)² = x² + 2·x + ☐')).toBe(
      '$(x + 1)^{2} = x^{2} + 2 \\cdot x + \\square$',
    );
    expect(alsFormeln('f(x) = x² + 3.')).toBe('f(x) = $x^{2} + 3$.');
  });

  it('vorhandene Formeln bleiben unverändert', () => {
    const s = 'Stimmt nicht: $\\sqrt{2} + (-\\sqrt{2}) = 0$, und 1/2 ist rational.';
    expect(alsFormeln(s)).toBe(
      'Stimmt nicht: $\\sqrt{2} + (-\\sqrt{2}) = 0$, und $\\frac{1}{2}$ ist rational.',
    );
  });
});
