// Lädt Inhalte und Generatoren und baut daraus den Prüfbogen (bogen.ts).
// Braucht Vite wegen import.meta.glob in src/generators/alle.ts; lauf.ts startet es so.
import type { Kompetenz } from '../../src/core/competence/kompetenz';
import type { Begriff } from '../../src/core/learning/begriffe';
import type { Fehlvorstellung } from '../../src/core/learning/fehlvorstellung';
import type { Vermittlung } from '../../src/core/learning/vermittlung';
import type { GeneratorVorlage } from '../../src/core/learning/vorlage';
import { generatoren } from '../../src/generators/alle';
import {
  ladeBegriffe,
  ladeFehlvorstellungen,
  ladeKompetenzen,
  ladeVermittlungen,
  ladeVorlagen,
} from '../inhalte/laden';
import { pruefbogen, type BogenEingabe } from './bogen';

export function eingabeAusInhalten(
  ordner: string,
  ids: readonly string[],
  datum: string,
  stichprobe = 20,
): BogenEingabe {
  const alle = new Map(
    ladeKompetenzen(ordner)
      .map((d) => d.daten as Kompetenz)
      .map((k) => [k.id, k]),
  );
  const fehlend = ids.filter((id) => !alle.has(id));
  if (fehlend.length > 0) throw new Error(`Unbekannte Kompetenz: ${fehlend.join(', ')}`);
  const vermittlungen = new Map(
    ladeVermittlungen(ordner)
      .map((d) => d.daten as Vermittlung)
      .map((v) => [v.kompetenz, v]),
  );
  const vorlagen = ladeVorlagen(ordner)
    .map((d) => d.daten as GeneratorVorlage)
    .filter((v) => ids.includes(v.kompetenz) && v.quelle === 'generator');
  const fehlvorstellungen = new Map(
    ladeFehlvorstellungen(ordner)
      .map((d) => d.daten as Fehlvorstellung)
      .map((f) => [f.id, f]),
  );
  const begriffe = (ladeBegriffe(ordner).daten as { begriffe: Begriff[] }).begriffe;
  return {
    kompetenzen: ids.map((id) => alle.get(id) as Kompetenz),
    alleKompetenzen: alle,
    vermittlungen,
    vorlagen,
    fehlvorstellungen,
    begriffe,
    generatoren,
    stichprobe,
    datum,
  };
}

export const bogenAusInhalten = (...args: Parameters<typeof eingabeAusInhalten>) =>
  pruefbogen(eingabeAusInhalten(...args));
