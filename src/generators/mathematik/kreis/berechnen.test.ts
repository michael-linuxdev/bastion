import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { kreisBerechnen, kreisFigur, kreisring, kreisSach } from './berechnen';

// Parameter wie in den Vorlagen (content/…/M.GM.KR.*); gerechnet mit π ≈ 3,14
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const B = (i: Instanz) => i.bild?.beschreibung.de ?? '';
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e4) / 1e4 });
const zahlAus = (t: string) => Number(t.replace(/\s/g, '').replace(',', '.'));
const nach = (t: string, re: RegExp) => zahlAus(re.exec(t)?.[1] ?? 'NaN');
const N = '(\\d+(?:,\\d+)?)';
const pi = 3.14;
/** höchstens zwei Stellen nach dem Komma */
const genau = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

pflichttests(kreisBerechnen, {
  niveaus: { G: { umkehr: false }, M: { umkehr: true } },
  unabhaengigeLoesung(i, p) {
    const a = T(i, 'aufgabe');
    if (!p.umkehr) {
      const b = B(i);
      const rad = b.includes('Radius')
        ? nach(b, new RegExp(`r = ${N} cm`))
        : nach(b, new RegExp(`d = ${N} cm`)) / 2;
      return zahlL(a.includes('Flächeninhalt') ? pi * rad * rad : pi * 2 * rad);
    }
    const rad = a.includes('Flächeninhalt')
      ? Math.sqrt(nach(a, new RegExp(`Flächeninhalt ${N} cm²`)) / pi)
      : nach(a, new RegExp(`Umfang ${N} cm`)) / pi / 2;
    return zahlL(a.includes('Radius r') ? rad : 2 * rad);
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && genau(i.loesung.wert) ? [] : ['Lösung nicht genau'],
  mindestensVerschieden: { G: 50, M: 65 },
});

pflichttests(kreisSach, {
  niveaus: { G: { umkehr: false }, M: { umkehr: true } },
  unabhaengigeLoesung(i, p) {
    const a = T(i, 'aufgabe');
    const d = nach(a, /mit (\d+) cm Durchmesser/);
    if (!p.umkehr) return zahlL((pi * d * nach(a, /dreht sich (\d+)-mal/)) / 100);
    return zahlL((nach(a, new RegExp(`fährt ${N} m weit`)) * 100) / (pi * d));
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && genau(i.loesung.wert) ? [] : ['Lösung nicht genau'],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(kreisring, {
  niveaus: { G: { durchmesser: false }, M: { durchmesser: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    if (a.includes('Unterlegscheibe')) {
      const ra = nach(a, /außen (\d+) mm/) / 2;
      const ri = nach(a, /innen (\d+) mm/) / 2;
      return zahlL(pi * (ra * ra - ri * ri));
    }
    const b = B(i);
    const ra = nach(b, /äußere Radius ist (\d+)/);
    const ri = nach(b, /innere Radius (\d+)/);
    return zahlL(pi * (ra * ra - ri * ri));
  },
  grenzverletzungen: (i, p) =>
    !p.durchmesser && T(i, 'aufgabe').includes('Durchmesser') ? ['Durchmesser auf G'] : [],
  mindestensVerschieden: { G: 65, M: 70 },
});

pflichttests(kreisFigur, {
  niveaus: { G: { zusammengesetzt: false }, M: { zusammengesetzt: true } },
  unabhaengigeLoesung(i) {
    const b = B(i);
    if (b.startsWith('Ein Viertelkreis')) return zahlL((pi * nach(b, /Radius (\d+)/) ** 2) / 4);
    if (b.startsWith('Ein Halbkreis'))
      return zahlL((pi * (nach(b, /Durchmesser (\d+)/) / 2) ** 2) / 2);
    const a = nach(b, /(\d+) cm lang/);
    const d = nach(b, /(\d+) cm hoch/);
    const halbkreise = b.includes('beiden') ? 2 : 1;
    return zahlL(a * d + (halbkreise * pi * (d / 2) ** 2) / 2);
  },
  grenzverletzungen: (i, p) =>
    !p.zusammengesetzt && B(i).startsWith('Ein Rechteck') ? ['zusammengesetzt auf G'] : [],
  mindestensVerschieden: { G: 15, M: 70 },
});
