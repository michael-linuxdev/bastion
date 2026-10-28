// Zufallsversuche – Klasse 7 (LEHRPLAN §8c, M.DZ.ZF.BEGRIFFE und
// M.DZ.ZF.WAHRSCHEINLICHKEIT): Ergebnismenge und Ereignis, Ergebnisse zählen,
// Wahrscheinlichkeiten bei gleich wahrscheinlichen Ergebnissen, Chancen vergleichen.
import { bruch } from '../../../core/learning/bruch';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { gekuerzt } from '../brueche/rechnen';

const istPrim = (n: number) => n > 1 && [2, 3, 5, 7, 11, 13, 17, 19].includes(n);

interface Versuch {
  /** „Ein Würfel wird geworfen.“ */
  readonly satz: string;
  readonly ergebnisse: readonly number[];
}

interface Ereignis {
  readonly name: string;
  readonly gilt: (n: number) => boolean;
  /** dasselbe Ereignis mit „>“ statt „≥“ (bzw. umgekehrt), für das Fehlerbild */
  readonly grenzeDaneben?: (n: number) => boolean;
}

function versuch(r: Rng, erweitert: boolean): Versuch {
  if (!erweitert)
    return { satz: 'Ein Würfel wird einmal geworfen.', ergebnisse: [1, 2, 3, 4, 5, 6] };
  const n = r.pick([8, 10, 12, 20] as const);
  return r.int(0, 1) === 0
    ? {
        satz: `Ein Glücksrad hat ${n} gleich große Felder mit den Zahlen 1 bis ${n}. Es wird einmal gedreht.`,
        ergebnisse: Array.from({ length: n }, (_, i) => i + 1),
      }
    : {
        satz: `Aus ${n} Karten mit den Zahlen 1 bis ${n} wird eine gezogen.`,
        ergebnisse: Array.from({ length: n }, (_, i) => i + 1),
      };
}

function ereignis(r: Rng, v: Versuch, erweitert: boolean): Ereignis {
  const max = v.ergebnisse.length;
  const k = r.int(2, max - 2);
  const liste: Ereignis[] = [
    { name: 'eine gerade Zahl', gilt: (n) => n % 2 === 0 },
    { name: 'eine ungerade Zahl', gilt: (n) => n % 2 === 1 },
    { name: `eine Zahl größer als ${k}`, gilt: (n) => n > k, grenzeDaneben: (n) => n >= k },
    { name: `mindestens ${k}`, gilt: (n) => n >= k, grenzeDaneben: (n) => n > k },
    { name: `höchstens ${k}`, gilt: (n) => n <= k, grenzeDaneben: (n) => n < k },
  ];
  if (erweitert)
    liste.push(
      { name: 'eine Primzahl', gilt: istPrim },
      { name: 'eine durch 3 teilbare Zahl', gilt: (n) => n % 3 === 0 },
      {
        name: `eine gerade Zahl größer als ${k}`,
        gilt: (n) => n % 2 === 0 && n > k,
        grenzeDaneben: (n) => n % 2 === 0 && n >= k,
      },
    );
  return r.pick(liste);
}

const menge = (xs: readonly number[]) => `{${xs.join('; ')}}`;

// ---------------------------------------------------------------------------
// Ergebnisse eines Ereignisses zählen (M.DZ.ZF.BEGRIFFE.ZAEHLEN)

export interface ZufallParameter {
  /** false: Würfel; true: Glücksrad oder Karten mit 8 … 20 Zahlen */
  readonly erweitert: boolean;
}

/** „Wie viele Ergebnisse gehören zum Ereignis ‚mindestens 4‘?“ */
export const ereignisZaehlen: Generator<ZufallParameter> = {
  id: 'zf.ereignis-zaehlen',
  version: 1,
  platzhalter: ['versuch', 'ereignis'],
  fehlerbildIds: ['grenze-falsch', 'gegenereignis'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const v = versuch(r, p.erweitert);
    const e = ereignis(r, v, p.erweitert);
    const treffer = v.ergebnisse.filter(e.gilt);
    if (treffer.length === 0 || treffer.length === v.ergebnisse.length)
      return ereignisZaehlen.erzeuge(seed + 1, p);
    const richtig = zahl(treffer.length);
    return {
      platzhalter: { versuch: de(v.satz), ereignis: de(e.name) },
      loesung: richtig,
      loesungsweg: [
        de(`Ergebnismenge: ${menge(v.ergebnisse)}`),
        de(
          `Zum Ereignis „${e.name}“ gehören ${menge(treffer)} – das sind ${treffer.length} Ergebnisse.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'grenze-falsch',
          e.grenzeDaneben ? zahl(v.ergebnisse.filter(e.grenzeDaneben).length) : undefined,
        ],
        ['gegenereignis', zahl(v.ergebnisse.length - treffer.length)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ergebnismenge oder Ereignis als Menge wählen (M.DZ.ZF.BEGRIFFE.MENGE)

/** „Welche Menge beschreibt das Ereignis ‚ungerade Zahl‘?“ – drei Mengen zur Auswahl */
export const ereignisMenge: Generator<ZufallParameter> = {
  id: 'zf.ereignis-menge',
  version: 1,
  platzhalter: ['versuch', 'gefragt'],
  fehlerbildIds: ['ergebnismenge-statt-ereignis', 'gegenereignis', 'grenze-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const v = versuch(r, p.erweitert);
    const e = ereignis(r, v, p.erweitert);
    const treffer = v.ergebnisse.filter(e.gilt);
    const gegen = v.ergebnisse.filter((n) => !e.gilt(n));
    if (treffer.length === 0 || gegen.length === 0) return ereignisMenge.erzeuge(seed + 1, p);
    const daneben = e.grenzeDaneben ? v.ergebnisse.filter(e.grenzeDaneben) : undefined;
    const ganz = menge(v.ergebnisse);
    const t = menge(treffer);
    const g = menge(gegen);
    const d = daneben && menge(daneben) !== t ? menge(daneben) : undefined;
    // Gefragt ist das Ereignis; die Ergebnismenge ist eine der falschen Antworten
    const optionen = mische(r, [t, ganz, d ?? g]);
    const index = (s: string | undefined) =>
      s === undefined || !optionen.includes(s) ? undefined : auswahl(optionen.indexOf(s));
    const richtig = auswahl(optionen.indexOf(t));
    return {
      platzhalter: { versuch: de(v.satz), gefragt: de(e.name) },
      optionen: optionen.map((o) => ({ text: de(o) })),
      loesung: richtig,
      loesungsweg: [
        de(`Die Ergebnismenge enthält alle möglichen Ergebnisse: ${ganz}.`),
        de(`Das Ereignis „${e.name}“ ist ein Teil davon: ${t}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['ergebnismenge-statt-ereignis', index(ganz)],
        ['grenze-falsch', index(d)],
        ['gegenereignis', index(g)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Wahrscheinlichkeit bei gleich wahrscheinlichen Ergebnissen (M.DZ.ZF.WAHRSCHEINLICHKEIT.BERECHNEN)

const FARBEN = ['rote', 'blaue', 'grüne', 'gelbe'] as const;

/** „Wie groß ist die Wahrscheinlichkeit, eine gerade Zahl zu würfeln?“ – als Bruch */
export const laplace: Generator<ZufallParameter> = {
  id: 'zf.laplace',
  version: 1,
  platzhalter: ['versuch', 'ereignis'],
  fehlerbildIds: ['guenstig-durch-unguenstig', 'kehrwert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    let satz: string;
    let name: string;
    let guenstig: number;
    let alle: number;
    if (r.int(0, 1) === 0) {
      // Kugeln in einer Urne
      const anzahl = p.erweitert ? r.int(3, 4) : 2;
      const zahlen = Array.from({ length: anzahl }, () => r.int(1, p.erweitert ? 9 : 6));
      const f = r.int(0, anzahl - 1);
      alle = zahlen.reduce((s, x) => s + x, 0);
      guenstig = zahlen[f] ?? 1;
      satz = `In einem Beutel liegen ${zahlen
        .map((z, i) => `${z} ${FARBEN[i]}`)
        .join(', ')
        .replace(/, ([^,]*)$/, ' und $1')} Kugeln. Eine Kugel wird ohne Hinsehen gezogen.`;
      name = `eine ${FARBEN[f]} Kugel`;
    } else {
      const v = versuch(r, p.erweitert);
      const e = ereignis(r, v, p.erweitert);
      satz = v.satz;
      name = e.name;
      guenstig = v.ergebnisse.filter(e.gilt).length;
      alle = v.ergebnisse.length;
    }
    if (guenstig === 0 || guenstig === alle) return laplace.erzeuge(seed + 1, p);
    const richtig: Loesung = { typ: 'bruch', wert: gekuerzt(bruch(guenstig, alle)) };
    return {
      platzhalter: { versuch: de(satz), ereignis: de(name) },
      loesung: richtig,
      loesungsweg: [
        de('Wahrscheinlichkeit = Anzahl der günstigen Ergebnisse : Anzahl aller Ergebnisse.'),
        de(`Günstig: ${guenstig}, alle: ${alle}. P = ${guenstig}/${alle}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['guenstig-durch-unguenstig', { typ: 'bruch', wert: bruch(guenstig, alle - guenstig) }],
        ['kehrwert', { typ: 'bruch', wert: bruch(alle, guenstig) }],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Chancen vergleichen (M.DZ.ZF.WAHRSCHEINLICHKEIT.VERGLEICHEN)

/** „Beutel A: 3 rote und 5 blaue Kugeln, Beutel B: 4 rote und 8 blaue. Wo ist die Chance auf Rot größer?“ */
export const chancenVergleichen: Generator<ZufallParameter> = {
  id: 'zf.chancen-vergleichen',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['anzahl-statt-anteil', 'nur-blaue-verglichen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const max = p.erweitert ? 12 : 8;
    const [ra, ba, rb, bb] = [r.int(1, max), r.int(1, max), r.int(1, max), r.int(1, max)];
    // Vergleich der Anteile ra/(ra+ba) und rb/(rb+bb) über Kreuzprodukte
    const links = ra * (rb + bb);
    const rechts = rb * (ra + ba);
    const richtigIndex = links > rechts ? 0 : links < rechts ? 1 : 2;
    // Die Falle: der Beutel mit mehr roten Kugeln wirkt besser
    if (p.erweitert && ra === rb) return chancenVergleichen.erzeuge(seed + 1, p);
    const nachAnzahl = ra > rb ? 0 : ra < rb ? 1 : 2;
    // Wer nur auf die blauen Kugeln schaut, wählt den Beutel mit weniger blauen
    const nachBlau = ba < bb ? 0 : ba > bb ? 1 : 2;
    const richtig = auswahl(richtigIndex);
    const beutel = (rot: number, blau: number) => `${rot} rote und ${blau} blaue Kugeln`;
    return {
      platzhalter: { a: de(beutel(ra, ba)), b: de(beutel(rb, bb)) },
      optionen: [
        { text: de('Beutel A') },
        { text: de('Beutel B') },
        { text: de('Die Chancen sind gleich.') },
      ],
      loesung: richtig,
      loesungsweg: [
        de('Vergleiche den Anteil der roten Kugeln, nicht ihre Anzahl.'),
        de(`A: ${ra}/${ra + ba}, B: ${rb}/${rb + bb}.`),
        de(
          richtigIndex === 2
            ? 'Die Anteile sind gleich.'
            : `Der Anteil ist bei Beutel ${richtigIndex === 0 ? 'A' : 'B'} größer.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['anzahl-statt-anteil', auswahl(nachAnzahl)],
        ['nur-blaue-verglichen', auswahl(nachBlau)],
      ]),
    };
  },
};
