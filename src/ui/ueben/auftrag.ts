import type { Kompetenz, Niveau } from '../../core/competence/kompetenz';
import type { Loesung } from '../../core/learning/generator';
import type { GeneratorVorlage } from '../../core/learning/vorlage';

/** Was als Nächstes geübt wird: Kompetenz, Vorlage und Niveau. */
export interface Auftrag {
  readonly kompetenz: Kompetenz;
  readonly vorlage: GeneratorVorlage;
  readonly niveau: Niveau;
  /** Fehlerwerkstatt: genau diese Aufgabe noch einmal (gleicher Seed) … */
  readonly seed?: number;
  /** … als Korrektur dieses früheren Ereignisses … */
  readonly korrigiert?: string;
  /** … mit der damaligen Antwort zum Vergleich. */
  readonly frueher?: Loesung;
}
