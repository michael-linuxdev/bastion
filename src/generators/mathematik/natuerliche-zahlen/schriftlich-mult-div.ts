import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl, zahlMitStellen } from '../../hilfen';

/** Fehler „Übertrag vergessen“ beim Malnehmen mit einstelliger Zahl. */
export function malOhneUebertrag(a: number, b: number): number {
  // Jede Ziffer mal b, nur die Einerziffer notiert – außer bei der ersten (linken) Stelle.
  const z = String(a).split('').map(Number);
  return Number(z.map((x, i) => (i === 0 ? String(x * b) : String((x * b) % 10))).join(''));
}

export interface MultiplizierenParameter {
  readonly stellen_a_min: number;
  readonly stellen_a_max: number;
  /** Stellenzahl des zweiten Faktors (1 … 3). */
  readonly stellen_b: number;
}

/** „Berechne schriftlich: 347 · 26“ – Vorlage M.ZO.NZ.MULT.SCHRIFTLICH */
export const schriftlichMultiplizieren: Generator<MultiplizierenParameter> = {
  id: 'nz.schriftlich-multiplizieren',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['uebertrag-vergessen', 'teilprodukt-nicht-eingerueckt'],

  erzeuge(seed, p) {
    verlange(p.stellen_b >= 1 && p.stellen_b <= 3, 'stellen_b: 1 … 3');
    verlange(
      p.stellen_a_min >= 2 && p.stellen_a_min <= p.stellen_a_max && p.stellen_a_max <= 6,
      'stellen_a: 2 … 6',
    );
    const r = rng(seed);
    const a = zahlMitStellen(r, r.int(p.stellen_a_min, p.stellen_a_max));
    let b = zahlMitStellen(r, p.stellen_b);
    if (p.stellen_b === 1 && b === 1) b = r.int(2, 9);
    const bz = String(b).split('').map(Number).reverse();
    // Teilprodukte ohne Einrücken einfach addiert
    const ohneEinruecken = bz.reduce((s, z) => s + a * z, 0);

    return {
      platzhalter: { a, b },
      loesung: zahl(a * b),
      loesungsweg: [
        ...(p.stellen_b > 1
          ? bz
              .map((z, i) =>
                de(`${zahlDeutsch(a)} · ${z}${'0'.repeat(i)} = ${zahlDeutsch(a * z * 10 ** i)}`),
              )
              .reverse()
          : [de('Multipliziere jede Ziffer von rechts nach links und übertrage die Zehner.')]),
        de(`${zahlDeutsch(a)} · ${zahlDeutsch(b)} = ${zahlDeutsch(a * b)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(a * b), [
        ['uebertrag-vergessen', p.stellen_b === 1 ? zahl(malOhneUebertrag(a, b)) : undefined],
        ['teilprodukt-nicht-eingerueckt', p.stellen_b > 1 ? zahl(ohneEinruecken) : undefined],
      ]),
    };
  },
};

export interface DividierenParameter {
  readonly stellen_min: number;
  readonly stellen_max: number; // Stellen des Dividenden, ≤ 7
  readonly mit_rest: boolean;
}

/** Fehler „Null im Ergebnis vergessen“: Ziffern 0 im Quotienten weglassen. */
const ohneNullen = (q: number) => Number(String(q).replace(/0/g, '') || '0');

/** „Berechne schriftlich: 4 218 : 6“ – Vorlagen M.ZO.NZ.DIV.OHNE-REST und .MIT-REST */
export const schriftlichDividieren: Generator<DividierenParameter> = {
  id: 'nz.schriftlich-dividieren',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['null-vergessen', 'rest-zu-gross', 'rest-vergessen'],

  erzeuge(seed, p) {
    verlange(
      p.stellen_min >= 2 && p.stellen_min <= p.stellen_max && p.stellen_max <= 7,
      'stellen: 2 … 7',
    );
    const r = rng(seed);
    const b = r.int(2, 9);
    const stellen = r.int(p.stellen_min, p.stellen_max);
    let q = Math.floor(zahlMitStellen(r, stellen) / b);
    // jede zweite Aufgabe mit einer 0 im Ergebnis – die häufigste Fehlerquelle
    if (r.int(0, 1) === 0 && q >= 100) {
      const s = String(q);
      const i = r.int(1, s.length - 2);
      q = Number(s.slice(0, i) + '0' + s.slice(i + 1));
    }
    if (q < 2) q = r.int(12, 99);
    const rest = p.mit_rest ? r.int(1, b - 1) : 0;
    // Der Rest darf den Dividenden nicht über die Stellengrenze heben (9 999 → 10 001).
    if (String(q * b + rest).length > stellen) q -= 1;
    const a = q * b + rest;
    const loesung: Loesung = p.mit_rest
      ? { typ: 'mit-rest', wert: { quotient: q, rest } }
      : zahl(q);
    const alsLoesung = (quotient: number, re: number): Loesung =>
      p.mit_rest ? { typ: 'mit-rest', wert: { quotient, rest: re } } : zahl(quotient);

    return {
      platzhalter: { a, b },
      loesung,
      loesungsweg: [
        de(
          'Teile von links nach rechts Stelle für Stelle. Passt der Teiler nicht hinein, schreibe eine 0 ins Ergebnis.',
        ),
        de(
          p.mit_rest
            ? `${zahlDeutsch(a)} : ${b} = ${zahlDeutsch(q)} Rest ${rest}`
            : `${zahlDeutsch(a)} : ${b} = ${zahlDeutsch(q)}`,
        ),
        de(`Probe: ${zahlDeutsch(q)} · ${b}${p.mit_rest ? ` + ${rest}` : ''} = ${zahlDeutsch(a)}`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['null-vergessen', String(q).includes('0') ? alsLoesung(ohneNullen(q), rest) : undefined],
        ['rest-zu-gross', p.mit_rest && q > 1 ? alsLoesung(q - 1, rest + b) : undefined],
        ['rest-vergessen', p.mit_rest ? alsLoesung(q, 0) : undefined],
      ]),
    };
  },
};
