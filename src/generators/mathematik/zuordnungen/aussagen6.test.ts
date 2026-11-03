import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  zuDreisatzAussage,
  zuEindeutigAussage,
  zuGraphAussage,
  zuQuotientAussage,
} from './aussagen6';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Art einer Zuordnung begründen (E)', () => {
  pflichttests(zuEindeutigAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        w(i, 'doppeltesx') === 1
          ? t.startsWith('Nein.') && t.endsWith('mehrdeutig.')
          : t.startsWith('Nein. Jedes x'),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Umgekehrt proportionaler Dreisatz begründen (E)', () => {
  pflichttests(zuDreisatzAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const neu = (w(i, 'a') * w(i, 't')) / w(i, 'b');
      return wo(i, (t) => t.startsWith(`${neu} Stunden, denn`) && t.includes('der Zeit'));
    },
    mindestensVerschieden: { E: 20 },
  });
});

describe('Graph einer Zuordnung begründen (E)', () => {
  pflichttests(zuGraphAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        w(i, 'art') === 1
          ? t.startsWith('Nein. Die Zuordnung ist umgekehrt')
          : t ===
            `Nein. Für 0 kg zahlt man 0 €. Der Graph ist eine Gerade durch den Ursprung und durch (1|${w(i, 'p')}).`,
      ),
    mindestensVerschieden: { E: 10 },
  });
});

describe('Quotienten- und Produktgleichheit begründen (E)', () => {
  pflichttests(zuQuotientAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(w(i, 'art') === 1 ? 'Nein. Die Produkte' : 'Nein. Die Quotienten')),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const m = w(i, 'm');
      const n = w(i, 'n');
      const y = (x: number) => (w(i, 'art') === 1 ? n - m * x : m * x + n);
      if (w(i, 'art') === 1 ? 1 * y(1) === 2 * y(2) : y(1) / 1 === y(2) / 2)
        v.push('Zuordnung ist doch (umgekehrt) proportional');
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});
