import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  kpKegelstumpfMasse,
  kpStumpfAussage,
  kpStumpfDifferenz,
  kpStumpfFormel,
  kpStumpfOberflaeche,
} from './stumpf';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const keine = () => [];
const zahl = (x: number, stellen = 1): Loesung => ({
  typ: 'zahl',
  wert: Math.round(x * 10 ** stellen) / 10 ** stellen,
});

describe('Stumpf als Differenz zweier Pyramiden', () => {
  pflichttests(kpStumpfDifferenz, {
    niveaus: { G: {} },
    // unabhängig: Stumpfformel mit G = a², D = a2² und Stumpfhöhe h − h2
    unabhaengigeLoesung(i) {
      const [a, h, a2, h2] = [w(i, 'a'), w(i, 'h'), w(i, 'ak'), w(i, 'hk')];
      return zahl(((h - h2) / 3) * (a * a + a * a2 + a2 * a2));
    },
    grenzverletzungen: (i) =>
      w(i, 'a') * w(i, 'hk') === w(i, 'ak') * w(i, 'h') ? [] : ['Spitze ist nicht ähnlich'],
    mindestensVerschieden: { G: 25 },
  });

  it('rechnet im letzten Schritt mit den eigenen Teilvolumen weiter', () => {
    const s = kpStumpfDifferenz.schritt?.(3, {}, 'stumpf', {
      gross: { typ: 'zahl', wert: 100 },
      klein: { typ: 'zahl', wert: 12 },
    });
    expect(s?.loesung).toEqual({ typ: 'zahl', wert: 88 });
  });
});

describe('Stumpfformel', () => {
  pflichttests(kpStumpfFormel, {
    niveaus: { M: {} },
    // unabhängig: Differenz der Pyramiden über die Ähnlichkeit (Spitze der Höhe x)
    unabhaengigeLoesung(i) {
      const [a, a2, h] = [w(i, 'a'), w(i, 'ad'), w(i, 'h')];
      const x = (h * a2) / (a - a2);
      return zahl((a * a * (h + x) - a2 * a2 * x) / 3);
    },
    grenzverletzungen: (i) => (w(i, 'ad') < w(i, 'a') ? [] : ['Deckfläche nicht kleiner']),
    mindestensVerschieden: { M: 40 },
  });
});

describe('Kegelstumpf: Masse', () => {
  pflichttests(kpKegelstumpfMasse, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const [R, r, h] = [w(i, 'rg'), w(i, 'rd'), w(i, 'h')];
      const x = (h * r) / (R - r);
      const v = (3.14 * (R * R * (h + x) - r * r * x)) / 3;
      // in Zehnteln: erst V auf eine Stelle, dann m = ρ · V auf ganze Gramm
      const zehntel = Math.round(w(i, 'dichte') * 10) * Math.round(v * 10);
      return { typ: 'zahl', wert: Math.round(zehntel / 100) };
    },
    grenzverletzungen: (i) => (w(i, 'rd') < w(i, 'rg') ? [] : ['Deckkreis nicht kleiner']),
    mindestensVerschieden: { M: 40 },
  });
});

describe('Pyramidenstumpf: Oberfläche', () => {
  pflichttests(kpStumpfOberflaeche, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const [a, a2, hs] = [w(i, 'a'), w(i, 'ad'), w(i, 'hs')];
      // Mantel als Differenz zweier Pyramidenmäntel ist zu umständlich: Trapez als Rechteck plus zwei Dreiecke
      const trapez = a2 * hs + (a - a2) * hs * 0.5;
      return zahl(a * a + a2 * a2 + 4 * trapez);
    },
    grenzverletzungen: keine,
    mindestensVerschieden: { M: 40 },
  });
});

describe('Stumpf ist nicht die halbe Pyramide (E)', () => {
  pflichttests(kpStumpfAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => {
      const z = w(i, 'zaehler');
      const n = w(i, 'nenner');
      return wo(
        i,
        (t) =>
          t.startsWith('Nein. Die Spitze ist') && t.includes(`{${n ** 3 - z ** 3}}{${n ** 3}}`),
      );
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 3 },
  });
});
