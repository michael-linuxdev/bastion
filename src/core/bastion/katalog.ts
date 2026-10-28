/**
 * Gebäudekatalog der Epoche 1 „Außenposten“ (BASEBAU §4, §5). Reine Daten und
 * Regeln: Stufen, Kosten, Voraussetzungen, Bergfried-Grenze, Startzustand.
 * Darf nur aus `src/core/ledger/` importieren (K-1).
 *
 * Alle Zahlen sind Startwerte; der Simulator prüft sie (Schritt 2.11).
 * Namen und Beschreibungen stehen in der Textdatei (`gebaeude.<typ>`).
 */
import type { Ressource } from '../ledger/regeln';

export type GebaeudeTyp =
  | 'bergfried'
  | 'bauhuette'
  | 'studierstube'
  | 'spaeherturm'
  | 'tor'
  | 'palisade'
  | 'feuerstelle'
  | 'banner'
  | 'garten'
  | 'statue';

export type Familie = 'kern' | 'wissen' | 'verteidigung' | 'bau' | 'zierde';

export type Kosten = Readonly<Record<Ressource, number>>;

export interface Stufe {
  readonly kosten: Kosten;
  /** Weitere Voraussetzung neben der Bergfried-Grenze */
  readonly braucht?: { readonly typ: GebaeudeTyp; readonly stufe: number };
}

export interface Gebaeude {
  readonly typ: GebaeudeTyp;
  readonly familie: Familie;
  /** Fläche auf dem Bauplatz in Feldern (Breite × Tiefe), Draufsicht (B-11) */
  readonly groesse: readonly [number, number];
  /** Höchstzahl in Epoche 1; undefined = so viele, wie Platz ist */
  readonly hoechstens?: number;
  /** Stufen ab 1; `stufen[0]` ist Stufe 1. Leer = nicht baubar (nur im Startzustand) */
  readonly stufen: readonly Stufe[];
}

const k = (stein: number, erz = 0, bauplan = 0, bauschritt = 1): Kosten => ({
  stein,
  erz,
  bauplan,
  bauschritt,
});
const NICHTS = k(0, 0, 0, 0);
const BERGFRIED_2 = { typ: 'bergfried', stufe: 2 } as const;

/** Tabelle BASEBAU §5.2 */
export const KATALOG: Readonly<Record<GebaeudeTyp, Gebaeude>> = {
  bergfried: {
    typ: 'bergfried',
    familie: 'kern',
    groesse: [3, 3],
    hoechstens: 1,
    // Stufe 1 steht von Anfang an (§5.1)
    stufen: [{ kosten: NICHTS }, { kosten: k(250, 80, 2, 10) }, { kosten: k(500, 160, 4, 16) }],
  },
  bauhuette: {
    typ: 'bauhuette',
    familie: 'bau',
    groesse: [2, 2],
    hoechstens: 1,
    stufen: [{ kosten: k(150, 40, 1, 6), braucht: BERGFRIED_2 }],
  },
  studierstube: {
    typ: 'studierstube',
    familie: 'wissen',
    groesse: [2, 2],
    hoechstens: 1,
    stufen: [{ kosten: k(100, 30, 1, 6) }, { kosten: k(200, 60, 2, 10), braucht: BERGFRIED_2 }],
  },
  spaeherturm: {
    typ: 'spaeherturm',
    familie: 'verteidigung',
    groesse: [1, 1],
    hoechstens: 2,
    stufen: [{ kosten: k(100, 30, 1, 6) }, { kosten: k(200, 60, 2, 10), braucht: BERGFRIED_2 }],
  },
  tor: {
    typ: 'tor',
    familie: 'verteidigung',
    groesse: [1, 1],
    hoechstens: 1,
    stufen: [{ kosten: k(80, 20, 1, 5) }],
  },
  palisade: {
    typ: 'palisade',
    familie: 'verteidigung',
    groesse: [1, 1],
    // 4 von Anfang an, 8 weitere baubar
    hoechstens: 12,
    stufen: [{ kosten: k(15) }],
  },
  feuerstelle: {
    typ: 'feuerstelle',
    familie: 'zierde',
    groesse: [1, 1],
    hoechstens: 1,
    stufen: [],
  },
  // Das Banner reicht nach der ersten Lerneinheit (§5.1: etwa 10 Stein, 1 Bauschritt)
  banner: { typ: 'banner', familie: 'zierde', groesse: [1, 1], stufen: [{ kosten: k(10) }] },
  garten: { typ: 'garten', familie: 'zierde', groesse: [2, 2], stufen: [{ kosten: k(30) }] },
  statue: { typ: 'statue', familie: 'zierde', groesse: [1, 1], stufen: [{ kosten: k(40) }] },
};

export const GEBAEUDE_TYPEN = Object.keys(KATALOG) as readonly GebaeudeTyp[];

/** Bauplatz der Epoche 1 (§5.1) */
export const BAUPLATZ = { breite: 12, tiefe: 12 } as const;

export interface Position {
  readonly x: number;
  readonly y: number;
}

/** Ein Gebäude in der Bastion (Projektion `bastion`, DATENMODELL §5) */
export interface Bauwerk {
  /** Instanz-ID; im Startzustand fest, sonst die ID des Bauvorhabens */
  readonly id: string;
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
}

/** Startzustand (§5.1): Bergfried Stufe 1, Feuerstelle, 4 Palisaden-Segmente. */
export const START: readonly Bauwerk[] = [
  { id: 'start.bergfried', typ: 'bergfried', stufe: 1, pos: { x: 5, y: 4 } },
  { id: 'start.feuerstelle', typ: 'feuerstelle', stufe: 1, pos: { x: 6, y: 8 } },
  ...[4, 5, 7, 8].map((x) => ({
    id: `start.palisade.${x}`,
    typ: 'palisade' as const,
    stufe: 1,
    pos: { x, y: 10 },
  })),
];

/** Kosten, um ein Gebäude auf `stufe` zu bringen (Neubau = Stufe 1). */
export function kosten(typ: GebaeudeTyp, stufe: number): Kosten | undefined {
  return KATALOG[typ].stufen[stufe - 1]?.kosten;
}

export type Hindernis =
  'nicht-baubar' | 'hoechststufe' | 'hoechstzahl' | 'bergfried-zu-niedrig' | 'voraussetzung';

const bergfriedStufe = (bestand: readonly Bauwerk[]) =>
  Math.max(0, ...bestand.filter((b) => b.typ === 'bergfried').map((b) => b.stufe));

/**
 * Was spricht gegen ein Bauvorhaben – ohne Blick auf die Ressourcen (die prüft
 * das Bauen, Schritt 2.6)? `ausbau` ist das Bauwerk, das eine Stufe höher soll;
 * ohne `ausbau` ist ein Neubau gemeint. Leere Liste = möglich.
 */
export function hindernisse(
  typ: GebaeudeTyp,
  bestand: readonly Bauwerk[],
  ausbau?: Bauwerk,
): Hindernis[] {
  const g = KATALOG[typ];
  const ziel = ausbau ? ausbau.stufe + 1 : 1;
  const stufe = g.stufen[ziel - 1];
  if (g.stufen.length === 0) return ['nicht-baubar'];
  const h: Hindernis[] = [];
  if (!stufe) h.push('hoechststufe');
  if (!ausbau && g.hoechstens !== undefined) {
    if (bestand.filter((b) => b.typ === typ).length >= g.hoechstens) h.push('hoechstzahl');
  }
  // Kein Gebäude über der Stufe des Bergfrieds (§4.2)
  if (typ !== 'bergfried' && ziel > bergfriedStufe(bestand)) h.push('bergfried-zu-niedrig');
  const braucht = stufe?.braucht;
  if (braucht && !bestand.some((b) => b.typ === braucht.typ && b.stufe >= braucht.stufe))
    h.push('voraussetzung');
  return h;
}
