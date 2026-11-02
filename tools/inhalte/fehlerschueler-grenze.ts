// Sperrklinke für den Fehler-Schüler (B4, Entscheidung PV 01.11.2026): Die Zahl der
// Verdachtsfälle darf nicht steigen. Der Grenzwert steht je Art in
// tools/inhalte/fehlerschueler-grenze.json. Wer Funde behebt, senkt ihn im selben PR.
// Rein: arbeitet auf der Liste der Funde, keine Dateien.
import { VERDACHT_ARTEN, type Verdacht, type VerdachtArt } from './fehlerschueler';

export type Grenze = Readonly<Record<VerdachtArt, number>>;

export const ARTEN = Object.keys(VERDACHT_ARTEN) as VerdachtArt[];

/** Funde je Art */
export function zaehle(funde: readonly Verdacht[]): Grenze {
  const z = Object.fromEntries(ARTEN.map((a) => [a, 0])) as Record<VerdachtArt, number>;
  for (const f of funde) z[f.art] += 1;
  return z;
}

/** Grenzdatei lesen: je Art eine ganze Zahl ≥ 0, keine anderen Schlüssel. */
export function leseGrenze(json: unknown): Grenze {
  if (json === null || typeof json !== 'object' || Array.isArray(json))
    throw new Error('Grenzdatei ist kein Objekt');
  const o = json as Record<string, unknown>;
  const fremd = Object.keys(o).filter(
    (k) => k !== '$kommentar' && !ARTEN.includes(k as VerdachtArt),
  );
  if (fremd.length > 0) throw new Error(`Grenzdatei: unbekannte Schlüssel ${fremd.join(', ')}`);
  for (const a of ARTEN)
    if (!Number.isInteger(o[a]) || (o[a] as number) < 0)
      throw new Error(`Grenzdatei: ${a} muss eine ganze Zahl ≥ 0 sein`);
  return Object.fromEntries(ARTEN.map((a) => [a, o[a] as number])) as Grenze;
}

export interface Vergleich {
  /** Arten, bei denen es mehr Funde gibt als erlaubt: CI wird rot */
  readonly gestiegen: readonly { art: VerdachtArt; jetzt: number; grenze: number }[];
  /** Arten mit weniger Funden: Grenze im selben PR senken */
  readonly gesunken: readonly { art: VerdachtArt; jetzt: number; grenze: number }[];
}

export function vergleiche(jetzt: Grenze, grenze: Grenze): Vergleich {
  const zeilen = ARTEN.map((art) => ({ art, jetzt: jetzt[art], grenze: grenze[art] }));
  return {
    gestiegen: zeilen.filter((z) => z.jetzt > z.grenze),
    gesunken: zeilen.filter((z) => z.jetzt < z.grenze),
  };
}

/** Meldung für die Konsole; `ok` ist false, sobald eine Art gestiegen ist. */
export function meldung(v: Vergleich): { readonly ok: boolean; readonly text: string } {
  const z: string[] = [];
  for (const g of v.gestiegen)
    z.push(
      `Fehler-Schüler: Art ${g.art} (${VERDACHT_ARTEN[g.art]}) hat ${g.jetzt} Funde, erlaubt sind ${g.grenze}. Neue Funde beheben (pnpm fehlerschueler zeigt sie).`,
    );
  for (const g of v.gesunken)
    z.push(
      `Fehler-Schüler: Art ${g.art} hat nur noch ${g.jetzt} Funde (Grenze ${g.grenze}). Bitte in tools/inhalte/fehlerschueler-grenze.json auf ${g.jetzt} senken.`,
    );
  if (z.length === 0) z.push('Fehler-Schüler: Zahl der Funde wie in der Grenzdatei.');
  return { ok: v.gestiegen.length === 0, text: `${z.join('\n')}\n` };
}
