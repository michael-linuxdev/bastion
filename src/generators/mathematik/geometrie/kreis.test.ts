import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  gegenbeispiel,
  inUmkreis,
  kreisGerade,
  satzbau,
  satzWaehlen,
  winkelAmKreis,
} from './kreis';

// Parameter wie in den Vorlagen (content/…/M.RF.KR.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlen = (t: string) => (t.match(/\d+/g) ?? []).map(Number);
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');

pflichttests(kreisGerade, {
  niveaus: { G: { abstand: false }, M: { abstand: true } },
  unabhaengigeLoesung(i, p) {
    if (p.abstand) {
      const [r = 0, d = 0] = zahlen(T(i, 'frage'));
      return auswahlL(d < r ? 0 : d === r ? 1 : 2);
    }
    // Im Bild: Anzahl der markierten Schnittpunkte (kleine gefüllte Kreise mit r = 3.5)
    const punkte = (i.bild?.svg.match(/r="3\.5"/g) ?? []).length;
    return auswahlL(punkte === 2 ? 0 : punkte === 1 ? 1 : 2);
  },
  grenzverletzungen(i, p) {
    return p.abstand === !i.bild ? [] : ['Bild passt nicht zum Niveau'];
  },
  mindestensVerschieden: { G: 40, M: 40 },
});

pflichttests(inUmkreis, {
  niveaus: { G: { lage: false }, M: { lage: true } },
  unabhaengigeLoesung(i) {
    const f = T(i, 'frage');
    const o = optionen(i);
    if (f.startsWith('Wo liegt'))
      return auswahlL(
        o.findIndex((t) =>
          f.includes('rechtwinkligen')
            ? t.includes('Mitte')
            : f.includes('stumpfwinkligen')
              ? t.includes('außerhalb')
              : t.includes('innerhalb'),
        ),
      );
    return auswahlL(
      o.indexOf(f.includes('Umkreises') ? 'Mittelsenkrechten' : 'Winkelhalbierenden'),
    );
  },
  grenzverletzungen(i, p) {
    return !p.lage && T(i, 'frage').startsWith('Wo liegt') ? ['Lagefrage auf G'] : [];
  },
  mindestensVerschieden: { G: 2, M: 5 },
});

pflichttests(winkelAmKreis, {
  niveaus: { G: { saetze: ['thales'] }, M: { saetze: ['zentri', 'sehnenviereck'] } },
  unabhaengigeLoesung(i) {
    const f = T(i, 'frage');
    const [w = NaN] = zahlen(f.replace(/ABCD|AB/g, ''));
    if (f.includes('Durchmesser')) return { typ: 'zahl', wert: 180 - 90 - w };
    if (f.includes('Sehnenviereck')) return { typ: 'zahl', wert: 180 - w };
    return { typ: 'zahl', wert: f.includes('Wie groß ist der Zentriwinkel') ? 2 * w : w / 2 };
  },
  grenzverletzungen(i, p) {
    const f = T(i, 'frage');
    const v: string[] = [];
    if (!p.saetze.includes('thales') && f.includes('Durchmesser')) v.push('Thales auf M');
    if (i.loesung.typ !== 'zahl' || i.loesung.wert <= 0 || i.loesung.wert >= 180) v.push('Winkel');
    return v;
  },
  mindestensVerschieden: { G: 40, M: 60 },
});

pflichttests(satzWaehlen, {
  niveaus: { G: {}, M: {} },
  unabhaengigeLoesung(i) {
    const l = T(i, 'lage');
    const satz = /Durchmesser|Halbkreis/.test(l)
      ? 'Satz des Thales'
      : /Viereck/.test(l)
        ? 'Satz über das Sehnenviereck'
        : /bei M/.test(l)
          ? 'Zentri-Peripheriewinkelsatz'
          : 'Peripheriewinkelsatz';
    return auswahlL(optionen(i).indexOf(satz));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 5, M: 5 },
});

const UMKEHRUNG_WAHR = new Set([
  'C auf dem Kreis mit dem Durchmesser AB liegt',
  'ein Dreieck gleichseitig ist',
  'ein Dreieck zwei gleich große Winkel hat',
]);

pflichttests(satzbau, {
  niveaus: { G: { umkehrung: false }, M: { umkehrung: true } },
  unabhaengigeLoesung(i) {
    const f = T(i, 'frage');
    const [, wenn = '', dann = ''] = /„Wenn (.+), dann (.+)\.“/.exec(f) ?? [];
    if (f.includes('Umkehrung')) return auswahlL(UMKEHRUNG_WAHR.has(wenn) ? 0 : 1);
    const gesucht = f.includes('Voraussetzung') ? wenn : dann;
    return auswahlL(optionen(i).indexOf(`„${gesucht}“`));
  },
  grenzverletzungen(i, p) {
    return !p.umkehrung && T(i, 'frage').includes('Umkehrung') ? ['Umkehrung auf G'] : [];
  },
  mindestensVerschieden: { G: 12, M: 15 },
});

const GEGENBEISPIELE: Readonly<Record<string, string>> = {
  'Jede Primzahl ist ungerade.': '2',
  'Jede durch 3 teilbare Zahl ist auch durch 6 teilbar.': '9',
  'Das Produkt zweier Zahlen ist immer größer als jede der beiden Zahlen.': '0,5 · 4',
  'Die Summe zweier ganzer Zahlen ist immer größer als jede der beiden Zahlen.': '5 + (−2)',
  'Jedes Quadrat einer Zahl ist größer als die Zahl selbst.': '0,5',
  'Jedes Viereck mit vier gleich langen Seiten ist ein Quadrat.':
    'eine Raute mit Winkeln von 60° und 120°',
  'Jedes Viereck mit gleich langen Diagonalen ist ein Rechteck.': 'ein gleichschenkliges Trapez',
  'In jedem Dreieck ist ein Winkel größer als 60°.': 'ein gleichseitiges Dreieck',
  'Jedes Dreieck mit einem Winkel von 90° ist gleichschenklig.': 'ein Dreieck mit 90°, 30° und 60°',
};

pflichttests(gegenbeispiel, {
  niveaus: { G: { geometrie: false }, M: { geometrie: true } },
  unabhaengigeLoesung(i) {
    return auswahlL(optionen(i).indexOf(GEGENBEISPIELE[T(i, 'aussage')] ?? ''));
  },
  grenzverletzungen(i, p) {
    const geo = /Viereck|Dreieck/.test(T(i, 'aussage'));
    const v: string[] = [];
    if (!p.geometrie && geo) v.push('Geometrie auf G');
    if (optionen(i).length !== 4) v.push('nicht vier Optionen');
    return v;
  },
  mindestensVerschieden: { G: 15, M: 25 },
});
