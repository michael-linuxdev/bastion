import { describe, expect, it } from 'vitest';
import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { zahlwortZuZahl } from './zahlwort-zu-zahl';

const NIVEAUS = {
  G: { stellen_min: 4, stellen_max: 7 },
  M: { stellen_min: 7, stellen_max: 12 },
};

// Unabhängiger Rückweg: Zahlwort → Zahl, ohne den Code von zahlwort.ts zu benutzen.
const KLEIN: Record<string, number> = {
  eins: 1,
  ein: 1,
  eine: 1,
  zwei: 2,
  drei: 3,
  vier: 4,
  fünf: 5,
  sechs: 6,
  sieben: 7,
  acht: 8,
  neun: 9,
  zehn: 10,
  elf: 11,
  zwölf: 12,
  dreizehn: 13,
  vierzehn: 14,
  fünfzehn: 15,
  sechzehn: 16,
  siebzehn: 17,
  achtzehn: 18,
  neunzehn: 19,
  zwanzig: 20,
  dreißig: 30,
  vierzig: 40,
  fünfzig: 50,
  sechzig: 60,
  siebzig: 70,
  achtzig: 80,
  neunzig: 90,
};
function lies100(w: string): number {
  if (w === '') return 0;
  const und = w.split('und');
  if (und.length === 2) return (KLEIN[und[0] ?? ''] ?? NaN) + (KLEIN[und[1] ?? ''] ?? NaN);
  return KLEIN[w] ?? NaN;
}
function lies1000(w: string): number {
  const [h, rest] = w.includes('hundert') ? w.split('hundert') : ['', w];
  return (h ? (KLEIN[h] ?? NaN) * 100 : 0) + lies100(rest ?? '');
}
function liesKlein(w: string): number {
  const [t, rest] = w.includes('tausend') ? w.split('tausend') : ['', w];
  return (t !== '' || w.includes('tausend') ? lies1000(t ?? '') * 1000 : 0) + lies1000(rest ?? '');
}
function liesZahlwort(text: string): number {
  const w = text.split(' ');
  let summe = 0;
  for (let i = 0; i < w.length; i++) {
    const naechstes = w[i + 1] ?? '';
    if (/^Milliarde/.test(naechstes)) summe += lies1000(w[i] ?? '') * 1e9;
    else if (/^Million/.test(naechstes)) summe += lies1000(w[i] ?? '') * 1e6;
    else if (!/^(Milliarde|Million)/.test(w[i] ?? '')) summe += liesKlein(w[i] ?? '');
  }
  return summe;
}

pflichttests(zahlwortZuZahl, {
  niveaus: NIVEAUS,
  unabhaengigeLoesung: (instanz) => ({
    typ: 'zahl',
    wert: liesZahlwort((instanz.platzhalter['zahlwort'] as Sprachobjekt).de),
  }),
  grenzverletzungen(instanz, p) {
    const n = instanz.loesung.typ === 'zahl' ? instanz.loesung.wert : NaN;
    const stellen = String(n).length;
    return stellen < p.stellen_min || stellen > p.stellen_max ? [`${stellen} Stellen`] : [];
  },
  mindestensVerschieden: { G: 95, M: 95 },
});

describe('nz.zahlwort-zu-zahl – Einzelfälle', () => {
  it('der Rückweg im Test liest bekannte Zahlwörter richtig', () => {
    expect(liesZahlwort('drei Millionen vierhunderttausendfünf')).toBe(3_400_005);
    expect(liesZahlwort('eine Milliarde eintausendeins')).toBe(1_000_001_001);
    expect(liesZahlwort('einundzwanzigtausend')).toBe(21_000);
  });

  it('erzeugt die typischen Fehler „Nullen vergessen“ und „vertauscht“', () => {
    const ids = new Set<string>();
    for (let s = 0; s < 200; s++) {
      for (const f of zahlwortZuZahl.erzeuge(s, NIVEAUS.G).fehlerbilder) ids.add(f.id);
    }
    expect([...ids].sort()).toEqual(['nullen-vergessen', 'zehner-einer-vertauscht']);
  });
});
