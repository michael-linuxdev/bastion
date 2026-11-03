/**
 * Aktuelles Wetterbild für die Bühne: echt (Cache/Netz) oder offline aus Datum.
 */
import { wetterEcht, wetterKoord } from '../../plattform/ablage';
import type { Sonnenzeiten } from './sonne';
import {
  regenbogenAusDatum,
  staerkeAusDatum,
  wetterAusDatum,
  type WetterBild,
  type WetterStaerke,
} from './wetter';
import { wetterHolen, type WetterStand } from './wetter-abruf';

export interface SzeneWetter {
  readonly bild: WetterBild;
  /** Wie dicht Regen, Schnee oder Nebel über dem ganzen Bild liegen */
  readonly staerke: WetterStaerke;
  /** Regenbogen über der Insel (nach Regen, GRAFIK §4.3) */
  readonly regenbogen: boolean;
  readonly sonne?: Sonnenzeiten;
  readonly echt: boolean;
}

export async function szeneWetterLaden(jetzt = new Date()): Promise<SzeneWetter> {
  const an = await wetterEcht();
  if (!an) return offline(jetzt, false);
  const koord = await wetterKoord();
  if (!koord) return offline(jetzt, true);
  let stand: WetterStand | undefined;
  try {
    stand = await wetterHolen(koord);
  } catch {
    stand = undefined;
  }
  if (!stand) return offline(jetzt, true);
  return {
    bild: stand.bild,
    staerke: stand.staerke ?? 'mittel',
    regenbogen: stand.regenbogen ?? false,
    echt: true,
    ...(stand.sonne ? { sonne: stand.sonne } : {}),
  };
}

function offline(jetzt: Date, echt: boolean): SzeneWetter {
  return {
    bild: wetterAusDatum(jetzt),
    staerke: staerkeAusDatum(jetzt),
    regenbogen: regenbogenAusDatum(jetzt),
    echt,
  };
}
