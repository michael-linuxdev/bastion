import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { prismaNetz, prismaOberflaeche, prismaVolumen, prismaZaehlen } from './prismen';

const angabe = (i: Instanz) => (i.platzhalter['angabe'] as Sprachobjekt).de;
const zahlen = (t: string) => [...t.matchAll(/(\d+) cm/g)].map((m) => Number(m[1]));
const ECKEN = [
  'Dreieck',
  'Viereck',
  'Fünfeck',
  'Sechseck',
  'Siebeneck',
  'Achteck',
  'Neuneck',
  'Zehneck',
];

pflichttests(prismaZaehlen, {
  niveaus: { G: { ecken_max: 6, kanten: false }, M: { ecken_max: 10, kanten: true } },
  unabhaengigeLoesung(i) {
    const n = ECKEN.indexOf((i.platzhalter['grundflaeche'] as Sprachobjekt).de) + 3;
    const was = (i.platzhalter['was'] as Sprachobjekt).de;
    // Eulerscher Polyedersatz: E − K + F = 2
    const ecken = 2 * n;
    const flaechen = n + 2;
    const kanten = ecken + flaechen - 2;
    return { typ: 'zahl', wert: was === 'Ecken' ? ecken : was === 'Kanten' ? kanten : flaechen };
  },
  grenzverletzungen(i, p) {
    const n = ECKEN.indexOf((i.platzhalter['grundflaeche'] as Sprachobjekt).de) + 3;
    const was = (i.platzhalter['was'] as Sprachobjekt).de;
    return n >= 3 && n <= p.ecken_max && (p.kanten || was !== 'Kanten') ? [] : ['außerhalb'];
  },
  mindestensVerschieden: { G: 8, M: 20 },
});

pflichttests(prismaNetz, {
  niveaus: { G: { figuren: 3 }, M: { figuren: 4 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'auswahl',
    wert: (i.optionen ?? []).findIndex((o) =>
      /^Drei Rechtecke .* oben und ein Dreieck unten/.test(o.bild?.beschreibung.de ?? ''),
    ),
  }),
  grenzverletzungen: (i, p) => ((i.optionen ?? []).length === p.figuren ? [] : ['Anzahl']),
  mindestensVerschieden: { G: 20, M: 40 },
});

pflichttests(prismaVolumen, {
  niveaus: { G: { trapez: false, max: 10 }, M: { trapez: true, max: 20 } },
  unabhaengigeLoesung(i) {
    const t = angabe(i);
    const z = zahlen(t);
    const g = t.includes('Trapez')
      ? (((z[0] ?? 0) + (z[1] ?? 0)) * (z[2] ?? 0)) / 2
      : ((z[0] ?? 0) * (z[1] ?? 0)) / 2;
    return { typ: 'zahl', wert: g * (z.at(-1) ?? 0) };
  },
  grenzverletzungen: (i, p) =>
    zahlen(angabe(i)).every((z) => z >= 2 && z <= p.max) &&
    (p.trapez || !angabe(i).includes('Trapez'))
      ? []
      : ['Maße außerhalb'],
  mindestensVerschieden: { G: 80, M: 90 },
});

pflichttests(prismaOberflaeche, {
  niveaus: { G: { faktor_max: 2, hoehe_max: 10 }, M: { faktor_max: 4, hoehe_max: 20 } },
  unabhaengigeLoesung(i) {
    const [a = 0, b = 0, c = 0, , , h = 0] = zahlen(angabe(i));
    return { typ: 'zahl', wert: a * b + a * h + b * h + c * h };
  },
  grenzverletzungen(i, p) {
    const [a = 0, b = 0, c = 0, , , h = 0] = zahlen(angabe(i));
    return a * a + b * b === c * c && a <= 3 * p.faktor_max && h <= p.hoehe_max
      ? []
      : ['außerhalb'];
  },
  mindestensVerschieden: { G: 15, M: 50 },
});
