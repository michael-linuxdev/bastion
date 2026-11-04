// Brüche und Dezimalzahlen, Niveau E – Klasse 6 (K-31): Rechenregeln und Begriffe begründen.
// Neue Datei im Musterfeld: Die Stufe-1-Vorlagen bleiben unverändert (K-31).
import { aussagenGenerator } from '../../aussagen';

const ggT = (a: number, b: number): number => (b === 0 ? a : ggT(b, a % b));
const kurz = (z: number, n: number) => {
  const g = ggT(z, n);
  return `${z / g}/${n / g}`;
};
const dez = (x: number) => String(Math.round(x * 1000) / 1000).replace('.', ',');
const euro = (cent: number) => (cent / 100).toFixed(2).replace('.', ',');

/**
 * „p/a + q/b = (p + q)/(a + b)?“ (M.ZO.BR.ADD-SUB.BEGRUENDEN). Fassung 2 (Stufe-1-Prüfung
 * 04.11.2026): „gemeinsamer Nenner“ statt „gleichnamig“ und „Hauptnenner“ – diese Wörter
 * führt die Erstvermittlung nicht ein. Fassung 1 bleibt für gespeicherte Aufgaben.
 */
function brNennerAussageFassung(fassung: 1 | 2) {
  return aussagenGenerator(
    'br.nenner-aussage',
    ['nenner-addiert', 'einen-nenner'],
    ['p', 'a', 'q', 'b'],
    (r) => {
      const [a, b] = r.pick([
        [2, 3],
        [3, 4],
        [2, 5],
        [3, 5],
        [4, 5],
        [2, 7],
        [3, 7],
        [5, 6],
      ] as const);
      const p = r.int(1, a - 1);
      const q = r.int(1, b - 1);
      const s = p * b + q * a;
      return {
        situation: `Tim rechnet: ${p}/${a} + ${q}/${b} = ${p + q}/${a + b}. Stimmt das?`,
        werte: { p, a, q, b },
        richtig:
          fassung === 1
            ? `Nein. Erst gleichnamig machen: ${p * b}/${a * b} + ${q * a}/${a * b} = ${s}/${a * b}.`
            : `Nein. Erst auf einen gemeinsamen Nenner bringen: ${p * b}/${a * b} + ${q * a}/${a * b} = ${s}/${a * b}.`,
        falsch: [
          ['nenner-addiert', 'Ja. Man rechnet Zähler plus Zähler und Nenner plus Nenner.'],
          ['einen-nenner', `Nein. Richtig ist ${p + q}/${b}.`],
        ],
        weg: [
          fassung === 1
            ? `Hauptnenner von ${a} und ${b}: ${a * b}.`
            : `Gemeinsamer Nenner von ${a} und ${b}: ${a * b}.`,
          `${p}/${a} = ${p * b}/${a * b} und ${q}/${b} = ${q * a}/${a * b}, zusammen ${s}/${a * b}. Probe: Das Ergebnis muss größer als ${p}/${a} sein.`,
        ],
      };
    },
    fassung,
  );
}

export const brNennerAussageV1 = brNennerAussageFassung(1);
export const brNennerAussage = brNennerAussageFassung(2);

/** „Mehr gefärbte Felder, also größerer Anteil?“ (M.ZO.BR.ANTEILE.BEGRUENDEN) */
export const brAnteilAussage = aussagenGenerator(
  'br.anteil-aussage',
  ['anzahl-statt-anteil', 'gegenteil'],
  ['r1', 'n1', 'r2', 'n2'],
  (r) => {
    const n1 = r.int(3, 6);
    const r1 = n1 - 1;
    const r2 = r1 + r.int(1, 2);
    const n2 = Math.ceil((r2 * n1) / r1) + r.int(1, 3);
    return {
      situation: `Bei Figur A sind ${r1} von ${n1} gleich großen Feldern gefärbt, bei Figur B ${r2} von ${n2}. Jan sagt: „B ist stärker gefärbt, denn dort sind mehr Felder gefärbt.“ Stimmt das?`,
      werte: { r1, n1, r2, n2 },
      richtig: `Nein. Es zählt der Anteil: A ist zu ${r1}/${n1} gefärbt, B zu ${r2}/${n2}, und ${r1}/${n1} ist mehr.`,
      falsch: [
        ['anzahl-statt-anteil', `Ja. Bei B sind ${r2} Felder gefärbt, bei A nur ${r1}.`],
        [
          'gegenteil',
          `Nein. B hat ${n2 - r2} ungefärbte Felder und A nur ${n1 - r1}, also ist B weniger gefärbt.`,
        ],
      ],
      weg: [
        'Anteil = gefärbte Felder : alle Felder.',
        `Über Kreuz: ${r1} · ${n2} = ${r1 * n2} > ${r2} · ${n1} = ${r2 * n1}, also ${r1}/${n1} > ${r2}/${n2}.`,
      ],
    };
  },
);

/** „x : 0,c wie x : c rechnen?“ (M.ZO.BR.DEZ-MULT-DIV.BEGRUENDEN) */
export const brKommaDivisionAussage = aussagenGenerator(
  'br.komma-division-aussage',
  ['komma-nur-teiler', 'kleiner-gemacht'],
  ['c', 'k'],
  (r) => {
    const c = r.int(2, 9);
    let k = r.int(11, 39);
    if (k % 10 === 0) k += 1;
    const x = (c * k) / 10;
    return {
      situation: `Lea rechnet ${dez(x)} : 0,${c} wie ${dez(x)} : ${c} = ${dez(k / 10)}. Stimmt das?`,
      werte: { c, k },
      richtig: `Nein. Beide Zahlen werden mit 10 malgenommen: ${dez(x * 10)} : ${c} = ${k}. Teilen durch eine Zahl kleiner als 1 macht größer.`,
      falsch: [
        ['komma-nur-teiler', 'Ja. Das Komma beim Teiler darf man einfach weglassen.'],
        [
          'kleiner-gemacht',
          `Nein. Das Ergebnis ist ${dez(k / 100)}, denn durch eine Kommazahl teilen macht kleiner.`,
        ],
      ],
      weg: [
        `${dez(x)} : 0,${c} = ${dez(x * 10)} : ${c}, denn beide Zahlen werden mit 10 malgenommen.`,
        `${dez(x * 10)} : ${c} = ${k}. Probe: ${k} · 0,${c} = ${dez(x)}.`,
      ],
    };
  },
);

/** „Teilen durch einen Bruch wie Malnehmen?“ (M.ZO.BR.DIV.BEGRUENDEN) */
export const brKehrwertAussage = aussagenGenerator(
  'br.kehrwert-aussage',
  ['kehrwert-regel', 'kehrwert-erster'],
  ['a', 'b', 'c', 'd'],
  (r) => {
    const b = r.int(3, 9);
    const a = r.int(1, b - 1);
    const d = r.int(3, 9);
    let c = r.int(1, d - 1);
    if (a * d === b * c) c = c === 1 ? 2 : c - 1;
    return {
      situation: `Ole rechnet: ${a}/${b} : ${c}/${d} = ${a}/${b} · ${c}/${d} = ${kurz(a * c, b * d)}. Stimmt das?`,
      werte: { a, b, c, d },
      richtig: `Nein. Man nimmt mit dem Kehrwert des zweiten Bruchs mal: ${a}/${b} · ${d}/${c} = ${kurz(a * d, b * c)}.`,
      falsch: [
        ['kehrwert-regel', 'Ja. Bei Brüchen rechnet man Teilen wie Malnehmen.'],
        ['kehrwert-erster', `Nein. Richtig ist ${b}/${a} · ${c}/${d} = ${kurz(b * c, a * d)}.`],
      ],
      weg: [
        `Durch ${c}/${d} teilen heißt mit ${d}/${c} malnehmen.`,
        `${a} · ${d} = ${a * d}, ${b} · ${c} = ${b * c}: ${kurz(a * d, b * c)}.`,
      ],
    };
  },
);

/** „n ist keine gebrochene Zahl?“ (M.ZO.BR.MENGEN.BEGRUENDEN) */
export const brMengenAussage = aussagenGenerator(
  'br.mengen-aussage',
  ['teilmenge-verdreht', 'schreibweise-zahl'],
  ['n'],
  (r) => {
    const n = r.int(2, 99);
    return {
      situation: `Tom sagt: „${n} ist keine gebrochene Zahl, denn ${n} ist kein Bruch.“ Stimmt das?`,
      werte: { n },
      richtig: `Nein. ${n} = ${n}/1 = ${2 * n}/2. Jede natürliche Zahl kann man als Bruch schreiben, also sind die natürlichen Zahlen eine Teilmenge der gebrochenen Zahlen.`,
      falsch: [
        [
          'teilmenge-verdreht',
          'Ja. Die gebrochenen Zahlen sind ein Teil der natürlichen Zahlen, nicht umgekehrt.',
        ],
        ['schreibweise-zahl', 'Ja. Eine Zahl ohne Bruchstrich ist keine gebrochene Zahl.'],
      ],
      weg: [
        `Schreibe ${n} als Bruch: ${n}/1.`,
        'Eine Zahl kann mehrere Schreibweisen haben. ℕ liegt ganz in den gebrochenen Zahlen.',
      ],
    };
  },
);

/** „a/b · k: Was wird malgenommen?“ (M.ZO.BR.MULT.BEGRUENDEN) */
export const brMalZahlAussage = aussagenGenerator(
  'br.mal-zahl-aussage',
  ['erweitert-statt-gerechnet', 'zaehler-oder-nenner'],
  ['a', 'b', 'k'],
  (r) => {
    const b = r.int(3, 9);
    const a = r.int(1, b - 1);
    const k = r.int(2, 5);
    return {
      situation: `Welche Rechnung für ${a}/${b} · ${k} ist richtig begründet?`,
      werte: { a, b, k },
      richtig: `${a * k}/${b}${kurz(a * k, b) === `${a * k}/${b}` ? '' : ` = ${kurz(a * k, b)}`}, denn ${k}-mal so viele Teile derselben Größe: Nur der Zähler wird mit ${k} malgenommen.`,
      falsch: [
        [
          'erweitert-statt-gerechnet',
          `${a * k}/${b * k}, denn Zähler und Nenner werden mit ${k} malgenommen.`,
        ],
        ['zaehler-oder-nenner', `${a}/${b * k}, denn der Nenner wird mit ${k} malgenommen.`],
      ],
      weg: [
        `${a}/${b} · ${k} = ${a}/${b} + … + ${a}/${b} (${k}-mal).`,
        `Zähler: ${a} · ${k} = ${a * k}. Nenner bleibt ${b}.`,
      ],
    };
  },
);

const PERIODISCH: readonly (readonly [number, number])[] = [
  [1, 3],
  [2, 3],
  [1, 7],
  [3, 7],
  [1, 9],
  [4, 9],
  [1, 11],
  [5, 11],
];
const ENDLICH: readonly (readonly [number, number])[] = [
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 25],
  [3, 25],
  [7, 25],
  [12, 25],
];

/** „Ungerader Nenner, also periodisch?“ (M.ZO.BR.PERIODISCH.BEGRUENDEN) */
export const brPeriodeAussage = aussagenGenerator(
  'br.periode-aussage',
  ['periode-ungerade', 'komma-als-bruchstrich'],
  ['z', 'n'],
  (r) => {
    const periodisch = r.int(0, 1) === 1;
    const [z, n] = r.pick(periodisch ? PERIODISCH : ENDLICH);
    return {
      situation: `Paul sagt: „${z}/${n} ergibt eine periodische Dezimalzahl, weil ${n} ungerade ist.“ Stimmt das?`,
      werte: { z, n },
      richtig: periodisch
        ? `Das Ergebnis stimmt, die Begründung nicht: ${z}/${n} ist periodisch, weil ${n} einen anderen Primfaktor als 2 und 5 hat.`
        : `Nein. ${n} hat nur den Primfaktor 5, deshalb ist ${z}/${n} = ${dez(z / n)} endlich.`,
      falsch: [
        ['periode-ungerade', 'Ja. Ungerade Nenner ergeben immer periodische Dezimalzahlen.'],
        ['komma-als-bruchstrich', `Nein. ${z}/${n} = ${z},${n}, das ist endlich.`],
      ],
      weg: [
        'Endlich wird die Dezimalzahl genau dann, wenn der gekürzte Nenner nur die Primfaktoren 2 und 5 hat.',
        periodisch
          ? `${n} hat den Primfaktor ${n % 3 === 0 ? 3 : n}: periodisch.`
          : `${z}/${n} = ${z * (100 / n)}/100 = ${dez(z / n)}: endlich.`,
      ],
    };
  },
);

/** „a · B + a · C geschickt rechnen“ (M.ZO.BR.RECHENGESETZE.BEGRUENDEN) */
export const brAusklammernAussage = aussagenGenerator(
  'br.ausklammern-aussage',
  ['klammer', 'komma-mal'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(2, 9);
    const [tb, tc] = r.pick([
      [5, 5],
      [3, 7],
      [2, 8],
      [4, 6],
    ] as const);
    const b = r.int(1, 5) + tb / 10;
    const c = r.int(1, 5) + tc / 10;
    const summe = Math.round(b + c);
    return {
      situation: `Welcher Rechenweg für ${a} · ${dez(b)} + ${a} · ${dez(c)} ist geschickt und richtig?`,
      werte: { a, b, c },
      richtig: `${a} · (${dez(b)} + ${dez(c)}) = ${a} · ${summe} = ${a * summe}, denn den gleichen Faktor darf man ausklammern.`,
      falsch: [
        [
          'klammer',
          `${a} · ${dez(b)} + ${dez(c)} = ${dez(a * b + c)}, denn den Faktor schreibt man nur einmal.`,
        ],
        [
          'komma-mal',
          `${a} · (${dez(b)} + ${dez(c)}) = ${a} · ${dez(summe / 10)} = ${dez((a * summe) / 10)}, denn das Komma bleibt stehen.`,
        ],
      ],
      weg: [
        `Distributivgesetz: ${a} · ${dez(b)} + ${a} · ${dez(c)} = ${a} · (${dez(b)} + ${dez(c)}).`,
        `${dez(b)} + ${dez(c)} = ${summe}, also ${a} · ${summe} = ${a * summe}.`,
      ],
    };
  },
);

/** „Rückgeld beim Einkauf“ (M.ZO.BR.SACH.BEGRUENDEN) */
export const brSachAussage = aussagenGenerator(
  'br.sach-aussage',
  ['zwischenergebnis', 'angabe-uebersehen'],
  ['m1', 'p1', 'm2', 'p2'],
  (r) => {
    const m1 = r.pick([15, 20, 25]); // Zehntel kg
    const p1 = r.pick([120, 160, 240]); // Cent je kg
    const m2 = r.pick([20, 25, 50]); // Hundertstel kg
    const p2 = r.pick([8, 12, 16, 20]); // Euro je kg
    const c1 = (m1 * p1) / 10;
    const c2 = m2 * p2;
    const summe = c1 + c2;
    return {
      situation: `Lea kauft ${dez(m1 / 10)} kg Äpfel zu ${euro(p1)} € je kg und ${dez(m2 / 100)} kg Käse zu ${p2} € je kg. Sie zahlt mit einem 20-€-Schein. Wie viel Rückgeld bekommt sie?`,
      werte: { m1, p1, m2, p2 },
      richtig: `${euro(2000 - summe)} €, denn der Einkauf kostet ${euro(c1)} € + ${euro(c2)} € = ${euro(summe)} €.`,
      falsch: [
        ['zwischenergebnis', `${euro(summe)} €, denn so viel kostet der Einkauf.`],
        ['angabe-uebersehen', `${euro(2000 - c1)} €, denn die Äpfel kosten ${euro(c1)} €.`],
      ],
      weg: [
        `Äpfel: ${dez(m1 / 10)} · ${euro(p1)} € = ${euro(c1)} €. Käse: ${dez(m2 / 100)} · ${p2} € = ${euro(c2)} €.`,
        `20,00 € − ${euro(summe)} € = ${euro(2000 - summe)} €`,
      ],
    };
  },
);
