import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { auswerten } from '../../../core/learning/auswertung';
import { pflichttests } from '../../pflichttests';
import { pwRationalIrrational, pwReellAussage, pwZahlbereich } from './reell';
import { pwWurzel, pwWurzelAussage, pwZwischen } from './wurzeln';

const zahlWert = (i: Instanz, n: string) => i.platzhalter[n] as number;
const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
/** Bei Auswahl-Aufgaben ist die Lösung die einzige Option, die kein Fehlerbild ist. */
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

describe('Wurzeln berechnen', () => {
  pflichttests(pwWurzel, {
    niveaus: {
      G: { exponenten: [2, 3], negativ: false },
      M: { exponenten: [2, 3, 4, 5], negativ: true },
    },
    unabhaengigeLoesung(i) {
      const r = zahlWert(i, 'radikand');
      const n = zahlWert(i, 'n');
      return { typ: 'zahl', wert: Math.sign(r) * Math.round(Math.abs(r) ** (1 / n)) };
    },
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const n = zahlWert(i, 'n');
      const r = zahlWert(i, 'radikand');
      if (!p.exponenten.includes(n)) f.push('Exponent');
      if (r < 0 && (!p.negativ || n % 2 === 0)) f.push('negativ nicht erlaubt');
      if (Math.abs(r) > 400 && n === 2) f.push('Quadratwurzel zu groß');
      if (!tex(i, 'term').includes(String(r))) f.push('Radikand fehlt im Term');
      return f;
    },
    mindestensVerschieden: { G: 25, M: 35 },
  });
});

describe('Wurzeln abschätzen', () => {
  pflichttests(pwZwischen, {
    niveaus: { G: { n: 2, max: 150 }, M: { n: 3, max: 500 } },
    unabhaengigeLoesung(i, p) {
      const r = zahlWert(i, 'radikand');
      let k = 0;
      while ((k + 1) ** p.n <= r) k++;
      return { typ: 'felder', wert: [k, k + 1] };
    },
    grenzverletzungen(i, p) {
      const r = zahlWert(i, 'radikand');
      const f: string[] = [];
      if (r < 3 || r > p.max) f.push('Radikand außerhalb');
      if (Number.isInteger(Math.round(r ** (1 / p.n) * 1e9) / 1e9)) f.push('Wurzel geht auf');
      if (i.felder?.namen.length !== 2) f.push('zwei Felder');
      return f;
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });

  it('die Felder: kleinere Zahl zuerst, Reihenfolge zählt', () => {
    const i = pwZwischen.erzeuge(7, { n: 2, max: 150 });
    if (i.loesung.typ !== 'felder') throw new Error('felder erwartet');
    const [a = 0, b = 0] = i.loesung.wert;
    expect(auswerten(i, { typ: 'felder', wert: [a, b] })).toEqual({ richtig: true });
    expect(auswerten(i, { typ: 'felder', wert: [b, a] }).richtig).toBe(false);
  });
});

describe('Aussagen über Wurzeln (E)', () => {
  pflichttests(pwWurzelAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 12 },
  });
});

describe('Rational oder irrational', () => {
  pflichttests(pwRationalIrrational, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const t = tex(i, 'zahl');
      const m = /^-?\\sqrt\{(\d+)\}$/.exec(t);
      const irrational =
        t.includes('\\pi') || (m !== null && !Number.isInteger(Math.sqrt(Number(m[1]))));
      return { typ: 'auswahl', wert: irrational ? 1 : 0 };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 2 ? [] : ['zwei Optionen']),
    mindestensVerschieden: { G: 40 },
  });
});

describe('Kleinster Zahlbereich', () => {
  pflichttests(pwZahlbereich, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // Aus dem Term: Quadratzahl unter der Wurzel → ganz, sonst irrational
      const t = tex(i, 'zahl');
      const quadrat = (x: string) => Number.isInteger(Math.sqrt(Number(x)));
      let bereich: number;
      let m: RegExpExecArray | null;
      if ((m = /^-\\sqrt\{(\d+)\}$/.exec(t))) bereich = quadrat(m[1] ?? '') ? 1 : 3;
      else if ((m = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(t)))
        bereich = Number(m[1]) % Number(m[2]) === 0 ? 0 : 2;
      else if ((m = /^\\sqrt\{\\frac\{(\d+)\}\{(\d+)\}\}$/.exec(t)))
        bereich = quadrat(m[1] ?? '') && quadrat(m[2] ?? '') ? 2 : 3;
      else if ((m = /^\\sqrt\{(\d+)\}$/.exec(t))) bereich = quadrat(m[1] ?? '') ? 0 : 3;
      else if (/^-0\{,\}\d$/.test(t)) bereich = 2;
      else if ((m = /^\\sqrt\{(\d+)\} - (\d+)$/.exec(t)))
        bereich = Math.sqrt(Number(m[1])) - Number(m[2]) < 0 ? 1 : 0;
      else throw new Error(`unbekannter Term ${t}`);
      return { typ: 'auswahl', wert: bereich };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { M: 30 },
  });
});

describe('Aussagen über reelle Zahlen (E)', () => {
  pflichttests(pwReellAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 3 ? [] : ['drei Optionen']),
    mindestensVerschieden: { E: 8 },
  });
});
