/**
 * Abschluss einer Lerneinheit (KONZEPT §2, BASEBAU §6.1; PLAN 1a, Punkt 4):
 * „Was habe ich heute gekonnt?“ – aus den Ereignissen des Lerntags, ohne
 * Punkte, Prozente oder Ressourcen. Rein.
 */
import type { Niveau } from '../competence/kompetenz';
import type { Tag } from '../policy/lerntag';
import type { AufgabeEreignis } from './ereignis';
import type { KompetenzStand } from './fortschritt';

export interface Thema {
  readonly kompetenz: string;
  readonly niveau: Niveau;
}

export interface Tagesbilanz {
  /** Bearbeitete Aufgaben (ohne übersprungene) */
  readonly aufgaben: number;
  /** Geübte Themen, in der Reihenfolge des ersten Auftretens */
  readonly themen: readonly Thema[];
  /** Heute zum ersten Mal „gekonnt“ bzw. „gefestigt“ */
  readonly gekonnt: readonly Thema[];
  readonly gefestigt: readonly Thema[];
  /** In der Fehlerwerkstatt richtig korrigierte Fehler */
  readonly aufgearbeitet: number;
  /** Bearbeitete Wiederholungen */
  readonly wiederholt: number;
}

export function tagesbilanz(
  ereignisse: readonly AufgabeEreignis[],
  staende: readonly KompetenzStand[],
  tag: Tag,
): Tagesbilanz {
  const heute = ereignisse.filter((e) => e.tag === tag && e.ergebnis !== 'uebersprungen');
  const themen = new Map<string, Thema>();
  for (const e of heute)
    if (!themen.has(`${e.kompetenz}|${e.niveau}`))
      themen.set(`${e.kompetenz}|${e.niveau}`, { kompetenz: e.kompetenz, niveau: e.niveau });
  const thema = (s: KompetenzStand): Thema => ({ kompetenz: s.kompetenz, niveau: s.niveau });
  return {
    aufgaben: heute.length,
    themen: [...themen.values()],
    gekonnt: staende.filter((s) => s.gekonntAm === tag).map(thema),
    gefestigt: staende.filter((s) => s.gefestigtAm === tag).map(thema),
    aufgearbeitet: heute.filter((e) => e.korrigiert !== undefined && e.ergebnis === 'richtig')
      .length,
    wiederholt: heute.filter((e) => e.modus === 'wiederholen').length,
  };
}
