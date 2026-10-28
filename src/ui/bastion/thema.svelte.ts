// Thema der Bastion (BASEBAU B-17): Welche Wörter gerade gelten. Die Mechanik
// ist für alle Themen gleich; hier entstehen nur die Namen. Texte mit
// Platzhaltern wie „{ganzes} hat gewartet.“ füllt `tt` mit den Wörtern des Themas.
import type { Ressource } from '../../core/ledger/regeln';
import type { GebaeudeTyp } from '../../core/bastion/katalog';
import type { Thema } from '../../core/policy/einstellung';
import { t, type TextSchluessel } from '../texte/texte';

/** Das gewählte Thema; die App setzt es beim Start und bei jedem Wechsel. */
export const aktiv = $state<{ thema: Thema }>({ thema: 'bastion' });

/** Ein Wort des aktiven Themas, z. B. `wort('ganzes')` → „Dein Garten“. */
export const wort = (name: string, thema: Thema = aktiv.thema): string =>
  t(`thema.${thema}.${name}` as TextSchluessel);

/** Text mit Platzhaltern in den Wörtern des Themas. */
export const tt = (schluessel: TextSchluessel, thema: Thema = aktiv.thema): string =>
  t(schluessel).replace(/\{([a-z.-]+)\}/g, (_, name: string) => wort(name, thema));

export const gebaeudeName = (typ: GebaeudeTyp) => wort(`gebaeude.${typ}`);
export const gebaeudeWozu = (typ: GebaeudeTyp) => wort(`gebaeude.${typ}.wozu`);

/** „12 Samen“, „1 Gartenplan“, „3 Tauchgänge“ */
export const menge = (r: Ressource, n: number) =>
  `${n} ${wort(`${r}-${n === 1 ? 'einer' : 'viele'}`)}`;

/** Name einer Ressource ohne Zahl (Mehrzahl), z. B. für „Dafür reicht es noch nicht: …“ */
export const ressourceName = (r: Ressource) => wort(`${r}-viele`);
