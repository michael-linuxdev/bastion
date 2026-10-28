import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { innenwinkel, vieleckSymmetrie } from './regelmaessig';

// Parameter wie in den Vorlagen (content/…/M.RF.DV.REGELMAESSIG)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e6) / 1e6 });
const zahlAus = (t: string) => Number(t.replace(',', '.'));

/** Eckenzahl aus dem Bild: Punkte im points-Attribut des Vielecks zählen */
const eckenImBild = (i: Instanz) =>
  (/points="([^"]+)"/.exec(i.bild?.svg ?? '')?.[1] ?? '').trim().split(/\s+/).length;

pflichttests(vieleckSymmetrie, {
  niveaus: { G: { winkel: false }, M: { winkel: true } },
  unabhaengigeLoesung(i, p) {
    const n = eckenImBild(i);
    return zahlL(p.winkel ? 360 / n : n);
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) ? [] : ['Winkel nicht ganz'],
  mindestensVerschieden: { G: 8, M: 8 },
});

pflichttests(innenwinkel, {
  niveaus: { G: { einzeln: false }, M: { einzeln: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const nameZuN: Record<string, number> = {
      Quadrat: 4,
      Fünfeck: 5,
      Sechseck: 6,
      Achteck: 8,
      Neuneck: 9,
      Zehneck: 10,
      Zwölfeck: 12,
    };
    const summe = /Innenwinkelsumme eines (\d+)-Ecks/.exec(a);
    if (summe) return zahlL((Number(summe[1]) - 2) * 180);
    const ecken = /jeder Innenwinkel (\d+(?:,\d+)?)° groß/.exec(a);
    if (ecken) return zahlL(360 / (180 - zahlAus(ecken[1] ?? '')));
    const name = Object.keys(nameZuN).find((k) => a.includes(k)) ?? '';
    const n = nameZuN[name] ?? NaN;
    return zahlL(((n - 2) * 180) / n);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 7, M: 12 },
});
