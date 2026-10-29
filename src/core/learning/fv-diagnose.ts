/**
 * Diagnose der Fehlvorstellungen (VERMITTLUNG §3.3, DATENMODELL §5): je
 * Fehlvorstellung ein Zustand aus festen Regeln, berechnet aus den Ereignissen
 * `aufgabe` (Fehlerbild → `fv` der Vorlage) und `vermittlung` (`fv`). Es gibt
 * kein eigenes Ereignis dafür; ändert sich der Fehlerkatalog, ergibt dieselbe
 * Rechnung den neuen Stand (D-16).
 *
 * Rein: Ereignisse und Katalog werden hereingereicht.
 */
import type { AufgabeEreignis } from './ereignis';
import type { VermittlungEreignis } from './vermittlung-ereignis';

export type FvZustand = 'aufgefallen' | 'vermutet' | 'in-arbeit' | 'aufgeloest' | 'wieder-da';

/** Startwerte (VERMITTLUNG §3.3); werden mit Lernenden geprüft. */
export const FV_REGELN = {
  /** zwei Treffer innerhalb so vieler Gelegenheiten → vermutet */
  fenster: 10,
  /** so viele richtige Kontrastaufgaben ohne neuen Treffer → aufgelöst */
  kontraste: 2,
} as const;

export interface FvStand {
  readonly fv: string;
  readonly zustand: FvZustand;
  /** alle Treffer bisher */
  readonly treffer: number;
  /** Zeit des letzten Treffers */
  readonly zuletzt: number;
  /** richtige Kontrastaufgaben seit „vermutet“ bzw. „wieder da“ */
  readonly kontrasteRichtig: number;
}

/** Was die Diagnose aus dem Inhalt braucht. */
export interface FvKatalog {
  /** Fehlvorstellung eines Fehlerbilds einer Vorlage, falls verknüpft */
  readonly fvVon: (vorlage: string, fehlerbild: string) => string | undefined;
  /** Fehlvorstellungen, die bei dieser Vorlage auftreten können (Gelegenheiten) */
  readonly moeglich: (vorlage: string) => ReadonlySet<string>;
  /** Kontrastaufgaben je Fehlvorstellung */
  readonly kontrast: (fv: string) => ReadonlySet<string>;
}

type Schritt =
  | {
      readonly ts: number;
      readonly id: string;
      readonly art: 'aufgabe';
      readonly e: AufgabeEreignis;
    }
  | { readonly ts: number; readonly id: string; readonly art: 'vermittlung'; readonly fv: string };

interface Laufend {
  zustand: FvZustand;
  treffer: number;
  zuletzt: number;
  kontrasteRichtig: number;
  /** Nummern der Gelegenheiten mit Treffer (für das Fenster) */
  trefferBei: number[];
  gelegenheiten: number;
}

function treffe(l: Laufend, ts: number): void {
  l.treffer += 1;
  l.zuletzt = ts;
  l.trefferBei.push(l.gelegenheiten);
  l.kontrasteRichtig = 0;
  if (l.zustand === 'aufgeloest') l.zustand = 'wieder-da';
  else if (l.zustand === 'aufgefallen') {
    const imFenster = l.trefferBei.filter((g) => l.gelegenheiten - g < FV_REGELN.fenster);
    if (imFenster.length >= 2) l.zustand = 'vermutet';
  } else if (l.zustand === 'in-arbeit') l.zustand = 'vermutet';
}

/**
 * Zustand je Fehlvorstellung, die schon einmal aufgefallen ist.
 * - aufgefallen: einmal erkannt
 * - vermutet: zweimal in verschiedenen Aufgaben innerhalb der letzten `fenster` Gelegenheiten
 * - in Arbeit: nach „vermutet“ ist mindestens eine weitere Gelegenheit ohne Treffer bearbeitet
 *   (die lange Erklärung kam mit der Rückmeldung)
 * - aufgelöst: `kontraste` Kontrastaufgaben richtig, ohne erneuten Treffer
 * - wieder da: nach „aufgelöst“ erneut erkannt; wird wie „vermutet“ behandelt
 */
export function fvZustaende(
  aufgaben: readonly AufgabeEreignis[],
  vermittlungen: readonly VermittlungEreignis[],
  katalog: FvKatalog,
): ReadonlyMap<string, FvStand> {
  const folge: Schritt[] = [
    ...aufgaben.map((e) => ({ ts: e.ts, id: e.id, art: 'aufgabe' as const, e })),
    ...vermittlungen.flatMap((e) =>
      e.typ === 'antwort' && e.fv
        ? [{ ts: e.ts, id: e.id, art: 'vermittlung' as const, fv: e.fv }]
        : [],
    ),
  ].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));

  const stand = new Map<string, Laufend>();
  const neu = (): Laufend => ({
    zustand: 'aufgefallen',
    treffer: 0,
    zuletzt: 0,
    kontrasteRichtig: 0,
    trefferBei: [],
    gelegenheiten: 0,
  });

  for (const s of folge) {
    if (s.art === 'vermittlung') {
      const l = stand.get(s.fv) ?? neu();
      stand.set(s.fv, l);
      l.gelegenheiten += 1;
      treffe(l, s.ts);
      continue;
    }
    const e = s.e;
    if (e.ergebnis === 'uebersprungen') continue;
    const fv = e.fehlerbild ? katalog.fvVon(e.vorlage, e.fehlerbild) : undefined;
    if (fv) {
      const l = stand.get(fv) ?? neu();
      stand.set(fv, l);
      l.gelegenheiten += 1;
      treffe(l, e.ts);
    }
    // Gelegenheit ohne Treffer: für jede schon aufgefallene Fehlvorstellung dieser Vorlage
    for (const [id, l] of stand) {
      if (id === fv) continue;
      const kontrast = katalog.kontrast(id).has(e.vorlage);
      if (!kontrast && !katalog.moeglich(e.vorlage).has(id)) continue;
      l.gelegenheiten += 1;
      if (l.zustand === 'vermutet' || l.zustand === 'wieder-da') l.zustand = 'in-arbeit';
      if (kontrast && e.ergebnis === 'richtig' && l.zustand === 'in-arbeit') {
        l.kontrasteRichtig += 1;
        if (l.kontrasteRichtig >= FV_REGELN.kontraste) l.zustand = 'aufgeloest';
      }
    }
  }

  return new Map(
    [...stand].map(([fv, l]) => [
      fv,
      {
        fv,
        zustand: l.zustand,
        treffer: l.treffer,
        zuletzt: l.zuletzt,
        kontrasteRichtig: l.kontrasteRichtig,
      },
    ]),
  );
}

/** Katalog aus Vorlagen und Fehlerkatalog bauen. */
export function fvKatalog(
  vorlagen: readonly {
    readonly id: string;
    readonly fehlerbilder: Readonly<Record<string, { readonly fv?: string }>>;
  }[],
  fehlvorstellungen: readonly { readonly id: string; readonly kontrast: readonly string[] }[],
): FvKatalog {
  const jeVorlage = new Map(
    vorlagen.map((v) => [
      v.id,
      new Map(Object.entries(v.fehlerbilder).flatMap(([fb, t]) => (t.fv ? [[fb, t.fv]] : []))),
    ]),
  );
  const moeglich = new Map([...jeVorlage].map(([id, m]) => [id, new Set(m.values())]));
  const kontrast = new Map(fehlvorstellungen.map((f) => [f.id, new Set(f.kontrast)]));
  const leer: ReadonlySet<string> = new Set();
  return {
    fvVon: (vorlage, fehlerbild) => jeVorlage.get(vorlage)?.get(fehlerbild),
    moeglich: (vorlage) => moeglich.get(vorlage) ?? leer,
    kontrast: (fv) => kontrast.get(fv) ?? leer,
  };
}
