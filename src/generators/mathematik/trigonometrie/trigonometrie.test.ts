import { describe } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  trBegruenden,
  trBerechnen,
  trSach,
  trSteigung,
  trVerhaeltnis,
  trWechsel,
} from './trigonometrie';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};
const G = Math.PI / 180;
const r1 = (x: number) => Math.round(x * 10) / 10;
const zahlen = (s: string) =>
  [...s.replace(/−/g, '-').matchAll(/(-?\d+(?:,\d+)?)/g)].map((m) =>
    Number((m[1] ?? '').replace(',', '.')),
  );
const ECKE: Record<string, string> = { α: 'A', β: 'B', γ: 'C' };

/** Rollen aus der Lage des rechten Winkels und der Ecke des Winkels, unabhängig bestimmt */
function rollenAus(i: Instanz, winkelEcke: string) {
  const b = i.bild?.beschreibung.de ?? '';
  const rechts = /rechte Winkel liegt bei ([ABC])/.exec(b)?.[1] ?? 'C';
  const dritte = ['A', 'B', 'C'].find((e) => e !== rechts && e !== winkelEcke) ?? 'A';
  return { h: rechts.toLowerCase(), g: winkelEcke.toLowerCase(), a: dritte.toLowerCase(), b };
}

describe('Seitenverhältnis erkennen', () => {
  pflichttests(trVerhaeltnis, {
    niveaus: { G: { gemischt: false }, M: { gemischt: true } },
    unabhaengigeLoesung(i) {
      const f = tex(i, 'funktion').replace('\\', '');
      const w = tex(i, 'winkel');
      const ecke = { '\\alpha': 'A', '\\beta': 'B', '\\gamma': 'C' }[w] ?? 'A';
      const { h, g, a } = rollenAus(i, ecke);
      const [z, n] = f === 'sin' ? [g, h] : f === 'cos' ? [a, h] : [g, a];
      const soll = `$\\frac{${z}}{${n}}$`;
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === soll) };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) >= 3 ? [] : ['mindestens drei Optionen']),
    mindestensVerschieden: { G: 6, M: 18 },
  });
});

describe('Warum nur vom Winkel (E)', () => {
  pflichttests(trBegruenden, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 10 },
  });
});

describe('Seite oder Winkel berechnen', () => {
  pflichttests(trBerechnen, {
    niveaus: { G: { gemischt: false }, M: { gemischt: true } },
    unabhaengigeLoesung(i) {
      const gesucht = tex(i, 'gesucht');
      const b = i.bild?.beschreibung.de ?? '';
      const werte: Record<string, number> = {};
      for (const m of b.matchAll(/([abc]) = (\d+(?:,\d+)?) cm/g))
        werte[m[1] ?? ''] = Number((m[2] ?? '').replace(',', '.'));
      const winkelBuchstabe = /(α|β|γ)/.exec(gesucht)?.[1] ?? 'α';
      const { h, g, a } = rollenAus(i, ECKE[winkelBuchstabe] ?? 'A');
      if (gesucht.startsWith('den Winkel')) {
        const wert =
          werte[h] !== undefined
            ? Math.asin((werte[g] ?? 0) / (werte[h] ?? 1))
            : Math.atan((werte[g] ?? 0) / (werte[a] ?? 1));
        return { typ: 'zahl', wert: r1(wert / G) };
      }
      const w = zahlen(/= (\d+)°/.exec(gesucht)?.[1] ?? '0')[0] ?? 0;
      const seite = /Seite ([abc])/.exec(gesucht)?.[1];
      const hyp = werte[h] ?? 0;
      return { typ: 'zahl', wert: r1(seite === g ? hyp * Math.sin(w * G) : hyp * Math.cos(w * G)) };
    },
    grenzverletzungen: (i) => (i.bild ? [] : ['Skizze fehlt']),
    mindestensVerschieden: { G: 80, M: 90 },
  });
});

describe('Vom anderen Winkel aus (E)', () => {
  pflichttests(trWechsel, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 10 },
  });
});

describe('Sachaufgaben', () => {
  pflichttests(trSach, {
    niveaus: { G: { arten: ['turm', 'rampe'] }, M: { arten: ['turm', 'rampe', 'leiter'] } },
    unabhaengigeLoesung(i) {
      const s = tex(i, 'situation');
      const z = zahlen(s);
      if (s.includes('Turm'))
        return { typ: 'zahl', wert: r1((z[0] ?? 0) * Math.tan((z[1] ?? 0) * G)) };
      if (s.includes('Rampe'))
        return { typ: 'zahl', wert: r1((z[0] ?? 0) * Math.sin((z[1] ?? 0) * G)) };
      return { typ: 'zahl', wert: r1(Math.acos((z[1] ?? 0) / (z[0] ?? 1)) / G) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 80, M: 80 },
  });
});

describe('Steigung in Prozent und Grad (E)', () => {
  pflichttests(trSteigung, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const p = i.platzhalter['prozent'] as number;
      const soll = `etwa ${String(r1(Math.atan(p / 100) / G)).replace('.', ',')}°`;
      return {
        typ: 'auswahl',
        wert: (i.optionen ?? []).findIndex(
          (o) => o.text?.de.startsWith(soll) && o.text.de.includes('tan'),
        ),
      };
    },
    grenzverletzungen: (i) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
    mindestensVerschieden: { E: 7 },
  });
});
