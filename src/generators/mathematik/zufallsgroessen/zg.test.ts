import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { rng } from '../../../core/rng/rng';
import { pflichttests } from '../../pflichttests';
import {
  zerlege,
  zgChanceGewinnAussage,
  zgErwartung,
  zgFair,
  zgKumuliert,
  zgMindestensAussage,
  zgRisikoAussage,
  zgStandardabweichung,
  zgVarianz,
  zgVerteilung,
} from './zg';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const s = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const zahl = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e6) / 1e6 });

/** Tabelle x | P aus dem KaTeX lesen; „?“ wird NaN */
function tabelle(tex: string): { x: number[]; p: number[] } {
  const x = (/x & (.*?) \\\\/.exec(tex)?.[1] ?? '').split(' & ').map(Number);
  const p = (/P\(X = x\) & (.*) \\end/.exec(tex)?.[1] ?? '')
    .split(' & ')
    .map((t) => Number(t.replace('{,}', '.')));
  return { x, p };
}

describe('Zerlegung von 100', () => {
  it('liefert n positive Vielfache des Schritts mit Summe 100', () => {
    for (let seed = 0; seed < 300; seed++) {
      const t = zerlege(rng(seed), 4, 5);
      expect(t).toHaveLength(4);
      expect(t.reduce((a, b) => a + b, 0)).toBe(100);
      expect(t.every((x) => x > 0 && x % 5 === 0)).toBe(true);
    }
  });
});

describe('Fehlende Wahrscheinlichkeit (G)', () => {
  pflichttests(zgVerteilung, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const { p } = tabelle(s(i, 'tabelle'));
      return zahl(1 - p.filter((x) => !Number.isNaN(x)).reduce((a, b) => a + b, 0));
    },
    grenzverletzungen(i) {
      const { p } = tabelle(s(i, 'tabelle'));
      return p.filter((x) => Number.isNaN(x)).length === 1 ? [] : ['nicht genau eine Lücke'];
    },
    mindestensVerschieden: { G: 90 },
  });
});

describe('Mindestens und höchstens (M)', () => {
  pflichttests(zgKumuliert, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const { x, p } = tabelle(s(i, 'tabelle'));
      const k = w(i, 'k');
      const min = w(i, 'mindestens') === 1;
      return zahl(
        p.reduce((a, q, j) => ((min ? (x[j] ?? 0) >= k : (x[j] ?? 0) <= k) ? a + q : a), 0),
      );
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 90 },
  });
});

describe('Mindestens eine Sechs (E)', () => {
  pflichttests(zgMindestensAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Über das Gegenereignis')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 3 },
  });
});

describe('Erwartungswert (G)', () => {
  pflichttests(zgErwartung, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const { x, p } = tabelle(s(i, 'tabelle'));
      return zahl(x.reduce((a, v, j) => a + v * (p[j] ?? 0), 0));
    },
    grenzverletzungen(i) {
      const { p } = tabelle(s(i, 'tabelle'));
      return Math.abs(p.reduce((a, b) => a + b, 0) - 1) > 1e-9 ? ['Summe nicht 1'] : [];
    },
    mindestensVerschieden: { G: 90 },
  });
});

describe('Faires Spiel (M)', () => {
  pflichttests(zgFair, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // „2 Felder 5 €“ aus dem Satz lesen
      const paare = [...s(i, 'satz').matchAll(/(\d+) Felde?r? (\d+) €/g)].map((m) => [
        Number(m[1]),
        Number(m[2]),
      ]);
      const e = paare.reduce((a, [f, g]) => a + ((f ?? 0) / 10) * (g ?? 0), 0);
      return zahl(e - w(i, 'einsatz'));
    },
    grenzverletzungen(i) {
      const felder = [...s(i, 'satz').matchAll(/(\d+) Felde?r? /g)].reduce(
        (a, m) => a + Number(m[1]),
        0,
      );
      return felder === 10 ? [] : ['nicht 10 Felder'];
    },
    mindestensVerschieden: { M: 90 },
  });
});

describe('Gewinnchance und Erwartung (E)', () => {
  pflichttests(zgChanceGewinnAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Im Mittel')),
    grenzverletzungen(i) {
      const ea = (w(i, 'pa') * w(i, 'ga')) / 100;
      const eb = (w(i, 'pb') * w(i, 'gb')) / 100;
      return eb > ea ? verschieden(i) : ['B nicht besser'];
    },
    mindestensVerschieden: { E: 40 },
  });
});

/** Varianz unabhängig: E(X²) − E(X)² */
function varianz(i: Instanz) {
  const { x, p } = tabelle(s(i, 'tabelle'));
  const e = x.reduce((a, v, j) => a + v * (p[j] ?? 0), 0);
  const e2 = x.reduce((a, v, j) => a + v * v * (p[j] ?? 0), 0);
  return e2 - e * e;
}

describe('Varianz (G)', () => {
  pflichttests(zgVarianz, {
    niveaus: { G: {} },
    unabhaengigeLoesung: (i) => zahl(varianz(i)),
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 40 },
  });
});

describe('Standardabweichung (M)', () => {
  pflichttests(zgStandardabweichung, {
    niveaus: { M: {} },
    unabhaengigeLoesung: (i) => ({
      typ: 'zahl',
      wert: Math.round(Math.sqrt(varianz(i)) * 100) / 100,
    }),
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 40 },
  });
});

describe('Gleicher Erwartungswert, anderes Risiko (E)', () => {
  pflichttests(zgRisikoAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Der Erwartungswert')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });

  it('nennt σ als die halbe Spannweite bei zwei gleich wahrscheinlichen Werten', () => {
    const i = zgRisikoAussage.erzeuge(3, {});
    expect(texte(i).some((t) => t.includes(`\\sigma_B = ${w(i, 'gross')}`))).toBe(true);
  });
});
