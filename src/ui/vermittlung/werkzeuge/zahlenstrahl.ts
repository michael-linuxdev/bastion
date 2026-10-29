// Zahlenstrahl (VERMITTLUNG §2.3, Werkzeug zahlenstrahl@1): Abschnitt von `von`
// bis `bis`, jede Einheit in `einteilung` gleiche Teile geteilt. Reine Logik;
// die Darstellung ist Zahlenstrahl.svelte.

export interface StrahlParameter {
  readonly von?: number;
  readonly bis?: number;
  /** Teile je Einheit, z. B. 4 für Viertel */
  readonly einteilung?: number;
  /** markierter Strich als Zähler bezogen auf die Einteilung, z. B. 3 für 3/4 */
  readonly markiert?: number;
}

export interface Strich {
  /** Zähler bezogen auf die Einteilung (von · einteilung … bis · einteilung) */
  readonly zaehler: number;
  /** Lage von 0 (links) bis 1 (rechts) */
  readonly lage: number;
  /** ganze Zahl → beschriftet und länger */
  readonly ganz: boolean;
}

export const MAX_STRICHE = 48;

export function striche(p: StrahlParameter): Strich[] {
  const von = Number.isInteger(p.von) ? (p.von as number) : 0;
  const bis = Number.isInteger(p.bis) && (p.bis as number) > von ? (p.bis as number) : von + 1;
  const e =
    Number.isInteger(p.einteilung) && (p.einteilung as number) > 0 ? (p.einteilung as number) : 1;
  const anfang = von * e;
  const ende = bis * e;
  if (ende - anfang > MAX_STRICHE) return [];
  return Array.from({ length: ende - anfang + 1 }, (_, i) => ({
    zaehler: anfang + i,
    lage: i / (ende - anfang),
    ganz: (anfang + i) % e === 0,
  }));
}

/** Text für eine Stelle: ganze Zahl oder Bruch „3/4“ (ungekürzt, wie die Einteilung). */
export function stelle(zaehler: number, einteilung: number): string {
  return zaehler % einteilung === 0 ? String(zaehler / einteilung) : `${zaehler}/${einteilung}`;
}
