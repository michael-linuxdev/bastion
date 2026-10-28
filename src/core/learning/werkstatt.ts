/**
 * Fehlerwerkstatt (KONZEPT §3.2, R6): offene Fehler finden und nach Ursache
 * gruppieren – je Vorlage, Niveau und erkanntem Fehlerbild. Ein Fehler gilt
 * als aufgearbeitet, sobald ein späteres Ereignis ihn richtig korrigiert.
 * Rein: arbeitet nur auf den gespeicherten Ereignissen.
 */
import type { Niveau } from '../competence/kompetenz';
import { bruch } from './bruch';
import type { AufgabeEreignis } from './ereignis';
import type { Loesung, Option } from './generator';
import { zahlText } from './text';

/**
 * Falsch beantwortete Aufgaben mit Schnappschuss, die noch nicht richtig korrigiert
 * wurden. Diagnose-Aufgaben gehören nicht dazu: Die Diagnose soll ohne Druck
 * feststellen, was sitzt – „Weiß ich nicht“ ist dort kein Fehler (LEHRPLAN §7).
 */
export function offeneFehler(ereignisse: readonly AufgabeEreignis[]): AufgabeEreignis[] {
  const erledigt = new Set(
    ereignisse.filter((e) => e.korrigiert && e.ergebnis === 'richtig').map((e) => e.korrigiert),
  );
  return ereignisse.filter(
    (e) =>
      e.ergebnis === 'falsch' &&
      e.modus !== 'diagnose' &&
      e.schnappschuss &&
      !e.korrigiert &&
      !erledigt.has(e.id),
  );
}

export interface Fehlergruppe {
  readonly kompetenz: string;
  /** Vorlage des ersten Fehlers (bei Fehlern ohne Muster können es mehrere sein) */
  readonly vorlage: string;
  readonly niveau: Niveau;
  /** Erkanntes Fehlerbild; undefined = Fehler ohne bekanntes Muster */
  readonly fehlerbild?: string;
  /** Älteste zuerst */
  readonly fehler: readonly AufgabeEreignis[];
}

/**
 * Gruppiert nach Ursache: Fehler mit erkanntem Fehlerbild je Vorlage, Niveau und
 * Fehlerbild; Fehler ohne Muster je Kompetenz und Niveau. Häufigste zuerst,
 * bei Gleichstand die älteste.
 */
export function gruppiere(fehler: readonly AufgabeEreignis[]): Fehlergruppe[] {
  const gruppen = new Map<string, AufgabeEreignis[]>();
  for (const e of [...fehler].sort((a, b) => a.ts - b.ts)) {
    const k = e.fehlerbild
      ? `${e.vorlage}|${e.niveau}|${e.fehlerbild}`
      : `${e.kompetenz}|${e.niveau}|`;
    gruppen.set(k, [...(gruppen.get(k) ?? []), e]);
  }
  return [...gruppen.values()]
    .map((liste): Fehlergruppe => {
      const erster = liste[0] as AufgabeEreignis;
      return {
        kompetenz: erster.kompetenz,
        vorlage: erster.vorlage,
        niveau: erster.niveau,
        ...(erster.fehlerbild ? { fehlerbild: erster.fehlerbild } : {}),
        fehler: liste,
      };
    })
    .sort(
      (a, b) =>
        b.fehler.length - a.fehler.length || (a.fehler[0]?.ts ?? 0) - (b.fehler[0]?.ts ?? 0),
    );
}

const uhr = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

/** Eine gegebene Antwort lesbar machen, z. B. „Deine Antwort damals: 3/5“. */
export function antwortText(
  antwort: Loesung,
  optionen: readonly Option[] = [],
  uhrzeit = false,
): string {
  switch (antwort.typ) {
    case 'zahl':
      return uhrzeit ? uhr(antwort.wert) : zahlText(antwort.wert);
    case 'bruch': {
      const b = bruch(antwort.wert.zaehler, antwort.wert.nenner);
      return `${zahlText(b.zaehler)}/${zahlText(b.nenner)}`;
    }
    case 'auswahl':
      return optionen[antwort.wert]?.text?.de ?? `${antwort.wert + 1}`;
    case 'reihenfolge':
      return antwort.wert.map(zahlText).join(', ');
    case 'punkt':
      return `(${zahlText(antwort.wert.x)} | ${zahlText(antwort.wert.y)})`;
    case 'mit-rest':
      return `${zahlText(antwort.wert.quotient)} Rest ${zahlText(antwort.wert.rest)}`;
  }
}
