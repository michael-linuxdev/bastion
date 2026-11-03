/**
 * Ein Satz, was ein Ausbau Neues bringt (G4, FOKUS.md: „bekommt ein zweites Stockwerk …“).
 * Die Sätze stehen in `de.json` je Thema, Rolle und Stufe, weil jedes Thema anders
 * aussieht. Eine Stufe sieht in jeder Epoche gleich aus (GRAFIK-SPRITES.md §12.11), und
 * jede Stufe ist die vorige plus genau ein neues Teil (§13.2) – der Satz nennt dieses Teil.
 * Die Epoche bleibt als Angabe, ändert den Satz aber nicht. Fehlt ein Satz, zeigt die
 * Oberfläche nur die Bilder.
 */
import de from '../texte/de.json';
import { t, type TextSchluessel } from '../texte/texte';
import type { GebaeudeTyp } from '../../core/bastion/katalog';
import type { Thema } from '../../core/policy/einstellung';

export function ausbauNeuSchluessel(
  thema: Thema,
  _epoche: number,
  typ: GebaeudeTyp,
  stufe: number,
): string {
  return `bastion.ausbau-neu.${thema}.${typ}.${stufe}`;
}

export function ausbauNeu(
  thema: Thema,
  epoche: number,
  typ: GebaeudeTyp,
  stufe: number,
): string | undefined {
  const schluessel = ausbauNeuSchluessel(thema, epoche, typ, stufe);
  return schluessel in de ? t(schluessel as TextSchluessel) : undefined;
}
