// Beschreibende Statistik – Klasse 9 (LEHRPLAN §8e, Feld ST): Modalwert, Median, Mittelwert,
// Streuung (Spannweite, Standardabweichung), Klassen und Histogramm, irreführende Darstellungen.
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { rundeAuf } from '../../../core/learning/auswertung';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, variante, verlange, zahl } from '../../hilfen';
import { bild, linie, rechteck, text } from '../../svg';

const r1 = (x: number) => rundeAuf(x, 1);
const liste = (w: readonly number[]) => w.map(zahlText).join('; ');
const sortiert = (w: readonly number[]) => [...w].sort((a, b) => a - b);
const summe = (w: readonly number[]) => w.reduce((a, b) => a + b, 0);
function median(w: readonly number[]): number {
  const s = sortiert(w);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[m] ?? 0) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
}
const mittel = (w: readonly number[]) => summe(w) / w.length;
const sigma = (w: readonly number[]) => {
  const m = mittel(w);
  return Math.sqrt(summe(w.map((x) => (x - m) ** 2)) / w.length);
};

// ---------------------------------------------------------------------------
// Mittelwerte bestimmen (M.DZ.ST.MITTELWERTE.BESTIMMEN)

export interface MittelwerteParameter {
  readonly arten: readonly ('modalwert' | 'median' | 'mittel')[];
  /** auch eine gerade Anzahl Werte (Median aus zwei Werten) */
  readonly gerade: boolean;
}

/** „Bestimme den Median der Daten 7; 3; 9; 3; 5.“ */
export const stMittelwerte: Generator<MittelwerteParameter> = {
  id: 'st.mittelwerte',
  version: 1,
  platzhalter: ['werte', 'gesucht'],
  fehlerbildIds: ['unsortiert', 'median-gerade', 'haeufigkeit-statt-wert', 'mittel-statt-median'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    const n = p.gerade ? r.pick([6, 7, 8, 9]) : r.pick([5, 7, 9]);
    let werte: number[];
    for (;;) {
      werte = Array.from({ length: n }, () => r.int(1, 20));
      if (art === 'modalwert') {
        // genau ein häufigster Wert
        const zaehl = new Map<number, number>();
        for (const x of werte) zaehl.set(x, (zaehl.get(x) ?? 0) + 1);
        const max = Math.max(...zaehl.values());
        if (max < 2 || [...zaehl.values()].filter((k) => k === max).length !== 1) continue;
      }
      if (art === 'median' && median(werte) === werte[Math.floor(n / 2)]) continue;
      break;
    }
    const s = sortiert(werte);
    if (art === 'modalwert') {
      const zaehl = new Map<number, number>();
      for (const x of werte) zaehl.set(x, (zaehl.get(x) ?? 0) + 1);
      const max = Math.max(...zaehl.values());
      const modal = [...zaehl.entries()].find(([, k]) => k === max)?.[0] ?? 0;
      const richtig = zahl(modal);
      return {
        platzhalter: { werte: de(liste(werte)), gesucht: de('den Modalwert') },
        loesung: richtig,
        loesungsweg: [
          de('Der Modalwert ist der Wert, der am häufigsten vorkommt.'),
          de(`${zahlText(modal)} kommt ${max}-mal vor, öfter als jeder andere Wert.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['haeufigkeit-statt-wert', modal !== max ? zahl(max) : undefined],
        ]),
      };
    }
    if (art === 'median') {
      const med = median(werte);
      const richtig = zahl(med);
      const mitte = Math.floor(n / 2);
      return {
        platzhalter: { werte: de(liste(werte)), gesucht: de('den Median (Zentralwert)') },
        loesung: richtig,
        loesungsweg: [
          de(`Der Größe nach ordnen: ${liste(s)}.`),
          de(
            n % 2 === 1
              ? `Der mittlere Wert ist der ${mitte + 1}. von ${n}: ${zahlText(med)}.`
              : `Bei ${n} Werten liegen zwei in der Mitte: ${zahlText(s[mitte - 1] ?? 0)} und ${zahlText(s[mitte] ?? 0)}. Ihr Mittelwert ist ${zahlText(med)}.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'unsortiert',
            zahl(
              n % 2 === 1
                ? (werte[mitte] ?? 0)
                : ((werte[mitte - 1] ?? 0) + (werte[mitte] ?? 0)) / 2,
            ),
          ],
          ['median-gerade', n % 2 === 0 ? zahl(s[mitte] ?? 0) : undefined],
          ['mittel-statt-median', zahl(r1(mittel(werte)))],
        ]),
      };
    }
    const m = mittel(werte);
    const richtig = zahl(r1(m));
    return {
      platzhalter: { werte: de(liste(werte)), gesucht: de('das arithmetische Mittel') },
      loesung: richtig,
      ...(Number.isInteger(m * 10) ? {} : { runden: { stellen: 1, genau: m } }),
      loesungsweg: [
        de(`Summe: ${zahlText(summe(werte))}. Anzahl: ${n}.`),
        de(`${zahlText(summe(werte))} : ${n} ≈ ${zahlText(r1(m))}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['mittel-statt-median', zahl(median(werte))]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Passender Mittelwert bei Ausreißern (M.DZ.ST.MITTELWERTE.WAEHLEN, Niveau E)

/** „Welcher Mittelwert beschreibt das typische Gehalt am besten?“ */
export const stPassenderMittelwert: Generator<Record<string, never>> = {
  id: 'st.passender-mittelwert',
  version: 1,
  platzhalter: ['situation'],
  fehlerbildIds: ['ausreisser', 'modal', 'streumass'],

  erzeuge(seed) {
    const r = rng(seed);
    const fall = r.pick([
      {
        was: 'Monatsgehälter in einer kleinen Firma (in €)',
        basis: 2000,
        schritt: 100,
        ausreisser: 15000,
      },
      { was: 'Wartezeiten an einer Kasse (in Minuten)', basis: 3, schritt: 1, ausreisser: 45 },
      {
        was: 'Taschengeld in einer Klasse (in € pro Monat)',
        basis: 20,
        schritt: 5,
        ausreisser: 300,
      },
    ] as const);
    const werte = [0, 1, 2, 3].map((k) => fall.basis + k * fall.schritt * r.int(1, 2));
    werte.push(fall.ausreisser);
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Der Median (${zahlText(median(werte))}), weil der Ausreißer ihn kaum beeinflusst.`,
      ],
      [
        'ausreisser',
        `Das arithmetische Mittel (${zahlText(r1(mittel(werte)))}), weil es alle Werte berücksichtigt.`,
      ],
      ['modal', 'Der Modalwert, weil er immer am aussagekräftigsten ist.'],
      [
        'streumass',
        `Die Spannweite (${zahlText(Math.max(...werte) - Math.min(...werte))}), weil sie die Unterschiede zeigt.`,
      ],
    ];
    const l = mische(r, kandidaten);
    const index = (id: string) => auswahl(l.findIndex(([k]) => k === id));
    return {
      platzhalter: { situation: de(`${fall.was}: ${liste(werte)}.`) },
      optionen: l.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          `Der Wert ${zahlText(fall.ausreisser)} ist ein Ausreißer, viel größer als alle anderen.`,
        ),
        de(
          `Er zieht das Mittel auf ${zahlText(r1(mittel(werte)))}, obwohl fast alle Werte viel kleiner sind. Der Median ${zahlText(median(werte))} liegt mitten in den typischen Werten.`,
        ),
      ],
      fehlerbilder: l
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Streuung (M.DZ.ST.STREUUNG.BESTIMMEN)

export interface StreuungParameter {
  /** false: Spannweite; true: auch Standardabweichung */
  readonly sigma: boolean;
}

/** „Bestimme die Spannweite / die Standardabweichung der Daten.“ */
export const stStreuung: Generator<StreuungParameter> = {
  id: 'st.streuung',
  version: 1,
  platzhalter: ['werte', 'gesucht'],
  fehlerbildIds: ['maximum', 'varianz-statt-sigma', 'ohne-quadrat'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.int(4, 7);
    const werte = Array.from({ length: n }, () => r.int(2, 20));
    if (Math.max(...werte) === Math.min(...werte)) werte[0] = (werte[0] ?? 0) + 3;
    const art = p.sigma && r.int(0, 2) !== 0 ? 'sigma' : 'spannweite';
    if (art === 'spannweite') {
      const sw = Math.max(...werte) - Math.min(...werte);
      const richtig = zahl(sw);
      return {
        platzhalter: { werte: de(liste(werte)), gesucht: de('die Spannweite') },
        loesung: richtig,
        loesungsweg: [
          de(
            `Größter Wert ${zahlText(Math.max(...werte))}, kleinster Wert ${zahlText(Math.min(...werte))}.`,
          ),
          de(
            `Spannweite: ${zahlText(Math.max(...werte))} − ${zahlText(Math.min(...werte))} = ${zahlText(sw)}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['maximum', zahl(Math.max(...werte))]]),
      };
    }
    const m = mittel(werte);
    const s = sigma(werte);
    const varianz = s * s;
    const mittlereAbw = summe(werte.map((x) => Math.abs(x - m))) / n;
    const richtig = zahl(r1(s));
    return {
      platzhalter: { werte: de(liste(werte)), gesucht: de('die Standardabweichung') },
      loesung: richtig,
      ...(Math.abs(r1(s) - s) < 1e-9 ? {} : { runden: { stellen: 1, genau: s } }),
      loesungsweg: [
        de(`Mittelwert: $\\bar{x} = ${texZahl(r1(m))}$ (genau ${zahlText(rundeAuf(m, 3))}).`),
        de(
          'Abweichungen vom Mittelwert quadrieren, addieren und durch die Anzahl teilen: Varianz.',
        ),
        de(
          `$\\sigma^2 \\approx ${texZahl(r1(varianz))}$, also $\\sigma = \\sqrt{\\sigma^2} \\approx ${texZahl(r1(s))}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        richtig,
        [
          ['varianz-statt-sigma', zahl(r1(varianz))],
          ['ohne-quadrat', zahl(r1(mittlereAbw))],
        ].filter(([, l]) => Math.abs((l as { wert: number }).wert - r1(s)) > 0.15) as [
          string,
          Loesung,
        ][],
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Gleiches Mittel, andere Streuung (M.DZ.ST.STREUUNG.VERGLEICH, Niveau E)

/** „Klasse A und B haben denselben Notendurchschnitt. Welche ist gleichmäßiger?“ */
export const stStreuungVergleich: Generator<Record<string, never>> = {
  id: 'st.streuung-vergleich',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['mittel-reicht', 'groesser-besser', 'anzahl'],

  erzeuge(seed) {
    const r = rng(seed);
    const m = r.int(5, 15);
    const d1 = r.int(1, 2);
    const d2 = r.int(4, 7);
    const eng = [m - d1, m, m, m + d1, m];
    const weit = [m - d2, m - 1, m, m + 1, m + d2];
    const aEng = r.int(0, 1) === 0;
    const [a, b] = aEng ? [eng, weit] : [weit, eng];
    const engName = aEng ? 'A' : 'B';
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `${engName}, denn dort ist die Spannweite kleiner: Die Werte liegen enger um das Mittel ${m}.`,
      ],
      ['mittel-reicht', 'Beide gleich, denn das Mittel ist gleich.'],
      ['groesser-besser', `${aEng ? 'B' : 'A'}, denn dort gibt es größere Werte.`],
      ['anzahl', 'Das kann man nicht sagen, ohne die Anzahl der Werte zu kennen.'],
    ];
    const l = mische(r, kandidaten);
    const index = (id: string) => auswahl(l.findIndex(([k]) => k === id));
    return {
      platzhalter: { a: de(liste(a)), b: de(liste(b)) },
      optionen: l.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Beide Datenreihen haben das Mittel ${m}.`),
        de(
          `Spannweiten: A ${Math.max(...a) - Math.min(...a)}, B ${Math.max(...b) - Math.min(...b)}. Die kleinere Streuung zeigt die gleichmäßigere Reihe.`,
        ),
      ],
      fehlerbilder: l
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Klassen zählen (M.DZ.ST.HISTOGRAMM.KLASSE)

/** „Wie viele Werte liegen in der Klasse 20 bis unter 30?“ */
export const stKlasse: Generator<Record<string, never>> = {
  id: 'st.klasse',
  version: 1,
  platzhalter: ['werte', 'von', 'bis'],
  fehlerbildIds: ['grenze-doppelt', 'grenze-vergessen'],

  erzeuge(seed) {
    const r = rng(seed);
    const von = 10 * r.int(1, 4);
    const bis = von + 10;
    // einige Werte genau auf den Grenzen, damit die Regel zählt
    const werte = [
      von,
      bis,
      ...Array.from({ length: r.int(8, 12) }, () => r.int(von - 9, bis + 9)),
    ];
    const gemischt = mische(r, werte);
    const drin = gemischt.filter((x) => x >= von && x < bis).length;
    const richtig = zahl(drin);
    return {
      platzhalter: { werte: de(liste(gemischt)), von, bis },
      loesung: richtig,
      loesungsweg: [
        de(`Zur Klasse „${von} bis unter ${bis}“ gehört ${von}, aber nicht ${bis}.`),
        de(
          `Werte von ${von} bis ${bis - 1}: ${liste(sortiert(gemischt.filter((x) => x >= von && x < bis)))}. Das sind ${drin}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['grenze-doppelt', zahl(gemischt.filter((x) => x >= von && x <= bis).length)],
        ['grenze-vergessen', zahl(gemischt.filter((x) => x > von && x < bis).length)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Histogramm ablesen (M.DZ.ST.HISTOGRAMM.ABLESEN)

export function histogramm(
  grenzen: readonly number[],
  haeufig: readonly number[],
): ReturnType<typeof bild> {
  const max = Math.max(...haeufig);
  const breite = 50;
  const hoehe = 26;
  const x0 = 40;
  const y0 = 30 + max * hoehe;
  const teile: string[] = [
    linie(x0, y0, x0 + haeufig.length * breite + 10, y0, 2),
    linie(x0, 20, x0, y0, 2),
  ];
  for (let k = 0; k <= max; k++)
    teile.push(
      text(x0 - 22, y0 - k * hoehe + 4, String(k), 11),
      linie(x0 - 4, y0 - k * hoehe, x0, y0 - k * hoehe, 1),
    );
  haeufig.forEach((h, i) => {
    teile.push(rechteck(x0 + i * breite, y0 - h * hoehe, breite, h * hoehe));
  });
  grenzen.forEach((g, i) => teile.push(text(x0 + i * breite - 8, y0 + 16, String(g), 11)));
  return bild(
    x0 + haeufig.length * breite + 30,
    y0 + 26,
    teile,
    de(
      `Histogramm mit den Klassen ${grenzen
        .slice(0, -1)
        .map((g, i) => `${g} bis unter ${grenzen[i + 1]}: ${haeufig[i]}`)
        .join(', ')}.`,
    ),
  );
}

/** „Wie viele Werte liegen insgesamt / ab 30?“ – mit Histogramm */
export const stHistogramm: Generator<Record<string, never>> = {
  id: 'st.histogramm',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['saeulen-gezaehlt', 'eine-klasse'],

  erzeuge(seed) {
    const r = rng(seed);
    const k = r.int(4, 6);
    const start = 10 * r.int(0, 3);
    const grenzen = Array.from({ length: k + 1 }, (_, i) => start + 10 * i);
    const haeufig = Array.from({ length: k }, () => r.int(1, 8));
    const insgesamt = r.int(0, 1) === 0;
    const ab = grenzen[r.int(1, k - 1)] ?? start;
    const idx = grenzen.indexOf(ab);
    const wert = insgesamt ? summe(haeufig) : summe(haeufig.slice(idx));
    const richtig = zahl(wert);
    return {
      platzhalter: {
        frage: de(
          insgesamt
            ? 'Wie viele Werte wurden insgesamt erfasst?'
            : `Wie viele Werte sind mindestens ${ab}?`,
        ),
      },
      bild: histogramm(grenzen, haeufig),
      loesung: richtig,
      loesungsweg: [
        de('Die Höhe jeder Säule gibt an, wie viele Werte in der Klasse liegen.'),
        de(
          insgesamt
            ? `Alle Säulen addieren: ${haeufig.join(' + ')} = ${wert}.`
            : `Säulen ab ${ab} addieren: ${haeufig.slice(idx).join(' + ')} = ${wert}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['saeulen-gezaehlt', zahl(insgesamt ? k : k - idx)],
        ['eine-klasse', insgesamt ? undefined : zahl(haeufig[idx] ?? 0)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Andere Klasseneinteilung (M.DZ.ST.HISTOGRAMM.EINTEILUNG, Niveau E)

/** „Was passiert, wenn man die Klassenbreite verdoppelt?“ */
export const stEinteilung: Generator<Record<string, never>> = {
  id: 'st.einteilung',
  version: 1,
  platzhalter: ['breite'],
  fehlerbildIds: ['daten-aendern', 'gleich', 'mehr-saeulen'],

  erzeuge(seed) {
    const r = rng(seed);
    const b = r.pick([5, 10, 20]);
    const kandidaten: [string, string][] = [
      [
        'richtig',
        'Es gibt weniger, dafür höhere Säulen. Feine Unterschiede innerhalb einer Klasse sieht man nicht mehr.',
      ],
      ['daten-aendern', 'Die Daten selbst ändern sich, das Mittel wird größer.'],
      ['gleich', 'Das Histogramm sieht genauso aus, nur die Beschriftung ändert sich.'],
      ['mehr-saeulen', 'Es gibt mehr und niedrigere Säulen.'],
    ];
    const l = mische(r, kandidaten);
    const index = (id: string) => auswahl(l.findIndex(([k]) => k === id));
    return {
      platzhalter: { breite: b },
      optionen: l.map(([, x]) => ({ text: de(x) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Aus je zwei Klassen der Breite ${b} wird eine Klasse der Breite ${2 * b}.`),
        de(
          'Ihre Häufigkeiten werden addiert: weniger, höhere Säulen. Die Daten bleiben dieselben, nur die Darstellung wird gröber.',
        ),
      ],
      fehlerbilder: l
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Irreführende Statistik (M.DZ.ST.MANIPULATION)

interface Taeuschung {
  readonly situation: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
}

/** einfach: abgeschnittene Achse, absolute Zahlen; schwer: Prozentpunkte, vorgetäuschte Genauigkeit */
function taeuschung(r: Rng, stufe?: 'einfach' | 'schwer'): Taeuschung {
  const art = stufe === undefined ? r.int(0, 3) : r.pick(stufe === 'einfach' ? [0, 1] : [2, 3]);
  if (art === 0) {
    const a = r.int(95, 98);
    const b = a + r.int(1, 3);
    return {
      situation: `Ein Säulendiagramm zeigt die Verkaufszahlen ${a} und ${b} (in Tausend). Die y-Achse beginnt erst bei 94. Die zweite Säule wirkt mehrmals so hoch wie die erste.`,
      richtig: 'Die abgeschnittene Achse übertreibt den Unterschied. Tatsächlich ist er klein.',
      falsch: [
        ['stimmt', 'Nichts, die Säulen zeigen die richtigen Zahlen.'],
        ['nebensache', 'Die Zahlen sind zu ungenau angegeben.'],
        ['andere-taeuschung', 'Es fehlt die Angabe in Prozent.'],
      ],
    };
  }
  if (art === 1) {
    const s1 = 10 * r.int(2, 4);
    const s2 = s1 + 10 * r.int(1, 3);
    return {
      situation: `„In Stadt A gab es ${s2} Fahrraddiebstähle, in Stadt B nur ${s1}. Also ist Stadt A unsicherer.“ Stadt A hat 400 000 Einwohner, Stadt B 50 000.`,
      richtig:
        'Die absoluten Zahlen werden verglichen, obwohl die Städte verschieden groß sind. Man muss die Diebstähle je Einwohner vergleichen.',
      falsch: [
        ['stimmt', 'Die Aussage stimmt, mehr Diebstähle heißt unsicherer.'],
        ['nebensache', 'Die Zahlen sind gerundet und darum falsch.'],
        ['andere-taeuschung', 'Es fehlt ein Diagramm.'],
      ],
    };
  }
  if (art === 2) {
    const v = r.int(10, 30);
    const n = v + r.int(2, 6);
    return {
      situation: `„Der Anteil der Radfahrer stieg von ${v} % auf ${n} %, also um ${n - v} %.“`,
      richtig: `Gestiegen ist er um ${n - v} Prozentpunkte. In Prozent sind das etwa ${zahlText(r1(((n - v) / v) * 100))} %.`,
      falsch: [
        ['stimmt', 'Die Aussage stimmt genau so.'],
        ['nebensache', 'Prozentangaben darf man nicht subtrahieren.'],
        ['andere-taeuschung', `Er stieg um ${n} %.`],
      ],
    };
  }
  const n = r.int(3, 9) * 10;
  return {
    situation: `Eine Umfrage unter ${n} Personen ergibt: „37,284 % sind zufrieden.“`,
    richtig: `Bei nur ${n} Befragten ist die Genauigkeit vorgetäuscht. Eine Person mehr ändert den Anteil um mehr als einen Prozentpunkt.`,
    falsch: [
      ['stimmt', 'Genauer ist immer besser, die Angabe ist vorbildlich.'],
      ['nebensache', 'Es fehlt die Zahl der Unzufriedenen in Prozent.'],
      ['andere-taeuschung', 'Prozentangaben über 30 % sind unglaubwürdig.'],
    ],
  };
}

export interface ManipulationParameter {
  readonly arten: readonly ('erkennen' | 'prozentpunkte')[];
  /** Nur für erkennen: Auswahl der Täuschungen; ohne Angabe alle vier (wie bisher) */
  readonly stufe?: 'einfach' | 'schwer';
}

/** „Was ist an dieser Darstellung irreführend?“ / „Um wie viel Prozent ist der Anteil gestiegen?“ */
const stManipulation: Generator<ManipulationParameter> = {
  id: 'st.manipulation',
  version: 1,
  platzhalter: ['situation', 'frage'],
  fehlerbildIds: ['stimmt', 'nebensache', 'andere-taeuschung', 'prozentpunkte'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    if (art === 'prozentpunkte') {
      const v = r.pick([10, 20, 25, 40, 50]);
      const anstieg = r.pick([0.1, 0.2, 0.25, 0.5]);
      const n = v * (1 + anstieg);
      const richtig = zahl(anstieg * 100);
      return {
        platzhalter: {
          situation: de(
            `Der Anteil der Schüler, die mit dem Rad kommen, stieg von ${zahlText(v)} % auf ${zahlText(n)} %.`,
          ),
          frage: de('Um wie viel Prozent ist der Anteil gestiegen?'),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Der Unterschied ist ${zahlText(n - v)} Prozentpunkte.`),
          de(
            `Bezogen auf den alten Anteil: ${zahlText(n - v)} : ${zahlText(v)} = ${zahlText(anstieg)} = ${zahlText(anstieg * 100)} %.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['prozentpunkte', n - v !== anstieg * 100 ? zahl(n - v) : undefined],
        ]),
      };
    }
    const t = taeuschung(r, p.stufe);
    const l = mische(r, [['richtig', t.richtig] as const, ...t.falsch]);
    const index = (id: string) => auswahl(l.findIndex(([k]) => k === id));
    return {
      platzhalter: { situation: de(t.situation), frage: de('Was ist daran irreführend?') },
      optionen: l.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de('Frage dich: Was soll die Darstellung bewirken, und was zeigen die Zahlen wirklich?'),
        de(t.richtig),
      ],
      fehlerbilder: t.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

/** Täuschung erkennen (M.DZ.ST.MANIPULATION.ERKENNEN) */
export const stTaeuschung = variante(
  stManipulation,
  'st.taeuschung',
  ['stimmt', 'nebensache', 'andere-taeuschung'],
  { arten: ['erkennen'] as const },
);

/** Prozent und Prozentpunkte (M.DZ.ST.MANIPULATION.PROZENTPUNKTE) */
export const stProzentpunkte = variante(stManipulation, 'st.prozentpunkte', ['prozentpunkte'], {
  arten: ['prozentpunkte'] as const,
});
