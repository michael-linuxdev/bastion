/**
 * Gerüst-Abschnitte für ein laufendes Bauvorhaben (G4, FOKUS.md), ohne PixiJS.
 * Ein Abschnitt je Bauschritt, mindestens 2 und höchstens 6 Ebenen;
 * nach dem ersten Bauschritt steht immer mindestens eine Ebene.
 */
export function geruestEbenen(
  bedarf: number,
  fortschritt: number,
): { ebenen: number; fertig: number } {
  const ebenen = Math.max(2, Math.min(6, Math.round(bedarf)));
  const anteil = bedarf > 0 ? Math.max(0, Math.min(1, fortschritt / bedarf)) : 0;
  // Ab dem ersten Bauschritt steht mindestens eine Ebene: Fortschritt soll sichtbar sein
  const fertig = Math.floor(anteil * ebenen + 1e-9);
  return { ebenen, fertig: fortschritt > 0 && bedarf > 0 ? Math.max(1, fertig) : fertig };
}
