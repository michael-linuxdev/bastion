// Baut aus content/ die Inhaltspakete (INHALTSFORMAT §10.2–10.3): ein
// Grundpaket mit allen Kompetenzen je Fach und ein Paket je Bereich mit den
// Vorlagen aller Niveaus, dazu ein Manifest mit Prüfsummen und Größen.
// Der Fehlerkatalog gehört zum Fach (Grundpaket), Erstvermittlungen zum Bereich ihrer Kompetenz.
// Als Vite-Plugin: im Entwicklungsserver unter /packs/, im Build als Dateien.
// Mit einer Mindeststufe (BASTION_MINDESTSTUFE, ARCHITEKTUR T-20) kommen nur ganze
// Kompetenzen ab dieser Review-Stufe hinein (oeffentlich.ts).
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';
import {
  ladeAnleitungen,
  ladeBegriffe,
  ladeFehlvorstellungen,
  ladeKompetenzen,
  ladeVermittlungen,
  ladeVorlagen,
} from './laden';
import { mindeststufeAus, oeffentlicheAuswahl, type Mindeststufe } from './oeffentlich';

/** Version des Paketformats; steigt, wenn die App Pakete anders lesen muss. */
export const PAKETFORMAT = 1;

export interface PaketEintrag {
  readonly name: string;
  readonly datei: string;
  readonly bereich?: string;
  readonly groesse: number;
  readonly pruefsumme: string;
}

interface Bereichsdaten {
  bereich?: string;
}

type Daten = Record<string, unknown>;

/** Was die App vor dem Laden der Pakete über sie wissen darf (Startseite, Elternbereich). */
export interface PaketStand {
  readonly mindeststufe: Mindeststufe;
  /** Mindestens ein ausgelieferter Inhalt steht unter Stufe 2 (Vermerk „Entwurf“). */
  readonly entwurf: boolean;
  readonly kompetenzen: number;
}

/** Mindeststufe aus der Umgebung (BASTION_MINDESTSTUFE), Standard 0 = Werkstatt. */
export const mindeststufeDerUmgebung = (): Mindeststufe =>
  mindeststufeAus(process.env['BASTION_MINDESTSTUFE']);

/**
 * Alle Paketdateien als Name → Inhalt; das Manifest heißt manifest.json.
 * Mit `mindeststufe` > 0 nur öffentliche Kompetenzen (T-20).
 */
export function bauePakete(
  inhaltsordner: string,
  mindeststufe: Mindeststufe = 0,
): Map<string, string> {
  return paketeMitStand(inhaltsordner, mindeststufe).dateien;
}

export function paketeMitStand(
  inhaltsordner: string,
  mindeststufe: Mindeststufe = 0,
): { readonly dateien: Map<string, string>; readonly stand: PaketStand } {
  const fehler: string[] = [];
  const alleKompetenzen = ladeKompetenzen(inhaltsordner).flatMap((d) => {
    if (d.lesefehler) fehler.push(`${d.datei}: ${d.lesefehler}`);
    return d.lesefehler ? [] : [d.daten as Daten & Bereichsdaten & { id: string }];
  });
  const alleVorlagen = ladeVorlagen(inhaltsordner).flatMap((v) => {
    if (v.lesefehler) fehler.push(`${v.datei}: ${v.lesefehler}`);
    return v.lesefehler
      ? []
      : [{ daten: v.daten as Daten, bereich: v.pfadTeile[0] ?? '', kompetenz: v.ordnerKompetenz }];
  });
  const alleAnleitungen = ladeAnleitungen(inhaltsordner).flatMap((a) => {
    if (a.lesefehler) fehler.push(`${a.datei}: ${a.lesefehler}`);
    return a.lesefehler
      ? []
      : [{ daten: a.daten as Daten, bereich: a.pfadTeile[0] ?? '', kompetenz: a.ordnerKompetenz }];
  });
  const alleVermittlungen = ladeVermittlungen(inhaltsordner).flatMap((v) => {
    if (v.lesefehler) fehler.push(`${v.datei}: ${v.lesefehler}`);
    if (v.lesefehler) return [];
    const daten = v.daten as Daten;
    return [{ daten, bereich: v.pfadTeile[0] ?? '', kompetenz: String(daten['kompetenz'] ?? '') }];
  });
  const alleFehlvorstellungen = ladeFehlvorstellungen(inhaltsordner).flatMap((f) => {
    if (f.lesefehler) fehler.push(`${f.datei}: ${f.lesefehler}`);
    return f.lesefehler ? [] : [f.daten as Daten];
  });
  const begriffe = ladeBegriffe(inhaltsordner);
  if (begriffe.lesefehler) fehler.push(`${begriffe.datei}: ${begriffe.lesefehler}`);
  // Die vollständige Prüfung läuft in pnpm test; hier nur, was den Bau unmöglich macht.
  if (fehler.length > 0) throw new Error(`Inhalte nicht lesbar:\n${fehler.join('\n')}`);

  const auswahl = oeffentlicheAuswahl(
    {
      kompetenzen: alleKompetenzen,
      vorlagen: alleVorlagen,
      anleitungen: alleAnleitungen,
      vermittlungen: alleVermittlungen,
      fehlvorstellungen: alleFehlvorstellungen,
    },
    mindeststufe,
  );
  const drin = <T extends { kompetenz: string }>(x: T) => auswahl.kompetenzen.has(x.kompetenz);
  const kompetenzen = alleKompetenzen.filter((k) => auswahl.kompetenzen.has(k.id));
  const vorlagen = alleVorlagen.filter(drin);
  const anleitungen = alleAnleitungen.filter(drin);
  const vermittlungen = alleVermittlungen.filter(drin);
  const fehlvorstellungen = alleFehlvorstellungen.filter((f) =>
    auswahl.fehlvorstellungen.has(String(f['id'] ?? '')),
  );

  const dateien = new Map<string, string>();
  const eintraege: PaketEintrag[] = [];
  const lege = (name: string, inhalt: unknown, bereich?: string) => {
    const text = JSON.stringify({ format: PAKETFORMAT, ...(inhalt as object) });
    const pruefsumme = createHash('sha256').update(text).digest('hex');
    const datei = `${name}.${pruefsumme.slice(0, 10)}.json`;
    dateien.set(datei, text);
    eintraege.push({
      name,
      datei,
      ...(bereich ? { bereich } : {}),
      groesse: Buffer.byteLength(text),
      pruefsumme,
    });
  };

  lege('mathematik.grund', {
    fach: 'mathematik',
    kompetenzen,
    begriffe: (begriffe.daten as { begriffe?: unknown[] } | undefined)?.begriffe ?? [],
    fehlvorstellungen,
  });
  const bereiche = [...new Set(vorlagen.map((v) => v.bereich))].sort();
  for (const bereich of bereiche) {
    lege(
      `mathematik.${bereich}`,
      {
        fach: 'mathematik',
        bereich,
        vorlagen: vorlagen.filter((v) => v.bereich === bereich).map((v) => v.daten),
        anleitungen: anleitungen.filter((a) => a.bereich === bereich).map((a) => a.daten),
        vermittlungen: vermittlungen.filter((v) => v.bereich === bereich).map((v) => v.daten),
      },
      bereich,
    );
  }
  const stand: PaketStand = {
    mindeststufe,
    entwurf: auswahl.entwurf,
    kompetenzen: kompetenzen.length,
  };
  dateien.set(
    'manifest.json',
    JSON.stringify({ format: PAKETFORMAT, pakete: eintraege, ...stand }),
  );
  return { dateien, stand };
}

/** Virtuelles Modul mit dem Stand der Pakete, für die App vor dem ersten Laden. */
export const STAND_MODUL = 'virtual:bastion-paketstand';

export function inhaltsPakete(inhaltsordner = 'content'): Plugin {
  const stufe = mindeststufeDerUmgebung();
  const aufgeloest = `\0${STAND_MODUL}`;
  return {
    name: 'bastion-inhaltspakete',
    resolveId(quelle) {
      return quelle === STAND_MODUL ? aufgeloest : undefined;
    },
    load(modul) {
      if (modul !== aufgeloest) return undefined;
      const { stand } = paketeMitStand(inhaltsordner, stufe);
      return `export const paketStand = ${JSON.stringify(stand)};`;
    },
    configureServer(server) {
      server.watcher.add(inhaltsordner);
      server.middlewares.use((anfrage, antwort, weiter) => {
        const m = /\/packs\/([\w.-]+\.json)$/.exec(anfrage.url?.split('?')[0] ?? '');
        const inhalt = m?.[1] ? bauePakete(inhaltsordner, stufe).get(m[1]) : undefined;
        if (!inhalt) {
          weiter();
          return;
        }
        antwort.setHeader('Content-Type', 'application/json; charset=utf-8');
        antwort.end(inhalt);
      });
    },
    generateBundle() {
      for (const [datei, inhalt] of bauePakete(inhaltsordner, stufe))
        this.emitFile({ type: 'asset', fileName: `packs/${datei}`, source: inhalt });
    },
  };
}
