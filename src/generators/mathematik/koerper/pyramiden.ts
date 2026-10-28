// Pyramiden, Masse und Verpackungen – Klasse 7 (LEHRPLAN §8c, Feld KP):
// Pyramiden und Pyramidenstümpfe erkennen und zählen, Volumen und Oberfläche
// von Pyramiden, Masse aus Volumen und Dichte, Materialbedarf von Verpackungen.
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';

const zz = (x: number) => zahl(runde10(x, 6));
const ECKIG: Readonly<Record<number, string>> = {
  3: 'dreieckige',
  4: 'viereckige',
  5: 'fünfeckige',
  6: 'sechseckige',
  7: 'siebeneckige',
  8: 'achteckige',
};

// ---------------------------------------------------------------------------
// Ecken, Kanten, Flächen (M.RF.KP.PYRAMIDEN.ZAEHLEN)

export interface PyramideZaehlenParameter {
  readonly n_max: number; // 4 … 8
  /** auch Pyramidenstümpfe */
  readonly stumpf: boolean;
}

const WAS = ['Ecken', 'Kanten', 'Flächen'] as const;

/** „Wie viele Kanten hat eine sechseckige Pyramide?“ */
export const pyramideZaehlen: Generator<PyramideZaehlenParameter> = {
  id: 'kp.pyramide-zaehlen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['wie-prisma', 'spitze-vergessen', 'grundflaeche-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.int(3, p.n_max);
    const stumpf = p.stumpf && r.int(0, 1) === 0;
    const was = r.int(0, 2);
    const koerper = stumpf
      ? `ein ${ECKIG[n]?.replace(/e$/, 'er')} Pyramidenstumpf`
      : `eine ${ECKIG[n]} Pyramide`;
    // Pyramide: n + 1 Ecken, 2n Kanten, n + 1 Flächen; Stumpf: 2n, 3n, n + 2 (wie ein Prisma)
    const wert = stumpf ? [2 * n, 3 * n, n + 2][was] : [n + 1, 2 * n, n + 1][was];
    const richtig = zahl(wert ?? 0);
    const prisma = [2 * n, 3 * n, n + 2][was] ?? 0;
    return {
      platzhalter: { frage: de(`Wie viele ${WAS[was]} hat ${koerper}?`) },
      loesung: richtig,
      loesungsweg: stumpf
        ? [
            de(`Ein Pyramidenstumpf hat oben und unten ein ${n}-Eck und dazwischen ${n} Trapeze.`),
            de(
              `Ecken: 2 · ${n} = ${2 * n}. Kanten: 3 · ${n} = ${3 * n}. Flächen: ${n} + 2 = ${n + 2}.`,
            ),
          ]
        : [
            de(
              `Eine Pyramide hat unten ein ${n}-Eck und ${n} dreieckige Seitenflächen, die sich in der Spitze treffen.`,
            ),
            de(
              `Ecken: ${n} + 1 = ${n + 1}. Kanten: 2 · ${n} = ${2 * n}. Flächen: ${n} + 1 = ${n + 1}.`,
            ),
          ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['wie-prisma', stumpf ? undefined : zahl(prisma)],
        ['spitze-vergessen', !stumpf && was === 0 ? zahl(n) : undefined],
        ['grundflaeche-vergessen', !stumpf && was === 2 ? zahl(n) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Pyramide, Prisma oder Pyramidenstumpf? (M.RF.KP.PYRAMIDEN.ERKENNEN)

const KOERPER = ['Pyramide', 'Prisma', 'Pyramidenstumpf'] as const;

interface Beschreibung {
  readonly text: (n: string) => string;
  readonly koerper: 0 | 1 | 2;
  readonly netz: boolean;
}

const BESCHREIBUNGEN: readonly Beschreibung[] = [
  {
    text: (n) =>
      `Der Körper hat eine ${n} Grundfläche. Die Seitenflächen sind Dreiecke, die sich in einer Spitze treffen.`,
    koerper: 0,
    netz: false,
  },
  {
    text: (n) =>
      `Der Körper hat zwei gleiche, parallele ${n} Flächen. Die Seitenflächen sind Rechtecke.`,
    koerper: 1,
    netz: false,
  },
  {
    text: (n) =>
      `Der Körper hat unten eine große und oben eine kleinere ${n} Fläche, beide parallel. Die Seitenflächen sind Trapeze.`,
    koerper: 2,
    netz: false,
  },
  {
    text: (n) =>
      `Ein Netz besteht aus einer ${n.replace(/e$/, 'en')} Fläche und Dreiecken, die rundherum an ihren Seiten hängen.`,
    koerper: 0,
    netz: true,
  },
  {
    text: (n) =>
      `Ein Netz besteht aus zwei gleichen ${n.replace(/e$/, 'en')} Flächen und mehreren Rechtecken in einer Reihe.`,
    koerper: 1,
    netz: true,
  },
  {
    text: (n) =>
      `Ein Netz besteht aus zwei verschieden großen ${n.replace(/e$/, 'en')} Flächen und Trapezen dazwischen.`,
    koerper: 2,
    netz: true,
  },
];

export interface ErkennenParameter {
  /** auch Beschreibungen von Netzen */
  readonly netze: boolean;
}

/** „Welcher Körper ist das?“ – Pyramide, Prisma oder Pyramidenstumpf */
export const pyramideErkennen: Generator<ErkennenParameter> = {
  id: 'kp.pyramide-erkennen',
  version: 1,
  platzhalter: ['beschreibung'],
  fehlerbildIds: ['stumpf-als-prisma', 'pyramide-als-prisma', 'stumpf-als-pyramide'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.pick(BESCHREIBUNGEN.filter((x) => p.netze || !x.netz));
    const n = r.int(3, 6);
    const richtig = auswahl(b.koerper);
    return {
      platzhalter: { beschreibung: de(b.text(ECKIG[n] ?? 'viereckige')) },
      optionen: KOERPER.map((k) => ({ text: de(k) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Pyramide: eine Grundfläche und dreieckige Seitenflächen mit Spitze. Prisma: zwei gleiche, parallele Flächen und Rechtecke. Pyramidenstumpf: zwei verschieden große, parallele Flächen und Trapeze.',
        ),
        de(`Hier: ${KOERPER[b.koerper]}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['stumpf-als-prisma', b.koerper === 2 ? auswahl(1) : undefined],
        ['stumpf-als-pyramide', b.koerper === 2 ? auswahl(0) : undefined],
        [
          'pyramide-als-prisma',
          b.koerper === 0 ? auswahl(1) : b.koerper === 1 ? auswahl(0) : undefined,
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Volumen von Pyramiden (M.GM.KP.PYRAMIDE.VOLUMEN)

export interface PyramideVolumenParameter {
  /** auch rechteckige Grundflächen und zusammengesetzte Körper (Quader mit Pyramide) */
  readonly erweitert: boolean;
}

/** „Eine quadratische Pyramide hat a = 6 cm und h = 10 cm. Berechne ihr Volumen.“ */
export const pyramideVolumen: Generator<PyramideVolumenParameter> = {
  id: 'kp.pyramide-volumen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['drittel-vergessen', 'halbiert-statt-gedrittelt', 'quader-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = p.erweitert ? r.int(0, 2) : 0;
    const a = r.int(2, 12);
    const b = art === 0 ? a : r.int(2, 12);
    let h = r.int(2, 15);
    // Volumen soll ganzzahlig sein: a · b · h durch 3 teilbar
    while ((a * b * h) % 3 !== 0) h += 1;
    const G = a * b;
    const vPyr = (G * h) / 3;
    const grund =
      art === 0
        ? `quadratische Grundfläche mit a = ${a} cm`
        : `rechteckige Grundfläche mit a = ${a} cm und b = ${b} cm`;
    if (art === 2) {
      const hq = r.int(2, 10);
      const vQ = G * hq;
      const wert = vQ + vPyr;
      const richtig = zahl(wert);
      return {
        platzhalter: {
          aufgabe: de(
            `Ein Turm besteht aus einem Quader (a = ${a} cm, b = ${b} cm, Höhe ${hq} cm) mit einer Pyramide darauf (gleiche Grundfläche, Höhe ${h} cm). Berechne das Volumen des Turms (in cm³).`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Quader: ${a} · ${b} · ${hq} = ${vQ} cm³`),
          de(`Pyramide: ${G} · ${h} : 3 = ${vPyr} cm³`),
          de(`Zusammen: ${wert} cm³`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['drittel-vergessen', zahl(vQ + G * h)],
          ['quader-vergessen', zahl(vPyr)],
        ]),
      };
    }
    const richtig = zahl(vPyr);
    return {
      platzhalter: {
        aufgabe: de(
          `Eine Pyramide hat eine ${grund} und die Höhe h = ${h} cm. Berechne ihr Volumen (in cm³).`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(
          'V = ⅓ · G · h: Eine Pyramide hat ein Drittel des Volumens eines Prismas mit gleicher Grundfläche und Höhe.',
        ),
        de(`G = ${a} · ${b} = ${G} cm². V = ${G} · ${h} : 3 = ${vPyr} cm³`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['drittel-vergessen', zahl(G * h)],
        ['halbiert-statt-gedrittelt', zz((G * h) / 2)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Oberfläche von Pyramiden (M.GM.KP.PYRAMIDE.OBERFLAECHE)

export interface PyramideOberflaecheParameter {
  readonly rechteckig: boolean;
}

/** „Quadratische Pyramide: a = 6 cm, Höhe der Seitenfläche hₛ = 5 cm. Berechne die Oberfläche.“ */
export const pyramideOberflaeche: Generator<PyramideOberflaecheParameter> = {
  id: 'kp.pyramide-oberflaeche',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['grundflaeche-vergessen', 'dreieck-nicht-halbiert', 'koerperhoehe-genommen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = r.int(2, 12);
    if (!p.rechteckig) {
      const hs = r.int(2, 12);
      const mantel = 4 * ((a * hs) / 2);
      const wert = a * a + mantel;
      const richtig = zahl(wert);
      return {
        platzhalter: {
          aufgabe: de(
            `Eine quadratische Pyramide hat die Grundkante a = ${a} cm. Jede dreieckige Seitenfläche hat die Höhe ${hs} cm. Berechne die Oberfläche (in cm²).`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Grundfläche: ${a} · ${a} = ${a * a} cm²`),
          de(`Vier Dreiecke: 4 · ${a} · ${hs} : 2 = ${mantel} cm²`),
          de(`Oberfläche: ${wert} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['grundflaeche-vergessen', zahl(mantel)],
          ['dreieck-nicht-halbiert', zahl(a * a + 2 * mantel)],
        ]),
      };
    }
    const b = r.int(2, 12);
    const ha = r.int(2, 12);
    const hb = r.int(2, 12);
    const mantel = 2 * ((a * ha) / 2) + 2 * ((b * hb) / 2);
    const wert = a * b + mantel;
    const richtig = zahl(wert);
    return {
      platzhalter: {
        aufgabe: de(
          `Eine Pyramide hat eine rechteckige Grundfläche mit a = ${a} cm und b = ${b} cm. Die beiden Dreiecke über a haben die Höhe ${ha} cm, die beiden über b die Höhe ${hb} cm. Berechne die Oberfläche (in cm²).`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Grundfläche: ${a} · ${b} = ${a * b} cm²`),
        de(`Dreiecke: 2 · ${a} · ${ha} : 2 + 2 · ${b} · ${hb} : 2 = ${mantel} cm²`),
        de(`Oberfläche: ${wert} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['grundflaeche-vergessen', zahl(mantel)],
        ['dreieck-nicht-halbiert', zahl(a * b + 2 * mantel)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Masse und Dichte (M.GM.KP.MASSE.BERECHNEN, .KOERPER)

const STOFFE = [
  { name: 'Holz (Fichte)', dichte: 0.5 },
  { name: 'Eis', dichte: 0.9 },
  { name: 'Wasser', dichte: 1 },
  { name: 'Glas', dichte: 2.5 },
  { name: 'Aluminium', dichte: 2.7 },
  { name: 'Eisen', dichte: 7.9 },
  { name: 'Kupfer', dichte: 8.9 },
] as const;

export interface MasseParameter {
  /** auch Volumen oder Dichte gesucht, Einheiten kg und dm³ */
  readonly erweitert: boolean;
}

/** „Ein Würfel aus Aluminium hat 20 cm³. Wie schwer ist er?“ */
export const masseDichte: Generator<MasseParameter> = {
  id: 'kp.masse-dichte',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['geteilt-statt-mal', 'mal-statt-geteilt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const s = r.pick(STOFFE);
    const v = r.int(2, 50);
    const m = runde10(v * s.dichte, 6);
    const art = p.erweitert ? r.pick(['m', 'V', 'rho'] as const) : 'm';
    const [ve, me, de_] = p.erweitert ? ['dm³', 'kg', 'kg/dm³'] : ['cm³', 'g', 'g/cm³'];
    const D = zahlText(s.dichte);
    let text: string;
    let wert: number;
    let weg: string;
    const kandidaten: [string, Loesung | undefined][] = [];
    if (art === 'm') {
      text = `Ein Körper aus ${s.name} hat das Volumen ${v} ${ve}. Die Dichte ist ${D} ${de_}. Berechne die Masse (in ${me}).`;
      wert = m;
      weg = `m = ϱ · V = ${D} · ${v} = ${zahlText(m)} ${me}`;
      kandidaten.push(['geteilt-statt-mal', zz(v / s.dichte)]);
    } else if (art === 'V') {
      text = `Ein Körper aus ${s.name} wiegt ${zahlText(m)} ${me}. Die Dichte ist ${D} ${de_}. Berechne das Volumen (in ${ve}).`;
      wert = v;
      weg = `V = m : ϱ = ${zahlText(m)} : ${D} = ${v} ${ve}`;
      kandidaten.push(['mal-statt-geteilt', zz(m * s.dichte)]);
    } else {
      text = `Ein Körper hat das Volumen ${v} ${ve} und wiegt ${zahlText(m)} ${me}. Berechne die Dichte (in ${de_}).`;
      wert = s.dichte;
      weg = `ϱ = m : V = ${zahlText(m)} : ${v} = ${D} ${de_}`;
      kandidaten.push(['geteilt-statt-mal', zz(v / m)]);
    }
    const richtig = zz(wert);
    return {
      platzhalter: { aufgabe: de(text) },
      loesung: richtig,
      loesungsweg: [de('Masse = Dichte · Volumen (m = ϱ · V).'), de(weg)],
      fehlerbilder: fehlerbilderAus(richtig, kandidaten),
    };
  },
};

export interface MasseKoerperParameter {
  /** false: Quader in cm; true: Dreiecksprisma in dm */
  readonly prisma: boolean;
}

/** „Ein Eisenquader ist 5 cm lang, 4 cm breit, 2 cm hoch. Wie schwer ist er?“ */
export const masseKoerper: Generator<MasseKoerperParameter> = {
  id: 'kp.masse-koerper',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['dichte-vergessen', 'dreieck-nicht-halbiert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const s = r.pick(STOFFE.filter((x) => x.name !== 'Wasser'));
    const D = zahlText(s.dichte);
    if (!p.prisma) {
      const [a, b, c] = [r.int(2, 10), r.int(2, 10), r.int(1, 6)];
      const v = a * b * c;
      const m = runde10(v * s.dichte, 6);
      const richtig = zz(m);
      return {
        platzhalter: {
          aufgabe: de(
            `Ein Quader aus ${s.name} ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Die Dichte ist ${D} g/cm³. Wie schwer ist er (in g)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`V = ${a} · ${b} · ${c} = ${v} cm³`),
          de(`m = ${D} · ${v} = ${zahlText(m)} g`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['dichte-vergessen', zahl(v)]]),
      };
    }
    // Dreiecksprisma: rechtwinkliges Dreieck mit Katheten g und h als Grundfläche, Länge l (dm)
    let g = r.int(1, 6);
    const h = r.int(1, 6);
    if ((g * h) % 2 === 1) g += 1;
    const l = r.int(2, 10);
    const v = ((g * h) / 2) * l;
    const m = runde10(v * s.dichte, 6);
    const richtig = zz(m);
    return {
      platzhalter: {
        aufgabe: de(
          `Ein Keil aus ${s.name} ist ein Prisma. Seine Grundfläche ist ein rechtwinkliges Dreieck mit den Katheten ${g} dm und ${h} dm, er ist ${l} dm lang. Die Dichte ist ${D} kg/dm³. Wie schwer ist er (in kg)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`G = ${g} · ${h} : 2 = ${(g * h) / 2} dm²; V = G · ${l} = ${v} dm³`),
        de(`m = ${D} · ${v} = ${zahlText(m)} kg`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['dichte-vergessen', zahl(v)],
        ['dreieck-nicht-halbiert', zz(2 * m)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Verpackungen (M.GM.KP.VERPACKUNG.VERGLEICHEN, .MATERIAL)

const oberflaeche = (a: number, b: number, c: number) => 2 * (a * b + a * c + b * c);

/** Schachteln (Quader) mit gleichem Volumen und verschiedenen Oberflächen */
const SCHACHTELN: readonly (readonly [number, number, number])[][] = [
  [
    [2, 4, 8],
    [4, 4, 4],
    [1, 8, 8],
  ],
  [
    [3, 4, 6],
    [2, 6, 6],
    [1, 6, 12],
  ],
  [
    [2, 5, 10],
    [5, 5, 4],
    [1, 10, 10],
  ],
  [
    [3, 6, 6],
    [2, 6, 9],
    [4, 3, 9],
  ],
  [
    [2, 3, 12],
    [3, 4, 6],
    [2, 6, 6],
  ],
  [
    [4, 5, 5],
    [2, 5, 10],
    [1, 10, 10],
  ],
];

export interface VergleichParameter {
  readonly drei: boolean;
}

/** „Welche Schachtel braucht am wenigsten Pappe?“ – gleiches Volumen */
export const verpackungVergleich: Generator<VergleichParameter> = {
  id: 'kp.verpackung-vergleich',
  version: 1,
  platzhalter: ['volumen'],
  fehlerbildIds: ['meiste-pappe'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const satz = r.pick(SCHACHTELN);
    const auswahlS = mische(r, satz).slice(0, p.drei ? 3 : 2);
    const flaechen = auswahlS.map(([a, b, c]) => oberflaeche(a, b, c));
    const kleinste = flaechen.indexOf(Math.min(...flaechen));
    const groesste = flaechen.indexOf(Math.max(...flaechen));
    if (new Set(flaechen).size !== flaechen.length) return verpackungVergleich.erzeuge(seed + 1, p);
    const [a0, b0, c0] = auswahlS[0] ?? [1, 1, 1];
    const richtig = auswahl(kleinste);
    return {
      platzhalter: { volumen: de(`${a0 * b0 * c0} cm³`) },
      optionen: auswahlS.map(([a, b, c], i) => ({
        text: de(`Schachtel ${'ABC'[i]}: ${a} cm × ${b} cm × ${c} cm`),
      })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Alle Schachteln haben dasselbe Volumen. Die Pappe ist die Oberfläche: O = 2 · (a · b + a · c + b · c).',
        ),
        de(auswahlS.map(([a, b, c], i) => `${'ABC'[i]}: ${oberflaeche(a, b, c)} cm²`).join(', ')),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['meiste-pappe', auswahl(groesste)]]),
    };
  },
};

export interface MaterialParameter {
  /** Schachtel ohne Deckel und mit Zuschlag für Klebelaschen */
  readonly erweitert: boolean;
}

/** „Wie viel Pappe braucht man für eine Schachtel 20 cm × 10 cm × 5 cm?“ */
export const verpackungMaterial: Generator<MaterialParameter> = {
  id: 'kp.verpackung-material',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['volumen-statt-oberflaeche', 'deckel-mitgezaehlt', 'zuschlag-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const [a, b, c] = [r.int(2, 12) * 2, r.int(2, 10) * 2, r.int(1, 8) * 2];
    const voll = oberflaeche(a, b, c);
    if (!p.erweitert) {
      const richtig = zahl(voll);
      return {
        platzhalter: {
          aufgabe: de(
            `Eine geschlossene Schachtel ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie viel Pappe braucht man mindestens (in cm²)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [de(`O = 2 · (${a} · ${b} + ${a} · ${c} + ${b} · ${c}) = ${voll} cm²`)],
        fehlerbilder: fehlerbilderAus(richtig, [['volumen-statt-oberflaeche', zahl(a * b * c)]]),
      };
    }
    const ohneDeckel = voll - a * b;
    const zuschlag = r.pick([10, 20, 25] as const);
    const wert = runde10(ohneDeckel * (1 + zuschlag / 100), 6);
    const richtig = zz(wert);
    return {
      platzhalter: {
        aufgabe: de(
          `Eine Schachtel ohne Deckel ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Für Klebelaschen kommen ${zuschlag} % Pappe dazu. Wie viel Pappe braucht man (in cm²)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Ohne Deckel: ${voll} − ${a} · ${b} = ${ohneDeckel} cm²`),
        de(
          `Mit ${zuschlag} % Zuschlag: ${ohneDeckel} · ${zahlText(1 + zuschlag / 100)} = ${zahlText(wert)} cm²`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['deckel-mitgezaehlt', zz(voll * (1 + zuschlag / 100))],
        ['zuschlag-vergessen', zahl(ohneDeckel)],
      ]),
    };
  },
};
