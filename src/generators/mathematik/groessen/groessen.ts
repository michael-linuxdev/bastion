import { dezimalDeutsch, runde10, zahlDeutsch } from '../../../core/learning/format';
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

/** Einheiten je Größe, von klein nach groß, mit Faktor zur nächstgrößeren. */
export const GROESSEN: Readonly<Record<string, readonly { einheit: string; faktor: number }[]>> = {
  laenge: [
    { einheit: 'mm', faktor: 10 },
    { einheit: 'cm', faktor: 10 },
    { einheit: 'dm', faktor: 10 },
    { einheit: 'm', faktor: 1000 },
    { einheit: 'km', faktor: 1 },
  ],
  masse: [
    { einheit: 'mg', faktor: 1000 },
    { einheit: 'g', faktor: 1000 },
    { einheit: 'kg', faktor: 1000 },
    { einheit: 't', faktor: 1 },
  ],
  geld: [
    { einheit: 'ct', faktor: 100 },
    { einheit: '€', faktor: 1 },
  ],
  zeit: [
    { einheit: 's', faktor: 60 },
    { einheit: 'min', faktor: 60 },
    { einheit: 'h', faktor: 24 },
    { einheit: 'd', faktor: 1 },
  ],
  flaeche: [
    { einheit: 'mm²', faktor: 100 },
    { einheit: 'cm²', faktor: 100 },
    { einheit: 'dm²', faktor: 100 },
    { einheit: 'm²', faktor: 100 },
    { einheit: 'a', faktor: 100 },
    { einheit: 'ha', faktor: 100 },
    { einheit: 'km²', faktor: 1 },
  ],
  volumen: [
    { einheit: 'mm³', faktor: 1000 },
    { einheit: 'cm³', faktor: 1000 },
    { einheit: 'dm³', faktor: 1000 },
    { einheit: 'm³', faktor: 1 },
  ],
  hohlmass: [
    { einheit: 'ml', faktor: 1000 },
    { einheit: 'l', faktor: 1 },
  ],
};

/**
 * Typisch falsche Umrechnungszahl: bei Flächen die der Längen (10 statt 100 je Schritt),
 * bei Volumen die der Flächen (100 statt 1000 je Schritt), sonst 10 bzw. 100.
 */
function falscheUmrechnungszahl(groesse: string, f: number): number {
  if (groesse === 'flaeche') return Math.round(Math.sqrt(f));
  if (groesse === 'volumen') return Math.round(f ** (2 / 3));
  if (groesse === 'hohlmass') return 100;
  return f === 10 ? 100 : 10;
}

/** Umrechnungszahl von Einheit i nach Einheit j (i < j: so viele i ergeben ein j). */
export function umrechnungszahl(groesse: string, i: number, j: number): number {
  const e = GROESSEN[groesse] ?? [];
  let f = 1;
  for (let k = Math.min(i, j); k < Math.max(i, j); k++) f *= e[k]?.faktor ?? 1;
  return f;
}

export interface UmrechnenParameter {
  readonly groessen: readonly string[];
  readonly richtung: 'in-kleinere' | 'in-groessere';
  readonly sprung_max: number; // 1 = nur benachbarte Einheiten
  readonly dezimal: boolean; // Ausgangswert darf Kommazahl sein bzw. Ergebnis Kommazahl
}

/** „Rechne um: 3 km = ? m“ – Vorlagen M.GM.GR.UMRECHNEN.IN-KLEINERE und .IN-GROESSERE */
export const einheitenUmrechnen: Generator<UmrechnenParameter> = {
  id: 'gr.einheiten-umrechnen',
  version: 1,
  platzhalter: ['wert', 'von', 'nach'],
  fehlerbildIds: ['falsche-richtung', 'falsche-umrechnungszahl'],

  erzeuge(seed, p) {
    verlange(p.groessen.length > 0 && p.groessen.every((g) => g in GROESSEN), 'unbekannte Größe');
    verlange(p.sprung_max >= 1 && p.sprung_max <= 3, 'sprung_max: 1 … 3');
    const r = rng(seed);
    const g = r.pick(p.groessen);
    const e = GROESSEN[g] ?? [];
    const sprung = Math.min(r.int(1, p.sprung_max), e.length - 1);
    const klein = r.int(0, e.length - 1 - sprung);
    const gross = klein + sprung;
    const f = umrechnungszahl(g, klein, gross);
    const [von, nach] = p.richtung === 'in-kleinere' ? [gross, klein] : [klein, gross];
    // Intern in Hundertsteln rechnen (8,37 t in mg wäre als Kommazahl ungenau);
    // Werte so wählen, dass das Ergebnis höchstens 3 Nachkommastellen hat.
    let hundertstel: number;
    if (p.richtung === 'in-kleinere') {
      hundertstel = p.dezimal && f >= 10 ? r.int(1, 999) : r.int(2, 99) * 100;
    } else {
      hundertstel = (p.dezimal ? r.int(1, 99) * (f >= 100 ? f / 100 : 1) : r.int(2, 99) * f) * 100;
    }
    const wert = hundertstel / 100;
    const richtig = p.richtung === 'in-kleinere' ? (hundertstel * f) / 100 : hundertstel / f / 100;
    const falscheZahl = falscheUmrechnungszahl(g, f);
    return {
      platzhalter: {
        wert: de(dezimalDeutsch(wert)),
        von: de(e[von]?.einheit ?? ''),
        nach: de(e[nach]?.einheit ?? ''),
      },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`1 ${e[gross]?.einheit ?? ''} = ${zahlDeutsch(f)} ${e[klein]?.einheit ?? ''}`),
        de(
          p.richtung === 'in-kleinere'
            ? `In die kleinere Einheit: mal ${zahlDeutsch(f)} → ${dezimalDeutsch(wert)} · ${zahlDeutsch(f)} = ${dezimalDeutsch(richtig)}`
            : `In die größere Einheit: durch ${zahlDeutsch(f)} → ${dezimalDeutsch(wert)} : ${zahlDeutsch(f)} = ${dezimalDeutsch(richtig)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        [
          'falsche-richtung',
          zahl(p.richtung === 'in-kleinere' ? runde10(wert / f, 6) : runde10(wert * f, 6)),
        ],
        [
          'falsche-umrechnungszahl',
          g === 'zeit' || (g === 'geld' && f === 100)
            ? zahl(p.richtung === 'in-kleinere' ? runde10(wert * 100, 6) : runde10(wert / 100, 6))
            : zahl(
                p.richtung === 'in-kleinere'
                  ? runde10(wert * falscheZahl, 6)
                  : runde10(wert / falscheZahl, 6),
              ),
        ],
      ]),
    };
  },
};

const uhr = (min: number) =>
  `${Math.floor(min / 60) % 24}:${String(min % 60).padStart(2, '0')} Uhr`;

export interface ZeitspanneParameter {
  readonly bis_stunden: number; // höchste Dauer in Stunden (1 … 12)
}

/** „Wie viele Minuten liegen zwischen 7:45 Uhr und 13:20 Uhr?“ – Vorlage M.GM.GR.ZEIT.ZEITSPANNE */
export const zeitspanne: Generator<ZeitspanneParameter> = {
  id: 'gr.zeitspanne',
  version: 1,
  platzhalter: ['beginn', 'ende'],
  fehlerbildIds: ['wie-dezimalzahl-gerechnet', 'nur-stunden'],

  erzeuge(seed, p) {
    verlange(p.bis_stunden >= 1 && p.bis_stunden <= 12, 'bis_stunden: 1 … 12');
    const r = rng(seed);
    let dauer = r.int(3, p.bis_stunden * 12) * 5;
    if (dauer % 60 === 0) dauer += 5;
    // Beginn zwischen 6:00 und 18:00, Ende spätestens 23:55 (keine Spanne über Mitternacht)
    const beginn = r.int(6 * 12, Math.min(18 * 12, (24 * 60 - 5 - dauer) / 5)) * 5;
    const ende = beginn + dauer;
    // Fehler: Uhrzeiten wie Dezimalzahlen abgezogen (13:20 − 7:45 → 1320 − 745 = 575)
    const alsZahl = (m: number) => Math.floor(m / 60) * 100 + (m % 60);
    const dezimal = alsZahl(ende) - alsZahl(beginn);
    return {
      platzhalter: { beginn: de(uhr(beginn)), ende: de(uhr(ende)) },
      loesung: zahl(dauer),
      loesungsweg: [
        de(`Von ${uhr(beginn)} bis zur nächsten vollen Stunde: ${(60 - (beginn % 60)) % 60} min`),
        de(`Dann in ganzen Stunden und Minuten weiter bis ${uhr(ende)}.`),
        de(`Zusammen: ${Math.floor(dauer / 60)} h ${dauer % 60} min = ${dauer} min`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(dauer), [
        ['wie-dezimalzahl-gerechnet', dezimal > 0 ? zahl(dezimal) : undefined],
        ['nur-stunden', zahl((Math.floor(ende / 60) - Math.floor(beginn / 60)) * 60)],
      ]),
    };
  },
};

export interface EndzeitParameter {
  readonly bis_stunden: number; // 1 … 12
  readonly ueber_mitternacht: boolean;
}

/** „Ein Film beginnt um 19:35 Uhr und dauert 1 h 50 min. Wann endet er?“ – Vorlage M.GM.GR.ZEIT.ENDZEIT */
export const endzeit: Generator<EndzeitParameter> = {
  id: 'gr.endzeit',
  version: 1,
  platzhalter: ['beginn', 'stunden', 'minuten'],
  fehlerbildIds: ['minuten-vergessen', 'stunde-nicht-erhoeht'],

  erzeuge(seed, p) {
    verlange(p.bis_stunden >= 1 && p.bis_stunden <= 12, 'bis_stunden: 1 … 12');
    const r = rng(seed);
    const beginn =
      r.int(p.ueber_mitternacht ? 16 * 12 : 7 * 12, p.ueber_mitternacht ? 23 * 12 : 15 * 12) * 5;
    const h = r.int(0, p.bis_stunden - 1);
    let m = r.int(1, 11) * 5;
    if ((beginn % 60) + m < 60) m = Math.min(55, 60 - (beginn % 60) + r.int(0, 2) * 5); // Stundenwechsel erzwingen
    const ende = (beginn + h * 60 + m) % (24 * 60);
    // Fehler: Minuten über 60 abgezogen, aber die Stunde nicht erhöht (19:35 + 50 min → 19:25)
    const minutenSumme = (beginn % 60) + m;
    const ohneStunde =
      minutenSumme >= 60 ? (Math.floor(beginn / 60) + h) * 60 + (minutenSumme - 60) : undefined;
    return {
      platzhalter: { beginn: de(uhr(beginn)), stunden: h, minuten: m },
      loesung: zahl(ende),
      loesungsweg: [
        de(`${uhr(beginn)} + ${h} h = ${uhr(beginn + h * 60)}`),
        de(
          `${uhr(beginn + h * 60)} + ${m} min = ${uhr(beginn + h * 60 + m)} (60 Minuten sind eine Stunde)`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(ende), [
        ['minuten-vergessen', zahl((beginn + h * 60) % (24 * 60))],
        [
          'stunde-nicht-erhoeht',
          ohneStunde !== undefined ? zahl(ohneStunde % (24 * 60)) : undefined,
        ],
      ]),
    };
  },
};

export interface KommaParameter {
  readonly groessen: readonly string[]; // geld, laenge, masse
  readonly richtung: 'zu-komma' | 'zu-kleiner';
}

const KOMMA_PAARE: Readonly<Record<string, [string, string, number]>> = {
  geld: ['€', 'ct', 100],
  laenge: ['m', 'cm', 100],
  masse: ['kg', 'g', 1000],
};

/**
 * „4 € 3 ct = ? €“ bzw. „3,07 m = ? cm“.
 * Vorlagen M.GM.GR.KOMMA.ZU-KOMMA und .ZU-KLEINER
 */
export const kommaschreibweise: Generator<KommaParameter> = {
  id: 'gr.kommaschreibweise',
  version: 1,
  platzhalter: ['gross', 'klein', 'einheit_gross', 'einheit_klein', 'komma'],
  fehlerbildIds: ['falsche-stelle', 'nullen-falsch'],

  erzeuge(seed, p) {
    verlange(
      p.groessen.length > 0 && p.groessen.every((g) => g in KOMMA_PAARE),
      'groessen aus geld, laenge, masse',
    );
    const r = rng(seed);
    const g = r.pick(p.groessen);
    const [eg, ek, f] = KOMMA_PAARE[g] as [string, string, number];
    const gross = r.int(0, 20);
    // kleine Anteile mit führender Null bevorzugen (3 ct, 7 cm, 50 g) – dort passieren die Fehler
    const klein =
      r.int(0, 1) === 0 ? r.int(1, 9) * (f === 1000 ? r.pick([1, 10]) : 1) : r.int(10, f - 1);
    const kommazahl = runde10(gross + klein / f, 6);
    const stellen = String(f).length - 1;
    const falschKomma = runde10(gross + klein / 10 ** String(klein).length, 6); // 4 € 3 ct → 4,3
    if (p.richtung === 'zu-komma') {
      return {
        platzhalter: {
          gross,
          klein,
          einheit_gross: de(eg),
          einheit_klein: de(ek),
          komma: de(dezimalDeutsch(kommazahl)),
        },
        loesung: zahl(kommazahl),
        loesungsweg: [
          de(
            `1 ${eg} = ${zahlDeutsch(f)} ${ek}, also hat ${eg} in Kommaschreibweise ${stellen} Nachkommastellen.`,
          ),
          de(
            `${klein} ${ek} = ${dezimalDeutsch(klein / f)} ${eg}, zusammen ${dezimalDeutsch(kommazahl)} ${eg}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(zahl(kommazahl), [
          ['falsche-stelle', zahl(falschKomma)],
          ['nullen-falsch', undefined],
        ]),
      };
    }
    const richtig = gross * f + klein;
    return {
      platzhalter: {
        gross,
        klein,
        einheit_gross: de(eg),
        einheit_klein: de(ek),
        komma: de(dezimalDeutsch(kommazahl)),
      },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`1 ${eg} = ${zahlDeutsch(f)} ${ek}`),
        de(`${dezimalDeutsch(kommazahl)} · ${zahlDeutsch(f)} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['falsche-stelle', undefined],
        // Fehler: Ziffern hinter dem Komma ohne führende Null angehängt (3,07 m → 37 cm)
        ['nullen-falsch', zahl(Number(`${gross}${klein}`))],
      ]),
    };
  },
};

const NAMEN = [
  'Lena',
  'Ali',
  'Mia',
  'Jonas',
  'Elif',
  'Paul',
  'Sofia',
  'Noah',
  'Amira',
  'Ben',
  'Lara',
  'Yusuf',
];
const ARTIKEL: readonly [string, string, number, number][] = [
  // [Einzahl, Mehrzahl, Preis min in ct, Preis max in ct]
  ['ein Heft', 'Hefte', 85, 195],
  ['einen Stift', 'Stifte', 120, 350],
  ['ein Brötchen', 'Brötchen', 35, 90],
  ['eine Flasche Wasser', 'Flaschen Wasser', 59, 149],
  ['einen Apfel', 'Äpfel', 30, 80],
];

const euro = (ct: number) => `${dezimalDeutsch(ct / 100).replace(/,(\d)$/, ',$10')} €`;

function einkauf(
  r: Rng,
  menge_max: number,
): { text: Sprachobjekt; gesamt: number; bezahlt: number; einzeln: number; anzahl: number } {
  const name = r.pick(NAMEN);
  const [, mehrzahl, pmin, pmax] = r.pick(ARTIKEL);
  const anzahl = r.int(2, menge_max);
  const einzeln = r.int(Math.ceil(pmin / 5), Math.floor(pmax / 5)) * 5;
  const gesamt = anzahl * einzeln;
  const bezahlt = [500, 1000, 2000, 5000].find((s) => s > gesamt) ?? 10000;
  return {
    text: de(
      `${name} kauft ${anzahl} ${mehrzahl} zu je ${euro(einzeln)} und bezahlt mit einem ${euro(bezahlt).replace(',00', '')}-Schein.`,
    ),
    gesamt,
    bezahlt,
    einzeln,
    anzahl,
  };
}

export interface SachEinkaufParameter {
  readonly menge_max: number; // 2 … 9
}

/** „Lena kauft 3 Hefte zu je 1,45 € … Wie viel Rückgeld?“ – Vorlage M.GM.GR.SACH.EINKAUF */
export const sachEinkauf: Generator<SachEinkaufParameter> = {
  id: 'gr.sach-einkauf',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['rueckgeld-vergessen', 'nur-ein-stueck'],

  erzeuge(seed, p) {
    verlange(p.menge_max >= 2 && p.menge_max <= 9, 'menge_max: 2 … 9');
    const r = rng(seed);
    const e = einkauf(r, p.menge_max);
    const rueckgeld = e.bezahlt - e.gesamt;
    return {
      platzhalter: { geschichte: e.text },
      loesung: zahl(runde10(rueckgeld / 100, 2)),
      loesungsweg: [
        de(`Überschlag: ungefähr ${e.anzahl} · ${euro(Math.round(e.einzeln / 50) * 50 || 50)}`),
        de(`Preis: ${e.anzahl} · ${euro(e.einzeln)} = ${euro(e.gesamt)}`),
        de(`Rückgeld: ${euro(e.bezahlt)} − ${euro(e.gesamt)} = ${euro(rueckgeld)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(runde10(rueckgeld / 100, 2)), [
        ['rueckgeld-vergessen', zahl(runde10(e.gesamt / 100, 2))],
        ['nur-ein-stueck', zahl(runde10((e.bezahlt - e.einzeln) / 100, 2))],
      ]),
    };
  },
};

export interface SachWegParameter {
  readonly km_max: number; // 2 … 50
}

/** „Der Radweg ist 4,5 km lang. Hin und zurück, dazu 800 m …“ – Vorlage M.GM.GR.SACH.WEG */
export const sachWeg: Generator<SachWegParameter> = {
  id: 'gr.sach-weg',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['einheiten-nicht-umgerechnet', 'nur-einfache-strecke'],

  erzeuge(seed, p) {
    verlange(p.km_max >= 2 && p.km_max <= 50, 'km_max: 2 … 50');
    const r = rng(seed);
    const name = r.pick(NAMEN);
    const strecke = r.int(10, p.km_max * 10) * 100; // in m, auf 100 m genau
    const umweg = r.int(1, 9) * 100;
    const gesamt = 2 * strecke + umweg;
    return {
      platzhalter: {
        geschichte: de(
          `Der Weg von ${name}s Wohnung zum Sportplatz ist ${dezimalDeutsch(strecke / 1000)} km lang. ` +
            `${name} fährt hin und zurück und macht unterwegs einen Umweg von ${umweg} m zum Bäcker. ` +
            'Wie viele Kilometer fährt ' +
            name +
            ' insgesamt?',
        ),
      },
      loesung: zahl(runde10(gesamt / 1000, 3)),
      loesungsweg: [
        de(
          `Hin und zurück: 2 · ${dezimalDeutsch(strecke / 1000)} km = ${dezimalDeutsch((2 * strecke) / 1000)} km`,
        ),
        de(`${umweg} m = ${dezimalDeutsch(umweg / 1000)} km`),
        de(`Zusammen: ${dezimalDeutsch(gesamt / 1000)} km`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(runde10(gesamt / 1000, 3)), [
        ['einheiten-nicht-umgerechnet', zahl(runde10((2 * strecke) / 1000 + umweg, 3))],
        ['nur-einfache-strecke', zahl(runde10((strecke + umweg) / 1000, 3))],
      ]),
    };
  },
};
