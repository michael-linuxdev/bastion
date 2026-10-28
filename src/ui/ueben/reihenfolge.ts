/** Reihenfolge der Bereiche in Übersicht und Diagnose: Zahlen zuerst. */
export const BEREICHE = [
  'zahl-und-operation',
  'strukturen-und-funktionaler-zusammenhang',
  'groessen-und-messen',
  'raum-und-form',
  'daten-und-zufall',
] as const;

/** Sortiert nach Bereich (stabil) – als Vorstufe für nachGraph, das bei Gleichstand die Reihenfolge behält. */
export const nachBereich = <K extends { readonly bereich: string }>(ks: readonly K[]): K[] =>
  [...ks].sort(
    (a, b) =>
      BEREICHE.indexOf(a.bereich as (typeof BEREICHE)[number]) -
      BEREICHE.indexOf(b.bereich as (typeof BEREICHE)[number]),
  );
