import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  brAnteilAussage,
  brAusklammernAussage,
  brKehrwertAussage,
  brKommaDivisionAussage,
  brMalZahlAussage,
  brMengenAussage,
  brNennerAussage,
  brNennerAussageV1,
  brPeriodeAussage,
  brSachAussage,
} from './aussagen6';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const ggT = (a: number, b: number): number => (b === 0 ? a : ggT(b, a % b));
const kurz = (z: number, n: number) => `${z / ggT(z, n)}/${n / ggT(z, n)}`;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const E = { niveaus: { E: {} }, grenzverletzungen: verschieden };

describe('Brüche addieren begründen (E)', () => {
  pflichttests(brNennerAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [p, a, q, b] = [w(i, 'p'), w(i, 'a'), w(i, 'q'), w(i, 'b')];
      return wo(i, (t) => t.startsWith('Nein. Erst') && t.endsWith(`= ${p * b + q * a}/${a * b}.`));
    },
    mindestensVerschieden: { E: 30 },
  });
  it('Fassung 2 sagt „gemeinsamer Nenner“, Fassung 1 bleibt für gespeicherte Aufgaben', () => {
    expect([brNennerAussageV1.version, brNennerAussage.version]).toEqual([1, 2]);
    for (let s = 1; s <= 30; s++) {
      const i = brNennerAussage.erzeuge(s, {});
      const alles = [...texte(i), ...i.loesungsweg.map((x) => x.de)].join(' ');
      expect(alles).toContain('gemeinsamen Nenner');
      expect(alles).not.toMatch(/gleichnamig|Hauptnenner/);
      expect(texte(brNennerAussageV1.erzeuge(s, {})).join(' ')).toContain('gleichnamig');
    }
  });
});

describe('Anteile vergleichen begründen (E)', () => {
  pflichttests(brAnteilAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Es zählt der Anteil')),
    grenzverletzungen(i) {
      const v = verschieden(i);
      const [r1, n1, r2, n2] = [w(i, 'r1'), w(i, 'n1'), w(i, 'r2'), w(i, 'n2')];
      if (!(r2 > r1 && r1 * n2 > r2 * n1))
        v.push('B muss mehr Felder, aber den kleineren Anteil haben');
      return v;
    },
    mindestensVerschieden: { E: 15 },
  });
});

describe('Durch eine Dezimalzahl teilen begründen (E)', () => {
  pflichttests(brKommaDivisionAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith('Nein. Beide') && t.includes(`: ${w(i, 'c')} = ${w(i, 'k')}.`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Kehrwert beim Teilen begründen (E)', () => {
  pflichttests(brKehrwertAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const [a, b, c, d] = [w(i, 'a'), w(i, 'b'), w(i, 'c'), w(i, 'd')];
      return wo(
        i,
        (t) => t.startsWith('Nein. Man nimmt') && t.endsWith(`= ${kurz(a * d, b * c)}.`),
      );
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Natürliche Zahlen als Brüche begründen (E)', () => {
  pflichttests(brMengenAussage, {
    ...E,
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith(`Nein. ${w(i, 'n')} = ${w(i, 'n')}/1`)),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Bruch mal Zahl begründen (E)', () => {
  pflichttests(brMalZahlAussage, {
    ...E,
    unabhaengigeLoesung: (i) =>
      wo(
        i,
        (t) =>
          t.startsWith(`${w(i, 'a') * w(i, 'k')}/${w(i, 'b')}`) && t.includes('Nur der Zähler'),
      ),
    mindestensVerschieden: { E: 30 },
  });
});

describe('Endlich oder periodisch begründen (E)', () => {
  pflichttests(brPeriodeAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      let n = w(i, 'n');
      while (n % 2 === 0) n /= 2;
      while (n % 5 === 0) n /= 5;
      return wo(
        i,
        (t) =>
          t.startsWith(n === 1 ? 'Nein. ' : 'Das Ergebnis stimmt') &&
          !t.includes(',' + w(i, 'n') + ', das'),
      );
    },
    mindestensVerschieden: { E: 12 },
  });
});

describe('Ausklammern begründen (E)', () => {
  pflichttests(brAusklammernAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const s = Math.round(w(i, 'b') + w(i, 'c'));
      return wo(i, (t) => t.includes(`= ${w(i, 'a')} · ${s} = ${w(i, 'a') * s}, denn`));
    },
    mindestensVerschieden: { E: 30 },
  });
});

describe('Rückgeld beim Einkauf begründen (E)', () => {
  pflichttests(brSachAussage, {
    ...E,
    unabhaengigeLoesung(i) {
      const cent = (w(i, 'm1') * w(i, 'p1')) / 10 + w(i, 'm2') * w(i, 'p2');
      const rueck = ((2000 - cent) / 100).toFixed(2).replace('.', ',');
      return wo(i, (t) => t.startsWith(`${rueck} €, denn der Einkauf`));
    },
    mindestensVerschieden: { E: 30 },
  });
});
