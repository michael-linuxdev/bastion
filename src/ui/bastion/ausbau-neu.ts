/**
 * Ein Satz, was ein Ausbau Neues bringt (G4, FOKUS.md: „bekommt ein zweites Stockwerk …“).
 * Die Sätze stehen in `de.json` je Thema, Epoche, Rolle und Stufe, weil jedes Thema
 * anders aussieht. Fehlt ein Satz (Themen und Epochen, die noch nicht erneuert sind),
 * zeigt die Oberfläche nur die Bilder.
 */
import de from '../texte/de.json';
import { t, type TextSchluessel } from '../texte/texte';
import type { GebaeudeTyp } from '../../core/bastion/katalog';
import type { Thema } from '../../core/policy/einstellung';

export function ausbauNeuSchluessel(
  thema: Thema,
  epoche: number,
  typ: GebaeudeTyp,
  stufe: number,
): string {
  return `bastion.ausbau-neu.${thema}.e${epoche}.${typ}.${stufe}`;
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
