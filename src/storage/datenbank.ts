// Datenbank im Browser (IndexedDB über Dexie, T-4) mit dem Schema aus
// DATENMODELL §6. Zugriff von außen nur über die Funktionen in ablage.ts.
import { Dexie, type DexieOptions, type Table } from 'dexie';
import type { AufgabeEreignis } from '../core/learning/ereignis';
import type { KompetenzStand } from '../core/learning/fortschritt';
import type { Karte } from '../core/srs/karten';

export interface Profil {
  readonly id: string;
  readonly erstellt: number;
}

export interface MetaEintrag {
  readonly schluessel: string;
  readonly wert: string;
}

export class BastionDatenbank extends Dexie {
  aufgaben!: Table<AufgabeEreignis, string>;
  kompetenzen!: Table<KompetenzStand, [string, string, string]>;
  karten!: Table<Karte, [string, string, string]>;
  profile!: Table<Profil, string>;
  meta!: Table<MetaEintrag, string>;

  constructor(name = 'bastion', optionen?: DexieOptions) {
    super(name, optionen);
    // Schemaversion 1 vollständig nach DATENMODELL §6 – auch Tabellen, die
    // erst später gefüllt werden, damit dafür keine Migration nötig ist.
    this.version(1).stores({
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
    });
  }
}
