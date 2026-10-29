// Liest alle Kompetenz-Dateien aus content/ (INHALTSFORMAT §2).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'yaml';

export interface GeleseneDatei {
  /** Pfad relativ zum Inhaltsordner, z. B. mathematik/…/kompetenz.yaml */
  readonly datei: string;
  /** Ordner unterhalb des Fachs: [bereich, feld, id] */
  readonly pfadTeile: readonly string[];
  readonly daten: unknown;
  /** Fehler beim Lesen (z. B. ungültiges YAML), sonst undefined */
  readonly lesefehler?: string;
}

function dateienMitNamen(ordner: string, name: string): string[] {
  return readdirSync(ordner, { withFileTypes: true }).flatMap((e) => {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) return dateienMitNamen(pfad, name);
    return e.name === name ? [pfad] : [];
  });
}

export function ladeKompetenzen(inhaltsordner: string): GeleseneDatei[] {
  return dateienMitNamen(join(inhaltsordner, 'mathematik'), 'kompetenz.yaml')
    .sort()
    .map((pfad) => {
      const datei = relative(inhaltsordner, pfad);
      // mathematik/<bereich>/<feld>/<id>/kompetenz.yaml → [bereich, feld, id]
      const pfadTeile = datei.split(sep).slice(1, -1);
      try {
        return { datei, pfadTeile, daten: parse(readFileSync(pfad, 'utf8')) as unknown };
      } catch (fehler) {
        return { datei, pfadTeile, daten: undefined, lesefehler: String(fehler) };
      }
    });
}

export interface GeleseneVorlage extends GeleseneDatei {
  /** Dateiname ohne Endung, z. B. "ziffer-an-stelle" */
  readonly dateiname: string;
  /** ID der Kompetenz, in deren Ordner die Vorlage liegt */
  readonly ordnerKompetenz: string;
}

/** Liest alle Vorlagen aus …/<Kompetenz-ID>/vorlagen/*.yaml */
export function ladeVorlagen(inhaltsordner: string): GeleseneVorlage[] {
  return ladeUnterordner(inhaltsordner, 'vorlagen');
}

/** Liest alle Zeichen-Anleitungen aus …/<Kompetenz-ID>/anleitungen/*.yaml (L-10) */
export function ladeAnleitungen(inhaltsordner: string): GeleseneVorlage[] {
  return ladeUnterordner(inhaltsordner, 'anleitungen');
}

function ladeUnterordner(inhaltsordner: string, unterordner: string): GeleseneVorlage[] {
  const alle = readdirSync(join(inhaltsordner, 'mathematik'), {
    recursive: true,
    withFileTypes: true,
  });
  return alle
    .filter(
      (e) =>
        e.isFile() && e.name.endsWith('.yaml') && e.parentPath.endsWith(`${sep}${unterordner}`),
    )
    .map((e) => join(e.parentPath, e.name))
    .sort()
    .map((pfad) => {
      const datei = relative(inhaltsordner, pfad);
      const teile = datei.split(sep);
      const dateiname = (teile.at(-1) ?? '').replace(/\.yaml$/, '');
      const ordnerKompetenz = teile.at(-3) ?? '';
      try {
        const daten = parse(readFileSync(pfad, 'utf8')) as unknown;
        return { datei, pfadTeile: teile.slice(1, -2), daten, dateiname, ordnerKompetenz };
      } catch (fehler) {
        return {
          datei,
          pfadTeile: teile.slice(1, -2),
          daten: undefined,
          lesefehler: String(fehler),
          dateiname,
          ordnerKompetenz,
        };
      }
    });
}

/** Liest alle Erstvermittlungen …/<Kompetenz-ID>/vermittlung.yaml (INHALTSFORMAT §15). */
export function ladeVermittlungen(inhaltsordner: string): GeleseneDatei[] {
  return ladeKompetenzen(inhaltsordner).flatMap((k) => {
    const pfad = join(inhaltsordner, k.datei.replace(/kompetenz\.yaml$/, 'vermittlung.yaml'));
    if (!existsSync(pfad)) return [];
    const datei = relative(inhaltsordner, pfad);
    try {
      return [
        { datei, pfadTeile: k.pfadTeile, daten: parse(readFileSync(pfad, 'utf8')) as unknown },
      ];
    } catch (fehler) {
      return [{ datei, pfadTeile: k.pfadTeile, daten: undefined, lesefehler: String(fehler) }];
    }
  });
}

/** Liest den Fehlerkatalog content/mathematik/fehlvorstellungen/*.yaml (INHALTSFORMAT §16). */
export function ladeFehlvorstellungen(
  inhaltsordner: string,
): (GeleseneDatei & { dateiname: string })[] {
  const ordner = join(inhaltsordner, 'mathematik', 'fehlvorstellungen');
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner)
    .filter((n) => n.endsWith('.yaml'))
    .sort()
    .map((name) => {
      const pfad = join(ordner, name);
      const datei = relative(inhaltsordner, pfad);
      const dateiname = name.replace(/\.yaml$/, '');
      try {
        return {
          datei,
          dateiname,
          pfadTeile: [],
          daten: parse(readFileSync(pfad, 'utf8')) as unknown,
        };
      } catch (fehler) {
        return { datei, dateiname, pfadTeile: [], daten: undefined, lesefehler: String(fehler) };
      }
    });
}

/** Liest das Wörterbuch der Fachbegriffe (INHALTSFORMAT §11.1). */
export function ladeBegriffe(inhaltsordner: string): GeleseneDatei {
  const datei = join('mathematik', 'begriffe.yaml');
  try {
    const daten = parse(readFileSync(join(inhaltsordner, datei), 'utf8')) as unknown;
    return { datei, pfadTeile: [], daten };
  } catch (fehler) {
    return { datei, pfadTeile: [], daten: undefined, lesefehler: String(fehler) };
  }
}
