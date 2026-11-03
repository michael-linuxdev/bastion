import { describe } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  stEinteilung,
  stHistogramm,
  stKlasse,
  stProzentpunkte,
  stMittelwerte,
  stPassenderMittelwert,
  stStreuung,
  stStreuungVergleich,
  stTaeuschung,
} from './statistik';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const einzigeOhneFehlerbild = (i: Instanz): Loesung => {
  const falsch = new Set(
    i.fehlerbilder.map((f) => (f.antwort.typ === 'auswahl' ? f.antwort.wert : -1)),
  );
  const frei = (i.optionen ?? []).map((_, k) => k).filter((k) => !falsch.has(k));
  return { typ: 'auswahl', wert: frei.length === 1 ? (frei[0] ?? -1) : -1 };
};
const r1 = (x: number) => Math.round(x * 10) / 10;
const werte = (s: string) => s.split('; ').map((x) => Number(x.replace(',', '.')));
const vier = {
  grenzverletzungen: (i: Instanz) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']),
};

describe('Mittelwerte bestimmen', () => {
  pflichttests(stMittelwerte, {
    niveaus: {
      G: { arten: ['modalwert', 'median'], gerade: false },
      M: { arten: ['median', 'mittel'], gerade: true },
    },
    unabhaengigeLoesung(i) {
      const w = werte(tex(i, 'werte'));
      const g = tex(i, 'gesucht');
      if (g.includes('Modalwert')) {
        let best = 0;
        let anzahl = 0;
        for (const x of w) {
          const k = w.filter((y) => y === x).length;
          if (k > anzahl) [best, anzahl] = [x, k];
        }
        return { typ: 'zahl', wert: best };
      }
      if (g.includes('Median')) {
        const s = [...w].sort((a, b) => a - b);
        const n = s.length;
        return {
          typ: 'zahl',
          wert: n % 2 ? (s[(n - 1) / 2] ?? 0) : ((s[n / 2 - 1] ?? 0) + (s[n / 2] ?? 0)) / 2,
        };
      }
      return { typ: 'zahl', wert: r1(w.reduce((a, b) => a + b, 0) / w.length) };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 80, M: 80 },
  });
});

describe('Passender Mittelwert (E)', () => {
  pflichttests(stPassenderMittelwert, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 20 },
  });
});

describe('Streuung', () => {
  pflichttests(stStreuung, {
    niveaus: { G: { sigma: false }, M: { sigma: true } },
    unabhaengigeLoesung(i) {
      const w = werte(tex(i, 'werte'));
      if (tex(i, 'gesucht').includes('Spannweite'))
        return { typ: 'zahl', wert: Math.max(...w) - Math.min(...w) };
      const m = w.reduce((a, b) => a + b, 0) / w.length;
      return {
        typ: 'zahl',
        wert: r1(Math.sqrt(w.reduce((a, x) => a + (x - m) ** 2, 0) / w.length)),
      };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 80, M: 80 },
  });
});

describe('Streuung vergleichen (E)', () => {
  pflichttests(stStreuungVergleich, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 20 },
  });
});

describe('Klassen zählen', () => {
  pflichttests(stKlasse, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const w = werte(tex(i, 'werte'));
      const von = i.platzhalter['von'] as number;
      const bis = i.platzhalter['bis'] as number;
      return { typ: 'zahl', wert: w.filter((x) => x >= von && x < bis).length };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 60 },
  });
});

describe('Histogramm ablesen', () => {
  pflichttests(stHistogramm, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const b = i.bild?.beschreibung.de ?? '';
      const klassen = [...b.matchAll(/(\d+) bis unter \d+: (\d+)/g)].map(
        (m) => [Number(m[1]), Number(m[2])] as const,
      );
      const f = tex(i, 'frage');
      const ab = /mindestens (\d+)/.exec(f);
      const grenze = ab ? Number(ab[1]) : -Infinity;
      return {
        typ: 'zahl',
        wert: klassen.filter(([g]) => g >= grenze).reduce((s, [, h]) => s + h, 0),
      };
    },
    grenzverletzungen: (i) => (i.bild ? [] : ['Histogramm fehlt']),
    mindestensVerschieden: { M: 60 },
  });
});

describe('Klasseneinteilung (E)', () => {
  pflichttests(stEinteilung, {
    niveaus: { E: {} },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { E: 3 },
  });
});

describe('Täuschung erkennen', () => {
  pflichttests(stTaeuschung, {
    niveaus: { G: { stufe: 'einfach' }, E: { stufe: 'schwer' } },
    unabhaengigeLoesung: einzigeOhneFehlerbild,
    ...vier,
    mindestensVerschieden: { G: 15, E: 15 },
  });
});

describe('Prozent und Prozentpunkte', () => {
  pflichttests(stProzentpunkte, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const [v = 0, n = 0] = [...tex(i, 'situation').matchAll(/(\d+(?:,\d+)?) %/g)].map((m) =>
        Number((m[1] ?? '').replace(',', '.')),
      );
      return { typ: 'zahl', wert: Math.round(((n - v) / v) * 1000) / 10 };
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 15 },
  });
});
