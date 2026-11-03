// Daten und Zufall, Niveau E – Klasse 7 (K-31): Diagramme, Ereignisse und Chancen begründen.
import { aussagenGenerator } from '../../aussagen';

const menge = (xs: number[]) => `{${xs.join(', ')}}`;

/** „Die Säule ist doppelt so hoch, also doppelt so viel?“ (M.DZ.DA.DIAGRAMME.BEGRUENDEN) */
export const daAchseAussage = aussagenGenerator(
  'da.achse-aussage',
  ['achse-nicht-null', 'hoehe-abgelesen'],
  ['start', 'a', 'b'],
  (r) => {
    const s = r.pick([50, 100, 200]);
    const d = r.pick([5, 10, 20]);
    const h = r.int(2, 3);
    const a = s + d;
    const b = s + h * d;
    const mal = h === 2 ? 'doppelt' : 'dreimal';
    return {
      situation: `In einem Säulendiagramm beginnt die y-Achse bei ${s}. Säule A zeigt ${a}, Säule B zeigt ${b}. Säule B ist ${mal} so hoch wie Säule A. Ist der Wert von B ${mal} so groß?`,
      werte: { start: s, a, b },
      richtig: `Nein. B ist ${b}, A ist ${a}: B ist nur ${b - a} größer. Die Säulen wirken größer, weil die Achse erst bei ${s} beginnt.`,
      falsch: [
        [
          'achse-nicht-null',
          `Ja. ${mal === 'doppelt' ? 'Doppelt' : 'Dreimal'} so hoch heißt ${mal} so viel.`,
        ],
        ['hoehe-abgelesen', `Ja. B ist ${b - s} und A ist ${a - s} hoch.`],
      ],
      weg: [
        'Lies die Werte an der Achse ab, nicht die Höhe der Säulen.',
        `A = ${a}, B = ${b}. ${b} ist nicht ${h}-mal ${a}, denn ${h} · ${a} = ${h * a}.`,
      ],
    };
  },
);

/** „Ein Ereignis ist ein Ergebnis?“ (M.DZ.ZF.BEGRIFFE.BEGRUENDEN) */
export const zfEreignisAussage = aussagenGenerator(
  'zf.ereignis-aussage',
  ['ereignis-begriff', 'ergebnismenge', 'grenze'],
  ['art', 'k'],
  (r) => {
    const art = r.int(0, 4);
    const k = art === 2 ? r.int(2, 4) : art === 3 ? r.int(3, 5) : 0;
    const alle = [1, 2, 3, 4, 5, 6];
    const arten: [[string, (x: number) => boolean], ...[string, (x: number) => boolean][]] = [
      ['gerade', (x) => x % 2 === 0],
      ['ungerade', (x) => x % 2 === 1],
      [`größer als ${k}`, (x) => x > k],
      [`kleiner als ${k}`, (x) => x < k],
      ['durch 3 teilbar', (x) => x % 3 === 0],
    ];
    const [bed, inA] = arten[art] ?? arten[0];
    const a = alle.filter(inA);
    const x = r.pick(a);
    const mitGrenze = art === 2 ? alle.filter((y) => y >= k) : alle.filter((y) => y <= k);
    return {
      situation: `Beim Würfeln ist A: „Die Augenzahl ist ${bed}“. Lea sagt: „A ist das Ergebnis ${x}, denn beim Würfeln fällt immer nur eine Zahl.“ Stimmt das?`,
      werte: { art, k },
      richtig: `Nein. Ein Ereignis ist eine Menge von Ergebnissen: A = ${menge(a)}. Fällt eine dieser Zahlen, ist A eingetreten.`,
      falsch: [
        ['ereignis-begriff', 'Ja. Ein Ereignis ist immer genau ein Ergebnis.'],
        ['ergebnismenge', `Nein. A = ${menge(alle)}, denn jede Zahl kann fallen.`],
        ...(art === 2 || art === 3
          ? [['grenze', `Nein. A = ${menge(mitGrenze)}, die ${k} gehört dazu.`] as [string, string]]
          : []),
      ],
      weg: [
        'Ein Ergebnis ist eine einzelne Zahl, ein Ereignis eine Menge von Ergebnissen.',
        `Zu A gehören alle Augenzahlen, die ${bed} sind: ${menge(a)}.`,
      ],
    };
  },
);

/** „In A sind mehr rote Kugeln, also ist die Chance größer?“ (M.DZ.ZF.WAHRSCHEINLICHKEIT.BEGRUENDEN) */
export const zfChanceAussage = aussagenGenerator(
  'zf.chance-aussage',
  ['anzahl-statt-anteil', 'nur-blaue'],
  ['rot1', 'gesamt1', 'rot2', 'gesamt2'],
  (r) => {
    const r2 = r.int(2, 4);
    const n2 = r2 + r.int(1, 3);
    const r1 = r2 + r.int(1, 3);
    const n1 = Math.ceil((r1 * n2) / r2) + r.int(1, 3);
    return {
      situation: `Beutel A: ${r1} rote und ${n1 - r1} blaue Kugeln. Beutel B: ${r2} rote und ${n2 - r2} blaue Kugeln. Tom sagt: „In A ist die Chance auf Rot größer, denn dort liegen mehr rote Kugeln.“ Stimmt das?`,
      werte: { rot1: r1, gesamt1: n1, rot2: r2, gesamt2: n2 },
      richtig: `Nein. Es zählt der Anteil: P(rot) ist in A ${r1}/${n1}, in B ${r2}/${n2}, und ${r2}/${n2} ist größer.`,
      falsch: [
        ['anzahl-statt-anteil', `Ja. ${r1} rote Kugeln sind mehr als ${r2}.`],
        [
          'nur-blaue',
          `Nein. In B liegen weniger blaue Kugeln (${n2 - r2} statt ${n1 - r1}), deshalb ist die Chance dort größer.`,
        ],
      ],
      weg: [
        'Wahrscheinlichkeit = passende Ergebnisse : alle Ergebnisse.',
        `Vergleiche ${r1}/${n1} und ${r2}/${n2} über Kreuz: ${r1} · ${n2} = ${r1 * n2} < ${r2} · ${n1} = ${r2 * n1}.`,
      ],
    };
  },
);
