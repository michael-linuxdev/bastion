// Geometrie, Niveau E – Klasse 6 (K-31): Flächen, Prismen, Dreiecke und Vierecke begründen.
import { aussagenGenerator } from '../../aussagen';

/** „Dreieck mit der schrägen Seite statt der Höhe?“ (M.GM.FL.DREIECK.BEGRUENDEN) */
export const flHoeheAussage = aussagenGenerator(
  'fl.hoehe-aussage',
  ['seite-statt-hoehe', 'nicht-halbiert'],
  ['g', 's', 'h'],
  (r) => {
    const g = 2 * r.int(2, 7);
    const h = r.int(3, 8);
    const s = h + r.int(1, 3);
    return {
      situation: `Ein Dreieck hat die Grundseite g = ${g} cm, eine schräge Seite s = ${s} cm und die Höhe h = ${h} cm auf g. Tim rechnet A = ${g} · ${s} : 2 = ${(g * s) / 2} cm². Stimmt das?`,
      werte: { g, s, h },
      richtig: `Nein. Zur Grundseite gehört die Höhe, der senkrechte Abstand: ${g} · ${h} : 2 = ${(g * h) / 2} cm².`,
      falsch: [
        ['seite-statt-hoehe', 'Ja. Die schräge Seite ist die Höhe des Dreiecks.'],
        ['nicht-halbiert', `Nein. Richtig ist ${g} · ${h} = ${g * h} cm².`],
      ],
      weg: [
        'Die Höhe steht senkrecht auf der Grundseite. Die schräge Seite ist länger.',
        `A = g · h : 2 = ${g} · ${h} : 2 = ${(g * h) / 2} cm²`,
      ],
    };
  },
);

/** „Drachen: Diagonale mal Diagonale?“ (M.GM.FL.VIERECKE.BEGRUENDEN) */
export const flDrachenAussage = aussagenGenerator(
  'fl.drachen-aussage',
  ['nicht-halbiert', 'zerlegen'],
  ['e', 'f'],
  (r) => {
    const e = 2 * r.int(2, 6);
    const f = 2 * r.int(2, 6);
    return {
      situation: `Ein Drachenviereck hat die Diagonalen e = ${e} cm und f = ${f} cm. Mia rechnet A = ${e} · ${f} = ${e * f} cm². Stimmt das?`,
      werte: { e, f },
      richtig: `Nein. Der Drachen ist halb so groß wie das Rechteck um ihn herum: ${e} · ${f} : 2 = ${(e * f) / 2} cm².`,
      falsch: [
        ['nicht-halbiert', 'Ja. Beim Drachen nimmt man Diagonale mal Diagonale.'],
        [
          'zerlegen',
          `Nein. Man rechnet nur ein Dreieck: ${e} · ${f / 2} : 2 = ${(e * f) / 4} cm².`,
        ],
      ],
      weg: [
        'Zeichne das Rechteck mit den Seiten e und f um den Drachen. Der Drachen füllt genau die Hälfte.',
        `A = e · f : 2 = ${(e * f) / 2} cm²`,
      ],
    };
  },
);

/** „Oberfläche eines Prismas: eine Grundfläche reicht?“ (M.GM.KP.PRISMA.BEGRUENDEN) */
export const kpPrismaAussage = aussagenGenerator(
  'kp.prisma-aussage',
  ['flaechen-vergessen', 'nicht-halbiert'],
  ['a', 'b', 'c', 'h'],
  (r) => {
    const [a, b, c] = r.pick([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
    ] as const);
    const h = r.int(2, 10);
    const g = (a * b) / 2;
    const m = (a + b + c) * h;
    return {
      situation: `Ein Prisma hat als Grundfläche ein rechtwinkliges Dreieck mit den Seiten ${a} cm, ${b} cm und ${c} cm (der rechte Winkel liegt zwischen ${a} cm und ${b} cm). Das Prisma ist ${h} cm hoch. Lina rechnet die Oberfläche: ${g} cm² + ${m} cm² = ${g + m} cm². Stimmt das?`,
      werte: { a, b, c, h },
      richtig: `Nein. Ein Prisma hat zwei gleiche Grundflächen: 2 · ${g} cm² + ${m} cm² = ${2 * g + m} cm².`,
      falsch: [
        ['flaechen-vergessen', 'Ja. Grundfläche und Mantel zusammen ergeben die Oberfläche.'],
        ['nicht-halbiert', `Nein. 2 · ${a * b} cm² + ${m} cm² = ${2 * a * b + m} cm².`],
      ],
      weg: [
        `Grundfläche: ${a} · ${b} : 2 = ${g} cm². Mantel: (${a} + ${b} + ${c}) · ${h} = ${m} cm².`,
        `O = 2 · G + M = ${2 * g + m} cm²`,
      ],
    };
  },
);

/** „Ist diese Linie auch eine Höhe?“ (M.RF.DV.BESONDERE-LINIEN.BEGRUENDEN) */
export const dvLinieAussage = aussagenGenerator(
  'dv.linie-aussage',
  ['besondere-linien', 'um-inkreis'],
  ['art', 'seite'],
  (r) => {
    const art = r.int(0, 2);
    const seite = r.int(0, 2);
    const s = ['a', 'b', 'c'][seite] ?? 'c';
    const E = ['A', 'B', 'C'][seite] ?? 'C';
    const faelle = [
      {
        situation: `In einem Dreieck ABC, das nicht gleichschenklig ist, sagt Tom: „Die Seitenhalbierende von ${s} ist auch die Höhe auf ${s}, denn beide gehen durch ${E}.“ Stimmt das?`,
        richtig: `Nein. Die Seitenhalbierende geht durch ${E} und die Mitte von ${s}, steht aber nicht senkrecht auf ${s}. Die Höhe steht senkrecht auf ${s}.`,
        falsch: [
          ['besondere-linien', `Ja. Beide Linien gehen durch die Ecke ${E}.`],
          [
            'um-inkreis',
            'Ja. Seitenhalbierende und Höhen schneiden sich beide im Umkreismittelpunkt.',
          ],
        ] as [string, string][],
      },
      {
        situation: `In einem Dreieck ABC, das nicht gleichschenklig ist, sagt Tom: „Die Mittelsenkrechte von ${s} ist auch die Höhe auf ${s}, denn beide stehen senkrecht auf ${s}.“ Stimmt das?`,
        richtig: `Nein. Die Mittelsenkrechte geht durch die Mitte von ${s}, aber nicht durch ${E}. Die Höhe geht durch ${E}.`,
        falsch: [
          ['besondere-linien', `Ja. Beide Linien stehen senkrecht auf ${s}.`],
          [
            'um-inkreis',
            'Ja. Mittelsenkrechten und Höhen schneiden sich beide im Umkreismittelpunkt.',
          ],
        ] as [string, string][],
      },
      {
        situation: `Tom sagt: „Die Winkelhalbierenden eines Dreiecks schneiden sich im Umkreismittelpunkt. Den Kreis um diesen Punkt zeichne ich durch ${E}.“ Stimmt das?`,
        richtig:
          'Nein. Die Winkelhalbierenden schneiden sich im Inkreismittelpunkt. Den Umkreismittelpunkt liefern die Mittelsenkrechten.',
        falsch: [
          ['um-inkreis', 'Ja. Die Winkelhalbierenden schneiden sich im Umkreismittelpunkt.'],
          ['besondere-linien', 'Nein. Im Umkreismittelpunkt schneiden sich die Höhen.'],
        ] as [string, string][],
      },
    ] as const;
    const f = faelle[art] ?? faelle[0];
    return {
      situation: f.situation,
      werte: { art, seite },
      richtig: f.richtig,
      falsch: f.falsch,
      weg: [
        'Höhe: durch eine Ecke und senkrecht. Seitenhalbierende: durch eine Ecke und die Seitenmitte. Mittelsenkrechte: durch die Seitenmitte und senkrecht.',
        'Mittelsenkrechten → Umkreismittelpunkt, Winkelhalbierende → Inkreismittelpunkt.',
      ],
    };
  },
);

/** „Passen die drei Stäbe zu einem Dreieck?“ (M.RF.DV.DREIECKE.BEGRUENDEN) */
export const dvUngleichungAussage = aussagenGenerator(
  'dv.ungleichung-aussage',
  ['ungleichung', 'falsche-seiten'],
  ['a', 'b', 'c'],
  (r) => {
    const art = r.int(0, 2);
    const a = r.int(2, 6);
    const b = a + r.int(1, 4);
    const c = art === 0 ? b + r.int(1, a - 1) : art === 1 ? a + b : a + b + r.int(1, 3);
    const passt = art === 0;
    return {
      situation: `Kann man aus Stäben mit ${a} cm, ${b} cm und ${c} cm ein Dreieck legen?`,
      werte: { a, b, c },
      richtig: passt
        ? `Ja, denn die beiden kürzeren Stäbe sind zusammen länger als der längste: ${a} + ${b} = ${a + b} > ${c}.`
        : art === 1
          ? `Nein, denn ${a} + ${b} = ${c}: Die beiden kürzeren Stäbe liegen flach auf dem längsten.`
          : `Nein, denn ${a} + ${b} = ${a + b} ist kleiner als ${c}.`,
      falsch: [
        [
          'ungleichung',
          passt
            ? `Nein. Der längste Stab ist zu lang, denn ${c} ist größer als ${b}.`
            : art === 1
              ? `Ja, denn ${a} + ${b} ist nicht kleiner als ${c}.`
              : 'Ja. Aus drei Stäben kann man immer ein Dreieck legen.',
        ],
        [
          'falsche-seiten',
          `${passt ? 'Nein' : 'Ja'}, denn ${a} + ${c} = ${a + c} ist ${passt ? 'zu groß' : 'größer als ' + b}.`,
        ],
      ],
      weg: [
        'Dreiecksungleichung: Die beiden kürzeren Seiten zusammen müssen länger sein als die längste.',
        `${a} + ${b} = ${a + b}, längste Seite ${c}.`,
      ],
    };
  },
);

/** „Zwei Seiten und ein Winkel: immer eindeutig?“ (M.RF.DV.KONSTRUIEREN.BEGRUENDEN) */
export const dvSswAussage = aussagenGenerator(
  'dv.ssw-aussage',
  ['sws-falsch', 'zu-wenig'],
  ['b', 'c', 'gamma'],
  (r) => {
    const groesser = r.int(0, 1) === 1;
    const b = r.int(6, 10);
    const c = groesser ? b + r.int(1, 3) : r.int(Math.floor(b / 2) + 1, b - 1);
    const g = groesser ? 10 * r.int(3, 7) : 30;
    return {
      situation: `Gegeben sind b = ${b} cm, c = ${c} cm und γ = ${g}°. Der Winkel γ liegt der Seite c gegenüber. Lea sagt: „Das Dreieck ist eindeutig, nach dem Kongruenzsatz sws.“ Stimmt das?`,
      werte: { b, c, gamma: g },
      richtig: groesser
        ? 'Eindeutig ja, aber nicht nach sws: Der Winkel liegt nicht zwischen b und c, sondern der größeren Seite c gegenüber. Das ist SsW.'
        : 'Nein. Der Winkel liegt der kleineren Seite c gegenüber und nicht zwischen den Seiten. Dann gibt es hier zwei verschiedene Dreiecke.',
      falsch: [
        ['sws-falsch', 'Ja. Zwei Seiten und ein Winkel legen ein Dreieck immer fest.'],
        ['zu-wenig', 'Nein. Mit nur einem Winkel kann man nie ein Dreieck konstruieren.'],
      ],
      weg: [
        'sws gilt nur, wenn der Winkel zwischen den beiden Seiten liegt.',
        'SsW ist eindeutig, wenn der Winkel der größeren Seite gegenüberliegt.',
      ],
    };
  },
);

const HAUS = [
  {
    a: 'Jedes Quadrat ist eine Raute.',
    wahr: true,
    grund: 'denn ein Quadrat hat vier gleich lange Seiten.',
    um: 'Jede Raute ist ein Quadrat.',
  },
  {
    a: 'Jede Raute ist ein Quadrat.',
    wahr: false,
    grund: 'Eine Raute muss keine rechten Winkel haben.',
    um: 'Jedes Quadrat ist eine Raute.',
  },
  {
    a: 'Jedes Rechteck ist ein Parallelogramm.',
    wahr: true,
    grund: 'denn gegenüberliegende Seiten sind parallel.',
    um: 'Jedes Parallelogramm ist ein Rechteck.',
  },
  {
    a: 'Jedes Parallelogramm ist ein Rechteck.',
    wahr: false,
    grund: 'Ein Parallelogramm muss keine rechten Winkel haben.',
    um: 'Jedes Rechteck ist ein Parallelogramm.',
  },
  {
    a: 'Jedes Quadrat ist ein Rechteck.',
    wahr: true,
    grund: 'denn es hat vier rechte Winkel.',
    um: 'Jedes Rechteck ist ein Quadrat.',
  },
  {
    a: 'Jedes Rechteck ist ein Quadrat.',
    wahr: false,
    grund: 'Ein Rechteck muss keine vier gleich langen Seiten haben.',
    um: 'Jedes Quadrat ist ein Rechteck.',
  },
  {
    a: 'Jedes Trapez ist ein Parallelogramm.',
    wahr: false,
    grund: 'Ein Trapez braucht nur ein Paar paralleler Seiten.',
    um: 'Jedes Parallelogramm ist ein Trapez.',
  },
  {
    a: 'Jede Raute ist ein Drachenviereck.',
    wahr: true,
    grund: 'denn sie ist symmetrisch zu jeder Diagonale.',
    um: 'Jedes Drachenviereck ist eine Raute.',
  },
] as const;

/** „Jedes Quadrat ist eine Raute“ – stimmt das? (M.RF.DV.VIERECKE.BEGRUENDEN) */
export const dvHausAussage = aussagenGenerator(
  'dv.haus-aussage',
  ['haus', 'umkehrung'],
  ['aussage'],
  (r) => {
    const i = r.int(0, HAUS.length - 1);
    const h = HAUS[i] ?? HAUS[0];
    return {
      situation: `Ida sagt: „${h.a}“ Stimmt das?`,
      werte: { aussage: i },
      richtig: h.wahr ? `Ja, ${h.grund}` : `Nein. ${h.grund}`,
      falsch: h.wahr
        ? [
            ['haus', 'Nein. Jedes Viereck hat nur einen Namen.'],
            ['umkehrung', `Nein. Nur umgekehrt stimmt es: „${h.um}“`],
          ]
        : [
            ['haus', 'Ja. Beide haben vier Seiten und vier Ecken.'],
            ['umkehrung', `Ja, denn umgekehrt gilt auch: „${h.um}“`],
          ],
      weg: [
        'Prüfe die Eigenschaften: Hat jedes Viereck der ersten Art alle Eigenschaften der zweiten?',
        'Im Haus der Vierecke steht das speziellere Viereck weiter oben und hat alle Eigenschaften der Vierecke darunter.',
      ],
    };
  },
);

/** „Nebenwinkel oder Stufenwinkel: gleich oder 180°?“ (M.RF.DV.WINKELSAETZE.BEGRUENDEN) */
export const dvWinkelAussage = aussagenGenerator(
  'dv.winkel-aussage',
  ['gleich-oder-180', 'winkelsumme'],
  ['alpha', 'art'],
  (r) => {
    let a = 5 * r.int(7, 29);
    if (a === 90) a = 95;
    const stufen = r.int(0, 1) === 1;
    return stufen
      ? {
          situation: `Zwei parallele Geraden werden von einer dritten Geraden geschnitten. An der ersten Kreuzung ist α = ${a}°. Ole sagt: „Der Stufenwinkel an der zweiten Kreuzung ist 180° − ${a}° = ${180 - a}°.“ Stimmt das?`,
          werte: { alpha: a, art: 1 },
          richtig: `Nein. Stufenwinkel an Parallelen sind gleich groß: ${a}°.`,
          falsch: [
            ['gleich-oder-180', 'Ja. Stufenwinkel ergänzen sich zu 180°.'],
            ['winkelsumme', `Nein. 360° − ${a}° = ${360 - a}°.`],
          ],
          weg: [
            'Verschiebt man die erste Kreuzung entlang der dritten Geraden, liegt sie genau auf der zweiten.',
            `Stufenwinkel: gleich groß, also ${a}°.`,
          ],
        }
      : {
          situation: `Zwei Geraden schneiden sich. Ein Winkel ist α = ${a}°. Ole sagt: „Der Nebenwinkel von α ist auch ${a}°, denn er liegt an derselben Kreuzung.“ Stimmt das?`,
          werte: { alpha: a, art: 0 },
          richtig: `Nein. Nebenwinkel ergänzen sich zu 180°: 180° − ${a}° = ${180 - a}°.`,
          falsch: [
            ['gleich-oder-180', 'Ja. Winkel an derselben Kreuzung sind gleich groß.'],
            ['winkelsumme', `Nein. 360° − ${a}° = ${360 - a}°.`],
          ],
          weg: [
            'Nebenwinkel bilden zusammen einen gestreckten Winkel: 180°. Gleich groß sind Scheitelwinkel.',
            `180° − ${a}° = ${180 - a}°`,
          ],
        };
  },
);

/** „Flächen und Kanten eines Prismas“ (M.RF.KP.PRISMEN.BEGRUENDEN) */
export const kpPrismaZaehlenAussage = aussagenGenerator(
  'kp.prisma-zaehlen-aussage',
  ['deckel-vergessen', 'falsch-gezaehlt'],
  ['n', 'art'],
  (r) => {
    const n = r.int(3, 8);
    const flaechen = r.int(0, 1) === 1;
    return flaechen
      ? {
          situation: `Paul sagt: „Ein Prisma mit ${n}-eckiger Grundfläche hat ${n + 1} Flächen.“ Stimmt das?`,
          werte: { n, art: 1 },
          richtig: `Nein. ${n} Seitenflächen, dazu Grundfläche und Deckfläche: ${n + 2} Flächen.`,
          falsch: [
            ['deckel-vergessen', `Ja. ${n} Seitenflächen und eine Grundfläche.`],
            ['falsch-gezaehlt', `Nein. Es hat ${2 * n} Flächen, so viele wie Ecken.`],
          ],
          weg: ['Ein Prisma hat zwei gleiche Grundflächen: unten und oben.', `${n} + 2 = ${n + 2}`],
        }
      : {
          situation: `Paul sagt: „Ein Prisma mit ${n}-eckiger Grundfläche hat ${2 * n} Kanten.“ Stimmt das?`,
          werte: { n, art: 0 },
          richtig: `Nein. ${n} Kanten unten, ${n} oben und ${n} Seitenkanten: ${3 * n} Kanten.`,
          falsch: [
            ['deckel-vergessen', `Ja. Unten und oben sind je ${n} Kanten.`],
            [
              'falsch-gezaehlt',
              `Nein. Es hat ${n} Kanten, so viele wie die Grundfläche Seiten hat.`,
            ],
          ],
          weg: [
            'Zähle Grundfläche, Deckfläche und die Seitenkanten dazwischen.',
            `${n} + ${n} + ${n} = ${3 * n}`,
          ],
        };
  },
);
