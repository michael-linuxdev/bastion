import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { pwGesetzExponent, pwGesetzFehler, pwGesetzWert } from './gesetze';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
/** Zahl aus LaTeX: „-4“, „12“ */
const zahlAus = (s: string) => Number(s);

/** Unabhängig: Hochzahlen aus dem Term lesen und das Gesetz anwenden. */
function ausTerm(t: string): { basis: string; k: number } {
  const p = '([a-z0-9]+)\\^\\{(-?\\d+)\\}';
  let m = new RegExp(`^${p} \\\\cdot ${p}`).exec(t);
  if (m) return { basis: m[1] ?? '', k: zahlAus(m[2] ?? '') + zahlAus(m[4] ?? '') };
  m = new RegExp(`^${p} : ${p}`).exec(t);
  if (m) return { basis: m[1] ?? '', k: zahlAus(m[2] ?? '') - zahlAus(m[4] ?? '') };
  m = new RegExp(`^\\\\left\\(${p}\\\\right\\)\\^\\{(-?\\d+)\\}`).exec(t);
  if (m) return { basis: m[1] ?? '', k: zahlAus(m[2] ?? '') * zahlAus(m[3] ?? '') };
  throw new Error(`unbekannter Term ${t}`);
}

/** Bei Auswahl-Aufgaben ist die Lösung die einzige Option, die kein Fehlerbild ist. */
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

describe('Hochzahl mit Potenzgesetz', () => {
  pflichttests(pwGesetzExponent, {
    niveaus: {
      G: { gesetze: ['mal', 'durch', 'hoch'], negativ: false },
      M: { gesetze: ['mal', 'durch', 'hoch'], negativ: true },
    },
    unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: ausTerm(tex(i, 'term')).k }),
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const t = tex(i, 'term');
      if (!t.endsWith('^{\\square}')) f.push('Lücke fehlt');
      const hoch = [...t.matchAll(/\^\{(-?\d+)\}/g)].map((m) => Number(m[1]));
      if (!p.negativ && hoch.some((h) => h < 2)) f.push('G: nur Hochzahlen ab 2');
      if (p.negativ && hoch.every((h) => h > 0)) f.push('M: mindestens eine negative Hochzahl');
      if (hoch.includes(0) || hoch.includes(1)) f.push('Hochzahl 0 oder 1 im Term');
      return f;
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Geschickt berechnen', () => {
  pflichttests(pwGesetzWert, {
    niveaus: {
      G: { gesetze: ['mal', 'durch'], negativ: false },
      M: { gesetze: ['mal', 'durch', 'hoch'], negativ: true },
    },
    unabhaengigeLoesung(i) {
      const { basis, k } = ausTerm(tex(i, 'term'));
      let w = 1;
      for (let j = 0; j < k; j++) w *= Number(basis);
      return { typ: 'zahl', wert: w };
    },
    grenzverletzungen(i) {
      const f: string[] = [];
      const { basis, k } = ausTerm(tex(i, 'term'));
      if (![2, 3, 5, 10].includes(Number(basis))) f.push('Basis');
      if (k < 1) f.push('Ergebnis-Hochzahl unter 1');
      if (i.loesung.typ === 'zahl' && i.loesung.wert > 1_000_000) f.push('Ergebnis zu groß');
      return f;
    },
    mindestensVerschieden: { G: 40, M: 40 },
  });

  it('Zwischenschritte: erst die Hochzahl, dann der Wert', () => {
    const p = { gesetze: ['durch'], negativ: false } as const;
    const i = pwGesetzWert.erzeuge(3, p);
    const { k } = ausTerm(tex(i, 'term'));
    expect(pwGesetzWert.schritt?.(3, p, 'potenz', {}).loesung).toEqual({ typ: 'zahl', wert: k });
    expect(pwGesetzWert.schritt?.(3, p, 'wert', {}).loesung).toEqual(i.loesung);
  });
});

describe('Rechnung mit Potenzgesetz prüfen (E)', () => {
  pflichttests(pwGesetzFehler, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 30 },
  });
});
