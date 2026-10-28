// Zuordnungen – Klasse 6 (LEHRPLAN §8b, Feld ZU): Arten von Zuordnungen,
// proportional oder nicht, Dreisatz, Graphen. Rein und deterministisch.
import { zahlDeutsch } from '../../../core/learning/format';
import type { Bild, Generator, Option } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, kreis, linie, text } from '../../svg';

// ---------------------------------------------------------------------------
// Bausteine: Wertetabelle, Pfeildiagramm, Koordinatensystem mit eigener Skala

/** Wertetabelle mit zwei Zeilen; `null` erscheint als Fragezeichen. */
export function tabelle(
  kopf: readonly [string, string],
  paare: readonly (readonly [number, number | null])[],
): Bild {
  const b = 56;
  const links = 110;
  const breite = links + paare.length * b + 10;
  const teile: string[] = [
    linie(10, 10, breite - 10, 10, 1.5),
    linie(10, 50, breite - 10, 50, 1.5),
    linie(10, 90, breite - 10, 90, 1.5),
    linie(10, 10, 10, 90, 1.5),
    linie(breite - 10, 10, breite - 10, 90, 1.5),
    linie(links, 10, links, 90, 1.5),
    text(60, 36, kopf[0], 14),
    text(60, 76, kopf[1], 14),
  ];
  paare.forEach(([x, y], i) => {
    const mitte = links + i * b + b / 2;
    if (i > 0) teile.push(linie(links + i * b, 10, links + i * b, 90, 0.75));
    teile.push(
      text(mitte, 36, zahlDeutsch(x), 15),
      text(mitte, 76, y === null ? '?' : zahlDeutsch(y), 15),
    );
  });
  return bild(breite, 100, teile, {
    de: `Tabelle: ${kopf[0]} ${paare.map(([x]) => zahlDeutsch(x)).join(', ')}; ${kopf[1]} ${paare
      .map(([, y]) => (y === null ? 'gesucht' : zahlDeutsch(y)))
      .join(', ')}.`,
  });
}

/** Pfeildiagramm von links nach rechts. */
function pfeildiagramm(
  links: readonly string[],
  rechts: readonly string[],
  pfeile: readonly (readonly [number, number])[],
): Bild {
  const h = Math.max(links.length, rechts.length) * 40 + 20;
  const y = (i: number, n: number) =>
    20 + i * 40 + ((Math.max(links.length, rechts.length) - n) * 40) / 2 + 10;
  const teile: string[] = [
    `<ellipse cx="60" cy="${h / 2}" rx="45" ry="${h / 2 - 5}" stroke-width="1.5"/>`,
    `<ellipse cx="240" cy="${h / 2}" rx="45" ry="${h / 2 - 5}" stroke-width="1.5"/>`,
  ];
  links.forEach((t, i) => teile.push(text(60, y(i, links.length) + 5, t, 14)));
  rechts.forEach((t, i) => teile.push(text(240, y(i, rechts.length) + 5, t, 14)));
  for (const [a, b] of pfeile) {
    const [y1, y2] = [y(a, links.length), y(b, rechts.length)];
    const dx = 180 - 4;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const [ux, uy] = [dx / len, dy / len];
    const [sx, sy] = [210 - ux * 10, y2 - uy * 10];
    teile.push(
      linie(90, y1, 205, y2 - uy * 5, 1.5),
      `<path d="M${sx - uy * 5} ${sy + ux * 5} L${210} ${y2} L${sx + uy * 5} ${sy - ux * 5} Z" fill="currentColor" stroke="none"/>`,
    );
  }
  return bild(300, h, teile, {
    de: `Pfeildiagramm. Links: ${links.join(', ')}. Rechts: ${rechts.join(', ')}. Pfeile: ${pfeile
      .map(([a, b]) => `${links[a]} → ${rechts[b]}`)
      .join(', ')}.`,
  });
}

/** Koordinatensystem mit getrennten Schrittweiten für x und y. */
function achsen(xmax: number, ymax: number, yschritt: number) {
  const [rand, oben, sx] = [34, 14, 260 / xmax];
  const sy = 200 / ymax;
  const px = (x: number) => rand + x * sx;
  const py = (y: number) => oben + (ymax - y) * sy;
  const teile: string[] = [];
  for (let x = 0; x <= xmax; x++) teile.push(linie(px(x), py(0), px(x), py(ymax), 0.4));
  for (let y = 0; y <= ymax; y += yschritt) teile.push(linie(px(0), py(y), px(xmax), py(y), 0.4));
  teile.push(linie(px(0), py(0), px(xmax), py(0), 2), linie(px(0), py(0), px(0), py(ymax), 2));
  for (let x = 0; x <= xmax; x++) teile.push(text(px(x), py(0) + 16, String(x), 11));
  for (let y = yschritt; y <= ymax; y += yschritt)
    teile.push(text(px(0) - 14, py(y) + 4, String(y), 11));
  return { breite: rand + 260 + 16, hoehe: oben + 200 + 24, px, py, teile };
}

const polylinie = (punkte: readonly (readonly [number, number])[]) =>
  `<polyline points="${punkte.map(([x, y]) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(' ')}" stroke-width="2.5"/>`;

// ---------------------------------------------------------------------------
// Art der Zuordnung (M.SF.ZU.DARSTELLEN.ART)

const ARTEN: Option[] = [
  { text: de('eindeutig, aber nicht eineindeutig') },
  { text: de('eineindeutig') },
  { text: de('mehrdeutig') },
];

const SITUATIONEN: readonly [string, number][] = [
  ['Jedem Kind wird sein Geburtsmonat zugeordnet.', 0],
  ['Jedem Auto wird sein Kennzeichen zugeordnet.', 1],
  ['Jedem Monat werden die Kinder zugeordnet, die in ihm Geburtstag haben.', 2],
  ['Jeder natürlichen Zahl wird ihr Doppeltes zugeordnet.', 1],
  ['Jeder Zahl werden ihre Teiler zugeordnet.', 2],
  ['Jedem Schüler wird seine Klasse zugeordnet.', 0],
  ['Jeder Klasse werden ihre Schüler zugeordnet.', 2],
  ['Jedem Land wird seine Hauptstadt zugeordnet.', 1],
];

export interface ZuordnungsartParameter {
  /** auch Zuordnungen aus dem Alltag in Worten */
  readonly worte: boolean;
}

/** „Welche Art von Zuordnung zeigt das Pfeildiagramm?“ – Vorlage M.SF.ZU.DARSTELLEN.ART */
export const zuordnungsart: Generator<ZuordnungsartParameter> = {
  id: 'zu.art',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['eindeutig-eineindeutig-verwechselt', 'mehrdeutig-uebersehen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (p.worte && r.int(0, 1) === 0) {
      const [satz, art] = r.pick(SITUATIONEN);
      const richtig = auswahl(art);
      return {
        platzhalter: { frage: de(satz) },
        optionen: ARTEN,
        loesung: richtig,
        loesungsweg: [
          de(
            art === 2
              ? 'Einem Element werden mehrere zugeordnet – die Zuordnung ist mehrdeutig.'
              : art === 1
                ? 'Jedem Element wird genau eines zugeordnet, und umgekehrt gehört auch zu jedem genau eines – eineindeutig.'
                : 'Jedem Element wird genau eines zugeordnet, aber manche Ziele kommen mehrfach vor – eindeutig, nicht eineindeutig.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'eindeutig-eineindeutig-verwechselt',
            art === 0 ? auswahl(1) : art === 1 ? auswahl(0) : undefined,
          ],
          ['mehrdeutig-uebersehen', art === 2 ? auswahl(0) : undefined],
        ]),
      };
    }
    const art = r.int(0, 2);
    const n = r.int(3, 4);
    const links = mische(r, ['A', 'B', 'C', 'D', 'E'].slice(0, n));
    const zahlen = mische(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n).map(String);
    let pfeile: [number, number][];
    let rechts: string[];
    if (art === 1) {
      rechts = zahlen;
      pfeile = links.map((_, i) => [i, (i + 1) % n] as [number, number]);
    } else if (art === 0) {
      rechts = zahlen.slice(0, n - 1);
      pfeile = links.map((_, i) => [i, Math.min(i, n - 2)] as [number, number]);
    } else {
      rechts = zahlen;
      pfeile = links.map((_, i) => [i, i] as [number, number]);
      const doppelt = r.int(0, n - 1);
      pfeile.push([doppelt, (doppelt + 1) % n]);
    }
    const richtig = auswahl(art);
    return {
      platzhalter: { frage: de('Das Pfeildiagramm zeigt eine Zuordnung.') },
      bild: pfeildiagramm(links, rechts, pfeile),
      optionen: ARTEN,
      loesung: richtig,
      loesungsweg: [
        de(
          art === 2
            ? 'Von einem Buchstaben gehen zwei Pfeile aus – die Zuordnung ist mehrdeutig.'
            : art === 1
              ? 'Von jedem Buchstaben geht genau ein Pfeil aus, und bei jeder Zahl kommt genau einer an – eineindeutig.'
              : 'Von jedem Buchstaben geht genau ein Pfeil aus, aber bei einer Zahl kommen zwei an – eindeutig, nicht eineindeutig.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'eindeutig-eineindeutig-verwechselt',
          art === 0 ? auswahl(1) : art === 1 ? auswahl(0) : undefined,
        ],
        ['mehrdeutig-uebersehen', art === 2 ? auswahl(0) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Tabelle ergänzen (M.SF.ZU.DARSTELLEN.TABELLE)

const PAARE: readonly [string, string][] = [
  ['Anzahl Hefte', 'Preis in €'],
  ['Zeit in min', 'Weg in km'],
  ['Anzahl Kisten', 'Flaschen'],
  ['Stunden', 'Lohn in €'],
];

export interface TabelleErgaenzenParameter {
  /** y = k · x (proportional) oder y = k · x + c */
  readonly mit_grundwert: boolean;
  readonly k_max: number; // 2 … 12
}

/** „Ergänze die Tabelle.“ – Vorlage M.SF.ZU.DARSTELLEN.TABELLE */
export const tabelleErgaenzen: Generator<TabelleErgaenzenParameter> = {
  id: 'zu.tabelle-ergaenzen',
  version: 1,
  platzhalter: ['x'],
  fehlerbildIds: ['letzter-schritt-addiert', 'grundwert-vergessen'],

  erzeuge(seed, p) {
    verlange(p.k_max >= 2 && p.k_max <= 12, 'k_max: 2 … 12');
    const r = rng(seed);
    const kopf = r.pick(PAARE);
    const k = r.int(2, p.k_max);
    const c = p.mit_grundwert ? r.int(1, 9) : 0;
    const xs = [1, 2, 3, 4].map((i) => i * r.int(1, 2));
    const unique = [...new Set(xs)].sort((a, b) => a - b);
    const vorher = unique[unique.length - 1] ?? 1;
    const gesucht = vorher + r.int(1, 4);
    const f = (x: number) => k * x + c;
    const richtig = f(gesucht);
    return {
      platzhalter: { x: gesucht },
      bild: tabelle(kopf, [...unique.map((x) => [x, f(x)] as [number, number]), [gesucht, null]]),
      loesung: zahl(richtig),
      loesungsweg: [
        de(
          c === 0
            ? `Jeder Wert ist ${k}-mal so groß: y = ${k} · x`
            : `Für jedes x mehr kommen ${k} dazu, bei x = 0 wären es ${c}: y = ${k} · x + ${c}`,
        ),
        de(
          `Für x = ${gesucht}: ${c === 0 ? `${k} · ${gesucht}` : `${k} · ${gesucht} + ${c}`} = ${zahlDeutsch(richtig)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['letzter-schritt-addiert', zahl(f(vorher) + k)],
        ['grundwert-vergessen', c > 0 ? zahl(k * gesucht) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Proportional oder nicht? (M.SF.ZU.PROPORTIONAL)

const PROP_ARTEN: Option[] = [
  { text: de('proportional') },
  { text: de('umgekehrt proportional') },
  { text: de('weder noch') },
];

export interface ProportionalTabelleParameter {
  /** auch „weder noch“ */
  readonly weder: boolean;
}

/** „Ist die Zuordnung in der Tabelle proportional?“ – Vorlage M.SF.ZU.PROPORTIONAL.TABELLE */
export const proportionalTabelle: Generator<ProportionalTabelleParameter> = {
  id: 'zu.proportional-tabelle',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['je-mehr-desto-mehr', 'je-mehr-desto-weniger'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = r.int(0, p.weder ? 3 : 1); // 0 prop, 1 umgekehrt, 2/3 weder (steigend/fallend)
    const xs = mische(r, [1, 2, 3, 4, 5, 6, 8, 10, 12])
      .slice(0, 4)
      .sort((a, b) => a - b);
    let ys: number[];
    let weg: string;
    if (art === 0) {
      const k = r.int(2, 9);
      ys = xs.map((x) => k * x);
      weg = `Alle Quotienten y : x sind gleich (${k}) – proportional.`;
    } else if (art === 1) {
      const produkt = 120;
      const teiler = [1, 2, 3, 4, 5, 6, 8, 10, 12];
      const x2 = mische(r, teiler)
        .slice(0, 4)
        .sort((a, b) => a - b);
      xs.splice(0, 4, ...x2);
      ys = xs.map((x) => produkt / x);
      weg = `Alle Produkte x · y sind gleich (${produkt}) – umgekehrt proportional.`;
    } else if (art === 2) {
      const k = r.int(2, 9);
      const c = r.int(1, 9);
      ys = xs.map((x) => k * x + c);
      weg = 'Die Werte steigen, aber die Quotienten y : x sind verschieden – nicht proportional.';
    } else {
      const start = r.int(50, 70); // bleibt positiv: 50 − 4 · 12 > 0
      const k = r.int(2, 4);
      ys = xs.map((x) => start - k * x);
      weg =
        'Die Werte fallen, aber die Produkte x · y sind verschieden – nicht umgekehrt proportional.';
    }
    const richtig = auswahl(art >= 2 ? 2 : art);
    return {
      platzhalter: {},
      bild: tabelle(
        ['x', 'y'],
        xs.map((x, i) => [x, ys[i] ?? 0] as [number, number]),
      ),
      optionen: p.weder ? PROP_ARTEN : PROP_ARTEN.slice(0, 2),
      loesung: richtig,
      loesungsweg: [de(weg)],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['je-mehr-desto-mehr', art === 2 ? auswahl(0) : undefined],
        ['je-mehr-desto-weniger', art === 3 ? auswahl(1) : undefined],
      ]),
    };
  },
};

const JE_DESTO: readonly [string, number][] = [
  ['Je mehr Brötchen du kaufst, desto mehr bezahlst du.', 0],
  ['Je mehr Personen sich eine Pizza teilen, desto kleiner wird jedes Stück.', 1],
  ['Je schneller ein Zug fährt, desto kürzer braucht er für dieselbe Strecke.', 1],
  ['Je länger du mit gleicher Geschwindigkeit radelst, desto weiter kommst du.', 0],
  ['Je mehr Liter Benzin du tankst, desto mehr kostet es.', 0],
  ['Je mehr Pumpen arbeiten, desto schneller ist das Becken leer.', 1],
  ['Je älter ein Kind ist, desto größer ist es.', 2],
  [
    'Je mehr Kinder in der Klasse sind, desto mehr Bücher braucht die Klasse, wenn jedes Kind eines bekommt.',
    0,
  ],
  [
    'Ein Taxi kostet 4 € Grundpreis und 2 € je Kilometer. Je weiter du fährst, desto mehr zahlst du.',
    2,
  ],
  ['Je mehr Tore eine Mannschaft schießt, desto mehr Zuschauer kommen.', 2],
];

export interface JeDestoParameter {
  readonly weder: boolean;
}

/** „Je mehr …, desto …“ einordnen – Vorlage M.SF.ZU.PROPORTIONAL.JE-DESTO */
export const jeDesto: Generator<JeDestoParameter> = {
  id: 'zu.je-desto',
  version: 1,
  platzhalter: ['satz'],
  fehlerbildIds: ['je-mehr-desto-mehr'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const auswahlListe = JE_DESTO.filter(([, a]) => p.weder || a < 2);
    const [satz, art] = r.pick(auswahlListe);
    const richtig = auswahl(art);
    return {
      platzhalter: { satz: de(satz) },
      optionen: p.weder ? PROP_ARTEN : PROP_ARTEN.slice(0, 2),
      loesung: richtig,
      loesungsweg: [
        de(
          art === 0
            ? 'Doppelt so viel von dem einen ergibt doppelt so viel von dem anderen – proportional.'
            : art === 1
              ? 'Doppelt so viel von dem einen ergibt halb so viel von dem anderen – umgekehrt proportional.'
              : 'Beides wächst zusammen, aber nicht im gleichen Verhältnis (beim Doppelten nicht genau das Doppelte) – weder noch.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['je-mehr-desto-mehr', art === 2 ? auswahl(0) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Dreisatz (M.SF.ZU.DREISATZ)

const DINGE: readonly [string, string][] = [
  ['Hefte', 'kosten'],
  ['Kinokarten', 'kosten'],
  ['Brötchen', 'kosten'],
  ['Kugeln Eis', 'kosten'],
];

export interface DreisatzParameter {
  /** Preis je Stück in Cent: Vielfache von 100 (G) oder von 10 (M) */
  readonly cent_schritt: number; // 10 oder 100
  readonly anzahl_max: number; // 6 … 20
}

const euro = (cent: number) =>
  cent % 100 === 0
    ? zahlDeutsch(cent / 100)
    : `${zahlDeutsch(Math.floor(cent / 100))},${String(cent % 100).padStart(2, '0')}`;

/** „5 Hefte kosten 7,50 €. Wie viel kosten 8 Hefte?“ – Vorlage M.SF.ZU.DREISATZ.PROPORTIONAL */
export const dreisatzProportional: Generator<DreisatzParameter> = {
  id: 'zu.dreisatz-proportional',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['umgekehrt-gerechnet', 'differenz-addiert'],

  erzeuge(seed, p) {
    verlange(p.cent_schritt === 10 || p.cent_schritt === 100, 'cent_schritt: 10 oder 100');
    verlange(p.anzahl_max >= 6 && p.anzahl_max <= 20, 'anzahl_max: 6 … 20');
    const r = rng(seed);
    const [ding, verb] = r.pick(DINGE);
    const stueck = r.int(1, Math.floor(400 / p.cent_schritt)) * p.cent_schritt;
    const a = r.int(2, p.anzahl_max);
    let b: number;
    do b = r.int(2, p.anzahl_max);
    while (b === a);
    const pa = a * stueck;
    const pb = b * stueck;
    const umgekehrt = (pa * a) / b;
    return {
      platzhalter: {
        geschichte: de(`${a} ${ding} ${verb} ${euro(pa)} €. Wie viel Euro ${verb} ${b} ${ding}?`),
      },
      loesung: zahl(pb / 100),
      loesungsweg: [
        de(`1 Stück: ${euro(pa)} € : ${a} = ${euro(stueck)} €`),
        de(`${b} Stück: ${euro(stueck)} € · ${b} = ${euro(pb)} €`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(pb / 100), [
        ['umgekehrt-gerechnet', Number.isInteger(umgekehrt) ? zahl(umgekehrt / 100) : undefined],
        ['differenz-addiert', zahl((pa + (b - a) * 100) / 100)],
      ]),
    };
  },
};

const UMGEKEHRT: readonly ((a: number, t: number, b: number) => string)[] = [
  (a, t, b) =>
    `${a} Pumpen leeren ein Becken in ${t} Stunden. Wie viele Stunden brauchen ${b} gleich starke Pumpen?`,
  (a, t, b) =>
    `Das Futter reicht für ${a} Pferde ${t} Tage. Wie viele Tage reicht es für ${b} Pferde?`,
  (a, t, b) => `${a} Maler streichen eine Halle in ${t} Tagen. Wie viele Tage brauchen ${b} Maler?`,
];

export interface DreisatzUmgekehrtParameter {
  readonly produkt_max: number; // 24 … 360
}

/** „4 Pumpen brauchen 6 Stunden …“ – Vorlage M.SF.ZU.DREISATZ.UMGEKEHRT */
export const dreisatzUmgekehrt: Generator<DreisatzUmgekehrtParameter> = {
  id: 'zu.dreisatz-umgekehrt',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['wie-proportional'],

  erzeuge(seed, p) {
    verlange(p.produkt_max >= 24 && p.produkt_max <= 360, 'produkt_max: 24 … 360');
    const r = rng(seed);
    // Produkt mit vielen Teilern wählen
    const produkte = [24, 36, 48, 60, 72, 90, 120, 144, 180, 240, 360].filter(
      (x) => x <= p.produkt_max,
    );
    const produkt = r.pick(produkte);
    const teiler = Array.from({ length: produkt }, (_, i) => i + 1).filter(
      (t) => produkt % t === 0 && t >= 2 && t <= 12,
    );
    const a = r.pick(teiler);
    let b: number;
    do b = r.pick(teiler);
    while (b === a);
    const t = produkt / a;
    const richtig = produkt / b;
    const proportional = (t * b) / a;
    return {
      platzhalter: { geschichte: de(r.pick(UMGEKEHRT)(a, t, b)) },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Umgekehrt proportional: Zusammen bleibt die Arbeit gleich, ${a} · ${t} = ${produkt}.`),
        de(`Für ${b}: ${produkt} : ${b} = ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['wie-proportional', Number.isInteger(proportional) ? zahl(proportional) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Graphen (M.SF.ZU.GRAPH)

export interface GraphAblesenParameter {
  /** proportional (Gerade) oder umgekehrt proportional (Kurve) */
  readonly umgekehrt: boolean;
}

/** „Lies am Graphen ab: Welcher y-Wert gehört zu x = 3?“ – Vorlage M.SF.ZU.GRAPH.ABLESEN */
export const graphAblesen: Generator<GraphAblesenParameter> = {
  id: 'zu.graph-ablesen',
  version: 1,
  platzhalter: ['x'],
  fehlerbildIds: ['x-y-vertauscht', 'kaestchen-gezaehlt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.umgekehrt) {
      const k = r.pick([2, 3, 4, 5]);
      const xmax = 8;
      const ymax = k * xmax;
      const schritt = k;
      const a = achsen(xmax, ymax, schritt * 2);
      const x = r.int(1, 7);
      const y = k * x;
      return {
        platzhalter: { x },
        bild: bild(
          a.breite,
          a.hoehe,
          [
            ...a.teile,
            polylinie([
              [a.px(0), a.py(0)],
              [a.px(xmax), a.py(ymax)],
            ]),
          ],
          {
            de: `Koordinatensystem mit x von 0 bis ${xmax} und y von 0 bis ${ymax}. Eine Gerade geht durch den Ursprung und durch den Punkt (${xmax}|${ymax}).`,
          },
        ),
        loesung: zahl(y),
        loesungsweg: [
          de(`Gehe bei x = ${x} senkrecht nach oben bis zur Geraden, dann waagerecht zur y-Achse.`),
          de(`Dort steht ${y}. Die Gerade geht durch den Ursprung: y = ${k} · x.`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(y), [
          ['x-y-vertauscht', zahl(x)],
          ['kaestchen-gezaehlt', zahl(y / 2 / k)],
        ]),
      };
    }
    const produkt = r.pick([12, 24]);
    const xmax = 12;
    const ymax = produkt;
    const a = achsen(xmax, ymax, produkt / 6);
    const punkte: [number, number][] = [];
    for (let x = produkt / ymax; x <= xmax; x += 0.25) punkte.push([a.px(x), a.py(produkt / x)]);
    const kandidaten = [1, 2, 3, 4, 6, 8, 12].filter((x) => produkt % x === 0 && x <= xmax);
    const x = r.pick(kandidaten);
    const y = produkt / x;
    return {
      platzhalter: { x },
      bild: bild(
        a.breite,
        a.hoehe,
        [
          ...a.teile,
          polylinie(punkte),
          ...kandidaten.map((q) => kreis(a.px(q), a.py(produkt / q), 3, true)),
        ],
        {
          de: `Koordinatensystem mit x von 0 bis ${xmax} und y von 0 bis ${ymax}. Eine fallende Kurve geht durch die markierten Punkte ${kandidaten.map((q) => `(${q}|${produkt / q})`).join(', ')}.`,
        },
      ),
      loesung: zahl(y),
      loesungsweg: [
        de(
          `Gehe bei x = ${x} senkrecht nach oben bis zur Kurve, dann waagerecht zur y-Achse: y = ${y}.`,
        ),
        de(
          `Probe: ${x} · ${y} = ${produkt}. Bei allen Punkten ist das Produkt gleich – umgekehrt proportional.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(y), [['x-y-vertauscht', zahl(x)]]),
    };
  },
};

type GraphArt = 'proportional' | 'grundwert' | 'fallend' | 'kurve';

function graphBild(art: GraphArt): Bild {
  const a = achsen(6, 12, 2);
  const linien: Record<typeof art, () => string> = {
    proportional: () =>
      polylinie([
        [a.px(0), a.py(0)],
        [a.px(6), a.py(12)],
      ]),
    grundwert: () =>
      polylinie([
        [a.px(0), a.py(4)],
        [a.px(6), a.py(10)],
      ]),
    fallend: () =>
      polylinie([
        [a.px(0), a.py(12)],
        [a.px(6), a.py(0)],
      ]),
    kurve: () => {
      const pts: [number, number][] = [];
      for (let x = 1; x <= 6; x += 0.125) pts.push([a.px(x), a.py(12 / x)]);
      return polylinie(pts);
    },
  };
  const beschreibung: Record<typeof art, string> = {
    proportional: 'eine steigende Gerade durch den Ursprung',
    grundwert: 'eine steigende Gerade, die die y-Achse bei 4 schneidet',
    fallend: 'eine fallende Gerade von (0|12) nach (6|0)',
    kurve: 'eine fallende Kurve, die sich den Achsen nähert',
  };
  return bild(a.breite, a.hoehe, [...a.teile, linien[art]()], {
    de: `Koordinatensystem mit ${beschreibung[art]}.`,
  });
}

export interface GraphWaehlenParameter {
  readonly umgekehrt: boolean;
}

/** „Welcher Graph gehört zu der Tabelle?“ – Vorlage M.SF.ZU.GRAPH.WAEHLEN */
export const graphWaehlen: Generator<GraphWaehlenParameter> = {
  id: 'zu.graph-waehlen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['nicht-durch-ursprung', 'gerade-statt-kurve'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const richtigArt: GraphArt = p.umgekehrt ? 'kurve' : 'proportional';
    const andere: GraphArt[] = p.umgekehrt ? ['fallend', 'proportional'] : ['grundwert', 'fallend'];
    const reihenfolge = mische(r, [richtigArt, ...andere]);
    const xs = [1, 2, 3, 4];
    const ys = xs.map((x) => (p.umgekehrt ? 12 / x : 2 * x));
    const idx = (art: GraphArt) => {
      const i = reihenfolge.indexOf(art);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(reihenfolge.indexOf(richtigArt));
    return {
      platzhalter: {},
      bild: tabelle(
        ['x', 'y'],
        xs.map((x, i) => [x, ys[i] ?? 0] as [number, number]),
      ),
      optionen: reihenfolge.map((art) => ({ bild: graphBild(art) })),
      loesung: richtig,
      loesungsweg: [
        de(
          p.umgekehrt
            ? 'Alle Produkte x · y sind 12 – umgekehrt proportional. Der Graph ist eine fallende Kurve, keine Gerade.'
            : 'Alle Quotienten y : x sind 2 – proportional. Der Graph ist eine Gerade durch den Ursprung.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nicht-durch-ursprung', p.umgekehrt ? undefined : idx('grundwert')],
        ['gerade-statt-kurve', p.umgekehrt ? idx('fallend') : undefined],
      ]),
    };
  },
};
