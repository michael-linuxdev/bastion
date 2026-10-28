// Ähnlichkeit – Klasse 8 (LEHRPLAN §8d, Feld AE): zentrische Streckung (Bildstrecken,
// Streckfaktor, Bildpunkte), ähnliche Figuren erkennen und begründen, fehlende Längen,
// Schattenaufgaben, Flächen (k²) und Volumen (k³).
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, zahl } from '../../hilfen';
import { bild, koordinatensystem4, punkt } from '../../svg';
import { optionenAus } from '../terme/umformen';

const zz = (x: number) => zahl(runde10(x, 4));
const t = (x: number) => zahlText(runde10(x, 4));
const pkt = (x: number, y: number): Loesung => ({
  typ: 'punkt',
  wert: { x: runde10(x, 6) || 0, y: runde10(y, 6) || 0 },
});
const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);

// ---------------------------------------------------------------------------
// Zentrische Streckung (M.RF.AE.STRECKUNG)

export interface BildstreckeParameter {
  /** false: Bildstrecke aus k; true: Streckfaktor aus Original und Bild */
  readonly faktor_gesucht: boolean;
}

const FAKTOREN = [0.25, 0.5, 1.5, 2, 2.5, 3, 4] as const;

/** „Die Strecke AB = 6 cm wird mit k = 2,5 gestreckt. Wie lang ist A'B'?“ */
export const bildstrecke: Generator<BildstreckeParameter> = {
  id: 'ae.bildstrecke',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['geteilt-statt-mal', 'addiert', 'kehrwert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const k = r.pick(FAKTOREN);
    const a = 4 * r.int(1, 25); // durch 4 teilbar, damit k·a höchstens eine Stelle nach dem Komma hat
    const bildA = k * a;
    if (!p.faktor_gesucht) {
      const richtig = zz(bildA);
      return {
        platzhalter: {
          aufgabe: de(
            `Die Strecke AB ist ${a} cm lang. Sie wird zentrisch mit dem Streckfaktor k = ${t(k)} gestreckt. Wie lang ist die Bildstrecke A'B' (in cm)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`A'B' = k · AB = ${t(k)} · ${a} cm = ${t(bildA)} cm`),
          de(
            k > 1
              ? 'k > 1: Die Strecke wird länger (Vergrößerung).'
              : 'k < 1: Die Strecke wird kürzer (Verkleinerung).',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['geteilt-statt-mal', zz(a / k)],
          ['addiert', zz(a + k)],
        ]),
      };
    }
    const richtig = zz(k);
    return {
      platzhalter: {
        aufgabe: de(
          `Bei einer zentrischen Streckung wird aus der Strecke AB = ${a} cm die Bildstrecke A'B' = ${t(bildA)} cm. Wie groß ist der Streckfaktor k?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [de(`k = A'B' : AB = ${t(bildA)} : ${a} = ${t(k)}`)],
      fehlerbilder: fehlerbilderAus(richtig, [['kehrwert', zz(1 / k)]]),
    };
  },
};

export interface BildpunktParameter {
  /** false: Streckzentrum im Ursprung; true: Streckzentrum Z irgendwo im Gitter */
  readonly zentrum_frei: boolean;
}

/** „Strecke P von Z aus mit k = 2. Gib P' an.“ */
export const bildpunkt: Generator<BildpunktParameter> = {
  id: 'ae.bildpunkt',
  version: 1,
  platzhalter: ['zentrum', 'faktor'],
  fehlerbildIds: ['vom-ursprung', 'nur-verschoben', 'x-y-vertauscht'],

  erzeuge(seed, p) {
    const r = rng(seed);
    for (;;) {
      const k = r.pick([0.5, 2, 3] as const);
      const zx = p.zentrum_frei ? pm(r, 3) : 0;
      const zy = p.zentrum_frei ? pm(r, 3) : 0;
      const dx = k === 0.5 ? 2 * pm(r, 4) : pm(r, 4);
      const dy = k === 0.5 ? 2 * pm(r, 4) : pm(r, 4);
      const px = zx + dx;
      const py = zy + dy;
      const bx = zx + k * dx;
      const by = zy + k * dy;
      if ([px, py, bx, by].some((v) => Math.abs(v) > 8) || dx === dy) continue;
      const ks = koordinatensystem4(8);
      const richtig = pkt(bx, by);
      return {
        platzhalter: { zentrum: de(`Z(${zahlText(zx)}|${zahlText(zy)})`), faktor: de(zahlText(k)) },
        bild: bild(
          ks.breite,
          ks.hoehe,
          [...ks.teile, punkt(ks.px(zx), ks.py(zy), 'Z'), punkt(ks.px(px), ks.py(py), 'P')],
          de(
            `Ein Koordinatensystem mit dem Streckzentrum Z(${zahlText(zx)}|${zahlText(zy)}) und dem Punkt P(${zahlText(px)}|${zahlText(py)}).`,
          ),
        ),
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(`Von Z nach P: ${zahlText(dx)} nach rechts, ${zahlText(dy)} nach oben.`),
          de(`Mal ${zahlText(k)}: ${t(k * dx)} nach rechts, ${t(k * dy)} nach oben – von Z aus.`),
          de(`P'(${t(bx)}|${t(by)})`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['vom-ursprung', p.zentrum_frei ? pkt(k * px, k * py) : undefined],
          ['nur-verschoben', pkt(px + dx, py + dy)],
          ['x-y-vertauscht', pkt(by, bx)],
        ]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Ähnliche Figuren (M.RF.AE.AEHNLICH)

export interface AehnlichParameter {
  /** false: Rechtecke über Seitenverhältnisse; true: Dreiecke über Winkel (Hauptähnlichkeitssatz) */
  readonly winkel: boolean;
}

/** „Sind die beiden Rechtecke ähnlich?“ / „Sind die Dreiecke ähnlich?“ */
export const aehnlichPruefen: Generator<AehnlichParameter> = {
  id: 'ae.aehnlich-pruefen',
  version: 1,
  platzhalter: ['figuren'],
  fehlerbildIds: ['gleich-viel-dazu', 'verhaeltnis-uebersehen', 'dritter-winkel'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ja = r.int(0, 1) === 0;
    if (!p.winkel) {
      let a: number;
      let b: number;
      let c: number;
      let d: number;
      do {
        a = r.int(2, 9);
        b = r.int(2, 12);
        const k = r.pick([1.5, 2, 3, 0.5] as const);
        c = k * a;
        // nicht ähnlich: gleich viel dazu wie bei a (Differenz statt Faktor)
        d = ja ? k * b : b + (c - a);
      } while (a === b || d <= 0 || (!ja && d * a === c * b));
      const richtig = auswahl(ja ? 0 : 1);
      return {
        platzhalter: {
          figuren: de(`Rechteck 1: ${a} cm × ${b} cm. Rechteck 2: ${t(c)} cm × ${t(d)} cm.`),
        },
        optionen: [
          { text: de('Ja, sie sind ähnlich.') },
          { text: de('Nein, sie sind nicht ähnlich.') },
        ],
        loesung: richtig,
        loesungsweg: [
          de(
            `Verhältnisse der entsprechenden Seiten: ${t(c)} : ${a} = ${t(c / a)} und ${t(d)} : ${b} = ${t(d / b)}.`,
          ),
          de(
            ja
              ? 'Beide Verhältnisse sind gleich – die Rechtecke sind ähnlich.'
              : 'Die Verhältnisse sind verschieden – nicht ähnlich.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['gleich-viel-dazu', ja ? undefined : auswahl(0)],
          ['verhaeltnis-uebersehen', ja ? auswahl(1) : undefined],
        ]),
      };
    }
    const sortiert = (w: number[]) => [...w].sort((x, y) => x - y).join();
    let alpha: number;
    let beta: number;
    let gamma: number;
    let w1: number;
    let w2: number;
    let zweiterFall: boolean;
    do {
      alpha = 5 * r.int(6, 16);
      beta = 5 * r.int(6, 16);
      gamma = 180 - alpha - beta;
      // Dreieck 2: zwei Winkel angegeben; auf Wunsch ist einer davon der dritte Winkel
      zweiterFall = r.int(0, 1) === 0;
      w1 = zweiterFall ? alpha : gamma;
      w2 = ja ? beta : beta + 5 * pm(r, 3);
    } while (
      gamma < 20 ||
      180 - w1 - w2 < 10 ||
      (sortiert([alpha, beta, gamma]) === sortiert([w1, w2, 180 - w1 - w2])) !== ja
    );
    const richtig = auswahl(ja ? 0 : 1);
    return {
      platzhalter: {
        figuren: de(
          `Dreieck 1 hat die Winkel ${alpha}° und ${beta}°. Dreieck 2 hat die Winkel ${w1}° und ${w2}°.`,
        ),
      },
      optionen: [
        { text: de('Ja, sie sind ähnlich.') },
        { text: de('Nein, sie sind nicht ähnlich.') },
      ],
      loesung: richtig,
      loesungsweg: [
        de(`Dritter Winkel: Dreieck 1 ${gamma}°, Dreieck 2 ${180 - w1 - w2}°.`),
        de(
          ja
            ? 'Beide Dreiecke haben die gleichen Winkel – nach dem Hauptähnlichkeitssatz sind sie ähnlich.'
            : 'Die Winkel stimmen nicht überein – nicht ähnlich.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['dritter-winkel', ja && !zweiterFall ? auswahl(1) : undefined],
      ]),
    };
  },
};

/** „Welches Rechteck ist ähnlich zu 4 cm × 6 cm?“ */
export const aehnlichWaehlen: Generator<AehnlichParameter> = {
  id: 'ae.aehnlich-waehlen',
  version: 1,
  platzhalter: ['figur'],
  fehlerbildIds: ['gleich-viel-dazu', 'nur-eine-seite'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const dreieck = p.winkel;
    let seiten: number[];
    for (;;) {
      seiten = dreieck ? [r.int(3, 6), r.int(4, 8), r.int(5, 9)] : [r.int(2, 8), r.int(3, 10)];
      const [a = 0, b = 0, c = 0] = [...seiten].sort((x, y) => x - y);
      if (new Set(seiten).size === seiten.length && (!dreieck || a + b > c)) break;
    }
    const k = r.pick([2, 3, 1.5] as const);
    const name = dreieck ? 'Dreieck' : 'Rechteck';
    const text = (s: readonly number[]) =>
      `${s.map((x) => `${t(x)} cm`).join(dreieck ? ', ' : ' × ')}`;
    const plus = r.int(1, 4);
    const { optionen, index, richtig } = optionenAus(r, text(seiten.map((s) => k * s)), [
      ['gleich-viel-dazu', text(seiten.map((s) => s + plus))],
      ['nur-eine-seite', text(seiten.map((s, i) => (i === 0 ? k * s : s)))],
      [
        'nur-eine-seite',
        text(seiten.map((s, i) => (i === seiten.length - 1 ? s : k * s + (i === 0 ? 1 : 0)))),
      ],
    ]);
    return {
      platzhalter: { figur: de(`${name} mit den Seiten ${text(seiten)}`) },
      optionen: optionen.map(([, s]) => ({ text: de(`${name}: ${s}`) })),
      loesung: richtig,
      loesungsweg: [
        de('Ähnlich heißt: Alle Seiten sind mit demselben Faktor gestreckt.'),
        de(`Hier ist jede Seite ${t(k)}-mal so lang.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gleich-viel-dazu', index('gleich-viel-dazu')],
        ['nur-eine-seite', index('nur-eine-seite')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Mit Ähnlichkeit rechnen (M.RF.AE.BERECHNEN)

export interface FehlendeSeiteParameter {
  /** auch Streckfaktoren wie 4 → 6 (k = 1,5) und Verkleinerungen */
  readonly krumm: boolean;
}

/** „Dreieck ABC und A'B'C' sind ähnlich … Berechne b'.“ */
export const fehlendeSeite: Generator<FehlendeSeiteParameter> = {
  id: 'ae.fehlende-seite',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['differenz-addiert', 'kehrwert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const k = p.krumm ? r.pick([1.5, 2.5, 0.5, 0.75, 1.25] as const) : r.pick([2, 3, 4] as const);
    let a: number;
    let b: number;
    let c: number;
    for (;;) {
      a = 4 * r.int(1, 6);
      b = 4 * r.int(1, 8);
      c = 4 * r.int(1, 8);
      const [s1 = 0, s2 = 0, s3 = 0] = [a, b, c].sort((x, y) => x - y);
      if (a !== b && s1 + s2 > s3) break;
    }
    const richtig = zz(k * b);
    return {
      platzhalter: {
        aufgabe: de(
          `Die Dreiecke ABC und A'B'C' sind ähnlich. ABC hat die Seiten a = ${a} cm, b = ${b} cm und c = ${c} cm. Im Bilddreieck ist a' = ${t(k * a)} cm. Berechne b' in cm.`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Streckfaktor: k = a' : a = ${t(k * a)} : ${a} = ${t(k)}`),
        de(`b' = k · b = ${t(k)} · ${b} = ${t(k * b)} cm`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['differenz-addiert', zz(b + (k * a - a))],
        ['kehrwert', zz(b / k)],
      ]),
    };
  },
};

export interface StreckenFlaecheParameter {
  /** false: Höhe über die Schattenlänge; true: Flächeninhalt (k²) und Volumen (k³) */
  readonly potenz: boolean;
}

/** „Ein 2 m hoher Stab wirft 3 m Schatten, ein Baum 15 m. Wie hoch ist der Baum?“ */
export const schattenFlaeche: Generator<StreckenFlaecheParameter> = {
  id: 'ae.schatten-flaeche',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['kehrwert', 'nur-k', 'k-quadrat-statt-k-hoch-3'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.potenz) {
      const stab = r.pick([1, 1.5, 2] as const);
      const schatten = r.pick([0.5, 1, 1.5, 2, 2.5, 3] as const);
      const f = r.int(2, 12);
      const baumSchatten = schatten * f;
      const hoehe = stab * f;
      const was = r.pick(['ein Baum', 'ein Turm', 'ein Fahnenmast', 'eine Laterne'] as const);
      const richtig = zz(hoehe);
      return {
        platzhalter: {
          aufgabe: de(
            `Ein ${t(stab)} m hoher Stab wirft einen ${t(schatten)} m langen Schatten. Zur gleichen Zeit wirft ${was} einen ${t(baumSchatten)} m langen Schatten. Wie hoch ist ${was.replace(/^ein(e)? /, (m) => (m === 'eine ' ? 'die ' : 'der '))} (in m)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Die Dreiecke aus Höhe und Schatten sind ähnlich: Der Schatten ist ${t(f)}-mal so lang.`,
          ),
          de(`Höhe: ${t(stab)} m · ${t(f)} = ${t(hoehe)} m`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['kehrwert', zz((schatten * baumSchatten) / stab)],
        ]),
      };
    }
    const k = r.pick([2, 3, 4, 0.5] as const);
    const volumen = r.int(0, 1) === 0;
    const a = volumen ? 4 * r.int(1, 30) : 4 * r.int(1, 60);
    const faktor = volumen ? k ** 3 : k ** 2;
    const richtig = zz(a * faktor);
    return {
      platzhalter: {
        aufgabe: de(
          volumen
            ? `Ein Würfel hat das Volumen ${a} cm³. Alle Kanten werden mit k = ${t(k)} gestreckt. Wie groß ist das Volumen des neuen Würfels (in cm³)?`
            : `Eine Figur hat den Flächeninhalt ${a} cm². Sie wird zentrisch mit k = ${t(k)} gestreckt. Wie groß ist der Flächeninhalt der Bildfigur (in cm²)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(
          volumen
            ? 'Beim Strecken mit k wird das Volumen k³-mal so groß.'
            : 'Beim Strecken mit k wird der Flächeninhalt k²-mal so groß.',
        ),
        de(`${a} · ${t(k)}${volumen ? '³' : '²'} = ${a} · ${t(faktor)} = ${t(a * faktor)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-k', zz(a * k)],
        ['k-quadrat-statt-k-hoch-3', volumen ? zz(a * k * k) : undefined],
      ]),
    };
  },
};
