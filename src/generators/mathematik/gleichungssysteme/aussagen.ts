// Gleichungssysteme, Niveau E – Klasse 8 (K-31): Lösbarkeit, Einsetzen und Aufstellen begründen.
import { aussagenGenerator } from '../../aussagen';

const z = (x: number) => (x < 0 ? `−${-x}` : String(x));
const gerade = (m: number, n: number) =>
  `y = ${m === 1 ? '' : m === -1 ? '−' : `${z(m)} · `}x ${n < 0 ? '−' : '+'} ${Math.abs(n)}`;

/** „Wie viele Lösungen hat das System?“ (M.SF.GS.GRAFISCH.BEGRUENDEN) */
export const gsLoesbarkeitAussage = aussagenGenerator(
  'gs.loesbarkeit-aussage',
  ['loesbarkeit', 'achsenschnitt'],
  ['m1', 'n1', 'm2', 'n2'],
  (r) => {
    const m1 = r.pick([-2, -1, 1, 2, 3]);
    const parallel = r.int(0, 1) === 1;
    let n1 = r.int(-5, 5);
    if (n1 === 0) n1 = 3;
    let m2 = m1;
    let n2 = n1 + r.pick([-3, -2, 2, 3]);
    let x0 = 0;
    let y0 = 0;
    if (!parallel) {
      m2 = m1 + r.pick([-2, -1, 1, 2]);
      if (m2 === 0) m2 = m1 + 3;
      x0 = r.int(-3, 3);
      if (x0 === 0) x0 = 2;
      y0 = m1 * x0 + n1;
      n2 = y0 - m2 * x0;
    }
    return {
      situation: `Das System besteht aus ${gerade(m1, n1)} und ${gerade(m2, n2)}. Wie viele Lösungen hat es?`,
      werte: { m1, n1, m2, n2 },
      richtig: parallel
        ? `Keine Lösung: Beide Geraden haben den Anstieg ${z(m1)}, sie sind parallel und schneiden sich nie.`
        : `Genau eine Lösung: Die Anstiege sind verschieden, die Geraden schneiden sich in (${z(x0)}|${z(y0)}).`,
      falsch: parallel
        ? [
            ['loesbarkeit', 'Genau eine Lösung, denn zwei Geraden schneiden sich immer.'],
            [
              'achsenschnitt',
              `Genau eine: (0|${z(n1)}), dort schneidet die erste Gerade die y-Achse.`,
            ],
          ]
        : [
            ['loesbarkeit', 'Keine Lösung, denn die Geraden haben verschiedene Anstiege.'],
            [
              'achsenschnitt',
              `Genau eine: (0|${z(n1)}), dort schneidet die erste Gerade die y-Achse.`,
            ],
          ],
      weg: [
        'Gleicher Anstieg und verschiedener y-Achsenabschnitt: parallel, keine Lösung. Verschiedene Anstiege: genau ein Schnittpunkt.',
        parallel
          ? `Beide Anstiege sind ${z(m1)}, die Abschnitte ${z(n1)} und ${z(n2)} verschieden.`
          : `Gleichsetzen ergibt x = ${z(x0)}, eingesetzt y = ${z(y0)}.`,
      ],
    };
  },
);

/** „Welcher Schritt beim Einsetzen ist richtig?“ (M.SF.GS.RECHNERISCH.BEGRUENDEN) */
export const gsEinsetzenAussage = aussagenGenerator(
  'gs.einsetzen-aussage',
  ['falsch-eingesetzt', 'x-y-vertauscht'],
  ['a', 'b', 'c', 'd'],
  (r) => {
    const a = r.int(2, 5);
    const b = r.int(1, 9);
    const c = r.int(2, 5);
    const x = r.int(1, 6);
    const d = c * x + a * x + b;
    return {
      situation: `Gesucht sind x und y mit y = ${a} · x + ${b} und ${c} · x + y = ${d}. Welcher erste Schritt ist richtig?`,
      werte: { a, b, c, d },
      richtig: `${c} · x + (${a} · x + ${b}) = ${d}, denn für y wird der ganze Term eingesetzt. Dann ist x = ${x}.`,
      falsch: [
        ['falsch-eingesetzt', `${c} · x + ${a} · x = ${d}, denn das ${b} gehört nicht zu y.`],
        [
          'x-y-vertauscht',
          `${c} · (${a} · y + ${b}) + y = ${d}, denn der Term wird für x eingesetzt.`,
        ],
      ],
      weg: [
        `y steht allein in der ersten Gleichung: Setze ${a} · x + ${b} für y in die zweite ein.`,
        `${c + a} · x + ${b} = ${d}, also ${c + a} · x = ${d - b} und x = ${x}, y = ${a * x + b}.`,
      ],
    };
  },
);

/** „Welches Gleichungssystem passt?“ – Eintritt für Kinder und Erwachsene (M.SF.GS.SACH.BEGRUENDEN) */
export const gsSachAussage = aussagenGenerator(
  'gs.sach-aussage',
  ['vertauscht', 'preise-vertauscht', 'halb-halb'],
  ['personen', 'kind', 'erwachsen', 'summe'],
  (r) => {
    const pk = r.int(3, 6);
    const pe = pk + r.int(2, 5);
    const k = r.int(3, 9);
    const e = r.int(2, 8);
    const n = k + e;
    const s = pk * k + pe * e;
    return {
      situation: `${n} Personen besuchen ein Museum. Ein Kind zahlt ${pk} €, ein Erwachsener ${pe} €, zusammen sind es ${s} €. k ist die Zahl der Kinder, e die der Erwachsenen. Welches Gleichungssystem passt?`,
      werte: { personen: n, kind: pk, erwachsen: pe, summe: s },
      richtig: `k + e = ${n} und ${pk} · k + ${pe} · e = ${s}: eine Gleichung zählt Personen, die andere Euro.`,
      falsch: [
        ['vertauscht', `k + e = ${s} und ${pk} · k + ${pe} · e = ${n}.`],
        ['preise-vertauscht', `k + e = ${n} und ${pe} · k + ${pk} · e = ${s}.`],
        ['halb-halb', `k = e = ${n} : 2, denn ohne weitere Angabe sind es gleich viele.`],
      ],
      weg: [
        `Personen: k + e = ${n}. Geld: Kinder zahlen ${pk} €, Erwachsene ${pe} €, also ${pk} · k + ${pe} · e = ${s}.`,
        `Lösung: k = ${k}, e = ${e}. Probe: ${pk} · ${k} + ${pe} · ${e} = ${s}.`,
      ],
    };
  },
);
