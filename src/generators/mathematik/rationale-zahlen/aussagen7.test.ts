import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  rzAbstandAussage,
  rzDichteAussage,
  rzGegenzahlAussage,
  rzMinusMinusAussage,
  rzOrdnenAussage,
  rzPotenzAussage,
  rzVorzeichenAussage,
} from './aussagen7';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const d = (x: number) => {
  const s = String(Math.round(Math.abs(x) * 1000) / 1000).replace('.', ',');
  return x < 0 ? `−${s}` : s;
};
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Minus einer negativen Zahl begründen (E)', () => {
  pflichttests(rzMinusMinusAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith('Nein. Eine') && t.endsWith(`= ${d(w(i, 'a') + w(i, 'b'))}.`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Abstand über null begründen (E)', () => {
  pflichttests(rzAbstandAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.endsWith(`zusammen ${w(i, 'a') + w(i, 'b')} Grad.`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Vorzeichen eines Produkts begründen (E)', () => {
  pflichttests(rzVorzeichenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      if (w(i, 'null') === 1) return wo(i, (t) => t.startsWith('Nein. Ein Faktor ist 0'));
      const wert = -(w(i, 'a') * w(i, 'b') * w(i, 'c')) / 10;
      return wo(i, (t) => t.startsWith('Nein. Es sind drei') && t.endsWith(`= ${d(wert)}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Negative Zahlen ordnen begründen (E)', () => {
  pflichttests(rzOrdnenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const groesser = Math.max(-w(i, 'p'), -w(i, 'q'));
      return wo(i, (t) => t.startsWith(`Nein. ${d(groesser)} ist größer`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Potenz mit und ohne Klammer begründen (E)', () => {
  pflichttests(rzPotenzAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a');
      const soll = w(i, 'klammer') === 1 ? `= ${a * a}.` : `= −${a * a}.`;
      return wo(i, (t) => t.startsWith('Nein. ') && t.endsWith(soll) && !t.includes(`−${2 * a}`));
    },
    mindestensVerschieden: { E: 10 },
  });
});

describe('Gegenzahl beim geschickten Rechnen begründen (E)', () => {
  pflichttests(rzGegenzahlAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.includes(`= 0 + ${d(w(i, 'b'))} = ${d(w(i, 'b'))},`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Dichte der rationalen Zahlen begründen (E)', () => {
  pflichttests(rzDichteAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Zum Beispiel')),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const a = w(i, 'a');
      const bsp = -(a - 1 + w(i, 'teil') / 100);
      if (!(bsp > -a && bsp < -(a - 1))) v.push('Beispiel liegt nicht dazwischen');
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});
