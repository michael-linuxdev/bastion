/**
 * Aufgabenblatt für Lehrkräfte (FOKUS F6, B2, kleiner Vorläufer von U7): neue Aufgaben zu
 * ausgewählten Kompetenzen auf einem Niveau, mit Lösungen und auf Wunsch Punkten.
 *
 * Rein und deterministisch: gleiche Eingabe und gleiche Blatt-Nr. (Seed) ergeben dasselbe
 * Blatt. Zufall nur über `src/core/rng`. Keine Browser-API, kein HTML: Den Satz machen
 * `pnpm arbeitsblatt` (tools/pruefbogen/arbeitsblatt.ts) und der Elternbereich der App
 * (src/ui/eltern/Aufgabenblatt.svelte) je für sich.
 */
import type { Kompetenz, Niveau } from '../competence/kompetenz';
import { rng } from '../rng/rng';
import type { Generator, Instanz, Loesung } from './generator';
import { wirksameStufe } from './review';
import { fuelle, zahlText } from './text';
import type { GeneratorVorlage } from './vorlage';

export interface BlattEingabe {
  /** Kompetenzen in der gewünschten Reihenfolge */
  readonly kompetenzen: readonly Kompetenz[];
  readonly vorlagen: readonly GeneratorVorlage[];
  readonly generatoren: ReadonlyMap<string, Generator<unknown>>;
}

export interface BlattOptionen {
  readonly niveau: Niveau;
  readonly anzahl: number;
  /** Blatt-Nr.: mit denselben Angaben ergibt sie wieder genau dieses Blatt */
  readonly seed: number;
}

export interface BlattAufgabe {
  readonly nr: number;
  readonly vorlage: GeneratorVorlage;
  readonly seed: number;
  readonly instanz: Instanz;
  /** Punkte für die Probe-Klassenarbeit (punkteFuer) */
  readonly punkte: number;
}

/** Grenzen für Anzahl und Blatt-Nr., gleich in Werkzeug und App. */
export const BLATT_GRENZEN = { anzahlMin: 1, anzahlMax: 60, seedMax: 0xffffffff } as const;

/** Fachbegriff-Markierungen `[[…]]` entfernen: Auf Papier gibt es nichts anzutippen. */
export const ohneBegriffe = (s: string): string => s.replace(/\[\[([^\]]+)\]\]/g, '$1');

/** Ist das eine gültige Anzahl Aufgaben und eine gültige Blatt-Nr.? */
export function optionenGueltig(o: BlattOptionen): boolean {
  return (
    Number.isInteger(o.anzahl) &&
    o.anzahl >= BLATT_GRENZEN.anzahlMin &&
    o.anzahl <= BLATT_GRENZEN.anzahlMax &&
    Number.isInteger(o.seed) &&
    o.seed >= 0 &&
    o.seed <= BLATT_GRENZEN.seedMax
  );
}

/** Vorlagen, die Aufgaben auf diesem Niveau erzeugen können, in der Reihenfolge der Kompetenzen. */
export function passendeVorlagen(e: BlattEingabe, niveau: Niveau): GeneratorVorlage[] {
  return e.kompetenzen.flatMap((k) =>
    e.vorlagen.filter(
      (v) =>
        v.kompetenz === k.id &&
        v.quelle === 'generator' &&
        v.niveaus.includes(niveau) &&
        v.parameter[niveau] !== undefined &&
        e.generatoren.has(v.generator),
    ),
  );
}

/** Kompetenzen, für die es auf diesem Niveau keine Aufgaben gibt. */
export function ohneAufgaben(e: BlattEingabe, niveau: Niveau): Kompetenz[] {
  const vorlagen = passendeVorlagen(e, niveau);
  return e.kompetenzen.filter((k) => !vorlagen.some((v) => v.kompetenz === k.id));
}

/**
 * Punkte je Aufgabe für die Probe-Klassenarbeit, fest aus der Aufgabe abgeleitet:
 * Auswahl 1 Punkt; sonst so viele Punkte wie Schritte im Lösungsweg, mindestens 2,
 * höchstens 4. Ein Vorschlag; die Lehrkraft kann auf dem Papier anders gewichten.
 */
export function punkteFuer(i: Instanz): number {
  if (i.optionen) return 1;
  return Math.min(4, Math.max(2, i.loesungsweg.length));
}

/** Summe der Punkte eines Blatts */
export const punkteSumme = (aufgaben: readonly BlattAufgabe[]): number =>
  aufgaben.reduce((s, a) => s + a.punkte, 0);

/**
 * Aufgaben ziehen: die Vorlagen der Reihe nach, damit jede gleich oft vorkommt; der Seed je
 * Aufgabe kommt aus der Blatt-Nr. Doppelte Aufgaben werden neu gezogen. Danach nach Vorlage
 * geordnet, damit Gleichartiges zusammensteht.
 * @throws wenn eine Kompetenz auf dem Niveau keine Aufgaben hat (`ohneAufgaben` vorher fragen)
 */
export function ziehe(e: BlattEingabe, o: BlattOptionen): BlattAufgabe[] {
  const vorlagen = passendeVorlagen(e, o.niveau);
  const fehlend = ohneAufgaben(e, o.niveau);
  if (fehlend.length > 0)
    throw new Error(
      `Keine Aufgaben auf Niveau ${o.niveau} für: ${fehlend.map((k) => k.id).join(', ')}`,
    );
  const r = rng(o.seed);
  const gesehen = new Set<string>();
  const gezogen: Omit<BlattAufgabe, 'nr'>[] = [];
  for (let i = 0; i < o.anzahl; i++) {
    const vorlage = vorlagen[i % vorlagen.length] as GeneratorVorlage;
    const g = e.generatoren.get(vorlage.generator) as Generator<unknown>;
    let seed = 0;
    let instanz: Instanz | undefined;
    for (let versuch = 0; versuch < 20; versuch++) {
      seed = r.int(1, 0x7fffffff);
      instanz = g.erzeuge(seed, vorlage.parameter[o.niveau]);
      const schluessel = `${vorlage.id}|${JSON.stringify(fuelle(ohneBegriffe(vorlage.text.aufgabe.de), instanz.platzhalter))}|${JSON.stringify(instanz.optionen ?? instanz.elemente ?? '')}`;
      if (!gesehen.has(schluessel)) {
        gesehen.add(schluessel);
        break;
      }
    }
    const fertig = instanz as Instanz;
    gezogen.push({ vorlage, seed, instanz: fertig, punkte: punkteFuer(fertig) });
  }
  const rang = (v: GeneratorVorlage) => vorlagen.indexOf(v);
  return gezogen
    .map((a, i) => ({ a, i }))
    .sort((x, y) => rang(x.a.vorlage) - rang(y.a.vorlage) || x.i - y.i)
    .map(({ a }, i) => ({ ...a, nr: i + 1 }));
}

/** Niedrigste wirksame Review-Stufe der benutzten Vorlagen: Das Blatt ist so gut geprüft wie sein schwächster Teil. */
export function blattStufe(aufgaben: readonly BlattAufgabe[]): 0 | 1 | 2 | 3 {
  const stufen = aufgaben.map((a) =>
    wirksameStufe(a.vorlage as unknown as Record<string, unknown>),
  );
  return stufen.length === 0 ? 0 : (Math.min(...stufen) as 0 | 1 | 2 | 3);
}

/** Nächste Blatt-Nr. für „neues Blatt“: deterministisch aus der alten, 1 bis 99 999. */
export const neueBlattNummer = (alt: number): number => rng(alt + 1).int(1, 99_999);

/** Buchstabe einer Antwortmöglichkeit: A, B, C, … */
export const optionsBuchstabe = (n: number): string => String.fromCharCode(65 + n);

/** Lösung als schlichter Text (ohne HTML), z. B. „3/4“, „B (12)“, „2 < 5 < 7“. */
export function loesungAlsText(l: Loesung, optionen?: Instanz['optionen']): string {
  switch (l.typ) {
    case 'bruch':
      return `${zahlText(l.wert.zaehler)}/${zahlText(l.wert.nenner)}`;
    case 'zahl':
      return zahlText(l.wert);
    case 'auswahl': {
      const o = optionen?.[l.wert];
      return `${optionsBuchstabe(l.wert)}${o?.text ? ` (${o.text.de})` : ''}`;
    }
    case 'reihenfolge':
      return l.wert.map(zahlText).join(' < ');
    case 'punkt':
      return `(${zahlText(l.wert.x)} | ${zahlText(l.wert.y)})`;
    case 'mit-rest':
      return `${zahlText(l.wert.quotient)} Rest ${zahlText(l.wert.rest)}`;
  }
}
