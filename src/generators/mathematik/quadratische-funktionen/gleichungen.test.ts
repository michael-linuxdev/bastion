import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  qfAnzahl,
  qfFormel,
  qfFormelAussage,
  qfInhaltlich,
  qfInhaltlichAussage,
} from './gleichungen';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

/** Linke Seite einer Gleichung „… = c“ als Funktion von x, unabhängig vom Generator gelesen */
function linkeSeite(t: string): { f: (x: number) => number; rechts: number } {
  const [links = '', rechtsText = '0'] = t.split(' = ');
  const js = links
    .replace(/\\cdot/g, '*')
    .replace(/(\d)x/g, '$1*x')
    .replace(/\(([^()]*)\)\^2/g, '(($1)**2)')
    .replace(/x\^2/g, '(x**2)')
    .replace(/\s/g, '');
  // nur Ziffern, x, Klammern und Rechenzeichen zulassen
  if (!/^[-+*()x\d]*$/.test(js)) throw new Error(`unbekannter Term ${links}`);
  // Nur geprüfte Rechenzeichen (Regex oben), darum ist das Auswerten hier sicher
  const f = new Function('x', `return ${js};`) as (x: number) => number;
  return { f, rechts: Number(rechtsText) };
}

/** Alle ganzzahligen Lösungen im Bereich −30 … 30 */
function probiere(t: string): number[] {
  const { f, rechts } = linkeSeite(t);
  const l: number[] = [];
  for (let x = -30; x <= 30; x++) if (Math.abs(f(x) - rechts) < 1e-9) l.push(x);
  return l;
}

describe('Quadratische Gleichungen ohne Formel', () => {
  pflichttests(qfInhaltlich, {
    niveaus: {
      G: { formen: ['quadrat'] },
      M: { formen: ['verschoben', 'produkt', 'ausklammern'] },
    },
    unabhaengigeLoesung: (i) => ({ typ: 'felder', wert: probiere(tex(i, 'gleichung')) }),
    grenzverletzungen: (i) => (i.felder?.keineLoesung ? [] : ['„keine Lösung“ fehlt']),
    mindestensVerschieden: { G: 15, M: 70 },
  });
});

describe('Aussagen zum Lösen ohne Formel (E)', () => {
  pflichttests(qfInhaltlichAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 20 },
  });
});

describe('Anzahl der Lösungen', () => {
  pflichttests(qfAnzahl, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      // Lösungen durch Ausprobieren in feinem Raster zählen (Vorzeichenwechsel und Nullstellen)
      const { f } = linkeSeite(tex(i, 'gleichung'));
      let n = 0;
      for (let x = -40; x <= 40; x += 0.25) if (Math.abs(f(x)) < 1e-9) n++;
      const vorzeichen = new Set<number>();
      for (let x = -40; x <= 40; x += 0.05) vorzeichen.add(Math.sign(Math.round(f(x) * 1e6)));
      const zwei = vorzeichen.has(-1);
      return { typ: 'auswahl', wert: zwei ? 2 : n > 0 ? 1 : 0 };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 3 ? [] : ['drei Optionen']),
    mindestensVerschieden: { G: 60 },
  });

  it('alle drei Fälle kommen vor', () => {
    const faelle = new Set<number>();
    for (let s = 0; s < 60; s++) {
      const l = qfAnzahl.erzeuge(s, {}).loesung;
      if (l.typ === 'auswahl') faelle.add(l.wert);
    }
    expect([...faelle].sort()).toEqual([0, 1, 2]);
  });
});

describe('Lösungsformel', () => {
  pflichttests(qfFormel, {
    niveaus: { G: { normieren: false }, M: { normieren: true } },
    unabhaengigeLoesung: (i) => ({ typ: 'felder', wert: probiere(tex(i, 'gleichung')) }),
    grenzverletzungen: (i, p) => {
      const t = tex(i, 'gleichung');
      if (!p.normieren && !t.startsWith('x^2')) return ['G: nur Normalform'];
      return [];
    },
    mindestensVerschieden: { G: 70, M: 80 },
  });
});

describe('Aussagen zur Anzahl der Lösungen (E)', () => {
  pflichttests(qfFormelAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 12 },
  });
});
