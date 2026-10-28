// Prismen – Klasse 6 (LEHRPLAN §8b, Feld KP): Ecken, Kanten, Flächen; Netze;
// Volumen und Oberflächeninhalt gerader Prismen. Rein und deterministisch.
import { zahlDeutsch } from '../../../core/learning/format';
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, rechteck, vieleck } from '../../svg';

const ECKE: Record<number, string> = {
  3: 'Dreieck',
  4: 'Viereck',
  5: 'Fünfeck',
  6: 'Sechseck',
  7: 'Siebeneck',
  8: 'Achteck',
  9: 'Neuneck',
  10: 'Zehneck',
};

// ---------------------------------------------------------------------------
// Ecken, Kanten, Flächen (M.RF.KP.PRISMEN.ZAEHLEN)

export interface PrismaZaehlenParameter {
  readonly ecken_max: number; // 4 … 10
  /** auch nach Kanten fragen */
  readonly kanten: boolean;
}

/** „Ein Prisma hat ein Fünfeck als Grundfläche. Wie viele Kanten hat es?“ */
export const prismaZaehlen: Generator<PrismaZaehlenParameter> = {
  id: 'kp.prisma-zaehlen',
  version: 1,
  platzhalter: ['grundflaeche', 'was'],
  fehlerbildIds: ['nur-grundflaeche', 'deckel-vergessen', 'seitenkanten-vergessen'],

  erzeuge(seed, p) {
    verlange(p.ecken_max >= 4 && p.ecken_max <= 10, 'ecken_max: 4 … 10');
    const r = rng(seed);
    const n = r.int(3, p.ecken_max);
    const was = r.pick(
      p.kanten ? (['Ecken', 'Kanten', 'Flächen'] as const) : (['Ecken', 'Flächen'] as const),
    );
    const wert = was === 'Ecken' ? 2 * n : was === 'Kanten' ? 3 * n : n + 2;
    const weg: Record<typeof was, string> = {
      Ecken: `Grundfläche und Deckfläche haben je ${n} Ecken: 2 · ${n} = ${2 * n}`,
      Kanten: `${n} Kanten unten, ${n} oben und ${n} Seitenkanten: 3 · ${n} = ${3 * n}`,
      Flächen: `${n} Seitenflächen (Rechtecke), dazu Grund- und Deckfläche: ${n} + 2 = ${n + 2}`,
    };
    return {
      platzhalter: { grundflaeche: de(ECKE[n] ?? `${n}-Eck`), was: de(was) },
      loesung: zahl(wert),
      loesungsweg: [de(weg[was])],
      fehlerbilder: fehlerbilderAus(zahl(wert), [
        ['nur-grundflaeche', zahl(n)],
        ['deckel-vergessen', was === 'Flächen' ? zahl(n + 1) : undefined],
        ['seitenkanten-vergessen', was === 'Kanten' ? zahl(2 * n) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Netz eines Dreiecksprismas (M.RF.KP.PRISMEN.NETZ)

type NetzArt = 'richtig' | 'dreiecke-gleiche-seite' | 'vier-rechtecke' | 'zwei-rechtecke';

function netzBild(art: NetzArt, r: Rng): Bild {
  const w = 44;
  const h = 64;
  const anzahl = art === 'vier-rechtecke' ? 4 : art === 'zwei-rechtecke' ? 2 : 3;
  const x0 = 10 + ((4 - anzahl) * w) / 2;
  const y0 = 50;
  const teile: string[] = [];
  for (let i = 0; i < anzahl; i++) teile.push(rechteck(x0 + i * w, y0, w, h));
  const dreieckOben = (i: number) =>
    vieleck([
      [x0 + i * w, y0],
      [x0 + (i + 1) * w, y0],
      [x0 + i * w + w / 2, y0 - w * 0.87],
    ]);
  const dreieckUnten = (i: number) =>
    vieleck([
      [x0 + i * w, y0 + h],
      [x0 + (i + 1) * w, y0 + h],
      [x0 + i * w + w / 2, y0 + h + w * 0.87],
    ]);
  const i = r.int(0, anzahl - 1);
  const j = r.int(0, anzahl - 1);
  if (art === 'dreiecke-gleiche-seite') {
    const k = (i + 1) % anzahl;
    teile.push(dreieckOben(i), dreieckOben(k));
  } else teile.push(dreieckOben(i), dreieckUnten(j));
  const beschreibung: Record<NetzArt, string> = {
    richtig: 'Drei Rechtecke nebeneinander, ein Dreieck oben und ein Dreieck unten angesetzt.',
    'dreiecke-gleiche-seite': 'Drei Rechtecke nebeneinander, beide Dreiecke oben angesetzt.',
    'vier-rechtecke':
      'Vier Rechtecke nebeneinander, ein Dreieck oben und ein Dreieck unten angesetzt.',
    'zwei-rechtecke':
      'Zwei Rechtecke nebeneinander, ein Dreieck oben und ein Dreieck unten angesetzt.',
  };
  return bild(196, 200, teile, { de: beschreibung[art] });
}

export interface PrismaNetzParameter {
  /** Anzahl der Figuren zur Auswahl: 3 oder 4 */
  readonly figuren: number;
}

/** „Welche Figur ist ein Netz eines Dreiecksprismas?“ – Vorlage M.RF.KP.PRISMEN.NETZ */
export const prismaNetz: Generator<PrismaNetzParameter> = {
  id: 'kp.prisma-netz',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['dreiecke-gleiche-seite', 'falsche-anzahl-rechtecke'],

  erzeuge(seed, p) {
    verlange(p.figuren === 3 || p.figuren === 4, 'figuren: 3 oder 4');
    const r = rng(seed);
    const falsche: NetzArt[] = mische<NetzArt>(r, [
      'dreiecke-gleiche-seite',
      'vier-rechtecke',
      'zwei-rechtecke',
    ]).slice(0, p.figuren - 1);
    const reihenfolge = mische(r, ['richtig' as NetzArt, ...falsche]);
    const idx = (a: NetzArt) => {
      const k = reihenfolge.indexOf(a);
      return k < 0 ? undefined : auswahl(k);
    };
    const richtig = auswahl(reihenfolge.indexOf('richtig'));
    return {
      platzhalter: {},
      optionen: reihenfolge.map((a) => ({ bild: netzBild(a, r) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Ein Dreiecksprisma hat zwei Dreiecke (Grund- und Deckfläche) und drei Rechtecke (Seitenflächen).',
        ),
        de(
          'Die Dreiecke müssen an gegenüberliegenden Seiten des Streifens sitzen – sonst liegen sie beim Falten aufeinander.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['dreiecke-gleiche-seite', idx('dreiecke-gleiche-seite')],
        ['falsche-anzahl-rechtecke', idx('vier-rechtecke') ?? idx('zwei-rechtecke')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Volumen (M.GM.KP.PRISMA.VOLUMEN)

export interface PrismaVolumenParameter {
  /** auch Trapez als Grundfläche */
  readonly trapez: boolean;
  readonly max: number; // 6 … 20
}

/** „Ein Prisma mit dreieckiger Grundfläche …“ – Vorlage M.GM.KP.PRISMA.VOLUMEN */
export const prismaVolumen: Generator<PrismaVolumenParameter> = {
  id: 'kp.prisma-volumen',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['grundflaeche-nicht-halbiert', 'nur-grundflaeche'],

  erzeuge(seed, p) {
    verlange(p.max >= 6 && p.max <= 20, 'max: 6 … 20');
    const r = rng(seed);
    const k = r.int(2, p.max);
    if (p.trapez && r.int(0, 1) === 0) {
      let a: number;
      let c: number;
      let h: number;
      do {
        a = r.int(4, p.max);
        c = r.int(2, a - 1);
        h = r.int(2, Math.min(12, p.max));
      } while (((a + c) * h) % 2 !== 0);
      const g = ((a + c) * h) / 2;
      return {
        platzhalter: {
          angabe: de(
            `Die Grundfläche eines geraden Prismas ist ein Trapez mit a = ${a} cm, c = ${c} cm und der Höhe ${h} cm. Das Prisma ist ${k} cm hoch.`,
          ),
        },
        loesung: zahl(g * k),
        loesungsweg: [
          de(`Grundfläche: (${a} cm + ${c} cm) · ${h} cm : 2 = ${zahlDeutsch(g)} cm²`),
          de(
            `Volumen = Grundfläche · Höhe = ${zahlDeutsch(g)} cm² · ${k} cm = ${zahlDeutsch(g * k)} cm³`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(zahl(g * k), [
          ['grundflaeche-nicht-halbiert', zahl((a + c) * h * k)],
          ['nur-grundflaeche', zahl(g)],
        ]),
      };
    }
    let g0: number;
    let hg: number;
    do {
      g0 = r.int(2, p.max);
      hg = r.int(2, p.max);
    } while ((g0 * hg) % 2 !== 0);
    const g = (g0 * hg) / 2;
    return {
      platzhalter: {
        angabe: de(
          `Die Grundfläche eines geraden Prismas ist ein Dreieck mit der Grundseite ${g0} cm und der zugehörigen Höhe ${hg} cm. Das Prisma ist ${k} cm hoch.`,
        ),
      },
      loesung: zahl(g * k),
      loesungsweg: [
        de(`Grundfläche: ${g0} cm · ${hg} cm : 2 = ${zahlDeutsch(g)} cm²`),
        de(
          `Volumen = Grundfläche · Höhe = ${zahlDeutsch(g)} cm² · ${k} cm = ${zahlDeutsch(g * k)} cm³`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(g * k), [
        ['grundflaeche-nicht-halbiert', zahl(g0 * hg * k)],
        ['nur-grundflaeche', zahl(g)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Oberflächeninhalt (M.GM.KP.PRISMA.OBERFLAECHE)

export interface PrismaOberflaecheParameter {
  /** Vielfaches des Dreiecks 3-4-5 */
  readonly faktor_max: number; // 1 … 4
  readonly hoehe_max: number; // 4 … 20
}

/** Prisma mit rechtwinkligem Dreieck (3k, 4k, 5k) – Vorlage M.GM.KP.PRISMA.OBERFLAECHE */
export const prismaOberflaeche: Generator<PrismaOberflaecheParameter> = {
  id: 'kp.prisma-oberflaeche',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['grundflaeche-einmal', 'mantel-vergessen', 'grundflaeche-nicht-halbiert'],

  erzeuge(seed, p) {
    verlange(p.faktor_max >= 1 && p.faktor_max <= 4, 'faktor_max: 1 … 4');
    verlange(p.hoehe_max >= 4 && p.hoehe_max <= 20, 'hoehe_max: 4 … 20');
    const r = rng(seed);
    const k = r.int(1, p.faktor_max);
    const [a, b, c] = [3 * k, 4 * k, 5 * k];
    const h = r.int(2, p.hoehe_max);
    const g = (a * b) / 2;
    const mantel = (a + b + c) * h;
    const o = 2 * g + mantel;
    return {
      platzhalter: {
        angabe: de(
          `Die Grundfläche eines geraden Prismas ist ein rechtwinkliges Dreieck mit den Seiten ${a} cm, ${b} cm und ${c} cm (der rechte Winkel liegt zwischen ${a} cm und ${b} cm). Das Prisma ist ${h} cm hoch.`,
        ),
      },
      loesung: zahl(o),
      loesungsweg: [
        de(
          `Grundfläche: ${a} cm · ${b} cm : 2 = ${g} cm² – sie kommt zweimal vor (Grund- und Deckfläche).`,
        ),
        de(
          `Mantel: Umfang · Höhe = (${a} + ${b} + ${c}) cm · ${h} cm = ${zahlDeutsch(mantel)} cm²`,
        ),
        de(`Oberfläche: 2 · ${g} cm² + ${zahlDeutsch(mantel)} cm² = ${zahlDeutsch(o)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(o), [
        ['grundflaeche-einmal', zahl(g + mantel)],
        ['mantel-vergessen', zahl(2 * g)],
        ['grundflaeche-nicht-halbiert', zahl(2 * a * b + mantel)],
      ]),
    };
  },
};
