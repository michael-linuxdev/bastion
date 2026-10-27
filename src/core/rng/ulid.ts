import type { ZufallsQuelle } from './zufallsquelle';

/**
 * ULID-Erzeugung (DATENMODELL §3.2, D-O1: eigene Umsetzung ohne Bibliothek).
 *
 * Aufbau nach https://github.com/ulid/spec: 26 Zeichen Crockford-Base32,
 * davon 10 Zeichen Zeitstempel (48 Bit, ms seit 1970) und 16 Zeichen Zufall
 * (80 Bit). IDs sind dadurch nach Erzeugungszeit sortierbar.
 *
 * Innerhalb derselben Millisekunde ist die Reihenfolge zufällig; Ereignisse
 * werden ohnehin nach `ts` sortiert.
 */

export type Ulid = string;

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ZEIT_MAX = 2 ** 48 - 1;

export function ulid(zeitMs: number, quelle: ZufallsQuelle): Ulid {
  if (!Number.isInteger(zeitMs) || zeitMs < 0 || zeitMs > ZEIT_MAX) {
    throw new RangeError(`ULID-Zeit muss eine Ganzzahl in [0, 2^48) sein, war ${zeitMs}`);
  }

  let zeit = '';
  let rest = zeitMs;
  for (let i = 0; i < 10; i++) {
    zeit = ALPHABET.charAt(rest % 32) + zeit;
    rest = Math.floor(rest / 32);
  }

  const bytes = new Uint8Array(10);
  quelle.fuelle(bytes);
  let zufall = '';
  let puffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    puffer = (puffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      zufall += ALPHABET.charAt((puffer >>> bits) & 31);
    }
    puffer &= (1 << bits) - 1;
  }

  return zeit + zufall;
}

/** Prüft die Form einer ULID (Länge, Alphabet, kein Überlauf). */
export function istUlid(wert: string): boolean {
  return /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(wert);
}
