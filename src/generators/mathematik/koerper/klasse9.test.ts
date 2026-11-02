import { describe } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  kpHypotenuse,
  kpKegel,
  kpKegelErkennen,
  kpKegelZylinder,
  kpKugel,
  kpPlan,
  kpPyramideHoehe,
  kpVerdoppeln,
  kpZusammengesetzt,
} from './klasse9';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};
const P = 3.14;
const r1 = (x: number) => Math.round(x * 10) / 10;
const zahlen = (s: string) =>
  [...s.replace(/\{,\}/g, ',').matchAll(/(\d+(?:,\d+)?)/g)].map((m) =>
    Number((m[1] ?? '').replace(',', '.')),
  );
const vier = {
  grenzverletzungen: (i: Instanz) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
};

describe('Höhen der Pyramide', () => {
  pflichttests(kpPyramideHoehe, {
    niveaus: { G: { kante: false }, M: { kante: true } },
    unabhaengigeLoesung(i) {
      const a = tex(i, 'angabe');
      const g = tex(i, 'gesucht');
      const [kante = 0, zweite = 0] = zahlen(a.replace('h_s', 'hs'));
      const halb = kante / 2;
      let w: number;
      if (a.includes('Körperhöhe h =')) {
        w = g.includes('Seitenhöhe')
          ? Math.hypot(zweite, halb)
          : Math.hypot(zweite, (kante * Math.SQRT2) / 2);
      } else {
        w = g.includes('Körperhöhe')
          ? Math.sqrt(zweite * zweite - halb * halb)
          : Math.hypot(zweite, halb);
      }
      return { typ: 'zahl', wert: r1(w) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Welche Strecke ist die Hypotenuse (E)', () => {
  pflichttests(kpHypotenuse, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 3 },
  });
});

describe('Kreiskegel', () => {
  pflichttests(kpKegel, {
    niveaus: { G: { erweitert: false }, M: { erweitert: true } },
    unabhaengigeLoesung(i) {
      const [rad = 0, h = 0] = zahlen(tex(i, 'angabe'));
      const g = tex(i, 'gesucht');
      const s = Math.hypot(rad, h);
      const w = g.includes('Mantellinie')
        ? s
        : g.includes('Volumen')
          ? (P * rad * rad * h) / 3
          : g.includes('Mantels')
            ? P * rad * s
            : P * rad * rad + P * rad * s;
      return { typ: 'zahl', wert: r1(w) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Kegel und Zylinder (E)', () => {
  pflichttests(kpKegelZylinder, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Kugel', () => {
  pflichttests(kpKugel, {
    niveaus: { G: { rueckwaerts: false }, M: { rueckwaerts: true } },
    unabhaengigeLoesung(i) {
      const a = tex(i, 'angabe');
      const g = tex(i, 'gesucht');
      const [x = 0] = zahlen(a);
      if (g.includes('Radius')) {
        // Radius durch Probieren in Hundertsteln
        let best = 0;
        for (let rr = 0; rr <= 20; rr += 0.01)
          if (Math.abs((4 / 3) * P * rr ** 3 - x) < Math.abs((4 / 3) * P * best ** 3 - x))
            best = rr;
        return { typ: 'zahl', wert: r1(best) };
      }
      return {
        typ: 'zahl',
        wert: r1(g.includes('Volumen') ? (4 / 3) * P * x ** 3 : 4 * P * x * x),
      };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 20, M: 20 },
  });
});

describe('Radius verdoppeln (E)', () => {
  pflichttests(kpVerdoppeln, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 4 },
  });
});

describe('Kegel darstellen', () => {
  pflichttests(kpKegelErkennen, {
    niveaus: { G: { art: 'zweitafel' }, M: { art: 'netz' }, E: { art: 'liegend' } },
    unabhaengigeLoesung(i) {
      const b = i.bild?.beschreibung.de ?? '';
      const soll = !i.bild
        ? 'aus einem Kreis und einem Kreisausschnitt'
        : b.includes('Spitze nach links')
          ? 'ein liegender Kreiskegel'
          : b.includes('Rechteck')
            ? 'ein Kreiszylinder'
            : b.includes('Quadrat')
              ? 'eine quadratische Pyramide'
              : b.includes('Mittelpunkt')
                ? 'ein Kreiskegel'
                : 'eine Kugel';
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === soll) };
    },
    ...vier,
    mindestensVerschieden: { G: 4, M: 4, E: 4 },
  });
});

describe('Zusammengesetzte Körper', () => {
  pflichttests(kpZusammengesetzt, {
    niveaus: { G: { arten: ['rakete', 'haus'] }, M: { arten: ['rakete', 'eistuete', 'haus'] } },
    unabhaengigeLoesung(i) {
      const s = tex(i, 'situation');
      const z = zahlen(s);
      let w: number;
      if (/rakete/i.test(s))
        w = P * (z[0] ?? 0) ** 2 * (z[1] ?? 0) + (P * (z[0] ?? 0) ** 2 * (z[2] ?? 0)) / 3;
      else if (s.includes('Eistüte'))
        w = (P * (z[0] ?? 0) ** 2 * (z[1] ?? 0)) / 3 + (2 / 3) * P * (z[0] ?? 0) ** 3;
      else w = (z[0] ?? 0) ** 2 * (z[1] ?? 0) + ((z[0] ?? 0) ** 2 * (z[2] ?? 0)) / 3;
      return { typ: 'zahl', wert: r1(w) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 60, M: 70 },
  });
});

describe('Lösungsplan (E)', () => {
  pflichttests(kpPlan, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 3 },
  });
});
