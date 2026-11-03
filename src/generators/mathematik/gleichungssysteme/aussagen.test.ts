import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { gsEinsetzenAussage, gsLoesbarkeitAussage, gsSachAussage } from './aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Lösbarkeit eines Gleichungssystems begründen (E)', () => {
  pflichttests(gsLoesbarkeitAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const m1 = w(i, 'm1'),
        n1 = w(i, 'n1'),
        m2 = w(i, 'm2'),
        n2 = w(i, 'n2');
      if (m1 === m2) return wo(i, (t) => t.startsWith('Keine Lösung: Beide'));
      const x = (n2 - n1) / (m1 - m2);
      const z = (v: number) => (v < 0 ? `−${-v}` : String(v));
      return wo(i, (t) => t.endsWith(`(${z(x)}|${z(m1 * x + n1)}).`));
    },
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      if (w(i, 'm1') === w(i, 'm2') && w(i, 'n1') === w(i, 'n2')) v.push('gleiche Geraden');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Einsetzen begründen (E)', () => {
  pflichttests(gsEinsetzenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a'),
        b = w(i, 'b'),
        c = w(i, 'c'),
        d = w(i, 'd');
      const x = (d - b) / (a + c);
      return wo(
        i,
        (t) => t.startsWith(`${c} · x + (${a} · x + ${b}) = ${d}`) && t.endsWith(`x = ${x}.`),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Gleichungssystem zur Sachaufgabe begründen (E)', () => {
  pflichttests(gsSachAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const n = w(i, 'personen'),
        pk = w(i, 'kind'),
        pe = w(i, 'erwachsen'),
        s = w(i, 'summe');
      return wo(i, (t) => t.startsWith(`k + e = ${n} und ${pk} · k + ${pe} · e = ${s}:`));
    },
    mindestensVerschieden: { E: 30 },
  });
});
