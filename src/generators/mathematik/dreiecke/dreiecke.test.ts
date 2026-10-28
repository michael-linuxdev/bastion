import { describe, expect, it } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  dreiecksart,
  dreiecksungleichung,
  innenwinkel,
  kongruenzsatz,
  konstruktionSchritt,
  linieErkennen,
  parallelenWinkel,
  schnittpunkt,
  viereckAussage,
  viereckName,
} from './dreiecke';

const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const Z = (i: Instanz, n: string) => i.platzhalter[n] as number;
const zahlen = (t: string) => [...t.matchAll(/\d+/g)].map((m) => Number(m[0]));
const option = (i: Instanz, text: string) =>
  (i.optionen ?? []).findIndex((o) => o.text?.de === text);

describe('Winkelsätze', () => {
  pflichttests(innenwinkel, {
    niveaus: { G: { gleichschenklig: false }, M: { gleichschenklig: true } },
    unabhaengigeLoesung(i) {
      const w = zahlen(T(i, 'angabe'));
      // gleichschenklig: beide Basiswinkel gleich
      const [a, b] = /gleichschenklig/.test(T(i, 'angabe'))
        ? [w[0] ?? 0, w[0] ?? 0]
        : [w[0] ?? 0, w[1] ?? 0];
      return { typ: 'zahl', wert: 180 - a - b };
    },
    grenzverletzungen: (i) =>
      i.loesung.typ === 'zahl' && i.loesung.wert >= 15 && i.loesung.wert <= 150
        ? []
        : ['γ außerhalb'],
    mindestensVerschieden: { G: 50, M: 50 },
  });

  pflichttests(parallelenWinkel, {
    niveaus: {
      G: { lagen: ['stufen', 'wechsel'] },
      M: { lagen: ['stufen', 'wechsel', 'ergaenzung-oben', 'ergaenzung-unten'] },
    },
    unabhaengigeLoesung(i) {
      // β liegt bei h; „links unten“ oder „rechts oben“ wie α (links unten) oder sein Gegenüber → gleich groß
      const lage = /β am Schnittpunkt mit h (\w+ \w+)/.exec(i.bild?.beschreibung.de ?? '')?.[1];
      const alpha = Z(i, 'alpha');
      return {
        typ: 'zahl',
        wert: lage === 'links unten' || lage === 'rechts oben' ? alpha : 180 - alpha,
      };
    },
    grenzverletzungen: (i) => (Z(i, 'alpha') >= 35 && Z(i, 'alpha') <= 80 ? [] : ['α außerhalb']),
    mindestensVerschieden: { G: 15, M: 30 },
  });
});

describe('Dreiecke', () => {
  pflichttests(dreiecksart, {
    niveaus: { G: { dritter_winkel: false }, M: { dritter_winkel: true } },
    unabhaengigeLoesung(i) {
      const t = T(i, 'angabe');
      const w = zahlen(t);
      if (t.includes('Seitenlängen')) {
        const verschieden = new Set(w).size;
        return { typ: 'auswahl', wert: verschieden === 1 ? 0 : verschieden === 2 ? 1 : 2 };
      }
      const alle = w.length === 2 ? [...w, 180 - (w[0] ?? 0) - (w[1] ?? 0)] : w;
      const gross = Math.max(...alle);
      return { typ: 'auswahl', wert: gross < 90 ? 0 : gross === 90 ? 1 : 2 };
    },
    grenzverletzungen(i) {
      const t = T(i, 'angabe');
      const w = zahlen(t);
      if (t.includes('Seitenlängen')) {
        const [a, b, c] = [...w].sort((x, y) => x - y);
        return (a ?? 0) + (b ?? 0) > (c ?? 0) ? [] : ['kein Dreieck'];
      }
      const alle = w.length === 2 ? [...w, 180 - (w[0] ?? 0) - (w[1] ?? 0)] : w;
      return alle.every((x) => x >= 10) && alle.reduce((s, x) => s + x, 0) === 180
        ? []
        : ['Winkel unstimmig'];
    },
    mindestensVerschieden: { G: 60, M: 60 },
  });

  pflichttests(dreiecksungleichung, {
    niveaus: { G: { grenzfall: false }, M: { grenzfall: true } },
    unabhaengigeLoesung(i) {
      const [a, b, c] = [Z(i, 'a'), Z(i, 'b'), Z(i, 'c')];
      const gibt = a + b > c && a + c > b && b + c > a;
      return { typ: 'auswahl', wert: gibt ? 0 : 1 };
    },
    grenzverletzungen: (i) =>
      ['a', 'b', 'c'].every((n) => Z(i, n) >= 1 && Z(i, n) <= 22) ? [] : ['Seite außerhalb'],
    mindestensVerschieden: { G: 60, M: 60 },
  });
});

describe('Vierecke', () => {
  const NAMEN: [string, string][] = [
    ['Alle vier Seiten sind gleich lang, und alle Winkel', 'Quadrat'],
    ['Alle Winkel sind rechte Winkel, aber', 'Rechteck'],
    ['Alle vier Seiten sind gleich lang, aber', 'Raute'],
    ['Gegenüberliegende Seiten sind parallel', 'Parallelogramm'],
    ['Nur zwei gegenüberliegende', 'Trapez'],
    ['Es gibt zwei Paare benachbarter', 'Drachenviereck'],
    ['Die Diagonalen sind gleich lang, halbieren sich und stehen senkrecht', 'Quadrat'],
    ['Die Diagonalen sind gleich lang und halbieren sich, stehen aber nicht', 'Rechteck'],
    ['Die Diagonalen halbieren sich und stehen senkrecht', 'Raute'],
    ['Die Diagonalen halbieren sich, sind aber weder', 'Parallelogramm'],
    ['Genau ein Paar', 'Trapez'],
    ['Eine Diagonale halbiert', 'Drachenviereck'],
  ];
  pflichttests(viereckName, {
    niveaus: { G: { diagonalen: false }, M: { diagonalen: true } },
    unabhaengigeLoesung(i) {
      const name = NAMEN.find(([anfang]) => T(i, 'beschreibung').startsWith(anfang))?.[1] ?? '';
      return { typ: 'auswahl', wert: option(i, name) };
    },
    grenzverletzungen: (i) => ((i.optionen ?? []).length === 6 ? [] : ['nicht sechs Vierecke']),
    mindestensVerschieden: { G: 6, M: 6 },
  });

  // Haus der Vierecke: ⊆-Beziehung unabhängig über Eigenschaften
  const EIGENSCHAFTEN: Record<string, readonly string[]> = {
    Quadrat: [
      'ein-paar-parallel',
      'zwei-paar-parallel',
      'rechte-winkel',
      'gleiche-seiten',
      'drachen',
    ],
    Rechteck: ['ein-paar-parallel', 'zwei-paar-parallel', 'rechte-winkel'],
    Raute: ['ein-paar-parallel', 'zwei-paar-parallel', 'gleiche-seiten', 'drachen'],
    Parallelogramm: ['ein-paar-parallel', 'zwei-paar-parallel'],
    Trapez: ['ein-paar-parallel'],
    Drachenviereck: ['drachen'],
  };
  pflichttests(viereckAussage, {
    niveaus: { G: { alle: false }, M: { alle: true } },
    unabhaengigeLoesung(i) {
      const x = T(i, 'x').split(' ')[1] ?? '';
      const y = T(i, 'y').split(' ')[1] ?? '';
      const jedes = (EIGENSCHAFTEN[y] ?? []).every((e) => (EIGENSCHAFTEN[x] ?? []).includes(e));
      return { typ: 'auswahl', wert: jedes ? 0 : 1 };
    },
    grenzverletzungen: (i) =>
      T(i, 'x').split(' ')[1] !== T(i, 'y').split(' ')[1] ? [] : ['gleiches Viereck'],
    mindestensVerschieden: { G: 10, M: 25 },
  });
});

describe('Konstruieren', () => {
  pflichttests(kongruenzsatz, {
    niveaus: { G: { ssw: false }, M: { ssw: true } },
    unabhaengigeLoesung(i) {
      const teile = T(i, 'angabe').split(', ');
      const seiten = teile.filter((t) => t.includes('cm'));
      const winkel = teile.filter((t) => t.includes('°'));
      if (seiten.length === 3) return { typ: 'auswahl', wert: option(i, 'sss') };
      if (seiten.length === 1) return { typ: 'auswahl', wert: option(i, 'wsw') };
      // zwei Seiten: eingeschlossen, wenn der Winkel zu keiner der beiden Seiten „gehört“
      const namen = seiten.map((s) => s[0]);
      const w = winkel[0] ?? '';
      const gegenueber = { α: 'a', β: 'b', γ: 'c' }[w[0] as 'α' | 'β' | 'γ'];
      if (!namen.includes(gegenueber)) return { typ: 'auswahl', wert: option(i, 'sws') };
      const laenge = (n: string) => zahlen(seiten.find((s) => s.startsWith(n)) ?? '')[0] ?? 0;
      const andere = namen.find((n) => n !== gegenueber) ?? '';
      return {
        typ: 'auswahl',
        wert: option(
          i,
          laenge(gegenueber) > laenge(andere) ? 'SsW' : 'nicht eindeutig konstruierbar',
        ),
      };
    },
    grenzverletzungen: (i) =>
      T(i, 'angabe').split(', ').length === 3 ? [] : ['nicht drei Angaben'],
    mindestensVerschieden: { G: 60, M: 70 },
  });

  const SCHRITTE: Record<string, string[]> = {
    'a, b und c': [
      'Zeichne die Seite c = AB.',
      'Zeichne einen Kreisbogen um A mit dem Radius b.',
      'Zeichne einen Kreisbogen um B mit dem Radius a.',
      'Der Schnittpunkt der Kreisbögen ist C. Verbinde C mit A und B.',
    ],
    'a, b und γ': [
      'Zeichne die Seite b = AC.',
      'Trage in C den Winkel γ an AC an.',
      'Trage auf dem freien Schenkel von C aus die Länge a ab. Dort liegt B.',
      'Verbinde B mit A.',
    ],
    'c, α und β': [
      'Zeichne die Seite c = AB.',
      'Trage in A den Winkel α an AB an.',
      'Trage in B den Winkel β an AB an.',
      'Der Schnittpunkt der freien Schenkel ist C.',
    ],
  };
  pflichttests(konstruktionSchritt, {
    niveaus: { G: { saetze: ['sss'] }, M: { saetze: ['sss', 'sws', 'wsw'] } },
    unabhaengigeLoesung(i) {
      const gegeben = /aus (.+)\.$/.exec(T(i, 'satz'))?.[1] ?? '';
      const fertig = (T(i, 'bisher').match(/\d\. /g) ?? []).length;
      return { typ: 'auswahl', wert: option(i, SCHRITTE[gegeben]?.[fertig] ?? '') };
    },
    grenzverletzungen: (i) => ((i.optionen ?? []).length >= 3 ? [] : ['zu wenige Optionen']),
    mindestensVerschieden: { G: 10, M: 25 },
  });

  pflichttests(linieErkennen, {
    niveaus: {
      G: { linien: ['Höhe', 'Seitenhalbierende'] },
      M: { linien: ['Höhe', 'Seitenhalbierende', 'Winkelhalbierende', 'Mittelsenkrechte'] },
    },
    unabhaengigeLoesung(i) {
      const d = i.bild?.beschreibung.de ?? '';
      const art = d.includes('senkrecht auf die Seite')
        ? 'Höhe'
        : d.includes('zur Mitte')
          ? 'Seitenhalbierende'
          : d.includes('teilt den Winkel')
            ? 'Winkelhalbierende'
            : 'Mittelsenkrechte';
      return { typ: 'auswahl', wert: option(i, art) };
    },
    grenzverletzungen: (i) => (i.bild ? [] : ['kein Bild']),
    mindestensVerschieden: { G: 50, M: 50 },
  });

  pflichttests(schnittpunkt, {
    niveaus: {
      G: { linien: ['Mittelsenkrechte', 'Winkelhalbierende'] },
      M: { linien: ['Mittelsenkrechte', 'Winkelhalbierende', 'Seitenhalbierende', 'Höhe'] },
    },
    unabhaengigeLoesung(i) {
      const l = T(i, 'linie');
      const punkt = l.includes('Mittelsenkrechten')
        ? 'Mittelpunkt des Umkreises'
        : l.includes('Winkelhalbierenden')
          ? 'Mittelpunkt des Inkreises'
          : l.includes('Seitenhalbierenden')
            ? 'Schwerpunkt'
            : 'Höhenschnittpunkt';
      return { typ: 'auswahl', wert: option(i, punkt) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 2, M: 4 },
  });
});

describe('Einzelfälle', () => {
  it('SsW-Fall mit kürzerer Seite hat wirklich zwei Lösungen', () => {
    for (let s = 0; s < 3000; s++) {
      const i = kongruenzsatz.erzeuge(s, { ssw: true });
      if (i.loesung.typ !== 'auswahl' || i.loesung.wert !== 4) continue;
      const t = T(i, 'angabe');
      const a = Number(/a = (\d+)/.exec(t)?.[1]);
      const b = Number(/b = (\d+)/.exec(t)?.[1]);
      const alpha = Number(/α = (\d+)/.exec(t)?.[1]);
      expect(a).toBeLessThan(b);
      expect(b * Math.sin((alpha * Math.PI) / 180)).toBeLessThan(a);
    }
  });
});
