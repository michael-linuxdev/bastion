// Verbindet die App mit der Ablage im Browser: echte Uhr, echter Zufall,
// eine Sitzung je App-Start. Ist IndexedDB nicht nutzbar (z. B. privater
// Modus mancher Browser), funktioniert Üben weiter – nur ohne Speichern.
import { aufgabeEreignis, type AufgabeAngaben } from '../../core/learning/ereignis';
import type { KompetenzStand } from '../../core/learning/fortschritt';
import { ulid } from '../../core/rng/ulid';
import type { ZufallsQuelle } from '../../core/rng/zufallsquelle';
import {
  einrichten,
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

export type Antwortdaten = Omit<AufgabeAngaben, 'profil' | 'geraet' | 'sitzung' | 'modus'>;

/** Speichert eine beantwortete Aufgabe; Fehler beim Speichern unterbrechen das Üben nicht. */
export async function merke(daten: Antwortdaten): Promise<void> {
  const inst = await bereit();
  if (!inst) return;
  const jetzt = Date.now();
  const e = aufgabeEreignis(
    { ...daten, profil: inst.profil, geraet: inst.geraet, sitzung, modus: 'ueben' },
    jetzt,
    -new Date(jetzt).getTimezoneOffset(),
    zufall,
  );
  await speichereAufgabe(db, e).catch(() => undefined);
}

/** Stände aller Kompetenzen des Profils, Schlüssel "Kompetenz|Niveau". */
export async function staende(): Promise<Map<string, KompetenzStand>> {
  const inst = await bereit();
  if (!inst) return new Map();
  const liste = await kompetenzStaende(db, inst.profil).catch(() => []);
  return new Map(liste.map((s) => [`${s.kompetenz}|${s.niveau}`, s]));
}
