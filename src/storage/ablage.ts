// Repository-Schnittstelle (T-4): Ereignisse schreiben, Projektionen in
// derselben Transaktion fortschreiben (D-6), Stände lesen, neu aufbauen.
import type { AufgabeEreignis } from '../core/learning/ereignis';
import { fortschreiben, neuAufbauen, type KompetenzStand } from '../core/learning/fortschritt';
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

/** Ereignis speichern und den Stand der Kompetenz in derselben Transaktion fortschreiben. */
export async function speichereAufgabe(db: BastionDatenbank, e: AufgabeEreignis): Promise<void> {
  await db.transaction('rw', db.aufgaben, db.kompetenzen, async () => {
    await db.aufgaben.add(e);
    const alt = await db.kompetenzen.get([e.profil, e.kompetenz, e.niveau]);
    const neu = fortschreiben(alt, e);
    if (neu) await db.kompetenzen.put(neu);
  });
}

/** Alle Kompetenzstände eines Profils. */
export async function kompetenzStaende(
  db: BastionDatenbank,
  profil: string,
): Promise<KompetenzStand[]> {
  return db.kompetenzen.where('[profil+status]').between([profil, ''], [profil, '￿']).toArray();
}

/** Projektion aus allen Ereignissen neu berechnen (D-6), z. B. nach Import oder Migration. */
export async function neuBerechnen(db: BastionDatenbank, profil: string): Promise<void> {
  await db.transaction('rw', db.aufgaben, db.kompetenzen, async () => {
    const ereignisse = await db.aufgaben
      .where('[profil+ts]')
      .between([profil, -Infinity], [profil, Infinity])
      .toArray();
    const alt = await kompetenzStaende(db, profil);
    await db.kompetenzen.bulkDelete(
      alt.map((s) => [s.profil, s.kompetenz, s.niveau] as [string, string, string]),
    );
    await db.kompetenzen.bulkPut([...neuAufbauen(ereignisse).values()]);
  });
}
