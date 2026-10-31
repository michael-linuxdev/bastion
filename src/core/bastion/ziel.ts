/**
 * Ziel vormerken (BASEBAU B-20): Das Kind merkt sich ein Bauvorhaben vor und
 * sieht, was dafür noch fehlt. Sparen wird sichtbare Vorfreude – ohne
 * Zeitvorgabe und ohne Tageszähler (R5). Gespeichert wird das Ziel als
 * Einstellung (`basebau.ziel`), nicht als Bau-Ereignis: Vormerken kostet nichts.
 */
import type { Konto } from '../ledger/buchung';
import {
  bastionEpoche,
  beginnHindernisse,
  freierPlatz,
  type BauHindernis,
  type Bastion,
} from './bauen';
import { bauplatzFuer } from './epochen';
import { GEBAEUDE_TYPEN, kosten, type GebaeudeTyp } from './katalog';

export interface Ziel {
  readonly typ: GebaeudeTyp;
  /** Zielstufe */
  readonly stufe: number;
  /** Ausbau: dieses Gebäude; Neubau: ohne */
  readonly gebaeude?: string;
  /** Neubau: so viele gab es beim Vormerken – erreicht, sobald eins mehr begonnen ist */
  readonly anzahl?: number;
}

const zahl = (b: Bastion, typ: GebaeudeTyp) =>
  [...b.bauwerke, ...b.lager].filter((x) => x.typ === typ).length +
  b.vorhaben.filter((v) => v.typ === typ && v.stufe === 1).length;

/** Ziel für einen Neubau oder den Ausbau eines Gebäudes. */
export function vormerken(b: Bastion, typ: GebaeudeTyp, ausbau?: string): Ziel {
  const g = ausbau ? b.bauwerke.find((x) => x.id === ausbau) : undefined;
  return g ? { typ, stufe: g.stufe + 1, gebaeude: g.id } : { typ, stufe: 1, anzahl: zahl(b, typ) };
}

/** Als Einstellungswert speichern und wieder lesen; Unlesbares gilt als kein Ziel. */
export const zielText = (z: Ziel) => JSON.stringify(z);
export function zielAus(wert: unknown): Ziel | undefined {
  if (typeof wert !== 'string' || wert === '') return undefined;
  try {
    const z = JSON.parse(wert) as Partial<Ziel>;
    if (!GEBAEUDE_TYPEN.includes(z.typ as GebaeudeTyp) || typeof z.stufe !== 'number')
      return undefined;
    return z as Ziel;
  } catch {
    return undefined;
  }
}

export interface Ziellage {
  /** begonnen oder fertig – das Ziel ist erledigt */
  readonly erreicht: boolean;
  /** was an Fleiß, Behalten, Können noch fehlt (Bauschritte braucht der Beginn nicht) */
  readonly fehlt: Readonly<Record<'fleiss' | 'behalten' | 'koennen', number>>;
  /** was sonst noch im Weg steht, z. B. „Kern zu niedrig“ oder „gerade wird gebaut“ */
  readonly hindernisse: readonly BauHindernis[];
}

export function ziellage(b: Bastion, konto: Konto, z: Ziel): Ziellage {
  const erreicht = z.gebaeude
    ? b.bauwerke.some((x) => x.id === z.gebaeude && x.stufe >= z.stufe) ||
      b.vorhaben.some((v) => v.gebaeude === z.gebaeude && v.stufe === z.stufe)
    : zahl(b, z.typ) > (z.anzahl ?? 0);
  const k = kosten(z.typ, z.stufe);
  const fehlt = {
    fleiss: Math.max(0, (k?.fleiss ?? 0) - konto.stand.fleiss),
    behalten: Math.max(0, (k?.behalten ?? 0) - konto.stand.behalten),
    koennen: Math.max(0, (k?.koennen ?? 0) - konto.stand.koennen),
  };
  const platz = bauplatzFuer(bastionEpoche(b, konto));
  const ort = z.gebaeude
    ? { ausbau: z.gebaeude }
    : { pos: freierPlatz(b, z.typ, platz) ?? { x: 0, y: 0 } };
  const hindernisse = erreicht
    ? []
    : beginnHindernisse(b, konto, z.typ, ort).filter((h) => !h.startsWith('zu-wenig-'));
  return { erreicht, fehlt, hindernisse };
}
