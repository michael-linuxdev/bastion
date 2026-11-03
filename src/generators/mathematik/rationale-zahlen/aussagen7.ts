// Rationale Zahlen, Niveau E – Klasse 7 (K-31): Rechen- und Ordnungsregeln begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => {
  const s = String(Math.round(Math.abs(x) * 1000) / 1000).replace('.', ',');
  return x < 0 ? `−${s}` : s;
};

/** „a − (−b) = a − b“ – stimmt das? (M.ZO.RZ.ADD-SUB.BEGRUENDEN) */
export const rzMinusMinusAussage = aussagenGenerator(
  'rz.minus-minus-aussage',
  ['rechen-vorzeichen', 'vorzeichen-falsch'],
  ['a', 'b'],
  (r) => {
    const a = r.int(2, 9) + r.pick([0, 0.5]);
    const b = r.int(1, 9) + r.pick([0, 0.5]);
    return {
      situation: `Tim rechnet: ${dez(a)} − (−${dez(b)}) = ${dez(a)} − ${dez(b)} = ${dez(a - b)}. Stimmt das?`,
      werte: { a, b },
      richtig: `Nein. Eine negative Zahl subtrahieren heißt ihre Gegenzahl addieren: ${dez(a)} + ${dez(b)} = ${dez(a + b)}.`,
      falsch: [
        ['rechen-vorzeichen', 'Ja. Zwei Minuszeichen hintereinander fasst man zu einem zusammen.'],
        ['vorzeichen-falsch', `Nein. Richtig ist ${dez(-(a + b))}.`],
      ],
      weg: [
        `−(−${dez(b)}) = +${dez(b)}: Minus vor einer negativen Zahl macht Plus.`,
        `${dez(a)} + ${dez(b)} = ${dez(a + b)}`,
      ],
    };
  },
);

/** „Von −a °C auf b °C: Unterschied b − a?“ (M.ZO.RZ.BEGRIFF.BEGRUENDEN) */
export const rzAbstandAussage = aussagenGenerator(
  'rz.abstand-aussage',
  ['abstand-ueber-null', 'unter-null-ignoriert'],
  ['a', 'b'],
  (r) => {
    const a = r.int(2, 9);
    const b = a + r.int(1, 8);
    return {
      situation: `Am Morgen sind es −${a} °C, am Mittag ${b} °C. Ben sagt: „Der Unterschied ist ${b} − ${a} = ${b - a} Grad.“ Stimmt das?`,
      werte: { a, b },
      richtig: `Nein. Von −${a} bis 0 sind es ${a} Grad, von 0 bis ${b} noch ${b} Grad: zusammen ${a + b} Grad.`,
      falsch: [
        ['abstand-ueber-null', 'Ja. Man zieht die kleinere Zahl von der größeren ab.'],
        [
          'unter-null-ignoriert',
          `Nein. Der Unterschied ist ${b} Grad, denn unter 0 zählt nicht mit.`,
        ],
      ],
      weg: [
        'Die beiden Zahlen liegen auf verschiedenen Seiten der 0. Gehe über die 0.',
        `${a} + ${b} = ${a + b}. Rechnung: ${b} − (−${a}) = ${a + b}.`,
      ],
    };
  },
);

/** „Minus mal Minus ist Plus, also positiv?“ (M.ZO.RZ.MULT-DIV.BEGRUENDEN) */
export const rzVorzeichenAussage = aussagenGenerator(
  'rz.vorzeichen-aussage',
  ['vorzeichen-falsch', 'null-faktor', 'komma-mal'],
  ['null', 'a', 'b', 'c'],
  (r) => {
    const mitNull = r.int(0, 1) === 1;
    const a = r.int(2, 9);
    const b = r.int(2, 5);
    const c = r.int(2, 5);
    if (mitNull) {
      const term = `(−${a}) · 0 · (−${b})`;
      return {
        situation: `Lea sagt über ${term}: „Das Ergebnis ist positiv, weil Minus mal Minus Plus ergibt.“ Stimmt das?`,
        werte: { null: 1, a, b, c },
        richtig:
          'Nein. Ein Faktor ist 0, also ist das Ergebnis 0. Die 0 ist weder positiv noch negativ.',
        falsch: [
          ['null-faktor', `Ja. Zwei Minuszeichen, also ist das Ergebnis ${a * b}.`],
          ['vorzeichen-falsch', `Nein. Das Ergebnis ist negativ: −${a * b}.`],
        ],
        weg: ['Ist ein Faktor 0, ist das ganze Produkt 0.', `${term} = 0`],
      };
    }
    const term = `(−0,${a}) · (−${b}) · (−${c})`;
    const wert = (a * b * c) / 10;
    return {
      situation: `Lea sagt über ${term}: „Das Ergebnis ist positiv, weil Minus mal Minus Plus ergibt.“ Stimmt das?`,
      werte: { null: 0, a, b, c },
      richtig: `Nein. Es sind drei negative Faktoren, eine ungerade Anzahl. Das Ergebnis ist negativ: ${term} = ${dez(-wert)}.`,
      falsch: [
        ['vorzeichen-falsch', `Ja. ${term} = ${dez(wert)}.`],
        ['komma-mal', `Nein. Es ist negativ: ${term} = −${a * b * c}.`],
      ],
      weg: [
        'Zähle die negativen Faktoren: gerade Anzahl ergibt Plus, ungerade Anzahl Minus.',
        `0,${a} · ${b} · ${c} = ${dez(wert)}, drei Minus: ${dez(-wert)}.`,
      ],
    };
  },
);

/** „−p > −q, weil p > q“ – stimmt das? (M.ZO.RZ.ORDNEN.BEGRUENDEN) */
export const rzOrdnenAussage = aussagenGenerator(
  'rz.ordnen-aussage',
  ['nach-betrag', 'zeichen-verdreht'],
  ['p', 'q'],
  (r) => {
    const p = r.int(3, 9) + r.int(1, 9) / 10;
    const q = r.int(1, Math.floor(p) - 1) + r.int(1, 9) / 10;
    return {
      situation: `Ole sagt: „${dez(-p)} ist größer als ${dez(-q)}, weil ${dez(p)} größer als ${dez(q)} ist.“ Stimmt das?`,
      werte: { p, q },
      richtig: `Nein. ${dez(-q)} ist größer, denn es liegt auf der Zahlengeraden weiter rechts, näher an 0.`,
      falsch: [
        ['nach-betrag', 'Ja. Je größer die Zahl ohne Minus, desto größer die Zahl.'],
        ['zeichen-verdreht', `Ja. ${dez(-p)} < ${dez(-q)}, also ist ${dez(-p)} größer.`],
      ],
      weg: [
        'Bei negativen Zahlen ist die Zahl größer, die näher an 0 liegt.',
        `${dez(-p)} < ${dez(-q)}`,
      ],
    };
  },
);

/** „−a² = a²“ oder „(−a)² = −a²“ – stimmt das? (M.ZO.RZ.POTENZEN.BEGRUENDEN) */
export const rzPotenzAussage = aussagenGenerator(
  'rz.potenz-aussage',
  ['potenz-klammer', 'hochzahl-mal'],
  ['a', 'klammer'],
  (r) => {
    const a = r.int(3, 9);
    const klammer = r.int(0, 1) === 1;
    const q = a * a;
    return klammer
      ? {
          situation: `Mia rechnet: (−${a})² = −${q}. Stimmt das?`,
          werte: { a, klammer: 1 },
          richtig: `Nein. Mit Klammer wird −${a} mit sich selbst malgenommen: (−${a}) · (−${a}) = ${q}.`,
          falsch: [
            ['potenz-klammer', 'Ja. Das Minus bleibt vor dem Quadrat stehen.'],
            ['hochzahl-mal', `Nein. (−${a})² = −${2 * a}.`],
          ],
          weg: [`(−${a})² = (−${a}) · (−${a})`, `Minus mal Minus ist Plus: ${q}.`],
        }
      : {
          situation: `Mia rechnet: −${a}² = ${q}. Stimmt das?`,
          werte: { a, klammer: 0 },
          richtig: `Nein. Ohne Klammer gehört die Hochzahl nur zur ${a}: −${a}² = −(${a} · ${a}) = −${q}.`,
          falsch: [
            ['potenz-klammer', `Ja. −${a} mal −${a} ist ${q}.`],
            ['hochzahl-mal', `Nein. −${a}² = −${2 * a}.`],
          ],
          weg: [`−${a}² heißt −(${a}²).`, `${a}² = ${q}, also −${a}² = −${q}.`],
        };
  },
);

/** „−a + b + a geschickt rechnen“ (M.ZO.RZ.RECHENGESETZE.BEGRUENDEN) */
export const rzGegenzahlAussage = aussagenGenerator(
  'rz.gegenzahl-aussage',
  ['gegenzahl-summe', 'gegenzahl-zusammengefasst'],
  ['a', 'b'],
  (r) => {
    const a = r.int(2, 9) + r.pick([0, 0.5]);
    const b = r.int(1, 9) + r.pick([0, 0.25]);
    const A = dez(a);
    const B = dez(b);
    return {
      situation: `Welcher Rechenweg für −${A} + ${B} + ${A} ist geschickt und richtig?`,
      werte: { a, b },
      richtig: `−${A} + ${A} + ${B} = 0 + ${B} = ${B}, denn eine Zahl und ihre Gegenzahl ergeben 0.`,
      falsch: [
        [
          'gegenzahl-summe',
          `${A} + ${B} + ${A} = ${dez(2 * a + b)}, denn das Minus darf man weglassen.`,
        ],
        [
          'gegenzahl-zusammengefasst',
          `−${dez(2 * a)} + ${B} = ${dez(b - 2 * a)}, denn −${A} und ${A} ergeben −${dez(2 * a)}.`,
        ],
      ],
      weg: [
        'Vertausche so, dass Zahl und Gegenzahl nebeneinander stehen.',
        `−${A} + ${A} = 0, bleibt ${B}.`,
      ],
    };
  },
);

/** „Zwischen −a und −(a − 1) liegt keine Zahl“ – stimmt das? (M.ZO.RZ.ZAHLBEREICHE.BEGRUENDEN) */
export const rzDichteAussage = aussagenGenerator(
  'rz.dichte-aussage',
  ['dichte', 'zahlbereiche'],
  ['a', 'teil'],
  (r) => {
    const a = r.int(2, 9);
    const d = r.pick([0.1, 0.25, 0.5, 0.75]);
    const bsp = -(a - 1 + d);
    return {
      situation: `Jonas sagt: „Zwischen −${a} und −${a - 1} liegt keine rationale Zahl, denn das sind benachbarte ganze Zahlen.“ Stimmt das?`,
      werte: { a, teil: Math.round(d * 100) },
      richtig: `Nein. Zum Beispiel liegt ${dez(bsp)} dazwischen. Zwischen zwei rationalen Zahlen liegen immer unendlich viele weitere.`,
      falsch: [
        ['dichte', `Ja. Nach −${a} kommt direkt −${a - 1}.`],
        ['zahlbereiche', 'Ja. Dezimalzahlen mit Minus gehören zu keinem Zahlbereich.'],
      ],
      weg: [
        'Ganze Zahlen haben Nachbarn, rationale Zahlen nicht.',
        `−${a} < ${dez(bsp)} < −${a - 1}`,
      ],
    };
  },
);
