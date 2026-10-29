/**
 * Diagnose beim Einstieg (LEHRPLAN §7): adaptiver Gang durch den Kompetenzgraphen.
 *
 * Getestet wird jeweils die Kompetenz, deren Ergebnis am meisten entscheidet:
 * Wer sie kann, kann vermutlich auch ihre Voraussetzungen; wer sie nicht kann,
 * kann vermutlich auch nicht, was auf ihr aufbaut. So reichen wenige Aufgaben
 * für einen Überblick. Rein und wiederholbar: Der Zustand ergibt sich allein
 * aus den bisherigen Antworten.
 */
import type { Kompetenz } from '../competence/kompetenz';
import { empfohlen } from './empfehlung';

export const DIAGNOSE = {
  /** Aufgaben insgesamt (LEHRPLAN §7: höchstens 15 Minuten) … */
  hoechstens: 30,
  /** … in zwei Etappen. */
  etappe: 15,
} as const;

export type Urteil = 'kann' | 'kann-noch-nicht';

export interface Antwort {
  readonly kompetenz: string;
  readonly richtig: boolean;
}

export interface DiagnoseStand {
  /** Getestete Kompetenzen mit Urteil */
  readonly getestet: ReadonlyMap<string, Urteil>;
  /** Aus dem Graphen gefolgert (nicht selbst getestet) */
  readonly gefolgert: ReadonlyMap<string, Urteil>;
  /** Kompetenz, zu der die nächste Aufgabe gehört; undefined = fertig */
  readonly naechste?: string;
  readonly aufgaben: number;
  /** Ende der ersten Etappe erreicht (Pausenpunkt) */
  readonly etappenEnde: boolean;
}

type Graph = ReadonlyMap<string, Pick<Kompetenz, 'id' | 'voraussetzungen'>>;

function huelle(start: string, nachbarn: (id: string) => readonly string[]): Set<string> {
  const erreicht = new Set<string>();
  const offen = [...nachbarn(start)];
  for (let id = offen.pop(); id !== undefined; id = offen.pop()) {
    if (erreicht.has(id)) continue;
    erreicht.add(id);
    offen.push(...nachbarn(id));
  }
  return erreicht;
}

/**
 * Urteil über eine Kompetenz aus ihren Antworten: zwei richtig → kann;
 * zwei falsch → kann noch nicht; bei 1 : 1 entscheidet eine dritte Aufgabe.
 */
function urteil(antworten: readonly boolean[]): Urteil | undefined {
  const richtig = antworten.filter(Boolean).length;
  const falsch = antworten.length - richtig;
  if (richtig >= 2) return 'kann';
  if (falsch >= 2) return 'kann-noch-nicht';
  return undefined;
}

/** Zustand der Diagnose nach den bisherigen Antworten (in Reihenfolge). */
export function diagnose(
  kompetenzen: readonly Pick<Kompetenz, 'id' | 'voraussetzungen'>[],
  antworten: readonly Antwort[],
): DiagnoseStand {
  const graph: Graph = new Map(kompetenzen.map((k) => [k.id, k]));
  const voraus = (id: string) => (graph.get(id)?.voraussetzungen ?? []).filter((v) => graph.has(v));
  const nachfolger = new Map<string, string[]>();
  for (const k of kompetenzen)
    for (const v of voraus(k.id)) nachfolger.set(v, [...(nachfolger.get(v) ?? []), k.id]);
  const nach = (id: string) => nachfolger.get(id) ?? [];
  const vorfahren = new Map(kompetenzen.map((k) => [k.id, huelle(k.id, voraus)]));
  const nachkommen = new Map(kompetenzen.map((k) => [k.id, huelle(k.id, nach)]));

  const getestet = new Map<string, Urteil>();
  const gefolgert = new Map<string, Urteil>();
  const offen = (id: string) => !getestet.has(id) && !gefolgert.has(id);
  const folgere = (id: string, u: Urteil) => {
    const betroffen = u === 'kann' ? vorfahren.get(id) : nachkommen.get(id);
    for (const x of betroffen ?? []) if (offen(x)) gefolgert.set(x, u);
  };

  /** Nächste Kompetenz: entscheidet in beiden Fällen möglichst viel (wie eine Halbierung). */
  const waehle = (): string | undefined => {
    let beste: string | undefined;
    let wert = -1;
    for (const k of kompetenzen) {
      if (!offen(k.id)) continue;
      const a = [...(vorfahren.get(k.id) ?? [])].filter(offen).length;
      const d = [...(nachkommen.get(k.id) ?? [])].filter(offen).length;
      const w = Math.min(a, d) * 1000 + a + d; // erst ausgewogen, dann viel
      if (w > wert) [beste, wert] = [k.id, w];
    }
    return beste;
  };

  let aktuell = waehle();
  let bisher: boolean[] = [];
  for (const a of antworten) {
    if (a.kompetenz !== aktuell) continue; // gehört nicht (mehr) zum Gang
    bisher.push(a.richtig);
    const u = urteil(bisher);
    if (u && aktuell) {
      getestet.set(aktuell, u);
      folgere(aktuell, u);
      bisher = [];
      aktuell = waehle();
    }
  }
  const fertig = antworten.length >= DIAGNOSE.hoechstens;
  return {
    getestet,
    gefolgert,
    ...(!fertig && aktuell ? { naechste: aktuell } : {}),
    aufgaben: antworten.length,
    etappenEnde: antworten.length === DIAGNOSE.etappe,
  };
}

/** Sicher (getestet oder gefolgert)? */
export const kann = (s: DiagnoseStand, id: string) =>
  (s.getestet.get(id) ?? s.gefolgert.get(id)) === 'kann';

/** „Hier geht es weiter“ (L-5): Empfehlungen nach dem Diagnosestand, höchstens `anzahl`. */
export function empfehlungen(
  kompetenzen: readonly Pick<Kompetenz, 'id' | 'voraussetzungen'>[],
  s: DiagnoseStand,
  anzahl = 3,
): string[] {
  return empfohlen(kompetenzen, (id) => kann(s, id)).slice(0, anzahl);
}

/** Ab diesem Anteil sicherer Themen gilt eine Klasse als „sitzt“ (L-16). */
export const STAND_SCHWELLE = 0.7;

/**
 * Stand im Sinne einer Schulklasse nach einer klassenübergreifenden Diagnose
 * (L-16, Wiedereinstieg): die höchste Klasse, bis zu der in jeder Klasse
 * mindestens 70 % der entschiedenen Themen sitzen. Klassen ohne entschiedenes
 * Thema zählen nicht. 4 heißt: schon Klasse 5 sitzt noch nicht; undefined:
 * noch nichts entschieden.
 */
export function standKlasse(
  kompetenzen: readonly Pick<Kompetenz, 'id' | 'klassenstufe_typisch'>[],
  s: DiagnoseStand,
): number | undefined {
  const klassen = new Map<number, { kann: number; entschieden: number }>();
  for (const k of kompetenzen) {
    const u = s.getestet.get(k.id) ?? s.gefolgert.get(k.id);
    if (!u) continue;
    const c = Math.min(...k.klassenstufe_typisch);
    const z = klassen.get(c) ?? { kann: 0, entschieden: 0 };
    z.entschieden++;
    if (u === 'kann') z.kann++;
    klassen.set(c, z);
  }
  if (klassen.size === 0) return undefined;
  let stand = Math.min(...klassen.keys()) - 1;
  for (const c of [...klassen.keys()].sort((a, b) => a - b)) {
    const z = klassen.get(c);
    if (!z || z.kann / z.entschieden < STAND_SCHWELLE) break;
    stand = c;
  }
  return stand;
}
