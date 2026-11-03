// Gleichungen, Niveau E – Klasse 7 (K-31): Aufstellen, Umstellen, Lösen und Probe begründen.
import { aussagenGenerator } from '../../aussagen';

const z = (x: number) => (x < 0 ? `−${-x}` : String(x));
const fach: Record<number, string> = {
  2: 'Doppelte',
  3: 'Dreifache',
  4: 'Vierfache',
  5: 'Fünffache',
};

/** „Welche Gleichung passt zum Zahlenrätsel?“ (M.SF.GL.AUFSTELLEN.BEGRUENDEN) */
export const glTextAussage = aussagenGenerator(
  'gl.text-aussage',
  ['text-in-term', 'klammer-falsch'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(2, 5);
    const b = r.int(2, 9);
    const x = r.int(3, 9);
    const c = a * x - b;
    return {
      situation: `Jonas denkt sich eine Zahl x. Er nimmt das ${fach[a]} der Zahl und subtrahiert dann ${b}. Er erhält ${c}. Welche Gleichung passt?`,
      werte: { a, b, c },
      richtig: `${a} · x − ${b} = ${c}, denn zuerst wird die Zahl mit ${a} malgenommen, danach ${b} abgezogen.`,
      falsch: [
        ['text-in-term', `${a} + x − ${b} = ${c}, denn „das ${fach[a]}“ heißt ${a} dazu.`],
        ['klammer-falsch', `${a} · (x − ${b}) = ${c}, denn die ${b} wird von der Zahl abgezogen.`],
      ],
      weg: [
        `„Das ${fach[a]} der Zahl“: ${a} · x. „Dann subtrahiert ${b}“: ${a} · x − ${b}.`,
        `Probe mit x = ${x}: ${a} · ${x} − ${b} = ${c}.`,
      ],
    };
  },
);

/** „V = a · b · c nach c umgestellt“ – stimmt das? (M.SF.GL.FORMELN.BEGRUENDEN) */
export const glFormelAussage = aussagenGenerator(
  'gl.formel-aussage',
  ['umstellen-halb', 'teilen-vertauscht'],
  ['volumen', 'a', 'b'],
  (r) => {
    const a = r.int(2, 6);
    const b = r.int(2, 5);
    const c = r.int(2, 9);
    const v = a * b * c;
    return {
      situation: `Ein Quader hat das Volumen V = ${v} cm³ und die Kanten a = ${a} cm und b = ${b} cm. Lea stellt V = a · b · c nach c um und rechnet c = V : a = ${b * c} cm. Stimmt das?`,
      werte: { volumen: v, a, b },
      richtig: `Nein. Auf der Seite von c stehen a und b als Faktoren: c = V : (a · b) = ${v} : ${a * b} = ${c} cm.`,
      falsch: [
        ['umstellen-halb', `Ja. Man teilt V durch die erste Kante: ${v} : ${a} = ${b * c}.`],
        ['teilen-vertauscht', `Nein. Richtig ist c = (a · b) : V = ${a * b} : ${v}.`],
      ],
      weg: [
        'Teile beide Seiten von V = a · b · c durch a · b.',
        `c = ${v} : (${a} · ${b}) = ${v} : ${a * b} = ${c}. Probe: ${a} · ${b} · ${c} = ${v}.`,
      ],
    };
  },
);

/** „a · x = d − b, also x = d − b“ – stimmt das? (M.SF.GL.LINEAR.BEGRUENDEN) */
export const glLoesenAussage = aussagenGenerator(
  'gl.loesen-aussage',
  ['nicht-fertig', 'umkehraufgabe'],
  ['a', 'b', 'd'],
  (r) => {
    const a = r.int(2, 6);
    const b = r.int(2, 9);
    const x = r.int(2, 9);
    const d = a * x + b;
    return {
      situation: `Ole löst ${a} · x + ${b} = ${d}. Er schreibt: „${a} · x = ${d - b}, also x = ${d - b}.“ Stimmt das?`,
      werte: { a, b, d },
      richtig: `Nein. Er muss noch durch ${a} teilen: x = ${d - b} : ${a} = ${x}.`,
      falsch: [
        ['nicht-fertig', `Ja. Die ${b} ist auf der anderen Seite, damit ist die Gleichung gelöst.`],
        ['umkehraufgabe', `Nein. Richtig ist ${a} · x = ${d + b}.`],
      ],
      weg: [
        `Minus ${b} auf beiden Seiten: ${a} · x = ${d - b}. Dann durch ${a}: x = ${x}.`,
        `Probe: ${a} · ${x} + ${b} = ${d}.`,
      ],
    };
  },
);

/** „Ist x = −k eine Lösung?“ – Probe mit negativer Zahl (M.SF.GL.TERMWERT.BEGRUENDEN) */
export const glProbeAussage = aussagenGenerator(
  'gl.probe-aussage',
  ['einsetzen-klammer', 'probe-halb'],
  ['a', 'b', 'c', 'k'],
  (r) => {
    const a = r.int(2, 5);
    const b = r.int(1, 9);
    const k = r.int(1, 5);
    const c = b - a * k;
    return {
      situation: `Mia prüft, ob x = −${k} die Gleichung ${a} · x + ${b} = ${z(c)} löst. Sie rechnet ${a} · ${k} + ${b} = ${a * k + b} und sagt: „Keine Lösung.“ Hat sie recht?`,
      werte: { a, b, c, k },
      richtig: `Nein. −${k} muss mit Klammer eingesetzt werden: ${a} · (−${k}) + ${b} = ${z(c)}. Beide Seiten sind gleich, x = −${k} ist eine Lösung.`,
      falsch: [
        [
          'einsetzen-klammer',
          `Ja. ${a * k + b} ist nicht ${z(c)}, also ist x = −${k} keine Lösung.`,
        ],
        [
          'probe-halb',
          `Nein. Beim Einsetzen kommt eine Zahl heraus, also ist x = −${k} eine Lösung.`,
        ],
      ],
      weg: [
        `Setze −${k} mit Klammer ein: ${a} · (−${k}) = ${z(-a * k)}.`,
        `${z(-a * k)} + ${b} = ${z(c)}. Die rechte Seite ist auch ${z(c)}: Lösung.`,
      ],
    };
  },
);
