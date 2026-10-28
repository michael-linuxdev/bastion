import { dezimalDeutsch, runde10, zahlDeutsch } from '../../../core/learning/format';
import { bruch, ggT, type Bruch } from '../../../core/learning/bruch';
import type { Bild, Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, linie, markierung, rechteck, sektor, text } from '../../svg';

const alsBruch = (b: Bruch): Loesung => ({ typ: 'bruch', wert: b });
export const bruchText = (b: Bruch) => `$\\frac{${b.zaehler}}{${b.nenner}}$`;

/** Rechteck in n gleiche Felder (eine Reihe oder zwei Reihen), die Felder in `gefaerbt` gefüllt. */
function rechteckBild(n: number, gefaerbt: ReadonlySet<number>, r: Rng): Bild {
  const zweiReihen = n % 2 === 0 && n >= 6 && r.int(0, 1) === 0;
  const spalten = zweiReihen ? n / 2 : n;
  const reihen = zweiReihen ? 2 : 1;
  const b = 300 / spalten;
  const h = zweiReihen ? 60 : 80;
  const teile: string[] = [];
  for (let i = 0; i < n; i++) {
    teile.push(
      rechteck(10 + (i % spalten) * b, 10 + Math.floor(i / spalten) * h, b, h, gefaerbt.has(i)),
    );
  }
  return bild(
    320,
    20 + reihen * h,
    teile,
    de(
      `Ein Rechteck aus ${n} gleich großen Feldern${reihen === 2 ? ` in zwei Reihen` : ''}. ${gefaerbt.size} Felder sind gefärbt.`,
    ),
  );
}

/** Kreis in n gleiche Teile, die ersten k gefärbt. */
function kreisBild(n: number, k: number): Bild {
  const teile = Array.from({ length: n }, (_, i) =>
    sektor(80, 80, 70, (i * 360) / n, ((i + 1) * 360) / n, i < k),
  );
  return bild(
    160,
    160,
    teile,
    de(`Ein Kreis aus ${n} gleich großen Teilen. ${k} Teile sind gefärbt.`),
  );
}

function zufallsBild(r: Rng, n: number, k: number): Bild {
  if (r.int(0, 1) === 0) return kreisBild(n, k);
  const gefaerbt = new Set(
    mische(
      r,
      Array.from({ length: n }, (_, i) => i),
    ).slice(0, k),
  );
  return rechteckBild(n, gefaerbt, r);
}

export interface AnteilBildParameter {
  readonly nenner_max: number; // 3 … 12
}

/** „Welcher Anteil ist gefärbt?“ (Bild → Bruch) – Vorlage M.ZO.BR.BEGRIFF.ANTEIL-ABLESEN */
export const anteilAblesen: Generator<AnteilBildParameter> = {
  id: 'br.anteil-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['gefaerbt-zu-ungefaerbt', 'ungefaerbter-teil'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 3 && p.nenner_max <= 12, 'nenner_max: 3 … 12');
    const r = rng(seed);
    const n = r.int(2, p.nenner_max);
    const k = r.int(1, n - 1);
    const richtig = alsBruch(bruch(k, n));
    return {
      platzhalter: {},
      bild: zufallsBild(r, n, k),
      loesung: richtig,
      loesungsweg: [
        de(`Das Ganze ist in ${n} gleich große Teile geteilt – das ist der Nenner.`),
        de(`${k} Teile sind gefärbt – das ist der Zähler. Gefärbt ist also ${k}/${n}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gefaerbt-zu-ungefaerbt', n - k > 0 ? alsBruch(bruch(k, n - k)) : undefined],
        ['ungefaerbter-teil', alsBruch(bruch(n - k, n))],
      ]),
    };
  },
};

/** „Welches Bild zeigt 3/8?“ – Vorlage M.ZO.BR.BEGRIFF.BILD-AUSWAEHLEN */
export const bildZuBruch: Generator<AnteilBildParameter> = {
  id: 'br.bild-zu-bruch',
  version: 1,
  platzhalter: ['bruch'],
  fehlerbildIds: ['ungefaerbter-teil', 'nenner-als-anzahl-gefaerbt', 'falsche-einteilung'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 12, 'nenner_max: 4 … 12');
    const r = rng(seed);
    let n = r.int(4, p.nenner_max);
    let k = r.int(1, n - 1);
    if (2 * k === n) k = Math.max(1, k - 1); // sonst sind Bruch und Gegenstück gleich
    if (k === n - k) n += 1;
    const kreis = r.int(0, 1) === 0;
    const mal = (nn: number, kk: number) =>
      kreis
        ? kreisBild(nn, kk)
        : rechteckBild(nn, new Set(Array.from({ length: kk }, (_, i) => i)), r);
    const n2 = n + (n < p.nenner_max ? 1 : -1);
    const varianten: [string, Bild][] = [
      ['richtig', mal(n, k)],
      ['ungefaerbter-teil', mal(n, n - k)],
      ['nenner-als-anzahl-gefaerbt', mal(n + k, n)],
      ['falsche-einteilung', mal(n2, Math.min(k, n2 - 1))],
    ];
    const reihenfolge = mische(r, [0, 1, 2, 3]);
    const optionen = reihenfolge.map((i) => ({ bild: (varianten[i] as [string, Bild])[1] }));
    const wo = (i: number) => auswahl(reihenfolge.indexOf(i));
    return {
      platzhalter: { bruch: bruch(k, n) },
      optionen,
      loesung: wo(0),
      loesungsweg: [de(`Gesucht: ${n} gleich große Teile, davon ${k} gefärbt.`)],
      fehlerbilder: fehlerbilderAus(wo(0), [
        ['ungefaerbter-teil', wo(1)],
        ['nenner-als-anzahl-gefaerbt', wo(2)],
        ['falsche-einteilung', wo(3)],
      ]),
    };
  },
};

export interface ZahlenstrahlParameter {
  readonly nenner: readonly number[]; // Einteilungen, z. B. [2, 3, 4, 5, 6, 8, 10]
  readonly bis: number; // 1 oder 2: Zahlenstrahl bis 1 bzw. bis 2
  readonly dezimal: boolean; // true: Zehntel, Antwort als Dezimalzahl
}

/** „Welche Zahl gehört an die Markierung?“ – Vorlagen M.ZO.BR.ZAHLENSTRAHL.BRUCH und .DEZIMAL */
export const zahlenstrahlAblesen: Generator<ZahlenstrahlParameter> = {
  id: 'br.zahlenstrahl-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['striche-statt-abstaende', 'nur-teile-gezaehlt'],

  erzeuge(seed, p) {
    verlange(p.bis === 1 || p.bis === 2, 'bis: 1 oder 2');
    verlange(p.nenner.length > 0 && p.nenner.every((n) => n >= 2 && n <= 10), 'nenner: 2 … 10');
    const r = rng(seed);
    const n = p.dezimal ? 10 : r.pick(p.nenner);
    let k = r.int(1, n * p.bis - 1);
    if (k % n === 0) k -= 1; // nie genau auf einer ganzen Zahl
    const breite = 300;
    const x = (t: number) => 20 + (t * breite) / (n * p.bis);
    const teile: string[] = [linie(10, 60, 340, 60)];
    for (let t = 0; t <= n * p.bis; t++)
      teile.push(linie(x(t), 52, x(t), 68, t % n === 0 ? 3 : 1.5));
    for (let g = 0; g <= p.bis; g++) teile.push(text(x(g * n), 90, String(g)));
    teile.push(markierung(x(k), 48));
    const beschreibung = de(
      `Ein Zahlenstrahl von 0 bis ${p.bis}. Jede Einheit ist in ${n} gleiche Abschnitte geteilt. ` +
        `Die Markierung steht am ${k}. Teilstrich nach der 0.`,
    );
    const wert = (zaehler: number, nenner: number): Loesung =>
      p.dezimal ? zahl(runde10(zaehler / nenner, 6)) : alsBruch(bruch(zaehler, nenner));
    const richtig = wert(k, n);
    return {
      platzhalter: {},
      bild: bild(360, 100, teile, beschreibung),
      loesung: richtig,
      loesungsweg: [
        de(
          `Von 0 bis 1 sind es ${n} Abschnitte. Ein Abschnitt ist ${p.dezimal ? '0,1' : `1/${n}`}.`,
        ),
        de(
          `Die Markierung liegt ${k} Abschnitte rechts von 0: ${p.dezimal ? dezimalDeutsch(k / n) : `${k}/${n}`}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['striche-statt-abstaende', wert(k, n + 1)],
        ['nur-teile-gezaehlt', p.dezimal ? zahl(k) : undefined],
      ]),
    };
  },
};

const EINHEITEN: readonly Sprachobjekt[] = [
  de('km'),
  de('m'),
  de('kg'),
  de('g'),
  de('€'),
  de('Schüler'),
  de('min'),
  de('l'),
];

export interface AnteilVonParameter {
  readonly stammbruch: boolean; // nur 1/n
  readonly nenner_max: number; // 2 … 12
  readonly ganzes_max: number; // 20 … 1000
}

/** „Berechne 2/3 von 27 km.“ – Vorlagen M.ZO.BR.ANTEIL-VON.STAMMBRUCH und .ALLGEMEIN */
export const anteilVon: Generator<AnteilVonParameter> = {
  id: 'br.anteil-von',
  version: 1,
  platzhalter: ['anteil', 'ganzes', 'einheit'],
  fehlerbildIds: ['nur-geteilt', 'nur-mit-zaehler-mal', 'zaehler-nenner-vertauscht'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 2 && p.nenner_max <= 12, 'nenner_max: 2 … 12');
    verlange(p.ganzes_max >= 20 && p.ganzes_max <= 1000, 'ganzes_max: 20 … 1000');
    const r = rng(seed);
    const n = r.int(2, p.nenner_max);
    let z = p.stammbruch ? 1 : r.int(2, n - 1 > 1 ? n - 1 : 2);
    if (z >= n) z = 1;
    const g = ggT(z, n);
    const [zz, nn] = [z / g, n / g];
    const ganzes = nn * r.int(2, Math.max(2, Math.floor(p.ganzes_max / nn)));
    const teil = ganzes / nn;
    const richtig = teil * zz;
    return {
      platzhalter: { anteil: bruch(zz, nn), ganzes, einheit: r.pick(EINHEITEN) },
      loesung: zahl(richtig),
      loesungsweg: [
        de(
          `Ein ${nn}-tel von ${zahlDeutsch(ganzes)}: ${zahlDeutsch(ganzes)} : ${nn} = ${zahlDeutsch(teil)}`,
        ),
        ...(zz > 1
          ? [de(`${zz} solche Teile: ${zahlDeutsch(teil)} · ${zz} = ${zahlDeutsch(richtig)}`)]
          : []),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['nur-geteilt', zz > 1 ? zahl(teil) : undefined],
        ['nur-mit-zaehler-mal', zz > 1 ? zahl(ganzes * zz) : undefined],
        [
          'zaehler-nenner-vertauscht',
          (ganzes * nn) % zz === 0 ? zahl((ganzes * nn) / zz) : undefined,
        ],
      ]),
    };
  },
};
