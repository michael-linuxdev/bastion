// Sparpläne, Kredite und Tilgung – Klasse 10 (LEHRPLAN §8f, M.ZO.PZ.KREDIT). Geld wird in Cent
// gerechnet; jedes Jahr wird auf ganze Cent gerundet, wie bei der Bank. `runden.genau` ist der
// Wert ohne Zwischenrunden, damit eine etwas anders gerundete Antwort den Hinweis bekommt.
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { de, zahl } from '../../hilfen';
import { euro } from './prozent';

const eur = (cent: number) => zahl(Math.round(cent) / 100);
const tex = (cent: number) => texZahl(Math.round(cent) / 100);
const centAus = (l: Loesung | undefined) =>
  l?.typ === 'zahl' ? Math.round(l.wert * 100) : undefined;
const ZINSEN = [1, 1.5, 2, 2.5, 3] as const;

// ---------------------------------------------------------------------------
// Sparplan (M.ZO.PZ.KREDIT.SPARPLAN, Niveau G)

function sparplan(seed: number) {
  const r = rng(seed);
  const rate = 100 * r.int(5, 20);
  const p = r.pick(ZINSEN);
  const q = 1 + p / 100;
  const e = rate * 100;
  // Kontostand am Ende jedes Jahres, auf Cent gerundet
  const stand: number[] = [];
  let k = 0;
  // ungerundeter Wert des letzten Jahres (aus dem gerundeten Vorjahr)
  let genau = 0;
  for (let j = 0; j < 3; j++) {
    // in Tausendsteln gerechnet, damit ein halber Cent genau ein halber bleibt
    genau = ((k + e) * (1000 + 10 * p)) / 1000;
    k = Math.round(genau);
    stand.push(k);
  }
  return { rate, p, q, e, stand, genau };
}

const JAHRE = ['jahr1', 'jahr2', 'jahr3'] as const;

/** „Am Anfang jedes Jahres 600 € einzahlen, 2 % Zinsen: Kontostand nach 3 Jahren?“ */
export const pzSparplan: Generator<Record<string, never>> = {
  id: 'pz.sparplan',
  version: 1,
  platzhalter: ['rate', 'p'],
  fehlerbildIds: ['erste', 'einfach'],
  schritte: [
    { id: 'jahr1', fehlerbildIds: [] },
    { id: 'jahr2', fehlerbildIds: ['erste', 'einfach'] },
    { id: 'jahr3', fehlerbildIds: ['erste', 'einfach'] },
  ],

  erzeuge(seed) {
    const s = sparplan(seed);
    const [k1 = 0, k2 = 0, k3 = 0] = s.stand;
    const loesung = eur(k3);
    return {
      platzhalter: { rate: s.rate, p: s.p },
      loesung,
      runden: { stellen: 2, genau: s.genau / 100 },
      loesungsweg: [
        de(
          `Jedes Jahr: alter Stand plus Einzahlung, dann mal $${texZahl(s.q)}$. Jahr 1: $${s.rate} \\cdot ${texZahl(s.q)} = ${tex(k1)}$ €.`,
        ),
        de(
          `Jahr 2: $(${tex(k1)} + ${s.rate}) \\cdot ${texZahl(s.q)} \\approx ${tex(k2)}$ €. Jahr 3: $(${tex(k2)} + ${s.rate}) \\cdot ${texZahl(s.q)} \\approx ${tex(k3)}$ €.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['erste', eur(s.e * s.q ** 3 + 2 * s.e)],
        ['einfach', eur(3 * s.e + s.e * (s.p / 100) * 6)],
      ]),
    };
  },

  schritt(seed, _p, id, bisher) {
    const s = sparplan(seed);
    const j = JAHRE.indexOf(id as (typeof JAHRE)[number]);
    // mit dem eigenen Stand des Vorjahres weiterrechnen
    const vorher = j === 0 ? 0 : (centAus(bisher[JAHRE[j - 1] ?? '']) ?? s.stand[j - 1] ?? 0);
    const genau = ((vorher + s.e) * (1000 + 10 * s.p)) / 1000;
    const loesung = eur(Math.round(genau));
    const n = j + 1;
    return {
      loesung,
      runden: { stellen: 2, genau: genau / 100 },
      fehlerbilder:
        n === 1
          ? []
          : fehlerbilderAus(loesung, [
              ['erste', eur(s.e * s.q ** n + (n - 1) * s.e)],
              ['einfach', eur(n * s.e + s.e * (s.p / 100) * ((n * (n + 1)) / 2))],
            ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Tilgung (M.ZO.PZ.KREDIT.TILGUNG, Niveau M)

function tilgung(seed: number) {
  const r = rng(seed);
  const kredit = 1000 * r.int(5, 20);
  const p = r.int(3, 6);
  const rate = (kredit * p) / 100 + 500 * r.int(2, 6);
  const c = kredit * 100;
  const z1 = Math.round((c * p) / 100);
  const s1 = c + z1 - rate * 100;
  const z2 = Math.round((s1 * p) / 100);
  const s2 = s1 + z2 - rate * 100;
  return { kredit, p, rate, c, z1, s1, z2, s2 };
}

/** „Kredit 10 000 €, 5 % Zinsen, Rate 2 000 € am Jahresende: Restschuld nach 2 Jahren?“ */
export const pzTilgung: Generator<Record<string, never>> = {
  id: 'pz.tilgung',
  version: 1,
  platzhalter: ['kredit', 'p', 'rate'],
  fehlerbildIds: ['ohne-zins', 'anfang'],
  schritte: [
    { id: 'zinsen1', fehlerbildIds: [] },
    { id: 'rest1', fehlerbildIds: ['ohne-zins'] },
    { id: 'zinsen2', fehlerbildIds: ['anfang'] },
    { id: 'rest2', fehlerbildIds: ['ohne-zins'] },
  ],

  erzeuge(seed) {
    const t = tilgung(seed);
    const loesung = eur(t.s2);
    return {
      platzhalter: { kredit: t.kredit, p: t.p, rate: t.rate },
      loesung,
      loesungsweg: [
        de(
          `Jahr 1: Zinsen $${tex(t.z1)}$ €, Restschuld $${t.kredit} + ${tex(t.z1)} - ${t.rate} = ${tex(t.s1)}$ €.`,
        ),
        de(
          `Jahr 2: Zinsen von der Restschuld $${tex(t.s1)} \\cdot ${texZahl(t.p / 100)} \\approx ${tex(t.z2)}$ €, Restschuld $${tex(t.s1)} + ${tex(t.z2)} - ${t.rate} = ${tex(t.s2)}$ €.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['ohne-zins', eur(t.c - 2 * t.rate * 100)],
        ['anfang', eur(t.c + 2 * t.z1 - 2 * t.rate * 100)],
      ]),
    };
  },

  schritt(seed, _p, id, bisher) {
    const t = tilgung(seed);
    const rateC = t.rate * 100;
    if (id === 'zinsen1') return { loesung: eur(t.z1), fehlerbilder: [] };
    if (id === 'rest1') {
      const z1 = centAus(bisher['zinsen1']) ?? t.z1;
      const loesung = eur(t.c + z1 - rateC);
      return {
        loesung,
        fehlerbilder: fehlerbilderAus(loesung, [['ohne-zins', eur(t.c - rateC)]]),
      };
    }
    const s1 = centAus(bisher['rest1']) ?? t.s1;
    if (id === 'zinsen2') {
      const loesung = eur(Math.round((s1 * t.p) / 100));
      return {
        loesung,
        runden: { stellen: 2, genau: (s1 * t.p) / 10000 },
        fehlerbilder: fehlerbilderAus(loesung, [['anfang', eur(t.z1)]]),
      };
    }
    const z2 = centAus(bisher['zinsen2']) ?? Math.round((s1 * t.p) / 100);
    const loesung = eur(s1 + z2 - rateC);
    return {
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [['ohne-zins', eur(s1 - rateC)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Angebote vergleichen (M.ZO.PZ.KREDIT.BEGRUENDEN, Niveau E)

/** Zwei Kredite: kleiner Zinssatz mit Gebühr gegen größeren ohne Gebühr */
export const pzEffektivAussage = aussagenGenerator(
  'pz.effektiv-aussage',
  ['zinssatz', 'gebuehr'],
  ['kredit', 'pa', 'pb', 'gebuehr'],
  (r) => {
    const kredit = 1000 * r.int(2, 10);
    const pa = r.int(3, 5);
    const pb = pa + r.int(1, 2);
    const gebuehr = (kredit * (pb - pa)) / 100 + 10 * r.int(2, 6);
    const kostenA = (kredit * pa) / 100 + gebuehr;
    const kostenB = (kredit * pb) / 100;
    const e = (x: number) => euro(x * 100);
    return {
      situation: `Ben braucht einen Kredit über ${e(kredit)} für ein Jahr. Angebot A: ${pa} % Zinsen und eine Bearbeitungsgebühr von ${e(gebuehr)}. Angebot B: ${pb} % Zinsen ohne Gebühr. Ben sagt: „A ist günstiger, der Zinssatz ist kleiner.“ Stimmt das?`,
      werte: { kredit, pa, pb, gebuehr },
      richtig: `Nein. A kostet ${e((kredit * pa) / 100)} Zinsen und ${e(gebuehr)} Gebühr, zusammen ${e(kostenA)}. B kostet nur ${e(kostenB)}.`,
      falsch: [
        ['zinssatz', 'Ja. Der kleinere Zinssatz ist immer das günstigere Angebot.'],
        ['gebuehr', 'Ja. Die Gebühr zahlt man nur einmal, sie gehört nicht zu den Kosten.'],
      ],
      weg: [
        'Vergleiche, was du insgesamt mehr zurückzahlst: Zinsen plus alle Gebühren.',
        `A: ${e((kredit * pa) / 100)} + ${e(gebuehr)} = ${e(kostenA)}, B: ${e(kostenB)}.`,
      ],
    };
  },
);
