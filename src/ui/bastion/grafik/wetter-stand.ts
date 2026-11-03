/**
 * Aktuelles Wetterbild für die Bühne: echt (Cache/Netz) oder offline aus Datum.
 */
import { wetterEcht, wetterKoord } from '../../plattform/ablage';
import type { Sonnenzeiten } from './sonne';
import { regenbogenAusDatum, wetterAusDatum, type WetterBild } from './wetter';
import { wetterHolen, type WetterStand } from './wetter-abruf';

export interface SzeneWetter {
  readonly bild: WetterBild;
  /** Regenbogen über der Insel (nach Regen, GRAFIK §4.3) */
  readonly regenbogen: boolean;
  readonly sonne?: Sonnenzeiten;
  readonly echt: boolean;
}

export async function szeneWetterLaden(jetzt = new Date()): Promise<SzeneWetter> {
  const an = await wetterEcht();
  if (!an)
    return { bild: wetterAusDatum(jetzt), regenbogen: regenbogenAusDatum(jetzt), echt: false };
  const koord = await wetterKoord();
  if (!koord)
    return { bild: wetterAusDatum(jetzt), regenbogen: regenbogenAusDatum(jetzt), echt: true };
  let stand: WetterStand | undefined;
  try {
    stand = await wetterHolen(koord);
  } catch {
    stand = undefined;
  }
  if (!stand)
    return { bild: wetterAusDatum(jetzt), regenbogen: regenbogenAusDatum(jetzt), echt: true };
  return {
    bild: stand.bild,
    regenbogen: stand.regenbogen ?? false,
    echt: true,
    ...(stand.sonne ? { sonne: stand.sonne } : {}),
  };
}
