import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { daMittelwertAussage } from './aussagen5';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];

describe('Durchschnitt begründen (E)', () => {
  pflichttests(daMittelwertAussage, {
    niveaus: { E: {} },
    grenzverletzungen: verschieden,
    unabhaengigeLoesung(i) {
      const noten = [1, 2, 3, 4, 5].map((k) => w(i, `n${k}`)).filter((x) => x > 0);
      const s = noten.reduce((a, b) => a + b, 0);
      return wo(
        i,
        (t) => t.startsWith('Nein. Jede Note') && t.endsWith(`= ${dez(s / noten.length)}.`),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});
