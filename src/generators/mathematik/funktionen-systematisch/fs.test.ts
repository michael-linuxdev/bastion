import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  GRUND,
  fsEigenschaft,
  fsFolgeEigenschaft,
  fsFolgeGlied,
  fsKlasseAussage,
  fsKonvergentAussage,
  fsLueckeAussage,
  fsReihenfolgeAussage,
  fsTermAusGraph,
  fsVerkettung,
  fsVerkettungWert,
  fsWirkung,
  fsZuordnen,
  type Grund,
} from './fs';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const s = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const ARTEN = Object.keys(GRUND) as Grund[];

describe('Graph zuordnen (G)', () => {
  pflichttests(fsZuordnen, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const g = ARTEN[w(i, 'art')] ?? 'x';
      return wo(i, (t) => t === `$y = ${GRUND[g].tex}$`);
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 30 },
  });

  it('die Bildbeschreibung nennt Punkte, nicht den Namen', () => {
    const i = fsZuordnen.erzeuge(4, {});
    expect(i.bild?.beschreibung.de).toMatch(/^Ein Graph durch die Punkte/);
    expect(i.bild?.beschreibung.de).not.toMatch(/Parabel|Wurzel|Sinus|Hyperbel/);
  });
});

describe('Eigenschaften (M)', () => {
  pflichttests(fsEigenschaft, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // die richtige Aussage prüft man an der Funktion: Für jede gilt ein anderes Merkmal
      const g = ARTEN[w(i, 'art')] ?? 'x';
      const merkmal: Record<Grund, RegExp> = {
        x: /^Der Graph ist punktsymmetrisch zum Ursprung und hat/,
        x2: /^Der Wertebereich ist \$y \\geq 0\$, der Graph ist achsensymmetrisch/,
        x3: /^Der Graph ist punktsymmetrisch zum Ursprung, jede reelle/,
        wurzel: /^Man darf nur \$x \\geq 0\$ einsetzen, und alle/,
        kehrwert: /^Bei \$x = 0\$ ist die Funktion nicht definiert/,
        exp: /^Alle Werte sind positiv/,
        sin: /^Die Werte liegen zwischen −1 und 1/,
      };
      return wo(i, (t) => merkmal[g].test(t));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { M: 30 },
  });
});

describe('Aussagen über Funktionsklassen (E)', () => {
  pflichttests(fsKlasseAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      // (1|1) liegt auf jeder Potenzfunktion; (0|0) nicht auf 1/x; a^x ist nie 0
      const stimmt = [1 ** -3 === 1, false, false][w(i, 'art')];
      return wo(i, (t) => (stimmt ? t.startsWith('Ja. $1^n') : t.startsWith('Nein. $')));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });
});

describe('Wirkung einer Transformation (G)', () => {
  pflichttests(fsWirkung, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const art = w(i, 'art');
      const c = w(i, 'c');
      const erwartet = [
        `um ${Math.abs(c)} nach ${c > 0 ? 'oben' : 'unten'} verschoben`,
        `um ${Math.abs(c)} nach ${c > 0 ? 'links' : 'rechts'} verschoben`,
        `in y-Richtung mit dem Faktor ${c} gestreckt`,
        `in x-Richtung mit dem Faktor $\\frac{1}{${c}}$ gestaucht`,
      ][art];
      return wo(i, (t) => t.endsWith(` wird ${erwartet}.`));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 40 },
  });
});

describe('Term aus dem Graphen (M)', () => {
  pflichttests(fsTermAusGraph, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const d = w(i, 'd');
      const e = w(i, 'e');
      // Der richtige Term ist 0, wenn man x = d einsetzt und e abzieht
      const passt = (t: string) =>
        t.includes(`x ${d > 0 ? '-' : '+'} ${Math.abs(d)}`) &&
        t.endsWith(`${e > 0 ? '+' : '-'} ${Math.abs(e)}$`);
      return wo(i, passt);
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { M: 30 },
  });
});

describe('Reihenfolge der Abbildungen (E)', () => {
  pflichttests(fsReihenfolgeAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith(`Um ${w(i, 'd')} nach rechts`)),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Innere und äußere Funktion (G)', () => {
  pflichttests(fsVerkettung, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      // die innere Funktion steht in Klammer, Wurzel, Hochzahl oder Sinus-Argument
      const term = s(i, 'term');
      const innen =
        /\(([^()]+)\)\^/.exec(term)?.[1] ??
        /\\sqrt\{([^}]+)\}/.exec(term)?.[1] ??
        /\\sin\(([^)]+)\)/.exec(term)?.[1] ??
        /e\^\{([^}]+)\}/.exec(term)?.[1] ??
        '';
      return wo(i, (t) => t.startsWith(`innen $${innen}$`));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 40 },
  });
});

describe('Wert einer Verkettung (M)', () => {
  pflichttests(fsVerkettungWert, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const innen = w(i, 'm') * w(i, 'a') + w(i, 'b');
      return { typ: 'zahl', wert: innen ** 2 + w(i, 'k') };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 60 },
  });
});

describe('Definitionslücke eines Quotienten (E)', () => {
  pflichttests(fsLueckeAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) =>
      wo(i, (t) => t.startsWith(`Nein. Bei $x = ${w(i, 'n')}$ ist $g(x) = 0$`)),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Glieder einer Folge (G)', () => {
  pflichttests(fsFolgeGlied, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const geo = s(i, 'satz').includes('das vorige mal');
      let x = w(i, 'a1');
      for (let k = 2; k <= w(i, 'n'); k++) x = geo ? x * w(i, 'd') : x + w(i, 'd');
      return { typ: 'zahl', wert: x };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 80 },
  });
});

describe('Eigenschaften von Folgen (M)', () => {
  pflichttests(fsFolgeEigenschaft, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // erste Glieder ansehen: monoton? beschränkt?
      const glied = [
        (n: number) => 1 / n,
        (n: number) => (-1) ** n,
        (n: number) => 2 ** n,
        (n: number) => n / (n + 1),
      ][w(i, 'art')];
      const a = [1, 2, 3, 4, 5].map((n) => glied?.(n) ?? 0);
      const steigt = a.every((x, k) => k === 0 || x > (a[k - 1] ?? 0));
      const faellt = a.every((x, k) => k === 0 || x < (a[k - 1] ?? 0));
      const wort = steigt ? 'steigend' : faellt ? 'fallend' : 'beschränkt, aber nicht konvergent';
      return wo(i, (t) => t.startsWith(`Die Folge ist ${wort}`) && !t.includes('denn'));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { M: 12 },
  });
});

describe('„Beschränkt, also konvergent?“ (E)', () => {
  pflichttests(fsKonvergentAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein.')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });
});
