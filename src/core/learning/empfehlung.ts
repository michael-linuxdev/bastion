/**
 * Empfehlungen entlang des Graphen (LEHRPLAN §7, L-5) – gesperrt wird nichts.
 * Rein: Was „sitzt“, entscheidet die aufrufende Stelle (Status oder Diagnose).
 */
import type { Kompetenz } from '../competence/kompetenz';

type Knoten = Pick<Kompetenz, 'id' | 'voraussetzungen'>;

/** Empfohlen: sitzt noch nicht, aber alle Voraussetzungen sitzen (in der gegebenen Reihenfolge). */
export function empfohlen(
  kompetenzen: readonly Knoten[],
  sitzt: (id: string) => boolean,
): string[] {
  const ids = new Set(kompetenzen.map((k) => k.id));
  return kompetenzen
    .filter(
      (k) => !sitzt(k.id) && k.voraussetzungen.filter((v) => ids.has(v)).every((v) => sitzt(v)),
    )
    .map((k) => k.id);
}

/** Ab so vielen falschen Antworten in Folge schlägt die App eine Voraussetzung vor. */
export const RUECKWEG_AB = 3;

/**
 * Rückweg bei Fehlern (LEHRPLAN §7): Scheitert jemand wiederholt, wird gezielt eine
 * Voraussetzung vorgeschlagen, die noch nicht sitzt – die grundlegendste zuerst.
 * undefined, wenn keine passt (dann hilft eher die Fehlerwerkstatt oder eine Pause).
 */
export function rueckweg(
  kompetenz: string,
  kompetenzen: readonly Knoten[],
  sitzt: (id: string) => boolean,
  fehlerInFolge: number,
): string | undefined {
  if (fehlerInFolge < RUECKWEG_AB) return undefined;
  const nachId = new Map(kompetenzen.map((k) => [k.id, k]));
  // Breitensuche über die Voraussetzungen: nahe zuerst, dann die grundlegendste offene
  const offen: string[] = [];
  const gesehen = new Set<string>();
  let ebene = nachId.get(kompetenz)?.voraussetzungen.filter((v) => nachId.has(v)) ?? [];
  while (ebene.length > 0) {
    const naechste: string[] = [];
    for (const id of ebene) {
      if (gesehen.has(id)) continue;
      gesehen.add(id);
      if (!sitzt(id)) offen.push(id);
      naechste.push(...(nachId.get(id)?.voraussetzungen.filter((v) => nachId.has(v)) ?? []));
    }
    ebene = naechste;
  }
  // Die tiefste offene Voraussetzung: auf ihr baut alles Weitere auf
  return offen.at(-1);
}
