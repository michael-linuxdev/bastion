// Funktionen, Niveau E – Klasse 8 (K-31): Aussagen über Funktionen prüfen und begründen.
import { aussagenGenerator } from '../../aussagen';

const z = (x: number) => (x < 0 ? `−${-x}` : String(x));

/** „Ist die Zuordnung eine Funktion?“ (M.SF.FK.BEGRIFF.BEGRUENDEN) */
export const fkFunktionAussage = aussagenGenerator(
  'fk.funktion-aussage',
  ['eindeutigkeit', 'x-oder-y'],
  ['doppeltesx'],
  (r) => {
    const doppeltesX = r.int(0, 1) === 1;
    const xs = [1, 2, 3, 4];
    const ys = [r.int(2, 9), r.int(10, 19), r.int(20, 29), r.int(30, 39)];
    // Doppeltes x: zweimal x = 2 mit verschiedenen y; sonst zweimal derselbe y-Wert
    const paare = doppeltesX
      ? [`1 → ${ys[0]}`, `2 → ${ys[1]}`, `2 → ${ys[2]}`, `4 → ${ys[3]}`]
      : [`1 → ${ys[0]}`, `2 → ${ys[1]}`, `3 → ${ys[1]}`, `4 → ${ys[3]}`];
    void xs;
    return {
      situation: `Eine Zuordnung x → y: ${paare.join('; ')}. Ist sie eine Funktion?`,
      werte: { doppeltesx: doppeltesX ? 1 : 0 },
      richtig: doppeltesX
        ? `Nein. Zu x = 2 gehören zwei y-Werte, ${ys[1]} und ${ys[2]}. Eine Funktion ordnet jedem x genau ein y zu.`
        : `Ja. Jedes x hat genau einen y-Wert. Dass 2 und 3 denselben Wert ${ys[1]} haben, ist erlaubt.`,
      falsch: doppeltesX
        ? [
            ['eindeutigkeit', 'Ja. Alle y-Werte sind verschieden, also ist sie eine Funktion.'],
            [
              'x-oder-y',
              'Ja. Jeder y-Wert kommt nur einmal vor, mehr verlangt eine Funktion nicht.',
            ],
          ]
        : [
            ['eindeutigkeit', `Nein. Der y-Wert ${ys[1]} kommt zweimal vor.`],
            ['x-oder-y', 'Nein. Zu jedem y muss es genau ein x geben.'],
          ],
      weg: [
        'Eine Funktion ordnet jedem x genau einen y-Wert zu. Prüfe die x-Werte, nicht die y-Werte.',
        doppeltesX
          ? 'x = 2 kommt mit zwei verschiedenen y-Werten vor: keine Funktion.'
          : 'Jedes x kommt nur einmal vor: Funktion.',
      ],
    };
  },
);

/** „Der Graph steigt, weil n positiv ist.“ (M.SF.FK.EIGENSCHAFTEN.BEGRUENDEN) */
export const fkSteigenAussage = aussagenGenerator(
  'fk.steigen-aussage',
  ['steigen-fallen', 'x-oder-y'],
  ['m', 'n'],
  (r) => {
    const fallend = r.int(0, 1) === 1;
    const m = fallend ? -r.int(1, 4) : r.int(1, 4);
    const n = fallend ? r.int(1, 6) : -r.int(1, 6);
    const behauptet = fallend ? 'steigt' : 'fällt';
    const wirklich = fallend ? 'fällt' : 'steigt';
    return {
      situation: `Tim sagt über f(x) = ${z(m)} · x ${n < 0 ? '−' : '+'} ${Math.abs(n)}: „Der Graph ${behauptet}, weil ${z(n)} ${n > 0 ? 'positiv' : 'negativ'} ist.“ Stimmt das?`,
      werte: { m, n },
      richtig: `Nein. Ob ein Graph steigt oder fällt, entscheidet der Anstieg m = ${z(m)}. Der Graph ${wirklich}.`,
      falsch: [
        [
          'steigen-fallen',
          `Ja. ${n > 0 ? 'Positive' : 'Negative'} Zahlen bedeuten, dass der Graph ${behauptet}.`,
        ],
        ['x-oder-y', `Ja. Bei x = 0 ist f(0) = ${z(n)}, und dieser Wert bestimmt die Richtung.`],
      ],
      weg: [
        'n gibt an, wo der Graph die y-Achse schneidet. Die Richtung gibt m an.',
        `m = ${z(m)} ist ${m > 0 ? 'positiv: Der Graph steigt' : 'negativ: Der Graph fällt'}.`,
      ],
    };
  },
);

/** „m = (x₂ − x₁) : (y₂ − y₁)“ – stimmt das? (M.SF.FK.LINEAR-GLEICHUNG.BEGRUENDEN) */
export const fkAnstiegAussage = aussagenGenerator(
  'fk.anstieg-aussage',
  ['kehrwert', 'reihenfolge'],
  ['x1', 'y1', 'x2', 'y2'],
  (r) => {
    const m = r.pick([-3, -2, 2, 3]);
    const x1 = r.int(-2, 2);
    const dx = r.pick([1, 2]);
    const y1 = r.int(-3, 3);
    const x2 = x1 + dx;
    const y2 = y1 + m * dx;
    const k = (a: number, b: number) => `${z(a)} − ${b < 0 ? `(${z(b)})` : z(b)}`;
    const bruch = (o: number, u: number) => {
      const w = o / u;
      return Number.isInteger(w) ? z(w) : `${z(o)} : ${z(u)}`;
    };
    return {
      situation: `Die Gerade geht durch P(${z(x1)}|${z(y1)}) und Q(${z(x2)}|${z(y2)}). Ida rechnet den Anstieg so: m = (${k(x2, x1)}) : (${k(y2, y1)}). Stimmt das?`,
      werte: { x1, y1, x2, y2 },
      richtig: `Nein. Der Anstieg ist Höhenunterschied durch Breite: m = (${k(y2, y1)}) : (${k(x2, x1)}) = ${z(m)}.`,
      falsch: [
        ['kehrwert', `Ja. Damit ist m = ${bruch(dx, m * dx)}.`],
        ['reihenfolge', `Nein. Richtig ist m = (${k(y2, y1)}) : (${k(x1, x2)}) = ${z(-m)}.`],
      ],
      weg: [
        'm = (y₂ − y₁) : (x₂ − x₁): oben die y-Werte, unten die x-Werte, beide in derselben Reihenfolge.',
        `(${k(y2, y1)}) : (${k(x2, x1)}) = ${z(m * dx)} : ${dx} = ${z(m)}`,
      ],
    };
  },
);

/** „Die Nullstelle ist n.“ (M.SF.FK.NULLSTELLE.BEGRUENDEN) */
export const fkNullstelleAussage = aussagenGenerator(
  'fk.nullstelle-aussage',
  ['nullstelle-achse', 'vorzeichen-graph'],
  ['m', 'n'],
  (r) => {
    const m = r.pick([-3, -2, 2, 3, 4]);
    let x0 = r.int(-4, 4);
    if (x0 === 0) x0 = 2;
    const n = -m * x0;
    return {
      situation: `Für f(x) = ${z(m)} · x ${n < 0 ? '−' : '+'} ${Math.abs(n)} sagt Lena: „Die Nullstelle ist ${z(n)}, denn dort schneidet der Graph eine Achse.“ Stimmt das?`,
      werte: { m, n },
      richtig: `Nein. Bei ${z(n)} schneidet der Graph die y-Achse. Die Nullstelle ist dort, wo f(x) = 0: x = ${z(x0)}.`,
      falsch: [
        [
          'nullstelle-achse',
          'Ja. Die Zahl ohne x gibt den Schnittpunkt mit der Achse an, und das ist die Nullstelle.',
        ],
        ['vorzeichen-graph', `Nein. Die Nullstelle ist x = ${z(-x0)}.`],
      ],
      weg: [
        `f(x) = 0 setzen: ${z(m)} · x ${n < 0 ? '−' : '+'} ${Math.abs(n)} = 0.`,
        `${z(m)} · x = ${z(-n)}, also x = ${z(x0)}. Probe: ${z(m)} · ${x0 < 0 ? `(${z(x0)})` : z(x0)} ${n < 0 ? '−' : '+'} ${Math.abs(n)} = 0.`,
      ],
    };
  },
);

/** „Die Gerade schneidet die y-Achse bei m.“ (M.SF.FK.LINEAR-GRAPH.BEGRUENDEN) */
export const fkAchsenabschnittAussage = aussagenGenerator(
  'fk.achsenabschnitt-aussage',
  ['m-n-vertauscht', 'vorzeichen-graph'],
  ['m', 'n'],
  (r) => {
    const m = r.pick([-3, -2, 2, 3, 4]);
    let n = r.int(-6, 6);
    if (n === 0 || n === m || n === -m) n = m > 0 ? 5 : -5;
    return {
      situation: `Ole sagt über y = ${z(m)} · x ${n < 0 ? '−' : '+'} ${Math.abs(n)}: „Die Gerade schneidet die y-Achse bei ${z(m)}.“ Stimmt das?`,
      werte: { m, n },
      richtig: `Nein. Bei x = 0 ist y = ${z(n)}. Dort schneidet die Gerade die y-Achse, ${z(m)} ist der Anstieg.`,
      falsch: [
        ['m-n-vertauscht', 'Ja. Die Zahl vor x gibt an, wo die Gerade die y-Achse schneidet.'],
        ['vorzeichen-graph', `Nein. Sie schneidet die y-Achse bei ${z(-n)}.`],
      ],
      weg: [
        'Auf der y-Achse ist x = 0. Setze x = 0 ein.',
        `y = ${z(m)} · 0 ${n < 0 ? '−' : '+'} ${Math.abs(n)} = ${z(n)}`,
      ],
    };
  },
);

/** „Was kostet die Fahrt?“ – Tarif mit Grundgebühr (M.SF.FK.SACH.BEGRUENDEN) */
export const fkTarifAussage = aussagenGenerator(
  'fk.tarif-aussage',
  ['grundgebuehr', 'grundgebuehr-mal', 'm-n-vertauscht'],
  ['grund', 'preis', 'km'],
  (r) => {
    const g = r.int(4, 7); // größer als p: sonst g + p · k = g · k + p
    const p = r.int(2, 3);
    const k = r.int(5, 12);
    return {
      situation: `Ein Taxi kostet ${g} € Grundgebühr und ${p} € je Kilometer. Was kostet eine Fahrt über ${k} km?`,
      werte: { grund: g, preis: p, km: k },
      richtig: `${g} + ${p} · ${k} = ${g + p * k} €, denn die Grundgebühr zahlt man einmal, den Preis je Kilometer ${k}-mal.`,
      falsch: [
        ['grundgebuehr', `${p} · ${k} = ${p * k} €, denn bezahlt werden nur die Kilometer.`],
        [
          'grundgebuehr-mal',
          `(${g} + ${p}) · ${k} = ${(g + p) * k} €, denn für jeden Kilometer zahlt man beides.`,
        ],
        [
          'm-n-vertauscht',
          `${g} · ${k} + ${p} = ${g * k + p} €, denn die Grundgebühr gilt je Kilometer.`,
        ],
      ],
      weg: [
        `Kosten = Grundgebühr + Preis je km · km: y = ${p} · x + ${g}.`,
        `y = ${p} · ${k} + ${g} = ${g + p * k} €`,
      ],
    };
  },
);
