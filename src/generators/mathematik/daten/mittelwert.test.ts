import { describe } from 'vitest';
import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { mittelwert } from './mittelwert';

const werte = (t: string) => t.replaceAll(String.fromCharCode(0x202f), '').split('; ').map(Number);

for (const noten of [false, true]) {
  describe(noten ? 'Noten' : 'Zahlen', () => {
    pflichttests(mittelwert, {
      niveaus: noten
        ? {
            G: { anzahl_min: 3, anzahl_max: 5, wert_max: 6, noten, ganzzahlig: false },
            M: { anzahl_min: 5, anzahl_max: 8, wert_max: 6, noten, ganzzahlig: false },
          }
        : {
            G: { anzahl_min: 3, anzahl_max: 4, wert_max: 30, noten, ganzzahlig: true },
            M: { anzahl_min: 4, anzahl_max: 6, wert_max: 200, noten, ganzzahlig: false },
          },
      unabhaengigeLoesung(i) {
        const w = werte((i.platzhalter['werte'] as Sprachobjekt).de);
        // Mit ganzen Zahlen gerechnet: Summe · 10 / Anzahl, kaufmännisch gerundet
        const summe = w.reduce((a, b) => a + b, 0);
        if (noten) return { typ: 'zahl', wert: Math.floor((summe * 10) / w.length + 0.5) / 10 };
        return { typ: 'zahl', wert: Math.round((summe / w.length) * 1e6) / 1e6 };
      },
      grenzverletzungen(i, p) {
        const w = werte((i.platzhalter['werte'] as Sprachobjekt).de);
        const f: string[] = [];
        if (w.length < p.anzahl_min || w.length > p.anzahl_max) f.push('Anzahl');
        if (w.some((x) => x < 1 || x > p.wert_max + p.anzahl_max)) f.push('Wert außerhalb');
        if (p.ganzzahlig && w.reduce((a, b) => a + b, 0) % w.length !== 0) f.push('geht nicht auf');
        return f;
      },
      mindestensVerschieden: noten ? { G: 90, M: 98 } : { G: 95, M: 98 },
    });
  });
}
