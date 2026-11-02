import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  pyAnsatz,
  pyFehler,
  pyHoehensatz,
  pySach,
  pySatzOderUmkehrung,
  pySatzWahl,
  pySeite,
  pyUmkehrung,
} from './pythagoras';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};
const r1 = (x: number) => Math.round(x * 10) / 10;
const zahlen = (s: string) =>
  [...s.matchAll(/(\d+(?:,\d+)?)/g)].map((m) => Number((m[1] ?? '').replace(',', '.')));

describe('Seite im rechtwinkligen Dreieck', () => {
  pflichttests(pySeite, {
    niveaus: { G: { gerundet: false }, M: { gerundet: true } },
    unabhaengigeLoesung(i) {
      // Aus der Bildbeschreibung: rechter Winkel und gegebene Seiten
      const b = i.bild?.beschreibung.de ?? '';
      const rechts = /rechte Winkel liegt bei ([ABC])/.exec(b)?.[1] ?? 'C';
      const hyp = rechts.toLowerCase();
      const werte: Record<string, number> = {};
      for (const m of b.matchAll(/([abc]) = (\d+)/g)) werte[m[1] ?? ''] = Number(m[2]);
      const gesucht = tex(i, 'gesucht');
      const andere = Object.entries(werte);
      let w: number;
      if (gesucht === hyp) w = Math.hypot(...andere.map(([, v]) => v));
      else {
        const h = werte[hyp] ?? 0;
        const k = andere.find(([n]) => n !== hyp)?.[1] ?? 0;
        w = Math.sqrt(h * h - k * k);
      }
      return { typ: 'zahl', wert: Number.isInteger(w) ? w : r1(w) };
    },
    grenzverletzungen(i, p) {
      const f: string[] = [];
      if (!i.bild) f.push('Skizze fehlt');
      if (!p.gerundet && i.loesung.typ === 'zahl' && !Number.isInteger(i.loesung.wert))
        f.push('G ganzzahlig');
      return f;
    },
    mindestensVerschieden: { G: 30, M: 80 },
  });
});

describe('Fehler finden (E)', () => {
  pflichttests(pyFehler, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 8 },
  });
});

describe('Umkehrung', () => {
  pflichttests(pyUmkehrung, {
    niveaus: { G: { wo: false }, M: { wo: true } },
    unabhaengigeLoesung(i, p) {
      const s = zahlen(tex(i, 'seiten'));
      const sortiert = [...s].sort((x, y) => x - y);
      const [x = 0, y = 0, z = 0] = sortiert;
      if (p.wo) return { typ: 'auswahl', wert: s.indexOf(z) };
      return { typ: 'auswahl', wert: x * x + y * y === z * z ? 0 : 1 };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 20, M: 20 },
  });
});

describe('Satz oder Umkehrung (E)', () => {
  pflichttests(pySatzOderUmkehrung, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const umkehrung = tex(i, 'situation').includes('ist es rechtwinklig');
      const soll = umkehrung
        ? 'die Umkehrung des Satzes von Pythagoras'
        : 'der Satz des Pythagoras';
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === soll) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { E: 10 },
  });
});

describe('Höhensatz und Kathetensatz', () => {
  pflichttests(pyHoehensatz, {
    niveaus: { G: { saetze: ['hoehe'] }, M: { saetze: ['hoehe', 'kathete'] } },
    unabhaengigeLoesung(i) {
      const a = tex(i, 'angabe');
      const z = zahlen(a.replace(/rechte Winkel bei C/, ''));
      if (a.includes('Abschnitte'))
        return { typ: 'zahl', wert: Math.sqrt((z[0] ?? 0) * (z[1] ?? 0)) };
      return { typ: 'zahl', wert: Math.sqrt((z[0] ?? 0) * (z[1] ?? 0)) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 20, M: 35 },
  });
});

describe('Welcher Satz passt (E)', () => {
  pflichttests(pySatzWahl, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const g = tex(i, 'gegeben') + ' ' + tex(i, 'gesucht');
      const satz =
        /Höhe|Abschnitte p und q/.test(g) && !g.includes('Hypotenuse c')
          ? 'Höhensatz'
          : g.includes('Abschnitt')
            ? 'Kathetensatz'
            : 'Satz des Pythagoras';
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === satz) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { E: 6 },
  });
});

describe('Sachaufgaben', () => {
  pflichttests(pySach, {
    niveaus: {
      G: { arten: ['leiter', 'diagonale', 'dach'] },
      M: { arten: ['leiter', 'diagonale', 'dach', 'raumdiagonale'] },
    },
    unabhaengigeLoesung(i) {
      const s = tex(i, 'situation');
      const z = zahlen(s);
      let w: number;
      if (s.includes('Leiter')) w = Math.sqrt((z[0] ?? 0) ** 2 - (z[1] ?? 0) ** 2);
      else if (s.includes('Feld')) w = Math.hypot(z[0] ?? 0, z[1] ?? 0);
      else if (s.includes('Dach')) w = Math.sqrt((z[1] ?? 0) ** 2 - ((z[0] ?? 0) / 2) ** 2);
      else w = Math.hypot(z[0] ?? 0, z[1] ?? 0, z[2] ?? 0);
      return {
        typ: 'zahl',
        wert:
          Number.isInteger(r1(w) * 1) && Math.abs(w - Math.round(w)) < 1e-9 ? Math.round(w) : r1(w),
      };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 40, M: 60 },
  });
});

describe('Die richtige Rechnung wählen (E)', () => {
  pflichttests(pyAnsatz, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 40 },
  });

  it('die richtige Option rechnet wirklich die Raumdiagonale', () => {
    const i = pyAnsatz.erzeuge(1, {});
    const k = i.loesung.typ === 'auswahl' ? i.loesung.wert : -1;
    expect(i.optionen?.[k]?.text?.de).toMatch(/\^2 \+ .*\^2 \+ .*\^2/);
  });
});
