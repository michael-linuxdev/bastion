import { describe, expect, it } from 'vitest';
import type { Bruch } from '../../../core/learning/bruch';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { anteilAblesen, anteilVon, bildZuBruch, zahlenstrahlAblesen } from './begriff';

// Unabhängig: aus der Bildbeschreibung lesen (die auch der Screenreader vorliest).
const ausBeschreibung = (i: Instanz, muster: RegExp) => {
  const m = muster.exec(i.bild?.beschreibung.de ?? '');
  return m ? m.slice(1).map(Number) : [];
};
// Unabhängig: im SVG gefüllte Flächen zählen.
const gefuellt = (svg: string) => (svg.match(/fill-opacity/g) ?? []).length;
const flaechen = (svg: string) => (svg.match(/<(rect|path d="M[0-9.]+ [0-9.]+ L)/g) ?? []).length;

pflichttests(anteilAblesen, {
  niveaus: { G: { nenner_max: 6 }, M: { nenner_max: 12 } },
  unabhaengigeLoesung(i) {
    const svg = i.bild?.svg ?? '';
    return { typ: 'bruch', wert: { zaehler: gefuellt(svg), nenner: flaechen(svg) } };
  },
  grenzverletzungen(i, p) {
    const [n] = ausBeschreibung(i, /aus (\d+) gleich/);
    return (n ?? 0) > p.nenner_max ? ['zu viele Teile'] : [];
  },
  mindestensVerschieden: { G: 15, M: 60 },
});

pflichttests(bildZuBruch, {
  niveaus: { G: { nenner_max: 6 }, M: { nenner_max: 12 } },
  unabhaengigeLoesung(i) {
    const b = i.platzhalter['bruch'] as Bruch;
    const index = (i.optionen ?? []).findIndex(
      (o) => flaechen(o.bild?.svg ?? '') === b.nenner && gefuellt(o.bild?.svg ?? '') === b.zaehler,
    );
    return { typ: 'auswahl', wert: index };
  },
  grenzverletzungen(i) {
    const svgs = (i.optionen ?? []).map((o) => o.bild?.svg ?? '');
    return new Set(svgs).size !== 4 ? ['Bilder nicht verschieden'] : [];
  },
  mindestensVerschieden: { G: 15, M: 40 },
});

for (const dezimal of [false, true]) {
  describe(dezimal ? 'Dezimal' : 'Bruch', () => {
    pflichttests(zahlenstrahlAblesen, {
      niveaus: {
        G: { nenner: [2, 4, 5, 10], bis: 1, dezimal },
        M: { nenner: [3, 4, 5, 6, 8, 10], bis: 2, dezimal },
      },
      unabhaengigeLoesung(i) {
        const [n, k] = ausBeschreibung(i, /in (\d+) gleiche Abschnitte.*am (\d+)\. Teilstrich/) as [
          number,
          number,
        ];
        return dezimal
          ? { typ: 'zahl', wert: Math.round((k / n) * 1e6) / 1e6 }
          : { typ: 'bruch', wert: { zaehler: k, nenner: n } };
      },
      grenzverletzungen(i, p) {
        const [n, k] = ausBeschreibung(i, /in (\d+) gleiche Abschnitte.*am (\d+)\. Teilstrich/) as [
          number,
          number,
        ];
        return k <= 0 || k >= n * p.bis || k % n === 0 ? [`Markierung bei ${k}/${n}`] : [];
      },
      mindestensVerschieden: dezimal ? { G: 9, M: 18 } : { G: 15, M: 40 },
    });
  });
}

for (const stammbruch of [true, false]) {
  describe(stammbruch ? 'Stammbruch' : 'allgemein', () => {
    pflichttests(anteilVon, {
      niveaus: {
        G: { stammbruch, nenner_max: 6, ganzes_max: 60 },
        M: { stammbruch, nenner_max: 12, ganzes_max: 1000 },
      },
      unabhaengigeLoesung(i) {
        const b = i.platzhalter['anteil'] as Bruch;
        return { typ: 'zahl', wert: ((i.platzhalter['ganzes'] as number) * b.zaehler) / b.nenner };
      },
      grenzverletzungen(i) {
        const b = i.platzhalter['anteil'] as Bruch;
        return (i.platzhalter['ganzes'] as number) % b.nenner !== 0 ? ['Ganzes nicht teilbar'] : [];
      },
      mindestensVerschieden: { G: 70, M: 95 },
    });
  });
}

describe('Bilder', () => {
  it('beschreiben genau, was zu sehen ist', () => {
    const i = anteilAblesen.erzeuge(5, { nenner_max: 8 });
    expect(i.bild?.beschreibung.de).toMatch(/gleich großen (Feldern|Teilen)/);
  });
});
