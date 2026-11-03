import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  erstesN,
  exAsymptoteAussage,
  exBestand,
  exEigenschaft,
  exFaktor,
  exGraphWaehlen,
  exModellAussage,
  exModellgrenzeAussage,
  exVerdopplung,
  exWachstumArt,
} from './wachstum';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const s = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];

/** y-Werte aus der KaTeX-Tabelle lesen */
function ysAus(tex: string): number[] {
  const zeile = /y & (.*) \\end\{array\}/.exec(tex)?.[1] ?? '';
  return zeile.split(' & ').map((z) => Number(z.replace('{,}', '.')));
}
/** Art unabhängig: Differenzen bzw. Quotienten vergleichen, mit Toleranz */
function art(ys: number[]): string {
  const nah = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  const d = ys.slice(1).map((y, k) => y - (ys[k] ?? 0));
  if (d.every((x) => nah(x, d[0] ?? 0))) return 'linear';
  const q = ys.slice(1).map((y, k) => y / (ys[k] ?? 1));
  if (q.every((x) => nah(x, q[0] ?? 0))) return 'exponentiell';
  return 'weder';
}

describe('Wachstumsart aus der Tabelle', () => {
  pflichttests(exWachstumArt, {
    niveaus: { G: { weder: false }, M: { weder: true } },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith(art(ysAus(s(i, 'tabelle'))))),
    grenzverletzungen(i) {
      const f = verschieden(i);
      if (ysAus(s(i, 'tabelle')).some((y) => !(y >= 0))) f.push('negativer Wert');
      return f;
    },
    mindestensVerschieden: { G: 40, M: 40 },
  });
});

describe('Wachstumsfaktor und Bestand', () => {
  pflichttests(exFaktor, {
    niveaus: { G: { abnahme: false }, M: { abnahme: true } },
    unabhaengigeLoesung(i) {
      const ab = s(i, 'satz').includes('nimmt');
      let x = w(i, 'bestand');
      for (let k = 0; k < w(i, 'jahre'); k++) x += ((ab ? -1 : 1) * x * w(i, 'prozent')) / 100;
      return { typ: 'zahl', wert: Math.round(x * 1e6) / 1e6 };
    },
    grenzverletzungen: (i, p) =>
      !p.abnahme && s(i, 'satz').includes('nimmt') ? ['Abnahme auf Niveau G'] : [],
    mindestensVerschieden: { G: 25, M: 40 },
  });

  it('Zwischenschritt Faktor', () => {
    const i = exFaktor.erzeuge(3, { abnahme: true });
    const ab = s(i, 'satz').includes('nimmt');
    expect(exFaktor.schritt?.(3, { abnahme: true }, 'faktor', {}).loesung).toEqual({
      typ: 'zahl',
      wert: 1 + ((ab ? -1 : 1) * w(i, 'prozent')) / 100,
    });
    expect(exFaktor.schritt?.(3, { abnahme: true }, 'wert', {}).loesung).toEqual(i.loesung);
  });
});

describe('Modell begründen (E)', () => {
  pflichttests(exModellAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const ys = [w(i, 'y0'), w(i, 'y1'), w(i, 'y2'), w(i, 'y3')];
      return wo(
        i,
        (t) =>
          t.startsWith('Nein.') &&
          t.endsWith(art(ys) === 'linear' ? 'Das ist linear.' : 'Das ist exponentiell.'),
      );
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 30 },
  });
});

describe('Graph und Term zuordnen', () => {
  pflichttests(exGraphWaehlen, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const c = w(i, 'c');
      const a = w(i, 'a');
      // Zwei Punkte des Graphen nachrechnen: f(0) = c, f(1) = c · a
      return wo(i, (t) => {
        const m =
          /^\$f\(x\) = (?:(\d+) \\cdot )?(?:\\left\()?(\\frac\{1\}\{(\d)\}|\d+)(?:\\right\))?\^\{x\}\$$/.exec(
            t,
          );
        if (!m) return false;
        const cc = m[1] ? Number(m[1]) : 1;
        const aa = m[3] ? 1 / Number(m[3]) : Number(m[2]);
        return cc === c && Math.abs(cc * aa - c * a) < 1e-9;
      });
    },
    grenzverletzungen: (i) => {
      const f = verschieden(i);
      if (!i.bild) f.push('Graph fehlt');
      return f;
    },
    mindestensVerschieden: { G: 8 },
  });
});

describe('Eigenschaften der Exponentialfunktion', () => {
  pflichttests(exEigenschaft, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const art = w(i, 'art');
      const a = w(i, 'a');
      return wo(i, (t) =>
        art === 0
          ? t.startsWith(`Der Graph schneidet die y-Achse bei ${w(i, 'c')},`)
          : art === 1
            ? t.startsWith(`Der Graph ${a > 1 ? 'steigt' : 'fällt'}, denn $a`)
            : t.startsWith('Der Graph kommt der x-Achse'),
      );
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { M: 20 },
  });
});

describe('Asymptote begründen (E)', () => {
  pflichttests(exAsymptoteAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. Eine Potenz')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 10 },
  });
});

describe('Bestand bei Verdopplung und Halbierung', () => {
  pflichttests(exBestand, {
    niveaus: { G: { zerfall: false }, M: { zerfall: true } },
    unabhaengigeLoesung(i) {
      const halb = /Hälfte|Halbwertszeit/.test(s(i, 'satz'));
      let x = w(i, 'anfang');
      for (let k = 0; k < w(i, 'schritte'); k++) x = halb ? x / 2 : x * 2;
      return { typ: 'zahl', wert: x };
    },
    grenzverletzungen: (i) =>
      Number.isInteger((i.loesung as { wert: number }).wert) ? [] : ['Ergebnis nicht ganz'],
    mindestensVerschieden: { G: 40, M: 60 },
  });
});

describe('Verdopplungs- und Halbwertszeit', () => {
  pflichttests(exVerdopplung, {
    niveaus: { G: { abnahme: false }, M: { abnahme: true } },
    unabhaengigeLoesung(i) {
      const ab = w(i, 'abnahme') === 1;
      const q = 1 + ((ab ? -1 : 1) * w(i, 'prozent')) / 100;
      // unabhängig über den Logarithmus
      const n = Math.ceil(Math.log(ab ? 0.5 : 2) / Math.log(q) - 1e-12);
      return { typ: 'zahl', wert: n };
    },
    grenzverletzungen: (i, p) =>
      !p.abnahme && w(i, 'abnahme') === 1 ? ['Abnahme auf Niveau G'] : [],
    mindestensVerschieden: { G: 6, M: 10 },
  });

  it('erstesN stimmt an bekannten Werten', () => {
    expect(erstesN(1.1, false)).toBe(8);
    expect(erstesN(2, false)).toBe(1);
    expect(erstesN(0.9, true)).toBe(7);
  });
});

describe('Grenzen des Modells (E)', () => {
  pflichttests(exModellgrenzeAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith(`Nein. Mehr als ${w(i, 'teich')} m²`)),
    grenzverletzungen: (i) => {
      const f = verschieden(i);
      if (2 ** w(i, 'wochen') <= w(i, 'teich')) f.push('Grenze nicht überschritten');
      return f;
    },
    mindestensVerschieden: { E: 20 },
  });
});
