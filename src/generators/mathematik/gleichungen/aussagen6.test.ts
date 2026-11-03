import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { glUmkehrAussage } from './aussagen6';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];

describe('Umkehraufgabe bei Gleichungen begründen (E)', () => {
  pflichttests(glUmkehrAussage, {
    niveaus: { E: {} },
    grenzverletzungen: verschieden,
    unabhaengigeLoesung(i) {
      const x = (w(i, 'c') + w(i, 'a')) / w(i, 'k');
      return wo(i, (t) => t.startsWith('Nein. Minus') && t.endsWith(`= ${dez(x)}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});
