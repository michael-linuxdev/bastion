/**
 * Projektionen `kompetenzen` und `karten` (DATENMODELL §5) mit dem Status
 * nach LEHRPLAN §6: neu → in Arbeit → gekonnt → gefestigt, dazu „auffrischen“.
 *
 * Rein: verarbeite() für jedes neue Ereignis, neuAufbauen() aus allen.
 * Beides muss dasselbe ergeben (Pflicht-Test D-6).
 */
import type { Niveau } from '../competence/kompetenz';
import type { Tag } from '../policy/lerntag';
import { erinnerung, fortschreibenKarte, kartenSchluessel, type Karte } from '../srs/karten';
import type { AufgabeEreignis } from './ereignis';

/** Fenster und Schwellen für „gekonnt“ (LEHRPLAN §6, Startwerte L-O3). */
export const GEKONNT = { fenster: 6, richtig: 5, vorlagen: 2 } as const;
/** Schwellen für „gefestigt“ und „auffrischen“ (LEHRPLAN §6, Startwerte L-O3). */
export const GEFESTIGT = { bestanden: 2, tage: 7, erinnerung: 0.9, auffrischenUnter: 0.8 } as const;

const TAG_MS = 86_400_000;

export type Status = 'in-arbeit' | 'gekonnt' | 'gefestigt';

export interface KompetenzStand {
  readonly profil: string;
  readonly kompetenz: string;
  readonly niveau: Niveau;
  readonly status: Status;
  /** Erstes Erreichen von „gekonnt“: Lerntag und Zeitpunkt. */
  readonly gekonntAm?: Tag;
  readonly gekonntTs?: number;
  /** Erstes Erreichen von „gefestigt“ – hier entsteht später der Bauplan (B-4). */
  readonly gefestigtAm?: Tag;
  readonly aufgaben: number;
  /** Zählung der letzten Diagnose (je Sitzung neu) – LEHRPLAN §7 */
  readonly diagnose?: {
    readonly sitzung: string;
    readonly richtig: number;
    readonly falsch: number;
    readonly vorlagen: readonly string[];
  };
  /** Die letzten Aufgaben (höchstens GEKONNT.fenster), älteste zuerst. */
  readonly letzte: readonly { readonly vorlage: string; readonly ohneHilfeRichtig: boolean }[];
}

/** Schlüssel wie in der Datenbank: Profil × Kompetenz × Niveau. */
export const standSchluessel = (e: Pick<KompetenzStand, 'profil' | 'kompetenz' | 'niveau'>) =>
  `${e.profil}|${e.kompetenz}|${e.niveau}`;

function istGekonnt(letzte: KompetenzStand['letzte']): boolean {
  const gut = letzte.filter((x) => x.ohneHilfeRichtig);
  return (
    gut.length >= GEKONNT.richtig && new Set(gut.map((x) => x.vorlage)).size >= GEKONNT.vorlagen
  );
}

/**
 * „Gefestigt“: jede geübte Vorlage (mindestens 2) mindestens zweimal als fällige
 * Wiederholung bestanden, mindestens 7 Tage nach „gekonnt“, und die
 * Erinnerungswahrscheinlichkeit aller Vorlagen liegt bei mindestens 90 %.
 */
function istGefestigt(karten: readonly Karte[], jetzt: number, gekonntTs: number): boolean {
  return (
    karten.length >= GEKONNT.vorlagen &&
    karten.every((k) => k.bestandenFaellig >= GEFESTIGT.bestanden) &&
    jetzt - gekonntTs >= GEFESTIGT.tage * TAG_MS &&
    karten.every((k) => erinnerung(k, jetzt) >= GEFESTIGT.erinnerung)
  );
}

/**
 * Schreibt den Stand fort. `karten` sind die Karten dieser Kompetenz und dieses
 * Niveaus nach dem Ereignis. undefined = „neu“; übersprungene Aufgaben zählen nicht.
 */
export function fortschreiben(
  stand: KompetenzStand | undefined,
  e: AufgabeEreignis,
  karten: readonly Karte[],
): KompetenzStand | undefined {
  if (e.ergebnis === 'uebersprungen') return stand;
  const letzte = [
    ...(stand?.letzte ?? []),
    { vorlage: e.vorlage, ohneHilfeRichtig: e.ergebnis === 'richtig' && e.hilfen === 0 },
  ].slice(-GEKONNT.fenster);
  // Diagnose: zwei richtige Antworten aus zwei Vorlagen, höchstens eine falsche
  // (dieselbe Regel wie im Diagnosegang) – ergibt „gekonnt“, nie mehr (LEHRPLAN §7).
  const vorher = stand?.diagnose?.sitzung === e.sitzung ? stand.diagnose : undefined;
  const diagnose =
    e.modus === 'diagnose'
      ? {
          sitzung: e.sitzung,
          richtig: (vorher?.richtig ?? 0) + (e.ergebnis === 'richtig' ? 1 : 0),
          falsch: (vorher?.falsch ?? 0) + (e.ergebnis === 'richtig' ? 0 : 1),
          vorlagen: [
            ...new Set([
              ...(vorher?.vorlagen ?? []),
              ...(e.ergebnis === 'richtig' ? [e.vorlage] : []),
            ]),
          ],
        }
      : stand?.diagnose;
  const diagnoseBestanden =
    e.modus === 'diagnose' &&
    diagnose !== undefined &&
    diagnose.richtig >= 2 &&
    diagnose.falsch <= 1 &&
    diagnose.vorlagen.length >= GEKONNT.vorlagen;
  // Einmal gekonnt bzw. gefestigt bleibt es; Nachlassen zeigt „auffrischen“ (anzeigeStatus).
  const neuGekonnt = !stand?.gekonntAm && (istGekonnt(letzte) || diagnoseBestanden);
  const gekonntAm = stand?.gekonntAm ?? (neuGekonnt ? e.tag : undefined);
  const gekonntTs = stand?.gekonntTs ?? (neuGekonnt ? e.ts : undefined);
  const gefestigtAm =
    stand?.gefestigtAm ??
    (gekonntTs !== undefined && istGefestigt(karten, e.ts, gekonntTs) ? e.tag : undefined);
  return {
    profil: e.profil,
    kompetenz: e.kompetenz,
    niveau: e.niveau,
    status: gefestigtAm ? 'gefestigt' : gekonntAm ? 'gekonnt' : 'in-arbeit',
    ...(gekonntAm ? { gekonntAm } : {}),
    ...(gekonntTs !== undefined ? { gekonntTs } : {}),
    ...(gefestigtAm ? { gefestigtAm } : {}),
    aufgaben: (stand?.aufgaben ?? 0) + 1,
    ...(diagnose ? { diagnose } : {}),
    letzte,
  };
}

export type AnzeigeStatus = 'neu' | Status | 'auffrischen';

/** Status zur Anzeige: „auffrischen“, wenn eine Vorlage einer gefestigten Kompetenz unter 80 % fällt. */
export function anzeigeStatus(
  stand: KompetenzStand | undefined,
  karten: readonly Karte[],
  jetzt: number,
): AnzeigeStatus {
  if (!stand) return 'neu';
  if (
    stand.status === 'gefestigt' &&
    karten.some((k) => erinnerung(k, jetzt) < GEFESTIGT.auffrischenUnter)
  )
    return 'auffrischen';
  return stand.status;
}

export interface Projektion {
  readonly staende: Map<string, KompetenzStand>;
  readonly karten: Map<string, Karte>;
}

/** Karten einer Kompetenz auf einem Niveau. */
export const kartenVon = (
  karten: Iterable<Karte>,
  profil: string,
  kompetenz: string,
  niveau: Niveau,
) =>
  [...karten].filter(
    (k) => k.profil === profil && k.kompetenz === kompetenz && k.niveau === niveau,
  );

/** Ein Ereignis in beide Projektionen einarbeiten (verändert `p`). */
export function verarbeite(p: Projektion, e: AufgabeEreignis): void {
  const ks = kartenSchluessel(e);
  const karte = fortschreibenKarte(p.karten.get(ks), e);
  if (karte) p.karten.set(ks, karte);
  const ss = standSchluessel(e);
  const stand = fortschreiben(
    p.staende.get(ss),
    e,
    kartenVon(p.karten.values(), e.profil, e.kompetenz, e.niveau),
  );
  if (stand) p.staende.set(ss, stand);
}

/** Alle Projektionen aus den Ereignissen neu berechnen (nach Zeit und ID sortiert). */
export function neuAufbauen(ereignisse: readonly AufgabeEreignis[]): Projektion {
  const p: Projektion = { staende: new Map(), karten: new Map() };
  const sortiert = [...ereignisse].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));
  for (const e of sortiert) verarbeite(p, e);
  return p;
}
