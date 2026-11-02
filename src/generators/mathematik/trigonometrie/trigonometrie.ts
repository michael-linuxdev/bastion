// Trigonometrie im rechtwinkligen Dreieck – Klasse 9 (LEHRPLAN §8e, Feld TR): Sinus, Kosinus und
// Tangens als Seitenverhältnisse, Seiten und Winkel berechnen, Sachaufgaben. Winkel in Grad,
// Ergebnisse auf eine Nachkommastelle gerundet (Bedarfsliste B3).
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { rundeAuf } from '../../../core/learning/auswertung';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { dreieckSkizze, type Ecke } from '../pythagoras/pythagoras';

const RAD = Math.PI / 180;
const sin = (g: number) => Math.sin(g * RAD);
const cos = (g: number) => Math.cos(g * RAD);
const tan = (g: number) => Math.tan(g * RAD);
const r1 = (x: number) => rundeAuf(x, 1);
const GRIECH: Readonly<Record<Ecke, string>> = { A: 'α', B: 'β', C: 'γ' };
const TEX: Readonly<Record<Ecke, string>> = { A: '\\alpha', B: '\\beta', C: '\\gamma' };
const SEITE: Readonly<Record<Ecke, string>> = { A: 'a', B: 'b', C: 'c' };
const ANDERE: Readonly<Record<Ecke, readonly [Ecke, Ecke]>> = {
  A: ['B', 'C'],
  B: ['C', 'A'],
  C: ['A', 'B'],
};

/** Rollen der Seiten zum Winkel an `ecke` bei rechtem Winkel an `rechts` */
function rollen(rechts: Ecke, ecke: Ecke) {
  const dritte = (['A', 'B', 'C'] as const).find((e) => e !== rechts && e !== ecke) ?? 'A';
  return {
    hypotenuse: SEITE[rechts],
    gegen: SEITE[ecke],
    an: SEITE[dritte],
  };
}

// ---------------------------------------------------------------------------
// Seitenverhältnis erkennen (M.RF.TR.BEGRIFFE.VERHAELTNIS)

export interface VerhaeltnisParameter {
  /** true: rechter Winkel an wechselnder Ecke */
  readonly gemischt: boolean;
}

type Funktion = 'sin' | 'cos' | 'tan';

/** „Welches Seitenverhältnis ist sin α?“ – mit Skizze */
export const trVerhaeltnis: Generator<VerhaeltnisParameter> = {
  id: 'tr.verhaeltnis',
  version: 1,
  platzhalter: ['funktion', 'winkel'],
  fehlerbildIds: ['an-gegen', 'kehrwert', 'andere-funktion'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const rechts: Ecke = p.gemischt ? r.pick(['A', 'B', 'C']) : 'C';
    const ecke = r.pick(ANDERE[rechts]);
    const f = r.pick(['sin', 'cos', 'tan'] as const satisfies readonly Funktion[]);
    const { hypotenuse: h, gegen: g, an: a } = rollen(rechts, ecke);
    const bruch = (z: string, n: string) => `$\\frac{${z}}{${n}}$`;
    const soll: Record<Funktion, [string, string]> = { sin: [g, h], cos: [a, h], tan: [g, a] };
    const [z, n] = soll[f];
    const kandidaten: [string, string][] = [['richtig', bruch(z, n)]];
    // Ankathete und Gegenkathete vertauscht
    const tausch: Record<Funktion, [string, string]> = { sin: [a, h], cos: [g, h], tan: [a, g] };
    kandidaten.push(['an-gegen', bruch(...tausch[f])]);
    kandidaten.push(['kehrwert', bruch(n, z)]);
    const andere: Record<Funktion, [string, string]> = { sin: [g, a], cos: [g, a], tan: [g, h] };
    kandidaten.push(['andere-funktion', bruch(...andere[f])]);
    const eindeutig = kandidaten.filter(
      ([, t], i) => kandidaten.findIndex(([, u]) => u === t) === i,
    );
    const liste = mische(r, eindeutig);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    const beschriftung: Record<string, string> = {};
    return {
      platzhalter: { funktion: de(`\\${f}`), winkel: de(TEX[ecke]) },
      bild: dreieckSkizze(rechts, beschriftung),
      optionen: liste.map(([, t]) => ({ text: de(t) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Der rechte Winkel liegt bei ${rechts}, die Hypotenuse ist ${h}.`),
        de(`Vom Winkel ${GRIECH[ecke]} aus: Gegenkathete ${g}, Ankathete ${a}.`),
        de(
          f === 'sin'
            ? `$\\sin ${TEX[ecke]} = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}} = \\frac{${g}}{${h}}$`
            : f === 'cos'
              ? `$\\cos ${TEX[ecke]} = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}} = \\frac{${a}}{${h}}$`
              : `$\\tan ${TEX[ecke]} = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\frac{${g}}{${a}}$`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Warum nur vom Winkel? (M.RF.TR.BEGRIFFE.BEGRUENDEN, Niveau E)

/** „Warum ist sin 30° in jedem rechtwinkligen Dreieck gleich?“ */
export const trBegruenden: Generator<Record<string, never>> = {
  id: 'tr.begruenden',
  version: 1,
  platzhalter: ['winkel', 'funktion'],
  fehlerbildIds: ['groesse', 'zufall', 'hypotenuse-eins'],

  erzeuge(seed) {
    const r = rng(seed);
    const w = r.pick([20, 30, 35, 40, 50, 60, 70]);
    const f = r.pick(['sin', 'cos', 'tan'] as const);
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Alle rechtwinkligen Dreiecke mit dem Winkel ${w}° sind ähnlich. In ähnlichen Dreiecken sind die Seitenverhältnisse gleich.`,
      ],
      ['groesse', 'Das stimmt nicht: In größeren Dreiecken ist das Verhältnis größer.'],
      ['zufall', 'Das liegt am Taschenrechner, der immer denselben Wert anzeigt.'],
      ['hypotenuse-eins', 'Weil die Hypotenuse immer 1 lang ist.'],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: { winkel: w, funktion: de(`\\${f}`) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          `Zwei rechtwinklige Dreiecke mit dem Winkel ${w}° stimmen in allen Winkeln überein: 90°, ${w}° und ${90 - w}°.`,
        ),
        de(
          'Dreiecke mit gleichen Winkeln sind ähnlich. Das eine ist eine Vergrößerung des anderen, alle Seiten wachsen mit demselben Faktor. Die Verhältnisse bleiben gleich.',
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Seite oder Winkel berechnen (M.RF.TR.BERECHNEN.RECHNEN)

export interface BerechnenParameter {
  /** true: rechter Winkel an wechselnder Ecke, auch Winkel gesucht */
  readonly gemischt: boolean;
}

/** Ein rechtwinkliges Dreieck mit Winkel w an `ecke` und Hypotenuse h */
function aufgabe(r: Rng, p: BerechnenParameter) {
  const rechts: Ecke = p.gemischt ? r.pick(['A', 'B', 'C']) : 'C';
  const ecke = r.pick(ANDERE[rechts]);
  const w = r.int(15, 75);
  const h = r.int(4, 20);
  return { rechts, ecke, w, h, ...rollen(rechts, ecke) };
}

/** „Berechne die Seite a.“ / „Berechne den Winkel α.“ – mit Skizze */
export const trBerechnen: Generator<BerechnenParameter> = {
  id: 'tr.berechnen',
  version: 1,
  platzhalter: ['gesucht', 'einheit'],
  fehlerbildIds: ['falsche-funktion', 'kehrwert', 'bogenmass'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const { rechts, ecke, w, h, hypotenuse, gegen, an } = aufgabe(r, p);
    const winkelGesucht = p.gemischt && r.int(0, 2) === 0;
    const beschriftung: Record<string, string> = {};
    if (winkelGesucht) {
      // zwei Seiten gegeben, Winkel gesucht: aus Gegenkathete und Hypotenuse (sin) oder beiden Katheten (tan)
      const mitTan = r.int(0, 1) === 0;
      const g = r1(h * sin(w));
      const a = r1(h * cos(w));
      const genau = mitTan ? Math.atan(g / a) / RAD : Math.asin(g / h) / RAD;
      beschriftung[gegen] = `${gegen} = ${zahlText(g)} cm`;
      if (mitTan) beschriftung[an] = `${an} = ${zahlText(a)} cm`;
      else beschriftung[hypotenuse] = `${hypotenuse} = ${h} cm`;
      const loesung = zahl(r1(genau));
      const falsch: [string, Loesung | undefined][] = [
        [
          'falsche-funktion',
          mitTan ? zahl(r1(Math.atan(a / g) / RAD)) : zahl(r1(Math.acos(g / h) / RAD)),
        ],
      ];
      return {
        platzhalter: { gesucht: de(`den Winkel ${GRIECH[ecke]}`), einheit: de('Grad') },
        bild: dreieckSkizze(rechts, beschriftung),
        loesung,
        runden: { stellen: 1, genau },
        loesungsweg: [
          de(
            `Vom Winkel ${GRIECH[ecke]} aus ist ${gegen} die Gegenkathete${mitTan ? ` und ${an} die Ankathete` : ` und ${hypotenuse} die Hypotenuse`}.`,
          ),
          de(
            mitTan
              ? `$\\tan ${TEX[ecke]} = \\frac{${texZahl(g)}}{${texZahl(a)}}$, also $${TEX[ecke]} \\approx ${texZahl(r1(genau))}°$.`
              : `$\\sin ${TEX[ecke]} = \\frac{${texZahl(g)}}{${h}}$, also $${TEX[ecke]} \\approx ${texZahl(r1(genau))}°$.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          falsch.filter(
            ([, l]) => l === undefined || (l.typ === 'zahl' && Math.abs(l.wert - r1(genau)) > 0.15),
          ),
        ),
      };
    }
    // Seite gesucht: Hypotenuse und Winkel gegeben
    beschriftung[hypotenuse] = `${hypotenuse} = ${h} cm`;
    const gegenGesucht = r.int(0, 1) === 0;
    const gesucht = gegenGesucht ? gegen : an;
    beschriftung[gesucht] = `${gesucht} = ?`;
    const genau = gegenGesucht ? h * sin(w) : h * cos(w);
    const loesung = zahl(r1(genau));
    const falsch: [string, Loesung | undefined][] = [
      ['falsche-funktion', zahl(r1(gegenGesucht ? h * cos(w) : h * sin(w)))],
      ['kehrwert', zahl(r1(gegenGesucht ? h / sin(w) : h / cos(w)))],
      ['bogenmass', zahl(r1(gegenGesucht ? h * Math.sin(w) : h * Math.cos(w)))],
    ];
    return {
      platzhalter: {
        gesucht: de(`die Seite ${gesucht} (Winkel ${GRIECH[ecke]} = ${w}°)`),
        einheit: de('cm'),
      },
      bild: dreieckSkizze(rechts, beschriftung),
      loesung,
      runden: { stellen: 1, genau },
      loesungsweg: [
        de(
          `Vom Winkel ${GRIECH[ecke]} aus ist ${gesucht} die ${gegenGesucht ? 'Gegenkathete' : 'Ankathete'}, ${hypotenuse} die Hypotenuse.`,
        ),
        de(
          `$${gesucht} = ${h} \\cdot \\${gegenGesucht ? 'sin' : 'cos'} ${w}° \\approx ${texZahl(r1(genau))}$ cm`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        falsch.filter(
          ([, l]) => l === undefined || (l.typ === 'zahl' && Math.abs(l.wert - r1(genau)) > 0.15),
        ),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Vom anderen Winkel aus (M.RF.TR.BERECHNEN.WECHSEL, Niveau E)

/** „Für β ist a die Ankathete“ – welche Aussage stimmt? */
export const trWechsel: Generator<Record<string, never>> = {
  id: 'tr.wechsel',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['rolle-fest', 'hypotenuse', 'gleich'],

  erzeuge(seed) {
    const r = rng(seed);
    const w = r.int(20, 70);
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `$\\sin \\alpha = \\cos \\beta$, denn die Gegenkathete von α ist die Ankathete von β.`,
      ],
      ['rolle-fest', 'Für α und β ist a immer die Gegenkathete.'],
      ['hypotenuse', 'Von β aus ist a die Hypotenuse.'],
      ['gleich', `Wenn $\\alpha = ${w}°$ ist, dann ist auch $\\beta = ${w}°$.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: {},
      bild: dreieckSkizze('C', {}),
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de('Im Dreieck mit rechtem Winkel bei C liegt a gegenüber von α: Gegenkathete von α.'),
        de(
          'Von β aus liegt a am Winkel an: Ankathete von β. Darum $\\sin \\alpha = \\frac{a}{c} = \\cos \\beta$, und $\\alpha + \\beta = 90°$.',
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben (M.RF.TR.SACH.BERECHNEN)

export type TrSachArt = 'turm' | 'rampe' | 'leiter';

export interface TrSachParameter {
  readonly arten: readonly TrSachArt[];
}

/** Turmhöhe aus Abstand und Höhenwinkel, Rampe, Leiterwinkel */
export const trSach: Generator<TrSachParameter> = {
  id: 'tr.sach',
  version: 1,
  platzhalter: ['situation', 'frage'],
  fehlerbildIds: ['falsche-funktion', 'bogenmass'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    if (art === 'turm') {
      const d = r.int(20, 120);
      const w = r.int(15, 60);
      const genau = d * tan(w);
      const loesung = zahl(r1(genau));
      return {
        platzhalter: {
          situation: de(
            `Von einem Punkt ${d} m vor einem Turm sieht man die Turmspitze unter einem Höhenwinkel von ${w}°.`,
          ),
          frage: de('Wie hoch ist der Turm (in m)?'),
        },
        loesung,
        runden: { stellen: 1, genau },
        loesungsweg: [
          de(
            'Boden, Turm und Sichtlinie bilden ein rechtwinkliges Dreieck. Der Turm ist die Gegenkathete, der Abstand die Ankathete.',
          ),
          de(`$h = ${d} \\cdot \\tan ${w}° \\approx ${texZahl(r1(genau))}$ m`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          [
            ['falsche-funktion', zahl(r1(d * sin(w)))],
            ['bogenmass', zahl(r1(d * Math.tan(w)))],
          ].filter(([, l]) => Math.abs((l as { wert: number }).wert - r1(genau)) > 0.15) as [
            string,
            Loesung,
          ][],
        ),
      };
    }
    if (art === 'rampe') {
      const l = r.int(2, 12);
      const w = r.int(3, 12);
      const genau = l * sin(w);
      const loesung = zahl(r1(genau));
      return {
        platzhalter: {
          situation: de(`Eine ${l} m lange Rampe steigt unter einem Winkel von ${w}° an.`),
          frage: de('Wie viel Meter Höhe überwindet sie?'),
        },
        loesung,
        runden: { stellen: 1, genau },
        loesungsweg: [
          de('Die Rampe ist die Hypotenuse, die Höhe die Gegenkathete zum Steigungswinkel.'),
          de(`$h = ${l} \\cdot \\sin ${w}° \\approx ${texZahl(r1(genau))}$ m`),
        ],
        fehlerbilder: fehlerbilderAus(
          loesung,
          [
            ['falsche-funktion', zahl(r1(l * cos(w)))],
            ['bogenmass', zahl(r1(l * Math.sin(w)))],
          ].filter(([, x]) => Math.abs((x as { wert: number }).wert - r1(genau)) > 0.15) as [
            string,
            Loesung,
          ][],
        ),
      };
    }
    const l = r.int(3, 8);
    const abstand = r1(l * r.pick([0.2, 0.25, 0.3, 0.35]));
    const genau = Math.acos(abstand / l) / RAD;
    const loesung = zahl(r1(genau));
    return {
      platzhalter: {
        situation: de(
          `Eine ${l} m lange Leiter lehnt an einer Wand. Ihr Fuß steht ${zahlText(abstand)} m von der Wand entfernt.`,
        ),
        frage: de('Welchen Winkel bildet sie mit dem Boden (in Grad)?'),
      },
      loesung,
      runden: { stellen: 1, genau },
      loesungsweg: [
        de(
          'Die Leiter ist die Hypotenuse, der Abstand zur Wand die Ankathete des Winkels am Boden.',
        ),
        de(
          `$\\cos \\alpha = \\frac{${texZahl(abstand)}}{${l}}$, also $\\alpha \\approx ${texZahl(r1(genau))}°$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        loesung,
        [['falsche-funktion', zahl(r1(Math.asin(abstand / l) / RAD))]].filter(
          ([, x]) => Math.abs((x as { wert: number }).wert - r1(genau)) > 0.15,
        ) as [string, Loesung][],
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Steigung in Prozent und Grad (M.RF.TR.SACH.STEIGUNG, Niveau E)

/** „Eine Straße hat 12 % Steigung. Wie groß ist der Steigungswinkel?“ */
export const trSteigung: Generator<Record<string, never>> = {
  id: 'tr.steigung',
  version: 1,
  platzhalter: ['prozent'],
  fehlerbildIds: ['prozent-als-grad', 'sinus', 'prozent-mal-90'],

  erzeuge(seed) {
    const r = rng(seed);
    const pz = r.pick([5, 8, 10, 12, 15, 20, 25]);
    const w = Math.atan(pz / 100) / RAD;
    const s = Math.asin(pz / 100) / RAD;
    const kandidaten: [string, string][] = [
      ['richtig', `etwa ${zahlText(r1(w))}°, denn $\\tan \\alpha = \\frac{${pz}}{100}$`],
      ['prozent-als-grad', `${pz}°, denn Prozent und Grad sind dasselbe Maß`],
      [
        'sinus',
        `etwa ${zahlText(r1(s) === r1(w) ? r1(s) + 0.1 : r1(s))}°, denn $\\sin \\alpha = \\frac{${pz}}{100}$`,
      ],
      ['prozent-mal-90', `etwa ${zahlText(r1((pz / 100) * 90))}°, denn 100 % entsprechen 90°`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: { prozent: pz },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`${pz} % Steigung heißt: ${pz} m Höhe auf 100 m waagerechte Strecke.`),
        de('Höhe und waagerechte Strecke sind Gegen- und Ankathete. Also Tangens.'),
        de(`$\\tan \\alpha = ${texZahl(pz / 100)}$, $\\alpha \\approx ${texZahl(r1(w))}°$.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
