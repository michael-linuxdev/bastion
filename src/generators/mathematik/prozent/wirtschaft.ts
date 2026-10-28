// Prozente in der Wirtschaft – Klasse 8 (LEHRPLAN §8d, M.ZO.PZ.WIRTSCHAFT und
// M.ZO.PZ.ANGEBOTE): Rabatt, Skonto, Mehrwertsteuer, Rechnungen prüfen, Angebote
// vergleichen, Ratenkauf. Geld wird in Cent gerechnet, alle Ergebnisse sind ganze Cent.
import { runde10 } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, zahl } from '../../hilfen';
import { euro } from './prozent';

const centZahl = (cent: number) => zahl(runde10(cent / 100, 2));
const MWST = 19;
const WAREN = [
  'Ein Fahrrad',
  'Ein Laptop',
  'Ein Sofa',
  'Eine Waschmaschine',
  'Ein Fernseher',
  'Ein Schreibtisch',
] as const;

// ---------------------------------------------------------------------------
// Rabatt, Skonto, Mehrwertsteuer (M.ZO.PZ.WIRTSCHAFT)

export interface WirtschaftParameter {
  /** false: ein Schritt; true: Rabatt und Skonto nacheinander oder Netto aus Brutto */
  readonly mehrstufig: boolean;
}

/** „Ein Fahrrad kostet 400 €. Es gibt 15 % Rabatt. Was kostet es jetzt?“ */
export const rabattSkonto: Generator<WirtschaftParameter> = {
  id: 'pz.rabatt-skonto',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['nur-prozentwert', 'aufgeschlagen', 'prozente-addiert', 'mwst-abgezogen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ware = r.pick(WAREN);
    if (!p.mehrstufig) {
      const art = r.pick(['rabatt', 'skonto', 'mwst'] as const);
      if (art === 'mwst') {
        const netto = 100 * r.int(20, 900);
        const steuer = (netto * MWST) / 100;
        const richtig = centZahl(netto + steuer);
        return {
          platzhalter: {
            aufgabe: de(
              `${ware} kostet ${euro(netto)} ohne Mehrwertsteuer (netto). Dazu kommen 19 % Mehrwertsteuer. Wie viel Euro kostet es mit Mehrwertsteuer (brutto)?`,
            ),
          },
          loesung: richtig,
          loesungsweg: [
            de(`Mehrwertsteuer: 19 % von ${euro(netto)} = ${euro(steuer)}`),
            de(`Brutto: ${euro(netto)} + ${euro(steuer)} = ${euro(netto + steuer)}`),
          ],
          fehlerbilder: fehlerbilderAus(richtig, [
            ['nur-prozentwert', centZahl(steuer)],
            ['mwst-abgezogen', centZahl(netto - steuer)],
          ]),
        };
      }
      const satz =
        art === 'rabatt' ? r.pick([5, 10, 15, 20, 25, 30, 40] as const) : r.pick([2, 3] as const);
      const preis = 100 * r.int(10, 900);
      const nachlass = (preis * satz) / 100;
      const richtig = centZahl(preis - nachlass);
      return {
        platzhalter: {
          aufgabe: de(
            art === 'rabatt'
              ? `${ware} kostet ${euro(preis)}. Im Angebot gibt es ${satz} % Rabatt. Wie viel Euro kostet es jetzt?`
              : `Eine Rechnung über ${euro(preis)} wird innerhalb von 10 Tagen bezahlt. Dafür gibt es ${satz} % Skonto. Wie viel Euro werden überwiesen?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `${art === 'rabatt' ? 'Rabatt' : 'Skonto'}: ${satz} % von ${euro(preis)} = ${euro(nachlass)}`,
          ),
          de(`${euro(preis)} − ${euro(nachlass)} = ${euro(preis - nachlass)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['nur-prozentwert', centZahl(nachlass)],
          ['aufgeschlagen', centZahl(preis + nachlass)],
        ]),
      };
    }
    if (r.int(0, 1) === 0) {
      // Rabatt, dann Skonto auf den neuen Preis
      const rabatt = r.pick([10, 15, 20, 25] as const);
      const skonto = r.pick([2, 3] as const);
      const preis = 100 * (skonto === 2 ? 50 : 100) * r.int(1, 15);
      const nachRabatt = (preis * (100 - rabatt)) / 100;
      const ende = (nachRabatt * (100 - skonto)) / 100;
      const richtig = centZahl(ende);
      return {
        platzhalter: {
          aufgabe: de(
            `${ware} kostet ${euro(preis)}. Es gibt ${rabatt} % Rabatt. Wer sofort zahlt, bekommt auf den neuen Preis noch ${skonto} % Skonto. Wie viel Euro zahlt man dann?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Nach dem Rabatt: ${euro(preis)} · ${100 - rabatt} % = ${euro(nachRabatt)}`),
          de(`Nach dem Skonto: ${euro(nachRabatt)} · ${100 - skonto} % = ${euro(ende)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'prozente-addiert',
            Number.isInteger((preis * (100 - rabatt - skonto)) / 100)
              ? centZahl((preis * (100 - rabatt - skonto)) / 100)
              : undefined,
          ],
          ['nur-prozentwert', centZahl(preis - ende)],
        ]),
      };
    }
    // Netto aus Brutto
    const netto = 100 * r.int(20, 900);
    const brutto = (netto * (100 + MWST)) / 100;
    const richtig = centZahl(netto);
    const falsch = Math.round((brutto * (100 - MWST)) / 100);
    return {
      platzhalter: {
        aufgabe: de(
          `${ware} kostet ${euro(brutto)} einschließlich 19 % Mehrwertsteuer. Wie viel Euro kostet es ohne Mehrwertsteuer (netto)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de('Brutto ist 119 % des Nettopreises.'),
        de(`Netto: ${euro(brutto)} : 1,19 = ${euro(netto)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['mwst-abgezogen', centZahl(falsch)]]),
    };
  },
};

interface Zeile {
  readonly text: string;
  readonly cent: number;
}

/** Rechnung mit Preis, Rabatt, Zwischensumme, Mehrwertsteuer und Endbetrag – eine Zeile ist vielleicht falsch */
function rechnung(r: Rng) {
  const netto = 100 * r.int(1, 30) * r.pick([20, 40] as const);
  const rabatt = r.pick([10, 20, 25] as const);
  const nachlass = (netto * rabatt) / 100;
  const zwischen = netto - nachlass;
  const steuer = (zwischen * MWST) / 100;
  const ende = zwischen + steuer;
  const zeilen: Zeile[] = [
    { text: `Rabatt ${rabatt} %`, cent: nachlass },
    { text: 'Zwischensumme', cent: zwischen },
    { text: 'Mehrwertsteuer 19 %', cent: steuer },
    { text: 'Endbetrag', cent: ende },
  ];
  return { netto, rabatt, zeilen };
}

export interface RechnungParameter {
  /** false: Stimmt der Endbetrag?; true: Welche Zeile ist falsch? */
  readonly zeile: boolean;
}

/** „Prüfe die Rechnung.“ */
export const rechnungPruefen: Generator<RechnungParameter> = {
  id: 'pz.rechnung-pruefen',
  version: 1,
  platzhalter: ['rechnung'],
  fehlerbildIds: ['fehler-uebersehen', 'richtiges-bemaengelt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const { netto, zeilen } = rechnung(r);
    const fehlerhaft = p.zeile ? r.int(0, 2) : r.int(0, 1) === 0 ? 3 : -1;
    // Der Fehler wirkt in den folgenden Zeilen weiter, damit nur eine Zeile falsch gerechnet ist
    const z = zeilen.map((x) => ({ ...x }));
    if (fehlerhaft >= 0) {
      const delta = 100 * r.pick([1, 2, 5, 10] as const) * (r.int(0, 1) === 0 ? 1 : -1);
      const ziel = z[fehlerhaft];
      if (ziel) ziel.cent += ziel.cent + delta > 0 ? delta : Math.abs(delta);
      // Folgezeilen mit dem falschen Wert richtig weiterrechnen
      const [rab, zw, st, en] = z;
      if (rab && zw && st && en) {
        if (fehlerhaft === 0) zw.cent = netto - rab.cent;
        if (fehlerhaft <= 1) st.cent = Math.round((zw.cent * MWST) / 100);
        if (fehlerhaft <= 2) en.cent = zw.cent + st.cent;
      }
    }
    const text = [`Preis: ${euro(netto)}`, ...z.map((x) => `${x.text}: ${euro(x.cent)}`)].join(
      '; ',
    );
    if (!p.zeile) {
      const stimmt = fehlerhaft < 0;
      const richtig = auswahl(stimmt ? 0 : 1);
      return {
        platzhalter: { rechnung: de(text) },
        optionen: [
          { text: de('Ja, der Endbetrag stimmt.') },
          { text: de('Nein, der Endbetrag ist falsch.') },
        ],
        loesung: richtig,
        loesungsweg: zeilen.map((x) => de(`${x.text}: ${euro(x.cent)}`)),
        fehlerbilder: fehlerbilderAus(richtig, [
          ['fehler-uebersehen', stimmt ? undefined : auswahl(0)],
          ['richtiges-bemaengelt', stimmt ? auswahl(1) : undefined],
        ]),
      };
    }
    const richtig = auswahl(fehlerhaft);
    return {
      platzhalter: { rechnung: de(text) },
      optionen: z.slice(0, 3).map((x) => ({ text: de(x.text) })),
      loesung: richtig,
      loesungsweg: [
        de('Rechne jede Zeile mit den Werten darüber nach.'),
        ...zeilen.map((x) => de(`${x.text}: richtig wäre ${euro(x.cent)}`)),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['richtiges-bemaengelt', auswahl(fehlerhaft === 0 ? 1 : 0)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Angebote vergleichen (M.ZO.PZ.ANGEBOTE)

export interface AngebotParameter {
  /** false: Packungen für eine Menge; true: Barzahlung mit Skonto gegen Ratenkauf */
  readonly raten: boolean;
}

/** „Welches Angebot ist günstiger?“ */
export const angebotVergleich: Generator<AngebotParameter> = {
  id: 'pz.angebot-vergleich',
  version: 1,
  platzhalter: ['angebote'],
  fehlerbildIds: ['packungspreis-verglichen', 'raten-nicht-zusammengezaehlt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.raten) {
      for (;;) {
        const was = r.pick(['Joghurts', 'Flaschen Saft', 'Hefte', 'Batterien'] as const);
        const na = r.pick([2, 3, 4] as const);
        const nb = r.pick([5, 6, 8] as const);
        const menge = na * nb * r.int(1, 2);
        const pa = 10 * r.int(8, 40) * na; // Cent je Packung A
        const pb = 10 * r.int(8, 40) * nb;
        const ka = (menge / na) * pa;
        const kb = (menge / nb) * pb;
        if (ka === kb) continue;
        const richtig = auswahl(ka < kb ? 0 : 1);
        return {
          platzhalter: {
            angebote: de(
              `Du brauchst ${menge} ${was}. Angebot A: ${na} Stück für ${euro(pa)}. Angebot B: ${nb} Stück für ${euro(pb)}.`,
            ),
          },
          optionen: [
            { text: de('Angebot A ist günstiger.') },
            { text: de('Angebot B ist günstiger.') },
          ],
          loesung: richtig,
          loesungsweg: [
            de(`A: ${menge / na} Packungen · ${euro(pa)} = ${euro(ka)}`),
            de(`B: ${menge / nb} Packungen · ${euro(pb)} = ${euro(kb)}`),
          ],
          fehlerbilder: fehlerbilderAus(richtig, [
            [
              'packungspreis-verglichen',
              pa < pb !== ka < kb ? auswahl(pa < pb ? 0 : 1) : undefined,
            ],
          ]),
        };
      }
    }
    for (;;) {
      const bar = 100 * 100 * r.int(3, 15); // Barpreis in Cent, ganze Hunderter
      const skonto = r.pick([2, 3] as const);
      const barMitSkonto = (bar * (100 - skonto)) / 100;
      const n = r.pick([6, 10, 12, 24] as const);
      const anzahlung = 100 * 10 * r.int(0, 10);
      const rate = 100 * Math.round((bar - anzahlung) / n / 100 + r.int(-2, 4));
      const ratenGesamt = anzahlung + n * rate;
      if (ratenGesamt === barMitSkonto || rate <= 0) continue;
      const richtig = auswahl(barMitSkonto < ratenGesamt ? 0 : 1);
      return {
        platzhalter: {
          angebote: de(
            `${r.pick(WAREN)} kostet bar ${euro(bar)}, bei Barzahlung gibt es ${skonto} % Skonto. Oder Ratenkauf: ${anzahlung > 0 ? `${euro(anzahlung)} Anzahlung und ` : ''}${n} Raten zu je ${euro(rate)}.`,
          ),
        },
        optionen: [
          { text: de('Barzahlung ist günstiger.') },
          { text: de('Ratenkauf ist günstiger.') },
        ],
        loesung: richtig,
        loesungsweg: [
          de(`Bar: ${euro(bar)} − ${skonto} % = ${euro(barMitSkonto)}`),
          de(
            `Raten: ${anzahlung > 0 ? `${euro(anzahlung)} + ` : ''}${n} · ${euro(rate)} = ${euro(ratenGesamt)}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['raten-nicht-zusammengezaehlt', barMitSkonto < ratenGesamt ? auswahl(1) : undefined],
        ]),
      };
    }
  },
};

/** „Was kosten 18 Flaschen?“ / „Wie viel Euro kostet der Ratenkauf mehr?“ */
export const angebotKosten: Generator<AngebotParameter> = {
  id: 'pz.angebot-kosten',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['eine-packung', 'anzahlung-vergessen', 'gesamt-statt-mehr'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.raten) {
      const was = r.pick(['Flaschen Wasser', 'Brötchen', 'Eier', 'Stifte'] as const);
      const n = r.pick([4, 6, 10, 12] as const);
      const packungen = r.int(2, 6);
      const preis = 10 * r.int(15, 80);
      const richtig = centZahl(packungen * preis);
      return {
        platzhalter: {
          aufgabe: de(
            `Eine Packung mit ${n} ${was} kostet ${euro(preis)}. Du brauchst ${packungen * n} ${was}. Wie viel Euro musst du bezahlen?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`${packungen * n} : ${n} = ${packungen} Packungen`),
          de(`${packungen} · ${euro(preis)} = ${euro(packungen * preis)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['eine-packung', centZahl(preis)]]),
      };
    }
    const bar = 100 * 50 * r.int(4, 30);
    const n = r.pick([6, 10, 12, 18, 24] as const);
    const anzahlung = 100 * 50 * r.int(0, 4);
    const rate = 100 * (Math.ceil((bar - anzahlung) / n / 100) + r.int(1, 8));
    const gesamt = anzahlung + n * rate;
    const richtig = centZahl(gesamt - bar);
    return {
      platzhalter: {
        aufgabe: de(
          `Ein Handy kostet bar ${euro(bar)}. Beim Ratenkauf zahlt man ${anzahlung > 0 ? `${euro(anzahlung)} an und dann ` : ''}${n} Raten zu je ${euro(rate)}. Wie viel Euro kostet der Ratenkauf mehr?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(
          `Ratenkauf: ${anzahlung > 0 ? `${euro(anzahlung)} + ` : ''}${n} · ${euro(rate)} = ${euro(gesamt)}`,
        ),
        de(`Mehr: ${euro(gesamt)} − ${euro(bar)} = ${euro(gesamt - bar)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['anzahlung-vergessen', anzahlung > 0 ? centZahl(n * rate - bar) : undefined],
        ['gesamt-statt-mehr', centZahl(gesamt)],
      ]),
    };
  },
};
