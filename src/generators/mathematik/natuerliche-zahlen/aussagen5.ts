// Terme und Gleichungen mit natürlichen Zahlen, Niveau E – Klasse 5 (K-31): Rechenregeln begründen.
import { aussagenGenerator } from '../../aussagen';

/** „Punkt vor Strich und Klammern“ (M.SF.NZ.TERME.BEGRUENDEN) */
export const nzKlammerAussage = aussagenGenerator(
  'nz.klammer-aussage',
  ['punkt-vor-strich', 'klammer'],
  ['a', 'b', 'c', 'mitklammer'],
  (r) => {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    const mitKlammer = r.int(0, 1) === 1;
    return mitKlammer
      ? {
          situation: `Tim rechnet: (${a} + ${b}) · ${c} = ${a} + ${b * c} = ${a + b * c}. Stimmt das?`,
          werte: { a, b, c, mitklammer: 1 },
          richtig: `Nein. Was in der Klammer steht, wird zuerst gerechnet: ${a + b} · ${c} = ${(a + b) * c}.`,
          falsch: [
            ['klammer', 'Ja. Punkt vor Strich gilt auch, wenn eine Klammer dasteht.'],
            ['punkt-vor-strich', 'Ja. Malnehmen kommt immer zuerst.'],
          ],
          weg: [`Klammer zuerst: ${a} + ${b} = ${a + b}.`, `${a + b} · ${c} = ${(a + b) * c}`],
        }
      : {
          situation: `Tim rechnet: ${a} + ${b} · ${c} = ${a + b} · ${c} = ${(a + b) * c}. Stimmt das?`,
          werte: { a, b, c, mitklammer: 0 },
          richtig: `Nein. Punkt vor Strich: erst ${b} · ${c} = ${b * c}, dann ${a} + ${b * c} = ${a + b * c}.`,
          falsch: [
            ['punkt-vor-strich', 'Ja. Man rechnet von links nach rechts.'],
            ['klammer', `Ja. Man darf sich eine Klammer um ${a} + ${b} dazudenken.`],
          ],
          weg: [
            `Ohne Klammer: Malnehmen vor Addieren.`,
            `${b} · ${c} = ${b * c}, ${a} + ${b * c} = ${a + b * c}`,
          ],
        };
  },
);

/** „Größte Zahl mit y + a < b“ (M.SF.NZ.GLEICHUNGEN.BEGRUENDEN) */
export const nzUngleichungAussage = aussagenGenerator(
  'nz.ungleichung-aussage',
  ['grenze-mitgezaehlt', 'umkehraufgabe'],
  ['a', 'b'],
  (r) => {
    const a = r.int(2, 20);
    const b = a + r.int(3, 30);
    return {
      situation: `Lea sagt: „Die größte natürliche Zahl y mit y + ${a} < ${b} ist ${b - a}.“ Stimmt das?`,
      werte: { a, b },
      richtig: `Nein. Bei y = ${b - a} wäre y + ${a} = ${b}, und ${b} ist nicht kleiner als ${b}. Die größte Zahl ist ${b - a - 1}.`,
      falsch: [
        ['grenze-mitgezaehlt', `Ja. ${b} − ${a} = ${b - a}, und die Grenze gehört dazu.`],
        ['umkehraufgabe', `Nein. Die größte Zahl ist ${b} + ${a} = ${b + a}.`],
      ],
      weg: [
        `Zuerst die Gleichung y + ${a} = ${b}: y = ${b - a}.`,
        `Bei < muss y kleiner sein: y = ${b - a - 1}. Probe: ${b - a - 1} + ${a} = ${b - 1} < ${b}.`,
      ],
    };
  },
);
