// Vierecke konstruieren – Klasse 7 (LEHRPLAN §8c, M.RF.DV.VIERECKE-KONSTRUIEREN):
// den nächsten Konstruktionsschritt wählen und entscheiden, ob die Angaben ein
// Viereck eindeutig festlegen. Gezeichnet wird auf Papier (L-10, Anleitung).
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange } from '../../hilfen';

type Viereck = 'parallelogramm' | 'drachen' | 'trapez';

const KONSTRUKTION: Readonly<Record<Viereck, { gegeben: string; schritte: readonly string[] }>> = {
  parallelogramm: {
    gegeben: 'ein Parallelogramm aus a = AB, b = AD und dem Winkel α bei A',
    schritte: [
      'Zeichne die Seite a = AB.',
      'Trage in A den Winkel α an AB an.',
      'Trage auf dem freien Schenkel von A aus die Länge b ab. Dort liegt D.',
      'Zeichne durch D die Parallele zu AB und durch B die Parallele zu AD. Ihr Schnittpunkt ist C.',
    ],
  },
  drachen: {
    gegeben: 'ein Drachenviereck aus der Diagonale e = AC und den Seiten a = AB und b = BC',
    schritte: [
      'Zeichne die Diagonale e = AC.',
      'Zeichne einen Kreisbogen um A mit dem Radius a und einen um C mit dem Radius b.',
      'Die Kreisbögen schneiden sich oberhalb und unterhalb von AC in B und D.',
      'Verbinde A, B, C und D zum Drachenviereck.',
    ],
  },
  trapez: {
    gegeben:
      'ein Trapez aus a = AB, dem Winkel α bei A, der Seite d = AD und c = DC (c parallel zu a)',
    schritte: [
      'Zeichne die Seite a = AB.',
      'Trage in A den Winkel α an AB an und trage darauf d ab. Dort liegt D.',
      'Zeichne durch D die Parallele zu AB.',
      'Trage auf der Parallelen von D aus die Länge c ab. Dort liegt C. Verbinde C mit B.',
    ],
  },
};

export interface ViereckSchrittParameter {
  readonly vierecke: readonly Viereck[];
}

/** „Du konstruierst … Bisher: 1. … 2. … Was ist der nächste Schritt?“ */
export const viereckSchritt: Generator<ViereckSchrittParameter> = {
  id: 'dv.viereck-schritt',
  version: 1,
  platzhalter: ['aufgabe', 'bisher'],
  fehlerbildIds: ['schritt-uebersprungen', 'anderes-viereck'],

  erzeuge(seed, p) {
    verlange(p.vierecke.length > 0, 'vierecke fehlt');
    const r = rng(seed);
    const art = r.pick(p.vierecke);
    const { gegeben, schritte } = KONSTRUKTION[art];
    const k = r.int(1, schritte.length - 1);
    const naechster = schritte[k] ?? '';
    const spaeter = schritte[k + 1];
    const fremdeListe = (Object.keys(KONSTRUKTION) as Viereck[])
      .filter((v) => v !== art)
      .flatMap((v) => KONSTRUKTION[v].schritte)
      .filter((s) => !schritte.includes(s));
    const fremd = r.pick(fremdeListe);
    const optionen = mische(r, [naechster, fremd, ...(spaeter ? [spaeter] : [schritte[0] ?? ''])]);
    const richtig = auswahl(optionen.indexOf(naechster));
    return {
      platzhalter: {
        aufgabe: de(`Du konstruierst ${gegeben}.`),
        bisher: de(
          schritte
            .slice(0, k)
            .map((s, i) => `${i + 1}. ${s}`)
            .join(' '),
        ),
      },
      optionen: optionen.map((t) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: schritte.map((s, i) => de(`${i + 1}. ${s}`)),
      fehlerbilder: fehlerbilderAus(richtig, [
        ['schritt-uebersprungen', spaeter ? auswahl(optionen.indexOf(spaeter)) : undefined],
        ['anderes-viereck', auswahl(optionen.indexOf(fremd))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Legen die Angaben das Viereck eindeutig fest? (M.RF.DV.VIERECKE-KONSTRUIEREN.EINDEUTIG)

interface Angabe {
  readonly text: string;
  readonly eindeutig: boolean;
  readonly warum: string;
  readonly erweitert: boolean;
}

const ANGABEN: readonly Angabe[] = [
  {
    text: 'ein Parallelogramm mit a = 5 cm, b = 3 cm und α = 70°',
    eindeutig: true,
    warum: 'Zwei Seiten und der Winkel dazwischen legen das Parallelogramm fest.',
    erweitert: false,
  },
  {
    text: 'ein Parallelogramm mit a = 5 cm und b = 3 cm',
    eindeutig: false,
    warum: 'Der Winkel fehlt: Das Parallelogramm kann flach oder steil sein.',
    erweitert: false,
  },
  {
    text: 'ein Parallelogramm mit a = 6 cm und α = 50°',
    eindeutig: false,
    warum: 'Die zweite Seite fehlt: Das Parallelogramm kann verschieden breit sein.',
    erweitert: false,
  },
  {
    text: 'ein Rechteck mit a = 4 cm und b = 7 cm',
    eindeutig: true,
    warum: 'Alle Winkel sind 90°, die beiden Seiten legen das Rechteck fest.',
    erweitert: false,
  },
  {
    text: 'ein Quadrat mit a = 4 cm',
    eindeutig: true,
    warum: 'Alle Seiten sind gleich lang und alle Winkel 90°.',
    erweitert: false,
  },
  {
    text: 'eine Raute mit a = 4 cm',
    eindeutig: false,
    warum: 'Der Winkel fehlt: Eine Raute kann flach oder steil sein.',
    erweitert: false,
  },
  {
    text: 'eine Raute mit a = 4 cm und α = 60°',
    eindeutig: true,
    warum: 'Alle Seiten sind 4 cm lang, der Winkel legt die Form fest.',
    erweitert: false,
  },
  {
    text: 'ein Drachenviereck mit e = 6 cm, a = 4 cm und b = 5 cm',
    eindeutig: true,
    warum:
      'Die Diagonale und die beiden Seitenlängen legen die Ecken fest – wie zwei Dreiecke aus drei Seiten.',
    erweitert: true,
  },
  {
    text: 'ein Drachenviereck mit a = 4 cm und b = 5 cm',
    eindeutig: false,
    warum: 'Die Diagonale oder ein Winkel fehlt: Der Drachen kann schmal oder breit sein.',
    erweitert: true,
  },
  {
    text: 'ein Trapez mit a = 7 cm, c = 4 cm und der Höhe h = 3 cm',
    eindeutig: false,
    warum: 'Die Seite c kann verschoben werden: Es gibt viele Trapeze mit diesen Maßen.',
    erweitert: true,
  },
  {
    text: 'ein Trapez mit a = 7 cm, d = 3 cm, α = 60° und c = 4 cm',
    eindeutig: true,
    warum: 'Mit a, α und d liegt D fest; c auf der Parallelen legt C fest.',
    erweitert: true,
  },
  {
    text: 'ein Viereck mit vier Seiten von 3 cm, 4 cm, 5 cm und 6 cm',
    eindeutig: false,
    warum: 'Vier Seiten allein legen ein Viereck nicht fest – es lässt sich „verbiegen“.',
    erweitert: true,
  },
];

export interface EindeutigParameter {
  readonly erweitert: boolean;
}

/** „Ist … durch diese Angaben eindeutig festgelegt?“ – ja oder nein */
export const viereckEindeutig: Generator<EindeutigParameter> = {
  id: 'dv.viereck-eindeutig',
  version: 1,
  platzhalter: ['angabe'],
  fehlerbildIds: ['zu-wenig-angaben', 'genug-angaben'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = r.pick(ANGABEN.filter((x) => p.erweitert || !x.erweitert));
    const richtig = auswahl(a.eindeutig ? 0 : 1);
    return {
      platzhalter: { angabe: de(a.text) },
      optionen: [
        { text: de('Ja, genau ein Viereck.') },
        { text: de('Nein, es gibt verschiedene.') },
      ],
      loesung: richtig,
      loesungsweg: [de(a.warum)],
      fehlerbilder: fehlerbilderAus(richtig, [
        [a.eindeutig ? 'genug-angaben' : 'zu-wenig-angaben', auswahl(a.eindeutig ? 1 : 0)],
      ]),
    };
  },
};
