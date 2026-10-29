/**
 * Ereignis „vermittlung“ (DATENMODELL §4.7, D-16): ein beantworteter Schritt
 * der Erstvermittlung oder ihr Abschluss. Reines Lesen erzeugt kein Ereignis.
 * Rein: Zeit, Zeitzone, Zufall und Gerät werden hereingereicht (T-2).
 */
import { lerntag, type Tag } from '../policy/lerntag';
import { ulid } from '../rng/ulid';
import type { ZufallsQuelle } from '../rng/zufallsquelle';

/** Schemaversion der Ereignisart `vermittlung` (DATENMODELL §6.2). */
export const VERMITTLUNG_V = 1;

export interface VermittlungEreignis {
  readonly id: string;
  readonly art: 'vermittlung';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly tag: Tag;
  readonly geraet: string;
  /** ID der Kompetenz = ID der Sequenz */
  readonly kompetenz: string;
  /** "<Kompetenz-ID>@<version>" der vermittlung.yaml */
  readonly inhalt: string;
  readonly schritt: string;
  readonly typ: 'antwort' | 'abgeschlossen';
  readonly richtig?: boolean;
  /** erkannte Fehlvorstellung, falls eine */
  readonly fv?: string;
  /** gewählte Option (Index) oder Eingabe als Text */
  readonly antwort?: string;
}

export type VermittlungAngaben = Pick<
  VermittlungEreignis,
  'profil' | 'geraet' | 'kompetenz' | 'inhalt' | 'schritt'
> &
  (
    | {
        readonly typ: 'antwort';
        readonly richtig: boolean;
        readonly antwort: string;
        readonly fv?: string;
      }
    | { readonly typ: 'abgeschlossen' }
  );

/** Baut das Ereignis; Antwortfelder nur bei `antwort`, `fv` nur bei falscher Antwort. */
export function vermittlungEreignis(
  a: VermittlungAngaben,
  tsUtc: number,
  utcVersatzMinuten: number,
  zufall: ZufallsQuelle,
): VermittlungEreignis {
  return {
    id: ulid(tsUtc, zufall),
    art: 'vermittlung',
    v: VERMITTLUNG_V,
    profil: a.profil,
    ts: tsUtc,
    tag: lerntag(tsUtc, utcVersatzMinuten),
    geraet: a.geraet,
    kompetenz: a.kompetenz,
    inhalt: a.inhalt,
    schritt: a.schritt,
    typ: a.typ,
    ...(a.typ === 'antwort'
      ? {
          richtig: a.richtig,
          antwort: a.antwort,
          ...(!a.richtig && a.fv ? { fv: a.fv } : {}),
        }
      : {}),
  };
}

/** Zustand „vermittelt“ (VERMITTLUNG §2.4): Kompetenz → Zeit des ersten Abschlusses. */
export function vermittelt(
  ereignisse: readonly VermittlungEreignis[],
): ReadonlyMap<string, number> {
  const erstes = new Map<string, number>();
  for (const e of ereignisse)
    if (e.typ === 'abgeschlossen' && !(e.ts >= (erstes.get(e.kompetenz) ?? Infinity)))
      erstes.set(e.kompetenz, e.ts);
  return erstes;
}
