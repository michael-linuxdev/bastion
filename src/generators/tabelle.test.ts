import { describe, expect, it } from 'vitest';
import { tabelle, tabellenText, vierfeldertafel } from './tabelle';

describe('Tabelle als Bild (B7)', () => {
  it('zeichnet eine Wertetabelle und beschreibt sie Zeile für Zeile', () => {
    const b = tabelle({
      kopf: ['x', '0', '1', '2'],
      zeilen: [['f(x)', '1', '2', '-4']],
      zeilenkopf: true,
      titel: 'Wertetabelle',
    });
    expect(b.svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox=/);
    expect(b.svg).not.toMatch(/<script|href|url\(/);
    expect(b.svg).toContain('>f(x)<');
    expect(b.svg).toContain('>−4<');
    expect(b.beschreibung.de).toBe('Wertetabelle. Spalten: x, 0, 1, 2. Zeile 1: f(x), 1, 2, -4.');
  });

  it('macht Spalten so breit wie der längste Eintrag', () => {
    const schmal = tabelle({ zeilen: [['1', '2']] });
    const breit = tabelle({ zeilen: [['1', '0,123456789']] });
    const w = (svg: string) => Number(/viewBox="0 0 (\d+(?:\.\d+)?)/.exec(svg)?.[1]);
    expect(w(breit.svg)).toBeGreaterThan(w(schmal.svg));
  });

  it('Vierfeldertafel mit Summen hat drei Zeilen und vier Spalten', () => {
    const b = vierfeldertafel(
      { a: 'krank', b: 'Test positiv' },
      [
        ['18', '2'],
        ['9', '171'],
      ],
      { zeilen: ['20', '180'], spalten: ['27', '173'], gesamt: '200' },
    );
    expect(b.beschreibung.de).toBe(
      'Vierfeldertafel. Spalten: Test positiv, nicht Test positiv, Summe. Zeile 1: krank, 18, 2, 20. Zeile 2: nicht krank, 9, 171, 180. Zeile 3: Summe, 27, 173, 200.',
    );
    expect((b.svg.match(/<text/g) ?? []).length).toBe(16);
  });

  it('Beschreibung ohne Kopf', () => {
    expect(tabellenText({ zeilen: [['a', 'b']] })).toBe('Tabelle. Zeile 1: a, b.');
  });
});
