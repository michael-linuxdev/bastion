import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { nzKlammerAussage, nzUngleichungAussage } from './aussagen5';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Punkt vor Strich und Klammern begründen (E)', () => {
  pflichttests(nzKlammerAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c] = [w(i, 'a'), w(i, 'b'), w(i, 'c')];
      const wert = w(i, 'mitklammer') === 1 ? (a + b) * c : a + b * c;
      return wo(i, (t) => t.startsWith('Nein.') && t.endsWith(`= ${wert}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Ungleichung mit Grenze begründen (E)', () => {
  pflichttests(nzUngleichungAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith('Nein. Bei') && t.endsWith(`ist ${w(i, 'b') - w(i, 'a') - 1}.`)),
    mindestensVerschieden: { E: 30 },
  });
});
