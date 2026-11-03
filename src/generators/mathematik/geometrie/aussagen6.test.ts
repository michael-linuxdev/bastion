import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  dvHausAussage,
  dvLinieAussage,
  dvSswAussage,
  dvUngleichungAussage,
  dvWinkelAussage,
  flDrachenAussage,
  flHoeheAussage,
  kpPrismaAussage,
  kpPrismaZaehlenAussage,
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

describe('Höhe im Dreieck begründen (E)', () => {
  pflichttests(flHoeheAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Zur Grundseite') &&
          t.endsWith(`= ${(w(i, 'g') * w(i, 'h')) / 2} cm².`),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Fläche des Drachens begründen (E)', () => {
  pflichttests(flDrachenAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Der Drachen') && t.endsWith(`= ${(w(i, 'e') * w(i, 'f')) / 2} cm².`),
      ),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Oberfläche eines Prismas begründen (E)', () => {
  pflichttests(kpPrismaAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c, h] = [w(i, 'a'), w(i, 'b'), w(i, 'c'), w(i, 'h')];
      return wo(
        i,
        (t) => t.startsWith('Nein. Ein Prisma') && t.endsWith(`= ${a * b + (a + b + c) * h} cm².`),
      );
    },
    mindestensVerschieden: { E: 20 },
  });
});

describe('Besondere Linien begründen (E)', () => {
  pflichttests(dvLinieAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        w(i, 'art') === 2
          ? t.startsWith('Nein. Die Winkelhalbierenden schneiden sich im Inkreis')
          : t.startsWith(
              w(i, 'art') === 0 ? 'Nein. Die Seitenhalbierende' : 'Nein. Die Mittelsenkrechte',
            ),
      ),
    mindestensVerschieden: { E: 9 },
  });
});

describe('Dreiecksungleichung begründen (E)', () => {
  pflichttests(dvUngleichungAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c] = [w(i, 'a'), w(i, 'b'), w(i, 'c')].sort((x, y) => x - y) as [
        number,
        number,
        number,
      ];
      if (a + b > c) return wo(i, (t) => t.startsWith('Ja, denn die beiden kürzeren'));
      return wo(i, (t) => t.startsWith(`Nein, denn ${a} + ${b}`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('SsW und sws begründen (E)', () => {
  pflichttests(dvSswAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(w(i, 'c') > w(i, 'b') ? 'Eindeutig ja' : 'Nein. Der Winkel')),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const b = w(i, 'b');
      const c = w(i, 'c');
      if (c < b && !(c > b * Math.sin((w(i, 'gamma') * Math.PI) / 180))) v.push('kein Dreieck');
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});

describe('Haus der Vierecke begründen (E)', () => {
  pflichttests(dvHausAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith([0, 2, 4, 7].includes(w(i, 'aussage')) ? 'Ja, denn' : 'Nein. Ein')),
    mindestensVerschieden: { E: 8 },
  });
});

describe('Neben- und Stufenwinkel begründen (E)', () => {
  pflichttests(dvWinkelAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'alpha');
      return wo(i, (t) =>
        w(i, 'art') === 1
          ? t === `Nein. Stufenwinkel an Parallelen sind gleich groß: ${a}°.`
          : t.endsWith(`= ${180 - a}°.`) && t.startsWith('Nein. Nebenwinkel'),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Flächen und Kanten des Prismas begründen (E)', () => {
  pflichttests(kpPrismaZaehlenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const n = w(i, 'n');
      return wo(
        i,
        (t) =>
          t.startsWith('Nein. ') &&
          t.endsWith(w(i, 'art') === 1 ? `${n + 2} Flächen.` : `${3 * n} Kanten.`),
      );
    },
    mindestensVerschieden: { E: 10 },
  });
});
