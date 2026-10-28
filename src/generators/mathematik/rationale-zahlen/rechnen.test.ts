import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  geschickt,
  malGeteilt,
  plusMinus,
  potenz,
  rzTerm,
  veraenderung,
  vorzeichenRegel,
  wurzel,
} from './rechnen';

// Parameter wie in den Vorlagen (content/…/M.ZO.RZ.ADD-SUB … RECHENGESETZE)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Number(x.toFixed(6)) || 0 });
const wert = (i: Instanz) => (i.loesung.typ === 'zahl' ? i.loesung.wert : NaN);
const zehntelGenau = (x: number, stellen = 1) =>
  Math.abs(x * 10 ** stellen - Math.round(x * 10 ** stellen)) < 1e-6;

/**
 * Kleiner, unabhängiger Rechner für die angezeigten Terme:
 * Zahlen mit Komma, −, +, ·, :, Klammern, ² und ³ (Hochzahl bindet stärker als das Minus davor).
 */
function rechne(term: string): number {
  const t = term.replace(/\s/g, '');
  let i = 0;
  const zeichen = () => t[i];
  function zahlLesen(): number {
    const m = /^\d+(,\d+)?/.exec(t.slice(i));
    if (!m) throw new Error(`keine Zahl bei ${t.slice(i)}`);
    i += m[0].length;
    return Number(m[0].replace(',', '.'));
  }
  function grund(): number {
    let x: number;
    if (zeichen() === '(') {
      i++;
      x = summe();
      if (zeichen() !== ')') throw new Error('Klammer fehlt');
      i++;
    } else x = zahlLesen();
    while (zeichen() === '²' || zeichen() === '³') x = x ** (t[i++] === '²' ? 2 : 3);
    return x;
  }
  function vorzeichen(): number {
    if (zeichen() === '−') {
      i++;
      return -vorzeichen();
    }
    return grund();
  }
  function produkt(): number {
    let x = vorzeichen();
    while (zeichen() === '·' || zeichen() === ':') {
      const op = t[i++];
      const y = vorzeichen();
      x = op === '·' ? x * y : x / y;
    }
    return x;
  }
  function summe(): number {
    let x = produkt();
    while (zeichen() === '+' || zeichen() === '−') {
      const op = t[i++];
      const y = produkt();
      x = op === '+' ? x + y : x - y;
    }
    return x;
  }
  const x = summe();
  if (i !== t.length) throw new Error(`Rest: ${t.slice(i)}`);
  return x;
}

describe('Testrechner', () => {
  it('rechnet wie in der Schule', () => {
    expect(rechne('3 − (−9)')).toBe(12);
    expect(rechne('−4²')).toBe(-16);
    expect(rechne('(−4)²')).toBe(16);
    expect(rechne('(−3) · 4 + 12 : (−2)')).toBe(-18);
    expect(rechne('−2,5 + 4,1')).toBeCloseTo(1.6);
  });
});

describe('Addieren und Subtrahieren', () => {
  pflichttests(plusMinus, {
    niveaus: {
      G: { dezimal: false, max: 20, glieder: 2 },
      M: { dezimal: true, max: 20, glieder: 3 },
    },
    unabhaengigeLoesung: (i) => zahlL(rechne(T(i, 'term'))),
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const zahlen = T(i, 'term').match(/\d+(,\d+)?/g) ?? [];
      if (zahlen.length !== p.glieder) f.push('Anzahl Glieder');
      if (zahlen.some((z) => Number(z.replace(',', '.')) > p.max)) f.push('zu groß');
      if (!p.dezimal && zahlen.some((z) => z.includes(','))) f.push('Komma auf G');
      if (!T(i, 'term').includes('−')) f.push('keine negative Zahl');
      if (!i.vorzeichen) f.push('ohne ±');
      return f;
    },
    mindestensVerschieden: { G: 80, M: 95 },
  });
});

describe('Veränderungen über die 0 hinweg', () => {
  pflichttests(veraenderung, {
    niveaus: { G: { dezimal: false }, M: { dezimal: true } },
    unabhaengigeLoesung(i) {
      const g = T(i, 'geschichte');
      const [start = '0', menge = '0'] = (g.match(/−?\d+(,\d+)?/g) ?? []).map((z) =>
        z.replace('−', '-').replace(',', '.'),
      );
      const plus = /steigt die|zahlt ein|steigt auf/.test(g);
      return zahlL(Number(start) + (plus ? 1 : -1) * Number(menge));
    },
    grenzverletzungen(i, p) {
      const w = wert(i);
      const f: string[] = [];
      if (!zehntelGenau(w)) f.push('mehr als eine Nachkommastelle');
      if (!p.dezimal && !Number.isInteger(w)) f.push('Komma auf G');
      if (Math.abs(w) > 160) f.push(`zu groß: ${w}`);
      return f;
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Multiplizieren und Dividieren', () => {
  pflichttests(malGeteilt, {
    niveaus: {
      G: { zweiter_natuerlich: true, dezimal: false, max: 12 },
      M: { zweiter_natuerlich: false, dezimal: true, max: 12 },
    },
    unabhaengigeLoesung: (i) => zahlL(rechne(T(i, 'term'))),
    grenzverletzungen(i, p) {
      const t = T(i, 'term');
      const f: string[] = [];
      if (!t.includes('−')) f.push('keine negative Zahl');
      if (p.zweiter_natuerlich && /[·:] \(/.test(t)) f.push('zweite Zahl negativ auf G');
      if (!p.dezimal && t.includes(',')) f.push('Komma auf G');
      if (!zehntelGenau(wert(i), 2)) f.push('Ergebnis zu genau');
      return f;
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Vorzeichen eines Produkts', () => {
  pflichttests(vorzeichenRegel, {
    niveaus: {
      G: { faktoren_min: 3, faktoren_max: 4, gemischt: false },
      M: { faktoren_min: 4, faktoren_max: 6, gemischt: true },
    },
    unabhaengigeLoesung(i) {
      const x = rechne(T(i, 'term'));
      return { typ: 'auswahl', wert: x === 0 ? 2 : x > 0 ? 0 : 1 };
    },
    grenzverletzungen(i, p) {
      const n = (T(i, 'term').match(/\d+/g) ?? []).length;
      return n < p.faktoren_min || n > p.faktoren_max ? [`${n} Faktoren`] : [];
    },
    mindestensVerschieden: { G: 95, M: 95 },
  });
});

describe('Potenzen', () => {
  pflichttests(potenz, {
    niveaus: {
      G: { dezimal: false, ohne_klammer: false },
      M: { dezimal: true, ohne_klammer: true },
    },
    unabhaengigeLoesung: (i) => zahlL(rechne(T(i, 'term'))),
    grenzverletzungen(i, p) {
      const t = T(i, 'term');
      const f: string[] = [];
      if (!p.ohne_klammer && !t.startsWith('(')) f.push('ohne Klammer auf G');
      if (!p.dezimal && t.includes(',')) f.push('Komma auf G');
      if (Math.abs(wert(i)) > 225) f.push('zu groß');
      return f;
    },
    mindestensVerschieden: { G: 15, M: 30 },
  });
});

describe('Quadratwurzeln', () => {
  pflichttests(wurzel, {
    niveaus: { G: { dezimal: false }, M: { dezimal: true } },
    unabhaengigeLoesung: (i) => zahlL(Math.sqrt(i.platzhalter['radikand'] as number)),
    grenzverletzungen(i, p) {
      const r = i.platzhalter['radikand'] as number;
      const f: string[] = [];
      if (!zehntelGenau(Math.sqrt(r))) f.push('geht nicht auf');
      if (!p.dezimal && !Number.isInteger(r)) f.push('Komma auf G');
      if (r > 400) f.push('zu groß');
      return f;
    },
    mindestensVerschieden: { G: 15, M: 25 },
  });
});

describe('Vorrangregeln', () => {
  pflichttests(rzTerm, {
    niveaus: { G: { dezimal: false, klammern: false }, M: { dezimal: true, klammern: true } },
    unabhaengigeLoesung: (i) => zahlL(rechne(T(i, 'term'))),
    grenzverletzungen(i, p) {
      const t = T(i, 'term');
      const f: string[] = [];
      if (!p.klammern && /^\([^)]*\+/.test(t)) f.push('Klammer auf G');
      if (!p.dezimal && t.includes(',')) f.push('Komma auf G');
      if (!zehntelGenau(wert(i))) f.push('Ergebnis zu genau');
      return f;
    },
    mindestensVerschieden: { G: 80, M: 90 },
  });
});

describe('Rechenvorteile', () => {
  pflichttests(geschickt, {
    niveaus: { G: { dezimal: false }, M: { dezimal: true } },
    unabhaengigeLoesung: (i) => zahlL(rechne(T(i, 'term'))),
    grenzverletzungen(i, p) {
      return !p.dezimal && T(i, 'term').includes(',') ? ['Komma auf G'] : [];
    },
    mindestensVerschieden: { G: 60, M: 70 },
  });
});
