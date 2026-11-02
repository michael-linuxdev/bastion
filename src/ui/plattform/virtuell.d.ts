// Virtuelles Modul aus tools/inhalte/pakete.ts (ARCHITEKTUR T-20): Stand der
// ausgelieferten Inhaltspakete, zur Bauzeit festgelegt.
declare module 'virtual:bastion-paketstand' {
  export const paketStand: {
    /** BASTION_MINDESTSTUFE des Builds, 0 = Werkstatt */
    readonly mindeststufe: 0 | 1 | 2 | 3;
    /** Mindestens ein ausgelieferter Inhalt steht unter Review-Stufe 2 */
    readonly entwurf: boolean;
    /** Anzahl der ausgelieferten Kompetenzen */
    readonly kompetenzen: number;
  };
}
