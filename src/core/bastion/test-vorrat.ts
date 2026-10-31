/**
 * Test-/Eltern-Vorrat: virtuelles Konto und Probe-Bastion nur im Speicher.
 * Ledger und Lernfortschritt bleiben unverändert (VISION R1/R3).
 */
import type { Konto } from '../ledger/buchung';
import {
  bastionEpoche,
  beginnHindernisse,
  freierPlatz,
  type Bastion,
  type BauHindernis,
} from './bauen';
import { bauplatzFuer } from './epochen';
import { kosten, type GebaeudeTyp, type Position } from './katalog';

/** Angezeigte Menge bei aktivem Test-Vorrat */
export const TEST_MENGE = 999_999;

/** Virtuelles Konto mit reichlich Rohstoffen (kein Ledger). */
export function testKonto(profil = 'probe'): Konto {
  const stand = {
    fleiss: TEST_MENGE,
    behalten: TEST_MENGE,
    koennen: TEST_MENGE,
    schritt: TEST_MENGE,
  } as const;
  return { profil, stand, erworben: { ...stand } };
}

/** Anzeige-Konto: Test oder echt. */
export function anzeigeKonto(echt: Konto, testAn: boolean): Konto {
  return testAn ? testKonto(echt.profil) : echt;
}

/** Vorrat für die Anzeige (große Zahl bei Test). */
export function anzeigeVorrat(echt: number, testAn: boolean): number {
  return testAn ? TEST_MENGE : echt;
}

/**
 * Probe-Bau nur im Speicher: Gebäude erscheint sofort fertig.
 * Keine Ereignisse, keine Buchungen.
 */
export function probeBeginnen(
  b: Bastion,
  konto: Konto,
  typ: GebaeudeTyp,
  ort: { readonly ausbau: string } | { readonly pos?: Position },
):
  | { readonly ok: true; readonly bastion: Bastion }
  | { readonly ok: false; readonly hindernisse: readonly BauHindernis[] } {
  const epoche = bastionEpoche(b, konto);
  const platz = bauplatzFuer(epoche);
  let zielOrt: { readonly ausbau: string } | { readonly pos: Position };
  if ('ausbau' in ort && typeof ort.ausbau === 'string') {
    zielOrt = { ausbau: ort.ausbau };
  } else {
    const pos = 'pos' in ort ? ort.pos : undefined;
    const frei = pos ?? freierPlatz(b, typ, platz);
    if (!frei) return { ok: false, hindernisse: ['belegt'] };
    zielOrt = { pos: frei };
  }
  const h = beginnHindernisse(b, konto, typ, zielOrt);
  if (h.length > 0) return { ok: false, hindernisse: h };

  const ausbau = 'ausbau' in zielOrt ? b.bauwerke.find((x) => x.id === zielOrt.ausbau) : undefined;
  const stufe = ausbau ? ausbau.stufe + 1 : 1;
  if (!kosten(typ, stufe)) return { ok: false, hindernisse: ['nicht-baubar'] };

  if (ausbau) {
    return {
      ok: true,
      bastion: {
        ...b,
        bauwerke: b.bauwerke.map((x) => (x.id === ausbau.id ? { ...x, stufe } : x)),
      },
    };
  }

  const pos = 'pos' in zielOrt ? zielOrt.pos : { x: 0, y: 0 };
  const id = `probe-${typ}-${pos.x}-${pos.y}-${stufe}-${b.bauwerke.length}`;
  return {
    ok: true,
    bastion: {
      ...b,
      bauwerke: [...b.bauwerke, { id, typ, stufe, pos }],
    },
  };
}
