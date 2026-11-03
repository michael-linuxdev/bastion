import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { zfGegenereignisAussage, zfPfadAussage, zfZaehlenAussage } from './zufall-aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Zählprinzip begründen (E)', () => {
  pflichttests(zfZaehlenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const a = w(i, 'a'),
        b = w(i, 'b'),
        c = w(i, 'c');
      return wo(i, (t) => t.startsWith(`${a} · ${b} · ${c} = ${a * b * c},`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Pfadregel begründen (E)', () => {
  pflichttests(zfPfadAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const r = w(i, 'rot');
      const n = w(i, 'gesamt');
      return wo(i, (t) => t.startsWith(`${r}/${n} · ${r}/${n} = ${r * r}/${n * n},`));
    },
    mindestensVerschieden: { E: 5 },
  });
});

describe('Gegenereignis begründen (E)', () => {
  pflichttests(zfGegenereignisAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const k = w(i, 'k');
      const menge = Array.from({ length: k }, (_, j) => j + 1).join(', ');
      return wo(i, (t) => t.includes(`höchstens ${k}“, also {${menge}}`));
    },
    mindestensVerschieden: { E: 4 },
  });
});
