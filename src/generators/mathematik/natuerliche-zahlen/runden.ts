import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, runde, verlange, zahl, zahlMitStellen } from '../../hilfen';

/** Rundungsstellen; Index k = Runden auf Vielfache von 10^k. */
export const RUNDUNGSSTELLEN: readonly (Sprachobjekt | undefined)[] = [
  undefined,
  de('Zehner'),
  de('Hunderter'),
  de('Tausender'),
  de('Zehntausender'),
  de('Hunderttausender'),
  de('Millionen'),
];

export interface RundenParameter {
  /** Kleinste und größte Rundungsstelle (1 = Zehner … 6 = Millionen). */
  readonly stelle_min: number;
  readonly stelle_max: number;
  /** Höchstens so viele Stellen hat die Zahl mehr als die Rundungsstelle (1 … 4). */
  readonly zusatzstellen_max: number;
}

/**
 * „Runde 4 372 auf Hunderter.“
 * Vorlage: M.ZO.NZ.RUNDEN.AUF-STELLE (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const rundenAufStelle: Generator<RundenParameter> = {
  id: 'nz.runden-auf-stelle',
  version: 1,
  platzhalter: ['zahl', 'stelle'],
  fehlerbildIds: ['falsche-richtung', 'uebertrag-vergessen', 'falsche-stelle'],

  erzeuge(seed, p) {
    verlange(
      p.stelle_min >= 1 && p.stelle_max <= 6 && p.stelle_min <= p.stelle_max,
      'stelle muss in 1 … 6 liegen',
    );
    verlange(p.zusatzstellen_max >= 1 && p.zusatzstellen_max <= 4, 'zusatzstellen_max: 1 … 4');
    const r = rng(seed);
    const k = r.int(p.stelle_min, p.stelle_max);
    const einheit = 10 ** k;
    let n = zahlMitStellen(r, k + r.int(1, p.zusatzstellen_max));
    // In jeder dritten Aufgabe eine 9 an der Rundungsstelle und Aufrunden: Übertrag!
    if (r.int(0, 2) === 0) {
      const ohne = n - (Math.floor(n / einheit) % 10) * einheit;
      n = ohne + 9 * einheit;
      const ziffer = Math.floor(n / 10 ** (k - 1)) % 10;
      if (ziffer < 5) n += (r.int(5, 9) - ziffer) * 10 ** (k - 1);
    }
    const richtig = runde(n, einheit);
    const ab = Math.floor(n / einheit) * einheit;
    const auf = ab + einheit;
    const entscheidend = Math.floor(n / 10 ** (k - 1)) % 10;
    const neunAufrunden = Math.floor(n / einheit) % 10 === 9 && richtig === auf;

    return {
      platzhalter: { zahl: n, stelle: RUNDUNGSSTELLEN[k] ?? de('') },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Entscheidend ist die Ziffer rechts neben der Rundungsstelle: ${entscheidend}.`),
        de(
          entscheidend >= 5
            ? `${entscheidend} ist 5 oder größer – also aufrunden.`
            : `${entscheidend} ist kleiner als 5 – also abrunden.`,
        ),
        de(`${zahlDeutsch(n)} ≈ ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['falsche-richtung', zahl(richtig === auf ? ab : auf)],
        ['uebertrag-vergessen', neunAufrunden ? zahl(richtig - 10 * einheit) : undefined],
        ['falsche-stelle', zahl(runde(n, einheit / 10))],
      ]),
    };
  },
};

export interface UeberschlagParameter {
  /** Stellenzahl der beiden Zahlen. */
  readonly stellen_min: number;
  readonly stellen_max: number;
  /** Rundungsstelle (1 = Zehner …); muss kleiner als stellen_min sein. */
  readonly stelle: number;
}

/**
 * „Überschlage 3 870 + 2 450. Runde dazu beide Zahlen auf Hunderter.“
 * Vorlage: M.ZO.NZ.RUNDEN.UEBERSCHLAG (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const ueberschlag: Generator<UeberschlagParameter> = {
  id: 'nz.ueberschlag',
  version: 1,
  platzhalter: ['a', 'b', 'zeichen', 'stelle'],
  fehlerbildIds: ['genau-gerechnet', 'eine-zahl-nicht-gerundet', 'ergebnis-gerundet'],

  erzeuge(seed, p) {
    verlange(p.stelle >= 1 && p.stelle < p.stellen_min, 'stelle muss kleiner als stellen_min sein');
    verlange(p.stellen_min <= p.stellen_max && p.stellen_max <= 9, 'stellen: höchstens 9');
    const r = rng(seed);
    const einheit = 10 ** p.stelle;
    const plus = r.int(0, 1) === 0;
    let a = zahlMitStellen(r, r.int(p.stellen_min, p.stellen_max));
    let b = zahlMitStellen(r, r.int(p.stellen_min, p.stellen_max));
    if (!plus && b > a) [a, b] = [b, a];
    if (!plus && runde(a, einheit) === runde(b, einheit)) a += 3 * einheit;
    const ra = runde(a, einheit);
    const rb = runde(b, einheit);
    const rechne = (x: number, y: number) => (plus ? x + y : x - y);
    const richtig = rechne(ra, rb);

    return {
      platzhalter: {
        a,
        b,
        zeichen: de(plus ? '+' : '−'),
        stelle: RUNDUNGSSTELLEN[p.stelle] ?? de(''),
      },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`${zahlDeutsch(a)} ≈ ${zahlDeutsch(ra)} und ${zahlDeutsch(b)} ≈ ${zahlDeutsch(rb)}`),
        de(`${zahlDeutsch(ra)} ${plus ? '+' : '−'} ${zahlDeutsch(rb)} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['genau-gerechnet', zahl(rechne(a, b))],
        ['eine-zahl-nicht-gerundet', zahl(rechne(ra, b))],
        ['ergebnis-gerundet', zahl(runde(rechne(a, b), einheit))],
      ]),
    };
  },
};
