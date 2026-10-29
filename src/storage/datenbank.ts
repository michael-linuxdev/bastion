// Datenbank im Browser (IndexedDB über Dexie, T-4) mit dem Schema aus
// DATENMODELL §6. Zugriff von außen nur über die Funktionen in ablage.ts.
import { Dexie, type DexieOptions, type Table } from 'dexie';
import type { AufgabeEreignis } from '../core/learning/ereignis';
import type { KompetenzStand } from '../core/learning/fortschritt';
import type { SitzungEreignis } from '../core/learning/sitzung';
import type { BuchungEreignis, Konto } from '../core/ledger/buchung';
import type { Bastion, BauEreignis } from '../core/bastion/bauen';
import type { Karte } from '../core/srs/karten';
import type { EinstellungEreignis } from '../core/policy/einstellung';
import type { VermittlungEreignis } from '../core/learning/vermittlung-ereignis';
import type { SicherungsInhalt } from '../core/sicherung/sicherung';

export interface Profil {
  readonly id: string;
  readonly erstellt: number;
}

/** Projektion `einstellungen`: aktueller Wert je Profil und Schlüssel. */
export interface Einstellung {
  readonly profil: string;
  readonly schluessel: string;
  readonly wert: unknown;
  readonly ts: number;
}

/** Automatische, lokale Sicherung vor Import oder Migration (D-8). */
export interface LokaleSicherung {
  readonly id: string;
  readonly erstellt: number;
  readonly anlass: 'import' | 'migration';
  readonly inhalt: SicherungsInhalt;
}

/** Projektion `bastion` je Profil (DATENMODELL §5) */
export interface BastionStand extends Bastion {
  readonly profil: string;
}

export interface MetaEintrag {
  readonly schluessel: string;
  readonly wert: string;
}

/** Schemaversion 1 vollständig nach DATENMODELL §6. */
export const SCHEMA_1 = {
  aufgaben: 'id, [profil+ts], [profil+tag], [profil+vorlage+niveau], sitzung',
  sitzungen: 'id, [profil+ts], [profil+tag]',
  buchungen: 'id, [profil+ts], [profil+ressource]',
  bau: 'id, [profil+ts], gebaeude',
  einstellungen_ereignisse: 'id, [profil+schluessel+ts]',
  verdichtungen: 'id, [profil+bis]',
  karten: '[profil+vorlage+niveau], [profil+faellig]',
  kompetenzen: '[profil+kompetenz+niveau], [profil+status]',
  wochen: '[profil+woche]',
  konto: 'profil',
  bastion: 'profil',
  einstellungen: '[profil+schluessel]',
  profile: 'id',
  pakete: 'id',
  meta: 'schluessel',
  sicherungen: 'id, erstellt',
} as const;

/** Tabellen, die Schemaversion 2 ergänzt. */
export const SCHEMA_2 = {
  vermittlungen: 'id, [profil+ts], [profil+kompetenz]',
} as const;

export class BastionDatenbank extends Dexie {
  aufgaben!: Table<AufgabeEreignis, string>;
  sitzungen!: Table<SitzungEreignis, string>;
  buchungen!: Table<BuchungEreignis, string>;
  konto!: Table<Konto, string>;
  bau!: Table<BauEreignis, string>;
  bastion!: Table<BastionStand, string>;
  kompetenzen!: Table<KompetenzStand, [string, string, string]>;
  karten!: Table<Karte, [string, string, string]>;
  profile!: Table<Profil, string>;
  einstellungen_ereignisse!: Table<EinstellungEreignis, string>;
  vermittlungen!: Table<VermittlungEreignis, string>;
  einstellungen!: Table<Einstellung, [string, string]>;
  meta!: Table<MetaEintrag, string>;
  sicherungen!: Table<LokaleSicherung, string>;

  constructor(name = 'bastion', optionen?: DexieOptions) {
    super(name, optionen);
    // Schemaversion 1 vollständig nach DATENMODELL §6 – auch Tabellen, die
    // erst später gefüllt werden, damit dafür keine Migration nötig ist.
    this.version(1).stores(SCHEMA_1);
    // Schemaversion 2 (U3a, DATENMODELL §6.2): neue Tabelle für das Ereignis
    // `vermittlung` (D-16). Vorhandene Ereignisse bleiben unverändert, deshalb
    // braucht es keine Upgrade-Funktion und keine Sicherung vorab (D-8).
    this.version(2).stores(SCHEMA_2);
  }
}
