import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import {
  aufgabeEreignis,
  type AufgabeAngaben,
  type AufgabeEreignis,
} from '../core/learning/ereignis';
import { quelleAusSeed } from '../core/rng/zufallsquelle';
import {
  einrichten,
  einstellung,
  ersteAufgabe,
  exportieren,
  importieren,
  karten,
  letzteSicherung,
  sicherungVermerken,
  kompetenzStaende,
  neuBerechnen,
  speichereAufgabe,
  speichereEinstellung,
  speichereSitzung,
  sitzungen,
  sitzungenNachtragen,
  buchen,
  buchungen,
  konto,
} from './ablage';
import { kontoAus } from '../core/ledger/buchung';
import { sitzungEreignis } from '../core/learning/sitzung';
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

  it('Export und Import: Gerätewechsel, Zusammenführen ohne Doppelte (D-10)', async () => {
    const alt = neueDb();
    const { profil, geraet } = await einrichten(alt, 1000, quelleAusSeed(1));
    const zufall = quelleAusSeed(9);
    for (let i = 0; i < 6; i++)
      await speichereAufgabe(
        alt,
        aufgabeEreignis(
          angaben(profil, geraet, { vorlage: `M.ZO.NZ.RUNDEN.${i % 2}` }),
          2000 + i,
          60,
          zufall,
        ),
      );
    await speichereEinstellung(
      alt,
      einstellungEreignis(
        { profil, geraet, schluessel: 'eltern.pin', wert: 'hash', durch: 'eltern' },
        2500,
        60,
        zufall,
      ),
    );
    const sicherung = await exportieren(alt, profil);
    expect(sicherung.profile).toEqual([{ id: profil, erstellt: 1000 }]);
    expect(sicherung.ereignisse).toHaveLength(7);
    expect(await ersteAufgabe(alt, profil)).toBe(2000);

    // Neues Gerät: eigenes, leeres Profil – die Sicherung übernimmt es
    const neu = neueDb();
    const inst = await einrichten(neu, 5000, quelleAusSeed(2));
    expect(inst.profil).not.toBe(profil);
    const r = await importieren(neu, sicherung, inst.profil, 6000);
    expect(r).toEqual({ ok: true, profil, neu: 7 });
    expect((await einrichten(neu, 7000, quelleAusSeed(3))).profil).toBe(profil);
    expect(await kompetenzStaende(neu, profil)).toEqual(await kompetenzStaende(alt, profil));
    expect(await karten(neu, profil)).toEqual(await karten(alt, profil));
    expect(await einstellung(neu, profil, 'eltern.pin')).toBe('hash');

    // Nochmal einspielen: nichts kommt doppelt
    expect(await importieren(neu, sicherung, profil, 8000)).toEqual({ ok: true, profil, neu: 0 });
    expect((await exportieren(neu, profil)).ereignisse).toHaveLength(7);
    // Vor jedem Import eine lokale Sicherung, höchstens zwei bleiben (D-8)
    expect(await neu.sicherungen.count()).toBe(2);
  });

  it('Import überschreibt keinen anderen Lernstand', async () => {
    const a = neueDb();
    const pa = await einrichten(a, 1000, quelleAusSeed(1));
    await speichereAufgabe(
      a,
      aufgabeEreignis(angaben(pa.profil, pa.geraet, {}), 2000, 60, quelleAusSeed(4)),
    );
    const b = neueDb();
    const pb = await einrichten(b, 1000, quelleAusSeed(2));
    await speichereAufgabe(
      b,
      aufgabeEreignis(angaben(pb.profil, pb.geraet, {}), 2000, 60, quelleAusSeed(5)),
    );
    expect(await importieren(b, await exportieren(a, pa.profil), pb.profil, 3000)).toEqual({
      ok: false,
      grund: 'anderes-profil',
    });
    expect((await exportieren(b, pb.profil)).ereignisse).toHaveLength(1);
  });

  it('Sitzungen: nachtragen, nichts doppelt, mit in der Sicherung', async () => {
    const db = neueDb();
    const inst = await einrichten(db, 1000, quelleAusSeed(1));
    const zufall = quelleAusSeed(4);
    const speichere = (sitzung: string, ts: number) =>
      speichereAufgabe(
        db,
        aufgabeEreignis(angaben(inst.profil, inst.geraet, { sitzung }), ts, 60, zufall),
      );
    for (let i = 0; i < 3; i++) await speichere('ALT', 2000 + i * 10_000);
    await speichere('BEENDET', 50_000);
    await speichere('JETZT', 60_000);

    // „Fertig für heute“ schreibt die Sitzung regulär; zweimal schreiben ändert nichts
    const beendet = (await exportieren(db, inst.profil)).ereignisse.filter(
      (e): e is AufgabeEreignis => e.art === 'aufgabe' && e.sitzung === 'BEENDET',
    );
    const regulaer = sitzungEreignis(beendet, 'regulaer');
    await speichereSitzung(db, regulaer);
    await speichereSitzung(db, { ...regulaer, abschluss: 'nachgetragen' });

    expect(await sitzungenNachtragen(db, inst, 'JETZT')).toBe(1);
    expect(await sitzungenNachtragen(db, inst, 'JETZT')).toBe(0);
    const alle = await sitzungen(db, inst.profil);
    expect(alle.map((s) => [s.id, s.abschluss, s.aufgaben])).toEqual([
      ['ALT', 'nachgetragen', 3],
      ['BEENDET', 'regulaer', 1],
    ]);

    // Sicherung trägt die Sitzungen mit; Einspielen bringt sie ohne Doppelte zurück
    const sicherung = await exportieren(db, inst.profil);
    expect(sicherung.ereignisse.filter((e) => e.art === 'sitzung')).toHaveLength(2);
    const neu = neueDb();
    const ziel = await einrichten(neu, 5000, quelleAusSeed(2));
    expect(await importieren(neu, sicherung, ziel.profil, 6000)).toMatchObject({
      ok: true,
      neu: 7,
    });
    expect(await sitzungen(neu, inst.profil)).toEqual(alle);
    expect(await importieren(neu, sicherung, inst.profil, 7000)).toMatchObject({ neu: 0 });
  });

  it('Buchen: einmal je Anlass, Konto passt zu den Buchungen, in der Sicherung dabei', async () => {
    const db = neueDb();
    const inst = await einrichten(db, 1000, quelleAusSeed(1));
    const zufall = quelleAusSeed(5);
    // zwölf Aufgaben in einer Sitzung: Lerneinheit, 12 Stein, 1 Bauschritt
    for (let i = 0; i < 12; i++)
      await speichereAufgabe(
        db,
        aufgabeEreignis(
          angaben(inst.profil, inst.geraet, { sitzung: 'S1', vorlage: `V${i % 2}` }),
          2000 + i * 20_000,
          60,
          zufall,
        ),
      );
    expect(await sitzungenNachtragen(db, inst, 'JETZT')).toBe(1);
    const neu = await buchen(db, inst, 999_999);
    expect(neu.map((b) => [b.ressource, b.menge])).toEqual([
      ['stein', 12],
      ['bauschritt', 1],
    ]);
    expect(await buchen(db, inst, 1_000_000)).toEqual([]);
    const k = await konto(db, inst.profil);
    expect(k.stand).toEqual({ stein: 12, erz: 0, bauplan: 0, bauschritt: 1 });
    expect(k).toEqual(kontoAus(inst.profil, await buchungen(db, inst.profil)));

    // Neuberechnung ergibt dasselbe Konto (D-6)
    await neuBerechnen(db, inst.profil);
    expect(await konto(db, inst.profil)).toEqual(k);

    // Sicherung: Buchungen kommen mit, das Konto stimmt auf dem neuen Gerät
    const sicherung = await exportieren(db, inst.profil);
    expect(sicherung.ereignisse.filter((e) => e.art === 'buchung')).toHaveLength(2);
    const ziel = neueDb();
    const z = await einrichten(ziel, 5000, quelleAusSeed(2));
    expect(await importieren(ziel, sicherung, z.profil, 6000)).toMatchObject({ ok: true, neu: 15 });
    expect(await konto(ziel, inst.profil)).toEqual(k);
    // Das neue Gerät rechnet nach und findet nichts, was fehlt
    expect(await buchen(ziel, { profil: inst.profil, geraet: 'anderes1' }, 7000)).toEqual([]);
    expect(await importieren(ziel, sicherung, inst.profil, 8000)).toMatchObject({ neu: 0 });
  });

  it('merkt sich die letzte Sicherung', async () => {
    const db = neueDb();
    expect(await letzteSicherung(db)).toBeUndefined();
    await sicherungVermerken(db, 1234);
    expect(await letzteSicherung(db)).toBe(1234);
  });
});
