// Allgemeine Dreiecke – Klasse 10 (LEHRPLAN §8f, Feld AD): Sinussatz, Kosinussatz,
// Flächeninhalt mit ½·a·b·sin γ, Vermessung und Körper. Längen auf eine Stelle nach dem
// Komma gerundet (B3), Winkel ebenso. Formeln in LaTeX für KaTeX.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { de, zahl } from '../../hilfen';
import { allgemeinesDreieck } from './skizze';

export const rad = (g: number) => (g * Math.PI) / 180;
export const grad = (r: number) => (r * 180) / Math.PI;
/** auf eine Stelle nach dem Komma */
export const r1 = (x: number) => Math.round(x * 10) / 10;
export const r2 = (x: number) => Math.round(x * 100) / 100;
const sin = (g: number) => Math.sin(rad(g));
const cos = (g: number) => Math.cos(rad(g));
const t1 = (x: number) => texZahl(r1(x));

/** Gerundete Lösung mit Hinweis „anders gerundet“; ganze Zahlen ohne Rundung. */
function gerundet(genau: number, stellen = 1) {
  const f = 10 ** stellen;
  const wert = Math.round(genau * f) / f;
  return {
    loesung: zahl(wert),
    ...(Math.abs(wert - genau) < 1e-9 ? {} : { runden: { stellen, genau } }),
  };
}

/** Taschenrechner auf RAD: Winkel in Grad als Bogenmaß eingegeben */
const sinRad = (g: number) => Math.sin(g);

/** Fehlerbild-Wert nur, wenn er eine sinnvolle positive Länge oder ein Winkel ist */
const sinnvoll = (x: number) => (Number.isFinite(x) && x > 0 && x < 1000 ? zahl(r1(x)) : undefined);
/** wie `sinnvoll`, aber nur, wenn der Wert nicht als „anders gerundet“ durchginge */
const deutlich = (x: number, genau: number) =>
  Math.abs(x - genau) > 0.15 ? sinnvoll(x) : undefined;

// ---------------------------------------------------------------------------
// Sinussatz (M.RF.AD.SINUSSATZ)

interface Wsw {
  readonly alpha: number;
  readonly beta: number;
  readonly b: number;
}

function wsw(r: Rng): Wsw {
  for (;;) {
    const alpha = r.int(25, 110);
    const beta = r.int(25, 110);
    const gamma = 180 - alpha - beta;
    if (gamma < 20 || alpha === beta) continue;
    return { alpha, beta, b: r.int(4, 15) };
  }
}

/** „Berechne a mit dem Sinussatz.“ – gegeben α, β und b (Niveau G) */
export const adSinussatzSeite: Generator<Record<string, never>> = {
  id: 'ad.sinussatz-seite',
  version: 1,
  platzhalter: ['alpha', 'beta', 'b'],
  fehlerbildIds: ['paar', 'bogenmass'],

  erzeuge(seed) {
    const d = wsw(rng(seed));
    const genau = (d.b * sin(d.alpha)) / sin(d.beta);
    const { loesung, ...rund } = gerundet(genau);
    return {
      platzhalter: { alpha: d.alpha, beta: d.beta, b: d.b },
      bild: allgemeinesDreieck(
        { alpha: d.alpha, beta: d.beta },
        { a: 'a = ?', b: `b = ${d.b} cm` },
        { α: `α = ${d.alpha}°`, β: `β = ${d.beta}°` },
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `Sinussatz mit den Paaren a, α und b, β: $\\frac{a}{\\sin \\alpha} = \\frac{b}{\\sin \\beta}$.`,
        ),
        de(
          `$a = \\frac{${d.b} \\cdot \\sin ${d.alpha}°}{\\sin ${d.beta}°} \\approx ${t1(genau)}$ cm.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['paar', sinnvoll((d.b * sin(d.beta)) / sin(d.alpha))],
        ['bogenmass', sinnvoll((d.b * sinRad(d.alpha)) / sinRad(d.beta))],
      ]),
    };
  },
};

interface Ssw {
  readonly a: number;
  readonly b: number;
  readonly alpha: number;
}

function ssw(r: Rng): Ssw {
  for (;;) {
    const a = r.int(6, 15);
    const b = r.int(3, a - 1);
    const alpha = r.int(25, 80);
    const s = (b * sin(alpha)) / a;
    if (s > 0.95 || b / a < 0.5) continue;
    return { a, b, alpha };
  }
}

/** „Berechne β.“ – gegeben a, b und α mit a > b (Niveau M) */
export const adSinussatzWinkel: Generator<Record<string, never>> = {
  id: 'ad.sinussatz-winkel',
  version: 1,
  platzhalter: ['a', 'b', 'alpha'],
  fehlerbildIds: ['paar', 'bogenmass'],

  erzeuge(seed) {
    const d = ssw(rng(seed));
    const sb = (d.b * sin(d.alpha)) / d.a;
    const genau = grad(Math.asin(sb));
    const { loesung, ...rund } = gerundet(genau);
    const falschPaar = (d.a * sin(d.alpha)) / d.b;
    return {
      platzhalter: { a: d.a, b: d.b, alpha: d.alpha },
      bild: allgemeinesDreieck(
        { alpha: d.alpha, beta: genau },
        { a: `a = ${d.a} cm`, b: `b = ${d.b} cm` },
        { α: `α = ${d.alpha}°`, β: 'β = ?' },
        false,
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `$\\sin \\beta = \\frac{b \\cdot \\sin \\alpha}{a} = \\frac{${d.b} \\cdot \\sin ${d.alpha}°}{${d.a}} \\approx ${texZahl(Math.round(sb * 1000) / 1000)}$.`,
        ),
        de(
          `$\\beta \\approx ${t1(genau)}°$. Weil $b < a$, ist β kleiner als α: Es gibt nur diese Lösung.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['paar', falschPaar <= 1 ? sinnvoll(grad(Math.asin(falschPaar))) : undefined],
        ['bogenmass', sinnvoll(Math.asin(sb))],
      ]),
    };
  },
};

/** E: zwei mögliche Dreiecke im Fall SsW (M.RF.AD.SINUSSATZ.BEGRUENDEN) */
export const adSswAussage = aussagenGenerator(
  'ad.ssw-aussage',
  ['ssw-zwei', 'paar'],
  ['alpha', 'beta1'],
  (r) => {
    const beta1 = r.pick([30, 40, 45, 50, 60]);
    const zwei = r.int(0, 1) === 1;
    // zwei Lösungen, wenn auch 180° − β₁ neben α Platz hat
    const alpha = zwei ? r.int(10, 170 - (180 - beta1) - 1) : r.int(180 - (180 - beta1), 100);
    const beta2 = 180 - beta1;
    const s = texZahl(Math.round(sin(beta1) * 100) / 100);
    const situation = `In einem Dreieck ist $\\alpha = ${alpha}°$. Lea berechnet mit dem Sinussatz $\\sin \\beta \\approx ${s}$ und sagt: „Also ist $\\beta = ${beta1}°$, eine andere Lösung gibt es nicht.“ Stimmt das?`;
    return zwei
      ? {
          situation,
          werte: { alpha, beta1 },
          richtig: `Nein. Auch $\\sin ${beta2}° \\approx ${s}$, und $${alpha}° + ${beta2}° < 180°$. Es gibt zwei Dreiecke.`,
          falsch: [
            ['ssw-zwei', 'Ja. Der Taschenrechner zeigt nur einen Winkel, also gibt es nur einen.'],
            ['paar', `Nein. Richtig ist $\\beta = ${alpha}°$, denn β liegt α gegenüber.`],
          ],
          weg: [
            `$\\sin(180° - \\beta) = \\sin \\beta$: Zu $\\sin \\beta \\approx ${s}$ passen ${beta1}° und ${beta2}°.`,
            `Prüfe die Winkelsumme: $${alpha}° + ${beta2}° = ${alpha + beta2}° < 180°$. Beide Dreiecke gibt es.`,
          ],
        }
      : {
          situation,
          werte: { alpha, beta1 },
          richtig: `Ja. Auch $\\sin ${beta2}°$ passt, aber $${alpha}° + ${beta2}° \\geq 180°$. Dieses Dreieck gibt es nicht.`,
          falsch: [
            ['ssw-zwei', `Nein. Es gibt immer zwei Lösungen: ${beta1}° und ${beta2}°.`],
            ['paar', `Nein. Richtig ist $\\beta = ${alpha}°$, denn β liegt α gegenüber.`],
          ],
          weg: [
            `Zu $\\sin \\beta \\approx ${s}$ passen ${beta1}° und ${beta2}°.`,
            `Aber $${alpha}° + ${beta2}° = ${alpha + beta2}° \\geq 180°$: Die zweite Lösung fällt weg.`,
          ],
        };
  },
);

// ---------------------------------------------------------------------------
// Kosinussatz (M.RF.AD.KOSINUSSATZ)

interface Sws {
  readonly b: number;
  readonly c: number;
  readonly alpha: number;
}

function sws(seed: number): Sws {
  const r = rng(seed);
  for (;;) {
    const b = r.int(3, 12);
    const c = r.int(3, 12);
    const alpha = r.pick([35, 40, 50, 55, 65, 70, 75, 80, 100, 110, 115, 125, 130]);
    if (b === c) continue;
    return { b, c, alpha };
  }
}

const quadrat = (d: Sws) => d.b ** 2 + d.c ** 2 - 2 * d.b * d.c * cos(d.alpha);

/** „Berechne a.“ – gegeben b, c und α (SWS, Niveau G, mit Zwischenschritten) */
export const adKosinussatzSeite: Generator<Record<string, never>> = {
  id: 'ad.kosinussatz-seite',
  version: 1,
  platzhalter: ['b', 'c', 'alpha'],
  fehlerbildIds: ['vorzeichen', 'pythagoras', 'wurzel-vergessen'],
  schritte: [
    { id: 'quadrat', fehlerbildIds: ['vorzeichen', 'pythagoras'] },
    { id: 'seite', fehlerbildIds: ['wurzel-vergessen'] },
  ],

  erzeuge(seed) {
    const d = sws(seed);
    const a2 = quadrat(d);
    const genau = Math.sqrt(a2);
    const { loesung, ...rund } = gerundet(genau);
    const plus = d.b ** 2 + d.c ** 2 + 2 * d.b * d.c * cos(d.alpha);
    return {
      platzhalter: { b: d.b, c: d.c, alpha: d.alpha },
      bild: allgemeinesDreieck(
        { alpha: d.alpha, beta: grad(Math.asin((d.b * sin(d.alpha)) / genau)) },
        { a: 'a = ?', b: `b = ${d.b} cm`, c: `c = ${d.c} cm` },
        { α: `α = ${d.alpha}°` },
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `Kosinussatz: $a^2 = b^2 + c^2 - 2bc \\cdot \\cos \\alpha = ${d.b}^2 + ${d.c}^2 - 2 \\cdot ${d.b} \\cdot ${d.c} \\cdot \\cos ${d.alpha}° \\approx ${texZahl(r2(a2))}$.`,
        ),
        de(`$a = \\sqrt{${texZahl(r2(a2))}} \\approx ${t1(genau)}$ cm.`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['vorzeichen', sinnvoll(Math.sqrt(plus))],
        ['pythagoras', sinnvoll(Math.sqrt(d.b ** 2 + d.c ** 2))],
        ['wurzel-vergessen', sinnvoll(a2)],
      ]),
    };
  },

  schritt(seed, _p, id) {
    const d = sws(seed);
    const a2 = quadrat(d);
    if (id === 'quadrat') {
      const loesung = zahl(r1(a2));
      return {
        loesung,
        // Zwischenwerte darf man anders runden
        auchRichtig: (e) => e.typ === 'zahl' && Math.abs(e.wert - a2) <= 0.1,
        fehlerbilder: fehlerbilderAus(loesung, [
          ['vorzeichen', zahl(r1(d.b ** 2 + d.c ** 2 + 2 * d.b * d.c * cos(d.alpha)))],
          ['pythagoras', zahl(d.b ** 2 + d.c ** 2)],
        ]),
      };
    }
    const loesung = zahl(r1(Math.sqrt(a2)));
    return {
      platzhalter: { quadrat: r1(a2) },
      loesung,
      auchRichtig: (e) => e.typ === 'zahl' && Math.abs(e.wert - Math.sqrt(a2)) <= 0.06,
      fehlerbilder: fehlerbilderAus(loesung, [['wurzel-vergessen', zahl(r1(a2))]]),
    };
  },
};

interface Sss {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

function sss(r: Rng): Sss {
  for (;;) {
    const a = r.int(3, 12);
    const b = r.int(3, 12);
    const c = r.int(3, 12);
    if (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1) continue;
    if (a === b && b === c) continue;
    // γ nicht genau 90° (dann wäre es Pythagoras)
    if (a * a + b * b === c * c) continue;
    return { a, b, c };
  }
}

/** „Berechne γ.“ – gegeben a, b und c (SSS, Niveau M) */
export const adKosinussatzWinkel: Generator<Record<string, never>> = {
  id: 'ad.kosinussatz-winkel',
  version: 1,
  platzhalter: ['a', 'b', 'c'],
  fehlerbildIds: ['vorzeichen', 'bogenmass'],

  erzeuge(seed) {
    const d = sss(rng(seed));
    const k = (d.a ** 2 + d.b ** 2 - d.c ** 2) / (2 * d.a * d.b);
    const genau = grad(Math.acos(k));
    const { loesung, ...rund } = gerundet(genau);
    const alpha = grad(Math.acos((d.b ** 2 + d.c ** 2 - d.a ** 2) / (2 * d.b * d.c)));
    const beta = 180 - alpha - genau;
    return {
      platzhalter: { a: d.a, b: d.b, c: d.c },
      bild: allgemeinesDreieck(
        { alpha, beta },
        { a: `a = ${d.a} cm`, b: `b = ${d.b} cm`, c: `c = ${d.c} cm` },
        { γ: 'γ = ?' },
        false,
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `Kosinussatz nach $\\cos \\gamma$ umgestellt: $\\cos \\gamma = \\frac{a^2 + b^2 - c^2}{2ab} = \\frac{${d.a ** 2} + ${d.b ** 2} - ${d.c ** 2}}{${2 * d.a * d.b}} \\approx ${texZahl(Math.round(k * 1000) / 1000)}$.`,
        ),
        de(`$\\gamma \\approx ${t1(genau)}°$.`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['vorzeichen', sinnvoll(grad(Math.acos(-k)))],
        ['bogenmass', sinnvoll(Math.acos(k))],
      ]),
    };
  },
};

/** E: Pythagoras als Sonderfall (M.RF.AD.KOSINUSSATZ.BEGRUENDEN) */
export const adPythagorasAussage = aussagenGenerator(
  'ad.pythagoras-aussage',
  ['satz-wahl', 'vorzeichen'],
  ['a', 'b'],
  (r) => {
    const [a, b] = r.pick([
      [3, 4],
      [5, 12],
      [6, 8],
      [8, 15],
      [9, 12],
    ] as const);
    const c = Math.sqrt(a * a + b * b);
    return {
      situation: `In einem Dreieck ist $a = ${a}$ cm, $b = ${b}$ cm und $\\gamma = 90°$. Tom rechnet mit dem Kosinussatz und sagt: „Das ist dasselbe wie der Satz des Pythagoras.“ Stimmt das?`,
      werte: { a, b },
      richtig: `Ja. Weil $\\cos 90° = 0$, fällt $-2ab \\cdot \\cos \\gamma$ weg: $c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$, also $c = ${c}$ cm.`,
      falsch: [
        [
          'satz-wahl',
          'Nein. Der Kosinussatz gilt nur in Dreiecken ohne rechten Winkel, er gibt hier etwas Falsches.',
        ],
        [
          'vorzeichen',
          'Nein. Bei 90° ist der Kosinus negativ, darum wird c größer als beim Satz des Pythagoras.',
        ],
      ],
      weg: [
        `$c^2 = a^2 + b^2 - 2ab \\cdot \\cos 90° = a^2 + b^2 - 0$.`,
        'Der Satz des Pythagoras ist der Kosinussatz für $\\gamma = 90°$.',
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Flächeninhalt (M.GM.AD.FLAECHE)

/** „Berechne den Flächeninhalt.“ – gegeben a, b und γ (Niveau G) */
export const adFlaeche: Generator<Record<string, never>> = {
  id: 'ad.flaeche',
  version: 1,
  platzhalter: ['a', 'b', 'gamma'],
  fehlerbildIds: ['nicht-halbiert'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.int(3, 14);
    const b = r.int(3, 14);
    const gamma = r.pick([30, 40, 45, 50, 60, 70, 80, 100, 110, 120, 135, 150]);
    const genau = 0.5 * a * b * sin(gamma);
    const { loesung, ...rund } = gerundet(genau);
    // α aus dem Kosinussatz für die Skizze
    const c = Math.sqrt(a * a + b * b - 2 * a * b * cos(gamma));
    const alpha = grad(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    return {
      platzhalter: { a, b, gamma },
      bild: allgemeinesDreieck(
        { alpha, beta: 180 - alpha - gamma },
        { a: `a = ${a} cm`, b: `b = ${b} cm` },
        { γ: `γ = ${gamma}°` },
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(
          '$A = \\frac{1}{2} \\cdot a \\cdot b \\cdot \\sin \\gamma$ mit dem Winkel zwischen a und b.',
        ),
        de(
          `$A = \\frac{1}{2} \\cdot ${a} \\cdot ${b} \\cdot \\sin ${gamma}° \\approx ${t1(genau)}$ cm².`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [['nicht-halbiert', sinnvoll(a * b * sin(gamma))]]),
    };
  },
};

interface Viereck {
  readonly a: number;
  readonly d: number;
  readonly alpha: number;
  readonly b: number;
  readonly c: number;
  readonly gamma: number;
}

function viereck(seed: number): Viereck {
  const r = rng(seed);
  const winkel = [50, 60, 70, 75, 80, 90, 100, 110, 120];
  return {
    a: r.int(4, 12),
    d: r.int(4, 12),
    alpha: r.pick(winkel),
    b: r.int(4, 12),
    c: r.int(4, 12),
    gamma: r.pick(winkel),
  };
}

const teil = (x: number, y: number, w: number) => 0.5 * x * y * sin(w);

/** „Viereck ABCD aus zwei Dreiecken: Berechne den Flächeninhalt.“ (Niveau M, Zwischenschritte) */
export const adFlaecheVieleck: Generator<Record<string, never>> = {
  id: 'ad.flaeche-vieleck',
  version: 1,
  platzhalter: ['a', 'd', 'alpha', 'b', 'c', 'gamma'],
  fehlerbildIds: ['nicht-halbiert'],
  schritte: [
    { id: 'erstes', fehlerbildIds: ['nicht-halbiert'] },
    { id: 'zweites', fehlerbildIds: ['nicht-halbiert'] },
    { id: 'summe', fehlerbildIds: [], platzhalter: ['eins', 'zwei'] },
  ],

  erzeuge(seed) {
    const v = viereck(seed);
    const a1 = teil(v.a, v.d, v.alpha);
    const a2 = teil(v.b, v.c, v.gamma);
    const { loesung, ...rund } = gerundet(a1 + a2);
    return {
      platzhalter: { ...v },
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `Dreieck ABD: $\\frac{1}{2} \\cdot ${v.a} \\cdot ${v.d} \\cdot \\sin ${v.alpha}° \\approx ${t1(a1)}$ cm².`,
        ),
        de(
          `Dreieck CDB: $\\frac{1}{2} \\cdot ${v.b} \\cdot ${v.c} \\cdot \\sin ${v.gamma}° \\approx ${t1(a2)}$ cm².`,
        ),
        de(`Zusammen etwa $${t1(a1 + a2)}$ cm².`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [['nicht-halbiert', sinnvoll(2 * (a1 + a2))]]),
    };
  },

  schritt(seed, _p, id, bisher) {
    const v = viereck(seed);
    const a1 = teil(v.a, v.d, v.alpha);
    const a2 = teil(v.b, v.c, v.gamma);
    const nah = (w: number) => (e: { typ: string; wert?: unknown }) =>
      e.typ === 'zahl' && typeof e.wert === 'number' && Math.abs(e.wert - w) <= 0.06;
    if (id === 'erstes') {
      const loesung = zahl(r1(a1));
      return {
        loesung,
        auchRichtig: nah(a1),
        fehlerbilder: fehlerbilderAus(loesung, [['nicht-halbiert', zahl(r1(2 * a1))]]),
      };
    }
    if (id === 'zweites') {
      const loesung = zahl(r1(a2));
      return {
        loesung,
        auchRichtig: nah(a2),
        fehlerbilder: fehlerbilderAus(loesung, [['nicht-halbiert', zahl(r1(2 * a2))]]),
      };
    }
    // Summe aus den eigenen Zwischenergebnissen
    const e1 = bisher.erstes;
    const e2 = bisher.zweites;
    const w1 = e1?.typ === 'zahl' ? e1.wert : r1(a1);
    const w2 = e2?.typ === 'zahl' ? e2.wert : r1(a2);
    // Musterlösung wie das Endergebnis; die Summe der eigenen gerundeten Teile gilt auch
    const loesung = zahl(r1(a1 + a2));
    const eigene = r1(w1 + w2);
    return {
      platzhalter: { eins: w1, zwei: w2 },
      loesung,
      auchRichtig: (e) =>
        e.typ === 'zahl' && (Math.abs(e.wert - (a1 + a2)) <= 0.11 || e.wert === eigene),
      fehlerbilder: [],
    };
  },
};

/** E: Herleitung von A = ½·a·b·sin γ (M.GM.AD.FLAECHE.BEGRUENDEN) */
export const adFlaecheAussage = aussagenGenerator(
  'ad.flaeche-aussage',
  ['nicht-halbiert', 'paar'],
  ['a', 'b', 'gamma'],
  (r) => {
    const a = r.int(4, 12);
    const b = r.int(4, 12);
    const gamma = r.pick([30, 40, 50, 60, 70]);
    return {
      situation: `Ein Dreieck hat $a = ${a}$ cm, $b = ${b}$ cm und den Winkel $\\gamma = ${gamma}°$ zwischen a und b. Die Höhe $h_a$ steht senkrecht auf a. Welche Herleitung der Flächenformel stimmt?`,
      werte: { a, b, gamma },
      richtig: `Im rechtwinkligen Teildreieck ist $h_a$ die Gegenkathete von γ und b die Hypotenuse: $h_a = b \\cdot \\sin \\gamma$. Also $A = \\frac{1}{2} \\cdot a \\cdot h_a = \\frac{1}{2} \\cdot a \\cdot b \\cdot \\sin \\gamma$.`,
      falsch: [
        [
          'nicht-halbiert',
          `$h_a = b \\cdot \\sin \\gamma$, also $A = a \\cdot h_a = a \\cdot b \\cdot \\sin \\gamma$.`,
        ],
        [
          'paar',
          `$h_a = a \\cdot \\sin \\gamma$, also $A = \\frac{1}{2} \\cdot a \\cdot a \\cdot \\sin \\gamma$.`,
        ],
      ],
      weg: [
        'Die Höhe teilt das Dreieck in zwei rechtwinklige Dreiecke.',
        'Im Teildreieck mit γ: $\\sin \\gamma = \\frac{h_a}{b}$, also $h_a = b \\cdot \\sin \\gamma$. Dann $A = \\frac{1}{2} \\cdot a \\cdot h_a$.',
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Sachaufgaben (M.RF.AD.SACH)

interface Fluss {
  readonly s: number;
  readonly alpha: number;
  readonly beta: number;
}

function fluss(seed: number): Fluss {
  const r = rng(seed);
  for (;;) {
    const alpha = r.int(40, 85);
    const beta = r.int(40, 85);
    if (alpha === beta) continue;
    return { s: r.pick([40, 50, 60, 80, 100, 120, 150]), alpha, beta };
  }
}

/**
 * Flussbreite: Standlinie AB = s am Ufer, Baum C am anderen Ufer, Winkel α bei A und β bei B.
 * Gesucht AC (Niveau G, Zwischenschritte).
 */
export const adVermessung: Generator<Record<string, never>> = {
  id: 'ad.vermessung',
  version: 1,
  platzhalter: ['s', 'alpha', 'beta'],
  fehlerbildIds: ['paar', 'rechtwinklig'],
  schritte: [
    { id: 'gamma', fehlerbildIds: [] },
    { id: 'seite', fehlerbildIds: ['paar', 'rechtwinklig'], platzhalter: ['gamma'] },
  ],

  erzeuge(seed) {
    const f = fluss(seed);
    const gamma = 180 - f.alpha - f.beta;
    const genau = (f.s * sin(f.beta)) / sin(gamma);
    const { loesung, ...rund } = gerundet(genau);
    return {
      platzhalter: { ...f },
      bild: allgemeinesDreieck(
        { alpha: f.alpha, beta: f.beta },
        { c: `c = ${f.s} m`, b: 'b = ?' },
        { α: `α = ${f.alpha}°`, β: `β = ${f.beta}°` },
      ),
      loesung,
      ...rund,
      loesungsweg: [
        de(`Winkelsumme: $\\gamma = 180° - ${f.alpha}° - ${f.beta}° = ${gamma}°$.`),
        de(
          `Sinussatz: $b = \\frac{c \\cdot \\sin \\beta}{\\sin \\gamma} = \\frac{${f.s} \\cdot \\sin ${f.beta}°}{\\sin ${gamma}°} \\approx ${t1(genau)}$ m.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['paar', deutlich((f.s * sin(f.alpha)) / sin(gamma), genau)],
        ['rechtwinklig', deutlich(f.s * sin(f.beta), genau)],
      ]),
    };
  },

  schritt(seed, _p, id) {
    const f = fluss(seed);
    const gamma = 180 - f.alpha - f.beta;
    if (id === 'gamma') return { loesung: zahl(gamma), fehlerbilder: [] };
    const genau = (f.s * sin(f.beta)) / sin(gamma);
    const loesung = zahl(r1(genau));
    return {
      platzhalter: { gamma },
      loesung,
      auchRichtig: (e) => e.typ === 'zahl' && Math.abs(e.wert - genau) <= 0.06,
      fehlerbilder: fehlerbilderAus(loesung, [
        ['paar', deutlich((f.s * sin(f.alpha)) / sin(gamma), genau)],
        ['rechtwinklig', deutlich(f.s * sin(f.beta), genau)],
      ]),
    };
  },
};

/**
 * Quadratische Pyramide: Seitenkante s und Winkel φ an der Spitze zwischen zwei benachbarten
 * Seitenkanten. Gesucht die Grundkante a (Kosinussatz, Niveau M).
 */
export const adKoerper: Generator<Record<string, never>> = {
  id: 'ad.koerper',
  version: 1,
  platzhalter: ['s', 'phi'],
  fehlerbildIds: ['vorzeichen', 'wurzel-vergessen'],

  erzeuge(seed) {
    const r = rng(seed);
    const s = r.int(5, 20);
    const phi = r.pick([30, 35, 40, 45, 50, 55, 60, 65, 70, 75]);
    const a2 = 2 * s * s - 2 * s * s * cos(phi);
    const genau = Math.sqrt(a2);
    const { loesung, ...rund } = gerundet(genau);
    return {
      platzhalter: { s, phi },
      loesung,
      ...rund,
      loesungsweg: [
        de(
          `Die Seitenfläche ist ein Dreieck mit zwei Seitenkanten s und dem Winkel φ dazwischen. Kosinussatz: $a^2 = s^2 + s^2 - 2s^2 \\cdot \\cos \\varphi$.`,
        ),
        de(
          `$a^2 = 2 \\cdot ${s}^2 - 2 \\cdot ${s}^2 \\cdot \\cos ${phi}° \\approx ${texZahl(r2(a2))}$, also $a \\approx ${t1(genau)}$ cm.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['vorzeichen', sinnvoll(Math.sqrt(2 * s * s + 2 * s * s * cos(phi)))],
        ['wurzel-vergessen', sinnvoll(a2)],
      ]),
    };
  },
};

/** E: Welcher Satz zuerst? (M.RF.AD.SACH.BEGRUENDEN) */
export const adPlanAussage = aussagenGenerator(
  'ad.plan-aussage',
  ['sinussatz', 'pythagoras'],
  ['fall'],
  (r) => {
    const fall = r.int(0, 2);
    const faelle = [
      {
        gegeben: 'zwei Seiten und der Winkel dazwischen (SWS)',
        richtig:
          'Zuerst der Kosinussatz: Zu keinem bekannten Winkel kennt man die Gegenseite, der Sinussatz hilft noch nicht.',
        sinus: 'Zuerst der Sinussatz, denn ein Winkel ist bekannt.',
      },
      {
        gegeben: 'alle drei Seiten (SSS)',
        richtig:
          'Zuerst der Kosinussatz nach einem Winkel umgestellt: Es ist noch kein Winkel bekannt.',
        sinus: 'Zuerst der Sinussatz, denn er verbindet Seiten und Winkel.',
      },
      {
        gegeben: 'eine Seite und die beiden anliegenden Winkel (WSW)',
        richtig:
          'Zuerst den dritten Winkel aus der Winkelsumme, dann der Sinussatz mit der Seite und ihrem Gegenwinkel.',
        sinus: 'Zuerst der Kosinussatz, denn er gilt in jedem Dreieck.',
      },
    ] as const;
    const f = faelle[fall] ?? faelle[0];
    return {
      situation: `Von einem Dreieck ohne rechten Winkel kennt man ${f.gegeben}. Womit fängt man an?`,
      werte: { fall },
      richtig: f.richtig,
      falsch: [
        ['sinussatz', f.sinus],
        ['pythagoras', 'Mit dem Satz des Pythagoras, denn mit ihm berechnet man fehlende Seiten.'],
      ],
      weg: [
        'Sinussatz: braucht ein Paar aus Seite und Gegenwinkel.',
        'Kosinussatz: für SWS und SSS. Pythagoras nur mit rechtem Winkel.',
      ],
    };
  },
);
