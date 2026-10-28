// Baut aus content/ die Inhaltspakete (INHALTSFORMAT §10.2–10.3): ein
// Grundpaket mit allen Kompetenzen je Fach und ein Paket je Bereich mit den
// Vorlagen aller Niveaus, dazu ein Manifest mit Prüfsummen und Größen.
// Als Vite-Plugin: im Entwicklungsserver unter /packs/, im Build als Dateien.
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';
import { ladeBegriffe, ladeKompetenzen, ladeVorlagen } from './laden';

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

/** Alle Paketdateien als Name → Inhalt; das Manifest heißt manifest.json. */
export function bauePakete(inhaltsordner: string): Map<string, string> {
  const fehler: string[] = [];
  const kompetenzen = ladeKompetenzen(inhaltsordner).flatMap((d) => {
    if (d.lesefehler) fehler.push(`${d.datei}: ${d.lesefehler}`);
    return d.lesefehler ? [] : [d.daten as Bereichsdaten & { id: string }];
  });
  const vorlagen = ladeVorlagen(inhaltsordner).flatMap((v) => {
    if (v.lesefehler) fehler.push(`${v.datei}: ${v.lesefehler}`);
    return v.lesefehler ? [] : [{ daten: v.daten, bereich: v.pfadTeile[0] ?? '' }];
  });
  const begriffe = ladeBegriffe(inhaltsordner);
  if (begriffe.lesefehler) fehler.push(`${begriffe.datei}: ${begriffe.lesefehler}`);
  // Die vollständige Prüfung läuft in pnpm test; hier nur, was den Bau unmöglich macht.
  if (fehler.length > 0) throw new Error(`Inhalte nicht lesbar:\n${fehler.join('\n')}`);

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
  });
  const bereiche = [...new Set(vorlagen.map((v) => v.bereich))].sort();
  for (const bereich of bereiche) {
    lege(
      `mathematik.${bereich}`,
      {
        fach: 'mathematik',
        bereich,
        vorlagen: vorlagen.filter((v) => v.bereich === bereich).map((v) => v.daten),
      },
      bereich,
    );
  }
  dateien.set('manifest.json', JSON.stringify({ format: PAKETFORMAT, pakete: eintraege }));
  return dateien;
}

export function inhaltsPakete(inhaltsordner = 'content'): Plugin {
  return {
    name: 'bastion-inhaltspakete',
    configureServer(server) {
      server.watcher.add(inhaltsordner);
      server.middlewares.use((anfrage, antwort, weiter) => {
        const m = /\/packs\/([\w.-]+\.json)$/.exec(anfrage.url?.split('?')[0] ?? '');
        const inhalt = m?.[1] ? bauePakete(inhaltsordner).get(m[1]) : undefined;
        if (!inhalt) {
          weiter();
          return;
        }
        antwort.setHeader('Content-Type', 'application/json; charset=utf-8');
        antwort.end(inhalt);
      });
    },
    generateBundle() {
      for (const [datei, inhalt] of bauePakete(inhaltsordner))
        this.emitFile({ type: 'asset', fileName: `packs/${datei}`, source: inhalt });
    },
  };
}
