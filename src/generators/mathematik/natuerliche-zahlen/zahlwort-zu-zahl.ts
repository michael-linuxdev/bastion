import { zahlDeutsch } from '../../../core/learning/format';
import type { Fehlerbild, Generator, Sprachobjekt } from '../../../core/learning/generator';
import { rng } from '../../../core/rng/rng';
import { zahlwort, zahlwortMoeglich } from './zahlwort';

export interface ZahlwortZuZahlParameter {
  /** Kleinste und größte Stellenzahl (4 … 12). */
  readonly stellen_min: number;
  readonly stellen_max: number;
}

/** Zifferngruppen von links: Milliarden, Millionen, Tausender, Rest (nur die vorhandenen). */
function gruppen(n: number): number[] {
  const g = [
    Math.floor(n / 1e9),
    Math.floor(n / 1e6) % 1000,
    Math.floor(n / 1000) % 1000,
    n % 1000,
  ];
  while (g.length > 1 && g[0] === 0) g.shift();
  return g;
}

/** Fehler „Nullen vergessen“: nur die gesprochenen Gruppen hintereinander geschrieben. */
function ohneNullgruppen(n: number): number {
  return Number(
    gruppen(n)
      .filter((x) => x > 0)
      .map(String)
      .join(''),
  );
}

/** Fehler „Zehner und Einer vertauscht“ (vierundzwanzig → 42) in jeder Dreiergruppe. */
function zehnerEinerVertauscht(n: number): number {
  return gruppen(n).reduce((summe, g) => {
    const h = Math.floor(g / 100);
    const z = Math.floor(g / 10) % 10;
    const e = g % 10;
    const neu = z >= 2 && e > 0 ? h * 100 + e * 10 + z : g;
    return summe * 1000 + neu;
  }, 0);
}

/**
 * „Schreibe als Zahl: drei Millionen vierhunderttausendfünf“
 * Vorlage: M.ZO.NZ.STELLENWERT.ZAHLWORT (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const zahlwortZuZahl: Generator<ZahlwortZuZahlParameter> = {
  id: 'nz.zahlwort-zu-zahl',
  version: 1,
  platzhalter: ['zahlwort'],
  fehlerbildIds: ['nullen-vergessen', 'zehner-einer-vertauscht'],

  erzeuge(seed, p) {
    if (p.stellen_min < 1 || p.stellen_max > 12 || p.stellen_min > p.stellen_max) {
      throw new RangeError('Stellenzahl muss in 1 … 12 liegen');
    }
    const r = rng(seed);
    const anzahl = r.int(p.stellen_min, p.stellen_max);
    // Nullen häufiger als andere Ziffern: Sie sind die eigentliche Schwierigkeit.
    let zahl = r.int(1, 9);
    for (let i = 1; i < anzahl; i++) zahl = zahl * 10 + (r.zahl() < 0.35 ? 0 : r.int(1, 9));
    // „zweihunderteine Millionen“ u. Ä. meiden (siehe zahlwort): letzte Ziffer der Gruppe ändern.
    while (!zahlwortMoeglich(zahl)) {
      zahl += Math.floor(zahl / 1e9) % 100 === 1 && zahl >= 2e9 ? 1e9 : 1e6;
    }

    const kandidaten: [string, number][] = [
      ['nullen-vergessen', ohneNullgruppen(zahl)],
      ['zehner-einer-vertauscht', zehnerEinerVertauscht(zahl)],
    ];
    const fehlerbilder: Fehlerbild[] = [];
    const vergeben = new Set([zahl]);
    for (const [id, antwort] of kandidaten) {
      if (vergeben.has(antwort)) continue;
      vergeben.add(antwort);
      fehlerbilder.push({ id, antwort: { typ: 'zahl', wert: antwort } });
    }

    const wort: Sprachobjekt = { de: zahlwort(zahl) };
    const g = gruppen(zahl);
    const namen = ['Einer', 'Tausender', 'Millionen', 'Milliarden'];
    const schritte: Sprachobjekt[] = g
      .map((wert, i) => ({ wert, stufe: g.length - 1 - i }))
      .filter(({ wert }) => wert > 0)
      .map(({ wert, stufe }) => ({
        de: `${namen[stufe] ?? ''}: ${zahlDeutsch(wert * 1000 ** stufe)}`,
      }));

    return {
      platzhalter: { zahlwort: wort },
      loesung: { typ: 'zahl', wert: zahl },
      loesungsweg: [
        { de: 'Zerlege das Zahlwort in Milliarden, Millionen, Tausender und den Rest.' },
        ...schritte,
        { de: `Leere Stellen mit Nullen füllen: ${zahlDeutsch(zahl)}` },
      ],
      fehlerbilder,
    };
  },
};
