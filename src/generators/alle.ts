// Alle Generatoren, eingesammelt aus src/generators/mathematik/ (INHALTSFORMAT §4.1).
// Die App lädt diese Datei nach (index.ts, ARCHITEKTUR T-14) – so bleibt die
// App-Hülle klein, auch wenn Klasse für Klasse Generatoren dazukommen. Der
// Service Worker speichert sie trotzdem vorab: Üben geht auch ohne Netz.
// Tests und Werkzeuge importieren direkt von hier.
import type { Generator } from '../core/learning/generator';

// Generatoren haben je eigene Parametertypen; im Verzeichnis zählt nur die Schnittstelle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Parametertyp je Generator verschieden
export type BeliebigerGenerator = Generator<any>;

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

const liste = Object.values(module).flatMap((m) => Object.values(m).filter(istGenerator));

export const generatoren: ReadonlyMap<string, BeliebigerGenerator> = new Map(
  liste.map((g) => [`${g.id}@${g.version}`, g]),
);

if (generatoren.size !== liste.length) {
  throw new Error('Zwei Generatoren haben dieselbe id@version');
}
