// Filter für die öffentliche Seite (ARCHITEKTUR T-20, INHALTSFORMAT §8, FOKUS F2).
// Eine Kompetenz kommt nur ganz oder gar nicht in die Pakete: kompetenz.yaml,
// vermittlung.yaml, alle Vorlagen und Zeichen-Anleitungen in ihrem Ordner und alle
// Fehlvorstellungen, auf die diese zeigen, brauchen mindestens die Mindeststufe.
// Rein: arbeitet auf schon gelesenen Daten, keine Dateien.
import { wirksameStufe } from '../../src/core/learning/review';

export type Mindeststufe = 0 | 1 | 2 | 3;

/** Unter dieser Stufe gilt ein ausgelieferter Inhalt als Entwurf (Vermerk für Eltern). */
export const ENTWURF_UNTER = 2;

/** `BASTION_MINDESTSTUFE` lesen: leer oder fehlend = 0 (Werkstatt), sonst genau 0 bis 3. */
export function mindeststufeAus(wert: string | undefined): Mindeststufe {
  const w = (wert ?? '').trim();
  if (w === '') return 0;
  if (!/^[0-3]$/.test(w))
    throw new Error(`BASTION_MINDESTSTUFE muss 0, 1, 2 oder 3 sein, nicht „${w}“`);
  return Number(w) as Mindeststufe;
}

type Daten = Record<string, unknown>;

export interface Bestand {
  readonly kompetenzen: readonly Daten[];
  /** Vorlagen, Anleitungen und Erstvermittlungen mit der Kompetenz, zu deren Ordner sie gehören */
  readonly vorlagen: readonly { readonly daten: Daten; readonly kompetenz: string }[];
  readonly anleitungen: readonly { readonly daten: Daten; readonly kompetenz: string }[];
  readonly vermittlungen: readonly { readonly daten: Daten; readonly kompetenz: string }[];
  readonly fehlvorstellungen: readonly Daten[];
}

export interface Auswahl {
  /** IDs der Kompetenzen, die ausgeliefert werden */
  readonly kompetenzen: ReadonlySet<string>;
  /** IDs der Fehlvorstellungen, die ausgeliefert werden */
  readonly fehlvorstellungen: ReadonlySet<string>;
  /** Wird mindestens ein Inhalt unter Stufe 2 ausgeliefert? Dann zeigt die App den Vermerk „Entwurf“. */
  readonly entwurf: boolean;
}

/** Alle Fehlvorstellungen, auf die ein Inhalt zeigt: Werte von `fv` und Schlüssel von `bei`. */
export function genannteFehlvorstellungen(wert: unknown, ids = new Set<string>()): Set<string> {
  if (Array.isArray(wert)) for (const x of wert) genannteFehlvorstellungen(x, ids);
  else if (wert !== null && typeof wert === 'object') {
    for (const [k, x] of Object.entries(wert as Daten)) {
      if (k === 'fv' && typeof x === 'string') ids.add(x);
      else if (k === 'bei' && x !== null && typeof x === 'object')
        for (const schluessel of Object.keys(x as Daten))
          if (schluessel !== 'sonst') ids.add(schluessel);
      genannteFehlvorstellungen(x, ids);
    }
  }
  return ids;
}

const id = (d: Daten) => String(d['id'] ?? '');

/** Welche Kompetenzen und Fehlvorstellungen bei dieser Mindeststufe öffentlich sind. */
export function oeffentlicheAuswahl(b: Bestand, mindeststufe: Mindeststufe): Auswahl {
  const stufe = (d: Daten) => wirksameStufe(d);
  const fvStufe = new Map(b.fehlvorstellungen.map((f) => [id(f), stufe(f)]));
  const zuKompetenz = <T extends { kompetenz: string }>(liste: readonly T[], k: string) =>
    liste.filter((x) => x.kompetenz === k);

  const kompetenzen = new Set<string>();
  const genutzteFv = new Set<string>();
  let entwurf = false;
  for (const k of b.kompetenzen) {
    const kid = id(k);
    const teile = [
      k,
      ...[...zuKompetenz(b.vermittlungen, kid), ...zuKompetenz(b.vorlagen, kid)].map(
        (x) => x.daten,
      ),
      ...zuKompetenz(b.anleitungen, kid).map((x) => x.daten),
    ];
    const fvs = genannteFehlvorstellungen(teile.slice(1));
    const stufen = [...teile.map(stufe), ...[...fvs].map((f) => fvStufe.get(f) ?? 0)];
    if (stufen.some((s) => s < mindeststufe)) continue;
    kompetenzen.add(kid);
    for (const f of fvs) genutzteFv.add(f);
    if (stufen.some((s) => s < ENTWURF_UNTER)) entwurf = true;
  }
  // Fehlvorstellungen ab der Mindeststufe. Bei 0 alle (Werkstatt), sonst nur die,
  // auf die eine ausgelieferte Kompetenz zeigt: Ein Rückweg darf nicht ins Leere führen.
  const fehlvorstellungen = new Set(
    b.fehlvorstellungen
      .map(id)
      .filter((f) => (mindeststufe === 0 ? true : genutzteFv.has(f)))
      .filter((f) => (fvStufe.get(f) ?? 0) >= mindeststufe),
  );
  if ([...fehlvorstellungen].some((f) => (fvStufe.get(f) ?? 0) < ENTWURF_UNTER)) entwurf = true;
  return { kompetenzen, fehlvorstellungen, entwurf };
}
