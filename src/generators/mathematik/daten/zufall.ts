// Häufigkeiten und Kreisdiagramme – Klasse 6 (LEHRPLAN §8b, Felder ZF und DA).
// Rein und deterministisch.
import { bruch, ggT, wertgleich, type Bruch } from '../../../core/learning/bruch';
import { dezimalDeutsch, zahlDeutsch } from '../../../core/learning/format';
import type { Bild, Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';
import { bild, linie, sektor, text } from '../../svg';
import { tabelle } from '../zuordnungen/zuordnungen';

// ---------------------------------------------------------------------------
// Strichliste (M.DZ.ZF.HAEUFIGKEIT.STRICHLISTE)

/** Striche einer Strichliste: Fünferbündel aus vier Strichen und einem Querstrich. */
function striche(x0: number, y: number, anzahl: number): string[] {
  const t: string[] = [];
  for (let i = 0; i < anzahl; i++) {
    const buendel = Math.floor(i / 5);
    const imBuendel = i % 5;
    const x = x0 + buendel * 34 + imBuendel * 6;
    if (imBuendel < 4) t.push(linie(x, y - 9, x, y + 9, 1.6));
    else t.push(linie(x0 + buendel * 34 - 3, y + 7, x0 + buendel * 34 + 22, y - 7, 1.6));
  }
  return t;
}

export interface StrichlisteParameter {
  readonly anzahl_max: number; // 9 … 30
}

/** „Wie oft wurde die 4 gewürfelt?“ – Vorlage M.DZ.ZF.HAEUFIGKEIT.STRICHLISTE */
export const strichliste: Generator<StrichlisteParameter> = {
  id: 'zf.strichliste',
  version: 1,
  platzhalter: ['augen'],
  fehlerbildIds: ['buendel-als-vier', 'buendel-als-zehn'],

  erzeuge(seed, p) {
    verlange(p.anzahl_max >= 9 && p.anzahl_max <= 30, 'anzahl_max: 9 … 30');
    const r = rng(seed);
    const anzahlen = [1, 2, 3, 4, 5, 6].map(() => r.int(1, p.anzahl_max));
    const augen = r.int(1, 6);
    const n = anzahlen[augen - 1] ?? 1;
    // gefragte Anzahl soll mindestens ein Fünferbündel enthalten
    const wert = n < 5 ? n + 5 : n;
    anzahlen[augen - 1] = wert;
    const teile: string[] = [];
    anzahlen.forEach((a, i) => {
      const y = 22 + i * 30;
      teile.push(
        text(18, y + 5, String(i + 1), 15),
        linie(36, y - 14, 36, y + 14, 0.75),
        ...striche(48, y, a),
      );
    });
    const buendel = Math.floor(wert / 5);
    return {
      platzhalter: { augen },
      bild: bild(300, 190, teile, {
        de: `Strichliste für die Augenzahlen 1 bis 6: ${anzahlen.map((a, i) => `${i + 1}: ${a}-mal`).join(', ')}.`,
      }),
      loesung: zahl(wert),
      loesungsweg: [
        de(`Bei der ${augen}: ${buendel} Fünferbündel und ${wert % 5} einzelne Striche`),
        de(`${buendel} · 5 + ${wert % 5} = ${wert}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(wert), [
        ['buendel-als-vier', zahl(wert - buendel)],
        ['buendel-als-zehn', zahl(buendel * 10 + (wert % 5))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Relative Häufigkeit (M.DZ.ZF.HAEUFIGKEIT.RELATIV)

export interface RelativParameter {
  /** mögliche Anzahlen aller Würfe */
  readonly wuerfe: readonly number[];
}

/** „Ein Würfel wurde 20-mal geworfen … relative Häufigkeit der 3 in Prozent?“ */
export const relativeHaeufigkeit: Generator<RelativParameter> = {
  id: 'zf.relativ',
  version: 1,
  platzhalter: ['n', 'augen'],
  fehlerbildIds: ['absolut-statt-relativ', 'dezimal-statt-prozent'],

  erzeuge(seed, p) {
    verlange(p.wuerfe.length > 0 && p.wuerfe.every((w) => w >= 10 && w <= 200), 'wuerfe: 10 … 200');
    const r = rng(seed);
    const n = r.pick(p.wuerfe);
    // Anzahlen so wählen, dass sie n ergeben und die gefragte einen glatten Prozentwert hat
    const augen = r.int(1, 6);
    const schritt = n / ggT(n, 100); // kleinste Anzahl mit ganzem Prozentwert
    const gefragt = schritt * r.int(1, Math.max(1, Math.floor(n / 4 / schritt)));
    const rest = n - gefragt;
    const andere = [0, 0, 0, 0, 0];
    for (let i = 0; i < rest; i++) {
      const j = r.int(0, 4);
      andere[j] = (andere[j] ?? 0) + 1;
    }
    const anzahlen = [...andere.slice(0, augen - 1), gefragt, ...andere.slice(augen - 1)];
    const prozent = (gefragt * 100) / n;
    return {
      platzhalter: { n, augen },
      bild: tabelle(
        ['Augenzahl', 'Anzahl'],
        anzahlen.map((a, i) => [i + 1, a] as [number, number]),
      ),
      loesung: zahl(prozent),
      loesungsweg: [
        de(`Relative Häufigkeit = Anzahl : alle Würfe = ${gefragt} : ${n} = ${gefragt}/${n}`),
        de(`${gefragt}/${n} = ${dezimalDeutsch(gefragt / n)} = ${dezimalDeutsch(prozent)} %`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(prozent), [
        ['absolut-statt-relativ', zahl(gefragt)],
        ['dezimal-statt-prozent', zahl(gefragt / n)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Kreisdiagramme (M.DZ.DA.KREISDIAGRAMM)

function kreisdiagramm(anteil: Bruch): Bild {
  const teile: string[] = [];
  const n = anteil.nenner;
  for (let i = 0; i < n; i++)
    teile.push(sektor(90, 90, 80, (i * 360) / n, ((i + 1) * 360) / n, i < anteil.zaehler));
  return bild(180, 180, teile, {
    de: `Ein Kreis, in ${n} gleich große Teile geteilt. ${anteil.zaehler} davon sind gefärbt.`,
  });
}

/** Kreisdiagramm mit unsichtbarer Einteilung: nur der gefärbte Sektor. */
function kreisdiagrammOhneTeile(anteil: Bruch): Bild {
  const winkel = (anteil.zaehler * 360) / anteil.nenner;
  return bild(
    180,
    180,
    [sektor(90, 90, 80, 0, winkel, true), sektor(90, 90, 80, winkel, 360, false)],
    {
      de: `Ein Kreisdiagramm. Der gefärbte Teil hat einen Mittelpunktswinkel von ${zahlDeutsch(winkel)}°.`,
    },
  );
}

export interface KreisAnteilParameter {
  readonly nenner: readonly number[]; // z. B. [2, 3, 4] oder [6, 8, 12]
  /** Einteilung sichtbar? (sonst Winkel abschätzen) */
  readonly einteilung: boolean;
}

/** „Welcher Anteil ist gefärbt?“ – Vorlage M.DZ.DA.KREISDIAGRAMM.ABLESEN */
export const kreisAnteil: Generator<KreisAnteilParameter> = {
  id: 'kd.anteil-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['ungefaerbt', 'teile-gezaehlt'],

  erzeuge(seed, p) {
    verlange(p.nenner.length > 0 && p.nenner.every((n) => n >= 2 && n <= 12), 'nenner: 2 … 12');
    const r = rng(seed);
    let a: Bruch;
    do {
      const n = r.pick(p.nenner);
      a = bruch(r.int(1, n - 1), n);
    } while (ggT(a.zaehler, a.nenner) !== 1);
    const loesung: Loesung = { typ: 'bruch', wert: a };
    const ungefaerbt = bruch(a.nenner - a.zaehler, a.nenner);
    return {
      platzhalter: {},
      bild: p.einteilung ? kreisdiagramm(a) : kreisdiagrammOhneTeile(a),
      loesung,
      loesungsweg: [
        de(
          p.einteilung
            ? `Der Kreis hat ${a.nenner} gleich große Teile, ${a.zaehler} sind gefärbt.`
            : `Der gefärbte Teil hat ${zahlDeutsch((a.zaehler * 360) / a.nenner)}° von 360°.`,
        ),
        de(`Anteil: ${a.zaehler}/${a.nenner}`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['ungefaerbt', wertgleich(ungefaerbt, a) ? undefined : { typ: 'bruch', wert: ungefaerbt }],
        [
          'teile-gezaehlt',
          a.nenner - a.zaehler > 0 && !wertgleich(bruch(a.zaehler, a.nenner - a.zaehler), a)
            ? { typ: 'bruch', wert: bruch(a.zaehler, a.nenner - a.zaehler) }
            : undefined,
        ],
      ]),
    };
  },
};

const ANTEIL_PROZENT = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90];
const ANTEIL_BRUCH: readonly Bruch[] = [
  bruch(1, 2),
  bruch(1, 3),
  bruch(2, 3),
  bruch(1, 4),
  bruch(3, 4),
  bruch(1, 5),
  bruch(2, 5),
  bruch(1, 6),
  bruch(5, 6),
  bruch(1, 8),
  bruch(3, 8),
  bruch(1, 10),
  bruch(1, 12),
  bruch(5, 12),
];

export interface KreisWinkelParameter {
  readonly prozent: boolean;
}

/** „Wie groß ist der Mittelpunktswinkel für 3/8?“ – Vorlage M.DZ.DA.KREISDIAGRAMM.WINKEL */
export const kreisWinkel: Generator<KreisWinkelParameter> = {
  id: 'kd.winkel',
  version: 1,
  platzhalter: ['anteil'],
  fehlerbildIds: ['hundert-statt-360', 'halbkreis'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (p.prozent) {
      const pz = r.pick(ANTEIL_PROZENT);
      const w = (pz * 360) / 100;
      return {
        platzhalter: { anteil: de(`${pz} %`) },
        loesung: zahl(w),
        loesungsweg: [
          de(`Der ganze Kreis hat 360°. 1 % sind 3,6°.`),
          de(`${pz} % · 3,6° = ${dezimalDeutsch(w)}°`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(w), [
          ['hundert-statt-360', zahl(pz)],
          ['halbkreis', zahl(w / 2)],
        ]),
      };
    }
    const a = r.pick(ANTEIL_BRUCH);
    const w = (a.zaehler * 360) / a.nenner;
    return {
      platzhalter: { anteil: de(`${a.zaehler}/${a.nenner}`) },
      loesung: zahl(w),
      loesungsweg: [
        de(`Der ganze Kreis hat 360°.`),
        de(
          `${a.zaehler}/${a.nenner} von 360°: 360° : ${a.nenner} · ${a.zaehler} = ${zahlDeutsch(w)}°`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(w), [
        ['hundert-statt-360', zahl((a.zaehler * 100) / a.nenner)],
        ['halbkreis', zahl(w / 2)],
      ]),
    };
  },
};
