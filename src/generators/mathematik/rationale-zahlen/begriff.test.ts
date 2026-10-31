import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  alltag,
  gegenzahlBetrag,
  rzOrdnen,
  rzVergleichen,
  zahlbereich,
  zahlbereichAussage,
  zahlengerade,
} from './begriff';

// Parameter wie in den Vorlagen (content/…/M.ZO.RZ.BEGRIFF, .ORDNEN, .ZAHLBEREICHE)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const N = (i: Instanz, n: string) => i.platzhalter[n] as number;
/** „−2,5“ → −2.5 */
const zahlAus = (t: string) => Number(t.replace(/\s/g, '').replace('−', '-').replace(',', '.'));
const zahlL = (wert: number): Loesung => ({ typ: 'zahl', wert: wert === 0 ? 0 : wert });
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const ganzzahlig = (x: number) => Math.abs(x * 10 - Math.round(x * 10)) < 1e-9;

describe('Zahlengerade', () => {
  pflichttests(zahlengerade, {
    niveaus: { G: { schritt_zehntel: 10, bis: 10 }, M: { schritt_zehntel: 5, bis: 5 } },
    unabhaengigeLoesung(i) {
      const b = i.bild?.beschreibung.de ?? '';
      const schritt = zahlAus(/sind es ([\d,]+)\./.exec(b)?.[1] ?? 'NaN');
      const [, k, seite] = /steht (\d+) Striche (links|rechts)/.exec(b) ?? [];
      return zahlL(Math.round(Number(k) * schritt * (seite === 'links' ? -1 : 1) * 10) / 10);
    },
    grenzverletzungen(i, p) {
      const w = i.loesung.typ === 'zahl' ? i.loesung.wert : NaN;
      const f: string[] = [];
      if (!(Math.abs(w) < p.bis && w !== 0)) f.push(`außerhalb: ${w}`);
      if (!i.vorzeichen) f.push('ohne Minustaste');
      return f;
    },
    mindestensVerschieden: { G: 12, M: 8 },
  });

  it('die Markierung steht nie auf einer beschrifteten Zahl', () => {
    for (let s = 0; s < 300; s++) {
      const i = zahlengerade.erzeuge(s, { schritt_zehntel: 10, bis: 10 });
      expect(i.loesung.typ === 'zahl' && i.loesung.wert % 5 !== 0).toBe(true);
    }
  });
});

describe('Gegenzahl und Betrag', () => {
  pflichttests(gegenzahlBetrag, {
    niveaus: { G: { dezimal: false, max: 20 }, M: { dezimal: true, max: 50 } },
    unabhaengigeLoesung(i) {
      const x = N(i, 'zahl');
      return zahlL(T(i, 'was') === 'den Betrag' ? (x < 0 ? -x : x) : 0 - x);
    },
    grenzverletzungen(i, p) {
      const x = N(i, 'zahl');
      const f: string[] = [];
      if (x === 0 || Math.abs(x) > p.max) f.push(`Zahl ${x}`);
      if (!p.dezimal && !Number.isInteger(x)) f.push('Dezimalzahl auf G');
      if (!ganzzahlig(x)) f.push('mehr als eine Nachkommastelle');
      return f;
    },
    mindestensVerschieden: { G: 25, M: 40 },
  });
});

describe('Negative Zahlen im Alltag', () => {
  /** Lage aus einem Satz: Betrag und ob unter null / Schulden */
  const lage = (satz: string) => {
    const b = Number(/(\d+)/.exec(satz)?.[1]);
    return /unter|fehlen/.test(satz) ? -b : b;
  };
  pflichttests(alltag, {
    niveaus: { G: { unterschied: false }, M: { unterschied: true } },
    unabhaengigeLoesung(i, p) {
      const g = T(i, 'geschichte');
      if (!p.unterschied) return zahlL(lage(g));
      const [, erst = '', dann = ''] = /^Erst: (.+?) Später: (.+)$/.exec(g) ?? [];
      return zahlL(Math.abs(lage(erst) - lage(dann)));
    },
    grenzverletzungen(i) {
      const w = i.loesung.typ === 'zahl' ? i.loesung.wert : NaN;
      return Number.isInteger(w) && w !== 0 && Math.abs(w) <= 180 ? [] : [`Wert ${w}`];
    },
    mindestensVerschieden: { G: 30, M: 40 },
  });
});

describe('Vergleichen', () => {
  pflichttests(rzVergleichen, {
    niveaus: { G: { dezimal: false, max: 20 }, M: { dezimal: true, max: 20 } },
    unabhaengigeLoesung(i) {
      const d = N(i, 'a') - N(i, 'b');
      return auswahlL(d < 0 ? 0 : d > 0 ? 2 : 1);
    },
    grenzverletzungen(i, p) {
      const f: string[] = [];
      for (const n of ['a', 'b']) {
        const x = N(i, n);
        if (x === 0 || Math.abs(x) > p.max || !ganzzahlig(x)) f.push(`${n} = ${x}`);
      }
      if (N(i, 'a') >= 0 && N(i, 'b') >= 0) f.push('keine negative Zahl');
      return f;
    },
    mindestensVerschieden: { G: 40, M: 60 },
  });
});

describe('Ordnen', () => {
  pflichttests(rzOrdnen, {
    niveaus: {
      G: { anzahl: 5, dezimal: false, max: 20 },
      M: { anzahl: 6, dezimal: true, max: 20 },
    },
    unabhaengigeLoesung(i) {
      // kleinste zuerst durch wiederholtes Heraussuchen
      const rest = [...(i.elemente ?? [])];
      const folge: number[] = [];
      while (rest.length) {
        const k = rest.reduce((m, x) => (x < m ? x : m));
        folge.push(k);
        rest.splice(rest.indexOf(k), 1);
      }
      return { typ: 'reihenfolge', wert: folge };
    },
    grenzverletzungen(i, p) {
      const e = i.elemente ?? [];
      const f: string[] = [];
      if (e.length !== p.anzahl || new Set(e).size !== e.length) f.push('Anzahl');
      if (e.filter((x) => x < 0).length < 2) f.push('weniger als zwei negative Zahlen');
      if (e.some((x) => x === 0 || Math.abs(x) > p.max || !ganzzahlig(x))) f.push('Zahlen');
      return f;
    },
    mindestensVerschieden: { G: 95, M: 95 },
  });
});

describe('Zahlbereiche', () => {
  pflichttests(zahlbereich, {
    niveaus: { G: { verkleidet: false }, M: { verkleidet: true } },
    unabhaengigeLoesung(i) {
      const t = T(i, 'zahl');
      const negativ = t.startsWith('−');
      const [z, n] = t.replace('−', '').split('/');
      const wert = n ? Number(z) / Number(n) : zahlAus(z ?? '');
      const ganz = Number.isInteger(wert);
      return auswahlL(ganz ? (negativ ? 1 : 0) : negativ ? 3 : 2);
    },
    grenzverletzungen(i) {
      return T(i, 'zahl') === '0' ? ['0'] : [];
    },
    mindestensVerschieden: { G: 40, M: 40 },
  });

  const WAHR: Readonly<Record<string, boolean>> = {
    'Jede natürliche Zahl ist eine ganze Zahl.': true,
    'Jede ganze Zahl ist eine rationale Zahl.': true,
    'Jede gebrochene Zahl ist eine rationale Zahl.': true,
    'Keine negative Zahl ist eine natürliche Zahl.': true,
    'Zwischen −1 und 0 liegen rationale Zahlen.': true,
    'Jede ganze Zahl ist eine natürliche Zahl.': false,
    'Jede rationale Zahl ist eine ganze Zahl.': false,
    '−1/2 ist eine gebrochene Zahl.': false,
    'Es gibt eine kleinste rationale Zahl.': false,
    'Zwischen −2 und −1 liegt keine Zahl.': false,
    'Die Schnittmenge der ganzen und der gebrochenen Zahlen sind die natürlichen Zahlen.': true,
    'Die Vereinigungsmenge der natürlichen und der ganzen Zahlen sind die ganzen Zahlen.': true,
    'Die Schnittmenge der ganzen und der gebrochenen Zahlen ist leer.': false,
    'Die Vereinigungsmenge der ganzen und der gebrochenen Zahlen sind die natürlichen Zahlen.': false,
  };
  pflichttests(zahlbereichAussage, {
    niveaus: { G: { mengen: false }, M: { mengen: true } },
    unabhaengigeLoesung(i) {
      return auswahlL(WAHR[T(i, 'aussage')] ? 0 : 1);
    },
    grenzverletzungen(i, p) {
      return !p.mengen && /menge/.test(T(i, 'aussage')) ? ['Mengen auf G'] : [];
    },
    mindestensVerschieden: { G: 9, M: 12 },
  });
});
