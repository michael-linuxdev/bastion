import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { qfSach, qfSachSinn, qfSchnitt, qfSchnittAnzahl } from './schnitt';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

/** „y = x^2 - 4x + 3“ bzw. „y = -2x + 5“ als Funktion (unabhängig gelesen) */
function funktion(t: string): (x: number) => number {
  const js = t
    .replace(/^y = /, '')
    .replace(/(\d)x/g, '$1*x')
    .replace(/x\^2/g, '(x**2)')
    .replace(/\s/g, '');
  if (!/^[-+*()x\d]*$/.test(js)) throw new Error(`unbekannter Term ${t}`);
  // Nur geprüfte Rechenzeichen (Regex oben), darum ist das Auswerten hier sicher
  return new Function('x', `return ${js};`) as (x: number) => number;
}

function schnittstellen(i: Instanz): number[] {
  const f = funktion(tex(i, 'parabel'));
  const g = funktion(tex(i, 'gerade'));
  const l: number[] = [];
  for (let x = -30; x <= 30; x++) if (f(x) === g(x)) l.push(x);
  return l;
}

describe('Schnittstellen von Parabel und Gerade', () => {
  pflichttests(qfSchnitt, {
    niveaus: { G: { rechnerisch: false }, M: { rechnerisch: true } },
    unabhaengigeLoesung: (i) => ({ typ: 'felder', wert: schnittstellen(i) }),
    grenzverletzungen(i, p) {
      const f: string[] = [];
      if (!p.rechnerisch && !i.bild) f.push('G: Graph fehlt');
      if (!p.rechnerisch && !/^y = -?\d+$/.test(tex(i, 'gerade'))) f.push('G: waagerechte Gerade');
      return f;
    },
    mindestensVerschieden: { G: 15, M: 60 },
  });
});

describe('Anzahl der Schnittpunkte (E)', () => {
  pflichttests(qfSchnittAnzahl, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      // Unabhängig: Vorzeichenwechsel von f − g in feinem Raster zählen
      const f = funktion(tex(i, 'parabel'));
      const g = funktion(tex(i, 'gerade'));
      let beruehrt = false;
      let wechsel = 0;
      let vorher = Math.sign(f(-50) - g(-50));
      for (let x = -50; x <= 50; x += 0.5) {
        const s = Math.sign(f(x) - g(x));
        if (s === 0) beruehrt = true;
        if (s !== 0 && vorher !== 0 && s !== vorher) wechsel++;
        if (s !== 0) vorher = s;
      }
      const n = wechsel >= 2 ? 2 : beruehrt ? (wechsel === 0 ? 1 : 2) : 0;
      const wort = ['keinen', 'genau einen', 'zwei'][n] ?? '';
      const k = (i.optionen ?? []).findIndex(
        (o) => (o.text?.de.startsWith(wort) ?? false) && o.text?.de.includes('Lösung'),
      );
      return { typ: 'auswahl', wert: k };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) >= 3 ? [] : ['mindestens drei Optionen']),
    mindestensVerschieden: { E: 40 },
  });
});

describe('Sachaufgaben', () => {
  pflichttests(qfSach, {
    niveaus: { G: { arten: ['bogen'] }, M: { arten: ['bogen', 'wurf', 'flaeche'] } },
    unabhaengigeLoesung(i) {
      const s = tex(i, 'situation');
      let m = /y = -([\d{},]+)x\^2 \+ ([\d{},]+)\$/.exec(s);
      if (m) {
        const a = Number((m[1] ?? '').replace('{,}', '.'));
        const h = Number((m[2] ?? '').replace('{,}', '.'));
        return { typ: 'zahl', wert: 2 * Math.sqrt(h / a) };
      }
      m = /h\(t\) = -5t\^2 \+ (\d+)t\$/.exec(s);
      if (m) {
        // höchster Wert durch Probieren in Hundertstelsekunden
        const v = Number(m[1]);
        let best = 0;
        for (let t = 0; t <= 10; t += 0.01) best = Math.max(best, -5 * t * t + v * t);
        return { typ: 'zahl', wert: Math.round(best) };
      }
      m = /Mit (\d+) m Zaun/.exec(s);
      const u = Number(m?.[1]);
      let best = 0;
      for (let x = 0; x <= u / 2; x += 0.5) best = Math.max(best, x * (u / 2 - x));
      return { typ: 'zahl', wert: best };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 12, M: 25 },
  });
});

describe('Lösung im Sachzusammenhang (E)', () => {
  pflichttests(qfSachSinn, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 10 },
  });

  it('die Lösungen stimmen mit der Gleichung überein', () => {
    for (let s = 0; s < 50; s++) {
      const t = tex(qfSachSinn.erzeuge(s, {}), 'situation');
      const m = /h\(t\) = -5t\^2 \+ (\d+)t \+ (\d+)\$.*t = -(\d+)\$ und \$t = (\d+)\$/.exec(t);
      const [v, h0, a, b] = (m?.slice(1) ?? []).map(Number);
      const h = (x: number) => -5 * x * x + (v ?? 0) * x + (h0 ?? 0);
      expect(h(-(a ?? 0))).toBe(0);
      expect(h(b ?? 0)).toBe(0);
    }
  });
});
