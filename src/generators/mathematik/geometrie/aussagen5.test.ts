import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  flEinheitAussage,
  flLUmfangAussage,
  flRechteckAussage,
  gfKoordinateAussage,
  gfLageAussage,
  gfWinkelartAussage,
  gfWinkelpaarAussage,
  kpLiterAussage,
  kpNetzAussage,
  kpOberflaecheAussage,
  kpSchichtenAussage,
  syAchsenAussage,
  syBewegungAussage,
  sySpiegelAussage,
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

describe('Flächeneinheiten begründen (E)', () => {
  pflichttests(flEinheitAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith('Nein. 1') && t.includes(`= ${w(i, 'a') * 100} `)),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Breite aus dem Umfang begründen (E)', () => {
  pflichttests(flRechteckAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) => t.startsWith('Nein. Im Umfang') && t.endsWith(`= ${w(i, 'u') / 2 - w(i, 'a')} cm.`),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Umfang der L-Figur begründen (E)', () => {
  pflichttests(flLUmfangAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`Nein. Der Umfang bleibt ${2 * (w(i, 'a') + w(i, 'b'))} cm`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Liter und Kubikdezimeter begründen (E)', () => {
  pflichttests(kpLiterAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. 1 l = 1 dm³')),
    mindestensVerschieden: { E: 8 },
  });
});

describe('Oberfläche des Quaders begründen (E)', () => {
  pflichttests(kpOberflaecheAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c] = [w(i, 'a'), w(i, 'b'), w(i, 'c')];
      return wo(
        i,
        (t) => t.startsWith('Nein. Jede') && t.endsWith(`= ${2 * (a * b + a * c + b * c)} cm².`),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Volumen in Schichten begründen (E)', () => {
  pflichttests(kpSchichtenAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Auf den Boden') &&
          t.endsWith(`= ${w(i, 'a') * w(i, 'b') * w(i, 'c')} cm³.`),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Koordinaten eintragen begründen (E)', () => {
  pflichttests(gfKoordinateAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t ===
          `Nein. Die erste Zahl ist der x-Wert: ${w(i, 'x')} nach rechts, dann ${w(i, 'y')} nach oben.`,
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Parallele Geraden begründen (E)', () => {
  pflichttests(gfLageAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Parallele Geraden haben überall')),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Winkelart begründen (E)', () => {
  pflichttests(gfWinkelartAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein.') &&
          t.endsWith(w(i, 'alpha') > 180 ? 'also überstumpf.' : 'er ist stumpf.'),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Scheitel- und Nebenwinkel begründen (E)', () => {
  pflichttests(gfWinkelpaarAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.endsWith(`Scheitelwinkel sind gleich groß: ${w(i, 'alpha')}°.`)),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Würfelnetz falten begründen (E)', () => {
  const gegen: Record<number, number> = { 1: 3, 2: 4, 5: 6 };
  pflichttests(kpNetzAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        gegen[w(i, 'i')] === w(i, 'j')
          ? t.startsWith('Ja.') && t.endsWith('gegenüber.')
          : t.startsWith('Nein. Gegenüber von'),
      ),
    mindestensVerschieden: { E: 15 },
  });
});

describe('Verschiebung begründen (E)', () => {
  pflichttests(syBewegungAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nicht ganz.')),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Spiegeln an einer Achse begründen (E)', () => {
  pflichttests(sySpiegelAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const xs = 2 * w(i, 's') - w(i, 'x');
      return wo(i, (t) => t.startsWith('Nein.') && t.endsWith(`P'(${xs}|${w(i, 'y')}).`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Symmetrieachsen begründen (E)', () => {
  const anzahl = [2, 4, 3, 0, 2, 6];
  pflichttests(syAchsenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const n = anzahl[w(i, 'figur')] ?? -1;
      return wo(
        i,
        (t) =>
          t.startsWith('Nein.') &&
          (n === 0
            ? t.includes('keine Symmetrieachse. Es ist nur')
            : t.includes(`hat ${n} Symmetrieachsen`)),
      );
    },
    mindestensVerschieden: { E: 6 },
  });
});
