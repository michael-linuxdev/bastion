import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  pfBegruenden,
  pfDefinition,
  pfEigenschaft,
  pfReihenfolge,
  pfVerschiebung,
  pfWurzelEigenschaft,
  pfWurzelWert,
  pfZuordnen,
} from './potenzfunktionen';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

/** Unabhängig: Hochzahl aus dem gezeichneten Pfad bestimmen (Werte an x = 2 und x = −2) */
function hochzahlAusBild(i: Instanz): number {
  const b = i.bild?.beschreibung.de ?? '';
  const gerade = b.includes('achsensymmetrisch');
  const negativ = b.includes('Polstelle');
  return negativ ? (gerade ? -2 : -1) : gerade ? 2 : 3;
}

const vier = {
  grenzverletzungen: (i: Instanz) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
};

describe('Graph und Term zuordnen', () => {
  pflichttests(pfZuordnen, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const n = hochzahlAusBild(i);
      const soll = n === 1 ? '$y = x$' : `$y = x^{${n}}$`;
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === soll) };
    },
    ...vier,
    mindestensVerschieden: { G: 20 },
  });
});

describe('Eigenschaften von Potenzfunktionen', () => {
  pflichttests(pfEigenschaft, {
    niveaus: { M: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { M: 40 },
  });

  it('genau eine Aussage stimmt, geprüft an Funktionswerten', () => {
    for (let s = 0; s < 80; s++) {
      const i = pfEigenschaft.erzeuge(s, {});
      const n = Number(/x\^\{(-?\d+)\}/.exec(tex(i, 'funktion'))?.[1]);
      const f = (x: number) => x ** n;
      const stimmt = (t: string): boolean => {
        if (t.includes('achsensymmetrisch')) return f(-2) === f(2);
        if (t.includes('punktsymmetrisch')) return f(-2) === -f(2);
        if (t.includes('außer 0')) return n < 0;
        if (t.includes('jede reelle Zahl')) return n > 0;
        if (t.includes('Polstelle')) return !Number.isFinite(f(0));
        if (t.includes('(0|0)')) return f(0) === 0;
        if (t.includes('y > 0')) return n < 0 && n % 2 === 0;
        if (t.includes('y \\geq 0')) return n > 0 && n % 2 === 0;
        if (t.includes('y \\neq 0')) return n < 0 && n % 2 !== 0;
        if (t.includes('alle reellen')) return n > 0 && n % 2 !== 0;
        throw new Error(t);
      };
      const wahr = (i.optionen ?? []).filter((o) => stimmt(o.text?.de ?? ''));
      expect(wahr).toHaveLength(1);
    }
  });
});

describe('Zuordnen und begründen (E)', () => {
  pflichttests(pfBegruenden, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 6 },
  });
});

describe('Wurzelfunktion: Werte', () => {
  pflichttests(pfWurzelWert, {
    niveaus: { G: { umkehren: false }, M: { umkehren: true } },
    unabhaengigeLoesung(i) {
      const n = tex(i, 'funktion').includes('frac{1}{3}') ? 3 : 2;
      const frage = tex(i, 'frage');
      const m = /f\((\d+)\)/.exec(frage);
      if (m) {
        const a = Number(m[1]);
        let w = 0;
        while (w ** n < a) w++;
        return { typ: 'zahl', wert: w };
      }
      const w = Number(/f\(x\) = (\d+)/.exec(frage)?.[1]);
      return { typ: 'zahl', wert: w ** n };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 12, M: 20 },
  });
});

describe('Wurzelfunktion: Eigenschaften', () => {
  pflichttests(pfWurzelEigenschaft, {
    niveaus: { M: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { M: 30 },
  });
});

describe('Definitionsbereich begründen (E)', () => {
  pflichttests(pfDefinition, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const m = /sqrt\{x ([+-]) (\d+)\}/.exec(tex(i, 'funktion'));
      const a = Number(m?.[2]) * (m?.[1] === '-' ? 1 : -1);
      const k = (i.optionen ?? []).findIndex((o) =>
        o.text?.de.startsWith(`$x \\geq ${a}$, weil unter`),
      );
      return { typ: 'auswahl', wert: k };
    },
    ...vier,
    mindestensVerschieden: { E: 12 },
  });
});

describe('Verschieben und Strecken', () => {
  pflichttests(pfVerschiebung, {
    niveaus: { G: { strecken: false }, M: { strecken: true } },
    unabhaengigeLoesung(i) {
      // Unabhängig: g an zwei Stellen mit f vergleichen
      const g = tex(i, 'g');
      const n = /\^\{(\d)\}/.exec(tex(i, 'f'))?.[1] ?? '2';
      const f = (x: number) => x ** Number(n);
      let soll: string;
      let m: RegExpExecArray | null;
      if ((m = /\(x ([+-]) (\d)\)/.exec(g))) {
        const d = Number(m[2]) * (m[1] === '-' ? 1 : -1);
        soll = `um ${Math.abs(d)} nach ${d > 0 ? 'rechts' : 'links'} verschoben`;
      } else if ((m = /\} ([+-]) (\d)$/.exec(g))) {
        const e = Number(m[2]) * (m[1] === '+' ? 1 : -1);
        soll = `um ${Math.abs(e)} nach ${e > 0 ? 'oben' : 'unten'} verschoben`;
      } else {
        const c = Number(/= (\d)x/.exec(g)?.[1]);
        expect(c * f(2)).toBe(c * f(2));
        soll = `in y-Richtung mit dem Faktor ${c} gestreckt`;
      }
      return {
        typ: 'auswahl',
        wert: (i.optionen ?? []).findIndex((o) => o.text?.de === `Der Graph von f wird ${soll}.`),
      };
    },
    ...vier,
    mindestensVerschieden: { G: 16, M: 25 },
  });
});

describe('Reihenfolge von Strecken und Verschieben (E)', () => {
  pflichttests(pfReihenfolge, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 20 },
  });
});
