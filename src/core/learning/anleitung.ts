/**
 * Zeichen-Anleitungen (LEHRPLAN L-10, INHALTSFORMAT §4.4): Schritt für
 * Schritt zum Nachmachen auf Papier, je Schritt ein Bild aus dem Code.
 * Nicht bewertet; die Prüfliste am Ende ist nur für die Lernenden selbst.
 */
import type { Kompetenz } from '../competence/kompetenz';
import type { Sprachobjekt } from './generator';
import { pruefeReview, type Review } from './review';

export interface Anleitung {
  readonly id: string;
  readonly kompetenz: string;
  readonly titel: Sprachobjekt;
  readonly material: Sprachobjekt;
  /** "id@version" der Bilder in src/generators/anleitungen */
  readonly bilder: string;
  readonly schritte: readonly Sprachobjekt[];
  /** Prüfliste zur Selbsteinschätzung – wird nicht gespeichert (L-10) */
  readonly pruefen: readonly Sprachobjekt[];
  readonly herkunft: 'eigen' | 'ki-entwurf' | 'oer';
  readonly version: number;
  /** Optional. Fehlt es, gilt Stufe 0 (INHALTSFORMAT §8). */
  readonly review?: Review;
}

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const istSprachobjekt = (x: unknown): x is Sprachobjekt =>
  istObjekt(x) && typeof x['de'] === 'string' && x['de'].trim() !== '';

export function pruefeAnleitung(
  daten: unknown,
  kontext: {
    readonly dateiname: string;
    readonly ordnerKompetenz: string;
    readonly kompetenzen: ReadonlyMap<string, Kompetenz>;
    /** "id@version" → Anzahl der Bilder */
    readonly bilder: ReadonlyMap<string, number>;
  },
): string[] {
  if (!istObjekt(daten)) return ['keine YAML-Zuordnung (Objekt) gefunden'];
  const f: string[] = [];
  const kompetenzId = typeof daten['kompetenz'] === 'string' ? daten['kompetenz'] : '';
  const kompetenz = kontext.kompetenzen.get(kompetenzId);
  if (!kompetenz) f.push(`kompetenz ${kompetenzId} existiert nicht`);
  else if (!kompetenz.zeichnen_erklaert) f.push(`${kompetenzId} hat kein zeichnen_erklaert: true`);
  if (kompetenzId !== kontext.ordnerKompetenz) f.push('liegt im Ordner einer anderen Kompetenz');
  const erwarteteId = `${kompetenzId}.${kontext.dateiname.toUpperCase()}`;
  if (daten['id'] !== erwarteteId)
    f.push(`id muss „${erwarteteId}“ lauten (Kompetenz + Dateiname)`);
  if (!istSprachobjekt(daten['titel'])) f.push('titel.de fehlt');
  if (!istSprachobjekt(daten['material'])) f.push('material.de fehlt');
  const schritte = daten['schritte'];
  if (!Array.isArray(schritte) || schritte.length < 2 || !schritte.every(istSprachobjekt))
    f.push('schritte: mindestens zwei, jeder mit de');
  const pruefen = daten['pruefen'];
  if (!Array.isArray(pruefen) || pruefen.length === 0 || !pruefen.every(istSprachobjekt))
    f.push('pruefen: mindestens ein Punkt mit de');
  const bilder = typeof daten['bilder'] === 'string' ? daten['bilder'] : '';
  const anzahl = kontext.bilder.get(bilder);
  if (anzahl === undefined) f.push(`bilder ${bilder} gibt es nicht`);
  else if (Array.isArray(schritte) && anzahl !== schritte.length)
    f.push(`${anzahl} Bilder, aber ${schritte.length} Schritte`);
  if (!['eigen', 'ki-entwurf', 'oer'].includes(String(daten['herkunft']))) f.push('herkunft fehlt');
  if (!Number.isInteger(daten['version'])) f.push('version fehlt');
  f.push(...pruefeReview(daten['review']));
  return f;
}
