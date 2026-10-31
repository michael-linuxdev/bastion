// Alle Inhaltsdateien mit Review-Stufe (INHALTSFORMAT §8) und die Auflösung von Kennungen:
// eine Kompetenz-ID meint kompetenz.yaml, vermittlung.yaml und alle Vorlagen und Anleitungen
// in ihrem Ordner; eine Vorlagen- oder Fehlvorstellungs-ID meint genau ihre Datei.
import {
  ladeAnleitungen,
  ladeFehlvorstellungen,
  ladeKompetenzen,
  ladeVermittlungen,
  ladeVorlagen,
  type GeleseneDatei,
} from '../inhalte/laden';

export type Art = 'kompetenz' | 'vermittlung' | 'vorlage' | 'anleitung' | 'fehlvorstellung';

export interface Inhaltsdatei {
  /** Pfad relativ zum Inhaltsordner */
  readonly datei: string;
  readonly art: Art;
  /** ID aus der Datei */
  readonly id: string;
  /** Kompetenz, zu deren Ordner die Datei gehört (nicht bei Fehlvorstellungen) */
  readonly kompetenz?: string;
  readonly daten: Record<string, unknown>;
}

const id = (d: GeleseneDatei) => String((d.daten as { id?: unknown } | undefined)?.id ?? '');

export function inhaltsdateien(ordner: string): Inhaltsdatei[] {
  const mit = <D extends GeleseneDatei>(
    art: Art,
    liste: readonly D[],
    kompetenz: (d: D) => string | undefined,
  ) =>
    liste
      .filter((d) => d.daten !== undefined && typeof d.daten === 'object')
      .map((d) => {
        const k = kompetenz(d);
        return {
          datei: d.datei,
          art,
          id: id(d),
          ...(k ? { kompetenz: k } : {}),
          daten: d.daten as Record<string, unknown>,
        };
      });
  const ordnerKompetenz = (d: GeleseneDatei) => d.pfadTeile.at(-1);
  return [
    ...mit('kompetenz', ladeKompetenzen(ordner), id),
    ...mit('vermittlung', ladeVermittlungen(ordner), ordnerKompetenz),
    ...mit('vorlage', ladeVorlagen(ordner), (d) => d.ordnerKompetenz),
    ...mit('anleitung', ladeAnleitungen(ordner), (d) => d.ordnerKompetenz),
    ...mit('fehlvorstellung', ladeFehlvorstellungen(ordner), () => undefined),
  ];
}

/** Dateien zu Kennungen oder Pfaden; unbekannte Angaben kommen in `unbekannt`. */
export function aufloesen(
  alle: readonly Inhaltsdatei[],
  angaben: readonly string[],
): { readonly dateien: Inhaltsdatei[]; readonly unbekannt: string[] } {
  const dateien = new Map<string, Inhaltsdatei>();
  const unbekannt: string[] = [];
  for (const a of angaben) {
    const ohneOrdner = a.replace(/^content\//, '');
    const treffer = alle.filter(
      (d) =>
        d.datei === ohneOrdner ||
        (d.art !== 'kompetenz' && d.id === a) ||
        (d.kompetenz === a && d.art !== 'fehlvorstellung'),
    );
    if (treffer.length === 0) unbekannt.push(a);
    for (const d of treffer) dateien.set(d.datei, d);
  }
  return { dateien: [...dateien.values()], unbekannt };
}
