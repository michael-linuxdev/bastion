import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl, zahlMitStellen } from '../../hilfen';

const ziffern = (n: number) => String(n).split('').reverse().map(Number);
const ausZiffern = (z: readonly number[]) => Number([...z].reverse().join('') || '0');

/** Fehler „Übertrag vergessen“: stellenweise addieren, nur die Einerziffer behalten. */
export function addiertOhneUebertrag(summanden: readonly number[]): number {
  const laenge = Math.max(...summanden.map((s) => String(s).length));
  const z: number[] = [];
  for (let i = 0; i < laenge; i++) {
    z.push(summanden.reduce((s, n) => s + (ziffern(n)[i] ?? 0), 0) % 10);
  }
  return ausZiffern(z);
}

export interface AddierenParameter {
  readonly anzahl: number; // 2 … 4 Summanden
  readonly stellen_min: number;
  readonly stellen_max: number; // ≤ 9
}

/** „Berechne schriftlich: 3 482 + 917“ – Vorlage M.ZO.NZ.ADD-SUB.ADDIEREN */
export const schriftlichAddieren: Generator<AddierenParameter> = {
  id: 'nz.schriftlich-addieren',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['uebertrag-vergessen', 'stellen-verrutscht'],

  erzeuge(seed, p) {
    verlange(p.anzahl >= 2 && p.anzahl <= 4, 'anzahl: 2 … 4');
    verlange(
      p.stellen_min >= 2 && p.stellen_min <= p.stellen_max && p.stellen_max <= 9,
      'stellen: 2 … 9',
    );
    const r = rng(seed);
    let summanden: number[] = [];
    // Neu würfeln, bis mindestens ein Übertrag vorkommt (höchstens 20 Versuche, INHALTSFORMAT §6.1).
    for (let v = 0; v < 20; v++) {
      summanden = Array.from({ length: p.anzahl }, () =>
        zahlMitStellen(r, r.int(p.stellen_min, p.stellen_max)),
      );
      if (addiertOhneUebertrag(summanden) !== summanden.reduce((a, b) => a + b, 0)) break;
    }
    const summe = summanden.reduce((a, b) => a + b, 0);
    const laengste = Math.max(...summanden.map((s) => String(s).length));
    const linksbuendig = summanden.reduce((s, n) => s + n * 10 ** (laengste - String(n).length), 0);

    return {
      platzhalter: { aufgabe: de(summanden.map(zahlDeutsch).join(' + ')) },
      loesung: zahl(summe),
      loesungsweg: [
        de(
          'Schreibe die Zahlen stellengerecht untereinander: Einer unter Einer, Zehner unter Zehner.',
        ),
        de(
          'Addiere von rechts nach links. Ist eine Spaltensumme 10 oder größer, schreibe die Einer hin und übertrage die Zehner in die nächste Spalte.',
        ),
        de(`${summanden.map(zahlDeutsch).join(' + ')} = ${zahlDeutsch(summe)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(summe), [
        ['uebertrag-vergessen', zahl(addiertOhneUebertrag(summanden))],
        ['stellen-verrutscht', zahl(linksbuendig)],
      ]),
    };
  },
};

export interface SubtrahierenParameter {
  readonly stellen_min: number;
  readonly stellen_max: number; // ≤ 9
}

/** „Berechne schriftlich: 5 203 − 1 876“ – Vorlage M.ZO.NZ.ADD-SUB.SUBTRAHIEREN */
export const schriftlichSubtrahieren: Generator<SubtrahierenParameter> = {
  id: 'nz.schriftlich-subtrahieren',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['kleinere-von-groesserer', 'entbuendeln-vergessen'],

  erzeuge(seed, p) {
    verlange(
      p.stellen_min >= 2 && p.stellen_min <= p.stellen_max && p.stellen_max <= 9,
      'stellen: 2 … 9',
    );
    const r = rng(seed);
    let a = 0;
    let b = 0;
    for (let v = 0; v < 20; v++) {
      a = zahlMitStellen(r, r.int(p.stellen_min, p.stellen_max));
      b = zahlMitStellen(r, r.int(p.stellen_min, String(a).length));
      if (b >= a) [a, b] = [b, a];
      // mindestens eine Stelle, an der entbündelt werden muss
      if (ziffern(b).some((zb, i) => zb > (ziffern(a)[i] ?? 0)) && a !== b) break;
    }
    const za = ziffern(a);
    const zb = ziffern(b);
    // Fehler 1: an jeder Stelle die kleinere von der größeren Ziffer abgezogen
    const betrag = ausZiffern(za.map((x, i) => Math.abs(x - (zb[i] ?? 0))));
    // Fehler 2: entbündelt (10 dazu), aber die nächste Stelle nicht verringert
    const ohneBorgen = ausZiffern(za.map((x, i) => (x - (zb[i] ?? 0) + 10) % 10));

    return {
      platzhalter: { a, b },
      loesung: zahl(a - b),
      loesungsweg: [
        de('Schreibe die Zahlen stellengerecht untereinander.'),
        de(
          'Subtrahiere von rechts nach links. Reicht eine Ziffer oben nicht, entbündle: Nimm 1 von der nächsten Stelle links und rechne mit 10 mehr.',
        ),
        de(`${zahlDeutsch(a)} − ${zahlDeutsch(b)} = ${zahlDeutsch(a - b)}`),
        de(`Probe: ${zahlDeutsch(a - b)} + ${zahlDeutsch(b)} = ${zahlDeutsch(a)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(a - b), [
        ['kleinere-von-groesserer', zahl(betrag)],
        ['entbuendeln-vergessen', zahl(ohneBorgen)],
      ]),
    };
  },
};
