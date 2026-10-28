// Prozent- und Zinsrechnung – Klasse 7 (LEHRPLAN §8c, Feld PZ): Grundwert,
// Prozentwert und Prozentsatz erkennen, bequeme Prozentsätze, Grundaufgaben,
// Preisänderungen („um“ und „auf“), Zinsen, Tageszinsen und Zinseszins.
// Geld wird intern in Cent gerechnet.
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';

/** Betrag in Euro: ganze Euro ohne Komma, sonst mit zwei Nachkommastellen */
export function euro(cent: number): string {
  if (cent % 100 === 0) return `${zahlText(cent / 100)} €`;
  const t = (Math.abs(cent) / 100).toFixed(2).replace('.', ',');
  return `${cent < 0 ? '−' : ''}${t} €`;
}
const centZahl = (cent: number) => zahl(runde10(cent / 100, 2));
const zz = (x: number) => zahl(runde10(x, 6));

// ---------------------------------------------------------------------------
// Grundwert, Prozentwert, Prozentsatz erkennen (M.ZO.PZ.BEGRIFFE.ERKENNEN)

interface Geschichte {
  readonly satz: (g: string, p: string, w: string) => string;
  readonly einheit: string;
}

const GESCHICHTEN: readonly Geschichte[] = [
  {
    satz: (g, p, w) =>
      `Von ${g} Kindern einer Schule kommen ${p} mit dem Bus – das sind ${w} Kinder.`,
    einheit: 'Kinder',
  },
  {
    satz: (g, p, w) =>
      `Ein Fahrrad kostet ${g} €. Im Angebot gibt es ${p} Rabatt, das sind ${w} €.`,
    einheit: '€',
  },
  {
    satz: (g, p, w) => `${w} von ${g} Losen sind Gewinne. Das sind ${p} aller Lose.`,
    einheit: 'Lose',
  },
  {
    satz: (g, p, w) => `Bei der Wahl haben ${p} der ${g} Schüler abgestimmt, also ${w} Schüler.`,
    einheit: 'Schüler',
  },
];

const PAARE: readonly (readonly [p: number, g: number])[] = [
  [10, 30],
  [10, 250],
  [20, 25],
  [20, 150],
  [25, 40],
  [25, 200],
  [40, 25],
  [50, 64],
  [75, 80],
  [5, 300],
  [30, 120],
  [60, 45],
];

export interface ErkennenParameter {
  /** auch Sätze, in denen der Prozentwert vor dem Grundwert steht */
  readonly vertauscht: boolean;
}

const ROLLEN = ['den Grundwert', 'den Prozentwert', 'den Prozentsatz'] as const;

/** „Von 40 Kindern kommen 25 % mit dem Bus – das sind 10 Kinder. Welche Angabe ist der Grundwert?“ */
export const begriffeErkennen: Generator<ErkennenParameter> = {
  id: 'pz.begriffe-erkennen',
  version: 1,
  platzhalter: ['geschichte', 'rolle'],
  fehlerbildIds: ['grundwert-prozentwert-vertauscht', 'prozentsatz-verwechselt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const geschichten = p.vertauscht ? GESCHICHTEN : GESCHICHTEN.filter((_, i) => i !== 2);
    const s = r.pick(geschichten);
    const [ps, g] = r.pick(PAARE);
    const w = (g * ps) / 100;
    const gT = zahlText(g);
    const pT = `${ps} %`;
    const wT = zahlText(w);
    const rolle = r.int(0, 2);
    // Optionen: die drei Angaben in gemischter Reihenfolge
    const angaben = mische(r, [
      [0, `${gT} ${s.einheit}`],
      [1, `${wT} ${s.einheit}`],
      [2, pT],
    ] as const);
    const index = (rolleId: number) => auswahl(angaben.findIndex(([id]) => id === rolleId));
    const richtig = index(rolle);
    return {
      platzhalter: { geschichte: de(s.satz(gT, pT, wT)), rolle: de(ROLLEN[rolle] ?? '') },
      optionen: angaben.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Der Grundwert ist das Ganze (100 %). Der Prozentwert ist der Teil davon. Der Prozentsatz ist die Angabe mit %.',
        ),
        de(`Grundwert: ${gT} ${s.einheit}. Prozentwert: ${wT} ${s.einheit}. Prozentsatz: ${pT}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['grundwert-prozentwert-vertauscht', rolle < 2 ? index(1 - rolle) : undefined],
        ['prozentsatz-verwechselt', rolle < 2 ? index(2) : index(1)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Bequeme Prozentsätze (M.ZO.PZ.BEGRIFFE.BEQUEM)

export interface BequemParameter {
  readonly saetze: readonly number[];
}

const EINHEITEN = ['€', 'kg', 'm', 'Schüler', 'l', 'km'] as const;

/** „Berechne 25 % von 80 €.“ – im Kopf */
export const bequem: Generator<BequemParameter> = {
  id: 'pz.bequem',
  version: 1,
  platzhalter: ['prozentsatz', 'grundwert'],
  fehlerbildIds: ['geteilt-durch-prozentzahl', 'hundert-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ps = r.pick(p.saetze);
    // Grundwert so, dass der Prozentwert eine ganze Zahl ist
    const schritt = 100 / gcd(ps, 100);
    const g = schritt * r.int(1, Math.max(1, Math.floor(400 / schritt)));
    const w = (g * ps) / 100;
    const e = r.pick(EINHEITEN);
    const richtig = zahl(w);
    const bruch = {
      1: '1/100',
      5: '1/20',
      10: '1/10',
      20: '1/5',
      25: '1/4',
      50: '1/2',
      75: '3/4',
      100: 'das Ganze',
    }[ps];
    return {
      platzhalter: { prozentsatz: de(`${ps} %`), grundwert: de(`${zahlText(g)} ${e}`) },
      loesung: richtig,
      loesungsweg: [
        de(bruch ? `${ps} % ist ${bruch}.` : `${ps} % sind ${ps} Hundertstel.`),
        de(`${ps} % von ${zahlText(g)} ${e} = ${zahlText(g)} · ${ps} : 100 = ${zahlText(w)} ${e}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['geteilt-durch-prozentzahl', zz(g / ps)],
        ['hundert-vergessen', zahl(g * ps)],
      ]),
    };
  },
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ---------------------------------------------------------------------------
// Grundaufgaben (M.ZO.PZ.GRUNDAUFGABEN.BERECHNEN, .RECHNUNG)

type Gesucht = 'W' | 'G' | 'p';

interface Grundaufgabe {
  readonly gesucht: Gesucht;
  readonly g: number;
  readonly ps: number;
  readonly w: number;
  readonly text: string;
}

const SAETZE = [2, 4, 5, 8, 12, 15, 16, 24, 30, 35, 45, 60, 64, 85] as const;

function grundaufgabe(r: Rng, alle: boolean): Grundaufgabe {
  const gesucht: Gesucht = alle ? r.pick(['W', 'G', 'p'] as const) : 'W';
  const ps = r.pick(SAETZE);
  const schritt = 100 / gcd(ps, 100);
  const g = schritt * r.int(1, Math.max(2, Math.floor(1200 / schritt)));
  const w = (g * ps) / 100;
  const e = r.pick(['€', 'kg', 'Besucher', 'm']);
  const G = `${zahlText(g)} ${e}`;
  const W = `${zahlText(w)} ${e}`;
  const text =
    gesucht === 'W'
      ? `Berechne ${ps} % von ${G}.`
      : gesucht === 'G'
        ? `${ps} % sind ${W}. Wie groß ist der Grundwert (in ${e})?`
        : `Wie viel Prozent sind ${W} von ${G}?`;
  return { gesucht, g, ps, w, text };
}

export interface GrundaufgabeParameter {
  /** false: nur Prozentwert; true: auch Grundwert und Prozentsatz */
  readonly alle: boolean;
}

/** „Berechne 15 % von 240 €.“ / „15 % sind 36 €. Wie groß ist der Grundwert?“ */
export const grundaufgabeBerechnen: Generator<GrundaufgabeParameter> = {
  id: 'pz.grundaufgabe',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['hundert-vergessen', 'falsch-herum-geteilt', 'prozentwert-berechnet'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = grundaufgabe(r, p.alle);
    const wert = a.gesucht === 'W' ? a.w : a.gesucht === 'G' ? a.g : a.ps;
    const richtig = zahl(wert);
    const formel =
      a.gesucht === 'W'
        ? `W = G · p : 100 = ${zahlText(a.g)} · ${a.ps} : 100 = ${zahlText(a.w)}`
        : a.gesucht === 'G'
          ? `G = W · 100 : p = ${zahlText(a.w)} · 100 : ${a.ps} = ${zahlText(a.g)}`
          : `p = W · 100 : G = ${zahlText(a.w)} · 100 : ${zahlText(a.g)} = ${a.ps}`;
    const kandidaten: [string, Loesung | undefined][] =
      a.gesucht === 'W'
        ? [
            ['hundert-vergessen', zahl(a.g * a.ps)],
            ['falsch-herum-geteilt', zz(a.g / a.ps)],
          ]
        : a.gesucht === 'G'
          ? [
              ['prozentwert-berechnet', zz((a.w * a.ps) / 100)],
              ['falsch-herum-geteilt', zz(a.w / a.ps)],
            ]
          : [
              ['falsch-herum-geteilt', zz((a.g * 100) / a.w)],
              ['hundert-vergessen', zz(a.w / a.g)],
            ];
    return {
      platzhalter: { aufgabe: de(a.text) },
      loesung: richtig,
      loesungsweg: [
        de('Dreisatz oder Formel: Prozentwert W, Grundwert G, Prozentsatz p (ohne %).'),
        de(formel),
      ],
      fehlerbilder: fehlerbilderAus(richtig, kandidaten),
    };
  },
};

/** „Welche Rechnung passt zu: 15 % sind 36 €. Wie groß ist der Grundwert?“ */
export const welcheRechnung: Generator<GrundaufgabeParameter> = {
  id: 'pz.welche-rechnung',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['falsche-grundaufgabe', 'hundert-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = grundaufgabe(r, p.alle);
    const G = zahlText(a.g);
    const W = zahlText(a.w);
    const P = String(a.ps);
    // Je Grundaufgabe: richtige Rechnung, eine andere Grundaufgabe, ohne 100
    const [richtigText, andere, ohne] =
      a.gesucht === 'W'
        ? [`${G} · ${P} : 100`, `${G} · 100 : ${P}`, `${G} · ${P}`]
        : a.gesucht === 'G'
          ? [`${W} · 100 : ${P}`, `${W} · ${P} : 100`, `${W} : ${P}`]
          : [`${W} · 100 : ${G}`, `${G} · 100 : ${W}`, `${W} : ${G}`];
    const optionen = mische(r, [richtigText, andere, ohne]);
    const index = (s: string) => auswahl(optionen.indexOf(s));
    const richtig = index(richtigText);
    return {
      platzhalter: { aufgabe: de(a.text) },
      optionen: optionen.map((s) => ({ text: de(s) })),
      loesung: richtig,
      loesungsweg: [
        de(
          a.gesucht === 'W'
            ? 'Gesucht ist der Prozentwert: W = G · p : 100.'
            : a.gesucht === 'G'
              ? 'Gesucht ist der Grundwert: G = W · 100 : p.'
              : 'Gesucht ist der Prozentsatz: p = W · 100 : G.',
        ),
        de(richtigText),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['falsche-grundaufgabe', index(andere)],
        ['hundert-vergessen', index(ohne)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Preisänderungen (M.ZO.PZ.VERAENDERUNG.NEUER-PREIS, .UM-AUF)

export interface PreisParameter {
  /** auch vom neuen Preis auf den alten zurückrechnen */
  readonly rueckwaerts: boolean;
}

const WAREN = [
  'Ein Fahrrad',
  'Eine Jacke',
  'Ein Handy',
  'Ein Paar Schuhe',
  'Ein Rucksack',
  'Eine Konzertkarte',
] as const;

/** „Ein Fahrrad kostet 240 €. Der Preis steigt um 15 %. Wie viel kostet es jetzt?“ */
export const neuerPreis: Generator<PreisParameter> = {
  id: 'pz.neuer-preis',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['nur-prozentwert', 'falsche-richtung', 'rueckwaerts-falscher-grundwert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ware = r.pick(WAREN);
    const ps = r.pick([5, 10, 15, 20, 25, 30, 40, 50] as const);
    const hoch = r.int(0, 1) === 0;
    const schritt = 100 / gcd(ps, 100);
    const alt = schritt * r.int(Math.ceil(20 / schritt), Math.floor(600 / schritt)) * 100; // Cent
    const aenderung = (alt * ps) / 100;
    const neu = hoch ? alt + aenderung : alt - aenderung;
    const rueck = p.rueckwaerts && r.int(0, 1) === 0;
    const richtung = hoch ? `steigt um ${ps} %` : `wird um ${ps} % gesenkt`;
    if (rueck) {
      const richtig = centZahl(alt);
      return {
        platzhalter: {
          geschichte: de(
            `${ware} kostet nach einer Preisänderung ${euro(neu)}. Der Preis ${hoch ? 'ist um' : 'wurde um'} ${ps} % ${hoch ? 'gestiegen' : 'gesenkt'}. Wie viel hat es vorher gekostet (in €)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Der alte Preis ist der Grundwert (100 %). Der neue Preis entspricht ${hoch ? 100 + ps : 100 - ps} %.`,
          ),
          de(`G = ${euro(neu)} · 100 : ${hoch ? 100 + ps : 100 - ps} = ${euro(alt)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'rueckwaerts-falscher-grundwert',
            centZahl(Math.round(hoch ? neu - (neu * ps) / 100 : neu + (neu * ps) / 100)),
          ],
        ]),
      };
    }
    const richtig = centZahl(neu);
    return {
      platzhalter: {
        geschichte: de(
          `${ware} kostet ${euro(alt)}. Der Preis ${richtung}. Wie viel kostet es jetzt (in €)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`${ps} % von ${euro(alt)} sind ${euro(aenderung)}.`),
        de(`${euro(alt)} ${hoch ? '+' : '−'} ${euro(aenderung)} = ${euro(neu)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-prozentwert', centZahl(aenderung)],
        ['falsche-richtung', centZahl(hoch ? alt - aenderung : alt + aenderung)],
      ]),
    };
  },
};

export interface UmAufParameter {
  /** auch Senkungen und „auf wie viel Prozent“ */
  readonly erweitert: boolean;
}

/** „Der Preis steigt von 40 € auf 50 €. Um wie viel Prozent ist er gestiegen?“ */
export const umAuf: Generator<UmAufParameter> = {
  id: 'pz.um-auf',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['auf-statt-um', 'um-statt-auf', 'falscher-grundwert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ps = r.pick([10, 20, 25, 40, 50, 60, 75] as const);
    const hoch = p.erweitert ? r.int(0, 1) === 0 : true;
    const auf = p.erweitert && r.int(0, 2) === 0;
    const schritt = 100 / gcd(ps, 100);
    const alt = schritt * r.int(Math.ceil(8 / schritt), Math.floor(200 / schritt));
    const neu = hoch ? alt + (alt * ps) / 100 : alt - (alt * ps) / 100;
    if (neu <= 0) return umAuf.erzeuge(seed + 1, p);
    const wert = auf ? (hoch ? 100 + ps : 100 - ps) : ps;
    const richtig = zahl(wert);
    const frage = auf
      ? 'Auf wie viel Prozent des alten Preises ist er gestiegen bzw. gefallen?'
      : `Um wie viel Prozent ist der Preis ${hoch ? 'gestiegen' : 'gesunken'}?`;
    const differenz = Math.abs(neu - alt);
    return {
      platzhalter: {
        geschichte: de(
          `Ein Preis ${hoch ? 'steigt' : 'sinkt'} von ${zahlText(alt)} € auf ${zahlText(neu)} €. ${frage}`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Grundwert ist der alte Preis: ${zahlText(alt)} €.`),
        auf
          ? de(`${zahlText(neu)} · 100 : ${zahlText(alt)} = ${wert} %`)
          : de(
              `Unterschied: ${zahlText(differenz)} €. ${zahlText(differenz)} · 100 : ${zahlText(alt)} = ${ps} %`,
            ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['auf-statt-um', auf ? undefined : zahl(hoch ? 100 + ps : 100 - ps)],
        ['um-statt-auf', auf ? zahl(ps) : undefined],
        // den neuen statt den alten Preis als Grundwert genommen
        ['falscher-grundwert', zz(runde10(((auf ? alt : differenz) * 100) / neu, 2))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Zinsen (M.ZO.PZ.ZINS.ZINSEN, .KAPITAL)

export interface ZinsParameter {
  /** auch Tageszinsen, Zinssatz und Kapital gesucht */
  readonly erweitert: boolean;
}

/** „Wie viel Zinsen bringen 1 200 € bei 3 % in einem Jahr?“ */
export const zinsen: Generator<ZinsParameter> = {
  id: 'pz.zinsen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['hundert-vergessen', 'tage-vergessen', 'falsche-grundaufgabe'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = p.erweitert ? r.pick(['jahr', 'tage', 'zinssatz', 'kapital'] as const) : 'jahr';
    const zs = r.pick([1, 2, 3, 4, 5, 6] as const);
    const k = r.int(2, 60) * 100; // €
    const z = (k * zs) / 100; // Jahreszinsen in €
    let text: string;
    let wert: number;
    let weg: string;
    const kandidaten: [string, Loesung | undefined][] = [];
    if (art === 'jahr') {
      text = `Lena legt ${zahlText(k)} € zu einem Zinssatz von ${zs} % an. Wie viel Zinsen bekommt sie nach einem Jahr (in €)?`;
      wert = z;
      weg = `Z = K · p : 100 = ${zahlText(k)} · ${zs} : 100 = ${zahlText(z)}`;
      kandidaten.push(['hundert-vergessen', zahl(k * zs)]);
    } else if (art === 'tage') {
      const tage = r.pick([30, 60, 90, 120, 180, 270] as const);
      // Zinsen in Cent müssen glatt aufgehen
      if ((k * zs * tage) % 360 !== 0) return zinsen.erzeuge(seed + 1, p);
      wert = (k * zs * tage) / 360 / 100;
      text = `${zahlText(k)} € liegen ${tage} Tage zu ${zs} % auf dem Konto. Wie viel Zinsen gibt es (in €)? Rechne mit 360 Tagen im Jahr.`;
      weg = `Z = K · p : 100 · t : 360 = ${zahlText(k)} · ${zs} : 100 · ${tage} : 360 = ${zahlText(wert)}`;
      kandidaten.push(['tage-vergessen', zahl(z)]);
    } else if (art === 'zinssatz') {
      text = `Für ${zahlText(k)} € gibt es nach einem Jahr ${zahlText(z)} € Zinsen. Wie hoch ist der Zinssatz (in %)?`;
      wert = zs;
      weg = `p = Z · 100 : K = ${zahlText(z)} · 100 : ${zahlText(k)} = ${zs}`;
      kandidaten.push(
        ['hundert-vergessen', zz(z / k)],
        ['falsche-grundaufgabe', zz((k * 100) / z)],
      );
    } else {
      text = `Bei ${zs} % Zinssatz bekommt Tom nach einem Jahr ${zahlText(z)} € Zinsen. Wie viel Geld hat er angelegt (in €)?`;
      wert = k;
      weg = `K = Z · 100 : p = ${zahlText(z)} · 100 : ${zs} = ${zahlText(k)}`;
      kandidaten.push(['falsche-grundaufgabe', zz((z * zs) / 100)]);
    }
    const richtig = zz(wert);
    return {
      platzhalter: { aufgabe: de(text) },
      loesung: richtig,
      loesungsweg: [
        de(
          'Zinsrechnung ist Prozentrechnung: Kapital K = Grundwert, Zinsen Z = Prozentwert, Zinssatz p = Prozentsatz.',
        ),
        de(weg),
      ],
      fehlerbilder: fehlerbilderAus(richtig, kandidaten),
    };
  },
};

/** „1 000 € werden 2 Jahre zu 3 % angelegt, die Zinsen bleiben auf dem Konto. Wie viel Geld ist es dann?“ */
export const kapitalNachJahren: Generator<ZinsParameter> = {
  id: 'pz.kapital-nach-jahren',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['nur-zinsen', 'zinseszins-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const jahre = p.erweitert ? 2 : 1;
    const zs = r.pick([1, 2, 3, 4, 5] as const);
    const k = r.int(2, 50) * 100 * 100; // Cent, volle 100 €
    let kapital = k;
    for (let j = 0; j < jahre; j++) kapital += (kapital * zs) / 100;
    const zinsen1 = (k * zs) / 100;
    const richtig = centZahl(kapital);
    return {
      platzhalter: {
        aufgabe: de(
          jahre === 1
            ? `Mia legt ${euro(k)} für ein Jahr zu ${zs} % an. Wie viel Geld hat sie nach einem Jahr (in €)?`
            : `Mia legt ${euro(k)} für zwei Jahre zu ${zs} % an. Die Zinsen bleiben auf dem Konto und werden im zweiten Jahr mitverzinst. Wie viel Geld hat sie nach zwei Jahren (in €)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Nach einem Jahr: ${euro(k)} + ${euro(zinsen1)} = ${euro(k + zinsen1)}.`),
        ...(jahre === 2
          ? [de(`Nach zwei Jahren: ${euro(k + zinsen1)} + ${zs} % davon = ${euro(kapital)}.`)]
          : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-zinsen', centZahl(kapital - k)],
        ['zinseszins-vergessen', jahre === 2 ? centZahl(k + 2 * zinsen1) : undefined],
      ]),
    };
  },
};
