import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  pzGrundwertAussage,
  pzGrundwertBegriffAussage,
  pzUmAufAussage,
  pzZeitraumAussage,
} from './aussagen7';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Grundwert im Text begründen (E)', () => {
  pflichttests(pzGrundwertBegriffAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`${w(i, 'grund')}, denn der Grundwert ist das Ganze`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Grundwert berechnen begründen (E)', () => {
  pflichttests(pzGrundwertAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const g = (w(i, 'wert') * 100) / w(i, 'prozent');
      return wo(i, (t) => t.startsWith('Nein. Gesucht') && t.endsWith(`= ${g} €.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('„um“ und „auf“ begründen (E)', () => {
  pflichttests(pzUmAufAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const p = ((w(i, 'neu') - w(i, 'alt')) / w(i, 'alt')) * 100;
      return wo(i, (t) => t.includes(`Gestiegen ist er um ${Math.round(p)} %`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Zinsen für Monate begründen (E)', () => {
  pflichttests(pzZeitraumAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const z = (w(i, 'kapital') * w(i, 'zinssatz') * w(i, 'monate')) / 1200;
      return wo(i, (t) => t.startsWith('Nein. Der Zinssatz') && t.endsWith(` = ${z} €.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});
