// Anleitungsbild (VERMITTLUNG §2.3, Werkzeug anleitungsbild@1): ein Bild aus einer Zeichen-
// Anleitung (L-10) in der Erstvermittlung, etwa der Kegel mit Höhe und Mantellinien. So zeigen
// Erklärung und Anleitung dieselbe Zeichnung. Reine Logik; Darstellung in Anleitungsbild.svelte.
import type { Bild } from '../../../core/learning/generator';
import { anleitungsBilder } from '../../../generators/anleitungen';

export interface AnleitungsbildParameter {
  /** Bilder einer Anleitung als „id@version“, z. B. anleitung.schraegbild-kegel@1 */
  readonly anleitung?: unknown;
  /** Nummer des Bildes, ab 1 */
  readonly bild?: unknown;
}

/** Das gewünschte Bild oder undefined, wenn Anleitung oder Nummer nicht passen. */
export function anleitungsbild(p: AnleitungsbildParameter): Bild | undefined {
  const a = typeof p.anleitung === 'string' ? anleitungsBilder.get(p.anleitung) : undefined;
  if (!a || !Number.isInteger(p.bild)) return undefined;
  return a.bilder()[(p.bild as number) - 1];
}
