// Pyramiden- und Kegelstumpf – Klasse 10 Oberschule (LEHRPLAN §8f, M.GM.KP.STUMPF): Volumen als
// Differenz zweier Pyramiden, mit der Stumpfformel, Masse eines Kegelstumpfs und Oberfläche.
// Wie in Klasse 9 wird mit π ≈ 3,14 gerechnet; Ergebnisse mit Drittel werden gerundet (B3).
import type { Generator, Loesung } from '../../../core/learning/generator';
import { rundeAuf } from '../../../core/learning/auswertung';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { de, zahl } from '../../hilfen';

const PI = 3.14;
const r1 = (x: number) => rundeAuf(x, 1);
const z = (x: number) => zahl(r1(x));
const t = (x: number) => texZahl(r1(x));
/** Lösung auf eine Stelle, mit `runden`, wenn nicht schon genau */
function gerundet(genau: number, stellen = 1) {
  const g = rundeAuf(genau, stellen);
  return Math.abs(g - genau) < 1e-9
    ? { loesung: zahl(g) }
    : { loesung: zahl(g), runden: { stellen, genau } };
}
/** Fehlerbilder ohne solche, die gerundet wie die Lösung aussehen */
const ohneNahe = (genau: number, liste: [string, Loesung][]) =>
  liste.filter(([, l]) => l.typ === 'zahl' && Math.abs(l.wert - genau) >= 0.5);
const wert = (l: Loesung | undefined) => (l?.typ === 'zahl' ? l.wert : undefined);

// ---------------------------------------------------------------------------
// Stumpf als Differenz zweier Pyramiden (M.GM.KP.STUMPF.DIFFERENZ, Niveau G)

function differenzAufgabe(seed: number) {
  const r = rng(seed);
  for (;;) {
    const k = r.int(2, 3);
    const a2 = r.int(2, 6);
    const h2 = r.int(2, 6);
    // ganze Volumen: a2² · h2 durch 3 teilbar
    if ((a2 * a2 * h2) % 3 !== 0) continue;
    const a = k * a2;
    const h = k * h2;
    return { a, h, a2, h2, gross: (a * a * h) / 3, klein: (a2 * a2 * h2) / 3 };
  }
}

/** „Pyramide 6 cm / 9 cm, Spitze 2 cm / 3 cm abgeschnitten: Volumen des Stumpfs?“ */
export const kpStumpfDifferenz: Generator<Record<string, never>> = {
  id: 'kp.stumpf-differenz',
  version: 1,
  platzhalter: ['a', 'h', 'ak', 'hk'],
  fehlerbildIds: ['drittel', 'prisma', 'teil'],
  schritte: [
    { id: 'gross', fehlerbildIds: ['drittel'] },
    { id: 'klein', fehlerbildIds: ['drittel'] },
    { id: 'stumpf', fehlerbildIds: [], platzhalter: ['gross', 'klein'] },
  ],

  erzeuge(seed) {
    const d = differenzAufgabe(seed);
    const v = d.gross - d.klein;
    const loesung = zahl(v);
    return {
      platzhalter: { a: d.a, h: d.h, ak: d.a2, hk: d.h2 },
      loesung,
      loesungsweg: [
        de(`Ganze Pyramide: $V_1 = \\frac{1}{3} \\cdot ${d.a}^2 \\cdot ${d.h} = ${d.gross}$ cm³.`),
        de(
          `Abgeschnittene Spitze: $V_2 = \\frac{1}{3} \\cdot ${d.a2}^2 \\cdot ${d.h2} = ${d.klein}$ cm³.`,
        ),
        de(`Stumpf: $V = V_1 - V_2 = ${d.gross} - ${d.klein} = ${v}$ cm³.`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['drittel', zahl(3 * v)],
        ['prisma', zahl(d.a * d.a * (d.h - d.h2))],
        ['teil', zahl(d.gross)],
      ]),
    };
  },

  schritt(seed, _p, id, bisher) {
    const d = differenzAufgabe(seed);
    if (id === 'gross') {
      const loesung = zahl(d.gross);
      return { loesung, fehlerbilder: fehlerbilderAus(loesung, [['drittel', zahl(3 * d.gross)]]) };
    }
    if (id === 'klein') {
      const loesung = zahl(d.klein);
      return { loesung, fehlerbilder: fehlerbilderAus(loesung, [['drittel', zahl(3 * d.klein)]]) };
    }
    const gross = wert(bisher['gross']) ?? d.gross;
    const klein = wert(bisher['klein']) ?? d.klein;
    return { platzhalter: { gross, klein }, loesung: zahl(gross - klein), fehlerbilder: [] };
  },
};

// ---------------------------------------------------------------------------
// Stumpfformel (M.GM.KP.STUMPF.FORMEL, Niveau M)

/** Quadratischer Pyramidenstumpf: V = h/3 · (G + √(G·D) + D) */
export const kpStumpfFormel: Generator<Record<string, never>> = {
  id: 'kp.stumpf-formel',
  version: 1,
  platzhalter: ['a', 'ad', 'h'],
  fehlerbildIds: ['drittel', 'prisma', 'mittel'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.int(5, 14);
    const a2 = r.int(2, a - 2);
    const h = r.int(3, 12);
    const G = a * a;
    const D = a2 * a2;
    const genau = (h / 3) * (G + a * a2 + D);
    const { loesung, runden } = gerundet(genau);
    return {
      platzhalter: { a, ad: a2, h },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de(
          `Grundfläche $G = ${a}^2 = ${G}$ cm², Deckfläche $D = ${a2}^2 = ${D}$ cm², $\\sqrt{G \\cdot D} = ${a * a2}$ cm².`,
        ),
        de(
          `$V = \\frac{h}{3} \\cdot (G + \\sqrt{G \\cdot D} + D) = \\frac{${h}}{3} \\cdot ${G + a * a2 + D} \\approx ${t(genau)}$ cm³`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(genau, [
          ['drittel', z(h * (G + a * a2 + D))],
          ['prisma', zahl(G * h)],
          ['mittel', z(((G + D) / 2) * h)],
        ]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Kegelstumpf mit Masse (M.GM.KP.STUMPF.KEGEL, Niveau M)

const STOFFE = [
  { name: 'Holz', dichte: 0.7 },
  { name: 'Beton', dichte: 2.4 },
  { name: 'Glas', dichte: 2.5 },
  { name: 'Aluminium', dichte: 2.7 },
] as const;

function kegelAufgabe(seed: number) {
  const r = rng(seed);
  const rg = r.int(3, 10);
  const rd = r.int(2, rg - 1);
  const h = r.int(4, 15);
  const stoff = r.pick(STOFFE);
  const summe = rg * rg + rg * rd + rd * rd;
  const volumen = (PI * h * summe) / 3;
  return { rg, rd, h, stoff, summe, volumen };
}

export const kpKegelstumpfMasse: Generator<Record<string, never>> = {
  id: 'kp.kegelstumpf-masse',
  version: 1,
  platzhalter: ['rg', 'rd', 'h', 'stoff', 'dichte'],
  fehlerbildIds: ['drittel', 'prisma', 'dichte'],
  schritte: [
    { id: 'volumen', fehlerbildIds: ['drittel', 'prisma'] },
    { id: 'masse', fehlerbildIds: ['dichte'], platzhalter: ['volumen'] },
  ],

  erzeuge(seed) {
    const k = kegelAufgabe(seed);
    // wie im Musterweg: erst das Volumen auf eine Stelle runden, dann die Masse
    // in Zehnteln gerechnet, damit ,5 genau ,5 bleibt
    const masse = (Math.round(k.stoff.dichte * 10) * Math.round(k.volumen * 10)) / 100;
    const { loesung, runden } = gerundet(masse, 0);
    return {
      platzhalter: {
        rg: k.rg,
        rd: k.rd,
        h: k.h,
        stoff: de(k.stoff.name),
        dichte: k.stoff.dichte,
      },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de(
          `$V = \\frac{\\pi \\cdot h}{3} \\cdot (r_1^2 + r_1 r_2 + r_2^2) = \\frac{3{,}14 \\cdot ${k.h}}{3} \\cdot ${k.summe} \\approx ${t(k.volumen)}$ cm³`,
        ),
        de(
          `$m = \\rho \\cdot V = ${texZahl(k.stoff.dichte)} \\cdot ${t(k.volumen)} \\approx ${texZahl(Math.round(masse))}$ g`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(masse, [
          ['drittel', zahl(Math.round(3 * masse))],
          ['prisma', zahl(Math.round(k.stoff.dichte * PI * k.rg * k.rg * k.h))],
          ['dichte', zahl(Math.round(k.volumen / k.stoff.dichte))],
        ]),
      ),
    };
  },

  schritt(seed, _p, id, bisher) {
    const k = kegelAufgabe(seed);
    if (id === 'volumen') {
      const { loesung, runden } = gerundet(k.volumen);
      return {
        loesung,
        ...(runden ? { runden } : {}),
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(k.volumen, [
            ['drittel', z(3 * k.volumen)],
            ['prisma', z(PI * k.rg * k.rg * k.h)],
          ]),
        ),
      };
    }
    const volumen = wert(bisher['volumen']) ?? r1(k.volumen);
    const masse = (Math.round(k.stoff.dichte * 10) * Math.round(volumen * 10)) / 100;
    const { loesung, runden } = gerundet(masse, 0);
    return {
      platzhalter: { volumen },
      loesung,
      ...(runden ? { runden } : {}),
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(masse, [['dichte', zahl(Math.round(volumen / k.stoff.dichte))]]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Oberfläche (M.GM.KP.STUMPF.OBERFLAECHE, Niveau M)

/** Quadratischer Pyramidenstumpf: zwei Quadrate und vier gleiche Trapeze */
export const kpStumpfOberflaeche: Generator<Record<string, never>> = {
  id: 'kp.stumpf-oberflaeche',
  version: 1,
  platzhalter: ['a', 'ad', 'hs'],
  fehlerbildIds: ['deckflaeche', 'mantel', 'halbiert'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.int(5, 14);
    const a2 = r.int(2, a - 2);
    const hs = r.int(3, 12);
    const trapez = ((a + a2) / 2) * hs;
    const o = a * a + a2 * a2 + 4 * trapez;
    const loesung = z(o);
    return {
      platzhalter: { a, ad: a2, hs },
      loesung,
      loesungsweg: [
        de(
          `Ein Trapez: $\\frac{${a} + ${a2}}{2} \\cdot ${hs} = ${texZahl(trapez)}$ cm², der Mantel hat vier davon: $${texZahl(4 * trapez)}$ cm².`,
        ),
        de(
          `$O = ${a}^2 + ${a2}^2 + ${texZahl(4 * trapez)} = ${texZahl(o)}$ cm² (Grundfläche, Deckfläche, Mantel)`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['deckflaeche', z(a * a + 4 * trapez)],
        ['mantel', z(4 * trapez)],
        ['halbiert', z(a * a + a2 * a2 + 8 * trapez)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Begründen (M.GM.KP.STUMPF.BEGRUENDEN, Niveau E)

const ANTEILE = [
  [1, 2],
  [1, 3],
  [2, 3],
] as const;

/** „Auf halber Höhe abgeschnitten: Der Stumpf ist die Hälfte der Pyramide.“ */
export const kpStumpfAussage = aussagenGenerator(
  'kp.stumpf-aussage',
  ['linear', 'quadrat'],
  ['zaehler', 'nenner'],
  (r) => {
    const [zz, n] = r.pick(ANTEILE);
    const n3 = n ** 3;
    const z3 = zz ** 3;
    const n2 = n ** 2;
    const z2 = zz ** 2;
    const bruch = (p: number, q: number) => `$\\frac{${p}}{${q}}$`;
    return {
      situation: `Eine Pyramide wird parallel zur Grundfläche durchgeschnitten. Die abgeschnittene Spitze ist ${bruch(zz, n)} so hoch wie die ganze Pyramide. Lena sagt: „Dann hat der Stumpf ${bruch(n - zz, n)} des Volumens der Pyramide.“ Stimmt das?`,
      werte: { zaehler: zz, nenner: n },
      richtig: `Nein. Die Spitze ist der Pyramide ähnlich, alle Kanten sind ${bruch(zz, n)} so lang. Ihr Volumen ist $(\\frac{${zz}}{${n}})^3 = \\frac{${z3}}{${n3}}$ der Pyramide, der Stumpf hat also ${bruch(n3 - z3, n3)}.`,
      falsch: [
        ['linear', 'Ja, denn Höhe und Volumen ändern sich im gleichen Verhältnis.'],
        [
          'quadrat',
          `Nein. Die Spitze hat $(\\frac{${zz}}{${n}})^2 = \\frac{${z2}}{${n2}}$ des Volumens, der Stumpf also ${bruch(n2 - z2, n2)}.`,
        ],
      ],
      weg: [
        'Die Spitze ist eine verkleinerte Pyramide: Alle Längen werden mit demselben Faktor k multipliziert.',
        'Volumen wachsen mit k³, Flächen mit k².',
        `Stumpf: $1 - (\\frac{${zz}}{${n}})^3 = \\frac{${n3 - z3}}{${n3}}$`,
      ],
    };
  },
);
