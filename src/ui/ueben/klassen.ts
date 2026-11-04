// Wählbare Klassenstufen (K-15, K-17). Klasse 10 ist wählbar (K-30); 11 steht für den Jahrgang
// 11/12 der gymnasialen Oberstufe (B9b), seine Themen entstehen gerade.
export const KLASSEN = [5, 6, 7, 8, 9, 10, 11] as const;

/** Die Oberstufe heißt „Jahrgang 11/12“, alle anderen „Klasse n“. */
export const OBERSTUFE = 11;
