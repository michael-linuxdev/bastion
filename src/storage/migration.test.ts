// Migrationen mit echten Altständen (DATENMODELL §6.2, tests/altstaende/).
import { Dexie } from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import altstand1 from '../../tests/altstaende/schema-1.json';
import altstand2 from '../../tests/altstaende/schema-2.json';
import { vermittlungEreignis } from '../core/learning/vermittlung-ereignis';
import { quelleAusSeed } from '../core/rng/zufallsquelle';
import {
  aufgaben,
  einrichten,
  exportieren,
  karten,
  kompetenzStaende,
  neuBerechnen,
  nutzungen,
  speichereNutzung,
  speichereVermittlung,
  vermittlungen,
} from './ablage';
import { BastionDatenbank, SCHEMA_1, SCHEMA_2 } from './datenbank';
import { nutzungEreignis } from '../core/testphase/nutzung';

let nr = 0;

/** Altstand in eine Datenbank der alten Schemaversion schreiben. */
async function alteDatenbank(
  version: number,
  schema: Record<string, string>,
  tabellen: Record<string, unknown[]>,
): Promise<string> {
  const name = `migration-${(nr += 1)}`;
  const alt = new Dexie(name, { indexedDB, IDBKeyRange });
  alt.version(version).stores(schema);
  await alt.transaction('rw', Object.keys(tabellen), async () => {
    for (const [tabelle, zeilen] of Object.entries(tabellen))
      await alt.table(tabelle).bulkAdd(zeilen);
  });
  alt.close();
  return name;
}

describe('Migration Schemaversion 1 → 2', () => {
  it('behält alle Daten und ergänzt die Tabelle vermittlungen', async () => {
    const name = await alteDatenbank(1, SCHEMA_1, altstand1.tabellen);
    const db = new BastionDatenbank(name, { indexedDB, IDBKeyRange });
    await db.open();
    expect(db.verno).toBe(3);

    // Nichts geht verloren, nichts ändert sich
    for (const [tabelle, zeilen] of Object.entries(altstand1.tabellen))
      expect(await db.table(tabelle).toArray()).toEqual(zeilen);

    // Gerät und Profil bleiben dieselben
    const inst = await einrichten(db, Date.now(), quelleAusSeed(1));
    expect(inst.profil).toBe(altstand1.tabellen.profile[0]?.id);
    expect(await aufgaben(db, inst.profil)).toHaveLength(2);

    // Projektionen lassen sich unverändert neu aufbauen (D-6)
    const staende = await kompetenzStaende(db, inst.profil);
    const k = await karten(db, inst.profil);
    await neuBerechnen(db, inst.profil);
    expect(await kompetenzStaende(db, inst.profil)).toEqual(staende);
    expect(await karten(db, inst.profil)).toEqual(k);

    // Die neue Tabelle ist nutzbar und reist in der Sicherung mit
    const e = vermittlungEreignis(
      {
        profil: inst.profil,
        geraet: inst.geraet,
        kompetenz: 'M.ZO.BR.ERWEITERN',
        inhalt: 'M.ZO.BR.ERWEITERN@1',
        schritt: 'uebergang',
        typ: 'abgeschlossen',
      },
      Date.UTC(2026, 9, 29, 15),
      60,
      quelleAusSeed(2),
    );
    await speichereVermittlung(db, e);
    expect(await vermittlungen(db, inst.profil)).toEqual([e]);
    const sicherung = await exportieren(db, inst.profil);
    expect(sicherung.ereignisse.filter((x) => x.art === 'vermittlung')).toEqual([e]);
  });
});

describe('Migration Schemaversion 2 → 3', () => {
  it('behält alle Daten, auch Vermittlungen und Schritte; Nutzungsprotokoll nutzbar, nicht in der Sicherung', async () => {
    const name = await alteDatenbank(2, { ...SCHEMA_1, ...SCHEMA_2 }, altstand2.tabellen);
    const db = new BastionDatenbank(name, { indexedDB, IDBKeyRange });
    await db.open();
    expect(db.verno).toBe(3);
    for (const [tabelle, zeilen] of Object.entries(altstand2.tabellen))
      expect(await db.table(tabelle).toArray()).toEqual(zeilen);

    const inst = await einrichten(db, Date.now(), quelleAusSeed(1));
    expect(inst.profil).toBe(altstand2.tabellen.profile[0]?.id);
    const n = nutzungEreignis(
      { profil: inst.profil, geraet: inst.geraet, was: 'ansicht', ziel: 'start' },
      Date.UTC(2026, 9, 29, 18),
      60,
      quelleAusSeed(3),
    );
    await speichereNutzung(db, n);
    expect(await nutzungen(db, inst.profil)).toEqual([n]);
    const sicherung = await exportieren(db, inst.profil);
    expect(sicherung.ereignisse.some((e) => (e as { art: string }).art === 'nutzung')).toBe(false);
  });
});
