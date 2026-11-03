// Zuordnungen, Niveau E – Klasse 6 (K-31): Art der Zuordnung, Dreisatz und Graph begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

/** „Eindeutig, eineindeutig oder mehrdeutig?“ (M.SF.ZU.DARSTELLEN.BEGRUENDEN) */
export const zuEindeutigAussage = aussagenGenerator(
  'zu.eindeutig-aussage',
  ['eindeutigkeit', 'eineindeutig'],
  ['doppeltesx', 'y1', 'y2', 'y3', 'y4'],
  (r) => {
    const doppeltesX = r.int(0, 1) === 1;
    const ys = [r.int(2, 9), r.int(10, 19), r.int(20, 29), r.int(30, 39)] as const;
    const paare = doppeltesX
      ? [`1 → ${ys[0]}`, `2 → ${ys[1]}`, `2 → ${ys[2]}`, `4 → ${ys[3]}`]
      : [`1 → ${ys[0]}`, `2 → ${ys[1]}`, `3 → ${ys[1]}`, `4 → ${ys[3]}`];
    return doppeltesX
      ? {
          situation: `Eine Zuordnung x → y: ${paare.join('; ')}. Ben sagt: „Sie ist eindeutig, denn alle y-Werte sind verschieden.“ Stimmt das?`,
          werte: { doppeltesx: 1, y1: ys[0], y2: ys[1], y3: ys[2], y4: ys[3] },
          richtig: `Nein. Zu x = 2 gehören zwei y-Werte, ${ys[1]} und ${ys[2]}. Die Zuordnung ist mehrdeutig.`,
          falsch: [
            ['eindeutigkeit', 'Ja. Verschiedene y-Werte machen eine Zuordnung eindeutig.'],
            ['eineindeutig', 'Ja. Sie ist sogar eineindeutig, denn kein y-Wert kommt doppelt vor.'],
          ],
          weg: [
            'Eindeutig heißt: Zu jedem x gehört genau ein y. Prüfe die x-Werte.',
            'x = 2 kommt zweimal mit verschiedenen y-Werten vor: mehrdeutig.',
          ],
        }
      : {
          situation: `Eine Zuordnung x → y: ${paare.join('; ')}. Ben sagt: „Sie ist mehrdeutig, denn ${ys[1]} kommt zweimal vor.“ Stimmt das?`,
          werte: { doppeltesx: 0, y1: ys[0], y2: ys[1], y3: ys[1], y4: ys[3] },
          richtig: `Nein. Jedes x hat genau einen y-Wert, also ist sie eindeutig. Nur eineindeutig ist sie nicht, weil ${ys[1]} zweimal vorkommt.`,
          falsch: [
            ['eindeutigkeit', 'Ja. Gleiche y-Werte machen eine Zuordnung mehrdeutig.'],
            ['eineindeutig', 'Nein. Sie ist eineindeutig, denn jedes x kommt nur einmal vor.'],
          ],
          weg: [
            'Eindeutig: zu jedem x genau ein y. Eineindeutig: zusätzlich zu jedem y genau ein x.',
            `Jedes x kommt einmal vor: eindeutig. ${ys[1]} gehört zu 2 und 3: nicht eineindeutig.`,
          ],
        };
  },
);

/** „Mehr Helfer, mehr Zeit?“ – umgekehrt proportional (M.SF.ZU.DREISATZ.BEGRUENDEN) */
export const zuDreisatzAussage = aussagenGenerator(
  'zu.dreisatz-aussage',
  ['art-verwechselt', 'additiv'],
  ['a', 'b', 't'],
  (r) => {
    const a = r.int(2, 4);
    const m = r.int(2, 3);
    const b = a * m;
    let t = m * r.int(4, 8);
    if (t === a * m) t += m;
    const neu = t / m;
    return {
      situation: `${a} Helfer brauchen ${t} Stunden, um einen Garten aufzuräumen. Wie lange brauchen ${b} Helfer, wenn alle gleich schnell arbeiten?`,
      werte: { a, b, t },
      richtig: `${neu} Stunden, denn ${m}-mal so viele Helfer brauchen nur ${m === 2 ? 'die Hälfte' : 'ein Drittel'} der Zeit: ${a} · ${t} = ${b} · ${neu}.`,
      falsch: [
        ['art-verwechselt', `${t * m} Stunden, denn mehr Helfer brauchen mehr Zeit.`],
        [
          'additiv',
          `${t - (b - a)} Stunden, denn für jeden Helfer mehr braucht man eine Stunde weniger.`,
        ],
      ],
      weg: [
        'Mehr Helfer, weniger Zeit: Die Zuordnung ist umgekehrt proportional, das Produkt bleibt gleich.',
        `${a} · ${t} = ${a * t} Helferstunden. ${a * t} : ${b} = ${neu}.`,
      ],
    };
  },
);

/** „Wie sieht der Graph aus?“ (M.SF.ZU.GRAPH.BEGRUENDEN) */
export const zuGraphAussage = aussagenGenerator(
  'zu.graph-aussage',
  ['graph-form', 'x-oder-y'],
  ['art', 'p', 't'],
  (r) => {
    const umgekehrt = r.int(0, 1) === 1;
    const p = r.int(2, 9);
    const t = 2 * r.int(3, 9);
    return umgekehrt
      ? {
          situation: `Bei der Zuordnung „Anzahl der Helfer → Zeit“ brauchen 2 Helfer ${t} Stunden. Ole sagt: „Der Graph ist eine fallende Gerade.“ Stimmt das?`,
          werte: { art: 1, p, t },
          richtig: `Nein. Die Zuordnung ist umgekehrt proportional: 4 Helfer brauchen ${t / 2} Stunden, 8 Helfer ${t / 4} Stunden. Der Graph ist eine fallende Kurve, keine Gerade.`,
          falsch: [
            [
              'graph-form',
              'Ja. Wenn eine Größe wächst und die andere sinkt, ist der Graph eine fallende Gerade.',
            ],
            ['x-oder-y', `Nein. Der Graph geht durch (${t}|2), also steigt er.`],
          ],
          weg: [
            'Umgekehrt proportional: Das Produkt x · y bleibt gleich.',
            `Die Zeit halbiert sich bei doppelt so vielen Helfern: ${t}, ${t / 2}, ${t / 4}. Die Abstände werden kleiner, deshalb ist der Graph gekrümmt.`,
          ],
        }
      : {
          situation: `Bei der Zuordnung „Menge in kg → Preis in €“ kostet 1 kg ${p} €. Ole sagt: „Der Graph ist eine Gerade durch (0|${p}).“ Stimmt das?`,
          werte: { art: 0, p, t },
          richtig: `Nein. Für 0 kg zahlt man 0 €. Der Graph ist eine Gerade durch den Ursprung und durch (1|${p}).`,
          falsch: [
            ['graph-form', 'Ja. Jede Gerade passt zu einer proportionalen Zuordnung.'],
            ['x-oder-y', `Nein. Die Gerade geht durch den Ursprung und durch (${p}|1).`],
          ],
          weg: [
            'Proportional: Der Graph ist eine Gerade durch den Ursprung (0|0).',
            `1 kg kostet ${p} €: Punkt (1|${p}). x ist die Menge, y der Preis.`,
          ],
        };
  },
);

/** „Je mehr, desto mehr – also proportional?“ (M.SF.ZU.PROPORTIONAL.BEGRUENDEN) */
export const zuQuotientAussage = aussagenGenerator(
  'zu.quotient-aussage',
  ['je-desto', 'gleich-viel'],
  ['art', 'm', 'n'],
  (r) => {
    const fallend = r.int(0, 1) === 1;
    const m = r.int(2, 4);
    let n = fallend ? r.int(20, 30) : r.int(1, 5);
    if (fallend && n === 3 * m) n += 1;
    const xs = [1, 2, 3, 4];
    const ys = xs.map((x) => (fallend ? n - m * x : m * x + n));
    const tabelle = xs.map((x, i) => `${x} → ${ys[i]}`).join('; ');
    const y1 = ys[0] ?? 0;
    const y2 = ys[1] ?? 0;
    return fallend
      ? {
          situation: `Tabelle x → y: ${tabelle}. Mia sagt: „Die Zuordnung ist umgekehrt proportional, denn je größer x, desto kleiner y.“ Stimmt das?`,
          werte: { art: 1, m, n },
          richtig: `Nein. Die Produkte x · y sind nicht gleich: 1 · ${y1} = ${y1}, aber 2 · ${y2} = ${2 * y2}. Umgekehrt proportional heißt: x · y bleibt gleich.`,
          falsch: [
            ['je-desto', 'Ja. Je mehr x, desto weniger y: Das heißt umgekehrt proportional.'],
            ['gleich-viel', `Ja. y wird bei jedem Schritt um ${m} kleiner.`],
          ],
          weg: [
            'Prüfe das Produkt x · y für mehrere Paare.',
            `${y1} und ${2 * y2} sind verschieden.`,
          ],
        }
      : {
          situation: `Tabelle x → y: ${tabelle}. Mia sagt: „Die Zuordnung ist proportional, denn je größer x, desto größer y.“ Stimmt das?`,
          werte: { art: 0, m, n },
          richtig: `Nein. Die Quotienten y : x sind nicht gleich: ${y1} : 1 = ${y1}, aber ${y2} : 2 = ${dez(y2 / 2)}. Proportional heißt: y : x bleibt gleich.`,
          falsch: [
            ['je-desto', 'Ja. Je mehr x, desto mehr y: Das heißt proportional.'],
            ['gleich-viel', `Ja. y wächst bei jedem Schritt um ${m}.`],
          ],
          weg: [
            'Prüfe den Quotienten y : x für mehrere Paare.',
            `${y1} und ${dez(y2 / 2)} sind verschieden.`,
          ],
        };
  },
);
