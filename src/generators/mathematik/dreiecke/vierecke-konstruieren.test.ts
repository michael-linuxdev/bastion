import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { viereckEindeutig, viereckSchritt } from './vierecke-konstruieren';

// Parameter wie in den Vorlagen (content/…/M.RF.DV.VIERECKE-KONSTRUIEREN)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');

// Die Schritte je Viereck in richtiger Reihenfolge, hier unabhängig notiert (nur die Anfänge)
const ANFAENGE: Readonly<Record<string, readonly string[]>> = {
  Parallelogramm: [
    'Zeichne die Seite a',
    'Trage in A den Winkel α an AB an.',
    'Trage auf dem freien',
    'Zeichne durch D die Parallele zu AB und',
  ],
  Drachenviereck: [
    'Zeichne die Diagonale',
    'Zeichne einen Kreisbogen',
    'Die Kreisbögen',
    'Verbinde A, B, C und D',
  ],
  Trapez: [
    'Zeichne die Seite a',
    'Trage in A den Winkel α an AB an und',
    'Zeichne durch D die Parallele zu AB.',
    'Trage auf der Parallelen',
  ],
};

pflichttests(viereckSchritt, {
  niveaus: {
    G: { vierecke: ['parallelogramm', 'drachen'] },
    M: { vierecke: ['parallelogramm', 'drachen', 'trapez'] },
  },
  unabhaengigeLoesung(i) {
    const art = Object.keys(ANFAENGE).find((a) => T(i, 'aufgabe').includes(a)) ?? '';
    const k = (T(i, 'bisher').match(/\d+\. /g) ?? []).length;
    const anfang = ANFAENGE[art]?.[k] ?? '?';
    return { typ: 'auswahl', wert: optionen(i).findIndex((o) => o.startsWith(anfang)) };
  },
  grenzverletzungen(i, p) {
    return !p.vierecke.includes('trapez') && T(i, 'aufgabe').includes('Trapez')
      ? ['Trapez auf G']
      : [];
  },
  mindestensVerschieden: { G: 15, M: 20 },
});

const EINDEUTIG = new Set([
  'ein Parallelogramm mit a = 5 cm, b = 3 cm und α = 70°',
  'ein Rechteck mit a = 4 cm und b = 7 cm',
  'ein Quadrat mit a = 4 cm',
  'eine Raute mit a = 4 cm und α = 60°',
  'ein Drachenviereck mit e = 6 cm, a = 4 cm und b = 5 cm',
  'ein Trapez mit a = 7 cm, d = 3 cm, α = 60° und c = 4 cm',
]);

pflichttests(viereckEindeutig, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => ({ typ: 'auswahl', wert: EINDEUTIG.has(T(i, 'angabe')) ? 0 : 1 }),
  grenzverletzungen(i, p) {
    return !p.erweitert && /Drachen|Trapez|vier Seiten/.test(T(i, 'angabe'))
      ? ['M-Fall auf G']
      : [];
  },
  mindestensVerschieden: { G: 7, M: 10 },
});
