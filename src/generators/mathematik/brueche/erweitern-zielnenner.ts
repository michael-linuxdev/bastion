import { bruch, gleichGeschrieben, teilerfremdeZaehler } from '../../../core/learning/bruch';
import type { Fehlerbild, Generator } from '../../../core/learning/generator';
import { rng } from '../../../core/rng/rng';

export interface ErweiternZielnennerParameter {
  /** Größter Nenner des Ausgangsbruchs (mindestens 2). */
  readonly nenner_max: number;
  /** Größter Erweiterungsfaktor (mindestens 2; 1 wäre trivial). */
  readonly faktor_max: number;
}

/**
 * „Erweitere 3/4 so, dass der Nenner 20 ist.“ (INHALTSFORMAT §6.2)
 *
 * Der Ausgangsbruch ist echt und schon gekürzt, der Faktor nie 1.
 * Vorlage: M.ZO.BR.ERWEITERN.ZIELNENNER, Niveaus G und M.
 */
export const erweiternZielnenner: Generator<ErweiternZielnennerParameter> = {
  id: 'bruch.erweitern-zielnenner',
  version: 1,
  platzhalter: ['bruch', 'nenner', 'zielnenner', 'faktor'],
  fehlerbildIds: ['addiert', 'nur-nenner', 'zaehler-falscher-faktor'],

  erzeuge(seed, p) {
    if (p.nenner_max < 2 || p.faktor_max < 2) {
      throw new RangeError('nenner_max und faktor_max müssen mindestens 2 sein');
    }
    const r = rng(seed);
    const n = r.int(2, p.nenner_max);
    const z = r.pick(teilerfremdeZaehler(n));
    const k = r.int(2, p.faktor_max);
    const zn = n * k;
    const richtig = bruch(z * k, zn);

    // Reihenfolge = Vorrang, falls zwei Fehlbilder dieselbe Antwort ergeben.
    const kandidaten: Fehlerbild[] = [
      // zum Zähler denselben Betrag addiert wie zum Nenner
      { id: 'addiert', antwort: { typ: 'bruch', wert: bruch(z + (zn - n), zn) } },
      // nur den Nenner geändert
      { id: 'nur-nenner', antwort: { typ: 'bruch', wert: bruch(z, zn) } },
      // Nenner richtig, Zähler mit falschem Faktor
      { id: 'zaehler-falscher-faktor', antwort: { typ: 'bruch', wert: bruch(z * (k + 1), zn) } },
    ];
    const fehlerbilder: Fehlerbild[] = [];
    for (const f of kandidaten) {
      if (f.antwort.typ !== 'bruch') continue;
      const antwort = f.antwort.wert;
      // Ein Fehlerbild darf nie die richtige Antwort sein und keine Antwort doppelt belegen.
      if (gleichGeschrieben(antwort, richtig)) continue;
      if (
        fehlerbilder.some(
          (g) => g.antwort.typ === 'bruch' && gleichGeschrieben(g.antwort.wert, antwort),
        )
      ) {
        continue;
      }
      fehlerbilder.push(f);
    }

    return {
      platzhalter: { bruch: bruch(z, n), nenner: n, zielnenner: zn, faktor: k },
      loesung: { typ: 'bruch', wert: richtig },
      loesungsweg: [
        { de: `${zn} : ${n} = ${k}` },
        { de: `Zähler und Nenner mit ${k} multiplizieren:` },
        { de: `${z} · ${k} = ${z * k} und ${n} · ${k} = ${zn}` },
        { de: `Ergebnis: ${z * k}/${zn}` },
      ],
      fehlerbilder,
    };
  },
};
