/**
 * Wo schlägt die App ein neues Gebäude vor? (FOKUS G5, PV 02.11.2026)
 *
 * Nicht mehr das erste freie Feld oben links, sondern das freie Feld, das dem
 * Bergfried (Rolle `kern`) am nächsten liegt – so wächst die Bastion um ihre Mitte.
 * Plätze dahinter (kleinere Reihe) zählen doppelt so weit, weil der hohe Bergfried
 * sie in der Schrägansicht verdecken würde.
 * Ohne Bergfried zählt die Mitte des Bauplatzes. Gleich weit: das Feld, das
 * `freierPlatz` zuerst fände (Reihe für Reihe von oben links), damit das Ergebnis
 * eindeutig ist.
 *
 * Nur eine Vorschlagsregel für die Oberfläche: Die Bau-Regel im Kern bleibt
 * unverändert (B-29, Entscheidung PV), Versetzen geht danach jederzeit kostenlos.
 */
import { platzHindernisse, type Bastion } from '../../core/bastion/bauen';
import { BAUPLATZ, KATALOG, type GebaeudeTyp, type Position } from '../../core/bastion/katalog';

export function vorgeschlagenerPlatz(
  b: Bastion,
  typ: GebaeudeTyp,
  platz: { readonly breite: number; readonly tiefe: number } = BAUPLATZ,
): Position | undefined {
  const kern = b.bauwerke.find((x) => x.typ === 'kern');
  const mitte = kern
    ? {
        x: kern.pos.x + KATALOG.kern.groesse[0] / 2,
        y: kern.pos.y + KATALOG.kern.groesse[1] / 2,
      }
    : { x: platz.breite / 2, y: platz.tiefe / 2 };
  const [w, t] = KATALOG[typ].groesse;
  let bester: Position | undefined;
  let besterAbstand = Infinity;
  for (let y = 0; y < platz.tiefe; y++)
    for (let x = 0; x < platz.breite; x++) {
      if (platzHindernisse(b, typ, { x, y }, undefined, platz).length > 0) continue;
      const dx = x + w / 2 - mitte.x;
      const dy = y + t / 2 - mitte.y;
      // Hinter dem Bergfried (kleinere Reihe) verdeckt er das neue Gebäude in der
      // Schrägansicht – solche Plätze zählen doppelt so weit weg.
      const abstand = dx * dx + (dy < 0 ? 4 : 1) * dy * dy;
      if (abstand < besterAbstand) {
        besterAbstand = abstand;
        bester = { x, y };
      }
    }
  return bester;
}
