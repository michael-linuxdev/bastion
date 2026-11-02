import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  qfExtremum,
  qfGraphAussage,
  qfNullstellen,
  qfScheitel,
  qfWertebereich,
  qfWertetabelle,
} from './graph';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};

/** Unabhängig: f(x) = a·(x − d)² + e aus dem LaTeX lesen (Scheitelform). */
function scheitelAus(t: string) {
  const m = /^(?:f\(x\) = )?(-?[\d{},]*)(?:x\^2|\(x ([+-]) (\d+)\)\^2)(?: ([+-]) (\d+))?$/.exec(t);
  if (!m) throw new Error(`unbekannte Funktion ${t}`);
  const roh = (m[1] ?? '').replace('{,}', '.');
  const a = roh === '' ? 1 : roh === '-' ? -1 : Number(roh);
  const d = m[3] ? Number(m[3]) * (m[2] === '-' ? 1 : -1) : 0;
  const e = m[5] ? Number(m[5]) * (m[4] === '-' ? -1 : 1) : 0;
  return { a, d, e };
}

/** Unabhängig: x² + p·x + q aus dem LaTeX lesen (Normalform). */
function normalAus(t: string) {
  const m = /^f\(x\) = x\^2(?: ([+-]) (\d*)x)?(?: ([+-]) (\d+))?$/.exec(t);
  if (!m) return undefined;
  const p = m[1] ? (m[2] ? Number(m[2]) : 1) * (m[1] === '-' ? -1 : 1) : 0;
  const q = m[4] ? Number(m[4]) * (m[3] === '-' ? -1 : 1) : 0;
  return { p, q };
}

describe('Wertetabelle', () => {
  pflichttests(qfWertetabelle, {
    niveaus: { G: { faktoren: [1] }, M: { faktoren: [-2, -1, 0.5, 2] } },
    unabhaengigeLoesung(i) {
      const { a, d, e } = scheitelAus(tex(i, 'funktion'));
      const x = i.platzhalter['x'] as number;
      return { typ: 'zahl', wert: a * (x - d) * (x - d) + e };
    },
    grenzverletzungen(i, p) {
      const { a } = scheitelAus(tex(i, 'funktion'));
      return p.faktoren.includes(a) ? [] : ['Faktor'];
    },
    mindestensVerschieden: { G: 50, M: 70 },
  });
});

/** Unabhängig: Öffnung und Scheitelpunkt aus der Bildbeschreibung */
function ausBild(i: Instanz) {
  const b = (i.bild?.beschreibung.de ?? '').replace(/−/g, '-');
  const m = /nach (oben|unten).*\((-?\d+)\|(-?\d+)\)/.exec(b);
  return { a: m?.[1] === 'oben' ? 1 : -1, d: Number(m?.[2]), e: Number(m?.[3]) };
}

describe('Nullstellen ablesen', () => {
  pflichttests(qfNullstellen, {
    niveaus: { G: { unten: false }, M: { unten: true } },
    unabhaengigeLoesung(i) {
      const { a, d, e } = ausBild(i);
      const nullstellen: number[] = [];
      for (let x = -10; x <= 10; x++) if (a * (x - d) * (x - d) + e === 0) nullstellen.push(x);
      return { typ: 'felder', wert: nullstellen };
    },
    grenzverletzungen: (i) => (i.bild?.svg.includes('<path') ? [] : ['Graph fehlt']),
    mindestensVerschieden: { G: 25, M: 25 },
  });

  it('bietet „keine Lösung“ an und braucht es manchmal', () => {
    let keine = 0;
    for (let s = 0; s < 100; s++) {
      const i = qfNullstellen.erzeuge(s, { unten: false });
      expect(i.felder?.keineLoesung).toBe(true);
      if (i.loesung.typ === 'felder' && i.loesung.wert.length === 0) keine++;
    }
    expect(keine).toBeGreaterThan(10);
  });
});

describe('Wertebereich ablesen', () => {
  pflichttests(qfWertebereich, {
    niveaus: { M: { unten: true } },
    unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: ausBild(i).e }),
    grenzverletzungen: (i) => (i.bild?.svg.includes('<path') ? [] : ['Graph fehlt']),
    mindestensVerschieden: { M: 25 },
  });
});

describe('Aussagen über Parabeln (E)', () => {
  pflichttests(qfGraphAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 8 },
  });
});

describe('Scheitelpunkt', () => {
  pflichttests(qfScheitel, {
    niveaus: { G: { formen: ['scheitelform'] }, M: { formen: ['scheitelform', 'normalform'] } },
    unabhaengigeLoesung(i) {
      const t = tex(i, 'funktion');
      const n = t.includes('(x ') ? undefined : normalAus(t);
      if (n) {
        // Scheitel bei der Mitte der Parabel: x = −p/2, y = f(x)
        const x = -n.p / 2;
        return { typ: 'felder', wert: [x, x * x + n.p * x + n.q] };
      }
      const { d, e } = scheitelAus(t);
      return { typ: 'felder', wert: [d, e] };
    },
    grenzverletzungen(i, p) {
      const t = tex(i, 'funktion');
      if (!p.formen.includes('normalform') && !t.includes('(x ') && !/= x\^2$/.test(t))
        return ['G: nur Scheitelform'];
      return [];
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Maximum oder Minimum (E)', () => {
  pflichttests(qfExtremum, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const { a, d, e } = scheitelAus(tex(i, 'funktion'));
      const art = a > 0 ? 'Minimum' : 'Maximum';
      const k = (i.optionen ?? []).findIndex(
        (o) =>
          o.text?.de.startsWith(`${art} ${String(e).replace('-', '−')} bei $x = ${d}$`) ?? false,
      );
      return { typ: 'auswahl', wert: k };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 60 },
  });
});
