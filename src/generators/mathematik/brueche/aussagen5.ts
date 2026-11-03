// Brüche und Dezimalzahlen, Niveau E – Klasse 5 (K-31): Grundvorstellungen begründen.
// Neue Datei im Musterfeld: Die Stufe-1-Vorlagen bleiben unverändert (K-31).
import { aussagenGenerator } from '../../aussagen';

const d2 = (x: number) => x.toFixed(2).replace('.', ',');

/** „z/n von G: G : n und fertig?“ (M.ZO.BR.ANTEIL-VON.BEGRUENDEN) */
export const brAnteilVonAussage = aussagenGenerator(
  'br.anteil-von-aussage',
  ['anteil-ein-schritt', 'vertauscht'],
  ['z', 'n', 'ganzes'],
  (r) => {
    const n = r.int(3, 8);
    const z = r.int(2, n - 1);
    const g = n * r.int(2, 9);
    return {
      situation: `Gesucht sind ${z}/${n} von ${g} Kindern. Tim rechnet ${g} : ${n} = ${g / n} und sagt: „Das sind ${g / n} Kinder.“ Stimmt das?`,
      werte: { z, n, ganzes: g },
      richtig: `Nein. ${g} : ${n} = ${g / n} ist erst 1/${n}. ${z}/${n} sind ${z} · ${g / n} = ${(z * g) / n} Kinder.`,
      falsch: [
        ['anteil-ein-schritt', 'Ja. Man teilt durch den Nenner, dann ist man fertig.'],
        ['vertauscht', `Nein. Man teilt durch ${z} und nimmt mal ${n}.`],
      ],
      weg: [
        `Erst in ${n} gleiche Teile teilen: ${g} : ${n} = ${g / n}.`,
        `Dann ${z} Teile nehmen: ${z} · ${g / n} = ${(z * g) / n}.`,
      ],
    };
  },
);

/** „Gefärbt durch ungefärbt?“ (M.ZO.BR.BEGRIFF.BEGRUENDEN) */
export const brBildAussage = aussagenGenerator(
  'br.bild-aussage',
  ['teil-zu-rest', 'vertauscht', 'gegenteil'],
  ['gefaerbt', 'alle'],
  (r) => {
    const g = r.int(3, 10);
    let f = r.int(1, g - 1);
    if (2 * f === g) f = f === 1 ? 2 : f - 1;
    const u = g - f;
    return {
      situation: `Ein Rechteck ist in ${g} gleich große Teile geteilt, ${f} davon sind gefärbt. Lea schreibt für den gefärbten Anteil ${f}/${u}. Stimmt das?`,
      werte: { gefaerbt: f, alle: g },
      richtig: `Nein. Der Nenner zählt alle ${g} Teile, der Zähler die gefärbten: ${f}/${g}.`,
      falsch: [
        ['teil-zu-rest', 'Ja. Man schreibt gefärbte durch ungefärbte Teile.'],
        ['vertauscht', `Nein. Der Anteil ist ${g}/${f}.`],
        ['gegenteil', `Nein. Der Anteil ist ${u}/${g}.`],
      ],
      weg: [
        'Nenner: In wie viele gleiche Teile ist das Ganze geteilt?',
        `Zähler: Wie viele davon sind gefärbt? ${f}/${g}`,
      ],
    };
  },
);

/** „0,45 > 0,5, weil 45 > 5?“ (M.ZO.BR.DEZ-ORDNEN.BEGRUENDEN) */
export const brLaengerAussage = aussagenGenerator(
  'br.laenger-aussage',
  ['laenger-groesser', 'zeichen-verdreht'],
  ['x', 'yz'],
  (r) => {
    const x = r.int(2, 9);
    const yz = 10 * (x - 1) + r.int(1, 9);
    const A = `0,${x}`;
    const B = `0,${yz}`;
    return {
      situation: `Jonas sagt: „${B} ist größer als ${A}, weil ${yz} größer als ${x} ist.“ Stimmt das?`,
      werte: { x, yz },
      richtig: `Nein. ${A} = ${A}0, und ${x}0 Hundertstel sind mehr als ${yz} Hundertstel. Also ist ${A} größer.`,
      falsch: [
        ['laenger-groesser', 'Ja. Mehr Ziffern hinter dem Komma bedeuten eine größere Zahl.'],
        ['zeichen-verdreht', `Ja. ${A} > ${B}, also ist ${B} die größere Zahl.`],
      ],
      weg: [
        'Vergleiche Stelle für Stelle: zuerst die Zehntel.',
        `${A}: ${x} Zehntel. ${B}: ${x - 1} Zehntel. ${x} > ${x - 1}.`,
      ],
    };
  },
);

/** „Rechtsbündig untereinander addieren?“ (M.ZO.BR.DEZ-RECHNEN.BEGRUENDEN) */
export const brKommaUnterAussage = aussagenGenerator(
  'br.komma-unter-aussage',
  ['komma-unter-komma', 'ziffern-getrennt'],
  ['a', 'b', 'c', 'de'],
  (r) => {
    const a = r.int(1, 9);
    const b = r.int(1, 9);
    const c = r.int(1, 9);
    let de = r.int(11, 89);
    if (de % 10 === 0) de += 1;
    const A = `${a},${b}`;
    const B = `${c},${de}`;
    const falschSumme = (10 * a + b + 100 * c + de) / 100;
    const summe = (100 * (a + c) + 10 * b + de) / 100;
    return {
      situation: `Mia schreibt ${A} + ${B} so untereinander, dass die letzten Ziffern übereinander stehen, und erhält ${d2(falschSumme)}. Stimmt das?`,
      werte: { a, b, c, de },
      richtig: `Nein. Komma muss unter Komma stehen, damit Zehntel unter Zehnteln stehen: ${A}0 + ${B} = ${d2(summe)}.`,
      falsch: [
        [
          'komma-unter-komma',
          'Ja. Man schreibt die Zahlen rechtsbündig untereinander wie bei natürlichen Zahlen.',
        ],
        [
          'ziffern-getrennt',
          `Nein. Vor dem Komma ${a} + ${c} = ${a + c}, dahinter ${b} + ${de} = ${b + de}, also ${a + c},${b + de}.`,
        ],
      ],
      weg: [
        `Schreibe ${A} als ${A}0, dann stehen gleich viele Stellen hinter dem Komma.`,
        `${A}0 + ${B} = ${d2(summe)}`,
      ],
    };
  },
);

/** „z/100 = 0,z?“ (M.ZO.BR.DEZIMAL.BEGRUENDEN) */
export const brStellenwertAussage = aussagenGenerator(
  'br.stellenwert-aussage',
  ['stellenwert-dezimal', 'komma-als-bruchstrich'],
  ['z', 'nenner'],
  (r) => {
    const z = r.int(1, 9);
    const n = r.pick([100, 1000]);
    const richtigeZahl = n === 100 ? `0,0${z}` : `0,00${z}`;
    const name = n === 100 ? 'Hundertstel' : 'Tausendstel';
    const stelle = n === 100 ? 'zweiten' : 'dritten';
    return {
      situation: `Ben schreibt ${z}/${n} als Dezimalzahl 0,${z}. Stimmt das?`,
      werte: { z, nenner: n },
      richtig: `Nein. ${name} stehen an der ${stelle} Stelle hinter dem Komma: ${z}/${n} = ${richtigeZahl}.`,
      falsch: [
        ['stellenwert-dezimal', `Ja. Die ${z} kommt direkt hinter das Komma.`],
        ['komma-als-bruchstrich', `Nein. ${z}/${n} = ${z},${n}.`],
      ],
      weg: [
        'Hinter dem Komma: Zehntel, Hundertstel, Tausendstel.',
        `${z} ${name} = ${richtigeZahl}; 0,${z} wären ${z} Zehntel.`,
      ],
    };
  },
);

/** „Oben und unten dasselbe addieren?“ (M.ZO.BR.ERWEITERN.BEGRUENDEN) */
export const brErweiternAussage = aussagenGenerator(
  'br.erweitern-aussage',
  ['additiv', 'nur-nenner'],
  ['a', 'b', 'k'],
  (r) => {
    const b = r.int(3, 9);
    const a = r.int(1, b - 1);
    const k = r.int(1, 4);
    const m = r.int(2, 4);
    return {
      situation: `Ole sagt: „${a}/${b} = ${a + k}/${b + k}, denn ich habe oben und unten ${k} addiert.“ Stimmt das?`,
      werte: { a, b, k },
      richtig: `Nein. Erweitern heißt: oben und unten mit derselben Zahl malnehmen, zum Beispiel ${a}/${b} = ${a * m}/${b * m}. Addieren ändert den Wert.`,
      falsch: [
        ['additiv', 'Ja. Wenn man oben und unten das Gleiche macht, bleibt der Wert gleich.'],
        ['nur-nenner', `Nein. Man ändert nur den Nenner: ${a}/${b * m}.`],
      ],
      weg: [
        'Beim Erweitern werden die Teile kleiner und es werden entsprechend mehr.',
        `Mal ${m}: ${a}/${b} = ${a * m}/${b * m}.`,
      ],
    };
  },
);

const PROZENTE = [
  [0.5, 50, '5'],
  [0.25, 25, '2,5'],
  [0.75, 75, '7,5'],
  [0.1, 10, '1'],
  [0.2, 20, '2'],
  [0.01, 1, '0,1'],
] as const;

/** „0,5 = 5 %?“ (M.ZO.BR.PROZENT.BEGRUENDEN) */
export const brProzentAussage = aussagenGenerator(
  'br.prozent-aussage',
  ['prozent-hundertstel', 'komma-verschoben'],
  ['wert'],
  (r) => {
    const i = r.int(0, PROZENTE.length - 1);
    const [x, p, falschP] = PROZENTE[i] ?? PROZENTE[0];
    const X = String(x).replace('.', ',');
    return {
      situation: `Lina sagt: „${X} = ${falschP} %.“ Stimmt das?`,
      werte: { wert: x },
      richtig: `Nein. Prozent heißt Hundertstel: ${X} = ${p}/100 = ${p} %.`,
      falsch: [
        ['prozent-hundertstel', 'Ja. Man schreibt die Ziffern hinter dem Komma und hängt % an.'],
        ['komma-verschoben', `Nein. ${X} = ${p * 10} %.`],
      ],
      weg: ['1 % = 1/100 = 0,01.', `${X} = ${p} Hundertstel = ${p} %`],
    };
  },
);

/** „Größerer Nenner oder größerer Zähler, also größer?“ (M.ZO.BR.VERGLEICHEN.BEGRUENDEN) */
export const brVergleichAussage = aussagenGenerator(
  'br.vergleich-aussage',
  ['nenner-groesser', 'nur-zaehler'],
  ['a', 'b', 'c', 'd'],
  (r) => {
    const stamm = r.int(0, 1) === 1;
    if (stamm) {
      const n = r.int(2, 6);
      const m = n + r.int(1, 6);
      return {
        situation: `Ida sagt: „1/${m} ist größer als 1/${n}, weil ${m} größer als ${n} ist.“ Stimmt das?`,
        werte: { a: 1, b: m, c: 1, d: n },
        richtig: `Nein. Je größer der Nenner, desto kleiner die Teile: 1/${n} ist größer als 1/${m}.`,
        falsch: [
          ['nenner-groesser', `Ja. ${m} ist größer als ${n}, also ist 1/${m} mehr.`],
          ['nur-zaehler', 'Nein. Beide sind gleich groß, denn beide haben den Zähler 1.'],
        ],
        weg: [
          `Teilt man das Ganze in ${m} Teile, sind sie kleiner als bei ${n} Teilen.`,
          `1/${n} > 1/${m}`,
        ],
      };
    }
    const d = r.int(2, 5);
    const c = d - 1;
    const a = c + 1;
    const b = Math.floor((a * d) / c) + r.int(1, 3);
    return {
      situation: `Ida sagt: „${a}/${b} ist größer als ${c}/${d}, weil ${a} größer als ${c} ist.“ Stimmt das?`,
      werte: { a, b, c, d },
      richtig: `Nein. Gleichnamig gemacht: ${a}/${b} = ${a * d}/${b * d} und ${c}/${d} = ${c * b}/${b * d}. Also ist ${c}/${d} größer.`,
      falsch: [
        ['nur-zaehler', 'Ja. Der Bruch mit dem größeren Zähler ist größer.'],
        ['nenner-groesser', `Ja. ${b} ist größer als ${d}, also ist ${a}/${b} mehr.`],
      ],
      weg: [
        'Bei verschiedenen Nennern: erst gleichnamig machen, dann die Zähler vergleichen.',
        `${a * d} < ${c * b}`,
      ],
    };
  },
);

/** „Striche gezählt statt Abschnitte?“ (M.ZO.BR.ZAHLENSTRAHL.BEGRUENDEN) */
export const brStrahlAussage = aussagenGenerator(
  'br.strahl-aussage',
  ['striche-gezaehlt', 'anzahl-statt-anteil'],
  ['n', 'k'],
  (r) => {
    const n = r.int(3, 10);
    const k = r.int(1, n - 1);
    return {
      situation: `Ein Zahlenstrahl ist von 0 bis 1 in ${n} gleich große Abschnitte geteilt, dafür braucht man ${n + 1} Striche. Eine Marke steht am ${k}. Strich nach der 0. Jan sagt: „Die Marke zeigt ${k}/${n + 1}.“ Stimmt das?`,
      werte: { n, k },
      richtig: `Nein. Es kommt auf die Abschnitte an, nicht auf die Striche: ${n} Abschnitte, also zeigt die Marke ${k}/${n}.`,
      falsch: [
        ['striche-gezaehlt', `Ja. Zwischen 0 und 1 gibt es ${n + 1} Striche, das ist der Nenner.`],
        ['anzahl-statt-anteil', `Nein. Die Marke zeigt ${k}, denn sie steht am ${k}. Strich.`],
      ],
      weg: [
        `Das Ganze von 0 bis 1 ist in ${n} gleiche Teile geteilt: Jeder Abschnitt ist 1/${n}.`,
        `${k} Abschnitte: ${k}/${n}`,
      ],
    };
  },
);
