// Daten darstellen und beurteilen – Klasse 7 (LEHRPLAN §8c, M.DZ.DA.DIAGRAMME):
// Säulen- und Liniendiagramme ablesen, das passende Diagramm wählen und
// irreführende Darstellungen (abgeschnittene Achse) erkennen.
import { zahlText } from '../../../core/learning/text';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, kreis, linie, rechteck, text } from '../../svg';

const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni'] as const;
const MONATE_LANG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'] as const;

/** Säulen- oder Liniendiagramm mit beschrifteter y-Achse von unten bis oben. */
function diagramm(
  werte: readonly number[],
  namen: readonly string[],
  schritt: number,
  linienart: boolean,
  unten = 0,
) {
  const oben = unten + schritt * Math.ceil((Math.max(...werte) - unten) / schritt);
  const x0 = 50;
  const y0 = 190;
  const hoehe = 160;
  const breite = 300;
  const py = (w: number) => y0 - ((w - unten) / (oben - unten)) * hoehe;
  const abstand = breite / werte.length;
  const px = (i: number) => x0 + abstand * (i + 0.5);
  const teile: string[] = [];
  for (let w = unten; w <= oben; w += schritt) {
    teile.push(linie(x0, py(w), x0 + breite, py(w), 0.5));
    teile.push(text(x0 - 22, py(w) + 4, zahlText(w), 11));
  }
  teile.push(linie(x0, y0, x0 + breite, y0, 2), linie(x0, y0, x0, y0 - hoehe - 6, 2));
  werte.forEach((w, i) => {
    teile.push(text(px(i), y0 + 16, namen[i] ?? '', 11));
    if (!linienart)
      teile.push(rechteck(px(i) - abstand * 0.3, py(w), abstand * 0.6, y0 - py(w), true));
  });
  if (linienart) {
    werte.forEach((w, i) => {
      teile.push(kreis(px(i), py(w), 3.5, true));
      if (i > 0) teile.push(linie(px(i - 1), py(werte[i - 1] ?? 0), px(i), py(w), 2));
    });
  }
  return { teile, oben };
}

// ---------------------------------------------------------------------------
// Ablesen (M.DZ.DA.DIAGRAMME.ABLESEN)

export interface AblesenParameter {
  /** false: Säulendiagramm, einen Wert ablesen; true: Liniendiagramm, Unterschied zweier Monate */
  readonly unterschied: boolean;
}

const THEMEN = [
  { was: 'Besucher im Freibad', einheit: 'Besucher' },
  { was: 'verkaufte Eiskugeln', einheit: 'Kugeln' },
  { was: 'ausgeliehene Bücher', einheit: 'Bücher' },
  { was: 'Regentage', einheit: 'Tage' },
] as const;

/** „Wie viele Besucher kamen im April?“ / „Um wie viel stieg die Zahl von Februar bis Mai?“ */
export const diagrammAblesen: Generator<AblesenParameter> = {
  id: 'da.diagramm-ablesen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['nachbar-abgelesen', 'nur-ein-wert', 'eine-linie-daneben'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const thema = r.pick(THEMEN);
    const schritt = thema.einheit === 'Tage' ? 2 : r.pick([10, 20, 50] as const);
    const anzahl = p.unterschied ? 6 : 5;
    const werte = Array.from({ length: anzahl }, () => schritt * r.int(1, 9));
    const namen = MONATE.slice(0, anzahl);
    const { teile } = diagramm(werte, namen, schritt, p.unterschied);
    const beschreibung = de(
      `${p.unterschied ? 'Ein Liniendiagramm' : 'Ein Säulendiagramm'}: ${thema.was} je Monat. ` +
        werte.map((w, i) => `${MONATE_LANG[i]}: ${zahlText(w)}`).join(', ') +
        '.',
    );
    const b = bild(370, 220, teile, beschreibung);
    if (!p.unterschied) {
      const i = r.int(0, anzahl - 1);
      const richtig = zahl(werte[i] ?? 0);
      const nachbar = werte[i === anzahl - 1 ? i - 1 : i + 1] ?? 0;
      return {
        platzhalter: { frage: de(`Wie viele ${thema.einheit} waren es im ${MONATE_LANG[i]}?`) },
        bild: b,
        loesung: richtig,
        loesungsweg: [
          de(`Geh von der Säule für ${MONATE_LANG[i]} waagerecht nach links zur Achse.`),
          de(`Dort steht ${zahlText(werte[i] ?? 0)}.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['nachbar-abgelesen', zahl(nachbar)],
          ['eine-linie-daneben', zahl((werte[i] ?? 0) + schritt)],
        ]),
      };
    }
    // Unterschied zwischen zwei Monaten
    const i = r.int(0, anzahl - 2);
    const j = r.int(i + 1, anzahl - 1);
    if ((werte[i] ?? 0) === (werte[j] ?? 0)) return diagrammAblesen.erzeuge(seed + 1, p);
    const a = werte[i] ?? 0;
    const c = werte[j] ?? 0;
    const richtig = zahl(Math.abs(c - a));
    return {
      platzhalter: {
        frage: de(
          `Um wie viele ${thema.einheit} unterscheiden sich ${MONATE_LANG[i]} und ${MONATE_LANG[j]}?`,
        ),
      },
      bild: b,
      loesung: richtig,
      loesungsweg: [
        de(`${MONATE_LANG[i]}: ${zahlText(a)}. ${MONATE_LANG[j]}: ${zahlText(c)}.`),
        de(
          `Unterschied: ${zahlText(Math.max(a, c))} − ${zahlText(Math.min(a, c))} = ${zahlText(Math.abs(c - a))}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['nur-ein-wert', zahl(Math.max(a, c))]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Beurteilen (M.DZ.DA.DIAGRAMME.BEURTEILEN)

export interface BeurteilenParameter {
  /** false: passendes Diagramm wählen; true: abgeschnittene Achse erkennen */
  readonly achse: boolean;
}

const ZWECKE = [
  { satz: 'Wie sich die Temperatur in einer Woche jeden Tag verändert hat.', typ: 1 },
  { satz: 'Wie sich die Größe einer Sonnenblume Woche für Woche verändert.', typ: 1 },
  { satz: 'Welchen Anteil Miete, Essen und Freizeit an den Ausgaben einer Familie haben.', typ: 2 },
  {
    satz: 'Wie sich die Schüler einer Klasse auf Bus, Rad und zu Fuß aufteilen (zusammen 100 %).',
    typ: 2,
  },
  { satz: 'Wie viele Tore fünf Fußballvereine in einer Saison geschossen haben.', typ: 0 },
  { satz: 'Wie viele Einwohner vier Städte haben.', typ: 0 },
] as const;
const ARTEN = ['Säulendiagramm', 'Liniendiagramm', 'Kreisdiagramm'] as const;

/** „Welches Diagramm passt?“ / „Welche Aussage über das Diagramm stimmt?“ */
export const diagrammBeurteilen: Generator<BeurteilenParameter> = {
  id: 'da.diagramm-beurteilen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: [
    'saeulen-fuer-anteile',
    'linie-ohne-zeit',
    'hoehe-verglichen',
    'falsch-abgelesen',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.achse) {
      const z = r.pick(ZWECKE);
      const richtig = auswahl(z.typ);
      return {
        platzhalter: { frage: de(`Du willst zeigen: ${z.satz} Welches Diagramm passt am besten?`) },
        optionen: ARTEN.map((a) => ({ text: de(a) })),
        loesung: richtig,
        loesungsweg: [
          de(
            'Säulen vergleichen Werte, Linien zeigen eine Entwicklung über die Zeit, ein Kreis zeigt Anteile an einem Ganzen.',
          ),
          de(`Hier passt das ${ARTEN[z.typ]}.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['saeulen-fuer-anteile', z.typ === 2 ? auswahl(0) : undefined],
          ['linie-ohne-zeit', z.typ !== 1 ? auswahl(1) : undefined],
        ]),
      };
    }
    return beurteileAchse(r);
  },
};

/** Säulendiagramm mit abgeschnittener Achse: Die Höhen täuschen. */
function beurteileAchse(r: Rng) {
  const unten = r.pick([100, 200, 500] as const);
  const schritt = unten === 500 ? 10 : 5;
  const a = unten + schritt * r.int(1, 2);
  let b = unten + schritt * r.int(4, 7);
  if (b === a) b += schritt;
  const namen = ['Laden A', 'Laden B'];
  const { teile } = diagramm([a, b], namen, schritt, false, unten);
  const faktor = Math.round((b - unten) / (a - unten));
  const unterschied = b - a;
  const aussagen = mische(r, [
    [
      'wahr',
      `Laden B hat ${zahlText(unterschied)} Stück mehr verkauft als Laden A – nur etwas mehr.`,
    ],
    ['hoehe-verglichen', `Laden B hat etwa ${faktor}-mal so viel verkauft wie Laden A.`],
    ['falsch-abgelesen', `Laden A hat ${zahlText(a - unten)} Stück verkauft.`],
  ] as const);
  const index = (id: string) => auswahl(aussagen.findIndex(([k]) => k === id));
  const richtig = index('wahr');
  return {
    platzhalter: { frage: de('Das Diagramm zeigt verkaufte Fahrräder. Welche Aussage stimmt?') },
    bild: bild(
      370,
      220,
      teile,
      de(
        `Ein Säulendiagramm mit zwei Säulen. Die Achse beginnt nicht bei 0, sondern bei ${zahlText(unten)}. ` +
          `Laden A: ${zahlText(a)}, Laden B: ${zahlText(b)}. Die Säule von B ist etwa ${faktor}-mal so hoch.`,
      ),
    ),
    optionen: aussagen.map(([, t]) => ({ text: de(t) })),
    loesung: richtig,
    loesungsweg: [
      de(`Achtung: Die Achse beginnt bei ${zahlText(unten)}, nicht bei 0. Die Höhen täuschen.`),
      de(`A: ${zahlText(a)}, B: ${zahlText(b)} – Unterschied ${zahlText(unterschied)}.`),
    ],
    fehlerbilder: fehlerbilderAus(richtig, [
      ['hoehe-verglichen', index('hoehe-verglichen')],
      ['falsch-abgelesen', index('falsch-abgelesen')],
    ]),
  };
}
