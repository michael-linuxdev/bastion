import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { pzAngebotAussage, pzRabattAussage } from './aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };
const euro = (x: number) => x.toFixed(2).replace('.', ',');

describe('Rabatt und Aufschlag begründen (E)', () => {
  pflichttests(pzRabattAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const p = w(i, 'prozent') / 100;
      const ende = w(i, 'preis') * (1 - p) * (1 + p);
      return wo(i, (t) => t.startsWith(`Nein, nur ${euro(ende)} €.`));
    },
    mindestensVerschieden: { E: 15 },
  });
});

describe('Angebote vergleichen begründen (E)', () => {
  pflichttests(pzAngebotAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`A: Sie kostet ${euro(w(i, 'klein') / 100)} € je 100 g`)),
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      if (w(i, 'klein') >= w(i, 'gross')) v.push('A nicht günstiger');
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});
