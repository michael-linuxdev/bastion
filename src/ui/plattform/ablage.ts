// Verbindet die App mit der Ablage im Browser: echte Uhr, echter Zufall,
// Lernsitzungen (DATENMODELL §4.2): Eine Sitzung endet mit „Fertig für heute“,
// nach 30 Minuten Ruhe oder mit dem Lerntag; nie beendete trägt der nächste Start nach. Ist IndexedDB nicht nutzbar (z. B. privater
// Modus mancher Browser), funktioniert Üben weiter – nur ohne Speichern.
import { aufgabeEreignis, type AufgabeAngaben } from '../../core/learning/ereignis';
import type { KompetenzStand } from '../../core/learning/fortschritt';
import { neueSitzungNoetig, sitzungEreignis } from '../../core/learning/sitzung';
import type { BuchungEreignis, Konto } from '../../core/ledger/buchung';
import { ulid } from '../../core/rng/ulid';
import {
  aufDiesemGeraet,
  einstellungEreignis,
  JE_GERAET,
  PIN_NACH_SICHERUNG,
  vonAnderemGeraet,
} from '../../core/policy/einstellung';
import { lerntag } from '../../core/policy/lerntag';
import {
  CODE_WOERTER,
  dateiname,
  ERINNERUNG_SCHLUESSEL,
  erinnerungTage,
  sicherungFaellig,
} from '../../core/sicherung/sicherung';
import { oeffnen, verschluesseln, type OeffnenFehler } from './sicherung';
import { normalisiereCode, wortcode } from '../../core/rng/wortcode';
import { hashe, pruefe } from './pin';
import type { AufgabeEreignis } from '../../core/learning/ereignis';
import type { ZufallsQuelle } from '../../core/rng/zufallsquelle';
import { istFaellig, type Karte } from '../../core/srs/karten';
import { gruppiere, offeneFehler, type Fehlergruppe } from '../../core/learning/werkstatt';
import {
  aufgaben,
  buchen,
  buchungen,
  einrichten,
  konto,
  einstellung,
  einstellungsEreignisse,
  ersteAufgabe,
  exportieren,
  importieren,
  letzteSicherung,
  sicherungVermerken,
  sitzungenNachtragen,
  speichereEinstellung,
  speichereSitzung,
  karte,
  karten,
  kompetenzStaende,
  speichereAufgabe,
  type Installation,
} from '../../storage/ablage';
import { BastionDatenbank } from '../../storage/datenbank';

const zufall: ZufallsQuelle = {
  fuelle: (bytes) => {
    const neu = crypto.getRandomValues(new Uint8Array(bytes.length));
    bytes.set(neu);
  },
};
const db = new BastionDatenbank();
let sitzung = ulid(Date.now(), zufall);
/** Antworten der laufenden Sitzung – daraus entsteht ihr Sitzungs-Ereignis */
let laufende: AufgabeEreignis[] = [];
let installation: Promise<Installation | undefined> | undefined;

function bereit(): Promise<Installation | undefined> {
  installation ??= einrichten(db, Date.now(), zufall)
    .then(async (inst) => {
      await sitzungenNachtragen(db, inst, sitzung).catch(() => 0);
      // Das Ledger bucht immer, auch bei abgeschaltetem Basebau (B-10)
      await buchen(db, inst, Date.now()).catch(() => []);
      return inst;
    })
    .catch(() => undefined);
  return installation;
}

const versatz = (ts: number) => -new Date(ts).getTimezoneOffset();

/** Laufende Sitzung abschließen und eine neue beginnen (nur wenn es Antworten gab). */
async function sitzungAbschliessen(
  inst: Installation,
  abschluss: 'regulaer' | 'nachgetragen',
): Promise<void> {
  const fertig = laufende;
  if (fertig.length === 0) return;
  laufende = [];
  sitzung = ulid(Date.now(), zufall);
  await speichereSitzung(db, sitzungEreignis(fertig, abschluss)).catch(() => undefined);
  await buchen(db, inst, Date.now()).catch(() => []);
}

/** „Fertig für heute“: Die Sitzung ist regulär beendet. */
export async function sitzungBeenden(): Promise<void> {
  const inst = await bereit();
  if (inst) await sitzungAbschliessen(inst, 'regulaer');
}

/** Alle Buchungen des Profils (Abschlussbildschirm). */
export async function alleBuchungen(): Promise<BuchungEreignis[]> {
  const inst = await bereit();
  return inst ? buchungen(db, inst.profil).catch(() => []) : [];
}

/** Kontostand des Profils (leer, wenn nicht gespeichert werden kann). */
export async function kontostand(): Promise<Konto | undefined> {
  const inst = await bereit();
  return inst ? konto(db, inst.profil).catch(() => undefined) : undefined;
}

export type Antwortdaten = Omit<AufgabeAngaben, 'profil' | 'geraet' | 'sitzung' | 'faellig'>;

/** Speichert eine beantwortete Aufgabe; Fehler beim Speichern unterbrechen das Üben nicht. */
export async function merke(daten: Antwortdaten): Promise<void> {
  const inst = await bereit();
  if (!inst) return;
  const jetzt = Date.now();
  // Lange Ruhe oder neuer Lerntag: Die alte Sitzung gilt als beendet, ohne „Fertig für heute“
  if (neueSitzungNoetig(laufende.at(-1), jetzt, lerntag(jetzt, versatz(jetzt))))
    await sitzungAbschliessen(inst, 'nachgetragen');
  // „Fällig“ hält fest, ob die Karte in diesem Moment zur Wiederholung anstand (LEHRPLAN §6).
  const k = await karte(db, inst.profil, daten.vorlage, daten.niveau).catch(() => undefined);
  const e = aufgabeEreignis(
    {
      ...daten,
      profil: inst.profil,
      geraet: inst.geraet,
      sitzung,
      faellig: k !== undefined && istFaellig(k, jetzt),
    },
    jetzt,
    -new Date(jetzt).getTimezoneOffset(),
    zufall,
  );
  const gespeichert = await speichereAufgabe(db, e).then(
    () => true,
    () => false,
  );
  if (gespeichert) laufende.push(e);
}

export interface Zustand {
  /** Stände, Schlüssel "Kompetenz|Niveau" */
  readonly staende: ReadonlyMap<string, KompetenzStand>;
  readonly karten: readonly Karte[];
}

/** Stände und Karten des Profils (leer, wenn nicht gespeichert werden kann). */
export async function zustand(): Promise<Zustand> {
  const inst = await bereit();
  if (!inst) return { staende: new Map(), karten: [] };
  const [liste, alleKarten] = await Promise.all([
    kompetenzStaende(db, inst.profil).catch(() => []),
    karten(db, inst.profil).catch(() => []),
  ]);
  return {
    staende: new Map(liste.map((s) => [`${s.kompetenz}|${s.niveau}`, s])),
    karten: alleKarten,
  };
}

/** Offene Fehler, nach Ursache gruppiert (Fehlerwerkstatt). */
export async function fehlergruppen(): Promise<Fehlergruppe[]> {
  const inst = await bereit();
  if (!inst) return [];
  const alle = await aufgaben(db, inst.profil).catch(() => []);
  return gruppiere(offeneFehler(alle));
}

/** Alle Aufgaben des Profils (Elternbericht, „Was meine Eltern sehen“). */
export async function alleAufgaben(): Promise<AufgabeEreignis[]> {
  const inst = await bereit();
  if (!inst) return [];
  return aufgaben(db, inst.profil).catch(() => []);
}

async function setze(schluessel: string, wert: string | number): Promise<void> {
  const inst = await bereit();
  if (!inst) throw new Error('Speichern nicht möglich');
  const jetzt = Date.now();
  await speichereEinstellung(
    db,
    einstellungEreignis(
      { profil: inst.profil, geraet: inst.geraet, schluessel, wert, durch: 'eltern' },
      jetzt,
      -new Date(jetzt).getTimezoneOffset(),
      zufall,
    ),
  );
}

async function lies(schluessel: string): Promise<string | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  // PIN und Wiederherstellungscode gelten nur auf diesem Gerät (D-15)
  const w = JE_GERAET.has(schluessel)
    ? aufDiesemGeraet(
        await einstellungsEreignisse(db, inst.profil).catch(() => []),
        schluessel,
        inst.geraet,
      )?.wert
    : await einstellung(db, inst.profil, schluessel).catch(() => undefined);
  return typeof w === 'string' ? w : undefined;
}

export const pinGesetzt = async () => (await lies('eltern.pin')) !== undefined;

/** Gibt es für dieses Profil eine PIN von einem anderen Gerät, aber keine hier (D-15)? */
export async function pinAusSicherung(): Promise<boolean> {
  const inst = await bereit();
  if (!inst || (await pinGesetzt())) return false;
  const alle = await einstellungsEreignisse(db, inst.profil).catch(() => []);
  return vonAnderemGeraet(alle, 'eltern.pin', inst.geraet);
}

/** Lerntage, an denen die PIN nach dem Einspielen einer Sicherung neu festgelegt wurde (D-15). */
export async function pinVermerke(): Promise<string[]> {
  const inst = await bereit();
  if (!inst) return [];
  const alle = await einstellungsEreignisse(db, inst.profil).catch(() => []);
  return alle
    .filter((e) => e.schluessel === PIN_NACH_SICHERUNG && typeof e.wert === 'string')
    .sort((a, b) => a.ts - b.ts)
    .map((e) => String(e.wert));
}

/** PIN festlegen (oder neu setzen); liefert den neuen Wiederherstellungscode (D-12). */
export async function pinFestlegen(pin: string): Promise<string> {
  if (await pinAusSicherung()) {
    const jetzt = Date.now();
    await setze(PIN_NACH_SICHERUNG, lerntag(jetzt, -new Date(jetzt).getTimezoneOffset()));
  }
  const code = wortcode(zufall);
  await setze('eltern.pin', await hashe(pin));
  await setze('eltern.wiederherstellung', await hashe(normalisiereCode(code)));
  return code;
}

export async function pinPruefen(pin: string): Promise<boolean> {
  const h = await lies('eltern.pin');
  return h !== undefined && pruefe(pin, h);
}

/** Mit dem Wiederherstellungscode eine neue PIN setzen; liefert den neuen Code oder undefined. */
export async function mitCodeZuruecksetzen(
  code: string,
  neuePin: string,
): Promise<string | undefined> {
  const h = await lies('eltern.wiederherstellung');
  if (h === undefined || !(await pruefe(normalisiereCode(code), h))) return undefined;
  return pinFestlegen(neuePin);
}

/** Ist es Zeit, an eine Sicherung zu erinnern (monatlich, ARCHITEKTUR §2)? */
export async function sicherungAnstehend(): Promise<boolean> {
  const inst = await bereit();
  if (!inst) return false;
  const [letzte, erste, tage] = await Promise.all([
    letzteSicherung(db).catch(() => undefined),
    ersteAufgabe(db, inst.profil).catch(() => undefined),
    erinnerungAlle(),
  ]);
  return sicherungFaellig(letzte, erste, Date.now(), tage);
}

/** Abstand der Sicherungs-Erinnerung in Tagen; 0 = aus (D-O4). */
export async function erinnerungAlle(): Promise<number> {
  const inst = await bereit();
  if (!inst) return erinnerungTage(undefined);
  return erinnerungTage(
    await einstellung(db, inst.profil, ERINNERUNG_SCHLUESSEL).catch(() => undefined),
  );
}

/** Eltern stellen den Abstand ein (als Einstellungs-Ereignis, D-5). */
export const erinnerungSetzen = (tage: number) => setze(ERINNERUNG_SCHLUESSEL, tage);

export async function letzteSicherungAm(): Promise<number | undefined> {
  return (await bereit()) ? letzteSicherung(db).catch(() => undefined) : undefined;
}

export interface NeueSicherung {
  readonly code: string;
  readonly name: string;
  readonly datei: Uint8Array;
}

/** Profil-Sicherung mit neuem Sicherungscode aus sechs Wörtern erstellen (D-9). */
export async function sicherungErstellen(): Promise<NeueSicherung> {
  const inst = await bereit();
  if (!inst) throw new Error('Speichern nicht möglich');
  const jetzt = Date.now();
  const tag = lerntag(jetzt, -new Date(jetzt).getTimezoneOffset());
  const code = wortcode(zufall, CODE_WOERTER);
  const datei = await verschluesseln(await exportieren(db, inst.profil), code, tag);
  return { code, name: dateiname(tag), datei };
}

/** Nach dem Speichern der Datei: für die Erinnerung festhalten. */
export async function sicherungGespeichert(): Promise<void> {
  if (await bereit()) await sicherungVermerken(db, Date.now());
}

export type EinspielenErgebnis =
  | { readonly ok: true; readonly neu: number }
  | { readonly ok: false; readonly grund: OeffnenFehler | 'anderes-profil' | 'speicher' };

/** Sicherungsdatei mit Code öffnen und einspielen (DATENMODELL §7.2). */
export async function sicherungEinspielen(
  datei: Uint8Array,
  code: string,
): Promise<EinspielenErgebnis> {
  const inst = await bereit();
  if (!inst) return { ok: false, grund: 'speicher' };
  const inhalt = await oeffnen(datei, code);
  if (typeof inhalt === 'string') return { ok: false, grund: inhalt };
  const r = await importieren(db, inhalt, inst.profil, Date.now()).catch(() => undefined);
  if (!r) return { ok: false, grund: 'speicher' };
  if (!r.ok) return r;
  installation = undefined; // Profil kann gewechselt haben
  await bereit(); // bucht, was aus der Sicherung noch fehlt
  return { ok: true, neu: r.neu };
}
