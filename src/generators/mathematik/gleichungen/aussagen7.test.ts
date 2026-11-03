import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { glFormelAussage, glLoesenAussage, glProbeAussage, glTextAussage } from './aussagen7';

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

describe('Gleichung zum Zahlenrätsel begründen (E)', () => {
  pflichttests(glTextAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`${w(i, 'a')} · x − ${w(i, 'b')} = ${w(i, 'c')}, denn zuerst`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Formel umstellen begründen (E)', () => {
  pflichttests(glFormelAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const ab = w(i, 'a') * w(i, 'b');
      return wo(i, (t) => t.endsWith(`= ${w(i, 'volumen')} : ${ab} = ${w(i, 'volumen') / ab} cm.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Lösen bis zum Ende begründen (E)', () => {
  pflichttests(glLoesenAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const x = (w(i, 'd') - w(i, 'b')) / w(i, 'a');
      return wo(i, (t) => t.startsWith('Nein. Er muss noch') && t.endsWith(`= ${x}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Probe mit negativer Zahl begründen (E)', () => {
  pflichttests(glProbeAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const k = w(i, 'k');
      const wert = w(i, 'a') * -k + w(i, 'b');
      return wo(i, (t) => t.includes(`+ ${w(i, 'b')} = ${z(wert)}. Beide Seiten`));
    },
    grenzverletzungen(i) {
      const v = verschieden(i);
      if (w(i, 'a') * -w(i, 'k') + w(i, 'b') !== w(i, 'c')) v.push('x = −k ist keine Lösung');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});
