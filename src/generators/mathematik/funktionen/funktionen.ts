// Funktionen – Klasse 8 (LEHRPLAN §8d, Feld FK): Funktionsbegriff, Funktionswerte,
// Eigenschaften am Graphen, lineare Funktionen y = m·x + n (Graph, Gleichung,
// Nullstelle) und Tarife. Graphen im Koordinatensystem mit vier Quadranten.
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, koordinatensystem4, kreis, linie } from '../../svg';
import { optionenAus, summe } from '../terme/umformen';

const zz = (x: number) => zahl(runde10(x, 6) || 0);
const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
const k = (x: number) => (x < 0 ? `(${zahlText(x)})` : zahlText(x));
/** „y = 2·x − 3“, „y = −x“, „y = 4“ */
export const geradeText = (m: number, n: number, name = 'y') =>
  `${name} = ${summe([
    [m, 'x'],
    [n, ''],
  ])}`;

const MAX = 6;

/** Polygonzug (Punkte in Koordinaten) im Koordinatensystem mit vier Quadranten */
function graphBild(
  punkte: readonly (readonly [number, number])[],
  beschreibung: string,
  max = MAX,
): Bild {
  const ks = koordinatensystem4(max);
  const teile = [...ks.teile];
  for (let i = 1; i < punkte.length; i++) {
    const [x1, y1] = punkte[i - 1] ?? [0, 0];
    const [x2, y2] = punkte[i] ?? [0, 0];
    teile.push(linie(ks.px(x1), ks.py(y1), ks.px(x2), ks.py(y2), 3));
  }
  return bild(ks.breite, ks.hoehe, teile, de(beschreibung));
}

/** Linie der Geraden y = m·x + n, abgeschnitten am Rand des Gitters von −max … max */
export function geradeLinie(
  ks: ReturnType<typeof koordinatensystem4>,
  m: number,
  n: number,
  max = MAX,
) {
  const punkte: [number, number][] = [];
  for (let x = -max; x <= max; x += 0.01) {
    const y = m * x + n;
    if (Math.abs(y) <= max + 1e-9) punkte.push([x, y]);
  }
  const a = punkte[0] ?? [0, 0];
  const b = punkte[punkte.length - 1] ?? [0, 0];
  return linie(ks.px(a[0]), ks.py(a[1]), ks.px(b[0]), ks.py(b[1]), 3);
}

/** Gerade y = m·x + n im Koordinatensystem */
function geradeBild(m: number, n: number, max = MAX, extra: string[] = []): Bild {
  const ks = koordinatensystem4(max);
  return bild(
    ks.breite,
    ks.hoehe,
    [...ks.teile, geradeLinie(ks, m, n, max), ...extra],
    de(
      `Ein Koordinatensystem mit einer Geraden durch die Punkte (0|${zahlText(n)}) und (2|${zahlText(runde10(2 * m + n, 6))}).`,
    ),
  );
}

// ---------------------------------------------------------------------------
// Ist die Zuordnung eine Funktion? (M.SF.FK.BEGRIFF.FUNKTION)

export interface IstFunktionParameter {
  /** auch Paare in Mengenschreibweise und Fälle mit gleichen y-Werten */
  readonly erweitert: boolean;
}

/** „Ist die Zuordnung x → y eine Funktion?“ – Wertetabelle oder Paare */
export const istFunktion: Generator<IstFunktionParameter> = {
  id: 'fk.ist-funktion',
  version: 1,
  platzhalter: ['zuordnung'],
  fehlerbildIds: ['gleiche-y-werte', 'doppeltes-x-uebersehen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const xs = mische(r, [-3, -2, -1, 0, 1, 2, 3, 4])
      .slice(0, 5)
      .sort((a, b) => a - b);
    const ys = xs.map(() => pm(r, 9));
    const fall = r.int(0, 2); // 0 Funktion, 1 x doppelt (keine Funktion), 2 Funktion mit gleichen y
    const paare: [number, number][] = xs.map((x, i) => [x, ys[i] ?? 0]);
    if (fall === 1) {
      const i = r.int(0, paare.length - 1);
      const [x, y] = paare[i] ?? [0, 0];
      let y2 = pm(r, 9);
      if (y2 === y) y2 = -y || 1;
      paare.splice(r.int(0, paare.length), 0, [x, y2]);
    }
    if (fall === 2) {
      const i = r.int(1, paare.length - 1);
      paare[i] = [paare[i]?.[0] ?? 0, paare[0]?.[1] ?? 0];
    }
    const mengen = p.erweitert && r.int(0, 1) === 0;
    const text = mengen
      ? paare.map(([x, y]) => `(${zahlText(x)}|${zahlText(y)})`).join('; ')
      : `x: ${paare.map(([x]) => zahlText(x)).join(' | ')} – y: ${paare.map(([, y]) => zahlText(y)).join(' | ')}`;
    const funktion = fall !== 1;
    const richtig = auswahl(funktion ? 0 : 1);
    return {
      platzhalter: { zuordnung: de(text) },
      optionen: [{ text: de('Ja, eine Funktion') }, { text: de('Nein, keine Funktion') }],
      loesung: richtig,
      loesungsweg: [
        de(
          'Eine Funktion ordnet jedem x genau ein y zu. Gleiche y-Werte für verschiedene x sind erlaubt.',
        ),
        de(
          funktion
            ? 'Jedes x kommt nur einmal vor – also eine Funktion.'
            : 'Ein x hat zwei verschiedene y-Werte – also keine Funktion.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gleiche-y-werte', fall === 2 ? auswahl(1) : undefined],
        ['doppeltes-x-uebersehen', fall === 1 ? auswahl(0) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Funktionswerte (M.SF.FK.BEGRIFF.WERT)

export interface FunktionswertParameter {
  /** auch quadratische Terme und gesuchtes Argument */
  readonly erweitert: boolean;
}

/** „f(x) = 3·x − 4. Berechne f(−2).“ / „Für welches x ist f(x) = 11?“ */
export const funktionswert: Generator<FunktionswertParameter> = {
  id: 'fk.funktionswert',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['minus-vergessen', 'quadrat-vorzeichen', 'wert-statt-argument'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = p.erweitert ? r.int(0, 2) : 0;
    const m = pm(r, 6);
    const n = pm(r, 9);
    const x = pm(r, 6);
    if (art === 1) {
      // f(x) = x² + c
      const c = pm(r, 9);
      const wert = x * x + c;
      const richtig = zz(wert);
      return {
        platzhalter: {
          aufgabe: de(
            `f(x) = ${summe([
              [1, 'x²'],
              [c, ''],
            ])}. Berechne f(${zahlText(x)}).`,
          ),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            `f(${zahlText(x)}) = ${k(x)}² ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${zahlText(wert)}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['quadrat-vorzeichen', x < 0 ? zz(-(x * x) + c) : undefined],
        ]),
      };
    }
    if (art === 2) {
      // Argument gesucht: m·x + n = w
      const w = m * x + n;
      const richtig = zz(x);
      return {
        platzhalter: {
          aufgabe: de(
            `f(x) = ${summe([
              [m, 'x'],
              [n, ''],
            ])}. Für welches x ist f(x) = ${zahlText(w)}?`,
          ),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            `${summe([
              [m, 'x'],
              [n, ''],
            ])} = ${zahlText(w)}`,
          ),
          de(`x = (${zahlText(w)} ${n < 0 ? '+' : '−'} ${Math.abs(n)}) : ${k(m)} = ${zahlText(x)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['wert-statt-argument', zz(m * w + n)]]),
      };
    }
    const wert = m * x + n;
    const richtig = zz(wert);
    return {
      platzhalter: {
        aufgabe: de(
          `f(x) = ${summe([
            [m, 'x'],
            [n, ''],
          ])}. Berechne f(${zahlText(x)}).`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          `Setze ${zahlText(x)} für x ein: ${zahlText(m)} · ${k(x)} ${n < 0 ? '−' : '+'} ${Math.abs(n)} = ${zahlText(wert)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['minus-vergessen', zz(m * -x + n)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Eigenschaften am Graphen (M.SF.FK.EIGENSCHAFTEN.ABLESEN, .VERLAUF)

/** Zufälliger Polygonzug über x = −5 … 5 mit genau einem Hoch- oder Tiefpunkt */
function knickGraph(r: Rng) {
  const hoch = r.int(0, 1) === 0;
  const sx = r.int(-3, 3);
  const sy = hoch ? r.int(1, 5) : r.int(-5, -1);
  const links = r.int(1, 2);
  const rechts = r.int(1, 2);
  const f = (x: number) =>
    x <= sx ? sy - (hoch ? 1 : -1) * links * (sx - x) : sy - (hoch ? 1 : -1) * rechts * (x - sx);
  const xs: number[] = [];
  for (let x = -6; x <= 6; x++) if (Math.abs(f(x)) <= 6) xs.push(x);
  // nur zusammenhängender Teil um den Scheitel
  const punkte: [number, number][] = xs.filter((x) => Math.abs(x - sx) <= 6).map((x) => [x, f(x)]);
  return { hoch, sx, sy, f, punkte };
}

function nullstellen(f: (x: number) => number, von: number, bis: number): number[] {
  const z: number[] = [];
  for (let x = von * 2; x <= bis * 2; x++) if (f(x / 2) === 0) z.push(x / 2);
  return z;
}

export interface GraphAblesenParameter {
  /** false: Nullstellen zählen; true: Stelle des Hoch- bzw. Tiefpunkts */
  readonly extrem: boolean;
}

/** „Wie viele Nullstellen hat die Funktion?“ / „An welcher Stelle x liegt der Hochpunkt?“ */
export const graphAblesen: Generator<GraphAblesenParameter> = {
  id: 'fk.graph-ablesen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['y-statt-x', 'schnitt-mit-y-achse'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const g = knickGraph(r);
    const von = g.punkte[0]?.[0] ?? -6;
    const bis = g.punkte[g.punkte.length - 1]?.[0] ?? 6;
    const b = graphBild(
      g.punkte,
      `Ein Graph aus zwei geraden Stücken mit einem ${g.hoch ? 'Hochpunkt' : 'Tiefpunkt'} bei (${zahlText(g.sx)}|${zahlText(g.sy)}), gezeichnet von x = ${zahlText(von)} bis x = ${zahlText(bis)}.`,
    );
    if (p.extrem) {
      const richtig = zz(g.sx);
      return {
        platzhalter: {
          frage: de(
            `An welcher Stelle x liegt der ${g.hoch ? 'höchste' : 'tiefste'} Punkt des Graphen?`,
          ),
        },
        bild: b,
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            `Der ${g.hoch ? 'Hochpunkt' : 'Tiefpunkt'} ist (${zahlText(g.sx)}|${zahlText(g.sy)}). Gefragt ist die Stelle x = ${zahlText(g.sx)}.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['y-statt-x', zz(g.sy)]]),
      };
    }
    const z = nullstellen(g.f, von, bis);
    const richtig = zahl(z.length);
    return {
      platzhalter: { frage: de('Wie viele Nullstellen hat die Funktion im gezeichneten Bereich?') },
      bild: b,
      loesung: richtig,
      loesungsweg: [
        de('Nullstellen sind die Stellen, an denen der Graph die x-Achse schneidet oder berührt.'),
        de(
          z.length === 0
            ? 'Der Graph trifft die x-Achse nicht.'
            : `Bei x = ${z.map(zahlText).join(' und x = ')}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['schnitt-mit-y-achse', g.f(0) !== 0 ? zahl(z.length + 1) : undefined],
      ]),
    };
  },
};

export interface VerlaufParameter {
  /** false: Gerade steigt, fällt oder ist waagerecht; true: Bereich, in dem ein Knickgraph fällt */
  readonly bereich: boolean;
}

/** „Steigt oder fällt der Graph?“ / „In welchem Bereich fällt der Graph?“ */
export const graphVerlauf: Generator<VerlaufParameter> = {
  id: 'fk.graph-verlauf',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['steigen-fallen-verwechselt', 'bereich-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.bereich) {
      const art = r.int(0, 2);
      const m = art === 0 ? r.int(1, 3) : art === 1 ? -r.int(1, 3) : 0;
      const n = pm(r, 4);
      const richtig = auswahl(art);
      return {
        platzhalter: {
          frage: de(
            'Steigt der Graph, fällt er oder verläuft er waagerecht (von links nach rechts gelesen)?',
          ),
        },
        bild: geradeBild(m, n),
        optionen: [
          { text: de('Er steigt.') },
          { text: de('Er fällt.') },
          { text: de('Er verläuft waagerecht.') },
        ],
        loesung: richtig,
        loesungsweg: [
          de('Lies von links nach rechts: Geht die Linie nach oben, steigt der Graph.'),
          de(['Er steigt.', 'Er fällt.', 'Er verläuft waagerecht.'][art] ?? ''),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['steigen-fallen-verwechselt', art < 2 ? auswahl(1 - art) : undefined],
        ]),
      };
    }
    const g = knickGraph(r);
    const von = g.punkte[0]?.[0] ?? -6;
    const bis = g.punkte[g.punkte.length - 1]?.[0] ?? 6;
    // Beim Hochpunkt fällt der Graph rechts davon, beim Tiefpunkt links davon
    const faellt = g.hoch ? `für x > ${zahlText(g.sx)}` : `für x < ${zahlText(g.sx)}`;
    const steigt = g.hoch ? `für x < ${zahlText(g.sx)}` : `für x > ${zahlText(g.sx)}`;
    const { optionen, index, richtig } = optionenAus(r, faellt, [
      ['steigen-fallen-verwechselt', steigt],
      ['bereich-falsch', g.hoch ? `für x > ${zahlText(g.sy)}` : `für x < ${zahlText(g.sy)}`],
      ['bereich-falsch', 'überall'],
    ]);
    return {
      platzhalter: { frage: de('In welchem Bereich fällt der Graph?') },
      bild: graphBild(
        g.punkte,
        `Ein Graph aus zwei geraden Stücken mit einem ${g.hoch ? 'Hochpunkt' : 'Tiefpunkt'} bei (${zahlText(g.sx)}|${zahlText(g.sy)}), gezeichnet von x = ${zahlText(von)} bis x = ${zahlText(bis)}.`,
      ),
      optionen: optionen.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(`${g.hoch ? 'Hochpunkt' : 'Tiefpunkt'} bei x = ${zahlText(g.sx)}.`),
        de(`Der Graph fällt ${faellt}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['steigen-fallen-verwechselt', index('steigen-fallen-verwechselt')],
        ['bereich-falsch', index('bereich-falsch')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Graphen linearer Funktionen (M.SF.FK.LINEAR-GRAPH.ABLESEN, .GLEICHUNG)

export interface GeradeAblesenParameter {
  /** false: y-Achsenabschnitt n; true: Anstieg m */
  readonly anstieg: boolean;
}

/** „Lies den y-Achsenabschnitt n ab.“ / „Bestimme den Anstieg m.“ */
export const geradeAblesen: Generator<GeradeAblesenParameter> = {
  id: 'fk.gerade-ablesen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['nullstelle-statt-n', 'kehrwert', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const m = p.anstieg ? r.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]) : pm(r, 3);
    const n = pm(r, 4);
    const ks = koordinatensystem4(MAX);
    // Steigungsdreieck ab (0|n), auf M eingezeichnet
    const dx = Number.isInteger(m) ? 1 : 2;
    const dreieck = p.anstieg
      ? [
          `<line x1="${ks.px(0)}" y1="${ks.py(n)}" x2="${ks.px(dx)}" y2="${ks.py(n)}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
          `<line x1="${ks.px(dx)}" y1="${ks.py(n)}" x2="${ks.px(dx)}" y2="${ks.py(n + m * dx)}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
        ]
      : [kreis(ks.px(0), ks.py(n), 4, true)];
    const b = geradeBild(m, n, MAX, dreieck);
    if (!p.anstieg) {
      const richtig = zz(n);
      const nullstelle = -n / m;
      return {
        platzhalter: { frage: de('Lies den y-Achsenabschnitt n der Geraden ab.') },
        bild: b,
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de('Der y-Achsenabschnitt ist die Stelle, an der die Gerade die y-Achse schneidet.'),
          de(`n = ${zahlText(n)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['nullstelle-statt-n', Number.isInteger(nullstelle) ? zz(nullstelle) : undefined],
          ['vorzeichen-falsch', zz(-n)],
        ]),
      };
    }
    const richtig = zz(m);
    return {
      platzhalter: {
        frage: de('Bestimme den Anstieg m der Geraden mit dem eingezeichneten Steigungsdreieck.'),
      },
      bild: b,
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Anstieg m = Höhenunterschied : Breite des Steigungsdreiecks.'),
        de(`m = ${zahlText(m * dx)} : ${dx} = ${zahlText(m)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['kehrwert', zz(1 / m)],
        ['vorzeichen-falsch', zz(-m)],
      ]),
    };
  },
};

/** „Welche Gleichung gehört zur Geraden?“ */
export const gleichungZumGraph: Generator<GeradeAblesenParameter> = {
  id: 'fk.gleichung-zum-graph',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['m-n-vertauscht', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const m = p.anstieg ? r.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]) : pm(r, 3);
    let n = pm(r, 4);
    if (n === m) n = n > 0 ? n + 1 : n - 1;
    const { optionen, index, richtig } = optionenAus(r, geradeText(m, n), [
      ['m-n-vertauscht', geradeText(n, m)],
      ['vorzeichen-falsch', geradeText(-m, n)],
      ['vorzeichen-falsch', geradeText(m, -n)],
    ]);
    return {
      platzhalter: {},
      bild: geradeBild(m, n),
      optionen: optionen.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(`Die Gerade schneidet die y-Achse bei ${zahlText(n)}: n = ${zahlText(n)}.`),
        de(
          `Geht man 1 nach rechts, geht es ${zahlText(Math.abs(m))} ${m > 0 ? 'nach oben' : 'nach unten'}: m = ${zahlText(m)}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['m-n-vertauscht', index('m-n-vertauscht')],
        ['vorzeichen-falsch', index('vorzeichen-falsch')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Gleichungen linearer Funktionen (M.SF.FK.LINEAR-GLEICHUNG.PUNKT, .BESTIMMEN)

/** „Liegt der Punkt P(2|7) auf der Geraden y = 3·x + 1?“ */
export const punktAufGerade: Generator<Record<string, never>> = {
  id: 'fk.punkt-auf-gerade',
  version: 1,
  platzhalter: ['punkt', 'gerade'],
  fehlerbildIds: ['x-y-vertauscht', 'falsch-eingesetzt'],

  erzeuge(seed) {
    const r = rng(seed);
    const m = pm(r, 4);
    const n = pm(r, 8);
    const x = pm(r, 5);
    const fall = r.int(0, 2); // 0 liegt drauf, 1 knapp daneben, 2 x und y vertauscht
    const yr = m * x + n;
    const [px, py] = fall === 0 ? [x, yr] : fall === 1 ? [x, yr + pm(r, 2)] : [yr, x];
    const liegt = m * px + n === py;
    const richtig = auswahl(liegt ? 0 : 1);
    return {
      platzhalter: {
        punkt: de(`P(${zahlText(px)}|${zahlText(py)})`),
        gerade: de(geradeText(m, n)),
      },
      optionen: [
        { text: de('Ja, P liegt auf der Geraden.') },
        { text: de('Nein, P liegt nicht darauf.') },
      ],
      loesung: richtig,
      loesungsweg: [
        de(
          `Setze x = ${zahlText(px)} ein: y = ${zahlText(m)} · ${k(px)} ${n < 0 ? '−' : '+'} ${Math.abs(n)} = ${zahlText(m * px + n)}.`,
        ),
        de(
          liegt
            ? `Das ist die y-Koordinate von P – P liegt auf der Geraden.`
            : `P hat aber y = ${zahlText(py)} – P liegt nicht darauf.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', fall === 2 && !liegt ? auswahl(0) : undefined],
        ['falsch-eingesetzt', fall === 1 ? auswahl(0) : liegt ? auswahl(1) : undefined],
      ]),
    };
  },
};

export interface BestimmenParameter {
  /** false: n aus m und einem Punkt; true: m aus zwei Punkten */
  readonly zwei_punkte: boolean;
}

/** „y = 2·x + n geht durch P(3|5). Berechne n.“ / „Berechne m für die Gerade durch P und Q.“ */
export const geradeBestimmen: Generator<BestimmenParameter> = {
  id: 'fk.gerade-bestimmen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['kehrwert', 'vorzeichen-falsch', 'n-falsch-umgestellt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const m = p.zwei_punkte ? r.pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]) : pm(r, 4);
    const n = pm(r, 8);
    const x1 = Number.isInteger(m) ? r.int(-4, 3) : 2 * r.int(-2, 1);
    if (!p.zwei_punkte) {
      const y1 = m * x1 + n;
      const richtig = zz(n);
      return {
        platzhalter: {
          aufgabe: de(
            `Die Gerade ${geradeText(m, 0).replace(/ = (.+)$/, ' = $1 + n')} geht durch P(${zahlText(x1)}|${zahlText(y1)}). Berechne n.`,
          ),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(`Setze P ein: ${zahlText(y1)} = ${zahlText(m)} · ${k(x1)} + n`),
          de(`n = ${zahlText(y1)} − ${k(m * x1)} = ${zahlText(n)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['n-falsch-umgestellt', zz(y1 + m * x1)]]),
      };
    }
    const dx = r.pick([2, 4]);
    const x2 = x1 + dx;
    const y1 = m * x1 + n;
    const y2 = m * x2 + n;
    const richtig = zz(m);
    return {
      platzhalter: {
        aufgabe: de(
          `Eine Gerade geht durch P(${zahlText(x1)}|${zahlText(y1)}) und Q(${zahlText(x2)}|${zahlText(y2)}). Berechne ihren Anstieg m.`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('m = (y₂ − y₁) : (x₂ − x₁)'),
        de(
          `m = (${zahlText(y2)} − ${k(y1)}) : (${zahlText(x2)} − ${k(x1)}) = ${zahlText(y2 - y1)} : ${dx} = ${zahlText(m)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['kehrwert', zz(dx / (y2 - y1))],
        ['vorzeichen-falsch', zz(-m)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Nullstellen (M.SF.FK.NULLSTELLE.BERECHNEN, .ABLESEN)

export interface NullstelleParameter {
  /** auch Nullstellen mit Komma */
  readonly dezimal: boolean;
}

/** „Berechne die Nullstelle von f(x) = 2·x − 6.“ */
export const nullstelleBerechnen: Generator<NullstelleParameter> = {
  id: 'fk.nullstelle-berechnen',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['n-statt-nullstelle', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    // Nullstelle x0: ganz oder (auf M) eine Dezimalzahl; n = −m·x0 muss ganz sein
    let m: number;
    let x0: number;
    let n: number;
    do {
      m = pm(r, p.dezimal ? 8 : 5);
      x0 = p.dezimal && r.int(0, 1) === 0 ? pm(r, 19) / r.pick([2, 4]) : pm(r, 9);
      n = runde10(-m * x0, 6);
    } while (!Number.isInteger(n));
    const richtig = zz(x0);
    return {
      platzhalter: {
        funktion: de(
          `f(x) = ${summe([
            [m, 'x'],
            [n, ''],
          ])}`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          `Nullstelle: f(x) = 0, also ${summe([
            [m, 'x'],
            [n, ''],
          ])} = 0.`,
        ),
        de(`x = ${zahlText(-n)} : ${k(m)} = ${zahlText(x0)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['n-statt-nullstelle', zz(n)],
        ['vorzeichen-falsch', zz(-x0)],
      ]),
    };
  },
};

/** „Lies die Nullstelle der Geraden ab.“ */
export const nullstelleAblesen: Generator<Record<string, never>> = {
  id: 'fk.nullstelle-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['n-statt-nullstelle', 'vorzeichen-falsch'],

  erzeuge(seed) {
    const r = rng(seed);
    let m: number;
    let x0: number;
    let n: number;
    do {
      m = r.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
      x0 = pm(r, 5);
      n = -m * x0;
    } while (!Number.isInteger(n) || Math.abs(n) > 5);
    const ks = koordinatensystem4(MAX);
    const richtig = zz(x0);
    return {
      platzhalter: {},
      bild: geradeBild(m, n, MAX, [kreis(ks.px(x0), ks.py(0), 4, true)]),
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Die Nullstelle ist die Stelle, an der die Gerade die x-Achse schneidet.'),
        de(`x = ${zahlText(x0)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['n-statt-nullstelle', zz(n)],
        ['vorzeichen-falsch', zz(-x0)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Tarife (M.SF.FK.SACH.KOSTEN, .VERGLEICH)

const TARIFE = [
  { was: 'Ein Taxi', grund: [3, 4, 5], preis: [1.5, 2, 2.5], einheit: 'km', stueck: 'Kilometer' },
  {
    was: 'Ein Fahrradverleih',
    grund: [2, 5, 6],
    preis: [1, 1.5, 3],
    einheit: 'Stunde',
    stueck: 'Stunden',
  },
  {
    was: 'Ein Handytarif',
    grund: [5, 8, 10],
    preis: [0.1, 0.2, 0.5],
    einheit: 'Minute',
    stueck: 'Minuten',
  },
] as const;
const euro = (x: number) =>
  `${zahlText(runde10(x, 2)).replace(/,(\d)$/, (_, d: string) => `,${d}0`)} €`;

export interface TarifParameter {
  /** false: Kosten berechnen; true: zwei Tarife vergleichen (ab wann lohnt sich B?) */
  readonly vergleich: boolean;
}

/** „Grundgebühr 4 €, je km 2 €. Was kosten 12 km?“ / „Ab wie vielen km ist Tarif B günstiger?“ */
export const tarif: Generator<TarifParameter> = {
  id: 'fk.tarif',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: [
    'grundgebuehr-vergessen',
    'grundgebuehr-mal-menge',
    'gleichstand-statt-guenstiger',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.vergleich) {
      const t = r.pick(TARIFE);
      const g = r.pick(t.grund);
      const a = r.pick(t.preis);
      const menge = r.int(3, 40);
      const kosten = runde10(g + a * menge, 2);
      const richtig = zz(kosten);
      return {
        platzhalter: {
          aufgabe: de(
            `${t.was} kostet ${euro(g)} Grundgebühr und ${euro(a)} je ${t.einheit}. Was kosten ${menge} ${t.stueck} (in €)? Die Kosten sind ${geradeText(a, g)}.`,
          ),
        },
        loesung: richtig,
        loesungsweg: [de(`y = ${zahlText(a)} · ${menge} + ${zahlText(g)} = ${zahlText(kosten)}`)],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['grundgebuehr-vergessen', zz(a * menge)],
          ['grundgebuehr-mal-menge', zz((a + g) * menge)],
        ]),
      };
    }
    const t = r.pick(TARIFE.slice(0, 2));
    // A: höhere Grundgebühr, niedrigerer Preis; B: umgekehrt. Ab wann ist A günstiger?
    const aPreis = r.int(1, 4);
    const bPreis = aPreis + r.int(1, 3);
    const gleich = r.int(3, 15); // Gleichstand bei so vielen Einheiten
    const bGrund = r.int(0, 5);
    const aGrund = bGrund + (bPreis - aPreis) * gleich;
    const richtig = zahl(gleich + 1);
    return {
      platzhalter: {
        aufgabe: de(
          `Tarif A: ${euro(aGrund)} Grundgebühr und ${euro(aPreis)} je ${t.einheit}. Tarif B: ${euro(bGrund)} Grundgebühr und ${euro(bPreis)} je ${t.einheit}. Ab wie vielen ganzen ${t.stueck} ist Tarif A günstiger?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Gleich teuer: ${aGrund} + ${aPreis}·x = ${bGrund} + ${bPreis}·x, also x = ${gleich}.`),
        de(`Bei ${gleich} ${t.stueck} kosten beide gleich viel. Ab ${gleich + 1} ist A günstiger.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['gleichstand-statt-guenstiger', zahl(gleich)]]),
    };
  },
};

/** „Welche Gleichung beschreibt die Kosten?“ – Tarif mit Grundgebühr */
export const tarifGleichung: Generator<Record<string, never>> = {
  id: 'fk.tarif-gleichung',
  version: 1,
  platzhalter: ['tarif'],
  fehlerbildIds: ['m-n-vertauscht', 'ohne-grundgebuehr'],

  erzeuge(seed) {
    const r = rng(seed);
    const t = r.pick(TARIFE);
    const g = r.pick(t.grund);
    const a = r.pick(t.preis);
    const { optionen, index, richtig } = optionenAus(r, geradeText(a, g), [
      ['m-n-vertauscht', geradeText(g, a)],
      ['ohne-grundgebuehr', geradeText(a, 0)],
      ['ohne-grundgebuehr', geradeText(a + g, 0)],
    ]);
    return {
      platzhalter: {
        tarif: de(`${t.was} kostet ${euro(g)} Grundgebühr und ${euro(a)} je ${t.einheit}.`),
      },
      optionen: optionen.map(([, s]) => ({ text: de(s) })),
      loesung: richtig,
      loesungsweg: [
        de(
          `Der Preis je ${t.einheit} ist der Anstieg m = ${zahlText(a)}, die Grundgebühr ist n = ${zahlText(g)}.`,
        ),
        de(geradeText(a, g)),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['m-n-vertauscht', index('m-n-vertauscht')],
        ['ohne-grundgebuehr', index('ohne-grundgebuehr')],
      ]),
    };
  },
};
