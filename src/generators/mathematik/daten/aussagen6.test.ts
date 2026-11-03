import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { kdWinkelAussage, zfRelativAussage } from './aussagen6';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Winkel im Kreisdiagramm begründen (E)', () => {
  pflichttests(kdWinkelAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith('Nein. Der ganze Kreis') && t.endsWith(`= ${dez(w(i, 'prozent') * 3.6)}°.`),
      ),
    mindestensVerschieden: { E: 10 },
  });
});

describe('Relative Häufigkeit in Prozent begründen (E)', () => {
  pflichttests(zfRelativAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`${(w(i, 'k') * 100) / w(i, 'n')} %, denn relative`)),
    mindestensVerschieden: { E: 15 },
  });
});
