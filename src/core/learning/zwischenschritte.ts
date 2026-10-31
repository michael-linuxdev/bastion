/**
 * Zwischenschritte (VERMITTLUNG §3.6, INHALTSFORMAT §17, K-29): Nach einem
 * falschen Ergebnis gibt die lernende Person ihren Weg in vorgegebenen
 * Schrittfeldern ein. Jeder Schritt wird gegen die richtige Eingabe, weitere
 * richtige Wege und die bekannten Fehler dieses Schritts geprüft.
 *
 * Rein: Generator, Seed und Eingaben werden hereingereicht.
 */
import type { Generator, Loesung, SchrittAufgabe, Sprachobjekt } from './generator';
import { gleicheLoesung } from './loesung';
import { platzhalterIn } from './text';

/** Zwei Versuche je Schritt, dann zeigt Bastion den Schritt (K-29). */
export const VERSUCHE = 2;

/** Eingabetypen für Schritte; mehr kommen mit den Rechenzeilen. */
export const SCHRITT_EINGABEN = ['zahl-eingabe', 'bruch-eingabe'] as const;
export type SchrittEingabe = (typeof SCHRITT_EINGABEN)[number];

/** Schritt in der Vorlage */
export interface VorlagenSchritt {
  readonly id: string;
  readonly frage: Sprachobjekt;
  readonly typ: SchrittEingabe;
  readonly fehlerbilder: Readonly<Record<string, Sprachobjekt & { readonly fv?: string }>>;
}

export type SchrittErgebnis =
  { readonly richtig: true } | { readonly richtig: false; readonly fehlerbild?: string };

/** Eingabe eines Schritts prüfen. Brüche zählen so, wie sie geschrieben sind. */
export function pruefeSchritt(s: SchrittAufgabe, eingabe: Loesung): SchrittErgebnis {
  if (gleicheLoesung(s.loesung, eingabe) || s.auchRichtig?.(eingabe) === true)
    return { richtig: true };
  const f = s.fehlerbilder.find((x) => gleicheLoesung(x.antwort, eingabe));
  return f ? { richtig: false, fehlerbild: f.id } : { richtig: false };
}

/**
 * Den Weg mit den gezeigten Lösungen gehen (für Tests und Anzeige): alle Schritte des
 * Generators oder nur die genannten, wie eine Vorlage sie auswählt.
 */
export function musterweg<P>(
  g: Generator<P>,
  seed: number,
  parameter: P,
  ids?: readonly string[],
): { readonly id: string; readonly aufgabe: SchrittAufgabe }[] {
  if (!g.schritt || !g.schritte) return [];
  const bisher: Record<string, Loesung> = {};
  return (ids ?? g.schritte.map((s) => s.id)).map((id) => {
    const aufgabe = (g.schritt as NonNullable<typeof g.schritt>)(seed, parameter, id, bisher);
    bisher[id] = aufgabe.loesung;
    return { id, aufgabe };
  });
}

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const istSprachobjekt = (x: unknown): x is Sprachobjekt =>
  istObjekt(x) && typeof x['de'] === 'string' && x['de'].trim() !== '';

/**
 * `schritte` einer Vorlage prüfen (INHALTSFORMAT §17): eine Auswahl der Schritte des
 * Generators in seiner Reihenfolge, immer mit dem letzten (dessen Lösung das Ergebnis ist).
 * Fragen nutzen nur bekannte Platzhalter, jedes
 * Fehlerbild ist angemeldet und hat `fv` (F6).
 */
export function pruefeSchritte(
  roh: unknown,
  generator:
    | {
        readonly platzhalter: readonly string[];
        readonly schritte?:
          | readonly {
              readonly id: string;
              readonly fehlerbildIds: readonly string[];
              readonly platzhalter?: readonly string[] | undefined;
            }[]
          | undefined;
      }
    | undefined,
): string[] {
  if (roh === undefined) return [];
  const f: string[] = [];
  if (!Array.isArray(roh) || roh.length === 0) return ['schritte: mindestens ein Schritt'];
  const gs = generator?.schritte;
  if (generator && !gs) f.push('schritte: Der Generator kennt keine Zwischenschritte');
  const ids = roh.map((s: unknown) => (istObjekt(s) ? String(s['id']) : ''));
  if (gs) {
    const reihe = gs.map((s) => s.id);
    const stellen = ids.map((id) => reihe.indexOf(id));
    const geordnet = stellen.every((st, i) => st >= 0 && (i === 0 || st > (stellen[i - 1] ?? -1)));
    if (!geordnet || stellen.at(-1) !== reihe.length - 1)
      f.push(
        `schritte: eine Auswahl aus ${reihe.join(', ')} in dieser Reihenfolge, mit dem letzten Schritt`,
      );
  }
  const bekannt = new Set(generator?.platzhalter ?? []);
  roh.forEach((s: unknown, i) => {
    const wo = `schritte[${i}]`;
    if (!istObjekt(s)) return void f.push(`${wo}: keine Zuordnung`);
    const g = gs?.find((x) => x.id === ids[i]);
    const eigene = new Set(g?.platzhalter ?? []);
    if (!istSprachobjekt(s['frage'])) f.push(`${wo}: frage.de fehlt`);
    else
      for (const p of platzhalterIn(s['frage'].de))
        if (!bekannt.has(p) && !eigene.has(p)) f.push(`${wo}: Platzhalter {${p}} ist unbekannt`);
    if (!SCHRITT_EINGABEN.includes(s['typ'] as SchrittEingabe))
      f.push(`${wo}: typ muss ${SCHRITT_EINGABEN.join(' oder ')} sein`);
    const fb = s['fehlerbilder'];
    const erwartet = g?.fehlerbildIds ?? [];
    if (!istObjekt(fb)) f.push(`${wo}: fehlerbilder fehlt`);
    else {
      for (const [id, t] of Object.entries(fb)) {
        if (!istSprachobjekt(t)) f.push(`${wo}: fehlerbilder.${id} ist kein Sprachobjekt`);
        else if (typeof (t as { fv?: unknown }).fv !== 'string')
          f.push(`${wo}: fehlerbilder.${id} ohne fv (F6)`);
        if (gs && !erwartet.includes(id))
          f.push(`${wo}: Fehlerbild „${id}“ kennt der Generator nicht`);
      }
      for (const id of erwartet) if (!(id in fb)) f.push(`${wo}: Rückmeldung für „${id}“ fehlt`);
    }
    // Spätere Fragen dürfen die Eingaben früherer Schritte nennen
    bekannt.add(String(s['id']));
  });
  return f;
}
