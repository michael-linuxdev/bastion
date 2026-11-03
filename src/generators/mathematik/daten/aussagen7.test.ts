import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { daAchseAussage, zfChanceAussage, zfEreignisAussage } from './aussagen7';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Diagramm mit abgeschnittener Achse begründen (E)', () => {
  pflichttests(daAchseAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        t.startsWith(
          `Nein. B ist ${w(i, 'b')}, A ist ${w(i, 'a')}: B ist nur ${w(i, 'b') - w(i, 'a')} größer.`,
        ),
      ),
    mindestensVerschieden: { E: 15 },
  });
});

describe('Ereignis als Menge begründen (E)', () => {
  pflichttests(zfEreignisAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const k = w(i, 'k');
      const tests = [
        (x: number) => x % 2 === 0,
        (x: number) => x % 2 === 1,
        (x: number) => x > k,
        (x: number) => x < k,
        (x: number) => x % 3 === 0,
      ];
      const a = [1, 2, 3, 4, 5, 6].filter(tests[w(i, 'art')] ?? (() => false));
      return wo(i, (t) => t.includes(`Menge von Ergebnissen: A = {${a.join(', ')}}.`));
    },
    mindestensVerschieden: { E: 10 },
  });
});

describe('Chancen über den Anteil begründen (E)', () => {
  pflichttests(zfChanceAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Es zählt der Anteil')),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const r1 = w(i, 'rot1');
      const n1 = w(i, 'gesamt1');
      const r2 = w(i, 'rot2');
      const n2 = w(i, 'gesamt2');
      if (!(r1 > r2 && r1 * n2 < r2 * n1))
        v.push('A muss mehr rote, aber den kleineren Anteil haben');
      if (!(n1 - r1 > n2 - r2)) v.push('A muss mehr blaue haben');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});
