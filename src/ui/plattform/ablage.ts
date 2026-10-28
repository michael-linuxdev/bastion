// Verbindet die App mit der Ablage im Browser: echte Uhr, echter Zufall,
// eine Sitzung je App-Start. Ist IndexedDB nicht nutzbar (z. B. privater
// Modus mancher Browser), funktioniert Üben weiter – nur ohne Speichern.
import { aufgabeEreignis, type AufgabeAngaben } from '../../core/learning/ereignis';
import type { KompetenzStand } from '../../core/learning/fortschritt';
import { ulid } from '../../core/rng/ulid';
import type { ZufallsQuelle } from '../../core/rng/zufallsquelle';
import { istFaellig, type Karte } from '../../core/srs/karten';
import {
  einrichten,
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
