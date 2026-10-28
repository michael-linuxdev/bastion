// Verzeichnis aller Generatoren, angesprochen über "id@version" aus den
// Vorlagen (INHALTSFORMAT §4.1). Alte Versionen bleiben, solange
// Lernereignisse auf sie verweisen können (INHALTSFORMAT §6.1, Regel 5).
//
// Die Generatoren selbst stehen in alle.ts und werden nachgeladen (ARCHITEKTUR
// T-14): `generatorenLaden()` füllt dieses Verzeichnis; die App ruft es zusammen
// mit den Inhaltspaketen auf, bevor eine Aufgabe entsteht.
import type { BeliebigerGenerator } from './alle';

const verzeichnis = new Map<string, BeliebigerGenerator>();
export const generatoren: ReadonlyMap<string, BeliebigerGenerator> = verzeichnis;

let laden: Promise<void> | undefined;

/** Lädt alle Generatoren einmal nach; weitere Aufrufe warten auf dasselbe Laden. */
export function generatorenLaden(): Promise<void> {
  laden ??= import('./alle').then(
    (m) => {
      for (const [schluessel, g] of m.generatoren) verzeichnis.set(schluessel, g);
    },
    (fehler: unknown) => {
      laden = undefined; // beim nächsten Mal neu versuchen
      throw fehler;
    },
  );
  return laden;
}
