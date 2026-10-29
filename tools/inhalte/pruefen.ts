// Prüft die Inhalte in content/ (INHALTSFORMAT §10.1, Punkte 1–3 und
// Verweise auf Generatoren). Läuft mit pnpm inhalte:pruefen und in pnpm test.
import { pruefeGraph, pruefeKompetenz, type Kompetenz } from '../../src/core/competence/kompetenz';
import {
  pruefeVorlage,
  type GeneratorAngaben,
  type GeneratorVorlage,
} from '../../src/core/learning/vorlage';
import {
  begriffskarte,
  fundstellen,
  unmarkiert,
  type Begriff,
} from '../../src/core/learning/begriffe';
import { pruefeAnleitung, type Anleitung } from '../../src/core/learning/anleitung';
import { pruefeVermittlung, type Vermittlung } from '../../src/core/learning/vermittlung';
import {
  pruefeFehlvorstellung,
  type Fehlvorstellung,
} from '../../src/core/learning/fehlvorstellung';
import {
  ladeAnleitungen,
  ladeBegriffe,
  ladeFehlvorstellungen,
  ladeKompetenzen,
  ladeVermittlungen,
  ladeVorlagen,
} from './laden';

/** Erklärungen kurz halten (L-7): höchstens so viele Wörter. */
export const ERKLAERUNG_WOERTER = 35;

export interface Pruefbericht {
  readonly fehler: string[];
  readonly kompetenzen: Kompetenz[];
  readonly vorlagen: GeneratorVorlage[];
  readonly begriffe: Begriff[];
  readonly anleitungen: Anleitung[];
  readonly vermittlungen: Vermittlung[];
  readonly fehlvorstellungen: Fehlvorstellung[];
}

const istText = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;

/** Wörterbuch prüfen: Pflichtfelder, eindeutige IDs und Formen, kurze Erklärungen. */
function pruefeBegriffe(daten: unknown): { fehler: string[]; begriffe: Begriff[] } {
  const fehler: string[] = [];
  const liste = (daten as { begriffe?: unknown } | undefined)?.begriffe;
  if (!Array.isArray(liste)) return { fehler: ['begriffe: Liste fehlt'], begriffe: [] };
  const begriffe: Begriff[] = [];
  const ids = new Set<string>();
  const formen = new Set<string>();
  for (const roh of liste as unknown[]) {
    const b = roh as Partial<Begriff> | null;
    const id = b?.id ?? '?';
    if (!b || !istText(b.id) || !/^[a-z0-9-]+$/.test(b.id)) fehler.push(`${id}: ungültige id`);
    if (!istText(b?.wort?.de)) fehler.push(`${id}: wort.de fehlt`);
    if (!istText(b?.erklaerung?.de)) fehler.push(`${id}: erklaerung.de fehlt`);
    else if (b.erklaerung.de.split(/\s+/).length > ERKLAERUNG_WOERTER)
      fehler.push(`${id}: Erklärung länger als ${ERKLAERUNG_WOERTER} Wörter (L-7)`);
    if (!Array.isArray(b?.formen) || b.formen.length === 0 || !b.formen.every(istText))
      fehler.push(`${id}: formen fehlen`);
    if (ids.has(id)) fehler.push(`${id}: id doppelt`);
    ids.add(id);
    for (const f of b?.formen ?? []) {
      if (formen.has(f)) fehler.push(`${id}: Form „${f}“ gehört schon zu einem anderen Begriff`);
      formen.add(f);
    }
    if (b && fehler.length === 0) begriffe.push(b as Begriff);
  }
  return { fehler, begriffe };
}

export function pruefeInhalte(
  inhaltsordner: string,
  generatoren: ReadonlyMap<string, GeneratorAngaben>,
  /** Bilder der Zeichen-Anleitungen: "id@version" → Anzahl */
  anleitungsBilder: ReadonlyMap<string, number> = new Map(),
): Pruefbericht {
  const fehler: string[] = [];
  const kompetenzen: Kompetenz[] = [];
  for (const d of ladeKompetenzen(inhaltsordner)) {
    if (d.lesefehler) {
      fehler.push(`${d.datei}: ${d.lesefehler}`);
      continue;
    }
    const f = pruefeKompetenz(d.daten, d.pfadTeile);
    fehler.push(...f.map((x) => `${d.datei}: ${x}`));
    if (f.length === 0) kompetenzen.push(d.daten as Kompetenz);
  }
  fehler.push(...pruefeGraph(kompetenzen));

  const nachId = new Map(kompetenzen.map((k) => [k.id, k]));
  const vorlagen: GeneratorVorlage[] = [];
  const vorlagenIds = new Set<string>();
  for (const v of ladeVorlagen(inhaltsordner)) {
    if (v.lesefehler) {
      fehler.push(`${v.datei}: ${v.lesefehler}`);
      continue;
    }
    const f = pruefeVorlage(v.daten, {
      dateiname: v.dateiname,
      ordnerKompetenz: v.ordnerKompetenz,
      kompetenzen: nachId,
      generatoren,
    });
    fehler.push(...f.map((x) => `${v.datei}: ${x}`));
    if (f.length === 0) {
      const vorlage = v.daten as GeneratorVorlage;
      if (vorlagenIds.has(vorlage.id)) fehler.push(`${v.datei}: Vorlagen-ID doppelt`);
      vorlagenIds.add(vorlage.id);
      vorlagen.push(vorlage);
    }
  }

  const anleitungen: Anleitung[] = [];
  for (const a of ladeAnleitungen(inhaltsordner)) {
    if (a.lesefehler) {
      fehler.push(`${a.datei}: ${a.lesefehler}`);
      continue;
    }
    const f = pruefeAnleitung(a.daten, {
      dateiname: a.dateiname,
      ordnerKompetenz: a.ordnerKompetenz,
      kompetenzen: nachId,
      bilder: anleitungsBilder,
    });
    fehler.push(...f.map((x) => `${a.datei}: ${x}`));
    if (f.length === 0) anleitungen.push(a.daten as Anleitung);
  }
  // Sobald eine Kompetenz mit zeichnen_erklaert Aufgaben hat, braucht sie auch eine Anleitung
  for (const k of kompetenzen)
    if (
      k.zeichnen_erklaert &&
      vorlagen.some((v) => v.kompetenz === k.id) &&
      !anleitungen.some((a) => a.kompetenz === k.id)
    )
      fehler.push(`${k.id}: zeichnen_erklaert, aber keine Anleitung (L-10)`);

  // Erstvermittlungen und Fehlerkatalog (INHALTSFORMAT §15, §16)
  const fvDateien = ladeFehlvorstellungen(inhaltsordner);
  const fvIds = new Set(
    fvDateien.flatMap((d) =>
      typeof (d.daten as { id?: unknown })?.id === 'string' ? [d.dateiname] : [],
    ),
  );
  const vorlagenInfo = new Map(
    vorlagen.map((v) => [v.id, { kompetenz: v.kompetenz, niveaus: v.niveaus }]),
  );
  const vermittlungen: Vermittlung[] = [];
  for (const d of ladeVermittlungen(inhaltsordner)) {
    if (d.lesefehler) {
      fehler.push(`${d.datei}: ${d.lesefehler}`);
      continue;
    }
    const f = pruefeVermittlung(d.daten, {
      ordnerKompetenz: d.pfadTeile.at(-1) ?? '',
      kompetenzen: nachId,
      vorlagen: vorlagenInfo,
      fehlvorstellungen: fvIds,
    });
    fehler.push(...f.map((x) => `${d.datei}: ${x}`));
    if (f.length === 0) vermittlungen.push(d.daten as Vermittlung);
  }
  const schritteJe = new Map(
    vermittlungen.map((v) => [v.kompetenz, new Set(v.schritte.map((s) => s.id))]),
  );
  const fehlvorstellungen: Fehlvorstellung[] = [];
  for (const d of fvDateien) {
    if (d.lesefehler) {
      fehler.push(`${d.datei}: ${d.lesefehler}`);
      continue;
    }
    const f = pruefeFehlvorstellung(d.daten, {
      dateiname: d.dateiname,
      kompetenzen: nachId,
      vorlagen: vorlagenIds,
      vermittlungen: schritteJe,
    });
    fehler.push(...f.map((x) => `${d.datei}: ${x}`));
    if (f.length === 0) fehlvorstellungen.push(d.daten as Fehlvorstellung);
  }
  // Fehlerbilder mit fv verweisen auf eine bekannte Fehlvorstellung (INHALTSFORMAT §16, F2)
  for (const v of vorlagen)
    for (const [fid, t] of Object.entries(v.fehlerbilder)) {
      const fv = (t as { fv?: unknown }).fv;
      if (fv !== undefined && !fvIds.has(String(fv)))
        fehler.push(
          `${v.id}: Fehlerbild ${fid} verweist auf unbekannte Fehlvorstellung ${String(fv)}`,
        );
    }

  // Fachbegriffe (L-7): bekannt, beim ersten Vorkommen je Text markiert, jeder genutzt
  const gelesen = ladeBegriffe(inhaltsordner);
  const geprueft = gelesen.lesefehler
    ? { fehler: [gelesen.lesefehler], begriffe: [] }
    : pruefeBegriffe(gelesen.daten);
  fehler.push(...geprueft.fehler.map((x) => `${gelesen.datei}: ${x}`));
  const karte = begriffskarte(geprueft.begriffe);
  const genutzt = new Set<string>();
  const textgruppen = [
    ...vorlagen.map((v) => ({
      id: v.id,
      texte: [v.text.aufgabe, ...v.hilfen, ...Object.values(v.fehlerbilder)],
    })),
    ...anleitungen.map((a) => ({ id: a.id, texte: [...a.schritte, ...a.pruefen] })),
    ...vermittlungen.map((v) => ({
      id: `${v.id} (Vermittlung)`,
      texte: v.schritte.map((s) => s.text),
    })),
    ...fehlvorstellungen.map((fv) => ({
      id: fv.id,
      texte: [fv.erklaerung.kurz, ...fv.erklaerung.lang, fv.gegenbeispiel],
    })),
  ];
  for (const v of textgruppen) {
    const texte = v.texte;
    for (const t of texte) {
      for (const f of fundstellen(t.de, karte)) {
        if (f.markiert && !f.begriff)
          fehler.push(`${v.id}: [[${f.form}]] steht nicht im Wörterbuch`);
        if (f.begriff) genutzt.add(f.begriff.id);
      }
      for (const f of unmarkiert(t.de, karte))
        fehler.push(
          `${v.id}: Fachbegriff „${f.form}“ beim ersten Vorkommen als [[${f.form}]] markieren (L-7): ${t.de}`,
        );
    }
  }
  for (const b of geprueft.begriffe)
    if (!genutzt.has(b.id)) fehler.push(`${gelesen.datei}: ${b.id} kommt in keiner Vorlage vor`);

  return {
    fehler,
    kompetenzen,
    vorlagen,
    begriffe: geprueft.begriffe,
    anleitungen,
    vermittlungen,
    fehlvorstellungen,
  };
}

/** Abdeckung je Kompetenz und Niveau: Anzahl Vorlagen (Ziel: mindestens 2, INHALTSFORMAT §10.1). */
export function abdeckung(bericht: Pruefbericht): Map<string, Record<string, number>> {
  const ergebnis = new Map<string, Record<string, number>>();
  for (const k of bericht.kompetenzen) {
    ergebnis.set(k.id, Object.fromEntries(Object.keys(k.niveaus).map((n) => [n, 0])));
  }
  for (const v of bericht.vorlagen) {
    const zeile = ergebnis.get(v.kompetenz);
    if (!zeile) continue;
    for (const n of v.niveaus) zeile[n] = (zeile[n] ?? 0) + 1;
  }
  return ergebnis;
}
