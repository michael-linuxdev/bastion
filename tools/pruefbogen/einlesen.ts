// Eingaben des Online-Prüfbogens einlesen (FOKUS F3, Punkt 3):
//   pnpm pruefbogen einlesen <datei.json> > arbeitsliste.md
// Die Datei ist der Export der Sammlung `bewertung` der Prüfseite (ein Dokument je Abschnitt,
// `{ werte, stand }`). Daraus entsteht eine Arbeitsliste in Markdown: je Abschnitt Urteil,
// Prüffragen und Anmerkung, dazu die betroffenen Dateien. Für Dateien, deren Abschnitt
// „passt“, schlägt sie `pnpm review setzen --stufe 2` vor. Sie setzt nichts selbst
// (INHALTSFORMAT §8: Stufe 2 bleibt eine bewusste Handlung des PV).
import { wirksameStufe } from '../../src/core/learning/review';
import type { Inhaltsdatei } from '../review/dateien';

export type Urteil = 'passt' | 'aendern' | 'falsch';

export interface Abschnitt {
  /** z. B. `A-M.ZO.BR.BEGRIFF`, `B-FV.BR.ADDITIV`, `C-M.ZO.BR.ERWEITERN.KUERZEN`, `D-begriffe` */
  readonly id: string;
  readonly urteil?: Urteil;
  readonly notiz?: string;
  /** Prüffragen f0, f1, … mit Haken */
  readonly fragenAbgehakt: number;
  /** Zeilen-Häkchen (Aufgaben G1 …, Begriffe b1 …), die gesetzt sind */
  readonly zeilenAbgehakt: number;
  readonly stand?: string;
}

export interface Bewertung {
  readonly pruefer?: string;
  readonly schule?: string;
  readonly gesamt?: string;
  readonly abschnitte: readonly Abschnitt[];
}

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const text = (x: unknown) => (typeof x === 'string' && x.trim() !== '' ? x.trim() : undefined);

/**
 * Export lesen. Angenommen werden die üblichen Formen einer Dokumentliste:
 * `[{ id | doc_id, data: { werte, stand } }]`, `{ documents: [...] }` oder
 * `{ "<id>": { werte, stand } }`. Ein Dokument ohne `werte` gilt als die Werte selbst.
 */
export function leseExport(json: unknown): Bewertung {
  const roh: { id: string; daten: unknown }[] = [];
  const liste = Array.isArray(json)
    ? json
    : istObjekt(json) && Array.isArray(json['documents'])
      ? json['documents']
      : undefined;
  if (liste) {
    for (const d of liste) {
      if (!istObjekt(d)) continue;
      const id = text(d['id']) ?? text(d['doc_id']) ?? text(d['docId']);
      if (id) roh.push({ id, daten: d['data'] ?? d['daten'] ?? d });
    }
  } else if (istObjekt(json)) {
    for (const [id, daten] of Object.entries(json)) roh.push({ id, daten });
  } else throw new Error('Unbekanntes Format: weder Liste noch Objekt');

  let kopf: Record<string, unknown> = {};
  const abschnitte: Abschnitt[] = [];
  for (const { id, daten } of roh) {
    if (!istObjekt(daten)) continue;
    const werte = istObjekt(daten['werte']) ? daten['werte'] : daten;
    if (id === 'kopf') {
      kopf = werte;
      continue;
    }
    if (!/^[A-D]-/.test(id)) continue;
    const urteil = werte['urteil'];
    const notiz = text(werte['notiz']);
    const stand = text(daten['stand']);
    abschnitte.push({
      id,
      ...(urteil === 'passt' || urteil === 'aendern' || urteil === 'falsch' ? { urteil } : {}),
      ...(notiz ? { notiz } : {}),
      ...(stand ? { stand } : {}),
      fragenAbgehakt: Object.entries(werte).filter(([k, v]) => /^f\d+$/.test(k) && v === true)
        .length,
      zeilenAbgehakt: Object.entries(werte).filter(
        ([k, v]) => /^([GME]\d+|b\d+)$/.test(k) && v === true,
      ).length,
    });
  }
  // Reihenfolge wie im Bogen: Teil A, B, C, D, darin nach Kennung
  abschnitte.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const pruefer = text(kopf['name']);
  const schule = text(kopf['schule']);
  const gesamt = text(kopf['gesamt']);
  return {
    ...(pruefer ? { pruefer } : {}),
    ...(schule ? { schule } : {}),
    ...(gesamt ? { gesamt } : {}),
    abschnitte,
  };
}

/** Dateien, die ein Abschnitt prüft: A = kompetenz.yaml und vermittlung.yaml, B = Fehlvorstellung, C = Vorlage. */
export function dateienVon(abschnitt: string, alle: readonly Inhaltsdatei[]): Inhaltsdatei[] {
  const [teil, ...rest] = abschnitt.split('-');
  const id = rest.join('-');
  if (teil === 'A')
    return alle.filter(
      (d) => (d.art === 'kompetenz' || d.art === 'vermittlung') && d.kompetenz === id,
    );
  if (teil === 'B') return alle.filter((d) => d.art === 'fehlvorstellung' && d.id === id);
  if (teil === 'C') return alle.filter((d) => d.art === 'vorlage' && d.id === id);
  return [];
}

const URTEIL_TEXT: Readonly<Record<Urteil, string>> = {
  passt: 'passt',
  aendern: 'passt mit Änderung',
  falsch: 'falsch',
};

/** Name für die Kommandozeile: nur Buchstaben, Ziffern, Leerzeichen, Punkt und Bindestrich. */
const sichererName = (s: string) => s.replace(/[^\p{L}\p{N} .-]/gu, '').trim() || 'NAME';

/** Arbeitsliste als Markdown */
export function arbeitsliste(b: Bewertung, alle: readonly Inhaltsdatei[]): string {
  const z: string[] = ['# Prüfbogen: Arbeitsliste', ''];
  z.push(
    `Prüfende Person: ${b.pruefer ?? '(kein Name)'}${b.schule ? ` · ${b.schule}` : ''}`,
    `Abschnitte mit Urteil: ${b.abschnitte.filter((a) => a.urteil).length} von ${b.abschnitte.length}`,
    '',
  );
  if (b.gesamt) z.push('## Gesamturteil', '', `> ${b.gesamt.replace(/\n/g, '\n> ')}`, '');

  const vorschlag: string[] = [];
  const erstStufe1: string[] = [];
  const zuAendern: string[] = [];
  z.push('## Je Abschnitt', '');
  for (const a of b.abschnitte) {
    const dateien = dateienVon(a.id, alle);
    z.push(`### ${a.id}`, '');
    z.push(
      `- Urteil: **${a.urteil ? URTEIL_TEXT[a.urteil] : 'offen'}** · Prüffragen abgehakt: ${a.fragenAbgehakt}${a.zeilenAbgehakt ? ` · Zeilen abgehakt: ${a.zeilenAbgehakt}` : ''}`,
    );
    if (a.notiz) z.push(`- Anmerkung: ${a.notiz.replace(/\n/g, ' / ')}`);
    if (dateien.length > 0) z.push(`- Dateien: ${dateien.map((d) => `\`${d.datei}\``).join(', ')}`);
    else if (!a.id.startsWith('D-')) z.push('- Dateien: keine gefunden (Kennung veraltet?)');
    z.push('');
    if (a.urteil === 'passt')
      for (const d of dateien) {
        if (wirksameStufe(d.daten) >= 1) vorschlag.push(d.datei);
        else erstStufe1.push(d.datei);
      }
    else if (a.urteil) for (const d of dateien) zuAendern.push(`\`${d.datei}\` (${a.id})`);
  }

  z.push('## Vorschlag für Stufe 2', '');
  if (vorschlag.length === 0)
    z.push('Keine Datei: kein Abschnitt mit „passt“ und gültiger Stufe 1.', '');
  else
    z.push(
      'Nur ausführen, wenn der PV zustimmt. Das Werkzeug setzt nichts selbst.',
      '',
      '```sh',
      `pnpm review setzen --stufe 2 --pruefer "${sichererName(b.pruefer ?? '')}" \\`,
      ...vorschlag.map((d, i) => `  content/${d}${i < vorschlag.length - 1 ? ' \\' : ''}`),
      '```',
      '',
    );
  if (erstStufe1.length > 0)
    z.push(
      '## Passt, aber ohne gültige Stufe 1',
      '',
      'Diese Dateien wurden nach dem Vermerk geändert. Erst Stufe 1 neu setzen (Prüfkatalog, zweites Modell), dann Stufe 2.',
      '',
      ...erstStufe1.map((d) => `- \`${d}\``),
      '',
    );
  if (zuAendern.length > 0)
    z.push(
      '## Zu ändern („passt mit Änderung“ oder „falsch“)',
      '',
      'Zuerst ändern, dann neu Stufe 1, erst danach Stufe 2 (INHALTSFORMAT §8).',
      '',
      ...zuAendern.map((d) => `- ${d}`),
      '',
    );
  return z.join('\n');
}
