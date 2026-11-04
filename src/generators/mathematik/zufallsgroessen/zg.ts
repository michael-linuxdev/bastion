// Zufallsgrößen – Klasse 10 (LEHRPLAN §8f, Feld ZG): Wahrscheinlichkeitsverteilung,
// Erwartungswert, faire Spiele, Varianz und Standardabweichung. Wahrscheinlichkeiten werden in
// Hundertsteln als ganze Zahlen gerechnet, damit 0,1 + 0,2 genau 0,3 bleibt.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { de, zahl } from '../../hilfen';
import { stabdiagramm } from './stabdiagramm';

/** Hundertstel als Dezimalzahl */
const h = (n: number) => n / 100;
const genau = (x: number) => Math.round(x * 1e6) / 1e6;
const zt = (x: number) => zahlText(genau(x));

/** Zerlegung von 100 in `n` Teile, je ein Vielfaches von `schritt`, keines 0 */
export function zerlege(r: Rng, n: number, schritt: number): number[] {
  for (;;) {
    const teile: number[] = [];
    let rest = 100;
    for (let i = 0; i < n - 1; i++) {
      const max = rest - schritt * (n - 1 - i);
      if (max < schritt) break;
      const t = schritt * r.int(1, Math.min(max / schritt, 50 / schritt));
      teile.push(t);
      rest -= t;
    }
    if (teile.length === n - 1 && rest >= schritt) return [...teile, rest];
  }
}

/** Tabelle x | P(X = x) als KaTeX; `null` = gesucht */
export function verteilungTex(werte: readonly number[], p: readonly (number | null)[]): string {
  return `\\begin{array}{c|${'c'.repeat(werte.length)}} x & ${werte.join(' & ')} \\\\ \\hline P(X = x) & ${p
    .map((x) => (x === null ? '?' : texZahl(h(x))))
    .join(' & ')} \\end{array}`;
}

// ---------------------------------------------------------------------------
// Verteilung (M.DZ.ZG.VERTEILUNG)

/** „Ergänze die fehlende Wahrscheinlichkeit.“ (Niveau G) */
export const zgVerteilung: Generator<Record<string, never>> = {
  id: 'zg.verteilung',
  version: 1,
  platzhalter: ['tabelle', 'summe'],
  fehlerbildIds: ['summe-eins'],

  erzeuge(seed) {
    const r = rng(seed);
    const n = r.int(3, 5);
    const start = r.int(0, 2);
    const werte = Array.from({ length: n }, (_, i) => start + i);
    const p = zerlege(r, n, 5);
    const luecke = r.int(0, n - 1);
    const bekannt = p.map((x, i) => (i === luecke ? null : x));
    const summe = p.reduce((s, x, i) => (i === luecke ? s : s + x), 0);
    const richtig = zahl(h(p[luecke] ?? 0));
    return {
      platzhalter: { tabelle: de(verteilungTex(werte, bekannt)), summe: h(summe) },
      bild: stabdiagramm(
        werte,
        bekannt.map((x) => (x === null ? undefined : h(x))),
      ),
      loesung: richtig,
      loesungsweg: [
        de('Alle Wahrscheinlichkeiten einer Verteilung ergeben zusammen 1.'),
        de(
          `Bekannt sind zusammen ${zt(h(summe))}. Es fehlen $1 - ${texZahl(h(summe))} = ${texZahl(h(100 - summe))}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['summe-eins', zahl(h(summe))]]),
    };
  },
};

interface Kumuliert {
  readonly werte: number[];
  readonly p: number[];
  readonly k: number;
  readonly mindestens: boolean;
}

function kumuliert(seed: number): Kumuliert {
  const r = rng(seed);
  const n = r.int(4, 6);
  const werte = Array.from({ length: n }, (_, i) => i);
  const p = zerlege(r, n, 5);
  // k nicht am Rand, damit „mindestens“ und „höchstens“ echte Summen sind
  const k = r.int(1, n - 2);
  return { werte, p, k, mindestens: r.int(0, 1) === 1 };
}

const summeVon = (p: readonly number[], von: number, bis: number) =>
  p.slice(von, bis + 1).reduce((s, x) => s + x, 0);

/** „Berechne P(X ≥ 2).“ aus der Tabelle (Niveau M) */
export const zgKumuliert: Generator<Record<string, never>> = {
  id: 'zg.kumuliert',
  version: 1,
  platzhalter: ['tabelle', 'frage', 'k', 'mindestens'],
  fehlerbildIds: ['grenze', 'richtung'],

  erzeuge(seed) {
    const a = kumuliert(seed);
    const n = a.werte.length;
    const wert = a.mindestens ? summeVon(a.p, a.k, n - 1) : summeVon(a.p, 0, a.k);
    const ohneK = a.mindestens ? summeVon(a.p, a.k + 1, n - 1) : summeVon(a.p, 0, a.k - 1);
    const andere = a.mindestens ? summeVon(a.p, 0, a.k) : summeVon(a.p, a.k, n - 1);
    const richtig = zahl(h(wert));
    const zeichen = a.mindestens ? '\\geq' : '\\leq';
    return {
      platzhalter: {
        tabelle: de(verteilungTex(a.werte, a.p)),
        frage: de(
          `$P(X ${zeichen} ${a.k})$, also die Wahrscheinlichkeit für ${a.mindestens ? 'mindestens' : 'höchstens'} ${a.k}`,
        ),
        k: a.k,
        mindestens: a.mindestens ? 1 : 0,
      },
      loesung: richtig,
      loesungsweg: [
        de(
          `$X ${zeichen} ${a.k}$ heißt: ${a.mindestens ? 'mindestens' : 'höchstens'} ${a.k}, also ${a.k} selbst gehört dazu.`,
        ),
        de(
          `Addiere $P(X = ${a.mindestens ? `${a.k}` : '0'})$ bis $P(X = ${a.mindestens ? `${n - 1}` : `${a.k}`})$: $${texZahl(h(wert))}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['grenze', zahl(h(ohneK))],
        ['richtung', zahl(h(andere))],
      ]),
    };
  },
};

/** E: „mindestens eine Sechs“ über das Gegenereignis (M.DZ.ZG.VERTEILUNG.BEGRUENDEN) */
export const zgMindestensAussage = aussagenGenerator(
  'zg.mindestens-aussage',
  ['gegenereignis', 'grenze'],
  ['n'],
  (r) => {
    const n = r.int(2, 4);
    const keine = genau((5 / 6) ** n);
    const p = Math.round((1 - keine) * 1000) / 1000;
    return {
      situation: `Ein Würfel wird ${n}-mal geworfen. Wie groß ist die Wahrscheinlichkeit für mindestens eine Sechs?`,
      werte: { n },
      richtig: `Über das Gegenereignis „keine Sechs“: $1 - \\left(\\frac{5}{6}\\right)^{${n}} \\approx ${texZahl(p)}$.`,
      falsch: [
        [
          'gegenereignis',
          `Jeder Wurf bringt $\\frac{1}{6}$, zusammen $${n} \\cdot \\frac{1}{6} = \\frac{${n}}{6}$.`,
        ],
        [
          'grenze',
          `Genau eine Sechs: $${n} \\cdot \\frac{1}{6} \\cdot \\left(\\frac{5}{6}\\right)^{${n - 1}}$, das ist „mindestens eine“.`,
        ],
      ],
      weg: [
        `„Mindestens eine Sechs“ ist das Gegenteil von „keine Sechs“. $P(\\text{keine}) = \\left(\\frac{5}{6}\\right)^{${n}}$.`,
        `Also $1 - \\left(\\frac{5}{6}\\right)^{${n}} \\approx ${texZahl(p)}$. Mit ${n} Würfen ginge $\\frac{${n}}{6}$ bei 6 Würfen schon auf 1 – das kann nicht sein.`,
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Erwartungswert (M.DZ.ZG.ERWARTUNG)

interface Tabelle {
  readonly werte: number[];
  readonly p: number[];
}

function erwartungTabelle(r: Rng): Tabelle {
  for (;;) {
    const n = r.int(3, 4);
    const werte: number[] = [];
    while (werte.length < n) {
      const x = r.int(0, 10);
      if (!werte.includes(x)) werte.push(x);
    }
    werte.sort((a, b) => a - b);
    const p = zerlege(r, n, 10);
    // ungewichteter Mittelwert soll sich vom Erwartungswert unterscheiden
    const e = werte.reduce((s, x, i) => s + x * (p[i] ?? 0), 0) / 100;
    const m = werte.reduce((s, x) => s + x, 0) / n;
    if (Math.abs(e - m) > 0.05) return { werte, p };
  }
}

const erwartung = (t: Tabelle) => genau(t.werte.reduce((s, x, i) => s + x * h(t.p[i] ?? 0), 0));

/** „Berechne den Erwartungswert E(X).“ (Niveau G) */
export const zgErwartung: Generator<Record<string, never>> = {
  id: 'zg.erwartung',
  version: 1,
  platzhalter: ['tabelle'],
  fehlerbildIds: ['ungewichtet'],

  erzeuge(seed) {
    const t = erwartungTabelle(rng(seed));
    const e = erwartung(t);
    const m = genau(t.werte.reduce((s, x) => s + x, 0) / t.werte.length);
    const richtig = zahl(e);
    const glieder = t.werte.map((x, i) => `${x} \\cdot ${texZahl(h(t.p[i] ?? 0))}`).join(' + ');
    return {
      platzhalter: { tabelle: de(verteilungTex(t.werte, t.p)) },
      bild: stabdiagramm(
        t.werte,
        t.p.map((x) => h(x)),
      ),
      loesung: richtig,
      ...(Number.isInteger(e * 100) ? {} : { runden: { stellen: 2, genau: e } }),
      loesungsweg: [
        de('Jeder Wert wird mit seiner Wahrscheinlichkeit malgenommen, dann wird addiert.'),
        de(`$E(X) = ${glieder} = ${texZahl(e)}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['ungewichtet', zahl(Math.round(m * 100) / 100)]]),
    };
  },
};

interface Spiel {
  readonly einsatz: number;
  readonly gewinne: number[];
  readonly felder: number[];
}

/** Glücksrad mit 10 gleich großen Feldern: Auszahlung je Feld, Einsatz je Spiel */
function spiel(seed: number): Spiel {
  const r = rng(seed);
  for (;;) {
    const n = r.int(2, 3);
    const gewinne: number[] = [0];
    while (gewinne.length < n + 1) {
      const g = r.pick([1, 2, 3, 4, 5, 10]);
      if (!gewinne.includes(g)) gewinne.push(g);
    }
    gewinne.sort((a, b) => a - b);
    const felder = zerlege(r, n + 1, 10).map((x) => x / 10);
    const einsatz = r.int(1, 4);
    const e = gewinne.reduce((s, g, i) => s + (g * (felder[i] ?? 0)) / 10, 0);
    if (Math.abs(e - einsatz) < 3) return { einsatz, gewinne, felder };
  }
}

const auszahlung = (s: Spiel) =>
  genau(s.gewinne.reduce((t, g, i) => t + (g * (s.felder[i] ?? 0)) / 10, 0));

/** „Wie viel gewinnt oder verliert man im Mittel je Spiel?“ (Niveau M, Zwischenschritte) */
export const zgFair: Generator<Record<string, never>> = {
  id: 'zg.fair',
  version: 1,
  platzhalter: ['satz', 'einsatz'],
  fehlerbildIds: ['einsatz', 'ungewichtet'],
  schritte: [
    { id: 'auszahlung', fehlerbildIds: ['ungewichtet'] },
    { id: 'gewinn', fehlerbildIds: ['einsatz'], platzhalter: ['auszahlung'] },
  ],

  erzeuge(seed) {
    const s = spiel(seed);
    const a = auszahlung(s);
    const g = genau(a - s.einsatz);
    const richtig = zahl(g);
    const liste = s.gewinne
      .map((x, i) => `${s.felder[i]} ${s.felder[i] === 1 ? 'Feld' : 'Felder'} ${x} €`)
      .join(', ');
    const m = genau(s.gewinne.reduce((t, x) => t + x, 0) / s.gewinne.length);
    return {
      platzhalter: {
        satz: de(
          `Ein Glücksrad hat 10 gleich große Felder: ${liste}. Ein Spiel kostet ${s.einsatz} € Einsatz.`,
        ),
        einsatz: s.einsatz,
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          `Erwartete Auszahlung: $${s.gewinne.map((x, i) => `${x} \\cdot ${texZahl((s.felder[i] ?? 0) / 10)}`).join(' + ')} = ${texZahl(a)}$ €.`,
        ),
        de(
          `Minus Einsatz: $${texZahl(a)} - ${s.einsatz} = ${texZahl(g)}$ €. ${g === 0 ? 'Das Spiel ist fair.' : g < 0 ? 'Im Mittel verliert man: unfair für den Spieler.' : 'Im Mittel gewinnt man: unfair für den Betreiber.'}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['einsatz', zahl(a)],
        ['ungewichtet', zahl(genau(m - s.einsatz))],
      ]),
    };
  },

  schritt(seed, _p, id) {
    const s = spiel(seed);
    const a = auszahlung(s);
    const m = genau(s.gewinne.reduce((t, x) => t + x, 0) / s.gewinne.length);
    if (id === 'auszahlung') {
      const loesung = zahl(a);
      return { loesung, fehlerbilder: fehlerbilderAus(loesung, [['ungewichtet', zahl(m)]]) };
    }
    const loesung = zahl(genau(a - s.einsatz));
    return {
      platzhalter: { auszahlung: a },
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [['einsatz', zahl(a)]]),
    };
  },
};

/** E: Gewinnchance und Gewinnerwartung (M.DZ.ZG.ERWARTUNG.BEGRUENDEN) */
export const zgChanceGewinnAussage = aussagenGenerator(
  'zg.chance-gewinn-aussage',
  ['chance', 'ungewichtet'],
  ['pa', 'ga', 'pb', 'gb'],
  (r) => {
    for (;;) {
      // Spiel A: oft, aber wenig; Spiel B: selten, aber viel
      const pa = r.pick([50, 60, 70, 80]);
      const ga = r.pick([1, 2]);
      const pb = r.pick([10, 20]);
      const gb = r.pick([10, 15, 20, 25]);
      const ea = (pa * ga) / 100;
      const eb = (pb * gb) / 100;
      if (eb <= ea + 0.4) continue;
      return {
        situation: `Spiel A zahlt mit Wahrscheinlichkeit ${zt(h(pa))} genau ${ga} € aus, sonst nichts. Spiel B zahlt mit Wahrscheinlichkeit ${zt(h(pb))} genau ${gb} € aus, sonst nichts. Tim sagt: „A ist besser, da gewinne ich öfter.“ Stimmt das?`,
        werte: { pa, ga, pb, gb },
        richtig: `Nein. Im Mittel zahlt A $${texZahl(h(pa))} \\cdot ${ga} = ${texZahl(ea)}$ € aus, B aber $${texZahl(h(pb))} \\cdot ${gb} = ${texZahl(eb)}$ €. B hat den höheren Erwartungswert.`,
        falsch: [
          ['chance', 'Ja. Wer öfter gewinnt, bekommt auf Dauer mehr Geld.'],
          [
            'ungewichtet',
            `Nein. B ist besser, weil ${gb} € mehr ist als ${ga} €. Die Wahrscheinlichkeit spielt keine Rolle.`,
          ],
        ],
        weg: [
          'Der Erwartungswert verbindet beides: Wahrscheinlichkeit mal Betrag.',
          `A: ${zt(ea)} €, B: ${zt(eb)} € je Spiel im Mittel.`,
        ],
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Streuung (M.DZ.ZG.STREUUNG, nur Gymnasium)

interface Streu {
  readonly werte: number[];
  readonly p: number[];
}

/** Verteilung mit ganzzahligem Erwartungswert und „schöner“ Varianz */
function streuTabelle(seed: number): Streu {
  const r = rng(seed);
  for (;;) {
    const mu = r.int(2, 8);
    const d = r.pick([1, 2, 3, 4]);
    const art = r.int(0, 1);
    if (art === 0) {
      // symmetrisch: mu − d, mu, mu + d
      const rand = r.pick([10, 20, 25, 30, 40]);
      return { werte: [mu - d, mu, mu + d], p: [rand, 100 - 2 * rand, rand] };
    }
    // zwei Werte mit gleicher Wahrscheinlichkeit
    if (mu - d < 0) continue;
    return { werte: [mu - d, mu + d], p: [50, 50] };
  }
}

const mittel = (t: Streu) => genau(t.werte.reduce((s, x, i) => s + x * h(t.p[i] ?? 0), 0));
const varianz = (t: Streu) => {
  const m = mittel(t);
  return genau(t.werte.reduce((s, x, i) => s + (x - m) ** 2 * h(t.p[i] ?? 0), 0));
};
const ohneQuadrat = (t: Streu) => {
  const m = mittel(t);
  return genau(t.werte.reduce((s, x, i) => s + Math.abs(x - m) * h(t.p[i] ?? 0), 0));
};

/** „Berechne die Varianz.“ (Niveau G, Zwischenschritte) */
export const zgVarianz: Generator<Record<string, never>> = {
  id: 'zg.varianz',
  version: 1,
  platzhalter: ['tabelle'],
  fehlerbildIds: ['ohne-quadrat'],
  schritte: [
    { id: 'mittel', fehlerbildIds: [] },
    { id: 'varianz', fehlerbildIds: ['ohne-quadrat'], platzhalter: ['mittel'] },
  ],

  erzeuge(seed) {
    const t = streuTabelle(seed);
    const m = mittel(t);
    const v = varianz(t);
    const richtig = zahl(v);
    return {
      platzhalter: { tabelle: de(verteilungTex(t.werte, t.p)) },
      loesung: richtig,
      loesungsweg: [
        de(`Erwartungswert: $\\mu = ${texZahl(m)}$.`),
        de(
          `$V(X) = ${t.werte.map((x, i) => `(${x} - ${texZahl(m)})^2 \\cdot ${texZahl(h(t.p[i] ?? 0))}`).join(' + ')} = ${texZahl(v)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['ohne-quadrat', zahl(ohneQuadrat(t))]]),
    };
  },

  schritt(seed, _p, id) {
    const t = streuTabelle(seed);
    if (id === 'mittel') return { loesung: zahl(mittel(t)), fehlerbilder: [] };
    const loesung = zahl(varianz(t));
    return {
      platzhalter: { mittel: mittel(t) },
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [['ohne-quadrat', zahl(ohneQuadrat(t))]]),
    };
  },
};

/** „Berechne die Standardabweichung.“ aus der Varianz-Tabelle (Niveau M) */
export const zgStandardabweichung: Generator<Record<string, never>> = {
  id: 'zg.standardabweichung',
  version: 1,
  platzhalter: ['tabelle'],
  fehlerbildIds: ['wurzel', 'ohne-quadrat'],

  erzeuge(seed) {
    const t = streuTabelle(seed);
    const v = varianz(t);
    const s = Math.sqrt(v);
    const wert = Math.round(s * 100) / 100;
    const richtig = zahl(wert);
    return {
      platzhalter: { tabelle: de(verteilungTex(t.werte, t.p)) },
      loesung: richtig,
      ...(Math.abs(wert - s) < 1e-9 ? {} : { runden: { stellen: 2, genau: s } }),
      loesungsweg: [
        de(`Erwartungswert $\\mu = ${texZahl(mittel(t))}$, Varianz $V(X) = ${texZahl(v)}$.`),
        de(
          `$\\sigma = \\sqrt{V(X)} = \\sqrt{${texZahl(v)}} ${Math.abs(wert - s) < 1e-9 ? '=' : '\\approx'} ${texZahl(wert)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['wurzel', Math.abs(v - wert) > 0.015 ? zahl(v) : undefined],
        ['ohne-quadrat', zahl(ohneQuadrat(t))],
      ]),
    };
  },
};

/** E: gleicher Erwartungswert, verschiedenes Risiko (M.DZ.ZG.STREUUNG.BEGRUENDEN) */
export const zgRisikoAussage = aussagenGenerator(
  'zg.risiko-aussage',
  ['ungewichtet', 'wurzel'],
  ['mu', 'klein', 'gross'],
  (r) => {
    const mu = r.pick([4, 5, 6, 10]);
    const klein = r.pick([1, 2]);
    const gross = r.pick([3, 4]);
    return {
      situation: `Spiel A zahlt je zur Hälfte ${mu - klein} € oder ${mu + klein} € aus, Spiel B je zur Hälfte ${mu - gross} € oder ${mu + gross} €. Lena sagt: „Beide Spiele sind gleich, denn beide haben den Erwartungswert ${mu} €.“ Stimmt das?`,
      werte: { mu, klein, gross },
      richtig: `Nein. Der Erwartungswert ist gleich, aber B streut stärker: $\\sigma_A = ${klein}$, $\\sigma_B = ${gross}$. B ist riskanter.`,
      falsch: [
        ['ungewichtet', 'Ja. Spiele mit gleichem Erwartungswert sind in jeder Hinsicht gleich.'],
        [
          'wurzel',
          `Nein. B ist sicherer, denn seine Varianz ${gross * gross} ist eine größere Zahl als ${klein * klein}.`,
        ],
      ],
      weg: [
        `Beide: $E = ${mu}$. Abweichungen vom Mittel: A immer ${klein}, B immer ${gross}.`,
        `$\\sigma_A = ${klein}$, $\\sigma_B = ${gross}$: Je größer σ, desto größer das Risiko.`,
      ],
    };
  },
);
