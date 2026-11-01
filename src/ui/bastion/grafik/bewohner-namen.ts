/**
 * Feste Rufnamen für Bewohner (Design L58): kindlich wählbar, keine Freitexteingabe.
 * IDs sind stabil; Anzeige über i18n `bastion.bewohner.name.<id>`.
 */
export const BEWOHNER_NAMEN = ['pip', 'mo', 'lina', 'toni', 'nori', 'fips', 'elma', 'rio'] as const;

export type BewohnerNameId = (typeof BEWOHNER_NAMEN)[number];

export function istBewohnerName(wert: string): wert is BewohnerNameId {
  return (BEWOHNER_NAMEN as readonly string[]).includes(wert);
}
