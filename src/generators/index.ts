// Verzeichnis aller Generatoren, angesprochen über "id@version" aus den
// Vorlagen (INHALTSFORMAT §4.1). Alte Versionen bleiben hier, solange
// Lernereignisse auf sie verweisen können (INHALTSFORMAT §6.1, Regel 5).
import type { Generator } from '../core/learning/generator';
import { erweiternZielnenner } from './mathematik/brueche/erweitern-zielnenner';

// Generatoren haben je eigene Parametertypen; im Verzeichnis zählt nur die Schnittstelle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Parametertyp je Generator verschieden
type BeliebigerGenerator = Generator<any>;

const alle: readonly BeliebigerGenerator[] = [erweiternZielnenner];

export const generatoren: ReadonlyMap<string, BeliebigerGenerator> = new Map(
  alle.map((g) => [`${g.id}@${g.version}`, g]),
);
