import { zahlDeutsch } from '../../../core/learning/format';
import type { Fehlerbild, Generator } from '../../../core/learning/generator';
import { rng, type Rng } from '../../../core/rng/rng';

export interface ZahlenOrdnenParameter {
  /** Anzahl der Zahlen (3 … 6). */
  readonly anzahl: number;
  /** Stellenzahl der kürzesten Zahl; die längste hat eine Stelle mehr (3 … 11). */
  readonly stellen: number;
}

function zufallszahl(r: Rng, stellen: number, ersteZiffer?: number): number {
  let z = ersteZiffer ?? r.int(1, 9);
  for (let i = 1; i < stellen; i++) z = z * 10 + r.int(0, 9);
  return z;
}

const aufsteigend = (a: number, b: number) => a - b;
/** Fehler: Zahlen wie Wörter sortiert („10 345“ vor „9 812“, weil 1 < 9). */
const wieWoerter = (a: number, b: number) =>
  String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;

/**
 * „Ordne die Zahlen der Größe nach. Beginne mit der kleinsten.“
 * Vorlage: M.ZO.NZ.ORDNEN.DER-GROESSE-NACH (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const zahlenOrdnen: Generator<ZahlenOrdnenParameter> = {
  id: 'nz.zahlen-ordnen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['wie-woerter-sortiert', 'absteigend'],

  erzeuge(seed, p) {
    if (p.anzahl < 3 || p.anzahl > 6 || p.stellen < 3 || p.stellen > 11) {
      throw new RangeError('anzahl muss in 3 … 6, stellen in 3 … 11 liegen');
    }
    const r = rng(seed);
    const zahlen = new Set<number>();
    // Falle 1: kürzere Zahl mit großer Anfangsziffer, längere mit kleiner (9 812 / 10 345).
    zahlen.add(zufallszahl(r, p.stellen, r.int(5, 9)));
    zahlen.add(zufallszahl(r, p.stellen + 1, r.int(1, 4)));
    // Falle 2: gleich lange Zahlen mit gleichem Anfang, Unterschied erst weiter hinten.
    const basis = zufallszahl(r, p.stellen);
    zahlen.add(basis);
    while (zahlen.size < p.anzahl) {
      const stelle = r.int(0, p.stellen - 2);
      const abweichung = (r.int(1, 9) - (Math.floor(basis / 10 ** stelle) % 10)) * 10 ** stelle;
      const neu = basis + abweichung;
      if (String(neu).length === p.stellen) zahlen.add(neu);
      else zahlen.add(zufallszahl(r, p.stellen + r.int(0, 1)));
    }

    const elemente = [...zahlen];
    // Gemischt anzeigen (Fisher-Yates mit dem Seed-Zufall), nie schon geordnet.
    for (let i = elemente.length - 1; i > 0; i--) {
      const j = r.int(0, i);
      [elemente[i], elemente[j]] = [elemente[j] as number, elemente[i] as number];
    }
    const richtig = [...elemente].sort(aufsteigend);
    if (elemente.every((x, i) => x === richtig[i])) elemente.reverse();

    const kandidaten: [string, number[]][] = [
      ['wie-woerter-sortiert', [...elemente].sort(wieWoerter)],
      ['absteigend', [...richtig].reverse()],
    ];
    const gleich = (a: readonly number[], b: readonly number[]) => a.every((x, i) => x === b[i]);
    const fehlerbilder: Fehlerbild[] = [];
    const vergeben: number[][] = [richtig];
    for (const [id, folge] of kandidaten) {
      if (vergeben.some((v) => gleich(v, folge))) continue;
      vergeben.push(folge);
      fehlerbilder.push({ id, antwort: { typ: 'reihenfolge', wert: folge } });
    }

    return {
      platzhalter: {},
      elemente,
      loesung: { typ: 'reihenfolge', wert: richtig },
      loesungsweg: [
        {
          de: 'Zuerst die Anzahl der Stellen vergleichen: Mehr Stellen bedeuten eine größere Zahl.',
        },
        { de: 'Bei gleich vielen Stellen von links Ziffer für Ziffer vergleichen.' },
        { de: richtig.map(zahlDeutsch).join(' < ') },
      ],
      fehlerbilder,
    };
  },
};
