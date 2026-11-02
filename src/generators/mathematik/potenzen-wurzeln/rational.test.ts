import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { pwRationalAussage, pwRationalWert, pwSchreibweise } from './rational';

const zahlWert = (i: Instanz, n: string) => i.platzhalter[n] as number;
const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

describe('Potenzen mit Bruch-Hochzahl berechnen', () => {
  pflichttests(pwRationalWert, {
    niveaus: { G: { zaehler: false }, M: { zaehler: true } },
    unabhaengigeLoesung(i) {
      // Unabhängig: n-te Wurzel durch Probieren, dann hoch m
      const a = zahlWert(i, 'basis');
      const n = zahlWert(i, 'n');
      const m = zahlWert(i, 'm');
      let w = 1;
      while (w ** n < a) w++;
      return { typ: 'zahl', wert: w ** m };
    },
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const a = zahlWert(i, 'basis');
      const n = zahlWert(i, 'n');
      const m = zahlWert(i, 'm');
      if (!Number.isInteger(Math.round(a ** (1 / n) * 1e9) / 1e9)) f.push('Wurzel geht nicht auf');
      if (!p.zaehler && m !== 1) f.push('G: Zähler 1');
      if (p.zaehler && m < 2) f.push('M: Zähler ab 2');
      if (!tex(i, 'term').includes(`\\frac{${m}}{${n}}`)) f.push('Hochzahl fehlt im Term');
      return f;
    },
    mindestensVerschieden: { G: 18, M: 25 },
  });

  it('Zwischenschritte: erst die Wurzel, dann die Potenz', () => {
    const p = { zaehler: true };
    const i = pwRationalWert.erzeuge(5, p);
    const a = zahlWert(i, 'basis');
    const n = zahlWert(i, 'n');
    const w = Math.round(a ** (1 / n));
    expect(pwRationalWert.schritt?.(5, p, 'wurzel', {}).loesung).toEqual({ typ: 'zahl', wert: w });
    expect(pwRationalWert.schritt?.(5, p, 'potenz', {}).loesung).toEqual(i.loesung);
  });
});

describe('Schreibweisen: Wurzel und Bruch-Hochzahl', () => {
  pflichttests(pwSchreibweise, {
    niveaus: { G: { negativ: false }, M: { negativ: true } },
    unabhaengigeLoesung(i) {
      // Unabhängig: aus dem Wurzelterm Wurzelexponent n, Hochzahl m und Kehrwert lesen
      const t = tex(i, 'term');
      const m = /\\sqrt(?:\[(\d)\])?\{[a-z](?:\^\{(\d)\})?\}/.exec(t);
      const n = m?.[1] ?? '2';
      const z = m?.[2] ?? '1';
      const minus = t.startsWith('\\frac{1}') ? '-' : '';
      const soll = `^{${minus}\\frac{${z}}{${n}}}`;
      const k = (i.optionen ?? []).findIndex((o) => o.text?.de.includes(soll));
      return { typ: 'auswahl', wert: k };
    },
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const anzahl = i.optionen?.length ?? 0;
      if (anzahl < 3 || anzahl > 4) f.push('drei oder vier Optionen');
      if (!p.negativ && tex(i, 'term').startsWith('\\frac')) f.push('G: kein Kehrwert');
      return f;
    },
    mindestensVerschieden: { G: 25, M: 40 },
  });
});

describe('Aussagen über Bruch-Hochzahlen (E)', () => {
  pflichttests(pwRationalAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 12 },
  });
});
