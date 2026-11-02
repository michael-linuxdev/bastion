// Stand der Inhaltspakete, ohne sie zu laden (ARCHITEKTUR T-20, FOKUS F2):
// Vermerk „Entwurf“ für Eltern auf Startseite und im Elternbereich.
import { paketStand } from 'virtual:bastion-paketstand';

/** Werden Inhalte unter Review-Stufe 2 ausgeliefert? */
export const entwurfAusgeliefert: boolean = paketStand.entwurf;

/** Gibt es nach dem Filter der öffentlichen Seite überhaupt Kompetenzen? */
export const inhalteVorhanden: boolean = paketStand.kompetenzen > 0;
