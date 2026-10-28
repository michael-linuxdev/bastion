import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { aufgabeEreignis, type AufgabeAngaben } from '../core/learning/ereignis';
import { quelleAusSeed } from '../core/rng/zufallsquelle';
import {
  einrichten,
  einstellung,
  karten,
  kompetenzStaende,
  neuBerechnen,
  speichereAufgabe,
  speichereEinstellung,
} from './ablage';
import { einstellungEreignis } from '../core/policy/einstellung';
import { BastionDatenbank } from './datenbank';

let nr = 0;
const neueDb = () => new BastionDatenbank(`test-${(nr += 1)}`, { indexedDB, IDBKeyRange });

const angaben = (
  profil: string,
  geraet: string,
  teil: Partial<AufgabeAngaben>,
): AufgabeAngaben => ({
  profil,
  geraet,
  sitzung: 'S',
  modus: 'ueben',
  kompetenz: 'M.ZO.NZ.RUNDEN',
  vorlage: 'M.ZO.NZ.RUNDEN.AUF-STELLE',
  niveau: 'G',
  generator: 'nz.runden-auf-stelle@1',
  seed: 1,
  paket: 'p',
  hilfen: 0,
  dauerMs: 5000,
  faellig: false,
  platzhalter: {},
  loesung: { typ: 'zahl', wert: 1 },
  antwort: { typ: 'zahl', wert: 1 },
  ergebnis: { richtig: true },
  ...teil,
});

describe('Ablage', () => {
  it('richtet Gerät und Profil einmal ein und behält sie', async () => {
    const db = neueDb();
    const a = await einrichten(db, 1000, quelleAusSeed(1));
    const b = await einrichten(db, 2000, quelleAusSeed(2));
    expect(a).toEqual(b);
    expect(a.geraet).toHaveLength(8);
    expect(a.profil).toHaveLength(26);
  });

  it('speichert Ereignisse und schreibt den Stand fort; Neuberechnung ergibt dasselbe', async () => {
    const db = neueDb();
    const { profil, geraet } = await einrichten(db, 1000, quelleAusSeed(1));
    const zufall = quelleAusSeed(7);
    const vorlagen = ['A', 'B', 'A', 'B', 'A'];
    for (const [i, v] of vorlagen.entries()) {
      const e = aufgabeEreignis(
        angaben(profil, geraet, { vorlage: `M.ZO.NZ.RUNDEN.${v}` }),
        2000 + i,
        60,
        zufall,
      );
      await speichereAufgabe(db, e);
    }
    await speichereAufgabe(
      db,
      aufgabeEreignis(
        angaben(profil, geraet, { niveau: 'M', ergebnis: { richtig: false } }),
        3000,
        60,
        zufall,
      ),
    );

    const staende = await kompetenzStaende(db, profil);
    expect(staende.map((s) => [s.niveau, s.status, s.aufgaben]).sort()).toEqual([
      ['G', 'gekonnt', 5],
      ['M', 'in-arbeit', 1],
    ]);
    expect(await db.aufgaben.count()).toBe(6);

    const kartenVorher = await karten(db, profil);
    expect(kartenVorher.map((k) => k.vorlage).sort()).toEqual([
      'M.ZO.NZ.RUNDEN.A',
      'M.ZO.NZ.RUNDEN.AUF-STELLE',
      'M.ZO.NZ.RUNDEN.B',
    ]);

    await neuBerechnen(db, profil);
    const sortiere = (k: { vorlage: string; niveau: string }[]) =>
      [...k].sort((a, b) => (a.vorlage + a.niveau).localeCompare(b.vorlage + b.niveau));
    expect(sortiere(await karten(db, profil))).toEqual(sortiere(kartenVorher));
    expect(
      (await kompetenzStaende(db, profil)).sort((a, b) => a.niveau.localeCompare(b.niveau)),
    ).toEqual(staende.sort((a, b) => a.niveau.localeCompare(b.niveau)));
  });

  it('schreibt nichts halb: doppelte Ereignis-ID bricht die ganze Transaktion ab', async () => {
    const db = neueDb();
    const { profil, geraet } = await einrichten(db, 1000, quelleAusSeed(1));
    const e = aufgabeEreignis(angaben(profil, geraet, {}), 2000, 60, quelleAusSeed(3));
    await speichereAufgabe(db, e);
    await expect(speichereAufgabe(db, e)).rejects.toThrow();
    expect((await kompetenzStaende(db, profil))[0]?.aufgaben).toBe(1);
  });

  it('Einstellungen: Ereignis plus aktueller Wert; die jüngste Änderung gilt', async () => {
    const db = neueDb();
    const { profil, geraet } = await einrichten(db, 1000, quelleAusSeed(1));
    const z = quelleAusSeed(5);
    const e = (wert: string, ts: number) =>
      einstellungEreignis(
        { profil, geraet, schluessel: 'eltern.pin', wert, durch: 'eltern' },
        ts,
        60,
        z,
      );
    await speichereEinstellung(db, e('a', 2000));
    await speichereEinstellung(db, e('b', 3000));
    await speichereEinstellung(db, e('alt', 2500)); // nachträglich eingespielt, älter
    expect(await einstellung(db, profil, 'eltern.pin')).toBe('b');
    expect(await db.einstellungen_ereignisse.count()).toBe(3);
  });
});
