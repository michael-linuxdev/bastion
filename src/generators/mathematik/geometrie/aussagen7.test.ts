import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  dvViereckAussage,
  flVieleckAussage,
  gfSpiegelnAussage,
  kpDichteAussage,
  kpPyramideHoeheAussage,
  kpPyramideZaehlenAussage,
  kpVerpackungAussage,
  kpZweitafelAussage,
  krUmkehrungAussage,
  krUmkreisAussage,
  krZentriAussage,
} from './aussagen7';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const z = (x: number) => (x < 0 ? `−${-x}` : String(x));
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Zusammengesetzte Fläche begründen (E)', () => {
  pflichttests(flVieleckAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const rest = w(i, 'a') * w(i, 'b') - w(i, 'c') * w(i, 'd');
      return wo(i, (t) => t.startsWith('Nein. Die Ecke') && t.endsWith(`= ${rest} cm².`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Masse aus Dichte begründen (E)', () => {
  pflichttests(kpDichteAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const m = w(i, 'a') * w(i, 'b') * w(i, 'c') * w(i, 'dichte');
      return wo(i, (t) => t.startsWith(`${m} kg, denn Masse = Dichte`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Seitenhöhe der Pyramide begründen (E)', () => {
  pflichttests(kpPyramideHoeheAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Die Seitendreiecke') &&
          t.endsWith(`= ${2 * w(i, 'a') * w(i, 'hs')} cm².`),
      ),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const halb = w(i, 'a') / 2;
      if (halb * halb + w(i, 'h') ** 2 !== w(i, 'hs') ** 2) v.push('Maße passen nicht zusammen');
      return v;
    },
    mindestensVerschieden: { E: 8 },
  });
});

describe('Verpackung: Volumen und Oberfläche begründen (E)', () => {
  pflichttests(kpVerpackungAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const o = (p: string) =>
        2 *
        (w(i, `a${p}`) * w(i, `b${p}`) +
          w(i, `a${p}`) * w(i, `c${p}`) +
          w(i, `b${p}`) * w(i, `c${p}`));
      return wo(i, (t) => t.includes(`A braucht ${o('1')} cm², B ${o('2')} cm²`));
    },
    grenzverletzungen(i) {
      const v = verschieden(i);
      const vol = (p: string) => w(i, `a${p}`) * w(i, `b${p}`) * w(i, `c${p}`);
      if (vol('1') !== vol('2')) v.push('Volumen verschieden');
      return v;
    },
    mindestensVerschieden: { E: 10 },
  });
});

describe('Eindeutigkeit eines Vierecks begründen (E)', () => {
  pflichttests(dvViereckAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        t.startsWith(w(i, 'art') === 0 ? 'Nein. Mit vier Seiten allein' : 'Nein. Die Diagonale'),
      ),
    grenzverletzungen(i) {
      const v = verschieden(i);
      if (w(i, 'art') === 1) {
        const [a, b, c, d, e] = [w(i, 'a'), w(i, 'b'), w(i, 'c'), w(i, 'd'), w(i, 'e')];
        if (!(e < a + b && e < c + d && e > Math.abs(a - b) && e > Math.abs(c - d)))
          v.push('Dreiecke mit der Diagonale gibt es nicht');
      }
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Spiegeln an einer Achse begründen (E)', () => {
  pflichttests(gfSpiegelnAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const x = w(i, 'x');
      const y = w(i, 'y');
      const p = w(i, 'achse') === 1 ? `(${z(x)}|${z(-y)})` : `(${z(-x)}|${z(y)})`;
      return wo(i, (t) => t.startsWith('Nein. Bei der Spiegelung') && t.endsWith(`P'${p}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Ecken und Kanten der Pyramide begründen (E)', () => {
  pflichttests(kpPyramideZaehlenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const n = w(i, 'n');
      const soll = w(i, 'art') === 1 ? `${n + 1} Ecken.` : `${2 * n} Kanten.`;
      return wo(i, (t) => t.startsWith('Nein.') && t.endsWith(soll));
    },
    mindestensVerschieden: { E: 10 },
  });
});

describe('Körper aus dem Aufriss begründen (E)', () => {
  pflichttests(kpZweitafelAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Auch')),
    mindestensVerschieden: { E: 10 },
  });
});

describe('Umkehrung eines Satzes begründen (E)', () => {
  pflichttests(krUmkehrungAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(w(i, 'satz') >= 3 ? 'Hier ja' : 'Nein. Die Umkehrung')),
    mindestensVerschieden: { E: 6 },
  });
});

describe('Lage des Umkreismittelpunkts begründen (E)', () => {
  pflichttests(krUmkreisAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const g = Math.max(w(i, 'alpha'), w(i, 'beta'), w(i, 'gamma'));
      if (g > 90) return wo(i, (t) => t.startsWith('Nein.') && t.includes('außerhalb'));
      if (g === 90) return wo(i, (t) => t.includes('rechtwinklig'));
      return wo(i, (t) => t.startsWith('Hier liegt er innen'));
    },
    grenzverletzungen(i) {
      const v = verschieden(i);
      const ws = [w(i, 'alpha'), w(i, 'beta'), w(i, 'gamma')];
      if (ws.some((x) => x <= 0) || ws.reduce((s, x) => s + x, 0) !== 180)
        v.push('keine Winkel eines Dreiecks');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Umfangs- und Mittelpunktswinkel begründen (E)', () => {
  pflichttests(krZentriAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Der Umfangswinkel') && t.endsWith(`= ${w(i, 'mittelpunkt') / 2}°.`),
      ),
    mindestensVerschieden: { E: 8 },
  });
});
