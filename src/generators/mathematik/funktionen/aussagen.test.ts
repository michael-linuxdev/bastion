import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  fkAchsenabschnittAussage,
  fkAnstiegAussage,
  fkFunktionAussage,
  fkNullstelleAussage,
  fkSteigenAussage,
  fkTarifAussage,
} from './aussagen';

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

describe('Funktion oder nicht (E)', () => {
  pflichttests(fkFunktionAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        w(i, 'doppeltesx') ? t.startsWith('Nein. Zu x = 2') : t.startsWith('Ja. Jedes x'),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Steigen oder fallen (E)', () => {
  pflichttests(fkSteigenAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.endsWith(w(i, 'm') > 0 ? 'Der Graph steigt.' : 'Der Graph fällt.') &&
          t.startsWith('Nein.'),
      ),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Anstieg aus zwei Punkten (E)', () => {
  pflichttests(fkAnstiegAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const m = (w(i, 'y2') - w(i, 'y1')) / (w(i, 'x2') - w(i, 'x1'));
      return wo(i, (t) => t.startsWith('Nein. Der Anstieg') && t.endsWith(`= ${z(m)}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Nullstelle (E)', () => {
  pflichttests(fkNullstelleAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.endsWith(`f(x) = 0: x = ${z(-w(i, 'n') / w(i, 'm'))}.`)),
    mindestensVerschieden: { E: 20 },
  });
});

describe('y-Achsenabschnitt (E)', () => {
  pflichttests(fkAchsenabschnittAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`Nein. Bei x = 0 ist y = ${z(w(i, 'n'))}.`)),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Tarif mit Grundgebühr (E)', () => {
  pflichttests(fkTarifAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) =>
        t.includes(
          `= ${w(i, 'grund') + w(i, 'preis') * w(i, 'km')} €, denn die Grundgebühr zahlt man einmal`,
        ),
      ),
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      const zahlen = texte(i).map((t) => /= (\d+) €/.exec(t)?.[1]);
      if (new Set(zahlen).size !== zahlen.length) v.push('zwei gleiche Beträge');
      return v;
    },
    mindestensVerschieden: { E: 30 },
  });
});
