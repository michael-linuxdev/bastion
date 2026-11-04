// Periodische Vorgänge und Sinusfunktion – Klasse 10 (LEHRPLAN §8f, Feld TF): Bogenmaß,
// Sinus und Kosinus am Einheitskreis, Graphen der Sinus- und Kosinusfunktion, Amplitude und
// Periode. Formeln in LaTeX für KaTeX. Exakte Werte (π/6 …) stehen nur in Auswahlen (B4).
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, kurve, linie, text, type Achsen } from '../../svg';
import { einheitskreisBild, sinCos } from './einheitskreis';

const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b));

/** Winkel in Grad als Vielfaches von π in LaTeX: 150 → \frac{5\pi}{6}, 180 → \pi. */
export function piTex(grad: number): string {
  if (grad === 0) return '0';
  const t = ggt(Math.abs(grad), 180);
  const z = grad / t;
  const n = 180 / t;
  const zaehler = `${z < 0 ? '-' : ''}${Math.abs(z) === 1 ? '' : Math.abs(z)}\\pi`;
  return n === 1 ? zaehler : `\\frac{${zaehler}}{${n}}`;
}

/** Wert auf zwei Stellen gerundet (so stehen sin 30°, 45°, 60° in den Aufgaben). */
export const zwei = (w: number) => {
  const g = Math.round(w * 100) / 100;
  return Object.is(g, -0) ? 0 : g;
};

// ---------------------------------------------------------------------------
// Bogenmaß (M.SF.TF.BOGENMASS.UMRECHNEN, Niveau G)

const WINKEL_G = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

/** „Wie viel ist 150° im Bogenmaß?“ – Auswahl mit Vielfachen von π. */
export const tfBogenmass: Generator<Record<string, never>> = {
  id: 'tf.bogenmass',
  version: 1,
  platzhalter: ['grad'],
  fehlerbildIds: ['pi-360', 'kehrwert', 'doppelt'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      const g = r.pick(WINKEL_G);
      const t = ggt(g, 180);
      const kandidaten: [string, string][] = [
        ['richtig', piTex(g)],
        // π als 360° gerechnet: nur die Hälfte
        ['pi-360', piTex(g / 2)],
        // Bruch umgedreht: 180/g · π
        ['kehrwert', g === 180 ? '' : `\\frac{${180 / t}\\pi}{${g / t}}`],
        // π als 90° gerechnet: das Doppelte
        ['doppelt', piTex(2 * g)],
      ];
      const liste = mische(
        r,
        kandidaten.filter(([, x]) => x !== ''),
      );
      if (new Set(liste.map(([, x]) => x)).size !== liste.length) continue;
      const idx = (k: string) => {
        const i = liste.findIndex(([q]) => q === k);
        return i < 0 ? undefined : auswahl(i);
      };
      const richtig = auswahl(liste.findIndex(([q]) => q === 'richtig'));
      return {
        platzhalter: { grad: g },
        optionen: liste.map(([, x]) => ({ text: de(`$${x}$`) })),
        loesung: richtig,
        loesungsweg: [
          de('Der halbe Kreis hat 180°, sein Bogen ist π lang: $180° = \\pi$.'),
          de(
            `Also $${g}° = \\frac{${g}}{180} \\cdot \\pi = ${piTex(g)}$${g === 180 ? '' : ` (gekürzt)`}.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['pi-360', idx('pi-360')],
          ['kehrwert', idx('kehrwert')],
          ['doppelt', idx('doppelt')],
        ]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Sinus und Kosinus am Einheitskreis (M.SF.TF.BOGENMASS.EINHEITSKREIS, Niveau M)

/** Bezugswinkel im 1. Quadranten zu α in Quadrant 2 bis 4 */
export function bezugswinkel(g: number): number {
  if (g < 180) return 180 - g;
  if (g < 270) return g - 180;
  return 360 - g;
}

const WINKEL_M = [120, 135, 150, 210, 225, 240, 300, 315, 330];
const WERTE_TEXT =
  'Es gilt $\\sin 30° = 0{,}5$, $\\sin 45° \\approx 0{,}71$, $\\sin 60° \\approx 0{,}87$.';

interface KreisAufgabe {
  readonly g: number;
  readonly fn: 'sin' | 'cos';
  readonly wert: number;
  readonly anderer: number;
}

function kreisAufgabe(seed: number): KreisAufgabe {
  const r = rng(seed);
  const g = r.pick(WINKEL_M);
  const fn = r.pick(['sin', 'cos'] as const);
  const sc = sinCos(g);
  const wert = zwei(fn === 'sin' ? sc.sin : sc.cos);
  const anderer = zwei(fn === 'sin' ? sc.cos : sc.sin);
  return { g, fn, wert, anderer };
}

/** „Bestimme cos 240° am Einheitskreis.“ – Zahl mit Vorzeichen. */
export const tfEinheitskreis: Generator<Record<string, never>> = {
  id: 'tf.einheitskreis',
  version: 1,
  platzhalter: ['satz', 'grad', 'funktion'],
  fehlerbildIds: ['vorzeichen', 'sin-cos'],

  erzeuge(seed) {
    const a = kreisAufgabe(seed);
    const richtig = zahl(a.wert);
    const b = bezugswinkel(a.g);
    const q = a.g < 180 ? 2 : a.g < 270 ? 3 : 4;
    const lage =
      a.fn === 'sin'
        ? `P liegt ${a.wert > 0 ? 'über' : 'unter'} der x-Achse`
        : `P liegt ${a.wert > 0 ? 'rechts' : 'links'} von der y-Achse`;
    return {
      platzhalter: {
        satz: de(`${WERTE_TEXT} Bestimme $\\${a.fn} ${a.g}°$ auf zwei Stellen.`),
        grad: a.g,
        funktion: a.fn === 'sin' ? 1 : 0,
      },
      bild: einheitskreisBild(a.g, { werte: false }),
      loesung: richtig,
      loesungsweg: [
        de(
          `$${a.g}°$ liegt im ${q}. Quadranten. Der Bezugswinkel ist $${b}°$: $\\${a.fn} ${b}° \\approx ${texZahl(Math.abs(a.wert))}$.`,
        ),
        de(`${lage}, also $\\${a.fn} ${a.g}° \\approx ${texZahl(a.wert)}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['vorzeichen', zahl(-a.wert)],
        ['sin-cos', Math.abs(a.anderer) === Math.abs(a.wert) ? undefined : zahl(a.anderer)],
      ]),
    };
  },
};

/** E: Symmetrie am Einheitskreis begründen (M.SF.TF.BOGENMASS.BEGRUENDEN) */
export const tfQuadrantAussage = aussagenGenerator(
  'tf.quadrant-aussage',
  ['vorzeichen', 'sin-cos'],
  ['alpha', 'art'],
  (r) => {
    const alpha = r.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]);
    const art = r.int(0, 3);
    const n = 180 - alpha;
    const m = 360 - alpha;
    const faelle = [
      {
        situation: `Tom sagt: „$\\sin ${n}° = \\sin ${alpha}°$.“ Stimmt das?`,
        richtig: `Ja. P bei ${n}° ist das Spiegelbild von P bei ${alpha}° an der y-Achse. Beide liegen gleich hoch, also ist der Sinus gleich.`,
        falsch: [
          [
            'vorzeichen',
            `Nein. ${n}° liegt im 2. Quadranten, dort ist der Sinus negativ: $\\sin ${n}° = -\\sin ${alpha}°$.`,
          ],
          ['sin-cos', `Nein. Richtig ist $\\sin ${n}° = \\cos ${alpha}°$.`],
        ],
        weg: [
          `Spiegelt man P an der y-Achse, bleibt die Höhe gleich, nur links und rechts tauschen.`,
          `Der Sinus ist die Höhe: $\\sin(180° - \\alpha) = \\sin \\alpha$.`,
        ],
      },
      {
        situation: `Tom sagt: „$\\cos ${n}° = \\cos ${alpha}°$.“ Stimmt das?`,
        richtig: `Nein. P bei ${n}° liegt links von der y-Achse, P bei ${alpha}° rechts. Also $\\cos ${n}° = -\\cos ${alpha}°$.`,
        falsch: [
          ['vorzeichen', `Ja. Beide Punkte liegen gleich hoch, also ist der Kosinus gleich.`],
          ['sin-cos', `Nein. Richtig ist $\\cos ${n}° = \\sin ${alpha}°$.`],
        ],
        weg: [
          `Spiegelt man P an der y-Achse, wird aus rechts links.`,
          `Der Kosinus ist die Lage rechts oder links: $\\cos(180° - \\alpha) = -\\cos \\alpha$.`,
        ],
      },
      {
        situation: `Tom sagt: „$\\cos ${m}° = \\cos ${alpha}°$.“ Stimmt das?`,
        richtig: `Ja. P bei ${m}° ist das Spiegelbild von P bei ${alpha}° an der x-Achse. Beide liegen gleich weit rechts, also ist der Kosinus gleich.`,
        falsch: [
          ['vorzeichen', `Nein. ${m}° liegt im 4. Quadranten, dort ist der Kosinus negativ.`],
          ['sin-cos', `Nein. Richtig ist $\\cos ${m}° = \\sin ${alpha}°$.`],
        ],
        weg: [
          `Spiegelt man P an der x-Achse, bleibt die Lage rechts oder links gleich, nur oben und unten tauschen.`,
          `Also $\\cos(360° - \\alpha) = \\cos \\alpha$.`,
        ],
      },
      {
        situation: `Tom sagt: „$\\sin ${m}° = \\sin ${alpha}°$.“ Stimmt das?`,
        richtig: `Nein. P bei ${m}° liegt unter der x-Achse, P bei ${alpha}° darüber. Also $\\sin ${m}° = -\\sin ${alpha}°$.`,
        falsch: [
          ['vorzeichen', `Ja. Beide Punkte liegen gleich weit rechts, also ist der Sinus gleich.`],
          ['sin-cos', `Nein. Richtig ist $\\sin ${m}° = \\cos ${alpha}°$.`],
        ],
        weg: [
          `Spiegelt man P an der x-Achse, wird aus oben unten.`,
          `Der Sinus ist die Höhe: $\\sin(360° - \\alpha) = -\\sin \\alpha$.`,
        ],
      },
    ] as const;
    const f = faelle[art] ?? faelle[0];
    return { ...f, werte: { alpha, art } };
  },
);

// ---------------------------------------------------------------------------
// Graphen von Sinus und Kosinus (M.SF.TF.SINUS)

export interface Welle {
  readonly fn: 'sin' | 'cos';
  /** f(x) = a · fn(b · x) + d */
  readonly a: number;
  readonly b: number;
  readonly d: number;
}

/**
 * Graph über eine oder mehrere Perioden; x-Achse in Vielfachen von π/2 beschriftet.
 * `bis` in Vielfachen von π (Standard 2).
 */
export function wellenBild(w: Welle, bis = 2, beschreibung?: string): Bild {
  const halbe = Math.round(bis * 2);
  const proHalbe = 44;
  const yEinheit = 30;
  const ymax = Math.max(2, Math.ceil(Math.abs(w.a) + Math.max(w.d, 0)));
  const ymin = Math.min(-2, Math.floor(-Math.abs(w.a) + Math.min(w.d, 0)));
  const rand = 30;
  const breite = 2 * rand + halbe * proHalbe + 20;
  const hoehe = 2 * rand + (ymax - ymin) * yEinheit;
  const px = (x: number) => rand + (x / (Math.PI / 2)) * proHalbe;
  const py = (y: number) => rand + (ymax - y) * yEinheit;
  const achsen: Achsen = { px, py };
  const teile: string[] = [];
  for (let y = ymin; y <= ymax; y++) {
    teile.push(linie(px(0), py(y), px((halbe * Math.PI) / 2), py(y), 0.5));
    if (y !== 0) teile.push(text(px(0) - 14, py(y) + 4, y < 0 ? `−${-y}` : String(y), 11));
  }
  for (let k = 0; k <= halbe; k++) {
    teile.push(linie(px((k * Math.PI) / 2), py(ymin), px((k * Math.PI) / 2), py(ymax), 0.5));
    if (k > 0) {
      const t = ggt(k, 2);
      const z = k / t;
      const n = 2 / t;
      const s = `${z === 1 ? '' : z}π${n === 1 ? '' : `/${n}`}`;
      teile.push(text(px((k * Math.PI) / 2), py(0) + 16, s, 11));
    }
  }
  teile.push(
    linie(px(0), py(0), px((halbe * Math.PI) / 2) + 14, py(0), 2),
    linie(px(0), py(ymin), px(0), py(ymax), 2),
    text(px((halbe * Math.PI) / 2) + 18, py(0) + 4, 'x', 12),
    text(px(0) - 12, py(0) + 16, '0', 11),
  );
  const f = (x: number) => w.a * (w.fn === 'sin' ? Math.sin(w.b * x) : Math.cos(w.b * x)) + w.d;
  teile.push(kurve(achsen, f, 0, (halbe * Math.PI) / 2, { ymin, ymax }, 240));
  // Für den Bildschirmleser: die Werte an den beschrifteten Stellen (Vielfache von π/2)
  const werte = Array.from({ length: halbe + 1 }, (_, k) => zahlText(zwei(f((k * Math.PI) / 2))));
  return bild(
    breite,
    hoehe,
    teile,
    de(
      beschreibung ??
        `Graph einer Welle von 0 bis ${bis === 1 ? 'π' : `${bis}π`}. Werte an den Stellen 0, π/2, π und so weiter: ${werte.join('; ')}.`,
    ),
  );
}

const FN_TEX = { sin: '\\sin x', cos: '\\cos x' } as const;

/** „Zu welcher Funktion gehört der Graph?“ oder „Welche Periode hat er?“ (Niveau G) */
export const tfEigenschaft: Generator<Record<string, never>> = {
  id: 'tf.eigenschaft',
  version: 1,
  platzhalter: ['frage', 'funktion', 'art'],
  fehlerbildIds: ['sin-cos', 'gespiegelt', 'nullstellen-abstand', 'bis-hochpunkt'],

  erzeuge(seed) {
    const r = rng(seed);
    const fn = r.pick(['sin', 'cos'] as const);
    const art = r.int(0, 1);
    const anders = fn === 'sin' ? 'cos' : 'sin';
    const kandidaten: [string, string][] =
      art === 0
        ? [
            ['richtig', `$y = ${FN_TEX[fn]}$`],
            ['sin-cos', `$y = ${FN_TEX[anders]}$`],
            ['gespiegelt', `$y = -${FN_TEX[fn]}$`],
          ]
        : [
            ['richtig', '$2\\pi$'],
            ['nullstellen-abstand', '$\\pi$'],
            ['bis-hochpunkt', '$\\frac{\\pi}{2}$'],
          ];
    const liste = mische(r, kandidaten);
    const idx = (k: string) => {
      const i = liste.findIndex(([q]) => q === k);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(liste.findIndex(([q]) => q === 'richtig'));
    const start = fn === 'sin' ? 'bei 0 und steigt' : 'beim höchsten Wert 1';
    return {
      platzhalter: {
        frage: de(
          art === 0
            ? 'Zu welcher Funktion gehört der Graph?'
            : `Der Graph gehört zu $y = ${FN_TEX[fn]}$. Wie groß ist die [[Periode]]?`,
        ),
        funktion: fn === 'sin' ? 1 : 0,
        art,
      },
      bild: wellenBild({ fn, a: 1, b: 1, d: 0 }, 2),
      optionen: liste.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg:
        art === 0
          ? [
              de(`Bei $x = 0$ beginnt der Graph ${start}.`),
              de(
                fn === 'sin'
                  ? 'Das passt zu $\\sin 0 = 0$: Es ist $y = \\sin x$.'
                  : 'Das passt zu $\\cos 0 = 1$: Es ist $y = \\cos x$.',
              ),
            ]
          : [
              de('Die Periode ist die Länge, nach der sich der Graph genau wiederholt.'),
              de(
                'Von einem Hochpunkt zum nächsten sind es $2\\pi$. Zwischen zwei Nullstellen liegt nur eine halbe Welle.',
              ),
            ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['sin-cos', idx('sin-cos')],
        ['gespiegelt', idx('gespiegelt')],
        ['nullstellen-abstand', idx('nullstellen-abstand')],
        ['bis-hochpunkt', idx('bis-hochpunkt')],
      ]),
    };
  },
};

/** Besondere Stellen in [0; 2π] als Menge von Vielfachen von π/2 */
type Stellen = readonly number[];
export const STELLEN: Readonly<
  Record<'sin' | 'cos', Readonly<Record<'null' | 'hoch' | 'tief', Stellen>>>
> = {
  sin: { null: [0, 2, 4], hoch: [1], tief: [3] },
  cos: { null: [1, 3], hoch: [0, 4], tief: [2] },
};

const stelleTex = (k: number) => piTex(k * 90);
const mengeTex = (s: Stellen) => s.map(stelleTex).join(';\\ ');

/** „Wo hat y = cos x in [0; 2π] Nullstellen?“ (Niveau M) */
export const tfNullstellen: Generator<Record<string, never>> = {
  id: 'tf.nullstellen',
  version: 1,
  platzhalter: ['frage', 'funktion', 'art'],
  fehlerbildIds: ['sin-cos', 'stellen'],

  erzeuge(seed) {
    const r = rng(seed);
    const fn = r.pick(['sin', 'cos'] as const);
    const art = r.pick(['null', 'hoch', 'tief'] as const);
    const anders = fn === 'sin' ? 'cos' : 'sin';
    // verwechselte Stellen: Hoch- statt Tiefstellen und umgekehrt, Hoch- statt Nullstellen
    const verwechselt = STELLEN[fn][art === 'hoch' ? 'tief' : 'hoch'];
    const liste = mische(r, [
      ['richtig', mengeTex(STELLEN[fn][art])],
      ['sin-cos', mengeTex(STELLEN[anders][art])],
      ['stellen', mengeTex(verwechselt)],
    ] as const);
    const idx = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
    const was =
      art === 'null'
        ? 'alle [[Nullstellen]]'
        : art === 'hoch'
          ? 'alle Stellen mit dem größten Wert 1'
          : 'alle Stellen mit dem kleinsten Wert −1';
    return {
      platzhalter: {
        frage: de(`Gib ${was} von $y = \\${fn} x$ mit $0 \\leq x \\leq 2\\pi$ an.`),
        funktion: fn === 'sin' ? 1 : 0,
        art: ['null', 'hoch', 'tief'].indexOf(art),
      },
      optionen: liste.map(([, t]) => ({ text: de(`$x = ${t}$`) })),
      loesung: idx('richtig'),
      loesungsweg: [
        de(
          `Am Einheitskreis ist $\\${fn} x$ ${fn === 'sin' ? 'die Höhe' : 'die Lage rechts oder links'} von P.`,
        ),
        de(
          `Sie ist ${art === 'null' ? '0' : art === 'hoch' ? '1' : '−1'} bei $x = ${mengeTex(STELLEN[fn][art])}$.`,
        ),
      ],
      fehlerbilder: [
        { id: 'sin-cos', antwort: idx('sin-cos') },
        { id: 'stellen', antwort: idx('stellen') },
      ],
    };
  },
};

/** E: Periodizität und Symmetrie (M.SF.TF.SINUS.BEGRUENDEN) */
export const tfPeriodeAussage = aussagenGenerator(
  'tf.periode-aussage',
  ['nullstellen-abstand', 'symmetrie'],
  ['art'],
  (r) => {
    const art = r.int(0, 3);
    const faelle = [
      {
        situation: 'Mia sagt: „Für jedes x gilt $\\sin(x + 2\\pi) = \\sin x$.“ Stimmt das?',
        richtig:
          'Ja. Eine volle Umdrehung um $2\\pi$ bringt P an dieselbe Stelle des Einheitskreises. Die Periode ist $2\\pi$.',
        falsch: [
          [
            'nullstellen-abstand',
            'Nein. Der Sinus wiederholt sich schon nach $\\pi$, nach $2\\pi$ ist das Vorzeichen anders.',
          ],
          ['symmetrie', 'Nein. Es gilt $\\sin(x + 2\\pi) = -\\sin x$.'],
        ],
        weg: [
          'Nach $2\\pi$ hat P einmal den ganzen Kreis durchlaufen.',
          'Also wiederholt sich jeder Wert.',
        ],
      },
      {
        situation: 'Mia sagt: „Für jedes x gilt $\\sin(x + \\pi) = \\sin x$.“ Stimmt das?',
        richtig:
          'Nein. Bei $x = \\frac{\\pi}{2}$ ist $\\sin x = 1$, aber $\\sin(x + \\pi) = \\sin \\frac{3\\pi}{2} = -1$. Die Periode ist $2\\pi$.',
        falsch: [
          [
            'nullstellen-abstand',
            'Ja. Die Nullstellen liegen im Abstand $\\pi$, also ist $\\pi$ die Periode.',
          ],
          ['symmetrie', 'Ja. Der Sinus ist symmetrisch, darum ist es egal, ob man $\\pi$ addiert.'],
        ],
        weg: [
          'Ein Gegenbeispiel genügt: $\\sin \\frac{\\pi}{2} = 1$, $\\sin \\frac{3\\pi}{2} = -1$.',
          'Nach $\\pi$ ist nur eine halbe Welle vorbei.',
        ],
      },
      {
        situation: 'Mia sagt: „Für jedes x gilt $\\sin(-x) = \\sin x$.“ Stimmt das?',
        richtig:
          'Nein. Bei $-x$ liegt P gespiegelt an der x-Achse, also unten statt oben: $\\sin(-x) = -\\sin x$. Der Graph ist punktsymmetrisch zum Ursprung.',
        falsch: [
          ['symmetrie', 'Ja. Der Graph des Sinus ist achsensymmetrisch zur y-Achse.'],
          [
            'nullstellen-abstand',
            'Ja. Der Sinus wiederholt sich nach $\\pi$, und $-x$ ist nur eine Verschiebung.',
          ],
        ],
        weg: [
          'Gegenbeispiel: $\\sin \\frac{\\pi}{2} = 1$, aber $\\sin(-\\frac{\\pi}{2}) = -1$.',
          'Sinus: punktsymmetrisch zum Ursprung. Kosinus: achsensymmetrisch zur y-Achse.',
        ],
      },
      {
        situation: 'Mia sagt: „Für jedes x gilt $\\cos(-x) = \\cos x$.“ Stimmt das?',
        richtig:
          'Ja. Bei $-x$ liegt P gespiegelt an der x-Achse. Die Lage rechts oder links bleibt gleich. Der Graph ist achsensymmetrisch zur y-Achse.',
        falsch: [
          ['symmetrie', 'Nein. Es gilt $\\cos(-x) = -\\cos x$, wie beim Sinus.'],
          [
            'nullstellen-abstand',
            'Nein. Das gilt nur, wenn man noch $\\pi$ addiert: $\\cos(-x + \\pi) = \\cos x$.',
          ],
        ],
        weg: [
          'Spiegeln an der x-Achse ändert nur oben und unten.',
          'Der Kosinus ist die Lage rechts oder links: $\\cos(-x) = \\cos x$.',
        ],
      },
    ] as const;
    const f = faelle[art] ?? faelle[0];
    return { ...f, werte: { art } };
  },
);

// ---------------------------------------------------------------------------
// Parameter: Amplitude und Periode (M.SF.TF.PARAMETER)

/** „Wie groß ist die Amplitude?“ aus dem Graphen (Niveau G) */
export const tfAmplitude: Generator<Record<string, never>> = {
  id: 'tf.amplitude',
  version: 1,
  platzhalter: ['groesster', 'kleinster'],
  fehlerbildIds: ['max-min'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.pick([0.5, 1.5, 2, 3, 4]);
    const fn = r.pick(['sin', 'cos'] as const);
    // ohne Verschiebung d: die Oberschule hat nur a und b (LEHRPLAN §8f)
    const max = a;
    const min = -a;
    const richtig = zahl(a);
    return {
      platzhalter: { groesster: max, kleinster: min },
      bild: wellenBild({ fn, a, b: 1, d: 0 }, 2),
      loesung: richtig,
      loesungsweg: [
        de(`Größter Wert ${zahlText(max)}, kleinster Wert ${zahlText(min)}.`),
        de(
          `Die [[Amplitude]] ist der halbe Abstand: $\\frac{${texZahl(max)} - (${texZahl(min)})}{2} = ${texZahl(a)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['max-min', zahl(2 * a)]]),
    };
  },
};

export interface PeriodeParameter {
  /** auch umgekehrt: aus der Periode b bestimmen */
  readonly umgekehrt: boolean;
}

const B_WERTE = [2, 3, 4, 5, 6, 0.5];

/** „Welche Periode hat y = sin(3x)? Gib sie in Grad an.“ (Niveau M) */
export const tfPeriode: Generator<PeriodeParameter> = {
  id: 'tf.periode',
  version: 1,
  platzhalter: ['satz', 'b', 'periode'],
  fehlerbildIds: ['periode-b', 'periode-mal'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.pick(B_WERTE);
    const periode = 360 / b;
    const fn = r.pick(['sin', 'cos'] as const);
    const um = p.umgekehrt && r.int(0, 1) === 1;
    const bTex = texZahl(b);
    const richtig = zahl(um ? b : periode);
    return {
      platzhalter: {
        satz: de(
          um
            ? `Der Graph von $y = \\${fn}(b \\cdot x)$ hat die [[Periode]] $${texZahl(periode)}°$. Bestimme b.`
            : `Welche [[Periode]] hat $y = \\${fn}(${bTex}x)$? Gib sie in Grad an.`,
        ),
        b,
        periode,
      },
      loesung: richtig,
      loesungsweg: um
        ? [
            de('Die Periode ist $\\frac{360°}{b}$, also $b = \\frac{360°}{\\text{Periode}}$.'),
            de(`$b = \\frac{360}{${texZahl(periode)}} = ${bTex}$.`),
          ]
        : [
            de(
              `Bei $${bTex}x$ läuft der Winkel ${b > 1 ? `${zahlText(b)}-mal so schnell` : 'halb so schnell'}. Eine volle Welle ist fertig, wenn $${bTex}x = 360°$.`,
            ),
            de(`[[Periode]] $= \\frac{360°}{${bTex}} = ${texZahl(periode)}°$.`),
          ],
      fehlerbilder: fehlerbilderAus(
        richtig,
        um
          ? [
              ['periode-b', zahl(periode)],
              ['periode-mal', zahl(periode / 360)],
            ]
          : [
              ['periode-b', zahl(b)],
              ['periode-mal', zahl(360 * b)],
            ],
      ),
    };
  },
};

/** E: „Die Periode von y = sin(bx) ist b“ (M.SF.TF.PARAMETER.BEGRUENDEN) */
export const tfPeriodeBAussage = aussagenGenerator(
  'tf.periode-b-aussage',
  ['periode-b', 'periode-mal'],
  ['b'],
  (r: Rng) => {
    const b = r.pick([2, 3, 4, 6]);
    return {
      situation: `Lea sagt: „$y = \\sin(${b}x)$ hat die [[Periode]] ${b}.“ Stimmt das?`,
      werte: { b },
      richtig: `Nein. $${b}x$ erreicht $2\\pi$ schon bei $x = \\frac{2\\pi}{${b}}$. Die Periode ist $\\frac{2\\pi}{${b}}$, der Graph ist ${b}-mal so eng.`,
      falsch: [
        ['periode-b', 'Ja. Die Zahl vor dem x gibt die Periode an.'],
        [
          'periode-mal',
          `Nein. Die Periode ist $${b} \\cdot 2\\pi$, der Graph wird ${b}-mal so breit.`,
        ],
      ],
      weg: [
        `Eine volle Welle ist fertig, wenn $${b}x = 2\\pi$, also bei $x = \\frac{2\\pi}{${b}}$.`,
        `In Grad: $\\frac{360°}{${b}} = ${360 / b}°$.`,
      ],
    };
  },
);
