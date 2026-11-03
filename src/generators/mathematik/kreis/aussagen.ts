// Kreis, Niveau E – Klasse 8 (LEHRPLAN §8d, M.GM.KR): begründen statt nur rechnen.
// Wie ändern sich Umfang und Fläche, wenn der Radius k-mal so groß wird? Wo steckt
// der Fehler in einer Kreisring-Rechnung? Gerechnet wird mit π ≈ 3,14 wie in berechnen.ts.
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Generator } from '../../../core/learning/generator';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische } from '../../hilfen';
import { PI } from './berechnen';

const t = (x: number) => zahlText(runde10(x, 4));

// ---------------------------------------------------------------------------
// Radius k-mal so groß (M.GM.KR.UMFANG-FLAECHE.AENDERN, Niveau E)

/** „Der Radius wird 3-mal so groß. Wie ändert sich der Flächeninhalt?“ */
export const krAendern: Generator<Record<string, never>> = {
  id: 'kr.aendern',
  version: 1,
  platzhalter: ['faktor', 'groesse'],
  fehlerbildIds: ['linear', 'quadratisch', 'mal-zwei', 'kubisch'],

  erzeuge(seed) {
    const r = rng(seed);
    // k = 2 fehlt mit Absicht: Dort wären 2 · k und k² gleich, zwei Möglichkeiten sähen gleich aus.
    const k = r.pick([3, 4, 5]);
    const flaeche = r.int(0, 1) === 0;
    const richtig = flaeche ? k * k : k;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        flaeche
          ? `${k * k}-mal so groß, denn in A = π · r² steckt r zweimal als Faktor.`
          : `${k}-mal so groß, denn in U = 2 · π · r steckt r nur einmal als Faktor.`,
      ],
      flaeche
        ? ['linear', `${k}-mal so groß, genau wie der Radius.`]
        : ['quadratisch', `${k * k}-mal so groß, denn der Kreis wächst in alle Richtungen.`],
      ['mal-zwei', `${2 * k}-mal so groß, wegen der 2 in der Formel.`],
      ['kubisch', `${k ** 3}-mal so groß, denn r wird dreimal gestreckt.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([q]) => q === id));
    return {
      platzhalter: {
        faktor: k,
        groesse: de(flaeche ? 'ihr Flächeninhalt' : 'ihr Umfang'),
      },
      optionen: liste.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          flaeche
            ? `A = π · r². Mit ${k} · r statt r: π · (${k} · r)² = ${k * k} · π · r².`
            : `U = 2 · π · r. Mit ${k} · r statt r: 2 · π · ${k} · r = ${k} · 2 · π · r.`,
        ),
        de(`Der ${flaeche ? 'Flächeninhalt' : 'Umfang'} wird ${richtig}-mal so groß.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Fehler in einer Kreisring-Rechnung (M.GM.KR.KREISRING.FEHLER, Niveau E)

/** „Lena rechnet A = π · (R − r)². Stimmt das?“ */
export const krRingFehler: Generator<Record<string, never>> = {
  id: 'kr.ring-fehler',
  version: 1,
  platzhalter: ['gross', 'klein', 'rechnung'],
  fehlerbildIds: ['radien-abgezogen', 'umfang', 'durchmesser'],

  erzeuge(seed) {
    const r = rng(seed);
    const R = r.int(4, 10);
    const rr = r.int(1, R - 2);
    const falsch = PI * (R - rr) ** 2;
    const ring = PI * R * R - PI * rr * rr;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Falsch. Erst die Flächen, dann abziehen: π · ${R}² − π · ${rr}² = ${t(ring)} cm².`,
      ],
      ['radien-abgezogen', `Richtig. Die Breite des Rings ist R − r, damit rechnet man.`],
      ['umfang', `Falsch. Man muss die Umfänge der beiden Kreise abziehen.`],
      ['durchmesser', `Falsch. Man muss mit den Durchmessern statt mit den Radien rechnen.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([q]) => q === id));
    return {
      platzhalter: {
        gross: R,
        klein: rr,
        rechnung: de(`A = π · (${R} − ${rr})² = ${t(falsch)} cm²`),
      },
      optionen: liste.map(([, x]) => ({ text: de(x) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          'Der Ring ist der große Kreis ohne den kleinen. Abgezogen werden Flächen, keine Längen.',
        ),
        de(
          `A = π · ${R}² − π · ${rr}² = ${t(PI * R * R)} − ${t(PI * rr * rr)} = ${t(ring)} cm². Lenas ${t(falsch)} cm² sind zu wenig.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
