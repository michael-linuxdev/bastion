/**
 * Elternbericht (DATENMODELL §5.2, D-14): Wochenzusammenfassung für die
 * einfache Ansicht, einzelne Aufgaben für die ausführliche. Rein.
 */
import type { Kompetenz } from '../competence/kompetenz';
import type { Tag } from '../policy/lerntag';
import type { AufgabeEreignis } from './ereignis';
import type { KompetenzStand } from './fortschritt';

export interface Woche {
  /** ISO-Woche, z. B. "2026-W44" */
  readonly woche: string;
  /** Montag der Woche, z. B. "2026-10-26" */
  readonly montag: Tag;
  readonly aufgaben: number;
  readonly richtig: number;
  /** An wie vielen Lerntagen geübt wurde */
  readonly lerntage: number;
}

/** ISO-Woche und Montag zu einem Lerntag „JJJJ-MM-TT“. */
export function isoWoche(tag: Tag): { woche: string; montag: Tag } {
  const [j, m, t] = tag.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(j, m - 1, t));
  const wochentag = (d.getUTCDay() + 6) % 7; // Montag = 0
  const montag = new Date(d.getTime() - wochentag * 86_400_000);
  const donnerstag = new Date(montag.getTime() + 3 * 86_400_000);
  // ISO 8601: Die Woche gehört zu dem Jahr, in dem ihr Donnerstag liegt.
  const jahr = donnerstag.getUTCFullYear();
  const tagImJahr = (donnerstag.getTime() - Date.UTC(jahr, 0, 1)) / 86_400_000;
  const nr = Math.floor(tagImJahr / 7) + 1;
  return {
    woche: `${jahr}-W${String(nr).padStart(2, '0')}`,
    montag: montag.toISOString().slice(0, 10),
  };
}

/** Wochen mit Aufgaben, neueste zuerst. */
export function wochen(ereignisse: readonly AufgabeEreignis[]): Woche[] {
  const nachWoche = new Map<
    string,
    { montag: Tag; aufgaben: number; richtig: number; tage: Set<Tag> }
  >();
  for (const e of ereignisse) {
    if (e.ergebnis === 'uebersprungen') continue;
    const { woche, montag } = isoWoche(e.tag);
    const w = nachWoche.get(woche) ?? { montag, aufgaben: 0, richtig: 0, tage: new Set<Tag>() };
    w.aufgaben += 1;
    if (e.ergebnis === 'richtig') w.richtig += 1;
    w.tage.add(e.tag);
    nachWoche.set(woche, w);
  }
  return [...nachWoche.entries()]
    .map(([woche, w]) => ({
      woche,
      montag: w.montag,
      aufgaben: w.aufgaben,
      richtig: w.richtig,
      lerntage: w.tage.size,
    }))
    .sort((a, b) => b.woche.localeCompare(a.woche));
}

/** Einzelne Aufgaben für die ausführliche Ansicht, neueste zuerst. */
export const einzelne = (ereignisse: readonly AufgabeEreignis[]): AufgabeEreignis[] =>
  [...ereignisse].sort((a, b) => b.ts - a.ts);

/** Ein Lernfeld im Bericht für die Lehrkraft (LEHRPLAN L-13). */
export interface LehrkraftFeld {
  readonly feld: string;
  /** Kompetenzen bis zur gewählten Klasse */
  readonly bisKlasse: number;
  readonly gekonnt: number;
  readonly gefestigt: number;
  /** aus früheren Klassen, noch nicht gekonnt */
  readonly offen: readonly string[];
  /** aus späteren Klassen, schon gekonnt (deutlich über der Klasse) */
  readonly voraus: readonly string[];
}

/**
 * Bericht für die Lehrkraft (L-13): je Lernfeld, was bis zur gewählten Klasse
 * gekonnt und gefestigt ist, was aus früheren Klassen noch offen ist und was
 * schon aus späteren Klassen sitzt. Nur auf dem Gerät; gezeigt oder als Datei.
 */
export function lehrkraftBericht(
  kompetenzen: readonly Kompetenz[],
  staende: readonly KompetenzStand[],
  klasse: number,
): LehrkraftFeld[] {
  const gekonnt = new Set(staende.filter((s) => s.gekonntAm !== undefined).map((s) => s.kompetenz));
  const gefestigt = new Set(
    staende.filter((s) => s.gefestigtAm !== undefined).map((s) => s.kompetenz),
  );
  const felder = new Map<
    string,
    { bis: number; gk: number; gf: number; offen: string[]; voraus: string[] }
  >();
  for (const k of kompetenzen) {
    const kl = Math.min(...k.klassenstufe_typisch);
    const f = felder.get(k.feld) ?? { bis: 0, gk: 0, gf: 0, offen: [], voraus: [] };
    if (kl <= klasse) {
      f.bis++;
      if (gekonnt.has(k.id)) f.gk++;
      if (gefestigt.has(k.id)) f.gf++;
      if (kl < klasse && !gekonnt.has(k.id)) f.offen.push(k.id);
    } else if (gekonnt.has(k.id)) f.voraus.push(k.id);
    felder.set(k.feld, f);
  }
  return [...felder.entries()]
    .filter(([, f]) => f.bis > 0 || f.voraus.length > 0)
    .map(([feld, f]) => ({
      feld,
      bisKlasse: f.bis,
      gekonnt: f.gk,
      gefestigt: f.gf,
      offen: f.offen,
      voraus: f.voraus,
    }));
}
