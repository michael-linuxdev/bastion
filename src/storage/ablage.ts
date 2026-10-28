// Repository-Schnittstelle (T-4): Ereignisse schreiben, Projektionen in
// derselben Transaktion fortschreiben (D-6), Stände lesen, neu aufbauen.
import type { AufgabeEreignis } from '../core/learning/ereignis';
import {
  neuAufbauen,
  standSchluessel,
  verarbeite,
  type KompetenzStand,
  type Projektion,
} from '../core/learning/fortschritt';
import { kartenSchluessel, type Karte } from '../core/srs/karten';
import { ulid } from '../core/rng/ulid';
import type { ZufallsQuelle } from '../core/rng/zufallsquelle';
import type { BastionDatenbank } from './datenbank';

export interface Installation {
  /** Zufallskennung der Installation, 8 Zeichen (DATENMODELL §3.4) */
  readonly geraet: string;
  readonly profil: string;
}

/** Beim ersten Start: Gerätekennung und ein erstes Profil anlegen. */
export async function einrichten(
  db: BastionDatenbank,
  jetzt: number,
  zufall: ZufallsQuelle,
): Promise<Installation> {
  return db.transaction('rw', db.meta, db.profile, async () => {
    let geraet = (await db.meta.get('geraet'))?.wert;
    if (!geraet) {
      geraet = ulid(jetzt, zufall).slice(-8);
      await db.meta.put({ schluessel: 'geraet', wert: geraet });
    }
    let profil = (await db.profile.orderBy('id').first())?.id;
    if (!profil) {
      profil = ulid(jetzt, zufall);
      await db.profile.put({ id: profil, erstellt: jetzt });
    }
    return { geraet, profil };
  });
}

/** Eine Karte (Vorlage × Niveau), falls schon geübt. */
export async function karte(
  db: BastionDatenbank,
  profil: string,
  vorlage: string,
  niveau: string,
): Promise<Karte | undefined> {
  return db.karten.get([profil, vorlage, niveau]);
}

/** Alle Karten eines Profils (wenige hundert – Filtern im Speicher genügt). */
export async function karten(db: BastionDatenbank, profil: string): Promise<Karte[]> {
  return db.karten
    .where('[profil+faellig]')
    .between([profil, -Infinity], [profil, Infinity])
    .toArray();
}

/**
 * Ereignis speichern und Karte sowie Kompetenzstand in derselben Transaktion
 * fortschreiben (D-6) – mit derselben Regel wie beim Neuaufbau (verarbeite).
 */
export async function speichereAufgabe(db: BastionDatenbank, e: AufgabeEreignis): Promise<void> {
  await db.transaction('rw', db.aufgaben, db.kompetenzen, db.karten, async () => {
    await db.aufgaben.add(e);
    const vorher: Projektion = {
      staende: new Map(),
      karten: new Map(
        (await karten(db, e.profil))
          .filter((k) => k.kompetenz === e.kompetenz && k.niveau === e.niveau)
          .map((k) => [kartenSchluessel(k), k]),
      ),
    };
    const stand = await db.kompetenzen.get([e.profil, e.kompetenz, e.niveau]);
    if (stand) vorher.staende.set(standSchluessel(stand), stand);
    verarbeite(vorher, e);
    const neueKarte = vorher.karten.get(kartenSchluessel(e));
    if (neueKarte) await db.karten.put(neueKarte);
    const neuerStand = vorher.staende.get(standSchluessel(e));
    if (neuerStand) await db.kompetenzen.put(neuerStand);
  });
}

/** Alle Aufgaben-Ereignisse eines Profils, nach Zeit (z. B. für die Fehlerwerkstatt). */
export async function aufgaben(db: BastionDatenbank, profil: string): Promise<AufgabeEreignis[]> {
  return db.aufgaben
    .where('[profil+ts]')
    .between([profil, -Infinity], [profil, Infinity])
    .toArray();
}

/** Alle Kompetenzstände eines Profils. */
export async function kompetenzStaende(
  db: BastionDatenbank,
  profil: string,
): Promise<KompetenzStand[]> {
  return db.kompetenzen.where('[profil+status]').between([profil, ''], [profil, '￿']).toArray();
}

/** Projektionen aus allen Ereignissen neu berechnen (D-6), z. B. nach Import oder Migration. */
export async function neuBerechnen(db: BastionDatenbank, profil: string): Promise<void> {
  await db.transaction('rw', db.aufgaben, db.kompetenzen, db.karten, async () => {
    const ereignisse = await db.aufgaben
      .where('[profil+ts]')
      .between([profil, -Infinity], [profil, Infinity])
      .toArray();
    const p = neuAufbauen(ereignisse);
    const alteStaende = await kompetenzStaende(db, profil);
    await db.kompetenzen.bulkDelete(
      alteStaende.map((s) => [s.profil, s.kompetenz, s.niveau] as [string, string, string]),
    );
    const alteKarten = await karten(db, profil);
    await db.karten.bulkDelete(
      alteKarten.map((k) => [k.profil, k.vorlage, k.niveau] as [string, string, string]),
    );
    await db.kompetenzen.bulkPut([...p.staende.values()]);
    await db.karten.bulkPut([...p.karten.values()]);
  });
}
