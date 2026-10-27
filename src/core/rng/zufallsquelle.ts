import { rng } from './rng';

/**
 * Schnittstelle, über die echter Zufall in den Kern kommt (DATENMODELL §3.2).
 * Der Kern nutzt keine Browser-APIs; die App reicht eine Quelle auf Basis von
 * `crypto.getRandomValues` herein, Tests eine Quelle mit festem Seed.
 */
export interface ZufallsQuelle {
  /** Füllt alle Bytes des Puffers mit Zufallswerten. */
  fuelle(bytes: Uint8Array): void;
}

/** Wiederholbare Quelle für Tests und Werkzeuge. Nicht für echte IDs verwenden. */
export function quelleAusSeed(seed: number): ZufallsQuelle {
  const r = rng(seed);
  return {
    fuelle(bytes) {
      for (let i = 0; i < bytes.length; i++) bytes[i] = r.uint32() & 0xff;
    },
  };
}
