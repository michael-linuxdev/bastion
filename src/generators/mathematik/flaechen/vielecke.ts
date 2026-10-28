// Flächeninhalt von Dreiecken und Vierecken – Klasse 6 (LEHRPLAN §8b, Feld FL).
// Alle Maße ganzzahlig in cm; Bilder maßstäblich, aber ohne Messen lösbar.
import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';
import { bild, linie, text, vieleck } from '../../svg';

type P = readonly [number, number];

const gestrichelt = (a: P, b: P) =>
  `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-width="1.5" stroke-dasharray="5 3"/>`;
const rechterWinkel = (x: number, y: number, dx: number, dy: number) =>
  vieleck([
    [x, y],
    [x + dx, y],
    [x + dx, y + dy],
    [x, y + dy],
  ]);
const masstab = (breite: number, hoehe: number) => Math.min(240 / breite, 150 / hoehe);

// ---------------------------------------------------------------------------
// Dreieck (M.GM.FL.DREIECK.FLAECHE)

export interface DreieckFlaecheParameter {
  readonly max: number; // 6 … 20
  /** stumpfwinklig mit Höhe außerhalb und einer zusätzlichen Seitenangabe */
  readonly stumpf: boolean;
}

/** „Berechne den Flächeninhalt des Dreiecks.“ – Vorlage M.GM.FL.DREIECK.FLAECHE */
export const dreieckFlaeche: Generator<DreieckFlaecheParameter> = {
  id: 'fl.dreieck-flaeche',
  version: 1,
  platzhalter: ['g', 'h'],
  fehlerbildIds: ['nicht-halbiert', 'seite-statt-hoehe'],

  erzeuge(seed, p) {
    verlange(p.max >= 6 && p.max <= 20, 'max: 6 … 20');
    const r = rng(seed);
    let g: number;
    let h: number;
    do {
      g = r.int(3, p.max);
      h = r.int(2, p.max);
    } while ((g * h) % 2 !== 0);
    const f = masstab(g * (p.stumpf ? 1.6 : 1), h);
    const A: P = [30, 30 + h * f];
    const B: P = [30 + g * f, A[1]];
    // Spitze C: über der Grundseite (spitz) oder rechts daneben (stumpf)
    const cx = p.stumpf ? B[0] + g * f * r.int(2, 5) * 0.1 : A[0] + g * f * r.int(3, 7) * 0.1;
    const C: P = [cx, 30];
    const fuss: P = [cx, A[1]];
    // zusätzliche Seite BC (nur stumpf): ganzzahlig gerundet, länger als h
    const s = Math.round(Math.hypot((C[0] - B[0]) / f, h));
    const teile = [
      vieleck([A, B, C]),
      gestrichelt(C, fuss),
      ...(p.stumpf ? [gestrichelt(B, fuss)] : []),
      rechterWinkel(fuss[0], fuss[1], fuss[0] > B[0] - 1 ? -10 : 10, -10),
      text((A[0] + B[0]) / 2, A[1] + 18, `g = ${g} cm`, 13),
      text(cx + 30, (C[1] + fuss[1]) / 2, `h = ${h} cm`, 13),
      ...(p.stumpf ? [text((B[0] + C[0]) / 2 - 34, (B[1] + C[1]) / 2, `${s} cm`, 13)] : []),
    ];
    const flaeche = (g * h) / 2;
    return {
      platzhalter: { g, h },
      bild: bild(320, A[1] + 30, teile, {
        de: `Ein Dreieck mit der Grundseite g = ${g} cm und der zugehörigen Höhe h = ${h} cm${p.stumpf ? `; die Höhe liegt außerhalb, eine schräge Seite ist ${s} cm lang` : ''}.`,
      }),
      loesung: zahl(flaeche),
      loesungsweg: [
        de(`A = g · h : 2`),
        de(`A = ${g} cm · ${h} cm : 2 = ${zahlDeutsch(flaeche)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(flaeche), [
        ['nicht-halbiert', zahl(g * h)],
        ['seite-statt-hoehe', p.stumpf && (g * s) % 2 === 0 ? zahl((g * s) / 2) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Dreieck rückwärts (M.GM.FL.DREIECK.RUECKWAERTS)

export interface DreieckRueckwaertsParameter {
  readonly max: number; // 6 … 30
}

/** „A = 24 cm², g = 8 cm. Wie hoch ist das Dreieck?“ – Vorlage M.GM.FL.DREIECK.RUECKWAERTS */
export const dreieckRueckwaerts: Generator<DreieckRueckwaertsParameter> = {
  id: 'fl.dreieck-rueckwaerts',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['nicht-verdoppelt'],

  erzeuge(seed, p) {
    verlange(p.max >= 6 && p.max <= 30, 'max: 6 … 30');
    const r = rng(seed);
    let g: number;
    let h: number;
    do {
      g = r.int(2, p.max);
      h = r.int(2, p.max);
    } while ((g * h) % 2 !== 0 || ((g * h) / 2) % g === 0);
    const a = (g * h) / 2;
    const hoehe = r.int(0, 1) === 0;
    const [gegeben, gesucht, name, andere] = hoehe
      ? [g, h, 'die zugehörige Höhe h', 'g']
      : [h, g, 'die Grundseite g', 'h'];
    return {
      platzhalter: {
        angabe: de(
          `Ein Dreieck hat den Flächeninhalt ${zahlDeutsch(a)} cm². Es ist ${andere} = ${gegeben} cm. Wie lang ist ${name}?`,
        ),
      },
      loesung: zahl(gesucht),
      loesungsweg: [
        de(`A = g · h : 2, also g · h = 2 · A = ${zahlDeutsch(2 * a)} cm²`),
        de(`${zahlDeutsch(2 * a)} : ${gegeben} = ${gesucht} cm`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(gesucht), [['nicht-verdoppelt', zahl(a / gegeben)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Parallelogramm, Trapez, Drachenviereck (M.GM.FL.VIERECKE.FLAECHE)

type Art = 'parallelogramm' | 'trapez' | 'drachen';

export interface ViereckFlaecheParameter {
  readonly arten: readonly Art[];
  readonly max: number; // 6 … 20
}

/** „Berechne den Flächeninhalt.“ – Vorlage M.GM.FL.VIERECKE.FLAECHE */
export const viereckFlaeche: Generator<ViereckFlaecheParameter> = {
  id: 'fl.viereck-flaeche',
  version: 1,
  platzhalter: ['figur'],
  fehlerbildIds: ['seite-statt-hoehe', 'trapez-nicht-halbiert', 'drachen-nicht-halbiert'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten fehlt');
    verlange(p.max >= 6 && p.max <= 20, 'max: 6 … 20');
    const r = rng(seed);
    const art = r.pick(p.arten);
    if (art === 'parallelogramm') {
      const g = r.int(3, p.max);
      const h = r.int(2, Math.min(p.max, 12));
      const versatz = r.int(2, 4);
      const f = masstab(g + versatz, h);
      const A: P = [30, 30 + h * f];
      const B: P = [A[0] + g * f, A[1]];
      const D: P = [A[0] + versatz * f, 30];
      const C: P = [B[0] + versatz * f, 30];
      const s = Math.round(Math.hypot(versatz, h));
      const flaeche = g * h;
      return {
        platzhalter: { figur: de('des Parallelogramms') },
        bild: bild(
          320,
          A[1] + 30,
          [
            vieleck([A, B, C, D]),
            gestrichelt(D, [D[0], A[1]]),
            rechterWinkel(D[0], A[1], 10, -10),
            text((A[0] + B[0]) / 2, A[1] + 18, `g = ${g} cm`, 13),
            text(D[0] + 30, (D[1] + A[1]) / 2, `h = ${h} cm`, 13),
            text(A[0] - 6 + (versatz * f) / 2 - 16, (A[1] + D[1]) / 2, `${s} cm`, 13),
          ],
          {
            de: `Ein Parallelogramm mit der Grundseite g = ${g} cm, der Höhe h = ${h} cm und einer schrägen Seite von ${s} cm.`,
          },
        ),
        loesung: zahl(flaeche),
        loesungsweg: [
          de('Parallelogramm: A = g · h (wie ein Rechteck, wenn man ein Dreieck umlegt)'),
          de(`A = ${g} cm · ${h} cm = ${zahlDeutsch(flaeche)} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(flaeche), [
          ['seite-statt-hoehe', s !== h ? zahl(g * s) : undefined],
        ]),
      };
    }
    if (art === 'trapez') {
      let a: number;
      let c: number;
      let h: number;
      do {
        a = r.int(4, p.max);
        c = r.int(2, a - 1);
        h = r.int(2, Math.min(p.max, 12));
      } while (((a + c) * h) % 2 !== 0);
      const f = masstab(a, h);
      const A: P = [30, 30 + h * f];
      const B: P = [A[0] + a * f, A[1]];
      const links = r.int(0, a - c);
      const D: P = [A[0] + links * f, 30];
      const C: P = [D[0] + c * f, 30];
      const flaeche = ((a + c) * h) / 2;
      return {
        platzhalter: { figur: de('des Trapezes') },
        bild: bild(
          320,
          A[1] + 30,
          [
            vieleck([A, B, C, D]),
            gestrichelt(C, [C[0], A[1]]),
            rechterWinkel(C[0], A[1], -10, -10),
            text((A[0] + B[0]) / 2, A[1] + 18, `a = ${a} cm`, 13),
            text((C[0] + D[0]) / 2, 22, `c = ${c} cm`, 13),
            text(C[0] + 30, (C[1] + A[1]) / 2, `h = ${h} cm`, 13),
          ],
          {
            de: `Ein Trapez mit den parallelen Seiten a = ${a} cm und c = ${c} cm und der Höhe h = ${h} cm.`,
          },
        ),
        loesung: zahl(flaeche),
        loesungsweg: [
          de('Trapez: A = (a + c) · h : 2'),
          de(`A = (${a} cm + ${c} cm) · ${h} cm : 2 = ${zahlDeutsch(flaeche)} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(flaeche), [
          ['trapez-nicht-halbiert', zahl((a + c) * h)],
        ]),
      };
    }
    let e: number;
    let fd: number;
    do {
      e = r.int(4, p.max);
      fd = r.int(3, p.max);
    } while ((e * fd) % 2 !== 0);
    const m = masstab(fd, e);
    const oben: P = [160, 25];
    const unten: P = [160, 25 + e * m];
    const kreuz = 25 + e * m * r.int(2, 4) * 0.1;
    const links: P = [160 - (fd * m) / 2, kreuz];
    const rechts: P = [160 + (fd * m) / 2, kreuz];
    const flaeche = (e * fd) / 2;
    return {
      platzhalter: { figur: de('des Drachenvierecks') },
      bild: bild(
        320,
        unten[1] + 20,
        [
          vieleck([oben, rechts, unten, links]),
          gestrichelt(oben, unten),
          gestrichelt(links, rechts),
          text(oben[0] + 42, (oben[1] + unten[1]) / 2 + 20, `e = ${e} cm`, 13),
          text(links[0] + 40, kreuz - 6, `f = ${fd} cm`, 13),
        ],
        {
          de: `Ein Drachenviereck mit den Diagonalen e = ${e} cm und f = ${fd} cm.`,
        },
      ),
      loesung: zahl(flaeche),
      loesungsweg: [
        de('Drachenviereck: A = e · f : 2 (halbes Rechteck aus den Diagonalen)'),
        de(`A = ${e} cm · ${fd} cm : 2 = ${zahlDeutsch(flaeche)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(flaeche), [['drachen-nicht-halbiert', zahl(e * fd)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Zusammengesetzte Figur (M.GM.FL.VIERECKE.ZERLEGT)

export interface ZerlegtParameter {
  readonly max: number; // 6 … 20
}

/** Haus: Rechteck mit dreieckigem Dach – Vorlage M.GM.FL.VIERECKE.ZERLEGT */
export const zerlegt: Generator<ZerlegtParameter> = {
  id: 'fl.zerlegt',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['dach-nicht-halbiert', 'nur-rechteck'],

  erzeuge(seed, p) {
    verlange(p.max >= 6 && p.max <= 20, 'max: 6 … 20');
    const r = rng(seed);
    let b: number;
    let h1: number;
    let h2: number;
    do {
      b = r.int(3, p.max);
      h1 = r.int(2, p.max);
      h2 = r.int(2, Math.ceil(p.max / 2));
    } while ((b * h2) % 2 !== 0);
    const f = masstab(b, h1 + h2);
    const x0 = 60;
    const yBoden = 25 + (h1 + h2) * f;
    const yTraufe = yBoden - h1 * f;
    const spitze: P = [x0 + (b * f) / 2, 25];
    const flaeche = b * h1 + (b * h2) / 2;
    return {
      platzhalter: {},
      bild: bild(
        330,
        yBoden + 30,
        [
          vieleck([
            [x0, yBoden],
            [x0 + b * f, yBoden],
            [x0 + b * f, yTraufe],
            spitze,
            [x0, yTraufe],
          ]),
          gestrichelt([x0, yTraufe], [x0 + b * f, yTraufe]),
          gestrichelt(spitze, [spitze[0], yTraufe]),
          text(x0 + (b * f) / 2, yBoden + 18, `${b} cm`, 13),
          text(x0 + b * f + 30, (yBoden + yTraufe) / 2, `${h1} cm`, 13),
          text(spitze[0] + 26, (spitze[1] + yTraufe) / 2 + 4, `${h2} cm`, 13),
          linie(x0 + b * f + 8, yBoden, x0 + b * f + 8, yTraufe, 0.75),
        ],
        {
          de: `Eine Figur wie ein Haus: unten ein Rechteck, ${b} cm breit und ${h1} cm hoch, darauf ein Dreieck mit derselben Grundseite und ${h2} cm Höhe.`,
        },
      ),
      loesung: zahl(flaeche),
      loesungsweg: [
        de(`Rechteck: ${b} cm · ${h1} cm = ${zahlDeutsch(b * h1)} cm²`),
        de(`Dreieck: ${b} cm · ${h2} cm : 2 = ${zahlDeutsch((b * h2) / 2)} cm²`),
        de(`Zusammen: ${zahlDeutsch(flaeche)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(flaeche), [
        ['dach-nicht-halbiert', zahl(b * h1 + b * h2)],
        ['nur-rechteck', zahl(b * h1)],
      ]),
    };
  },
};
