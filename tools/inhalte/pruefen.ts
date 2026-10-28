// Prüft die Inhalte in content/ (INHALTSFORMAT §10.1, Punkte 1–3 und
// Verweise auf Generatoren). Läuft mit pnpm inhalte:pruefen und in pnpm test.
import { pruefeGraph, pruefeKompetenz, type Kompetenz } from '../../src/core/competence/kompetenz';
import {
  pruefeVorlage,
  type GeneratorAngaben,
  type GeneratorVorlage,
} from '../../src/core/learning/vorlage';
import { ladeKompetenzen, ladeVorlagen } from './laden';

export interface Pruefbericht {
  readonly fehler: string[];
  readonly kompetenzen: Kompetenz[];
  readonly vorlagen: GeneratorVorlage[];
}

export function pruefeInhalte(
  inhaltsordner: string,
  generatoren: ReadonlyMap<string, GeneratorAngaben>,
): Pruefbericht {
  const fehler: string[] = [];
  const kompetenzen: Kompetenz[] = [];
  for (const d of ladeKompetenzen(inhaltsordner)) {
    if (d.lesefehler) {
      fehler.push(`${d.datei}: ${d.lesefehler}`);
      continue;
    }
    const f = pruefeKompetenz(d.daten, d.pfadTeile);
    fehler.push(...f.map((x) => `${d.datei}: ${x}`));
    if (f.length === 0) kompetenzen.push(d.daten as Kompetenz);
  }
  fehler.push(...pruefeGraph(kompetenzen));

  const nachId = new Map(kompetenzen.map((k) => [k.id, k]));
  const vorlagen: GeneratorVorlage[] = [];
  const vorlagenIds = new Set<string>();
  for (const v of ladeVorlagen(inhaltsordner)) {
    if (v.lesefehler) {
      fehler.push(`${v.datei}: ${v.lesefehler}`);
      continue;
    }
    const f = pruefeVorlage(v.daten, {
      dateiname: v.dateiname,
      ordnerKompetenz: v.ordnerKompetenz,
      kompetenzen: nachId,
      generatoren,
    });
    fehler.push(...f.map((x) => `${v.datei}: ${x}`));
    if (f.length === 0) {
      const vorlage = v.daten as GeneratorVorlage;
      if (vorlagenIds.has(vorlage.id)) fehler.push(`${v.datei}: Vorlagen-ID doppelt`);
      vorlagenIds.add(vorlage.id);
      vorlagen.push(vorlage);
    }
  }
  return { fehler, kompetenzen, vorlagen };
}

/** Abdeckung je Kompetenz und Niveau: Anzahl Vorlagen (Ziel: mindestens 2, INHALTSFORMAT §10.1). */
export function abdeckung(bericht: Pruefbericht): Map<string, Record<string, number>> {
  const ergebnis = new Map<string, Record<string, number>>();
  for (const k of bericht.kompetenzen) {
    ergebnis.set(k.id, Object.fromEntries(Object.keys(k.niveaus).map((n) => [n, 0])));
  }
  for (const v of bericht.vorlagen) {
    const zeile = ergebnis.get(v.kompetenz);
    if (!zeile) continue;
    for (const n of v.niveaus) zeile[n] = (zeile[n] ?? 0) + 1;
  }
  return ergebnis;
}
