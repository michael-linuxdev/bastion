// Einheitskreis (VERMITTLUNG §2.3, Werkzeug einheitskreis@1): Winkel am Einheitskreis,
// sin als senkrechte und cos als waagerechte Strecke (Klasse 10, Feld TF, Bedarfsliste B8).
// Als Bild ein fester Winkel; interaktiv ein Regler für den Winkel (per Tastatur bedienbar)
// und ein Umschalter Grad/Bogenmaß. Reine Logik; das Bild kommt aus der Skizze der
// TF-Generatoren, damit Erklärung und Aufgabe gleich aussehen.
import {
  bogenmassText,
  normiert,
  quadrant,
  sinCos,
  zahlText,
} from '../../../generators/mathematik/trigonometrische-funktionen/einheitskreis';

export type Einheit = 'grad' | 'bogen';

export interface EinheitskreisParameter {
  /** Winkel in Grad, 0 … 360 (Standard 30) */
  readonly winkel?: unknown;
  /** Anzeige des Winkels: grad oder bogen (Standard grad) */
  readonly einheit?: unknown;
  /** Schrittweite des Reglers in Grad: 1, 5, 15, 30 oder 45 (Standard 15) */
  readonly schritt?: unknown;
  /** Werte von sin und cos anschreiben (Standard ja) */
  readonly werte?: unknown;
  /** Vergleichswinkel gestrichelt, etwa 30 zu 150 */
  readonly vergleich?: unknown;
}

export interface EinheitskreisZustand {
  readonly winkel: number;
  readonly einheit: Einheit;
  readonly schritt: number;
  readonly werte: boolean;
  readonly vergleich: number | undefined;
}

const SCHRITTE = [1, 5, 15, 30, 45];

/** Parameter prüfen; Unsinniges fällt auf den Standard zurück. */
export function einheitskreisAus(p: EinheitskreisParameter): EinheitskreisZustand {
  const w = p.winkel;
  const winkel = typeof w === 'number' && Number.isFinite(w) && w >= 0 && w <= 360 ? w : 30;
  const v = p.vergleich;
  return {
    winkel,
    einheit: p.einheit === 'bogen' ? 'bogen' : 'grad',
    schritt: SCHRITTE.includes(p.schritt as number) ? (p.schritt as number) : 15,
    werte: p.werte !== false,
    vergleich: typeof v === 'number' && v >= 0 && v <= 360 ? v : undefined,
  };
}

/** Winkel als Text in der gewählten Einheit: „150°“ oder „5π/6“. */
export function winkelText(grad: number, einheit: Einheit): string {
  return einheit === 'bogen' ? bogenmassText(grad) : `${grad}°`;
}

/** Die drei Zeilen unter dem Bild: Winkel, sin, cos – mit Vorzeichen und Quadrant. */
export function anzeige(grad: number, einheit: Einheit) {
  const g = normiert(grad);
  const { sin, cos } = sinCos(g);
  return {
    winkel: winkelText(g, einheit),
    sin: zahlText(sin),
    cos: zahlText(cos),
    quadrant: quadrant(g),
  };
}
