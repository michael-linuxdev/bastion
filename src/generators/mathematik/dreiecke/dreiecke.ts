// Dreiecke und Vierecke – Klasse 6 (LEHRPLAN §8b, Feld DV): Winkelsätze,
// Dreiecksarten, Dreiecksungleichung, Vierecke, Kongruenzsätze, besondere
// Linien. Rein und deterministisch.
import type { Bild, Generator, Option } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { aufKreis, bild, bogen, kreis, linie, text, vieleck } from '../../svg';

type P = readonly [number, number];
const JA_NEIN: Option[] = [{ text: de('Ja') }, { text: de('Nein') }];

/** Richtung von a nach b in Grad, mathematisch (0° = rechts, gegen den Uhrzeigersinn). */
const richtung = (a: P, b: P) => (Math.atan2(a[1] - b[1], b[0] - a[0]) * 180) / Math.PI;
const norm = (w: number) => ((w % 360) + 360) % 360;

/** Winkelbogen an der Ecke e zwischen den Strahlen nach a und nach b, mit Beschriftung. */
function winkelAn(e: P, a: P, b: P, name: string, radius = 26): string[] {
  let w1 = norm(richtung(e, a));
  let w2 = norm(richtung(e, b));
  if (norm(w2 - w1) > 180) [w1, w2] = [w2, w1];
  const [lx, ly] = aufKreis(e[0], e[1], radius + 16, w1 + norm(w2 - w1) / 2);
  return [bogen(e[0], e[1], radius, w1, w2), text(lx, ly + 5, name, 14)];
}

/** Dreieck mit Grundseite von A nach B (waagerecht) und den Winkeln α bei A, β bei B. */
function dreieckAusWinkeln(alpha: number, beta: number): { a: P; b: P; c: P } {
  const a: P = [30, 190];
  const b: P = [290, 190];
  const ta = Math.tan((alpha * Math.PI) / 180);
  const tb = Math.tan((beta * Math.PI) / 180);
  // C liegt auf beiden Strahlen: y-Abstand h, x = A + h/ta = B − h/tb
  const h = (b[0] - a[0]) / (1 / ta + 1 / tb);
  return { a, b, c: [a[0] + h / ta, a[1] - h] };
}

/** Skaliert ein Dreieck in den Bildbereich 300 × 210. */
function einpassen(punkte: readonly P[]): P[] {
  const xs = punkte.map((p) => p[0]);
  const ys = punkte.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const f = Math.min(260 / (x1 - x0 || 1), 170 / (y1 - y0 || 1));
  return punkte.map((p) => [20 + (p[0] - x0) * f, 20 + (p[1] - y0) * f] as P);
}

// ---------------------------------------------------------------------------
// Innenwinkelsatz (M.RF.DV.WINKELSAETZE.INNENWINKEL)

export interface InnenwinkelParameter {
  /** auch gleichschenklige Dreiecke (Basiswinkel) */
  readonly gleichschenklig: boolean;
}

/** „Berechne γ.“ – Vorlage M.RF.DV.WINKELSAETZE.INNENWINKEL */
export const innenwinkel: Generator<InnenwinkelParameter> = {
  id: 'dv.innenwinkel',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['summe-360', 'nur-addiert', 'basiswinkel-einmal'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const basis = p.gleichschenklig && r.int(0, 1) === 0;
    let alpha: number;
    let beta: number;
    if (basis) {
      alpha = r.int(6, 16) * 5; // 30° … 80°
      beta = alpha;
    } else {
      alpha = r.int(5, 20) * 5;
      beta = r.int(5, 20) * 5;
      if (alpha + beta >= 165) [alpha, beta] = [alpha - 30, beta - 30];
    }
    const gamma = 180 - alpha - beta;
    const { a, b, c } = dreieckAusWinkeln(alpha, beta);
    const teile = [
      vieleck([a, b, c]),
      ...winkelAn(a, b, c, basis ? `${alpha}°` : `α = ${alpha}°`, 30),
      ...(basis ? [] : winkelAn(b, c, a, `β = ${beta}°`, 30)),
      ...winkelAn(c, a, b, 'γ', 22),
      text(a[0] - 12, a[1] + 16, 'A', 14),
      text(b[0] + 12, b[1] + 16, 'B', 14),
      text(c[0], c[1] - 10, 'C', 14),
    ];
    const angabe = basis
      ? `Das Dreieck ist gleichschenklig mit der Basis AB. Der Winkel bei A ist ${alpha}° groß.`
      : `Im Dreieck ist α = ${alpha}° und β = ${beta}°.`;
    return {
      platzhalter: { angabe: de(angabe) },
      bild: bild(320, 210, teile, {
        de: basis
          ? `Ein gleichschenkliges Dreieck ABC mit der Basis AB. Bei A ist ein Winkel von ${alpha}° markiert, bei C der gesuchte Winkel γ.`
          : `Ein Dreieck ABC. Bei A ist α = ${alpha}°, bei B ist β = ${beta}° markiert, bei C der gesuchte Winkel γ.`,
      }),
      loesung: zahl(gamma),
      loesungsweg: basis
        ? [
            de(`Basiswinkel sind gleich groß: Auch bei B sind es ${alpha}°.`),
            de(`Innenwinkelsatz: γ = 180° − ${alpha}° − ${alpha}° = ${gamma}°`),
          ]
        : [
            de(`Die Innenwinkel eines Dreiecks ergeben zusammen 180°.`),
            de(`γ = 180° − ${alpha}° − ${beta}° = ${gamma}°`),
          ],
      fehlerbilder: fehlerbilderAus(zahl(gamma), [
        ['summe-360', zahl(360 - alpha - beta)],
        ['nur-addiert', zahl(alpha + beta)],
        ['basiswinkel-einmal', basis ? zahl(180 - alpha) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Winkel an geschnittenen Parallelen (M.RF.DV.WINKELSAETZE.PARALLELEN)

type Lage = 'stufen' | 'wechsel' | 'ergaenzung-oben' | 'ergaenzung-unten';

export interface ParallelenWinkelParameter {
  readonly lagen: readonly Lage[];
}

/** „g ∥ h. α = 65°. Berechne β.“ – Vorlage M.RF.DV.WINKELSAETZE.PARALLELEN */
export const parallelenWinkel: Generator<ParallelenWinkelParameter> = {
  id: 'dv.parallelen-winkel',
  version: 1,
  platzhalter: ['alpha'],
  fehlerbildIds: ['gleich-statt-ergaenzt', 'ergaenzt-statt-gleich'],

  erzeuge(seed, p) {
    verlange(p.lagen.length > 0, 'lagen fehlt');
    const r = rng(seed);
    const alpha = r.int(7, 16) * 5; // 35° … 80°
    const lage = r.pick(p.lagen);
    const s: P = [180, 70];
    const t = aufKreis(s[0], s[1], 90 / Math.sin((alpha * Math.PI) / 180), alpha + 180);
    const oben = aufKreis(s[0], s[1], 55, alpha);
    const unten = aufKreis(t[0], t[1], 55, alpha + 180);
    const teile = [
      linie(10, s[1], 310, s[1]),
      linie(10, t[1], 310, t[1]),
      linie(oben[0], oben[1], unten[0], unten[1]),
      text(300, s[1] - 8, 'g', 14),
      text(300, t[1] - 8, 'h', 14),
    ];
    const marke = (ort: P, von: number, bis: number, name: string, radius: number) => {
      const [lx, ly] = aufKreis(ort[0], ort[1], radius + 16, (von + bis) / 2);
      teile.push(bogen(ort[0], ort[1], radius, von, bis), text(lx, ly + 5, name, 15));
    };
    marke(s, 180, 180 + alpha, 'α', 24);
    const ort: Record<Lage, [number, number]> = {
      stufen: [180, 180 + alpha],
      wechsel: [0, alpha],
      'ergaenzung-oben': [alpha, 180],
      'ergaenzung-unten': [180 + alpha, 360],
    };
    const [von, bis] = ort[lage];
    marke(t as P, von, bis, 'β', 20);
    const gleich = lage === 'stufen' || lage === 'wechsel';
    const beta = gleich ? alpha : 180 - alpha;
    const weg: Record<Lage, string[]> = {
      stufen: [
        `β und α sind Stufenwinkel an den Parallelen g und h.`,
        `Stufenwinkel sind gleich groß: β = ${alpha}°`,
      ],
      wechsel: [
        `β und α sind Wechselwinkel an den Parallelen g und h.`,
        `Wechselwinkel sind gleich groß: β = ${alpha}°`,
      ],
      'ergaenzung-oben': [
        `Der Stufenwinkel zu α bei h liegt links unten neben β und ist ${alpha}° groß.`,
        `β ist sein Nebenwinkel: β = 180° − ${alpha}° = ${beta}°`,
      ],
      'ergaenzung-unten': [
        `Der Wechselwinkel zu α bei h liegt rechts oben neben β und ist ${alpha}° groß.`,
        `β ist sein Nebenwinkel: β = 180° − ${alpha}° = ${beta}°`,
      ],
    };
    return {
      platzhalter: { alpha },
      bild: bild(320, 210, teile, {
        de: `Zwei parallele Geraden g und h werden von einer dritten Geraden geschnitten. α liegt am Schnittpunkt mit g links unten, β am Schnittpunkt mit h ${{ stufen: 'links unten', wechsel: 'rechts oben', 'ergaenzung-oben': 'links oben', 'ergaenzung-unten': 'rechts unten' }[lage]}.`,
      }),
      loesung: zahl(beta),
      loesungsweg: weg[lage].map((w) => de(w)),
      fehlerbilder: fehlerbilderAus(zahl(beta), [
        ['gleich-statt-ergaenzt', gleich ? undefined : zahl(alpha)],
        ['ergaenzt-statt-gleich', gleich ? zahl(180 - alpha) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Dreiecksarten (M.RF.DV.DREIECKE.ART)

const SEITEN_ARTEN: Option[] = [
  { text: de('gleichseitig') },
  { text: de('gleichschenklig, aber nicht gleichseitig') },
  { text: de('unregelmäßig – keine zwei Seiten gleich lang') },
];
const WINKEL_ARTEN: Option[] = [
  { text: de('spitzwinklig') },
  { text: de('rechtwinklig') },
  { text: de('stumpfwinklig') },
];

export interface DreiecksartParameter {
  /** Winkelangaben: zwei Winkel gegeben, der dritte muss berechnet werden */
  readonly dritter_winkel: boolean;
}

/** „Ein Dreieck hat die Seiten 5 cm, 5 cm und 7 cm …“ – Vorlage M.RF.DV.DREIECKE.ART */
export const dreiecksart: Generator<DreiecksartParameter> = {
  id: 'dv.dreiecksart',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['gleichseitig-uebersehen', 'groesster-winkel-uebersehen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (r.int(0, 1) === 0) {
      const art = r.int(0, 2);
      let a = r.int(3, 9);
      let b = a;
      let c = a;
      // gleichschenklig: dritte Seite verschieden und kürzer als beide Schenkel zusammen
      if (art === 1) c = Math.min(2 * a - 1, Math.max(2, a + r.pick([-2, -1, 1, 2, 3])));
      if (art === 2) {
        a = r.int(3, 7);
        b = a + r.int(1, 3);
        c = b + r.int(1, a - 1);
      }
      const seiten = mische(r, [a, b, c]);
      const richtig = auswahl(art);
      return {
        platzhalter: { angabe: de(`Ein Dreieck hat die Seitenlängen ${seiten.join(' cm, ')} cm.`) },
        optionen: SEITEN_ARTEN,
        loesung: richtig,
        loesungsweg: [
          de(
            art === 0
              ? 'Alle drei Seiten sind gleich lang – gleichseitig.'
              : art === 1
                ? 'Genau zwei Seiten sind gleich lang – gleichschenklig.'
                : 'Alle drei Seiten sind verschieden lang – unregelmäßig.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['gleichseitig-uebersehen', art === 0 ? auswahl(1) : undefined],
        ]),
      };
    }
    const art = r.int(0, 2);
    let gross: number;
    let klein: number;
    let dritter: number;
    do {
      gross = art === 0 ? r.int(13, 17) * 5 : art === 1 ? 90 : r.int(19, 28) * 5;
      klein = r.int(2, Math.floor((175 - gross) / 5)) * 5;
      dritter = 180 - gross - klein;
    } while (dritter < 10 || dritter > gross || klein > gross || (art === 0 && dritter >= 90));
    const winkel = mische(r, [gross, klein, dritter]);
    const angabe = p.dritter_winkel
      ? `In einem Dreieck sind zwei Winkel ${winkel[0]}° und ${winkel[1]}° groß.`
      : `Ein Dreieck hat die Winkel ${winkel[0]}°, ${winkel[1]}° und ${winkel[2]}°.`;
    const richtig = auswahl(art);
    const ersteZwei = Math.max(winkel[0] ?? 0, winkel[1] ?? 0);
    return {
      platzhalter: { angabe: de(angabe) },
      optionen: WINKEL_ARTEN,
      loesung: richtig,
      loesungsweg: [
        ...(p.dritter_winkel
          ? [de(`Dritter Winkel: 180° − ${winkel[0]}° − ${winkel[1]}° = ${winkel[2]}°`)]
          : []),
        de(
          `Der größte Winkel ist ${gross}° – ${art === 0 ? 'kleiner als 90°: spitzwinklig' : art === 1 ? 'genau 90°: rechtwinklig' : 'größer als 90°: stumpfwinklig'}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'groesster-winkel-uebersehen',
          art !== 0 && p.dritter_winkel && ersteZwei < 90 ? auswahl(0) : undefined,
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Dreiecksungleichung (M.RF.DV.DREIECKE.GIBT-ES)

export interface DreiecksungleichungParameter {
  /** auch Grenzfälle a + b = c */
  readonly grenzfall: boolean;
}

/** „Gibt es ein Dreieck mit den Seiten 3 cm, 4 cm und 8 cm?“ – Vorlage M.RF.DV.DREIECKE.GIBT-ES */
export const dreiecksungleichung: Generator<DreiecksungleichungParameter> = {
  id: 'dv.dreiecksungleichung',
  version: 1,
  platzhalter: ['a', 'b', 'c'],
  fehlerbildIds: ['gleichheit-reicht', 'nur-zwei-verglichen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const x = r.int(2, 9);
    const y = r.int(2, 9);
    const fall = r.int(0, p.grenzfall ? 2 : 1); // 0 gibt es, 1 zu lang, 2 genau gleich
    const z =
      fall === 0 ? r.int(Math.abs(x - y) + 1, x + y - 1) : fall === 1 ? x + y + r.int(1, 4) : x + y;
    const [a, b, c] = mische(r, [x, y, z]);
    const gibt = fall === 0;
    const richtig = auswahl(gibt ? 0 : 1);
    const lang = Math.max(x, y, z);
    const rest = x + y + z - lang;
    return {
      platzhalter: { a: a ?? x, b: b ?? y, c: c ?? z },
      optionen: JA_NEIN,
      loesung: richtig,
      loesungsweg: [
        de(`Die beiden kürzeren Seiten zusammen: ${rest} cm. Die längste Seite: ${lang} cm.`),
        de(
          gibt
            ? `${rest} > ${lang} – die kurzen Seiten reichen, es gibt das Dreieck.`
            : rest === lang
              ? `${rest} = ${lang} – die Seiten liegen flach aufeinander, es gibt kein Dreieck.`
              : `${rest} < ${lang} – die kurzen Seiten reichen nicht, es gibt kein Dreieck.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gleichheit-reicht', fall === 2 ? auswahl(0) : undefined],
        // wer nur die ersten beiden Seiten mit der dritten vergleicht, liegt falsch, wenn die längste vorne steht
        ['nur-zwei-verglichen', !gibt && (a ?? 0) + (b ?? 0) > (c ?? 0) ? auswahl(0) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Besondere Vierecke (M.RF.DV.VIERECKE)

const VIERECKE = [
  'Quadrat',
  'Rechteck',
  'Raute',
  'Parallelogramm',
  'Trapez',
  'Drachenviereck',
] as const;
type Viereck = (typeof VIERECKE)[number];

/** Ist jedes X auch ein Y? (Haus der Vierecke) */
const OBER: Record<Viereck, readonly Viereck[]> = {
  Quadrat: ['Quadrat', 'Rechteck', 'Raute', 'Parallelogramm', 'Trapez', 'Drachenviereck'],
  Rechteck: ['Rechteck', 'Parallelogramm', 'Trapez'],
  Raute: ['Raute', 'Parallelogramm', 'Trapez', 'Drachenviereck'],
  Parallelogramm: ['Parallelogramm', 'Trapez'],
  Trapez: ['Trapez'],
  Drachenviereck: ['Drachenviereck'],
};

const BESCHREIBUNG: Record<Viereck, readonly [string, string]> = {
  Quadrat: [
    'Alle vier Seiten sind gleich lang, und alle Winkel sind rechte Winkel.',
    'Die Diagonalen sind gleich lang, halbieren sich und stehen senkrecht aufeinander.',
  ],
  Rechteck: [
    'Alle Winkel sind rechte Winkel, aber nicht alle Seiten sind gleich lang.',
    'Die Diagonalen sind gleich lang und halbieren sich, stehen aber nicht senkrecht aufeinander.',
  ],
  Raute: [
    'Alle vier Seiten sind gleich lang, aber die Winkel sind keine rechten Winkel.',
    'Die Diagonalen halbieren sich und stehen senkrecht aufeinander, sind aber nicht gleich lang.',
  ],
  Parallelogramm: [
    'Gegenüberliegende Seiten sind parallel und gleich lang, aber es gibt keine rechten Winkel und nicht alle Seiten sind gleich lang.',
    'Die Diagonalen halbieren sich, sind aber weder gleich lang noch senkrecht zueinander.',
  ],
  Trapez: [
    'Nur zwei gegenüberliegende Seiten sind parallel.',
    'Genau ein Paar gegenüberliegender Seiten ist parallel; die Diagonalen halbieren sich nicht.',
  ],
  Drachenviereck: [
    'Es gibt zwei Paare benachbarter Seiten, die gleich lang sind, aber nicht alle vier Seiten sind gleich lang.',
    'Eine Diagonale halbiert die andere senkrecht, aber nicht umgekehrt.',
  ],
};

export interface ViereckNameParameter {
  /** Beschreibung über die Diagonalen statt über Seiten und Winkel */
  readonly diagonalen: boolean;
}

/** „Welches Viereck ist das?“ – Vorlage M.RF.DV.VIERECKE.ERKENNEN */
export const viereckName: Generator<ViereckNameParameter> = {
  id: 'dv.viereck-name',
  version: 1,
  platzhalter: ['beschreibung'],
  fehlerbildIds: ['raute-quadrat', 'rechteck-quadrat', 'parallelogramm-trapez'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const v = r.pick(VIERECKE);
    const richtig = auswahl(VIERECKE.indexOf(v));
    const i = (x: Viereck) => auswahl(VIERECKE.indexOf(x));
    return {
      platzhalter: { beschreibung: de(BESCHREIBUNG[v][p.diagonalen ? 1 : 0]) },
      optionen: VIERECKE.map((x) => ({ text: de(x) })),
      loesung: richtig,
      loesungsweg: [de(`Diese Eigenschaften hat nur: ${v}.`)],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['raute-quadrat', v === 'Raute' ? i('Quadrat') : undefined],
        ['rechteck-quadrat', v === 'Rechteck' ? i('Quadrat') : undefined],
        ['parallelogramm-trapez', v === 'Trapez' ? i('Parallelogramm') : undefined],
      ]),
    };
  },
};

export interface ViereckAussageParameter {
  /** auch Aussagen mit Raute und Drachenviereck */
  readonly alle: boolean;
}

/** „Stimmt das: Jedes Rechteck ist ein Parallelogramm?“ – Vorlage M.RF.DV.VIERECKE.HAUS */
export const viereckAussage: Generator<ViereckAussageParameter> = {
  id: 'dv.viereck-aussage',
  version: 1,
  platzhalter: ['x', 'y'],
  fehlerbildIds: ['richtung-verdreht'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const auswahlListe: readonly Viereck[] = p.alle
      ? VIERECKE
      : ['Quadrat', 'Rechteck', 'Parallelogramm', 'Trapez'];
    let x: Viereck;
    let y: Viereck;
    do {
      x = r.pick(auswahlListe);
      y = r.pick(auswahlListe);
    } while (x === y);
    const wahr = OBER[x].includes(y);
    const umgekehrt = OBER[y].includes(x);
    const richtig = auswahl(wahr ? 0 : 1);
    const artikel = (v: Viereck) => (v === 'Raute' ? 'jede' : 'jedes');
    const ein = (v: Viereck) => (v === 'Raute' ? 'eine' : 'ein');
    return {
      platzhalter: { x: de(`${artikel(x).replace(/^j/, 'J')} ${x}`), y: de(`${ein(y)} ${y}`) },
      optionen: JA_NEIN,
      loesung: richtig,
      loesungsweg: [
        de(
          wahr
            ? `${ein(x).replace(/^e/, 'E')} ${x} hat alle Eigenschaften, die ${ein(y)} ${y} braucht – die Aussage stimmt.`
            : `Nicht ${artikel(x)} ${x} hat alle Eigenschaften, die ${ein(y)} ${y} braucht – die Aussage stimmt nicht.`,
        ),
        ...(umgekehrt && !wahr
          ? [de(`Umgekehrt stimmt es: ${artikel(y).replace(/^j/, 'J')} ${y} ist ${ein(x)} ${x}.`)]
          : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['richtung-verdreht', umgekehrt && !wahr ? auswahl(0) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Kongruenzsätze (M.RF.DV.KONSTRUIEREN.KONGRUENZSATZ)

const SAETZE_G: Option[] = [{ text: de('sss') }, { text: de('sws') }, { text: de('wsw') }];
const SAETZE_M: Option[] = [
  ...SAETZE_G,
  { text: de('SsW') },
  { text: de('nicht eindeutig konstruierbar') },
];

export interface KongruenzsatzParameter {
  /** auch SsW und nicht eindeutige Fälle */
  readonly ssw: boolean;
}

/** „Gegeben: a = 5 cm, b = 4 cm, γ = 50°. Welcher Kongruenzsatz?“ */
export const kongruenzsatz: Generator<KongruenzsatzParameter> = {
  id: 'dv.kongruenzsatz',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['winkel-nicht-eingeschlossen', 'ssw-kuerzere-seite'],

  erzeuge(seed, p) {
    const r = rng(seed);
    // Seiten a, b, c liegen gegenüber von α, β, γ
    const fall = r.int(0, p.ssw ? 4 : 2); // 0 sss, 1 sws, 2 wsw, 3 SsW, 4 nicht eindeutig
    const [s1, s2] = [r.int(3, 9), r.int(3, 9)];
    const lang = Math.max(s1, s2) === Math.min(s1, s2) ? Math.max(s1, s2) + 1 : Math.max(s1, s2);
    const kurz = Math.min(s1, s2);
    const w = r.int(5, 14) * 5;
    const w2 = r.int(5, 14) * 5;
    // Winkel gegenüber der kürzeren Seite so klein, dass es zwei Dreiecke gibt (kurz > lang · sin α)
    const grenze = (Math.asin(kurz / lang) * 180) / Math.PI;
    const zweiLoesungen = Math.max(10, Math.floor((grenze - 1) / 5) * 5);
    const angaben: string[][] = [
      [`a = ${s1} cm`, `b = ${s2} cm`, `c = ${Math.min(s1 + s2 - 1, Math.max(s1, s2) + 2)} cm`],
      [`a = ${s1} cm`, `b = ${s2} cm`, `γ = ${w}°`],
      [`c = ${s1} cm`, `α = ${w}°`, `β = ${w2}°`],
      // SsW: zwei Seiten und der Winkel gegenüber der längeren
      [`a = ${lang} cm`, `b = ${kurz} cm`, `α = ${w}°`],
      // nicht eindeutig: Winkel gegenüber der kürzeren Seite
      [`a = ${kurz} cm`, `b = ${lang} cm`, `α = ${zweiLoesungen}°`],
    ];
    const angabe = mische(r, angaben[fall] ?? []);
    const richtig = auswahl(fall);
    const weg = [
      'Drei Seiten gegeben – Kongruenzsatz sss.',
      'Zwei Seiten und der Winkel, den sie einschließen (γ liegt zwischen a und b) – Kongruenzsatz sws.',
      'Eine Seite und die beiden Winkel an ihren Enden (α und β liegen an c) – Kongruenzsatz wsw.',
      'Zwei Seiten und der Winkel gegenüber der längeren Seite – Kongruenzsatz SsW.',
      'Zwei Seiten und der Winkel gegenüber der kürzeren Seite – das Dreieck ist nicht eindeutig konstruierbar.',
    ];
    return {
      platzhalter: { angabe: de(angabe.join(', ')) },
      optionen: p.ssw ? SAETZE_M : SAETZE_G,
      loesung: richtig,
      loesungsweg: [de(weg[fall] ?? '')],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['winkel-nicht-eingeschlossen', fall === 3 || fall === 4 ? auswahl(1) : undefined],
        ['ssw-kuerzere-seite', fall === 4 ? auswahl(3) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Konstruktionsschritte (M.RF.DV.KONSTRUIEREN.SCHRITT)

const SCHRITTE: Record<'sss' | 'sws' | 'wsw', readonly string[]> = {
  sss: [
    'Zeichne die Seite c = AB.',
    'Zeichne einen Kreisbogen um A mit dem Radius b.',
    'Zeichne einen Kreisbogen um B mit dem Radius a.',
    'Der Schnittpunkt der Kreisbögen ist C. Verbinde C mit A und B.',
  ],
  sws: [
    'Zeichne die Seite b = AC.',
    'Trage in C den Winkel γ an AC an.',
    'Trage auf dem freien Schenkel von C aus die Länge a ab. Dort liegt B.',
    'Verbinde B mit A.',
  ],
  wsw: [
    'Zeichne die Seite c = AB.',
    'Trage in A den Winkel α an AB an.',
    'Trage in B den Winkel β an AB an.',
    'Der Schnittpunkt der freien Schenkel ist C.',
  ],
};

export interface KonstruktionSchrittParameter {
  readonly saetze: readonly ('sss' | 'sws' | 'wsw')[];
}

/** „Was ist der nächste Schritt?“ – Vorlage M.RF.DV.KONSTRUIEREN.SCHRITT */
export const konstruktionSchritt: Generator<KonstruktionSchrittParameter> = {
  id: 'dv.konstruktion-schritt',
  version: 1,
  platzhalter: ['satz', 'bisher'],
  fehlerbildIds: ['schritt-uebersprungen'],

  erzeuge(seed, p) {
    verlange(p.saetze.length > 0, 'saetze fehlt');
    const r = rng(seed);
    const satz = r.pick(p.saetze);
    const schritte = SCHRITTE[satz];
    const k = r.int(1, schritte.length - 1); // so viele Schritte sind schon getan
    const naechster = schritte[k] ?? '';
    const spaeter = schritte.slice(k + 1);
    const frueher = schritte.slice(0, k);
    const fremd = Object.values(SCHRITTE)
      .flat()
      .filter((s) => !schritte.includes(s));
    const optionen = mische(
      r,
      [naechster, ...spaeter, ...mische(r, fremd)].slice(0, 3).concat(frueher.slice(-1)),
    );
    const eindeutig = [...new Set(optionen)];
    const richtig = auswahl(eindeutig.indexOf(naechster));
    const vorgegriffen = spaeter.map((s) => eindeutig.indexOf(s)).find((i) => i >= 0);
    const gegeben: Record<typeof satz, string> = {
      sss: 'a, b und c',
      sws: 'a, b und γ',
      wsw: 'c, α und β',
    };
    return {
      platzhalter: {
        satz: de(`Du konstruierst ein Dreieck aus ${gegeben[satz]}.`),
        bisher: de(frueher.map((s, i) => `${i + 1}. ${s}`).join(' ')),
      },
      optionen: eindeutig.map((t) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: schritte.map((s, i) => de(`${i + 1}. ${s}`)),
      fehlerbilder: fehlerbilderAus(richtig, [
        ['schritt-uebersprungen', vorgegriffen !== undefined ? auswahl(vorgegriffen) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Besondere Linien im Dreieck (M.RF.DV.BESONDERE-LINIEN)

const LINIEN = ['Höhe', 'Seitenhalbierende', 'Winkelhalbierende', 'Mittelsenkrechte'] as const;
type Linie = (typeof LINIEN)[number];

function linienBild(art: Linie, r: ReturnType<typeof rng>): Bild {
  // spitzwinkliges Dreieck mit Grundseite AB
  const [a, b, c] = einpassen([
    [0, 100],
    [100 + r.int(0, 30), 100],
    [35 + r.int(0, 30), 100 - 70 - r.int(0, 20)],
  ]);
  const A = a as P;
  const B = b as P;
  const C = c as P;
  const teile = [
    vieleck([A, B, C]),
    text(A[0] - 10, A[1] + 14, 'A', 13),
    text(B[0] + 10, B[1] + 14, 'B', 13),
    text(C[0], C[1] - 8, 'C', 13),
  ];
  const mitte: P = [(A[0] + B[0]) / 2, A[1]];
  const strich = (x: number, y: number) => linie(x - 4, y - 6, x + 4, y + 6, 1.5);
  const gestrichelt = (p: P, q: P) =>
    `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke-width="2.5" stroke-dasharray="6 3"/>`;
  if (art === 'Höhe') {
    const fuss: P = [C[0], A[1]];
    teile.push(
      gestrichelt(C, fuss),
      vieleck([
        [fuss[0], fuss[1]],
        [fuss[0] + 10, fuss[1]],
        [fuss[0] + 10, fuss[1] - 10],
        [fuss[0], fuss[1] - 10],
      ]),
      kreis(fuss[0] + 5, fuss[1] - 5, 1.6, true),
    );
  } else if (art === 'Seitenhalbierende') {
    teile.push(
      gestrichelt(C, mitte),
      strich((A[0] + mitte[0]) / 2, A[1]),
      strich((B[0] + mitte[0]) / 2, A[1]),
    );
  } else if (art === 'Mittelsenkrechte') {
    teile.push(
      gestrichelt([mitte[0], A[1] + 15], [mitte[0], C[1] - 5]),
      strich((A[0] + mitte[0]) / 2, A[1]),
      strich((B[0] + mitte[0]) / 2, A[1]),
      vieleck([
        [mitte[0], mitte[1]],
        [mitte[0] + 10, mitte[1]],
        [mitte[0] + 10, mitte[1] - 10],
        [mitte[0], mitte[1] - 10],
      ]),
    );
  } else {
    // Winkelhalbierende bei C: Mitte zwischen den Richtungen nach A und nach B
    let wa = norm(richtung(C, A));
    let wb = norm(richtung(C, B));
    if (norm(wb - wa) > 180) [wa, wb] = [wb, wa];
    const halb = wa + norm(wb - wa) / 2;
    const h = (halb * Math.PI) / 180;
    const t = (A[1] - C[1]) / -Math.sin(h);
    const ende: P = [C[0] + t * Math.cos(h), A[1]];
    teile.push(
      gestrichelt(C, ende),
      bogen(C[0], C[1], 24, wa, halb),
      bogen(C[0], C[1], 30, halb, wa + norm(wb - wa)),
    );
  }
  return bild(300, 230, teile, {
    de: `Ein Dreieck ABC mit einer gestrichelten Linie: ${art === 'Höhe' ? 'Sie geht von C senkrecht auf die Seite AB (rechter Winkel markiert).' : art === 'Seitenhalbierende' ? 'Sie geht von C zur Mitte der Seite AB (beide Hälften markiert).' : art === 'Mittelsenkrechte' ? 'Sie steht in der Mitte von AB senkrecht auf AB (Hälften und rechter Winkel markiert).' : 'Sie geht von C aus und teilt den Winkel bei C in zwei gleich große Winkel.'}`,
  });
}

export interface LinieErkennenParameter {
  readonly linien: readonly Linie[];
}

/** „Welche besondere Linie ist gestrichelt gezeichnet?“ – Vorlage M.RF.DV.BESONDERE-LINIEN.ERKENNEN */
export const linieErkennen: Generator<LinieErkennenParameter> = {
  id: 'dv.linie-erkennen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['hoehe-seitenhalbierende', 'mittelsenkrechte-hoehe'],

  erzeuge(seed, p) {
    verlange(
      p.linien.length >= 2 && p.linien.every((l) => LINIEN.includes(l)),
      'linien: mindestens zwei',
    );
    const r = rng(seed);
    const art = r.pick(p.linien);
    const optionen = p.linien.map((l) => ({ text: de(l) }));
    const i = (l: Linie) => {
      const k = p.linien.indexOf(l);
      return k < 0 ? undefined : auswahl(k);
    };
    const richtig = auswahl(p.linien.indexOf(art));
    const weg: Record<Linie, string> = {
      Höhe: 'Die Linie geht von einer Ecke senkrecht auf die gegenüberliegende Seite – das ist eine Höhe.',
      Seitenhalbierende:
        'Die Linie verbindet eine Ecke mit der Mitte der gegenüberliegenden Seite – das ist eine Seitenhalbierende.',
      Winkelhalbierende:
        'Die Linie teilt einen Winkel in zwei gleich große Teile – das ist eine Winkelhalbierende.',
      Mittelsenkrechte:
        'Die Linie steht in der Mitte einer Seite senkrecht auf ihr – das ist eine Mittelsenkrechte.',
    };
    return {
      platzhalter: {},
      bild: linienBild(art, r),
      optionen,
      loesung: richtig,
      loesungsweg: [de(weg[art])],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'hoehe-seitenhalbierende',
          art === 'Höhe'
            ? i('Seitenhalbierende')
            : art === 'Seitenhalbierende'
              ? i('Höhe')
              : undefined,
        ],
        ['mittelsenkrechte-hoehe', art === 'Mittelsenkrechte' ? i('Höhe') : undefined],
      ]),
    };
  },
};

const SCHNITTPUNKT: Record<Linie, string> = {
  Mittelsenkrechte: 'Mittelpunkt des Umkreises',
  Winkelhalbierende: 'Mittelpunkt des Inkreises',
  Seitenhalbierende: 'Schwerpunkt',
  Höhe: 'Höhenschnittpunkt',
};

export interface SchnittpunktParameter {
  readonly linien: readonly Linie[];
}

/** „Wo schneiden sich die drei Mittelsenkrechten?“ – Vorlage M.RF.DV.BESONDERE-LINIEN.SCHNITTPUNKT */
export const schnittpunkt: Generator<SchnittpunktParameter> = {
  id: 'dv.schnittpunkt',
  version: 1,
  platzhalter: ['linie'],
  fehlerbildIds: ['um-in-verwechselt'],

  erzeuge(seed, p) {
    verlange(
      p.linien.length >= 2 && p.linien.every((l) => LINIEN.includes(l)),
      'linien: mindestens zwei',
    );
    const r = rng(seed);
    const art = r.pick(p.linien);
    const optionen = p.linien.map((l) => ({ text: de(SCHNITTPUNKT[l]) }));
    const richtig = auswahl(p.linien.indexOf(art));
    const andere =
      art === 'Mittelsenkrechte'
        ? 'Winkelhalbierende'
        : art === 'Winkelhalbierende'
          ? 'Mittelsenkrechte'
          : undefined;
    const k = andere ? p.linien.indexOf(andere) : -1;
    const mehrzahl: Record<Linie, string> = {
      Mittelsenkrechte: 'die drei Mittelsenkrechten',
      Winkelhalbierende: 'die drei Winkelhalbierenden',
      Seitenhalbierende: 'die drei Seitenhalbierenden',
      Höhe: 'die drei Höhen',
    };
    return {
      platzhalter: { linie: de(mehrzahl[art]) },
      optionen,
      loesung: richtig,
      loesungsweg: [
        de(`${mehrzahl[art].replace(/^d/, 'D')} schneiden sich im ${SCHNITTPUNKT[art]}.`),
        ...(art === 'Mittelsenkrechte'
          ? [
              de(
                'Er ist von allen drei Ecken gleich weit entfernt – der Umkreis geht durch alle Ecken.',
              ),
            ]
          : []),
        ...(art === 'Winkelhalbierende'
          ? [
              de(
                'Er ist von allen drei Seiten gleich weit entfernt – der Inkreis berührt alle Seiten.',
              ),
            ]
          : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['um-in-verwechselt', k >= 0 ? auswahl(k) : undefined],
      ]),
    };
  },
};
