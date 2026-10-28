// Verbindet die App mit der Ablage im Browser: echte Uhr, echter Zufall,
// eine Sitzung je App-Start. Ist IndexedDB nicht nutzbar (z. B. privater
// Modus mancher Browser), funktioniert Üben weiter – nur ohne Speichern.
import { aufgabeEreignis, type AufgabeAngaben } from '../../core/learning/ereignis';
import type { KompetenzStand } from '../../core/learning/fortschritt';
import { ulid } from '../../core/rng/ulid';
import { einstellungEreignis } from '../../core/policy/einstellung';
import { normalisiereCode, wortcode } from '../../core/rng/wortcode';
import { hashe, pruefe } from './pin';
import type { AufgabeEreignis } from '../../core/learning/ereignis';
import type { ZufallsQuelle } from '../../core/rng/zufallsquelle';
import { istFaellig, type Karte } from '../../core/srs/karten';
import { gruppiere, offeneFehler, type Fehlergruppe } from '../../core/learning/werkstatt';
import {
  aufgaben,
  einrichten,
  einstellung,
  speichereEinstellung,
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
const sitzung = ulid(Date.now(), zufall);
let installation: Promise<Installation | undefined> | undefined;

function bereit(): Promise<Installation | undefined> {
  installation ??= einrichten(db, Date.now(), zufall).catch(() => undefined);
  return installation;
}

export type Antwortdaten = Omit<AufgabeAngaben, 'profil' | 'geraet' | 'sitzung' | 'faellig'>;

/** Speichert eine beantwortete Aufgabe; Fehler beim Speichern unterbrechen das Üben nicht. */
export async function merke(daten: Antwortdaten): Promise<void> {
  const inst = await bereit();
  if (!inst) return;
  const jetzt = Date.now();
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
  await speichereAufgabe(db, e).catch(() => undefined);
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

async function setze(schluessel: string, wert: string): Promise<void> {
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
  const w = await einstellung(db, inst.profil, schluessel).catch(() => undefined);
  return typeof w === 'string' ? w : undefined;
}

export const pinGesetzt = async () => (await lies('eltern.pin')) !== undefined;

/** PIN festlegen (oder neu setzen); liefert den neuen Wiederherstellungscode (D-12). */
export async function pinFestlegen(pin: string): Promise<string> {
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
