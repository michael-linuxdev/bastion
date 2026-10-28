/**
 * Ereignis „sitzung“ (DATENMODELL §4.2): eine Lernsitzung und ob sie als
 * Lerneinheit zählt (BASEBAU §3.4). Rein: Die Sitzung ergibt sich allein aus
 * ihren Aufgaben-Ereignissen – so entsteht dasselbe Ereignis, egal ob sie
 * regulär beendet oder beim nächsten Start nachgetragen wird (D-3).
 */
import type { Tag } from '../policy/lerntag';
import type { AufgabeEreignis } from './ereignis';

/** Schemaversion der Ereignisart `sitzung` (DATENMODELL §6.2). */
export const SITZUNG_V = 1;

/** Startwerte (BASEBAU §3.1, §3.4, §11); der Simulator prüft sie (Schritt 2.11). */
export const SITZUNG = {
  /** Lerneinheit: so viele ernsthaft bearbeitete Aufgaben … */
  mindestAufgaben: 10,
  /** … oder so viel aktive Lernzeit */
  mindestAktivMs: 8 * 60_000,
  /** Längere Abstände zwischen zwei Antworten zählen als Pause, nicht als Lernzeit */
  pauseMs: 2 * 60_000,
  /** Nach so langer Ruhe beginnt beim nächsten Antworten eine neue Sitzung */
  neueSitzungNachMs: 30 * 60_000,
  /** Falsche Antworten schneller als das gelten als geraten (Auswahl bzw. Eingabe) */
  ratenAuswahlMs: 3_000,
  ratenEingabeMs: 5_000,
} as const;

export interface SitzungEreignis {
  /** Gleich der Sitzungs-ID der Aufgaben – so entsteht beim Zusammenführen nie eine Sitzung doppelt. */
  readonly id: string;
  readonly art: 'sitzung';
  readonly v: number;
  readonly profil: string;
  /** Ende der Sitzung (letzte Antwort) */
  readonly ts: number;
  /** Lerntag der letzten Antwort – auch beim Nachtragen an einem späteren Tag */
  readonly tag: Tag;
  readonly geraet: string;
  readonly beginn: number;
  readonly ende: number;
  readonly abschluss: 'regulaer' | 'nachgetragen';
  /** ernsthaft bearbeitete Aufgaben */
  readonly aufgaben: number;
  readonly aktivMs: number;
  readonly lerneinheit: boolean;
}

/** Diagnose: „Weiß ich nicht“ ist eine ehrliche Antwort, kein Raten (Diagnose.svelte). */
const weissNicht = (e: AufgabeEreignis) =>
  e.modus === 'diagnose' &&
  e.schnappschuss?.antwort.typ === 'auswahl' &&
  e.schnappschuss.antwort.wert === -1;

/**
 * Ernsthaft bearbeitet (BASEBAU §3.1): nicht übersprungen und nicht geraten.
 * Geraten heißt: falsch und schneller als die Mindestzeit des Aufgabentyps.
 * Schnelle richtige Antworten zählen immer – wer es kann, ist schnell.
 */
export function ernsthaft(e: AufgabeEreignis): boolean {
  if (e.ergebnis === 'uebersprungen') return false;
  if (e.ergebnis === 'richtig' || weissNicht(e)) return true;
  const auswahl = e.schnappschuss?.loesung.typ === 'auswahl';
  return e.dauerMs >= (auswahl ? SITZUNG.ratenAuswahlMs : SITZUNG.ratenEingabeMs);
}

/**
 * Aktive Lernzeit: die erste Aufgabe mit ihrer Bearbeitungszeit, danach die
 * Abstände zwischen zwei Antworten – jeweils höchstens bis zur Pausengrenze.
 * So zählt Lesen von Rückmeldung und Lösungsweg mit, eine Pause nicht.
 */
export function aktivMs(aufgaben: readonly AufgabeEreignis[]): number {
  const sortiert = [...aufgaben].sort((a, b) => a.ts - b.ts);
  let summe = 0;
  sortiert.forEach((e, i) => {
    const vorher = sortiert[i - 1];
    const abschnitt = vorher ? e.ts - vorher.ts : e.dauerMs;
    summe += Math.min(Math.max(0, abschnitt), SITZUNG.pauseMs);
  });
  return summe;
}

/** Sitzungs-Ereignis aus den Aufgaben einer Sitzung (mindestens eine). */
export function sitzungEreignis(
  aufgaben: readonly AufgabeEreignis[],
  abschluss: SitzungEreignis['abschluss'],
): SitzungEreignis {
  const sortiert = [...aufgaben].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));
  const erste = sortiert[0];
  const letzte = sortiert.at(-1);
  if (!erste || !letzte) throw new RangeError('Sitzung ohne Aufgaben');
  if (sortiert.some((e) => e.sitzung !== erste.sitzung))
    throw new RangeError('Aufgaben aus verschiedenen Sitzungen');
  const anzahl = sortiert.filter(ernsthaft).length;
  const aktiv = aktivMs(sortiert);
  return {
    id: erste.sitzung,
    art: 'sitzung',
    v: SITZUNG_V,
    profil: letzte.profil,
    ts: letzte.ts,
    tag: letzte.tag,
    geraet: letzte.geraet,
    beginn: erste.ts - erste.dauerMs,
    ende: letzte.ts,
    abschluss,
    aufgaben: anzahl,
    aktivMs: aktiv,
    lerneinheit: anzahl >= SITZUNG.mindestAufgaben || aktiv >= SITZUNG.mindestAktivMs,
  };
}

/**
 * Sitzungen, die nie regulär beendet wurden (App geschlossen, Akku leer),
 * zum Nachtragen (D-3). Nur Sitzungen dieses Geräts: Fremde Sitzungen
 * kommen mit ihrem eigenen Sitzungs-Ereignis aus der Sicherung.
 */
export function offeneSitzungen(
  aufgaben: readonly AufgabeEreignis[],
  bekannt: ReadonlySet<string>,
  geraet: string,
  laufend: string,
): SitzungEreignis[] {
  const gruppen = new Map<string, AufgabeEreignis[]>();
  for (const e of aufgaben) {
    if (e.geraet !== geraet || e.sitzung === laufend || bekannt.has(e.sitzung)) continue;
    const g = gruppen.get(e.sitzung);
    if (g) g.push(e);
    else gruppen.set(e.sitzung, [e]);
  }
  return [...gruppen.values()]
    .map((g) => sitzungEreignis(g, 'nachgetragen'))
    .sort((a, b) => a.ts - b.ts);
}

/** Beginnt mit der nächsten Antwort eine neue Sitzung (lange Ruhe oder neuer Lerntag)? */
export function neueSitzungNoetig(
  letzte: Pick<AufgabeEreignis, 'ts' | 'tag'> | undefined,
  jetzt: number,
  heute: Tag,
): boolean {
  if (!letzte) return false;
  return jetzt - letzte.ts >= SITZUNG.neueSitzungNachMs || letzte.tag !== heute;
}
