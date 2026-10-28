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
import { offeneSitzungen, type SitzungEreignis } from '../core/learning/sitzung';
import {
  fehlendeBuchungen,
  kontoAus,
  leeresKonto,
  verbuche,
  type BuchungEreignis,
  type Konto,
} from '../core/ledger/buchung';
import {
  bastionAus,
  fertigmeldungen,
  type Bastion,
  type BauEreignis,
  type Ergebnis,
} from '../core/bastion/bauen';
import { kartenSchluessel, type Karte } from '../core/srs/karten';
import { ulid } from '../core/rng/ulid';
import type { ZufallsQuelle } from '../core/rng/zufallsquelle';
import { aktuelleEinstellungen, type EinstellungEreignis } from '../core/policy/einstellung';
import { fehlende, FORMAT, type SicherungsInhalt } from '../core/sicherung/sicherung';
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
  await db.transaction(
    'rw',
    [db.aufgaben, db.kompetenzen, db.karten, db.buchungen, db.konto, db.bau, db.bastion],
    async () => {
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
      const alleBuchungen = await buchungen(db, profil);
      await db.konto.put(kontoAus(profil, alleBuchungen));
      await db.bastion.put({
        profil,
        ...bastionAus(await bauEreignisse(db, profil), alleBuchungen),
      });
    },
  );
}

/** Sitzungs-Ereignis speichern (DATENMODELL §4.2); eine schon erfasste Sitzung bleibt, wie sie ist. */
export async function speichereSitzung(db: BastionDatenbank, e: SitzungEreignis): Promise<void> {
  await db.transaction('rw', db.sitzungen, async () => {
    if (!(await db.sitzungen.get(e.id))) await db.sitzungen.add(e);
  });
}

/** Alle Sitzungs-Ereignisse eines Profils, nach Zeit. */
export async function sitzungen(db: BastionDatenbank, profil: string): Promise<SitzungEreignis[]> {
  return db.sitzungen
    .where('[profil+ts]')
    .between([profil, -Infinity], [profil, Infinity])
    .toArray();
}

/**
 * Sitzungen dieses Geräts nachtragen, die nie regulär beendet wurden (D-3) –
 * alle außer der laufenden. Liefert die Zahl der nachgetragenen Sitzungen.
 */
export async function sitzungenNachtragen(
  db: BastionDatenbank,
  inst: Installation,
  laufend: string,
): Promise<number> {
  return db.transaction('rw', db.aufgaben, db.sitzungen, async () => {
    const bekannt = new Set((await sitzungen(db, inst.profil)).map((s) => s.id));
    const offen = offeneSitzungen(await aufgaben(db, inst.profil), bekannt, inst.geraet, laufend);
    await db.sitzungen.bulkAdd(offen);
    return offen.length;
  });
}

/** Alle Buchungen eines Profils, nach Zeit. */
export async function buchungen(db: BastionDatenbank, profil: string): Promise<BuchungEreignis[]> {
  return db.buchungen
    .where('[profil+ts]')
    .between([profil, -Infinity], [profil, Infinity])
    .toArray();
}

/** Kontostand eines Profils (Projektion `konto`). */
export async function konto(db: BastionDatenbank, profil: string): Promise<Konto> {
  return (await db.konto.get(profil)) ?? leeresKonto(profil);
}

/**
 * Buchen (DATENMODELL §4.3): Was nach den Regeln zusteht und noch fehlt, als
 * Buchungen speichern und das Konto in derselben Transaktion fortschreiben (D-6).
 * Liefert die neuen Buchungen. Läuft nach jedem Sitzungsende und nach dem Einspielen.
 */
export async function buchen(
  db: BastionDatenbank,
  inst: Installation,
  jetzt: number,
): Promise<BuchungEreignis[]> {
  return db.transaction(
    'rw',
    [db.aufgaben, db.sitzungen, db.kompetenzen, db.buchungen, db.konto],
    async () => {
      const vorhanden = new Set(
        await db.buchungen
          .where('[profil+ts]')
          .between([inst.profil, -Infinity], [inst.profil, Infinity])
          .primaryKeys(),
      );
      const neu = fehlendeBuchungen(
        await sitzungen(db, inst.profil),
        await aufgaben(db, inst.profil),
        await kompetenzStaende(db, inst.profil),
        vorhanden,
        { profil: inst.profil, geraet: inst.geraet, jetzt },
      );
      if (neu.length === 0) return neu;
      await db.buchungen.bulkAdd(neu);
      await db.konto.put(neu.reduce(verbuche, await konto(db, inst.profil)));
      return neu;
    },
  );
}

/** Alle Bau-Ereignisse eines Profils, nach Zeit. */
export async function bauEreignisse(db: BastionDatenbank, profil: string): Promise<BauEreignis[]> {
  return db.bau.where('[profil+ts]').between([profil, -Infinity], [profil, Infinity]).toArray();
}

/** Stand der Bastion (Projektion `bastion`); ohne gespeicherten Stand aus den Ereignissen. */
export async function bastion(db: BastionDatenbank, profil: string): Promise<Bastion> {
  const stand = await db.bastion.get(profil);
  if (stand)
    return {
      bauwerke: stand.bauwerke,
      vorhaben: stand.vorhaben,
      fertig: stand.fertig,
      vorrat: stand.vorrat,
    };
  return bastionAus(await bauEreignisse(db, profil), await buchungen(db, profil));
}

/** Neue IDs und Lerntage für Fertigmeldungen – die App reicht Zufall und Zeitzone herein. */
export interface Melder {
  readonly id: () => string;
  readonly tag: (ts: number) => string;
}

/**
 * Projektion `bastion` aus allen Bau-Ereignissen und Buchungen neu berechnen
 * und fertige Vorhaben als Ereignis `fertigstellen` festhalten (DATENMODELL §4.4).
 * Läuft innerhalb einer Transaktion über `bau`, `buchungen` und `bastion`.
 */
async function bastionFortschreiben(
  db: BastionDatenbank,
  inst: Installation,
  melder: Melder,
): Promise<Bastion> {
  const bau = await bauEreignisse(db, inst.profil);
  const alleBuchungen = await buchungen(db, inst.profil);
  let b = bastionAus(bau, alleBuchungen);
  const meldungen = fertigmeldungen(b, inst, melder.id, melder.tag);
  if (meldungen.length > 0) {
    await db.bau.bulkAdd(meldungen);
    b = bastionAus([...bau, ...meldungen], alleBuchungen);
  }
  await db.bastion.put({ profil: inst.profil, ...b });
  return b;
}

/** Bastion nach neuen Bauschritten auf den Stand bringen (nach `buchen`). */
export async function bastionAktualisieren(
  db: BastionDatenbank,
  inst: Installation,
  melder: Melder,
): Promise<Bastion> {
  return db.transaction('rw', [db.bau, db.buchungen, db.bastion], () =>
    bastionFortschreiben(db, inst, melder),
  );
}

/**
 * Bau-Aktion speichern (DATENMODELL §4.4): Ereignis, Abbuchung oder Erstattung,
 * Konto und Bastion in einer Transaktion (D-6).
 */
export async function bauSpeichern(
  db: BastionDatenbank,
  inst: Installation,
  e: Extract<Ergebnis, { ok: true }>,
  melder: Melder,
): Promise<Bastion> {
  return db.transaction('rw', [db.bau, db.buchungen, db.konto, db.bastion], async () => {
    await db.bau.add(e.bau);
    if (e.buchungen.length > 0) {
      await db.buchungen.bulkAdd([...e.buchungen]);
      await db.konto.put(e.buchungen.reduce(verbuche, await konto(db, inst.profil)));
    }
    return bastionFortschreiben(db, inst, melder);
  });
}

/** Einstellung speichern: Ereignis und aktueller Wert in einer Transaktion (D-5, D-6). */
export async function speichereEinstellung(
  db: BastionDatenbank,
  e: EinstellungEreignis,
): Promise<void> {
  await db.transaction('rw', db.einstellungen_ereignisse, db.einstellungen, async () => {
    await db.einstellungen_ereignisse.add(e);
    const alt = await db.einstellungen.get([e.profil, e.schluessel]);
    // Pro Schlüssel gilt die jüngste Änderung (D-5)
    if (!alt || alt.ts <= e.ts)
      await db.einstellungen.put({
        profil: e.profil,
        schluessel: e.schluessel,
        wert: e.wert,
        ts: e.ts,
      });
  });
}

export async function einstellung(
  db: BastionDatenbank,
  profil: string,
  schluessel: string,
): Promise<unknown> {
  return (await db.einstellungen.get([profil, schluessel]))?.wert;
}

/** Alle Einstellungs-Ereignisse eines Profils (z. B. für die PIN je Gerät, D-15). */
export async function einstellungsEreignisse(
  db: BastionDatenbank,
  profil: string,
): Promise<EinstellungEreignis[]> {
  return db.einstellungen_ereignisse
    .where('[profil+schluessel+ts]')
    .between([profil, '', -Infinity], [profil, '￿', Infinity])
    .toArray();
}

/** Projektion `einstellungen` aus allen Ereignissen neu aufbauen (§7.3: jüngste gilt). */
async function einstellungenNeu(db: BastionDatenbank, profil: string): Promise<void> {
  const aktuell = aktuelleEinstellungen(await einstellungsEreignisse(db, profil));
  await db.einstellungen.where('[profil+schluessel]').between([profil, ''], [profil, '￿']).delete();
  await db.einstellungen.bulkPut(
    aktuell.map((e) => ({ profil: e.profil, schluessel: e.schluessel, wert: e.wert, ts: e.ts })),
  );
}

/** Profil-Sicherung (DATENMODELL §7.1): nur Profil und Ereignisse, keine Projektionen. */
export async function exportieren(db: BastionDatenbank, profil: string): Promise<SicherungsInhalt> {
  return db.transaction(
    'r',
    [db.profile, db.aufgaben, db.sitzungen, db.buchungen, db.bau, db.einstellungen_ereignisse],
    async () => {
      const p = await db.profile.get(profil);
      return {
        format: FORMAT,
        profile: p ? [{ id: p.id, erstellt: p.erstellt }] : [],
        ereignisse: [
          ...(await aufgaben(db, profil)),
          ...(await sitzungen(db, profil)),
          ...(await buchungen(db, profil)),
          ...(await bauEreignisse(db, profil)),
          ...(await einstellungsEreignisse(db, profil)),
        ],
      };
    },
  );
}

export type ImportErgebnis =
  | { readonly ok: true; readonly profil: string; readonly neu: number }
  | { readonly ok: false; readonly grund: 'anderes-profil' };

const LOKALE_SICHERUNGEN = 2;

/**
 * Sicherung einspielen (DATENMODELL §7.2): vorher automatisch lokal sichern,
 * dann Ereignisse vereinigen (D-10) und Projektionen neu aufbauen.
 *
 * Bisher gibt es ein Profil je Gerät. Gehört die Sicherung zu einem anderen
 * Profil, übernimmt sie das Gerät nur, wenn das vorhandene Profil noch leer ist
 * (z. B. nach dem Zurücksetzen der App) – sonst ginge ein Lernstand verloren.
 */
export async function importieren(
  db: BastionDatenbank,
  inhalt: SicherungsInhalt,
  profil: string,
  jetzt: number,
): Promise<ImportErgebnis> {
  const ziel = inhalt.profile[0];
  if (inhalt.profile.length !== 1 || !ziel) return { ok: false, grund: 'anderes-profil' };
  const vorher = await exportieren(db, profil);
  if (ziel.id !== profil && vorher.ereignisse.length > 0)
    return { ok: false, grund: 'anderes-profil' };

  return db.transaction(
    'rw',
    [
      db.profile,
      db.aufgaben,
      db.sitzungen,
      db.buchungen,
      db.konto,
      db.bau,
      db.bastion,
      db.einstellungen_ereignisse,
      db.einstellungen,
      db.kompetenzen,
      db.karten,
      db.sicherungen,
    ],
    async () => {
      await db.sicherungen.put({
        id: String(jetzt),
        erstellt: jetzt,
        anlass: 'import',
        inhalt: vorher,
      });
      const alt = await db.sicherungen
        .orderBy('erstellt')
        .reverse()
        .offset(LOKALE_SICHERUNGEN)
        .primaryKeys();
      await db.sicherungen.bulkDelete(alt);

      if (ziel.id !== profil) await db.profile.delete(profil);
      if (!(await db.profile.get(ziel.id))) await db.profile.put({ ...ziel });

      const auf: AufgabeEreignis[] = [];
      const sit: SitzungEreignis[] = [];
      const buc: BuchungEreignis[] = [];
      const bau: BauEreignis[] = [];
      const ein: EinstellungEreignis[] = [];
      for (const e of inhalt.ereignisse) {
        if (e.art === 'aufgabe') auf.push(e);
        else if (e.art === 'sitzung') sit.push(e);
        else if (e.art === 'buchung') buc.push(e);
        else if (e.art === 'bau') bau.push(e);
        else ein.push(e);
      }
      const neueAufgaben = fehlende(
        new Set(
          await db.aufgaben
            .where('id')
            .anyOf(auf.map((e) => e.id))
            .primaryKeys(),
        ),
        auf,
      );
      const neueEinstellungen = fehlende(
        new Set(
          await db.einstellungen_ereignisse
            .where('id')
            .anyOf(ein.map((e) => e.id))
            .primaryKeys(),
        ),
        ein,
      );
      const neueSitzungen = fehlende(
        new Set(
          await db.sitzungen
            .where('id')
            .anyOf(sit.map((e) => e.id))
            .primaryKeys(),
        ),
        sit,
      );
      await db.aufgaben.bulkAdd(neueAufgaben);
      const neueBuchungen = fehlende(
        new Set(
          await db.buchungen
            .where('id')
            .anyOf(buc.map((e) => e.id))
            .primaryKeys(),
        ),
        buc,
      );
      await db.sitzungen.bulkAdd(neueSitzungen);
      const neueBau = fehlende(
        new Set(
          await db.bau
            .where('id')
            .anyOf(bau.map((e) => e.id))
            .primaryKeys(),
        ),
        bau,
      );
      await db.buchungen.bulkAdd(neueBuchungen);
      await db.bau.bulkAdd(neueBau);
      await db.einstellungen_ereignisse.bulkAdd(neueEinstellungen);
      await neuBerechnen(db, ziel.id);
      await einstellungenNeu(db, ziel.id);
      return {
        ok: true,
        profil: ziel.id,
        neu:
          neueAufgaben.length +
          neueSitzungen.length +
          neueBuchungen.length +
          neueBau.length +
          neueEinstellungen.length,
      };
    },
  );
}

/** Zeitpunkt der letzten eigenen Sicherung (für die Erinnerung, ARCHITEKTUR §2). */
export async function letzteSicherung(db: BastionDatenbank): Promise<number | undefined> {
  const w = (await db.meta.get('letzteSicherung'))?.wert;
  return w === undefined ? undefined : Number(w);
}

export async function sicherungVermerken(db: BastionDatenbank, jetzt: number): Promise<void> {
  await db.meta.put({ schluessel: 'letzteSicherung', wert: String(jetzt) });
}

/** Zeitpunkt der ersten Aufgabe eines Profils. */
export async function ersteAufgabe(
  db: BastionDatenbank,
  profil: string,
): Promise<number | undefined> {
  return (
    await db.aufgaben.where('[profil+ts]').between([profil, -Infinity], [profil, Infinity]).first()
  )?.ts;
}
