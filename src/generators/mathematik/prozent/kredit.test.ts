import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { pzEffektivAussage, pzSparplan, pzTilgung } from './kredit';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const euro = (x: number): Loesung => ({ typ: 'zahl', wert: Number(x.toFixed(2)) });
/** auf Cent runden, unabhängig über toFixed */
const cent = (x: number) => Number((Math.round(x * 100) / 100).toFixed(2));

describe('Sparplan', () => {
  pflichttests(pzSparplan, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      // in Cent und mit ganzzahligem Faktor (1000 + 10p)/1000
      let k = 0;
      for (let j = 0; j < 3; j++)
        k = Math.round(((k + 100 * w(i, 'rate')) * (1000 + 10 * w(i, 'p'))) / 1000);
      return euro(k / 100);
    },
    grenzverletzungen: (i) => (w(i, 'p') > 0 && w(i, 'p') <= 3 ? [] : ['Zinssatz unüblich']),
    mindestensVerschieden: { G: 40 },
  });

  it('rechnet mit dem eigenen Stand des Vorjahres weiter', () => {
    const i = pzSparplan.erzeuge(7, {});
    const s = pzSparplan.schritt?.(7, {}, 'jahr2', { jahr1: { typ: 'zahl', wert: 1000 } });
    const erwartet =
      Math.round(((100000 + 100 * w(i, 'rate')) * (1000 + 10 * w(i, 'p'))) / 1000) / 100;
    expect(s?.loesung).toEqual({ typ: 'zahl', wert: erwartet });
  });
});

describe('Tilgung', () => {
  pflichttests(pzTilgung, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      let s = w(i, 'kredit');
      for (let j = 0; j < 2; j++) s = cent(s + cent((s * w(i, 'p')) / 100) - w(i, 'rate'));
      return euro(s);
    },
    grenzverletzungen: (i) =>
      w(i, 'rate') > (w(i, 'kredit') * w(i, 'p')) / 100 ? [] : ['Rate deckt die Zinsen nicht'],
    mindestensVerschieden: { M: 40 },
  });
});

describe('Effektive Kosten vergleichen (E)', () => {
  pflichttests(pzEffektivAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein.')),
    grenzverletzungen: (i) => {
      const a = (w(i, 'kredit') * w(i, 'pa')) / 100 + w(i, 'gebuehr');
      const b = (w(i, 'kredit') * w(i, 'pb')) / 100;
      return [...verschieden(i), ...(a > b ? [] : ['A ist nicht teurer'])];
    },
    mindestensVerschieden: { E: 30 },
  });
});
