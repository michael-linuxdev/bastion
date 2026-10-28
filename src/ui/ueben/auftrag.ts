import type { Kompetenz, Niveau } from '../../core/competence/kompetenz';
import type { GeneratorVorlage } from '../../core/learning/vorlage';

/** Was als Nächstes geübt wird: Kompetenz, Vorlage und Niveau. */
export interface Auftrag {
  readonly kompetenz: Kompetenz;
  readonly vorlage: GeneratorVorlage;
  readonly niveau: Niveau;
}
