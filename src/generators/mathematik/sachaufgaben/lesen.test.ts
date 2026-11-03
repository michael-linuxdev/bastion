import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { saErgebnis, saRechnung } from './lesen';

const text = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlenIn = (s: string) => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));

/** Antwort unabhängig aus der Geschichte: Zahlen in Reihenfolge des Textes, Regel je Fall */
function antwort(i: Instanz): number {
  const fall = text(i, 'fall');
  const z = zahlenIn(`${text(i, 'geschichte')} ${text(i, 'frage')}`);
  const lang = z.length === 4;
  if (fall === 'rueckgeld') {
    // „a Hefte zu je b € [und eine Schere für d €]. … mit einem c-€-Schein.“
    const [a = 0, b = 0, x = 0, y = 0] = z;
    return lang ? y - a * b - x : x - a * b;
  }
  if (fall === 'bus') {
    const [a = 0, b = 0, c = 0, d = 0] = z;
    return lang ? a - b + c - d : a - b + c;
  }
  // sparen: „a € … jede Woche b € … c Wochen [… Spiel für d €]“
  const [a = 0, b = 0, c = 0, d = 0] = z;
  return lang ? a + b * c - d : a + b * c;
}

/** Wert einer Rechnung wie „20 − 3 · 4“ oder „50 − (2 + 5) − 3“ */
function wert(rechnung: string): number {
  const js = rechnung.replace(/·/g, '*').replace(/−/g, '-');
  if (!/^[\d\s+\-*()]+$/.test(js)) throw new Error(`unerwartete Rechnung ${rechnung}`);
  return Function(`return (${js});`)() as number;
}

const grenzen = (i: Instanz, p: { lang: boolean }) => {
  const v: string[] = [];
  const z = zahlenIn(text(i, 'geschichte'));
  if (z.some((x) => x > 50)) v.push('Zahl über 50');
  // G: drei Angaben, M: vier (eine Ausgabe oder Haltestelle mehr)
  const anzahl = zahlenIn(`${text(i, 'geschichte')} ${text(i, 'frage')}`).length;
  if (anzahl !== (p.lang ? 4 : 3)) v.push(`${anzahl} Angaben`);
  return v;
};

describe('Welche Rechnung passt? (sa.rechnung)', () => {
  pflichttests(saRechnung, {
    niveaus: { G: { lang: false }, M: { lang: true } },
    unabhaengigeLoesung(i): Loesung {
      const soll = antwort(i);
      const treffer = (i.optionen ?? []).map((o) => wert(o.text?.de ?? ''));
      return { typ: 'auswahl', wert: treffer.indexOf(soll) };
    },
    grenzverletzungen(i, p) {
      const v = grenzen(i, p);
      const werte = (i.optionen ?? []).map((o) => wert(o.text?.de ?? ''));
      if (new Set(werte).size !== werte.length) v.push('zwei Rechnungen mit gleichem Wert');
      if (werte.some((w) => w < 0)) v.push('negatives Ergebnis');
      return v;
    },
    mindestensVerschieden: { G: 40, M: 40 },
  });

  it('M hat eine Möglichkeit mehr (übersehene Angabe)', () => {
    expect(saRechnung.erzeuge(1, { lang: false }).optionen).toHaveLength(3);
    expect(saRechnung.erzeuge(1, { lang: true }).optionen).toHaveLength(4);
  });
});

describe('Rechne aus (sa.ergebnis)', () => {
  pflichttests(saErgebnis, {
    niveaus: { G: { lang: false }, M: { lang: true } },
    unabhaengigeLoesung: (i): Loesung => ({ typ: 'zahl', wert: antwort(i) }),
    grenzverletzungen: grenzen,
    mindestensVerschieden: { G: 40, M: 40 },
  });
});
