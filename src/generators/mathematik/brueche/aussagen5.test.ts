import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  brAnteilVonAussage,
  brBildAussage,
  brErweiternAussage,
  brKommaUnterAussage,
  brLaengerAussage,
  brProzentAussage,
  brStellenwertAussage,
  brStrahlAussage,
  brVergleichAussage,
} from './aussagen5';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Anteil von einer Größe begründen (E)', () => {
  pflichttests(brAnteilVonAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const ergebnis = (w(i, 'z') * w(i, 'ganzes')) / w(i, 'n');
      return wo(i, (t) => t.startsWith('Nein.') && t.endsWith(`= ${ergebnis} Kinder.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Bruch zum Bild begründen (E)', () => {
  pflichttests(brBildAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.endsWith(`gefärbten: ${w(i, 'gefaerbt')}/${w(i, 'alle')}.`)),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Dezimalzahlen ordnen begründen (E)', () => {
  pflichttests(brLaengerAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.endsWith(`Also ist 0,${w(i, 'x')} größer.`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Komma unter Komma begründen (E)', () => {
  pflichttests(brKommaUnterAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const s = w(i, 'a') + w(i, 'b') / 10 + w(i, 'c') + w(i, 'de') / 100;
      return wo(
        i,
        (t) => t.startsWith('Nein. Komma') && t.endsWith(`= ${s.toFixed(2).replace('.', ',')}.`),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Stellenwert hinter dem Komma begründen (E)', () => {
  pflichttests(brStellenwertAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const z = w(i, 'z');
      const zahl = (z / w(i, 'nenner')).toFixed(w(i, 'nenner') === 100 ? 2 : 3).replace('.', ',');
      return wo(i, (t) => t.startsWith('Nein.') && t.endsWith(`= ${zahl}.`));
    },
    mindestensVerschieden: { E: 15 },
  });
});

describe('Erweitern begründen (E)', () => {
  pflichttests(brErweiternAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Erweitern heißt')),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Prozent als Hundertstel begründen (E)', () => {
  pflichttests(brProzentAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const p = Math.round(w(i, 'wert') * 100);
      return wo(i, (t) => t.startsWith('Nein. Prozent') && t.endsWith(`= ${p} %.`));
    },
    mindestensVerschieden: { E: 6 },
  });
});

describe('Brüche vergleichen begründen (E)', () => {
  pflichttests(brVergleichAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c, d] = [w(i, 'a'), w(i, 'b'), w(i, 'c'), w(i, 'd')];
      const groesser = a * d > c * b ? `${a}/${b}` : `${c}/${d}`;
      return wo(
        i,
        (t) =>
          t.startsWith('Nein.') &&
          (t.includes(`${groesser} ist größer`) || t.endsWith(`Also ist ${groesser} größer.`)),
      );
    },
    mindestensVerschieden: { E: 20 },
  });
});

describe('Zahlenstrahl ablesen begründen (E)', () => {
  pflichttests(brStrahlAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.endsWith(`zeigt die Marke ${w(i, 'k')}/${w(i, 'n')}.`)),
    mindestensVerschieden: { E: 30 },
  });
});
