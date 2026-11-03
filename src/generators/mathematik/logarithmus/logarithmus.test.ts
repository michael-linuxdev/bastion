import { describe } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  lgGesetze,
  lgGleichung,
  lgGleichungGanz,
  lgLnAussage,
  lgSpiegeln,
  lgSummeAussage,
  lgUmkehrbarAussage,
  lgUmkehrWert,
  lgWert,
} from './logarithmus';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const s = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const keine = () => [];

describe('Umkehrfunktion: Punkt spiegeln', () => {
  pflichttests(lgSpiegeln, {
    niveaus: { G: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t === `P'(${w(i, 'y')}|${w(i, 'x')})`),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 30 },
  });
});

describe('Wert der Umkehrfunktion', () => {
  pflichttests(lgUmkehrWert, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // durch Ausprobieren: welches ganze x hat f(x) = c?
      for (let x = -50; x <= 50; x++)
        if (w(i, 'm') * x + w(i, 'n') === w(i, 'c')) return { typ: 'zahl', wert: x };
      return { typ: 'zahl', wert: NaN };
    },
    grenzverletzungen: keine,
    mindestensVerschieden: { M: 60 },
  });
});

describe('x² umkehrbar? (E)', () => {
  pflichttests(lgUmkehrbarAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`Nein. $f(${w(i, 'a')}) = f(-${w(i, 'a')})`)),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 8 },
  });
});

describe('Logarithmus berechnen', () => {
  pflichttests(lgWert, {
    niveaus: { G: { negativ: false }, M: { negativ: true } },
    unabhaengigeLoesung(i) {
      // aus dem Term: Basis und Argument lesen, Hochzahl durch Probieren
      const m = /\\log_\{(\d+)\} (?:\\frac\{1\}\{(\d+)\}|(\d+))$/.exec(s(i, 'term'));
      const b = Number(m?.[1]);
      const arg = m?.[2] ? 1 / Number(m[2]) : Number(m?.[3]);
      for (let n = -6; n <= 8; n++)
        if (Math.abs(b ** n - arg) < 1e-12) return { typ: 'zahl', wert: n };
      return { typ: 'zahl', wert: NaN };
    },
    grenzverletzungen: (i, p) => (!p.negativ && w(i, 'n') < 0 ? ['negativ auf G'] : []),
    mindestensVerschieden: { G: 10, M: 15 },
  });
});

describe('Logarithmengesetze', () => {
  pflichttests(lgGesetze, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const a = w(i, 'a');
      const k = w(i, 'k');
      const arg = [a ** k, a * 10 ** k, 10 / a, 1 / a][w(i, 'art')] ?? 1;
      // mit dem gegebenen Näherungswert: lg x = lg a · (ln x / ln a) nur bei Potenzen von a …
      // daher genauer Wert und Rundung auf 2 Stellen vergleichen
      const genau = Math.log10(arg);
      const loes = i.loesung as { wert: number };
      return { typ: 'zahl', wert: Math.abs(loes.wert - genau) < 0.005 ? loes.wert : NaN };
    },
    grenzverletzungen: keine,
    mindestensVerschieden: { M: 12 },
  });
});

describe('Logarithmus einer Summe (E)', () => {
  pflichttests(lgSummeAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Das Gesetz gilt für Produkte')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 4 },
  });
});

describe('Exponentialgleichung, ganzzahlig', () => {
  pflichttests(lgGleichungGanz, {
    niveaus: { G: { faktor: false }, M: { faktor: true } },
    unabhaengigeLoesung(i) {
      const b = w(i, 'basis');
      const ziel = w(i, 'rechts') / w(i, 'c');
      for (let n = 0; n <= 10; n++) if (b ** n === ziel) return { typ: 'zahl', wert: n };
      return { typ: 'zahl', wert: NaN };
    },
    grenzverletzungen: (i, p) => (!p.faktor && w(i, 'c') !== 1 ? ['Faktor auf G'] : []),
    mindestensVerschieden: { G: 12, M: 30 },
  });
});

describe('Exponentialgleichung mit Logarithmus', () => {
  pflichttests(lgGleichung, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const x = Math.log10(w(i, 'rechts') / w(i, 'c')) / Math.log10(w(i, 'basis'));
      return { typ: 'zahl', wert: Math.round(x * 100) / 100 };
    },
    grenzverletzungen: keine,
    mindestensVerschieden: { M: 30 },
  });
});

describe('ln negativer Zahlen (E)', () => {
  pflichttests(lgLnAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. $\\ln x$ ist die Umkehrung')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 8 },
  });
});
