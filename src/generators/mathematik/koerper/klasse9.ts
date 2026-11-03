// Körper in Klasse 9 (LEHRPLAN §8e, Feld KP): Höhen der Pyramide mit Pythagoras, Kreiskegel,
// Kugel, Kegel darstellen, zusammengesetzte Körper. Wie in Klasse 8 wird mit π ≈ 3,14 gerechnet;
// Ergebnisse mit Drittel oder Wurzel werden auf eine Nachkommastelle gerundet (B3).
import type { Bild, Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { rundeAuf } from '../../../core/learning/auswertung';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, kreis, linie, rechteck, text, vieleck } from '../../svg';

const PI = 3.14;
const r1 = (x: number) => rundeAuf(x, 1);
/** Lösung auf eine Stelle gerundet, mit `runden`, wenn nicht schon genau */
function gerundet(genau: number): {
  loesung: Loesung;
  runden?: { stellen: number; genau: number };
} {
  const g = r1(genau);
  return Math.abs(g - genau) < 1e-9
    ? { loesung: zahl(g) }
    : { loesung: zahl(g), runden: { stellen: 1, genau } };
}
const z = (x: number) => zahl(r1(x));
const t = (x: number) => texZahl(r1(x));
const nah = (a: Loesung | undefined, b: number) =>
  a !== undefined && a.typ === 'zahl' && Math.abs(a.wert - r1(b)) < 0.15;
/** Fehlerbilder ohne solche, die (gerundet) wie die Lösung aussehen */
const ohneNahe = (genau: number, liste: [string, Loesung | undefined][]) =>
  liste.filter(([, l]) => l !== undefined && !nah(l, genau));

// ---------------------------------------------------------------------------
// Höhen der Pyramide (M.GM.KP.PYRAMIDE-HOEHEN.BERECHNEN)

export interface PyramideHoehenParameter {
  /** true: auch Seitenkante über die halbe Diagonale */
  readonly kante: boolean;
}

/** Quadratische Pyramide: Seitenhöhe, Körperhöhe oder Seitenkante */
export const kpPyramideHoehe: Generator<PyramideHoehenParameter> = {
  id: 'kp.pyramide-hoehe',
  version: 1,
  platzhalter: ['angabe', 'gesucht'],
  fehlerbildIds: ['ganze-kante', 'kathete-addiert', 'diagonale-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = 2 * r.int(2, 8);
    const h = r.int(3, 15);
    const art = p.kante
      ? r.pick(['seitenhoehe', 'kante', 'kante-aus-hs'] as const)
      : r.pick(['seitenhoehe', 'hoehe'] as const);
    const hs = Math.sqrt(h * h + (a / 2) ** 2);
    if (art === 'seitenhoehe') {
      const { loesung, runden } = gerundet(hs);
      return {
        platzhalter: {
          angabe: de(
            `Eine quadratische Pyramide hat die Grundkante a = ${a} cm und die Körperhöhe h = ${h} cm.`,
          ),
          gesucht: de('die Seitenhöhe $h_s$'),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(`Rechtwinkliges Dreieck aus h, der halben Grundkante und $h_s$ als Hypotenuse.`),
          de(
            `$h_s^2 = ${h}^2 + ${a / 2}^2 = ${h * h + (a / 2) ** 2}$, also $h_s \\approx ${t(hs)}$ cm.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(hs, [['ganze-kante', z(Math.sqrt(h * h + a * a))]]),
        ),
      };
    }
    if (art === 'hoehe') {
      const hsGanz = r1(hs);
      const genau = Math.sqrt(hsGanz * hsGanz - (a / 2) ** 2);
      const { loesung, runden } = gerundet(genau);
      return {
        platzhalter: {
          angabe: de(
            `Eine quadratische Pyramide hat die Grundkante a = ${a} cm und die Seitenhöhe $h_s = ${t(hsGanz)}$ cm.`,
          ),
          gesucht: de('die Körperhöhe h'),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de('Die Seitenhöhe ist die Hypotenuse, h und die halbe Grundkante sind die Katheten.'),
          de(`$h^2 = ${t(hsGanz)}^2 - ${a / 2}^2$, also $h \\approx ${t(genau)}$ cm.`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(genau, [
            ['kathete-addiert', z(Math.sqrt(hsGanz * hsGanz + (a / 2) ** 2))],
            ['ganze-kante', hsGanz > a ? z(Math.sqrt(hsGanz * hsGanz - a * a)) : undefined],
          ]),
        ),
      };
    }
    if (art === 'kante') {
      const d2 = (a * Math.SQRT2) / 2;
      const s = Math.sqrt(h * h + d2 * d2);
      const { loesung, runden } = gerundet(s);
      return {
        platzhalter: {
          angabe: de(
            `Eine quadratische Pyramide hat die Grundkante a = ${a} cm und die Körperhöhe h = ${h} cm.`,
          ),
          gesucht: de('die Seitenkante s'),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(
            `Die halbe Diagonale der Grundfläche: $\\frac{d}{2} = \\frac{a}{2} \\cdot \\sqrt{2} \\approx ${t(d2)}$ cm.`,
          ),
          de(
            `$s^2 = h^2 + \\left(\\frac{d}{2}\\right)^2 = ${h * h} + ${t(d2 * d2)}$, also $s \\approx ${t(s)}$ cm.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(loesung, ohneNahe(s, [['diagonale-falsch', z(hs)]])),
      };
    }
    // Seitenkante aus Seitenhöhe und halber Grundkante
    const s = Math.sqrt(hs * hs + (a / 2) ** 2);
    const hsGanz = r1(hs);
    const genau = Math.sqrt(hsGanz * hsGanz + (a / 2) ** 2);
    const { loesung, runden } = gerundet(genau);
    return {
      platzhalter: {
        angabe: de(
          `Eine quadratische Pyramide hat die Grundkante a = ${a} cm und die Seitenhöhe $h_s = ${t(hsGanz)}$ cm.`,
        ),
        gesucht: de('die Seitenkante s'),
      },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de(
          'Im Seitendreieck: $h_s$ und die halbe Grundkante sind die Katheten, s ist die Hypotenuse.',
        ),
        de(`$s^2 = ${t(hsGanz)}^2 + ${a / 2}^2$, also $s \\approx ${t(s)}$ cm.`),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(genau, [
          ['ganze-kante', z(Math.sqrt(hsGanz * hsGanz + a * a))],
          ['kathete-addiert', z(Math.sqrt(Math.max(0, hsGanz * hsGanz - (a / 2) ** 2)))],
        ]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Welche Strecke ist die Hypotenuse? (M.GM.KP.PYRAMIDE-HOEHEN.HYPOTENUSE, Niveau E)

/** „Im Dreieck aus h, h_s und a/2: Welche Strecke ist die Hypotenuse?“ */
export const kpHypotenuse: Generator<Record<string, never>> = {
  id: 'kp.hypotenuse',
  version: 1,
  platzhalter: ['dreieck'],
  fehlerbildIds: ['laengste-gegeben', 'senkrecht', 'grundkante'],

  erzeuge(seed) {
    const r = rng(seed);
    const fall = r.pick([
      {
        dreieck: 'der Körperhöhe h, der halben Grundkante und der Seitenhöhe $h_s$',
        hyp: '$h_s$',
        senkrecht: 'h',
        grund: 'die halbe Grundkante',
      },
      {
        dreieck: 'der Körperhöhe h, der halben Diagonale der Grundfläche und der Seitenkante s',
        hyp: 's',
        senkrecht: 'h',
        grund: 'die halbe Diagonale',
      },
      {
        dreieck: 'der Seitenhöhe $h_s$, der halben Grundkante und der Seitenkante s',
        hyp: 's',
        senkrecht: '$h_s$',
        grund: 'die halbe Grundkante',
      },
    ] as const);
    const andere = fall.hyp === 's' ? (fall.senkrecht === 'h' ? '$h_s$' : 'h') : 's';
    const kandidaten: [string, string][] = [
      ['richtig', `${fall.hyp}, denn sie liegt dem rechten Winkel gegenüber.`],
      ['senkrecht', `${fall.senkrecht}, denn sie steht senkrecht.`],
      ['grundkante', `${fall.grund}, denn sie liegt unten.`],
      ['laengste-gegeben', `${andere}, denn sie ist die längste Strecke der Pyramide.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: { dreieck: de(fall.dreieck) },
      optionen: liste.map(([, x]) => ({ text: de(x) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de('Suche den rechten Winkel im Dreieck. Die Hypotenuse liegt ihm gegenüber.'),
        de(
          `Hier liegt der rechte Winkel zwischen ${fall.senkrecht} und ${fall.grund}. Also ist ${fall.hyp} die Hypotenuse.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Kreiskegel (M.GM.KP.KEGEL.BERECHNEN)

export interface KegelParameter {
  /** true: auch Mantel und Oberfläche */
  readonly erweitert: boolean;
}

/** „Ein Kegel hat r = 4 cm und h = 9 cm. Berechne das Volumen.“ */
export const kpKegel: Generator<KegelParameter> = {
  id: 'kp.kegel',
  version: 1,
  platzhalter: ['angabe', 'gesucht', 'einheit'],
  fehlerbildIds: [
    'drittel-vergessen',
    'durchmesser',
    'hoehe-statt-mantellinie',
    'grundflaeche-vergessen',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const rad = r.int(2, 9);
    const h = r.int(3, 15);
    const s = Math.sqrt(rad * rad + h * h);
    const art = p.erweitert
      ? r.pick(['mantel', 'oberflaeche', 'volumen'] as const)
      : r.pick(['mantellinie', 'volumen'] as const);
    const angabe = de(`Ein Kreiskegel hat den Radius r = ${rad} cm und die Höhe h = ${h} cm.`);
    if (art === 'mantellinie') {
      const { loesung, runden } = gerundet(s);
      return {
        platzhalter: { angabe, gesucht: de('die Mantellinie s'), einheit: de('cm') },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(
            'Radius, Höhe und Mantellinie bilden ein rechtwinkliges Dreieck, s ist die Hypotenuse.',
          ),
          de(`$s^2 = ${rad}^2 + ${h}^2 = ${rad * rad + h * h}$, also $s \\approx ${t(s)}$ cm.`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(s, [['durchmesser', z(Math.sqrt(4 * rad * rad + h * h))]]),
        ),
      };
    }
    if (art === 'volumen') {
      const v = (PI * rad * rad * h) / 3;
      const { loesung, runden } = gerundet(v);
      return {
        platzhalter: { angabe, gesucht: de('das Volumen V'), einheit: de('cm³') },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(
            '$V = \\frac{1}{3} \\cdot \\pi \\cdot r^2 \\cdot h$, ein Drittel des Zylinders mit gleicher Grundfläche und Höhe.',
          ),
          de(`$V = \\frac{1}{3} \\cdot 3{,}14 \\cdot ${rad}^2 \\cdot ${h} \\approx ${t(v)}$ cm³`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(v, [
            ['drittel-vergessen', z(PI * rad * rad * h)],
            ['durchmesser', z((PI * 4 * rad * rad * h) / 3)],
          ]),
        ),
      };
    }
    if (art === 'mantel') {
      const m = PI * rad * s;
      const { loesung, runden } = gerundet(m);
      return {
        platzhalter: { angabe, gesucht: de('den Flächeninhalt des Mantels M'), einheit: de('cm²') },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(`Erst die Mantellinie: $s = \\sqrt{${rad}^2 + ${h}^2} \\approx ${t(s)}$ cm.`),
          de(
            `$M = \\pi \\cdot r \\cdot s = 3{,}14 \\cdot ${rad} \\cdot ${t(s)} \\approx ${t(m)}$ cm²`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(m, [['hoehe-statt-mantellinie', z(PI * rad * h)]]),
        ),
      };
    }
    const o = PI * rad * rad + PI * rad * s;
    const { loesung, runden } = gerundet(o);
    return {
      platzhalter: { angabe, gesucht: de('die Oberfläche O'), einheit: de('cm²') },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de(`Mantellinie: $s = \\sqrt{${rad}^2 + ${h}^2} \\approx ${t(s)}$ cm.`),
        de(
          `$O = \\pi r^2 + \\pi r s = 3{,}14 \\cdot ${rad * rad} + 3{,}14 \\cdot ${rad} \\cdot ${t(s)} \\approx ${t(o)}$ cm²`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(o, [
          ['grundflaeche-vergessen', z(PI * rad * s)],
          ['hoehe-statt-mantellinie', z(PI * rad * rad + PI * rad * h)],
        ]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Kegel und Zylinder (M.GM.KP.KEGEL.VERGLEICH, Niveau E)

/** „Ein Kegel fasst 50 cm³. Wie viel fasst ein Zylinder mit gleicher Grundfläche und Höhe?“ */
export const kpKegelZylinder: Generator<Record<string, never>> = {
  id: 'kp.kegel-zylinder',
  version: 1,
  platzhalter: ['volumen'],
  fehlerbildIds: ['umgekehrt', 'halb', 'gleich'],

  erzeuge(seed) {
    const r = rng(seed);
    const v = 3 * r.int(5, 80);
    const kandidaten: [string, string][] = [
      ['richtig', `${3 * v} cm³, denn der Kegel ist ein Drittel des Zylinders.`],
      ['umgekehrt', `${v / 3} cm³, denn der Zylinder ist ein Drittel des Kegels.`],
      ['halb', `${2 * v} cm³, denn der Kegel ist die Hälfte des Zylinders.`],
      ['gleich', `${v} cm³, denn Grundfläche und Höhe sind gleich.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: { volumen: v },
      optionen: liste.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          '$V_{\\text{Kegel}} = \\frac{1}{3} \\cdot G \\cdot h$ und $V_{\\text{Zylinder}} = G \\cdot h$.',
        ),
        de(`Der Zylinder fasst dreimal so viel: $3 \\cdot ${v} = ${3 * v}$ cm³.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Kugel (M.GM.KP.KUGEL.BERECHNEN)

export interface KugelParameter {
  /** true: auch den Radius aus dem Volumen (Kubikwurzel) */
  readonly rueckwaerts: boolean;
}

/** „Berechne das Volumen einer Kugel mit r = 6 cm.“ / „Welchen Radius hat eine Kugel mit V = …?“ */
export const kpKugel: Generator<KugelParameter> = {
  id: 'kp.kugel',
  version: 1,
  platzhalter: ['angabe', 'gesucht', 'einheit'],
  fehlerbildIds: ['quadrat-statt-hoch3', 'durchmesser', 'oberflaeche-formel', 'quadratwurzel'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const rad = r.int(2, 12);
    const art = p.rueckwaerts
      ? r.pick(['volumen', 'radius', 'radius'] as const)
      : r.pick(['volumen', 'oberflaeche'] as const);
    if (art === 'volumen') {
      const v = (4 / 3) * PI * rad ** 3;
      const { loesung, runden } = gerundet(v);
      return {
        platzhalter: {
          angabe: de(`Eine Kugel hat den Radius r = ${rad} cm.`),
          gesucht: de('das Volumen V'),
          einheit: de('cm³'),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de('$V = \\frac{4}{3} \\cdot \\pi \\cdot r^3$'),
          de(
            `$V = \\frac{4}{3} \\cdot 3{,}14 \\cdot ${rad}^3 = \\frac{4}{3} \\cdot 3{,}14 \\cdot ${rad ** 3} \\approx ${t(v)}$ cm³`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(v, [
            ['quadrat-statt-hoch3', z((4 / 3) * PI * rad * rad)],
            ['durchmesser', z((4 / 3) * PI * (2 * rad) ** 3)],
            ['oberflaeche-formel', z(4 * PI * rad * rad)],
          ]),
        ),
      };
    }
    if (art === 'oberflaeche') {
      const o = 4 * PI * rad * rad;
      const { loesung, runden } = gerundet(o);
      return {
        platzhalter: {
          angabe: de(`Eine Kugel hat den Radius r = ${rad} cm.`),
          gesucht: de('die Oberfläche O'),
          einheit: de('cm²'),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de('$O = 4 \\cdot \\pi \\cdot r^2$, viermal die Fläche eines Großkreises.'),
          de(`$O = 4 \\cdot 3{,}14 \\cdot ${rad * rad} \\approx ${t(o)}$ cm²`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(o, [
            ['durchmesser', z(4 * PI * 4 * rad * rad)],
            ['quadrat-statt-hoch3', z(PI * rad * rad)],
          ]),
        ),
      };
    }
    // Radius aus dem Volumen: V auf eine Stelle gerundet angegeben
    const v = r1((4 / 3) * PI * rad ** 3);
    const genau = Math.cbrt((3 * v) / (4 * PI));
    const { loesung, runden } = gerundet(genau);
    return {
      platzhalter: {
        angabe: de(`Eine Kugel hat das Volumen $V = ${t(v)}$ cm³.`),
        gesucht: de('den Radius r'),
        einheit: de('cm'),
      },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de('Umstellen: $r^3 = \\frac{3 \\cdot V}{4 \\cdot \\pi}$, dann die dritte Wurzel.'),
        de(
          `$r^3 = \\frac{3 \\cdot ${t(v)}}{4 \\cdot 3{,}14} \\approx ${t((3 * v) / (4 * PI))}$, also $r \\approx ${t(genau)}$ cm.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(genau, [['quadratwurzel', z(Math.sqrt((3 * v) / (4 * PI)))]]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Radius verdoppeln (M.GM.KP.KUGEL.VERDOPPELN, Niveau E)

/** „Der Radius einer Kugel wird verdoppelt. Wie ändert sich das Volumen?“ */
export const kpVerdoppeln: Generator<Record<string, never>> = {
  id: 'kp.verdoppeln',
  version: 1,
  platzhalter: ['groesse', 'faktor'],
  fehlerbildIds: ['linear', 'quadratisch', 'kubisch-statt-quadratisch', 'summe'],

  erzeuge(seed) {
    const r = rng(seed);
    const k = r.pick([2, 3]);
    const groesse = r.pick(['Volumen', 'Oberfläche'] as const);
    const v = groesse === 'Volumen';
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Es wird ${v ? k ** 3 : k * k}-mal so groß, denn r steckt ${v ? 'hoch 3' : 'hoch 2'} in der Formel.`,
      ],
      ['linear', `Es wird ${k}-mal so groß, wie der Radius.`],
      [
        v ? 'quadratisch' : 'kubisch-statt-quadratisch',
        `Es wird ${v ? k * k : k ** 3}-mal so groß.`,
      ],
      ['summe', `Es wird ${2 * k}-mal so groß.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([q]) => q === id));
    return {
      platzhalter: { groesse: de(groesse), faktor: k },
      optionen: liste.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          v
            ? '$V = \\frac{4}{3} \\pi r^3$: Mit $k \\cdot r$ wird $r^3$ zu $k^3 \\cdot r^3$.'
            : '$O = 4 \\pi r^2$: Mit $k \\cdot r$ wird $r^2$ zu $k^2 \\cdot r^2$.',
        ),
        de(`Hier $k = ${k}$: Faktor ${v ? k ** 3 : k * k}.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Kegel darstellen (M.RF.KP.KEGEL.ERKENNEN): Zweitafelbild, Netz, liegender Kegel

type Koerper = 'kegel' | 'zylinder' | 'pyramide' | 'kugel';
const NAME: Readonly<Record<Koerper, string>> = {
  kegel: 'Kreiskegel',
  zylinder: 'Kreiszylinder',
  pyramide: 'quadratische Pyramide',
  kugel: 'Kugel',
};

/** Zweitafelbild: Vorderansicht oben, Draufsicht unten */
function zweitafel(k: Koerper, liegend = false): Bild {
  const teile: string[] = [linie(10, 120, 210, 120, 1)];
  const vorne = (): string[] => {
    if (liegend)
      return [
        vieleck([
          [50, 60],
          [170, 30],
          [170, 90],
        ]),
      ];
    if (k === 'kegel' || k === 'pyramide')
      return [
        vieleck([
          [70, 100],
          [150, 100],
          [110, 20],
        ]),
      ];
    if (k === 'zylinder') return [rechteck(70, 30, 80, 70)];
    return [kreis(110, 65, 40)];
  };
  const oben = (): string[] => {
    if (liegend)
      return [
        vieleck([
          [50, 175],
          [170, 145],
          [170, 205],
        ]),
      ];
    if (k === 'pyramide')
      return [
        rechteck(70, 135, 80, 80),
        linie(70, 135, 150, 215, 1.5),
        linie(150, 135, 70, 215, 1.5),
      ];
    if (k === 'kegel') return [kreis(110, 175, 40), kreis(110, 175, 2.5, true)];
    return [kreis(110, 175, 40)];
  };
  teile.push(
    ...vorne(),
    ...oben(),
    text(12, 16, 'Vorderansicht', 12),
    text(12, 136, 'Draufsicht', 12),
  );
  return bild(
    220,
    230,
    teile,
    de(
      liegend
        ? 'Zweitafelbild: Vorderansicht ein Dreieck mit der Spitze nach links, Draufsicht ebenfalls ein Dreieck.'
        : `Zweitafelbild eines Körpers. Vorderansicht: ${k === 'zylinder' ? 'Rechteck' : k === 'kugel' ? 'Kreis' : 'Dreieck'}. Draufsicht: ${k === 'pyramide' ? 'Quadrat mit Diagonalen' : k === 'kegel' ? 'Kreis mit Mittelpunkt' : 'Kreis'}.`,
    ),
  );
}

export interface KegelErkennenParameter {
  readonly art: 'zweitafel' | 'netz' | 'liegend';
}

/** „Welcher Körper hat dieses Zweitafelbild?“ / „Woraus besteht das Netz eines Kegels?“ */
export const kpKegelErkennen: Generator<KegelErkennenParameter> = {
  id: 'kp.kegel-erkennen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: [
    'dreieck-kegel',
    'dreieck-pyramide',
    'rechteck-zylinder',
    'kreis-kugel',
    'netz-dreieck',
    'netz-zylinder',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (p.art === 'netz') {
      const kandidaten: [string, string][] = [
        ['richtig', 'aus einem Kreis und einem Kreisausschnitt'],
        ['netz-dreieck', 'aus einem Kreis und einem Dreieck'],
        ['netz-zylinder', 'aus zwei Kreisen und einem Rechteck'],
        ['dreieck-pyramide', 'aus einem Quadrat und vier Dreiecken'],
      ];
      const liste = mische(r, kandidaten);
      const index = (id: string) => auswahl(liste.findIndex(([q]) => q === id));
      return {
        platzhalter: { frage: de('Woraus besteht das Netz eines Kreiskegels?') },
        optionen: liste.map(([, x]) => ({ text: de(x) })),
        loesung: index('richtig'),
        loesungsweg: [
          de('Die Grundfläche ist ein Kreis.'),
          de(
            'Den Mantel kann man aufschneiden und flach legen: Er wird ein Kreisausschnitt, dessen Radius die Mantellinie ist.',
          ),
        ],
        fehlerbilder: liste
          .filter(([id]) => id !== 'richtig')
          .map(([id]) => ({ id, antwort: index(id) })),
      };
    }
    const liegend = p.art === 'liegend';
    const k: Koerper = liegend ? 'kegel' : r.pick(['kegel', 'zylinder', 'pyramide', 'kugel']);
    const reihenfolge = mische(r, ['kegel', 'zylinder', 'pyramide', 'kugel'] as Koerper[]);
    const textFuer = (x: Koerper) =>
      liegend && x === 'kegel'
        ? 'ein liegender Kreiskegel'
        : `ein${x === 'pyramide' || x === 'kugel' ? 'e' : ''} ${NAME[x]}`;
    const fehlerId = (x: Koerper): string =>
      x === 'pyramide'
        ? 'dreieck-pyramide'
        : x === 'zylinder'
          ? 'rechteck-zylinder'
          : x === 'kugel'
            ? 'kreis-kugel'
            : 'dreieck-kegel';
    return {
      platzhalter: { frage: de('Welcher Körper hat dieses Zweitafelbild?') },
      bild: zweitafel(k, liegend),
      optionen: reihenfolge.map((x) => ({ text: de(textFuer(x)) })),
      loesung: auswahl(reihenfolge.indexOf(k)),
      loesungsweg: [
        de(
          'Vorderansicht und Draufsicht zusammen zeigen den Körper: Dreieck vorn und Kreis oben ist ein Kegel, Rechteck und Kreis ein Zylinder, Dreieck und Quadrat eine Pyramide, Kreis und Kreis eine Kugel.',
        ),
        de(
          liegend
            ? 'Zwei Dreiecke, aber die Spitze zeigt zur Seite: ein liegender Kegel. Von der Seite sähe man einen Kreis.'
            : `Hier: ${NAME[k]}.`,
        ),
      ],
      fehlerbilder: reihenfolge
        .filter((x) => x !== k)
        .map((x) => ({ id: fehlerId(x), antwort: auswahl(reihenfolge.indexOf(x)) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Zusammengesetzte Körper (M.GM.KP.ZUSAMMENGESETZT.BERECHNEN)

export interface ZusammengesetztParameter {
  readonly arten: readonly ('rakete' | 'eistuete' | 'haus')[];
}

/** Rakete (Zylinder + Kegel), Eistüte (Kegel + Halbkugel), Haus (Quader + Pyramide) */
export const kpZusammengesetzt: Generator<ZusammengesetztParameter> = {
  id: 'kp.zusammengesetzt',
  version: 1,
  platzhalter: ['situation'],
  fehlerbildIds: ['teil-vergessen', 'halbkugel-ganz', 'drittel-vergessen'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    if (art === 'rakete') {
      const rad = r.int(2, 6);
      const hz = r.int(5, 15);
      const hk = r.int(3, 8);
      const vz = PI * rad * rad * hz;
      const vk = (PI * rad * rad * hk) / 3;
      const { loesung, runden } = gerundet(vz + vk);
      return {
        platzhalter: {
          situation: de(
            `Eine Spielzeugrakete besteht aus einem Zylinder (r = ${rad} cm, h = ${hz} cm) mit einem Kegel als Spitze (gleicher Radius, h = ${hk} cm). Berechne ihr Volumen in cm³.`,
          ),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(`Zylinder: $3{,}14 \\cdot ${rad}^2 \\cdot ${hz} \\approx ${t(vz)}$ cm³`),
          de(
            `Kegel: $\\frac{1}{3} \\cdot 3{,}14 \\cdot ${rad}^2 \\cdot ${hk} \\approx ${t(vk)}$ cm³`,
          ),
          de(`Zusammen: $\\approx ${t(vz + vk)}$ cm³`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(vz + vk, [
            ['teil-vergessen', z(vz)],
            ['drittel-vergessen', z(vz + 3 * vk)],
          ]),
        ),
      };
    }
    if (art === 'eistuete') {
      const rad = r.int(2, 5);
      const hk = r.int(8, 14);
      const vk = (PI * rad * rad * hk) / 3;
      const vh = ((4 / 3) * PI * rad ** 3) / 2;
      const { loesung, runden } = gerundet(vk + vh);
      return {
        platzhalter: {
          situation: de(
            `Eine Eistüte ist ein Kegel (r = ${rad} cm, h = ${hk} cm), oben liegt eine Halbkugel Eis mit demselben Radius. Berechne das Volumen von Tüte und Eis zusammen in cm³.`,
          ),
        },
        loesung,
        ...(runden ? { runden } : {}),
        loesungsweg: [
          de(
            `Kegel: $\\frac{1}{3} \\cdot 3{,}14 \\cdot ${rad}^2 \\cdot ${hk} \\approx ${t(vk)}$ cm³`,
          ),
          de(
            `Halbkugel: $\\frac{1}{2} \\cdot \\frac{4}{3} \\cdot 3{,}14 \\cdot ${rad}^3 \\approx ${t(vh)}$ cm³`,
          ),
          de(`Zusammen: $\\approx ${t(vk + vh)}$ cm³`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          ohneNahe(vk + vh, [
            ['halbkugel-ganz', z(vk + 2 * vh)],
            ['teil-vergessen', z(vk)],
            ['drittel-vergessen', z(3 * vk + vh)],
          ]),
        ),
      };
    }
    const a = r.int(4, 10);
    const hq = r.int(3, 8);
    const hp = r.int(2, 6);
    const vq = a * a * hq;
    const vp = (a * a * hp) / 3;
    const { loesung, runden } = gerundet(vq + vp);
    return {
      platzhalter: {
        situation: de(
          `Ein Modellhaus besteht aus einem Quader mit quadratischer Grundfläche (a = ${a} cm, h = ${hq} cm) und einer Pyramide als Dach (gleiche Grundfläche, h = ${hp} cm). Berechne sein Volumen in cm³.`,
        ),
      },
      loesung,
      ...(runden ? { runden } : {}),
      loesungsweg: [
        de(`Quader: $${a}^2 \\cdot ${hq} = ${vq}$ cm³`),
        de(`Pyramide: $\\frac{1}{3} \\cdot ${a}^2 \\cdot ${hp} \\approx ${t(vp)}$ cm³`),
        de(`Zusammen: $\\approx ${t(vq + vp)}$ cm³`),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        ohneNahe(vq + vp, [
          ['teil-vergessen', z(vq)],
          ['drittel-vergessen', z(vq + 3 * vp)],
        ]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Lösungsplan wählen (M.GM.KP.ZUSAMMENGESETZT.PLAN, Niveau E)

/** „Ein Würfel mit Bohrung: Welcher Plan liefert das Volumen?“ */
export const kpPlan: Generator<Record<string, never>> = {
  id: 'kp.plan',
  version: 1,
  platzhalter: ['koerper'],
  fehlerbildIds: ['addiert', 'flaeche-statt-volumen', 'teil-vergessen'],

  erzeuge(seed) {
    const r = rng(seed);
    const fall = r.pick([
      {
        koerper: 'Ein Würfel mit einer durchgehenden zylindrischen Bohrung',
        ganz: 'Würfel',
        loch: 'Zylinder',
        kreis: 'Kreisfläche',
      },
      {
        koerper: 'Ein Quader, aus dem eine Halbkugel als Mulde herausgefräst ist',
        ganz: 'Quader',
        loch: 'Halbkugel',
        kreis: 'Kreisfläche der Mulde',
      },
      {
        koerper: 'Ein Zylinder, aus dem oben ein Kegel herausgebohrt ist',
        ganz: 'Zylinder',
        loch: 'Kegel',
        kreis: 'Grundfläche des Kegels',
      },
    ] as const);
    const kandidaten: [string, string][] = [
      ['richtig', `V(${fall.ganz}) minus V(${fall.loch})`],
      ['addiert', `V(${fall.ganz}) plus V(${fall.loch})`],
      ['flaeche-statt-volumen', `V(${fall.ganz}) minus ${fall.kreis}`],
      ['teil-vergessen', `nur V(${fall.ganz})`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([q]) => q === id));
    return {
      platzhalter: { koerper: de(fall.koerper) },
      optionen: liste.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Ergänze den Körper zum vollständigen ${fall.ganz} und ziehe ab, was fehlt.`),
        de(`Abgezogen wird ein Volumen, keine Fläche: V(${fall.ganz}) − V(${fall.loch}).`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
