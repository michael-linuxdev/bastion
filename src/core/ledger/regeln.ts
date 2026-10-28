/**
 * Ledger-Regeln (BASEBAU §3, DATENMODELL §4.3): Woraus entstehen Stein, Erz,
 * Bauschritte und Baupläne? Rein und deterministisch – dieselben Ereignisse
 * ergeben immer dieselben Buchungen. Gebucht wird je Sitzung (D-4), Baupläne
 * je Kompetenz und Niveau.
 *
 * Erträge sind niveau- und fachneutral (B-4): Keine Regel schaut auf Niveau,
 * Fach oder Kompetenz.
 */
import type { AufgabeEreignis } from '../learning/ereignis';
import type { KompetenzStand } from '../learning/fortschritt';
import { ernsthaft, type SitzungEreignis } from '../learning/sitzung';
import type { Tag } from '../policy/lerntag';

/** Version der Regeln; neue Regeln wirken nur auf neue Buchungen (DATENMODELL §6.2). */
export const REGEL = 1;

/** Startwerte (BASEBAU §3); der Simulator prüft sie (Schritt 2.11). */
export const ERTRAG = {
  /** Aufgaben je Lerntag mit vollem Stein … */
  steinVoll: 25,
  /** … bis hierhin mit halbem Stein (je zwei Aufgaben ein Stein), danach keiner */
  steinHalbBis: 50,
  erzJeTag: 30,
  bauschritteJeTag: 2,
} as const;

export type Ressource = 'stein' | 'erz' | 'bauplan' | 'bauschritt';

/** Inhalt einer Buchung ohne Ereignis-Hülle (die kommt in Schritt 2.3). */
export interface Buchung {
  readonly ressource: Ressource;
  readonly menge: number;
  /** Erträge aus dem Lernen; Abbuchung und Erstattung beim Bauen (BASEBAU §4.2) */
  readonly grund: 'sitzung' | 'kompetenz-gefestigt' | 'bau-beginn' | 'bau-abbruch';
  /** Sitzungs-ID, "Kompetenz@Niveau" oder Bauvorhaben-ID */
  readonly bezug: string;
  readonly tag: Tag;
  readonly aufschluesselung: Readonly<Record<string, number>>;
  readonly regel: number;
}

/** Was an einem Lerntag vor einer Sitzung schon erarbeitet war – für die Tagesgrenzen. */
export interface Tagesstand {
  /** ernsthaft bearbeitete Aufgaben (Tageskurve Stein) */
  readonly aufgaben: number;
  readonly erz: number;
  readonly bauschritte: number;
}

export const LEERER_TAG: Tagesstand = { aufgaben: 0, erz: 0, bauschritte: 0 };

/** Stein für die ersten n ernsthaften Aufgaben eines Lerntags (Tageskurve, BASEBAU §3.1). */
export function steinBis(n: number): number {
  const voll = Math.min(n, ERTRAG.steinVoll);
  const halb = Math.max(0, Math.min(n, ERTRAG.steinHalbBis) - ERTRAG.steinVoll);
  return voll + Math.floor(halb / 2);
}

/** Früheres Aufgaben-Ereignis nachschlagen (für Korrekturen). */
export type Nachschlagen = (id: string) => AufgabeEreignis | undefined;

/**
 * Erz-Anlässe einer Aufgabe (BASEBAU §3.2): eine bestandene fällige
 * Wiederholung oder die erste richtige Korrektur eines Fehlers. Beides
 * zugleich bringt trotzdem nur ein Erz. Ein geratener Fehler bringt beim
 * Korrigieren kein Erz – sonst lohnte es, erst zu raten und dann zu korrigieren.
 */
function erzAnlass(
  e: AufgabeEreignis,
  korrigiert: Set<string>,
  frueher: Nachschlagen,
): 'wiederholung' | 'korrektur' | undefined {
  if (e.ergebnis !== 'richtig') return undefined;
  if (e.korrigiert !== undefined && !korrigiert.has(e.korrigiert)) {
    korrigiert.add(e.korrigiert);
    const fehler = frueher(e.korrigiert);
    if (fehler && ernsthaft(fehler)) return 'korrektur';
  }
  // Nur echte Wiederholungen: fällig und für FSRS bewertet (die Diagnose plant nichts)
  if (e.faellig && e.bewertung !== null) return 'wiederholung';
  return undefined;
}

/**
 * Buchungen einer Sitzung (D-4): höchstens je eine für Stein, Erz und Bauschritt,
 * jeweils mit Aufschlüsselung. `korrigiert` enthält die IDs schon früher
 * aufgearbeiteter Fehler und wird fortgeschrieben.
 */
export function sitzungsBuchungen(
  sitzung: SitzungEreignis,
  aufgaben: readonly AufgabeEreignis[],
  vorher: Tagesstand,
  korrigiert: Set<string>,
  frueher: Nachschlagen,
): { readonly buchungen: Buchung[]; readonly danach: Tagesstand } {
  const eigene = aufgaben
    .filter((e) => e.sitzung === sitzung.id)
    .sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));
  const zaehlbar = eigene.filter((e) => e.ergebnis !== 'uebersprungen');
  const ernst = zaehlbar.filter(ernsthaft);
  const buchungen: Buchung[] = [];
  const buche = (ressource: Ressource, menge: number, aufschluesselung: Record<string, number>) => {
    if (menge > 0)
      buchungen.push({
        ressource,
        menge,
        grund: 'sitzung',
        bezug: sitzung.id,
        tag: sitzung.tag,
        aufschluesselung,
        regel: REGEL,
      });
  };

  // Stein: Fleiß, richtig und falsch gleich (§3.1)
  const nachher = vorher.aufgaben + ernst.length;
  const stein = steinBis(nachher) - steinBis(vorher.aufgaben);
  const voll = Math.max(0, Math.min(nachher, ERTRAG.steinVoll) - vorher.aufgaben);
  const halb = Math.max(
    0,
    Math.min(nachher, ERTRAG.steinHalbBis) - Math.max(vorher.aufgaben, ERTRAG.steinVoll),
  );
  buche('stein', stein, {
    aufgaben: zaehlbar.length,
    voll,
    halb,
    geraten: zaehlbar.length - ernst.length,
  });

  // Erz: Behalten, höchstens 30 am Tag (§3.2)
  let wiederholungen = 0;
  let korrekturen = 0;
  for (const e of eigene) {
    const anlass = erzAnlass(e, korrigiert, frueher);
    if (anlass === 'wiederholung') wiederholungen++;
    if (anlass === 'korrektur') korrekturen++;
  }
  const erzRoh = wiederholungen + korrekturen;
  const erz = Math.min(erzRoh, Math.max(0, ERTRAG.erzJeTag - vorher.erz));
  buche('erz', erz, { wiederholungen, korrekturen, gekappt: erzRoh - erz });

  // Bauschritt: eine Lerneinheit, höchstens 2 am Tag (§3.4)
  const bauschritt = sitzung.lerneinheit && vorher.bauschritte < ERTRAG.bauschritteJeTag ? 1 : 0;
  buche('bauschritt', bauschritt, { lerneinheit: 1 });

  return {
    buchungen,
    danach: {
      aufgaben: nachher,
      erz: vorher.erz + erz,
      bauschritte: vorher.bauschritte + bauschritt,
    },
  };
}

/**
 * Alle Sitzungsbuchungen aus allen Sitzungen und Aufgaben, in Zeitfolge.
 * Für den Neuaufbau (D-6) und als Maßstab für die Fortschreibung.
 */
export function alleSitzungsBuchungen(
  sitzungen: readonly SitzungEreignis[],
  aufgaben: readonly AufgabeEreignis[],
): Buchung[] {
  const jeSitzung = new Map<string, AufgabeEreignis[]>();
  const nachId = new Map(aufgaben.map((e) => [e.id, e]));
  for (const e of aufgaben) {
    const liste = jeSitzung.get(e.sitzung);
    if (liste) liste.push(e);
    else jeSitzung.set(e.sitzung, [e]);
  }
  const tage = new Map<Tag, Tagesstand>();
  const korrigiert = new Set<string>();
  const ergebnis: Buchung[] = [];
  for (const s of [...sitzungen].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1))) {
    const { buchungen, danach } = sitzungsBuchungen(
      s,
      jeSitzung.get(s.id) ?? [],
      tage.get(s.tag) ?? LEERER_TAG,
      korrigiert,
      (id) => nachId.get(id),
    );
    tage.set(s.tag, danach);
    ergebnis.push(...buchungen);
  }
  return ergebnis;
}

/**
 * Baupläne (BASEBAU §3.3): einer, sobald eine Kompetenz auf einem Niveau zum
 * ersten Mal gefestigt ist – einmal je Kompetenz und Niveau. „Gefestigt“ ist
 * dieselbe Regel wie in „Mein Stand“ (LEHRPLAN §6), damit Bastion und
 * Kompetenzansicht nie widersprechen.
 */
export function bauplanBuchungen(
  staende: readonly KompetenzStand[],
  schonGebucht: ReadonlySet<string>,
): Buchung[] {
  return staende
    .filter((s): s is KompetenzStand & { gefestigtAm: Tag } => s.gefestigtAm !== undefined)
    .map((s) => ({ bezug: `${s.kompetenz}@${s.niveau}`, tag: s.gefestigtAm }))
    .filter((b) => !schonGebucht.has(b.bezug))
    .sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : a.bezug < b.bezug ? -1 : 1))
    .map((b) => ({
      ressource: 'bauplan' as const,
      menge: 1,
      grund: 'kompetenz-gefestigt' as const,
      bezug: b.bezug,
      tag: b.tag,
      aufschluesselung: {},
      regel: REGEL,
    }));
}

/** Summe je Ressource. */
export function summe(buchungen: readonly Buchung[]): Record<Ressource, number> {
  const s: Record<Ressource, number> = { stein: 0, erz: 0, bauplan: 0, bauschritt: 0 };
  for (const b of buchungen) s[b.ressource] += b.menge;
  return s;
}
