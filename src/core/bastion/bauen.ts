/**
 * Bauen (BASEBAU §4.2, DATENMODELL §4.4): Ereignis „bau“ und Projektion
 * `bastion`. Darf nur aus `src/core/ledger/` importieren (K-1). Rein: IDs,
 * Zeit und Lerntag reicht die App herein.
 *
 * Planen → Beginnen → Fertigstellen:
 * - Beginnen bucht Stein, Erz und Baupläne ab (Buchung `bau-beginn`) und nimmt
 *   Bauschritte aus dem Vorrat, so viele das Vorhaben braucht.
 * - Ein neuer Bauschritt wirkt auf **jedes** aktive Vorhaben (B-7); läuft keines,
 *   kommt er in den Vorrat.
 * - Abbrechen gibt alles zurück (B-8): Stein, Erz, Baupläne als Buchung
 *   `bau-abbruch`, die Bauschritte in den Vorrat.
 * - Versetzen kostet nichts.
 *
 * Bauschritt-Vorrat und Fortschritt stehen nicht als Buchungen im Ledger,
 * sondern werden hier aus allen Ereignissen berechnet. So bleibt alles richtig,
 * wenn ein Bauschritt später mit früherer Zeit eintrifft (nachgetragene Sitzung,
 * zweites Gerät).
 */
import { BUCHUNG_V, buchungsId, type BuchungEreignis, type Konto } from '../ledger/buchung';
import type { Ressource } from '../ledger/regeln';
import {
  BAUPLATZ,
  hindernisse,
  KATALOG,
  kosten,
  START,
  type Bauwerk,
  type GebaeudeTyp,
  type Hindernis,
  type Position,
} from './katalog';

/** Schemaversion der Ereignisart `bau` (DATENMODELL §6.2). */
export const BAU_V = 1;

export interface BauEreignis {
  readonly id: string;
  readonly art: 'bau';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly tag: string;
  readonly geraet: string;
  readonly aktion: 'beginnen' | 'abbrechen' | 'fertigstellen' | 'versetzen';
  /** bei beginnen, abbrechen, fertigstellen */
  readonly vorhaben?: string;
  /** Instanz-ID des Gebäudes; bei einem Neubau gleich der Vorhaben-ID */
  readonly gebaeude: string;
  readonly typ: GebaeudeTyp;
  /** Zielstufe */
  readonly stufe?: number;
  readonly pos?: Position;
}

export interface Vorhaben {
  readonly id: string;
  readonly gebaeude: string;
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  readonly bedarf: number;
  readonly fortschritt: number;
  /** Bauschritte, die beim Abbruch in den Vorrat zurückgehen (s. u.) */
  readonly erstattbar: number;
  readonly begonnen: number;
}

export interface Fertig {
  readonly vorhaben: string;
  readonly gebaeude: string;
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly ts: number;
  /** schon als Ereignis `fertigstellen` festgehalten (für die Geschichte der Bastion) */
  readonly gemeldet: boolean;
}

/** Projektion `bastion` (DATENMODELL §5) */
export interface Bastion {
  readonly bauwerke: readonly Bauwerk[];
  readonly vorhaben: readonly Vorhaben[];
  readonly fertig: readonly Fertig[];
  /** Bauschritte, die auf ein Vorhaben warten */
  readonly vorrat: number;
}

/** Ereignisse für die Projektion: Bau-Ereignisse und Bauschritt-Gutschriften */
type Eintrag =
  | { readonly art: 'gutschrift'; readonly ts: number; readonly id: string; readonly menge: number }
  | BauEreignis;

const reihenfolge = (a: Eintrag, b: Eintrag) =>
  a.ts - b.ts ||
  // bei gleicher Zeit zuerst die Gutschrift – sie stammt aus der Sitzung davor
  (a.art === b.art ? 0 : a.art === 'gutschrift' ? -1 : 1) ||
  (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Bastion aus allen Bau-Ereignissen und Buchungen neu aufbauen. Ereignisse
 * werden genommen, wie sie sind – auch wenn nach dem Zusammenführen zweier
 * Geräte etwas nicht mehr zusammenpasst (DATENMODELL §7.3); geprüft wird
 * beim Erzeugen neuer Ereignisse.
 */
export function bastionAus(
  bau: readonly BauEreignis[],
  buchungen: readonly BuchungEreignis[],
): Bastion {
  const eintraege: Eintrag[] = [
    ...bau,
    ...buchungen
      .filter((b) => b.ressource === 'schritt' && b.menge > 0)
      .map((b) => ({ art: 'gutschrift' as const, ts: b.ts, id: b.id, menge: b.menge })),
  ].sort(reihenfolge);

  const bauwerke = new Map<string, Bauwerk>(START.map((b) => [b.id, b]));
  let vorhaben: Vorhaben[] = [];
  const fertig = new Map<string, Fertig>();
  const gemeldet = new Set<string>();
  let vorrat = 0;

  const abschliessen = (v: Vorhaben, ts: number) => {
    vorhaben = vorhaben.filter((x) => x.id !== v.id);
    const alt = bauwerke.get(v.gebaeude);
    bauwerke.set(v.gebaeude, {
      id: v.gebaeude,
      typ: v.typ,
      stufe: v.stufe,
      pos: alt?.pos ?? v.pos,
    });
    fertig.set(v.id, {
      vorhaben: v.id,
      gebaeude: v.gebaeude,
      typ: v.typ,
      stufe: v.stufe,
      ts,
      gemeldet: gemeldet.has(v.id),
    });
  };

  for (const e of eintraege) {
    if (e.art === 'gutschrift') {
      for (let i = 0; i < e.menge; i++) {
        if (vorhaben.length === 0) {
          vorrat++;
          continue;
        }
        // Wirkt auf jedes aktive Vorhaben (B-7). Zurückgegeben wird beim Abbruch
        // nur, was ein Vorhaben allein bekam – sonst entstünde der Schritt doppelt.
        const allein = vorhaben.length === 1;
        vorhaben = vorhaben.map((v) => ({
          ...v,
          fortschritt: v.fortschritt + 1,
          erstattbar: v.erstattbar + (allein ? 1 : 0),
        }));
        for (const v of vorhaben.filter((x) => x.fortschritt >= x.bedarf)) abschliessen(v, e.ts);
      }
      continue;
    }
    switch (e.aktion) {
      case 'beginnen': {
        const stufe = e.stufe ?? 1;
        const bedarf = kosten(e.typ, stufe)?.schritt ?? 0;
        const genommen = Math.min(vorrat, bedarf);
        vorrat -= genommen;
        const v: Vorhaben = {
          id: e.vorhaben ?? e.id,
          gebaeude: e.gebaeude,
          typ: e.typ,
          stufe,
          pos: e.pos ?? bauwerke.get(e.gebaeude)?.pos ?? { x: 0, y: 0 },
          bedarf,
          fortschritt: genommen,
          erstattbar: genommen,
          begonnen: e.ts,
        };
        vorhaben.push(v);
        if (v.fortschritt >= v.bedarf) abschliessen(v, e.ts);
        break;
      }
      case 'abbrechen': {
        const v = vorhaben.find((x) => x.id === e.vorhaben);
        if (v) {
          vorrat += v.erstattbar;
          vorhaben = vorhaben.filter((x) => x.id !== v.id);
        }
        break;
      }
      case 'fertigstellen': {
        if (!e.vorhaben) break;
        gemeldet.add(e.vorhaben);
        const f = fertig.get(e.vorhaben);
        if (f) fertig.set(e.vorhaben, { ...f, gemeldet: true });
        break;
      }
      case 'versetzen': {
        if (!e.pos) break;
        const pos = e.pos;
        const b = bauwerke.get(e.gebaeude);
        if (b) bauwerke.set(b.id, { ...b, pos });
        vorhaben = vorhaben.map((v) => (v.gebaeude === e.gebaeude ? { ...v, pos } : v));
        break;
      }
    }
  }
  return {
    bauwerke: [...bauwerke.values()],
    vorhaben,
    fertig: [...fertig.values()].sort((a, b) => a.ts - b.ts),
    vorrat,
  };
}

/** Wie viele Vorhaben gleichzeitig: eines, mit fertiger Zimmerei zwei (§4.2). */
export const plaetze = (b: Bastion) => (b.bauwerke.some((x) => x.typ === 'werkstatt') ? 2 : 1);

export type BauHindernis =
  | Hindernis
  | 'kein-freier-bauplatz'
  | 'wird-schon-gebaut'
  | 'ausserhalb'
  | 'belegt'
  | `zu-wenig-${'fleiss' | 'behalten' | 'koennen'}`;

/** Felder, die ein Gebäude an `pos` belegt */
function felder(typ: GebaeudeTyp, pos: Position): string[] {
  const [w, t] = KATALOG[typ].groesse;
  const f: string[] = [];
  for (let x = pos.x; x < pos.x + w; x++)
    for (let y = pos.y; y < pos.y + t; y++) f.push(`${x},${y}`);
  return f;
}

/** Passt ein Gebäude an `pos` – im Bauplatz und ohne Überlappung (außer mit sich selbst)? */
export function platzHindernisse(
  b: Bastion,
  typ: GebaeudeTyp,
  pos: Position,
  ohne?: string,
): BauHindernis[] {
  const [w, t] = KATALOG[typ].groesse;
  if (pos.x < 0 || pos.y < 0 || pos.x + w > BAUPLATZ.breite || pos.y + t > BAUPLATZ.tiefe)
    return ['ausserhalb'];
  const belegt = new Set<string>();
  for (const x of b.bauwerke) if (x.id !== ohne) felder(x.typ, x.pos).forEach((f) => belegt.add(f));
  // Neubauten belegen ihren Platz schon während des Bauens
  for (const v of b.vorhaben)
    if (v.gebaeude !== ohne && v.stufe === 1) felder(v.typ, v.pos).forEach((f) => belegt.add(f));
  return felder(typ, pos).some((f) => belegt.has(f)) ? ['belegt'] : [];
}

/** Erstes freies Feld für ein Gebäude, Reihe für Reihe von oben links – oder undefined. */
export function freierPlatz(b: Bastion, typ: GebaeudeTyp): Position | undefined {
  for (let y = 0; y < BAUPLATZ.tiefe; y++)
    for (let x = 0; x < BAUPLATZ.breite; x++)
      if (platzHindernisse(b, typ, { x, y }).length === 0) return { x, y };
  return undefined;
}

/**
 * Was spricht gegen ein neues Bauvorhaben? `ausbau`: Instanz-ID des Gebäudes,
 * das eine Stufe höher soll; sonst Neubau an `pos`. Leere Liste = möglich.
 */
export function beginnHindernisse(
  b: Bastion,
  konto: Konto,
  typ: GebaeudeTyp,
  ort: { readonly ausbau: string } | { readonly pos: Position },
): BauHindernis[] {
  const ausbau = 'ausbau' in ort ? b.bauwerke.find((x) => x.id === ort.ausbau) : undefined;
  const h: BauHindernis[] = [...hindernisse(typ, b.bauwerke, ausbau)];
  // Ein Neubau, der schon läuft, zählt für die Höchstzahl mit
  if (!ausbau && !h.includes('hoechstzahl')) {
    const max = KATALOG[typ].hoechstens;
    const zahl =
      b.bauwerke.filter((x) => x.typ === typ).length +
      b.vorhaben.filter((v) => v.typ === typ && v.stufe === 1).length;
    if (max !== undefined && zahl >= max) h.push('hoechstzahl');
  }
  if (b.vorhaben.length >= plaetze(b)) h.push('kein-freier-bauplatz');
  if (ausbau && b.vorhaben.some((v) => v.gebaeude === ausbau.id)) h.push('wird-schon-gebaut');
  if ('pos' in ort) h.push(...platzHindernisse(b, typ, ort.pos));
  const k = kosten(typ, ausbau ? ausbau.stufe + 1 : 1);
  if (k)
    for (const r of ['fleiss', 'behalten', 'koennen'] as const)
      if (konto.stand[r] < k[r]) h.push(`zu-wenig-${r}`);
  return h;
}

export interface Bauangaben {
  readonly profil: string;
  readonly geraet: string;
  /** neue Ereignis-ID (ULID der App) */
  readonly id: string;
  readonly jetzt: number;
  readonly tag: string;
}

const ereignis = (
  a: Bauangaben,
  teil: Omit<BauEreignis, 'id' | 'art' | 'v' | 'profil' | 'ts' | 'tag' | 'geraet'>,
): BauEreignis => ({
  id: a.id,
  art: 'bau',
  v: BAU_V,
  profil: a.profil,
  ts: a.jetzt,
  tag: a.tag,
  geraet: a.geraet,
  ...teil,
});

/** Buchungen für Stein, Erz und Baupläne eines Vorhabens: Abbuchung oder Erstattung. */
function kostenBuchungen(
  a: Bauangaben,
  vorhaben: string,
  typ: GebaeudeTyp,
  stufe: number,
  grund: 'bau-beginn' | 'bau-abbruch',
): BuchungEreignis[] {
  const k = kosten(typ, stufe);
  if (!k) return [];
  const vorzeichen = grund === 'bau-beginn' ? -1 : 1;
  return (['fleiss', 'behalten', 'koennen'] as const satisfies readonly Ressource[])
    .filter((r) => k[r] > 0)
    .map((r) => {
      const bezug = `${grund}.${vorhaben}`;
      return {
        id: buchungsId(a.profil, { ressource: r, bezug }),
        art: 'buchung' as const,
        v: BUCHUNG_V,
        profil: a.profil,
        ts: a.jetzt,
        tag: a.tag,
        geraet: a.geraet,
        ressource: r,
        menge: vorzeichen * k[r],
        grund,
        bezug,
        aufschluesselung: { [`${typ}`]: stufe },
        // Kosten stehen im Katalog, nicht in den Ertragsregeln
        regel: 1,
      };
    });
}

export type Ergebnis =
  | { readonly ok: true; readonly bau: BauEreignis; readonly buchungen: readonly BuchungEreignis[] }
  | { readonly ok: false; readonly hindernisse: readonly BauHindernis[] };

/** Bauvorhaben beginnen: Ereignis und Abbuchung – oder die Hindernisse. */
export function beginnen(
  b: Bastion,
  konto: Konto,
  typ: GebaeudeTyp,
  ort: { readonly ausbau: string } | { readonly pos: Position },
  a: Bauangaben,
): Ergebnis {
  const h = beginnHindernisse(b, konto, typ, ort);
  if (h.length > 0) return { ok: false, hindernisse: h };
  const ausbau = 'ausbau' in ort ? b.bauwerke.find((x) => x.id === ort.ausbau) : undefined;
  const stufe = ausbau ? ausbau.stufe + 1 : 1;
  const bau = ereignis(a, {
    aktion: 'beginnen',
    vorhaben: a.id,
    gebaeude: ausbau ? ausbau.id : a.id,
    typ,
    stufe,
    pos: ausbau ? ausbau.pos : 'pos' in ort ? ort.pos : { x: 0, y: 0 },
  });
  return { ok: true, bau, buchungen: kostenBuchungen(a, a.id, typ, stufe, 'bau-beginn') };
}

/** Laufendes Vorhaben abbrechen: alles zurück (B-8). */
export function abbrechen(b: Bastion, vorhaben: string, a: Bauangaben): Ergebnis {
  const v = b.vorhaben.find((x) => x.id === vorhaben);
  if (!v) return { ok: false, hindernisse: ['nicht-baubar'] };
  const bau = ereignis(a, {
    aktion: 'abbrechen',
    vorhaben,
    gebaeude: v.gebaeude,
    typ: v.typ,
    stufe: v.stufe,
  });
  return { ok: true, bau, buchungen: kostenBuchungen(a, vorhaben, v.typ, v.stufe, 'bau-abbruch') };
}

/** Gebäude oder laufenden Neubau kostenlos versetzen (§4.2). */
export function versetzen(b: Bastion, gebaeude: string, pos: Position, a: Bauangaben): Ergebnis {
  const ziel =
    b.bauwerke.find((x) => x.id === gebaeude) ?? b.vorhaben.find((v) => v.gebaeude === gebaeude);
  if (!ziel) return { ok: false, hindernisse: ['nicht-baubar'] };
  const h = platzHindernisse(b, ziel.typ, pos, gebaeude);
  if (h.length > 0) return { ok: false, hindernisse: h };
  return {
    ok: true,
    bau: ereignis(a, { aktion: 'versetzen', gebaeude, typ: ziel.typ, pos }),
    buchungen: [],
  };
}

/**
 * Fertige Vorhaben, die noch nicht als Ereignis festgehalten sind – damit die
 * Geschichte der Bastion („Am 12. März wurde der Bergfried Stufe 2 fertig“)
 * ohne Neuberechnung erzählbar bleibt (DATENMODELL §4.4). `ids` liefert je
 * Ereignis eine neue ID.
 */
export function fertigmeldungen(
  b: Bastion,
  a: Omit<Bauangaben, 'id' | 'jetzt' | 'tag'>,
  ids: () => string,
  tag: (ts: number) => string,
): BauEreignis[] {
  return b.fertig
    .filter((f) => !f.gemeldet)
    .map((f) =>
      ereignis(
        { ...a, id: ids(), jetzt: f.ts, tag: tag(f.ts) },
        {
          aktion: 'fertigstellen',
          vorhaben: f.vorhaben,
          gebaeude: f.gebaeude,
          typ: f.typ,
          stufe: f.stufe,
        },
      ),
    );
}
