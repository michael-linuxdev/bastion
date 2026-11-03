// Geometrie, Niveau E – Klasse 7 (K-31): Flächen, Körper, Konstruktion, Koordinaten und Kreis begründen.
import { aussagenGenerator } from '../../aussagen';

const z = (x: number) => (x < 0 ? `−${-x}` : String(x));

/** „L-Form: Rechteck plus Ecke?“ (M.GM.FL.VIELECKE.BEGRUENDEN) */
export const flVieleckAussage = aussagenGenerator(
  'fl.vieleck-aussage',
  ['zerlegen', 'umfang-flaeche'],
  ['a', 'b', 'c', 'd'],
  (r) => {
    const a = r.int(6, 12);
    const b = r.int(5, 10);
    const c = r.int(2, a - 2);
    const d = r.int(2, b - 2);
    return {
      situation: `Aus einem Rechteck mit ${a} cm und ${b} cm wird an einer Ecke ein Rechteck mit ${c} cm und ${d} cm herausgeschnitten. Tim rechnet für die Restfläche ${a} · ${b} + ${c} · ${d} = ${a * b + c * d} cm². Stimmt das?`,
      werte: { a, b, c, d },
      richtig: `Nein. Die Ecke fehlt, also wird sie abgezogen: ${a} · ${b} − ${c} · ${d} = ${a * b - c * d} cm².`,
      falsch: [
        ['zerlegen', 'Ja. Man zerlegt die Figur in Rechtecke und addiert sie.'],
        ['umfang-flaeche', `Nein. Die Fläche ist 2 · (${a} + ${b}) = ${2 * (a + b)} cm².`],
      ],
      weg: [
        'Ergänze die Figur zum großen Rechteck und ziehe das fehlende Stück ab.',
        `${a * b} cm² − ${c * d} cm² = ${a * b - c * d} cm²`,
      ],
    };
  },
);

/** „Masse = Volumen : Dichte?“ (M.GM.KP.MASSE.BEGRUENDEN) */
export const kpDichteAussage = aussagenGenerator(
  'kp.dichte-aussage',
  ['dichte-formel', 'zwischenergebnis'],
  ['a', 'b', 'c', 'dichte'],
  (r) => {
    const p = r.int(2, 8);
    const a = p * r.int(1, 2);
    const b = r.int(2, 5);
    const c = r.int(2, 4);
    const v = a * b * c;
    return {
      situation: `Ein Quader ist ${a} dm lang, ${b} dm breit und ${c} dm hoch. Sein Material hat die Dichte ${p} kg/dm³. Wie schwer ist er?`,
      werte: { a, b, c, dichte: p },
      richtig: `${v * p} kg, denn Masse = Dichte · Volumen = ${p} kg/dm³ · ${v} dm³.`,
      falsch: [
        ['dichte-formel', `${v / p} kg, denn Masse = Volumen : Dichte = ${v} : ${p}.`],
        ['zwischenergebnis', `${v} kg, denn das Volumen ist ${v} dm³.`],
      ],
      weg: [
        `Volumen: ${a} · ${b} · ${c} = ${v} dm³.`,
        `Jeder dm³ wiegt ${p} kg: ${v} · ${p} = ${v * p} kg.`,
      ],
    };
  },
);

/** „Mantel der Pyramide mit der Körperhöhe?“ (M.GM.KP.PYRAMIDE.BEGRUENDEN) */
export const kpPyramideHoeheAussage = aussagenGenerator(
  'kp.pyramide-hoehe-aussage',
  ['hoehenarten', 'nicht-halbiert'],
  ['a', 'h', 'hs'],
  (r) => {
    const [halb, h0, s0] = r.pick([
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [6, 8, 10],
    ] as const);
    const k = r.int(1, 2);
    const a = 2 * halb * k;
    const h = h0 * k;
    const hs = s0 * k;
    return {
      situation: `Eine quadratische Pyramide hat die Grundkante a = ${a} cm, die Körperhöhe h = ${h} cm und die Seitenhöhe h_s = ${hs} cm. Lina rechnet den Mantel: 4 · ${a} · ${h} : 2 = ${2 * a * h} cm². Stimmt das?`,
      werte: { a, h, hs },
      richtig: `Nein. Die Seitendreiecke brauchen ihre eigene Höhe h_s, nicht die Körperhöhe: 4 · ${a} · ${hs} : 2 = ${2 * a * hs} cm².`,
      falsch: [
        ['hoehenarten', 'Ja. Die Höhe der Pyramide ist auch die Höhe der Seitendreiecke.'],
        ['nicht-halbiert', `Nein. Richtig ist 4 · ${a} · ${hs} = ${4 * a * hs} cm².`],
      ],
      weg: [
        'Die Körperhöhe steht innen senkrecht. Die Seitenhöhe liegt schräg auf dem Dreieck.',
        `Ein Dreieck: ${a} · ${hs} : 2 = ${a * hs} cm². Vier Dreiecke: ${(4 * a * hs) / 2} cm².`,
      ],
    };
  },
);

/** „Gleiches Volumen, gleich viel Pappe?“ (M.GM.KP.VERPACKUNG.BEGRUENDEN) */
export const kpVerpackungAussage = aussagenGenerator(
  'kp.verpackung-aussage',
  ['volumen-oberflaeche', 'gegenteil-gefragt'],
  ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'],
  (r) => {
    const [m1, m2] = r.pick([
      [
        [2, 4, 8],
        [4, 4, 4],
      ],
      [
        [2, 3, 12],
        [3, 4, 6],
      ],
      [
        [2, 6, 6],
        [3, 3, 8],
      ],
      [
        [1, 6, 6],
        [2, 3, 6],
      ],
    ] as const);
    const k = r.int(1, 3);
    const [a1, b1, c1] = m1.map((x) => x * k) as [number, number, number];
    const [a2, b2, c2] = m2.map((x) => x * k) as [number, number, number];
    const v = a1 * b1 * c1;
    const o = (a: number, b: number, c: number) => 2 * (a * b + a * c + b * c);
    const oa = o(a1, b1, c1);
    const ob = o(a2, b2, c2);
    const mehr = oa > ob ? 'A' : 'B';
    return {
      situation: `Schachtel A misst ${a1} cm × ${b1} cm × ${c1} cm, Schachtel B ${a2} cm × ${b2} cm × ${c2} cm. Paul sagt: „Beide fassen gleich viel, also braucht man für beide gleich viel Pappe.“ Stimmt das?`,
      werte: { a1, b1, c1, a2, b2, c2 },
      richtig: `Nein. Das Volumen ist gleich (${v} cm³), die Oberfläche nicht: A braucht ${oa} cm², B ${ob} cm² Pappe.`,
      falsch: [
        ['volumen-oberflaeche', 'Ja. Gleiches Volumen heißt gleich viel Pappe.'],
        [
          'gegenteil-gefragt',
          `Nein. Schachtel ${mehr} braucht weniger Pappe, denn sie hat die größere Oberfläche.`,
        ],
      ],
      weg: [
        'Für die Pappe zählt die Oberfläche, nicht das Volumen.',
        `O = 2 · (a · b + a · c + b · c): A ${oa} cm², B ${ob} cm².`,
      ],
    };
  },
);

/** „Legen diese Stücke das Viereck eindeutig fest?“ (M.RF.DV.VIERECKE-KONSTRUIEREN.BEGRUENDEN) */
export const dvViereckAussage = aussagenGenerator(
  'dv.viereck-eindeutig-aussage',
  ['zu-wenig', 'zu-viel'],
  ['art', 'a', 'b', 'c', 'd', 'e'],
  (r) => {
    const art = r.int(0, 1);
    const a = r.int(5, 8);
    const b = r.int(5, 8);
    const c = r.int(5, 8);
    const d = r.int(5, 8);
    const e = r.int(Math.max(a, b, c, d), 9);
    const seiten = `a = ${a} cm, b = ${b} cm, c = ${c} cm, d = ${d} cm`;
    return art === 0
      ? {
          situation: `Von einem Viereck ABCD kennt man nur die Seiten ${seiten}. Lena sagt: „Damit ist das Viereck eindeutig festgelegt.“ Stimmt das?`,
          werte: { art, a, b, c, d, e: 0 },
          richtig:
            'Nein. Mit vier Seiten allein kann das Viereck kippen wie ein Gelenk. Man braucht noch eine Diagonale oder einen Winkel.',
          falsch: [
            ['zu-wenig', 'Ja. Beim Dreieck reichen drei Seiten, also beim Viereck vier.'],
            ['zu-viel', 'Nein. Man braucht zusätzlich alle vier Winkel.'],
          ],
          weg: [
            'Ein Viereck braucht fünf passende Stücke.',
            'Mit einer Diagonale zerfällt es in zwei Dreiecke, die nach sss eindeutig sind.',
          ],
        }
      : {
          situation: `Von einem Viereck ABCD kennt man die Seiten ${seiten} und die Diagonale e = AC = ${e} cm. Lena sagt: „Es fehlt noch ein Winkel, sonst ist es nicht eindeutig.“ Stimmt das?`,
          werte: { art, a, b, c, d, e },
          richtig:
            'Nein. Die Diagonale teilt das Viereck in zwei Dreiecke, die nach sss eindeutig sind.',
          falsch: [
            ['zu-viel', 'Ja. Ohne Winkel ist ein Viereck nie eindeutig.'],
            [
              'zu-wenig',
              'Nein. Die vier Seiten allein legen es schon fest, die Diagonale braucht man nicht.',
            ],
          ],
          weg: [
            `Dreieck ABC aus a, b und e, Dreieck ACD aus c, d und e.`,
            'Beide Dreiecke sind nach sss eindeutig, also auch das Viereck.',
          ],
        };
  },
);

/** „An der x-Achse spiegeln: x ändert sich?“ (M.RF.GF.QUADRANTEN.BEGRUENDEN) */
export const gfSpiegelnAussage = aussagenGenerator(
  'gf.spiegeln-aussage',
  ['spiegeln-koordinate', 'beide-vorzeichen'],
  ['x', 'y', 'achse'],
  (r) => {
    const x = r.pick([-1, 1]) * r.int(1, 6);
    const y = r.pick([-1, 1]) * r.int(1, 6);
    const anX = r.int(0, 1) === 1;
    const ac = anX ? 'x' : 'y';
    const falschP = anX ? `(${z(-x)}|${z(y)})` : `(${z(x)}|${z(-y)})`;
    const richtigP = anX ? `(${z(x)}|${z(-y)})` : `(${z(-x)}|${z(y)})`;
    return {
      situation: `P(${z(x)}|${z(y)}) wird an der ${ac}-Achse gespiegelt. Ole sagt: „P' ist ${falschP}, denn bei der ${ac}-Achse ändert sich ${ac}.“ Stimmt das?`,
      werte: { x, y, achse: anX ? 1 : 0 },
      richtig: `Nein. Bei der Spiegelung an der ${ac}-Achse bleibt ${ac} gleich, die andere Koordinate wechselt das Vorzeichen: P'${richtigP}.`,
      falsch: [
        [
          'spiegeln-koordinate',
          `Ja. Beim Spiegeln an der ${ac}-Achse wechselt ${ac} das Vorzeichen.`,
        ],
        ['beide-vorzeichen', `Nein. P'(${z(-x)}|${z(-y)}), denn beide Vorzeichen wechseln.`],
      ],
      weg: [
        `Der Punkt springt über die ${ac}-Achse. Sein Abstand entlang der ${ac}-Achse bleibt gleich.`,
        `P(${z(x)}|${z(y)}) → P'${richtigP}`,
      ],
    };
  },
);

/** „Kanten und Ecken einer Pyramide“ (M.RF.KP.PYRAMIDEN.BEGRUENDEN) */
export const kpPyramideZaehlenAussage = aussagenGenerator(
  'kp.pyramide-zaehlen-aussage',
  ['wie-prisma', 'spitze-vergessen'],
  ['n', 'art'],
  (r) => {
    const n = r.int(3, 8);
    const ecken = r.int(0, 1) === 1;
    return ecken
      ? {
          situation: `Mia sagt: „Eine Pyramide mit ${n}-eckiger Grundfläche hat ${n} Ecken.“ Stimmt das?`,
          werte: { n, art: 1 },
          richtig: `Nein. ${n} Ecken hat die Grundfläche, dazu kommt die Spitze: ${n + 1} Ecken.`,
          falsch: [
            ['spitze-vergessen', `Ja. Die Grundfläche hat ${n} Ecken.`],
            ['wie-prisma', `Nein. Sie hat ${2 * n} Ecken wie ein Prisma.`],
          ],
          weg: ['Zähle unten und oben getrennt.', `${n} + 1 = ${n + 1}`],
        }
      : {
          situation: `Mia sagt: „Eine Pyramide mit ${n}-eckiger Grundfläche hat ${3 * n} Kanten, wie ein Prisma.“ Stimmt das?`,
          werte: { n, art: 0 },
          richtig: `Nein. ${n} Kanten liegen in der Grundfläche und ${n} führen zur Spitze: ${2 * n} Kanten.`,
          falsch: [
            ['wie-prisma', `Ja. Wie beim Prisma: ${n} + ${n} + ${n} = ${3 * n} Kanten.`],
            ['spitze-vergessen', `Nein. Nur die ${n} Kanten der Grundfläche zählen.`],
          ],
          weg: [
            'Eine Pyramide hat keine Deckfläche, die Seitenkanten treffen sich in der Spitze.',
            `${n} + ${n} = ${2 * n}`,
          ],
        };
  },
);

/** „Aus dem Aufriss allein auf den Körper schließen?“ (M.RF.KP.ZWEITAFEL.BEGRUENDEN) */
export const kpZweitafelAussage = aussagenGenerator(
  'kp.zweitafel-aussage',
  ['nur-aufriss', 'ansicht-vollstaendig'],
  ['form', 'a', 'b'],
  (r) => {
    const form = r.int(0, 2);
    const a = r.int(2, 6);
    const b = a + r.int(1, 4);
    const formen = [
      [
        `ein Rechteck (${a} cm × ${b} cm)`,
        'ein Quader',
        'einem Quader',
        'ein stehender Zylinder oder ein dreiseitiges Prisma, das auf einer Seitenfläche liegt,',
      ],
      [
        `ein Dreieck (Grundseite ${a} cm, Höhe ${b} cm)`,
        'eine Pyramide',
        'einer Pyramide',
        'ein Kegel oder ein dreiseitiges Prisma, dessen Dreiecksfläche nach vorn zeigt,',
      ],
      [
        `ein Kreis (Durchmesser ${a} cm)`,
        'eine Kugel',
        'einer Kugel',
        'ein Zylinder, dessen Grundfläche nach vorn zeigt,',
      ],
    ] as const;
    const [figur, koerper, dativ, andere] = formen[form] ?? formen[0];
    return {
      situation: `Der Aufriss eines Körpers ist ${figur}. Ole sagt: „Dann ist der Körper ${koerper}.“ Stimmt das?`,
      werte: { form, a, b: form === 2 ? 0 : b },
      richtig: `Nein. Auch ${andere} kann so einen Aufriss haben. Erst Aufriss und Grundriss zusammen legen den Körper fest.`,
      falsch: [
        ['nur-aufriss', `Ja. Diese Vorderansicht gehört immer zu ${dativ}.`],
        ['ansicht-vollstaendig', 'Ja. Der Aufriss zeigt den ganzen Körper.'],
      ],
      weg: [
        'Eine Ansicht zeigt den Körper nur von einer Seite.',
        'Schau dir zusätzlich den Grundriss an: Er zeigt den Körper von oben.',
      ],
    };
  },
);

const saetze = [
  {
    satz: 'Wenn ein Viereck ein Quadrat ist, dann sind alle vier Seiten gleich lang.',
    umkehrung: 'Wenn in einem Viereck alle vier Seiten gleich lang sind, dann ist es ein Quadrat.',
    wahr: false,
    grund: 'eine Raute mit schiefen Winkeln',
    beide: 'ein Quadrat mit 4 cm Seitenlänge',
  },
  {
    satz: 'Wenn ein Viereck ein Rechteck ist, dann sind seine Diagonalen gleich lang.',
    umkehrung: 'Wenn in einem Viereck die Diagonalen gleich lang sind, dann ist es ein Rechteck.',
    wahr: false,
    grund: 'ein gleichschenkliges Trapez',
    beide: 'ein Rechteck mit 3 cm und 5 cm',
  },
  {
    satz: 'Wenn eine Zahl durch 4 teilbar ist, dann ist sie gerade.',
    umkehrung: 'Wenn eine Zahl gerade ist, dann ist sie durch 4 teilbar.',
    wahr: false,
    grund: 'die Zahl 6',
    beide: 'die Zahl 8',
  },
  {
    satz: 'Wenn ein Dreieck gleichseitig ist, dann sind alle Winkel 60° groß.',
    umkehrung: 'Wenn in einem Dreieck alle Winkel 60° groß sind, dann ist es gleichseitig.',
    wahr: true,
    grund: 'denn gleiche Winkel liegen gleichen Seiten gegenüber',
    beide: 'ein gleichseitiges Dreieck mit 5 cm',
  },
  {
    satz: 'Wenn ein Viereck ein Rechteck ist, dann hat es vier rechte Winkel.',
    umkehrung: 'Wenn ein Viereck vier rechte Winkel hat, dann ist es ein Rechteck.',
    wahr: true,
    grund: 'denn so ist das Rechteck festgelegt',
    beide: 'ein Quadrat',
  },
  {
    satz: 'Wenn eine Zahl auf 0 endet, dann ist sie durch 10 teilbar.',
    umkehrung: 'Wenn eine Zahl durch 10 teilbar ist, dann endet sie auf 0.',
    wahr: true,
    grund: 'denn jedes Vielfache von 10 endet auf 0',
    beide: 'die Zahl 30',
  },
] as const;

/** „Die Umkehrung ist auch wahr“ – stimmt das? (M.RF.KR.BEGRUENDEN.BEGRUENDEN) */
export const krUmkehrungAussage = aussagenGenerator(
  'kr.umkehrung-aussage',
  ['satz-umkehrung', 'gegenbeispiel'],
  ['satz'],
  (r) => {
    const i = r.int(0, saetze.length - 1);
    const s = saetze[i] ?? saetze[0];
    return {
      situation: `Der Satz „${s.satz}“ ist wahr. Ida sagt: „Dann ist auch die Umkehrung wahr.“ Stimmt das?`,
      werte: { satz: i },
      richtig: s.wahr
        ? `Hier ja, aber nicht wegen des Satzes: Die Umkehrung „${s.umkehrung}“ gilt, ${s.grund}.`
        : `Nein. Die Umkehrung „${s.umkehrung}“ ist falsch. Gegenbeispiel: ${s.grund}.`,
      falsch: [
        ['satz-umkehrung', 'Ja. Die Umkehrung eines wahren Satzes ist immer wahr.'],
        ['gegenbeispiel', `Nein. Gegenbeispiel: ${s.beide}.`],
      ],
      weg: [
        'Bei der Umkehrung tauschen Voraussetzung und Behauptung die Plätze.',
        'Die Umkehrung muss man eigens prüfen: mit einem Beweis oder einem Gegenbeispiel.',
      ],
    };
  },
);

/** „Der Umkreismittelpunkt liegt immer innen“ – stimmt das? (M.RF.KR.LAGE.BEGRUENDEN) */
export const krUmkreisAussage = aussagenGenerator(
  'kr.umkreis-aussage',
  ['umkreis-lage', 'um-inkreis'],
  ['alpha', 'beta', 'gamma'],
  (r) => {
    const art = r.int(0, 2);
    let alpha: number;
    let beta: number;
    if (art === 0) {
      const g = 5 * r.int(20, 28);
      alpha = 5 * r.int(3, (180 - g) / 5 - 3);
      beta = 180 - g - alpha;
    } else if (art === 1) {
      alpha = 5 * r.int(4, 14);
      beta = 90 - alpha;
    } else {
      alpha = 5 * r.int(10, 16);
      beta = 5 * r.int(Math.max(10, 19 - alpha / 5), 16);
    }
    const gamma = 180 - alpha - beta;
    const richtig =
      art === 0
        ? `Nein. Das Dreieck hat einen stumpfen Winkel (${gamma}°). Dann liegt der Umkreismittelpunkt außerhalb.`
        : art === 1
          ? 'Nein. Das Dreieck ist rechtwinklig. Dann liegt der Umkreismittelpunkt auf der längsten Seite, in ihrer Mitte.'
          : 'Hier liegt er innen, aber nur, weil alle Winkel spitz sind. Bei einem stumpfen Winkel läge er außerhalb.';
    return {
      situation: `Ein Dreieck hat die Winkel ${alpha}°, ${beta}° und ${gamma}°. Max sagt: „Der Umkreismittelpunkt liegt innen, das ist bei jedem Dreieck so.“ Stimmt das?`,
      werte: { alpha, beta, gamma },
      richtig,
      falsch: [
        ['umkreis-lage', 'Ja. Der Umkreismittelpunkt liegt immer im Dreieck.'],
        [
          'um-inkreis',
          'Ja. Er ist der Schnittpunkt der Winkelhalbierenden, und der liegt immer innen.',
        ],
      ],
      weg: [
        'Der Umkreismittelpunkt ist der Schnittpunkt der Mittelsenkrechten.',
        'Spitzwinklig: innen. Rechtwinklig: Mitte der längsten Seite. Stumpfwinklig: außen.',
      ],
    };
  },
);

/** „Umfangswinkel doppelt so groß wie der Mittelpunktswinkel?“ (M.RF.KR.WINKELSAETZE.BEGRUENDEN) */
export const krZentriAussage = aussagenGenerator(
  'kr.zentri-aussage',
  ['verdoppelt', 'gleichgesetzt'],
  ['mittelpunkt'],
  (r) => {
    const m = 20 * r.int(2, 9);
    return {
      situation: `Ein Mittelpunktswinkel ist ${m}° groß. Lea sagt: „Ein Umfangswinkel über demselben Bogen ist doppelt so groß, also ${2 * m}°.“ Stimmt das?`,
      werte: { mittelpunkt: m },
      richtig: `Nein. Der Umfangswinkel ist halb so groß wie der Mittelpunktswinkel: ${m}° : 2 = ${m / 2}°.`,
      falsch: [
        ['verdoppelt', 'Ja. Der Umfangswinkel ist immer doppelt so groß.'],
        ['gleichgesetzt', `Nein. Beide Winkel sind gleich groß: ${m}°.`],
      ],
      weg: [
        'Satz: Der Mittelpunktswinkel ist doppelt so groß wie jeder Umfangswinkel über demselben Bogen.',
        `${m}° : 2 = ${m / 2}°${m === 180 ? ' (Satz des Thales)' : ''}`,
      ],
    };
  },
);
