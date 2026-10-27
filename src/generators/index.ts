// Verzeichnis aller Generatoren, angesprochen über "id@version" aus den
// Vorlagen (INHALTSFORMAT §4.1). Alte Versionen bleiben hier, solange
// Lernereignisse auf sie verweisen können (INHALTSFORMAT §6.1, Regel 5).
//
// Eingesammelt wird automatisch: Jeder exportierte Generator in
// src/generators/mathematik/ ist registriert. Die Inhaltsprüfung stellt
// sicher, dass jeder davon von einer Vorlage genutzt wird.
import type { Generator } from '../core/learning/generator';

// Generatoren haben je eigene Parametertypen; im Verzeichnis zählt nur die Schnittstelle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Parametertyp je Generator verschieden
type BeliebigerGenerator = Generator<any>;

const module = import.meta.glob<Record<string, unknown>>(
  ['./mathematik/**/*.ts', '!./mathematik/**/*.test.ts'],
  { eager: true },
);

function istGenerator(x: unknown): x is BeliebigerGenerator {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as BeliebigerGenerator).id === 'string' &&
    Number.isInteger((x as BeliebigerGenerator).version) &&
    typeof (x as BeliebigerGenerator).erzeuge === 'function'
  );
}

const alle = Object.values(module).flatMap((m) => Object.values(m).filter(istGenerator));

export const generatoren: ReadonlyMap<string, BeliebigerGenerator> = new Map(
  alle.map((g) => [`${g.id}@${g.version}`, g]),
);

if (generatoren.size !== alle.length) {
  throw new Error('Zwei Generatoren haben dieselbe id@version');
}
