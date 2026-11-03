import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  tuAusmultiplizierenAussage,
  tuBinomischAussage,
  tuGleichungSchrittAussage,
  tuMinusklammerAussage,
  tuUngleichungAussage,
} from './aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Minusklammer begründen (E)', () => {
  pflichttests(tuMinusklammerAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.endsWith(`${w(i, 'a')} − ${w(i, 'b')} · x + ${w(i, 'c')}.`) &&
          t.startsWith('Nein. Ein'),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Ausmultiplizieren begründen (E)', () => {
  pflichttests(tuAusmultiplizierenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a');
      const ab = a * w(i, 'b');
      const soll = w(i, 'minus') ? `−${a} · x + ${ab}.` : `${a} · x + ${ab}.`;
      return wo(i, (t) => t.endsWith(soll) && t.startsWith('Nein.') && !t.includes('Richtig ist'));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Binomische Formel begründen (E)', () => {
  pflichttests(tuBinomischAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a');
      const v = w(i, 'minus') ? '−' : '+';
      return wo(i, (t) => t.endsWith(`= x² ${v} ${2 * a} · x + ${a * a}.`));
    },
    mindestensVerschieden: { E: 10 },
  });
});

describe('Ersten Schritt einer Gleichung begründen (E)', () => {
  pflichttests(tuGleichungSchrittAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a');
      const b = w(i, 'b');
      const x = w(i, 'c') / a + b;
      return wo(i, (t) => t.startsWith(`${a} · x − ${a * b} = `) && t.endsWith(`x = ${x}.`));
    },
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      if (!Number.isInteger(w(i, 'c') / w(i, 'a'))) v.push('x nicht ganz');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Ungleichung begründen (E)', () => {
  pflichttests(tuUngleichungAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.endsWith(`x > −${w(i, 'k')}.`)),
    mindestensVerschieden: { E: 30 },
  });
});
