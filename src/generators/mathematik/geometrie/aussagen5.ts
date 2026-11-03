// Geometrie, Niveau E – Klasse 5 (K-31): Flächen, Quader, Koordinaten, Winkel und Symmetrie begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 10000) / 10000).replace('.', ',');

const FLAECHEN = [
  ['m²', 'dm²', 'dm'],
  ['dm²', 'cm²', 'cm'],
  ['cm²', 'mm²', 'mm'],
] as const;

/** „1 m² = 10 dm²?“ (M.GM.FL.EINHEITEN.BEGRUENDEN) */
export const flEinheitAussage = aussagenGenerator(
  'fl.einheit-aussage',
  ['flaeche-100', 'umrechnen-richtung'],
  ['a', 'einheit'],
  (r) => {
    const a = r.int(2, 9);
    const e = r.int(0, 2);
    const [gross, klein, laenge] = FLAECHEN[e] ?? FLAECHEN[0];
    return {
      situation: `Lea rechnet ${a} ${gross} in ${klein} um: „${a} ${gross} = ${a * 10} ${klein}, denn 1 ${gross.replace('²', '')} = 10 ${laenge}.“ Stimmt das?`,
      werte: { a, einheit: e },
      richtig: `Nein. 1 ${gross} ist ein Quadrat mit 10 ${laenge} Seitenlänge. Darin liegen 10 · 10 = 100 ${klein}, also ${a} ${gross} = ${a * 100} ${klein}.`,
      falsch: [
        ['flaeche-100', `Ja. Bei Flächen nimmt man dieselbe Umrechnungszahl wie bei Längen.`],
        ['umrechnen-richtung', `Nein. ${a} ${gross} = ${dez(a / 100)} ${klein}.`],
      ],
      weg: [
        `Zeichne 1 ${gross}: 10 Reihen mit je 10 kleinen Quadraten von 1 ${klein}.`,
        `${a} · 100 = ${a * 100}`,
      ],
    };
  },
);

/** „Breite = Umfang − Länge?“ (M.GM.FL.RECHTECK.BEGRUENDEN) */
export const flRechteckAussage = aussagenGenerator(
  'fl.rechteck-aussage',
  ['umfang-seiten', 'umfang-flaeche'],
  ['u', 'a'],
  (r) => {
    const a = r.int(4, 12);
    const b = r.int(2, a - 1);
    const u = 2 * (a + b);
    return {
      situation: `Ein Rechteck hat den Umfang ${u} cm und die Länge ${a} cm. Tim rechnet die Breite: ${u} − ${a} = ${u - a} cm. Stimmt das?`,
      werte: { u, a },
      richtig: `Nein. Im Umfang kommen Länge und Breite je zweimal vor: Breite = ${u} : 2 − ${a} = ${b} cm.`,
      falsch: [
        ['umfang-seiten', 'Ja. Umfang minus Länge ergibt die Breite.'],
        [
          'umfang-flaeche',
          `Nein. Breite = ${u} : ${a}, denn Umfang durch Länge ergibt die Breite.`,
        ],
      ],
      weg: [
        `u = 2 · (a + b), also a + b = ${u} : 2 = ${u / 2}.`,
        `b = ${u / 2} − ${a} = ${b} cm. Probe: 2 · (${a} + ${b}) = ${u}.`,
      ],
    };
  },
);

/** „Ecke ausgeschnitten, Umfang kleiner?“ (M.GM.FL.ZUSAMMENGESETZT.BEGRUENDEN) */
export const flLUmfangAussage = aussagenGenerator(
  'fl.l-umfang-aussage',
  ['umfang-seiten', 'umfang-flaeche'],
  ['a', 'b', 'c', 'd'],
  (r) => {
    const a = r.int(6, 12);
    const b = r.int(5, 10);
    const c = r.int(2, a - 2);
    const d = r.int(2, b - 2);
    const u = 2 * (a + b);
    return {
      situation: `Aus einem Rechteck mit ${a} cm und ${b} cm wird an einer Ecke ein Rechteck mit ${c} cm und ${d} cm herausgeschnitten. Mia sagt: „Der Umfang der neuen Figur ist kleiner als ${u} cm, denn ein Stück fehlt.“ Stimmt das?`,
      werte: { a, b, c, d },
      richtig: `Nein. Der Umfang bleibt ${u} cm: Die zwei neuen Seiten am Einschnitt (${c} cm und ${d} cm) ersetzen genau die weggeschnittenen Randstücke.`,
      falsch: [
        [
          'umfang-seiten',
          `Ja. Es fehlen ${c} cm und ${d} cm, also ist der Umfang ${u - c - d} cm.`,
        ],
        ['umfang-flaeche', `Ja. Der Umfang ist ${a} · ${b} − ${c} · ${d} = ${a * b - c * d} cm.`],
      ],
      weg: [
        'Gehe einmal um die Figur herum und addiere alle Seiten.',
        `Waagerecht zusammen 2 · ${a}, senkrecht zusammen 2 · ${b}: ${u} cm.`,
      ],
    };
  },
);

/** „a l = 1000 · a dm³?“ (M.GM.KP.EINHEITEN.BEGRUENDEN) */
export const kpLiterAussage = aussagenGenerator(
  'kp.liter-aussage',
  ['liter', 'volumen-1000'],
  ['a'],
  (r) => {
    const a = r.int(2, 9);
    return {
      situation: `Ole sagt: „${a} l sind ${a * 1000} dm³.“ Stimmt das?`,
      werte: { a },
      richtig: `Nein. 1 l = 1 dm³. Also sind ${a} l = ${a} dm³ = ${a * 1000} cm³.`,
      falsch: [
        ['liter', 'Ja. 1 l = 1000 dm³.'],
        ['volumen-1000', `Nein. ${a} l = ${a} dm³ = ${a * 100} cm³.`],
      ],
      weg: [
        'Ein Würfel mit 1 dm Kantenlänge fasst genau 1 l.',
        `1 dm³ = 10 · 10 · 10 cm³ = 1000 cm³, also ${a} l = ${a * 1000} cm³.`,
      ],
    };
  },
);

/** „Oberfläche: drei Flächen reichen?“ (M.GM.KP.OBERFLAECHE.BEGRUENDEN) */
export const kpOberflaecheAussage = aussagenGenerator(
  'kp.oberflaeche-aussage',
  ['flaechen-vergessen', 'volumen-oberflaeche'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(3, 9);
    const b = r.int(2, a - 1);
    let c = r.int(2, 8);
    const halb = (x: number) => a * b + a * x + b * x;
    if (2 * halb(c) === a * b * c || halb(c) === a * b * c) c = c === 2 ? 3 : c - 1;
    const h = halb(c);
    return {
      situation: `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Tim rechnet die Oberfläche: ${a} · ${b} + ${a} · ${c} + ${b} · ${c} = ${h} cm². Stimmt das?`,
      werte: { a, b, c },
      richtig: `Nein. Jede dieser Flächen kommt zweimal vor, oben und unten, vorn und hinten, links und rechts: 2 · ${h} = ${2 * h} cm².`,
      falsch: [
        ['flaechen-vergessen', 'Ja. Ein Quader hat drei verschiedene Flächen.'],
        ['volumen-oberflaeche', `Nein. O = ${a} · ${b} · ${c} = ${a * b * c} cm².`],
      ],
      weg: [
        'Das Netz eines Quaders hat sechs Rechtecke, je zwei sind gleich.',
        `O = 2 · (${a} · ${b} + ${a} · ${c} + ${b} · ${c}) = ${2 * h} cm²`,
      ],
    };
  },
);

/** „Volumen = Würfel auf dem Boden?“ (M.GM.KP.VOLUMEN.BEGRUENDEN) */
export const kpSchichtenAussage = aussagenGenerator(
  'kp.schichten-aussage',
  ['nur-grundflaeche', 'volumen-oberflaeche'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(3, 8);
    const b = r.int(2, 6);
    let c = r.int(2, 5);
    const o = (x: number) => 2 * (a * b + a * x + b * x);
    if (o(c) === a * b * c) c = c === 2 ? 3 : c - 1;
    return {
      situation: `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Mia sagt: „Das Volumen ist ${a * b} cm³, denn so viele Zentimeterwürfel passen auf den Boden.“ Stimmt das?`,
      werte: { a, b, c },
      richtig: `Nein. Auf den Boden passen ${a * b} Würfel, und es gibt ${c} solche Schichten übereinander: ${a * b} · ${c} = ${a * b * c} cm³.`,
      falsch: [
        ['nur-grundflaeche', 'Ja. Das Volumen ist so groß wie die Grundfläche.'],
        [
          'volumen-oberflaeche',
          `Nein. Man zählt alle Flächen: 2 · (${a} · ${b} + ${a} · ${c} + ${b} · ${c}) = ${o(c)} cm³.`,
        ],
      ],
      weg: [
        'Volumen: Wie viele Zentimeterwürfel passen hinein?',
        `${a} · ${b} = ${a * b} Würfel je Schicht, ${c} Schichten: ${a * b * c} cm³.`,
      ],
    };
  },
);

/** „Erst nach oben, dann nach rechts?“ (M.RF.GF.KOORDINATEN.BEGRUENDEN) */
export const gfKoordinateAussage = aussagenGenerator(
  'gf.koordinate-aussage',
  ['x-y-vertauscht', 'kaestchen-linien'],
  ['x', 'y'],
  (r) => {
    const x = r.int(1, 9);
    let y = r.int(1, 9);
    if (y === x) y = x === 9 ? 8 : x + 1;
    return {
      situation: `Tim will den Punkt P(${x}|${y}) eintragen. Er geht vom Ursprung ${x} Einheiten nach oben und ${y} nach rechts. Stimmt das?`,
      werte: { x, y },
      richtig: `Nein. Die erste Zahl ist der x-Wert: ${x} nach rechts, dann ${y} nach oben.`,
      falsch: [
        ['x-y-vertauscht', 'Ja. Man geht zuerst nach oben, dann zur Seite.'],
        [
          'kaestchen-linien',
          `Nein. Man zählt angefangene Kästchen: ${x + 1} nach rechts und ${y + 1} nach oben.`,
        ],
      ],
      weg: [
        'P(x|y): zuerst nach rechts (x), dann nach oben (y).',
        'Die Zahlen stehen an den Linien, nicht in den Kästchen.',
      ],
    };
  },
);

/** „Sie schneiden sich im Bild nicht, also parallel?“ (M.RF.GF.LAGE.BEGRUENDEN) */
export const gfLageAussage = aussagenGenerator(
  'gf.lage-aussage',
  ['lagebeziehung', 'senkrecht'],
  ['links', 'rechts'],
  (r) => {
    const l = r.int(1, 8);
    let re = r.int(1, 8);
    if (re === l) re = l === 8 ? 7 : l + 1;
    return {
      situation: `Zwei Geraden g und h schneiden sich im Bild nicht. Am linken Rand haben sie ${l} cm Abstand, am rechten Rand ${re} cm. Ida sagt: „g und h sind parallel, denn sie schneiden sich nicht.“ Stimmt das?`,
      werte: { links: l, rechts: re },
      richtig: `Nein. Parallele Geraden haben überall denselben Abstand. Hier ist er links ${l} cm und rechts ${re} cm, also schneiden sie sich außerhalb des Bildes.`,
      falsch: [
        ['lagebeziehung', 'Ja. Geraden, die sich im Bild nicht berühren, sind parallel.'],
        ['senkrecht', 'Nein. Sie stehen senkrecht zueinander.'],
      ],
      weg: [
        'Geraden sind unendlich lang. Das Bild zeigt nur ein Stück.',
        'Prüfe den Abstand an zwei Stellen: Ist er gleich, sind die Geraden parallel.',
      ],
    };
  },
);

/** „Stumpf oder überstumpf?“ (M.RF.GF.WINKEL.BEGRUENDEN) */
export const gfWinkelartAussage = aussagenGenerator(
  'gf.winkelart-aussage',
  ['winkelart', 'gegenseite'],
  ['alpha'],
  (r) => {
    const ueber = r.int(0, 1) === 1;
    const a = ueber ? 5 * r.int(37, 70) : 5 * r.int(19, 35);
    return ueber
      ? {
          situation: `Ole sagt: „Ein Winkel von ${a}° ist stumpf, denn er ist größer als 90°.“ Stimmt das?`,
          werte: { alpha: a },
          richtig: `Nein. Stumpfe Winkel liegen zwischen 90° und 180°. ${a}° ist größer als 180°, also überstumpf.`,
          falsch: [
            ['winkelart', 'Ja. Alle Winkel über 90° sind stumpf.'],
            [
              'gegenseite',
              `Nein. Er ist ${360 - a}° groß, denn man misst immer den kleineren Winkel.`,
            ],
          ],
          weg: [
            'spitz: unter 90°, recht: 90°, stumpf: zwischen 90° und 180°, gestreckt: 180°, überstumpf: über 180°.',
            `${a}° > 180°`,
          ],
        }
      : {
          situation: `Ole sagt: „Ein Winkel von ${a}° ist spitz, denn er ist kleiner als 180°.“ Stimmt das?`,
          werte: { alpha: a },
          richtig: `Nein. Spitze Winkel sind kleiner als 90°. ${a}° liegt zwischen 90° und 180°, er ist stumpf.`,
          falsch: [
            ['winkelart', 'Ja. Alle Winkel unter 180° sind spitz.'],
            ['gegenseite', `Nein. Er ist ${360 - a}° groß, also überstumpf.`],
          ],
          weg: [
            'spitz: unter 90°, recht: 90°, stumpf: zwischen 90° und 180°.',
            `90° < ${a}° < 180°`,
          ],
        };
  },
);

/** „Der gegenüberliegende Winkel ist der Nebenwinkel?“ (M.RF.GF.WINKELPAARE.BEGRUENDEN) */
export const gfWinkelpaarAussage = aussagenGenerator(
  'gf.winkelpaar-aussage',
  ['winkelpaare-namen', 'gleich-oder-180'],
  ['alpha'],
  (r) => {
    let a = 5 * r.int(5, 31);
    if (a === 90) a = 85;
    return {
      situation: `Zwei Geraden schneiden sich. Ein Winkel ist α = ${a}°. Tim sagt: „Der Winkel gegenüber von α ist sein Nebenwinkel, also 180° − ${a}° = ${180 - a}°.“ Stimmt das?`,
      werte: { alpha: a },
      richtig: `Nein. Der gegenüberliegende Winkel ist der Scheitelwinkel. Scheitelwinkel sind gleich groß: ${a}°.`,
      falsch: [
        [
          'winkelpaare-namen',
          'Ja. Gegenüberliegende Winkel heißen Nebenwinkel und ergänzen sich zu 180°.',
        ],
        [
          'gleich-oder-180',
          `Nein. Er ist der Scheitelwinkel, und Scheitelwinkel ergeben zusammen 180°: ${180 - a}°.`,
        ],
      ],
      weg: [
        'Nebenwinkel liegen nebeneinander an einer Geraden (zusammen 180°). Scheitelwinkel liegen sich gegenüber (gleich groß).',
        `Scheitelwinkel von α: ${a}°`,
      ],
    };
  },
);

const GEGENUEBER: Record<number, number> = { 1: 3, 3: 1, 2: 4, 4: 2, 5: 6, 6: 5 };
const IM_NETZ_NEBENEINANDER = ['1-2', '2-3', '3-4', '2-5', '2-6'];

/** „Welche Flächen liegen beim Würfel gegenüber?“ (M.RF.KP.DARSTELLEN.BEGRUENDEN) */
export const kpNetzAussage = aussagenGenerator(
  'kp.netz-aussage',
  ['netz-falten', 'netz-nachbar'],
  ['i', 'j'],
  (r) => {
    const i = r.int(1, 5);
    const j = r.int(i + 1, 6);
    const gegen = GEGENUEBER[i] === j;
    const nebenImNetz = IM_NETZ_NEBENEINANDER.includes(`${i}-${j}`);
    const netz =
      'Ein Würfelnetz besteht aus einem Streifen mit den Flächen 1, 2, 3, 4 nebeneinander, dazu Fläche 5 über der 2 und Fläche 6 unter der 2.';
    return {
      situation: `${netz} Lena sagt: „Beim gefalteten Würfel liegt Fläche ${i} gegenüber von Fläche ${j}.“ Stimmt das?`,
      werte: { i, j },
      richtig: gegen
        ? `Ja. ${i === 5 ? 'Beide hängen an Fläche 2, auf entgegengesetzten Seiten.' : 'Im Streifen liegt genau eine Fläche dazwischen.'} Beim Falten kommen sie gegenüber.`
        : `Nein. Gegenüber von ${i} liegt ${GEGENUEBER[i] ?? 0}. Die Flächen ${i} und ${j} stoßen beim Falten an einer Kante zusammen.`,
      falsch: gegen
        ? [
            [
              'netz-falten',
              'Nein. Gegenüber liegen nur die beiden Flächen ganz außen im Streifen.',
            ],
            ['netz-nachbar', `Nein. ${i} und ${j} werden beim Falten Nachbarn.`],
          ]
        : [
            [
              'netz-falten',
              nebenImNetz
                ? 'Ja. Flächen, die im Netz nebeneinander liegen, kommen beim Falten gegenüber.'
                : 'Ja. Flächen, die im Netz nicht nebeneinander liegen, kommen beim Falten gegenüber.',
            ],
            ['netz-nachbar', `Ja. Gegenüber von ${i} liegt immer die Fläche ${j}.`],
          ],
      weg: [
        'Im Streifen 1, 2, 3, 4 liegen sich 1 und 3 sowie 2 und 4 gegenüber. 5 und 6 hängen an verschiedenen Seiten der 2.',
        'Gegenüber: 1 und 3, 2 und 4, 5 und 6.',
      ],
    };
  },
);

/** „Die Verschiebung geht nur nach rechts?“ (M.RF.SY.BEWEGUNGEN.BEGRUENDEN) */
export const syBewegungAussage = aussagenGenerator(
  'sy.bewegung-aussage',
  ['verschiebung', 'bewegung-erkennen'],
  ['x', 'y', 'dx', 'dy'],
  (r) => {
    const x = r.int(1, 5);
    const y = r.int(4, 8);
    const dx = r.int(1, 6);
    const dy = r.pick([-1, 1]) * r.int(1, 3);
    return {
      situation: `Der Punkt P(${x}|${y}) wird verschoben und landet bei P'(${x + dx}|${y + dy}). Ben sagt: „Die Verschiebung geht ${dx} nach rechts.“ Stimmt das?`,
      werte: { x, y, dx, dy },
      richtig: `Nicht ganz. Die Verschiebung geht ${dx} nach rechts und ${Math.abs(dy)} nach ${dy > 0 ? 'oben' : 'unten'}. Zu einer Verschiebung gehören Richtung und Weite.`,
      falsch: [
        ['verschiebung', 'Ja. Nach oben oder unten zählt bei einer Verschiebung nicht.'],
        ['bewegung-erkennen', `Nein. P' ist gespiegelt worden, nicht verschoben.`],
      ],
      weg: [
        `x: ${x} → ${x + dx}, also ${dx} nach rechts.`,
        `y: ${y} → ${y + dy}, also ${Math.abs(dy)} nach ${dy > 0 ? 'oben' : 'unten'}.`,
      ],
    };
  },
);

/** „Der Bildpunkt liegt auf der Achse?“ (M.RF.SY.SPIEGELN.BEGRUENDEN) */
export const sySpiegelAussage = aussagenGenerator(
  'sy.spiegel-aussage',
  ['spiegelabstand', 'spiegeln-koordinate'],
  ['x', 'y', 's'],
  (r) => {
    const s = r.int(4, 8);
    const x = r.int(1, s - 1);
    const y = r.int(1, 6);
    const d = s - x;
    return {
      situation: `Der Punkt P(${x}|${y}) wird an der senkrechten Geraden durch x = ${s} gespiegelt. Sara sagt: „Der Bildpunkt ist P'(${s}|${y}), er liegt auf der Achse.“ Stimmt das?`,
      werte: { x, y, s },
      richtig: `Nein. P' liegt genauso weit hinter der Achse wie P davor, ${d} Einheiten: P'(${s + d}|${y}).`,
      falsch: [
        ['spiegelabstand', 'Ja. Beim Spiegeln kommt der Punkt auf die Spiegelachse.'],
        [
          'spiegeln-koordinate',
          `Nein. P'(${x}|${y + 2 * d}), denn der Punkt springt um den doppelten Abstand.`,
        ],
      ],
      weg: [
        `Abstand von P zur Achse: ${s} − ${x} = ${d}.`,
        `Auf der anderen Seite ${d} weiter: ${s} + ${d} = ${s + d}, y bleibt ${y}.`,
      ],
    };
  },
);

const FIGUREN = [
  {
    name: 'Ein Rechteck (kein Quadrat)',
    behauptet: 4,
    grund: ', auch die Diagonalen',
    richtig:
      'Nein. Ein Rechteck hat 2 Symmetrieachsen, die Mittellinien. Faltet man an einer Diagonale, passen die Hälften nicht aufeinander.',
    ja: 'Ja. Jede Linie durch zwei Ecken ist eine Symmetrieachse.',
    anders: 'Nein. Es hat keine Symmetrieachse, nur einen Symmetriepunkt.',
  },
  {
    name: 'Ein Quadrat',
    behauptet: 2,
    grund: ', eine waagerechte und eine senkrechte',
    richtig:
      'Nein. Ein Quadrat hat 4 Symmetrieachsen: die beiden Mittellinien und die beiden Diagonalen.',
    ja: 'Ja. Symmetrieachsen sind immer waagerecht oder senkrecht.',
    anders: 'Nein. Es hat 8 Symmetrieachsen, an jeder Ecke und jeder Seite eine.',
  },
  {
    name: 'Ein gleichseitiges Dreieck',
    behauptet: 1,
    grund: ', die senkrechte Linie in der Mitte',
    richtig:
      'Nein. Es hat 3 Symmetrieachsen, von jeder Ecke zur Mitte der gegenüberliegenden Seite.',
    ja: 'Ja. Ein Dreieck hat nur eine Symmetrieachse.',
    anders: 'Nein. Es hat keine Symmetrieachse.',
  },
  {
    name: 'Ein Parallelogramm (ohne rechte Winkel, Seiten verschieden lang)',
    behauptet: 2,
    grund: ', die beiden Diagonalen',
    richtig:
      'Nein. Es hat keine Symmetrieachse. Es ist nur punktsymmetrisch zum Schnittpunkt der Diagonalen.',
    ja: 'Ja. Die Diagonalen teilen jedes Viereck in zwei gleiche Hälften.',
    anders: 'Nein. Es hat 4 Symmetrieachsen.',
  },
  {
    name: 'Eine Raute (kein Quadrat)',
    behauptet: 4,
    grund: ', wie ein Quadrat',
    richtig:
      'Nein. Eine Raute hat 2 Symmetrieachsen, die beiden Diagonalen. An den Mittellinien passen die Hälften nicht aufeinander.',
    ja: 'Ja. Alle Seiten sind gleich lang, also ist sie symmetrisch wie ein Quadrat.',
    anders: 'Nein. Sie hat keine Symmetrieachse.',
  },
  {
    name: 'Ein regelmäßiges Sechseck',
    behauptet: 3,
    grund: ', durch gegenüberliegende Ecken',
    richtig:
      'Nein. Es hat 6 Symmetrieachsen: 3 durch gegenüberliegende Ecken und 3 durch gegenüberliegende Seitenmitten.',
    ja: 'Ja. Nur die Linien durch Ecken sind Symmetrieachsen.',
    anders: 'Nein. Es hat 12 Symmetrieachsen.',
  },
] as const;

/** „Wie viele Symmetrieachsen?“ (M.RF.SY.SYMMETRIE.BEGRUENDEN) */
export const syAchsenAussage = aussagenGenerator(
  'sy.achsen-aussage',
  ['achsensymmetrie', 'achsen-gezaehlt'],
  ['figur'],
  (r) => {
    const i = r.int(0, FIGUREN.length - 1);
    const f = FIGUREN[i] ?? FIGUREN[0];
    return {
      situation: `Ida sagt: „${f.name} hat ${f.behauptet} Symmetrie${f.behauptet === 1 ? 'achse' : 'achsen'}${f.grund}.“ Stimmt das?`,
      werte: { figur: i },
      richtig: f.richtig,
      falsch: [
        ['achsensymmetrie', f.ja],
        ['achsen-gezaehlt', f.anders],
      ],
      weg: [
        'Probe durch Falten: Nur wenn beide Hälften genau aufeinanderpassen, ist die Linie eine Symmetrieachse.',
        f.richtig.replace(/^Nein\. /, ''),
      ],
    };
  },
);
