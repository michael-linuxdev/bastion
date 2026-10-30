/**
 * Review-Stufen für Inhalte (INHALTSFORMAT §8).
 *
 * Das Feld ist optional. Fehlt es, oder passt der Hash nicht mehr zum Inhalt,
 * gilt Stufe 0 (Entwurf). Eine Änderung an irgendetwas außer `review` setzt
 * die wirksame Stufe damit auf 0 zurück. Bestehende Dateien ohne Feld bleiben
 * gültig.
 *
 * Rein: keine Dateien, kein Netz. Der Hash ist SHA-256 über den kanonischen
 * Inhalt, damit Werkzeug und App dieselbe Stufe ausrechnen.
 */

export const REVIEW_STUFEN = [1, 2, 3] as const;
export type ReviewStufe = (typeof REVIEW_STUFEN)[number];

/**
 * Öffentliche Seite erst ab dieser Stufe (INHALTSFORMAT §8).
 * Noch nicht erzwungen: die Seite folgt vorerst `main`.
 */
export const OEFFENTLICHE_MINDESTSTUFE: ReviewStufe = 2;

export interface Review {
  readonly stufe: ReviewStufe;
  /** JJJJ-MM-TT */
  readonly datum: string;
  /** Stufe 1: `maschine`. Stufe 2: Name. Stufe 3: Testrunde, z. B. `u4b`. */
  readonly pruefer: string;
  /** SHA-256, 64 kleine Hex-Zeichen, über den Inhalt ohne dieses Feld. */
  readonly hash: string;
}

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

const SCHLUESSEL = ['stufe', 'datum', 'pruefer', 'hash'] as const;

function datumGueltig(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [jahr = 0, monat = 0, tag = 0] = s.split('-').map(Number);
  const d = new Date(Date.UTC(jahr, monat - 1, tag));
  return d.getUTCFullYear() === jahr && d.getUTCMonth() === monat - 1 && d.getUTCDate() === tag;
}

/** Form des Blocks. Ein fehlendes Feld ist in Ordnung (Stufe 0). Der Hash wird hier nicht nachgerechnet. */
export function pruefeReview(review: unknown): string[] {
  if (review === undefined) return [];
  if (!istObjekt(review)) return ['review ist keine Zuordnung'];
  const f: string[] = [];
  for (const k of Object.keys(review)) {
    if (!SCHLUESSEL.includes(k as (typeof SCHLUESSEL)[number])) f.push(`review.${k} ist unbekannt`);
  }
  if (review['stufe'] !== 1 && review['stufe'] !== 2 && review['stufe'] !== 3)
    f.push('review.stufe muss 1, 2 oder 3 sein');
  if (typeof review['datum'] !== 'string' || !datumGueltig(review['datum']))
    f.push('review.datum muss ein echtes Datum JJJJ-MM-TT sein');
  const pruefer = review['pruefer'];
  if (
    typeof pruefer !== 'string' ||
    pruefer.trim() === '' ||
    pruefer.length > 80 ||
    /[\r\n]/.test(pruefer)
  )
    f.push('review.pruefer fehlt');
  if (typeof review['hash'] !== 'string' || !/^[0-9a-f]{64}$/.test(review['hash']))
    f.push('review.hash muss 64 kleine Hex-Zeichen sein');
  return f;
}

/** Objekt-Schlüssel sortiert, Arrays in ihrer Reihenfolge, ohne Leerzeichen. `undefined` entfällt. */
function kanonisch(wert: unknown): string {
  if (
    wert === null ||
    typeof wert === 'string' ||
    typeof wert === 'number' ||
    typeof wert === 'boolean'
  )
    return JSON.stringify(wert);
  if (Array.isArray(wert)) return `[${wert.map(kanonisch).join(',')}]`;
  if (typeof wert === 'object') {
    const o = wert as Record<string, unknown>;
    const teile = Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${kanonisch(o[k])}`);
    return `{${teile.join(',')}}`;
  }
  return 'null';
}

/** Kanonischer Text aller Felder außer `review`. */
export function kanonischerInhalt(daten: Record<string, unknown>): string {
  const ohne: Record<string, unknown> = {};
  for (const k of Object.keys(daten)) if (k !== 'review') ohne[k] = daten[k];
  return kanonisch(ohne);
}

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

/** UTF-8 ohne TextEncoder: der Kern darf keine Browser-API nutzen (T-2). */
function utf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const zeichen of text) {
    const cp = zeichen.codePointAt(0) ?? 0;
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000)
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
  }
  return Uint8Array.from(bytes);
}

/** SHA-256, kleine Hex-Zeichen. Reicht für Inhalts-Hashes; keine neue Abhängigkeit. */
export function sha256Hex(text: string): string {
  const daten = utf8(text);
  const bits = daten.length * 8;
  const laenge = Math.ceil((bits + 65) / 512) * 64;
  const puffer = new Uint8Array(laenge);
  puffer.set(daten);
  puffer[daten.length] = 0x80;
  const sicht = new DataView(puffer.buffer);
  sicht.setUint32(laenge - 8, Math.floor(bits / 0x100000000));
  sicht.setUint32(laenge - 4, bits >>> 0);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let i = 0; i < laenge; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = sicht.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const x15 = w[t - 15] ?? 0;
      const x2 = w[t - 2] ?? 0;
      const s0 = rotr(x15, 7) ^ rotr(x15, 18) ^ (x15 >>> 3);
      const s1 = rotr(x2, 17) ^ rotr(x2, 19) ^ (x2 >>> 10);
      w[t] = ((w[t - 16] ?? 0) + s0 + (w[t - 7] ?? 0) + s1) >>> 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + (K[t] ?? 0) + (w[t] ?? 0)) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => x.toString(16).padStart(8, '0')).join('');
}

/** Hash, der in `review.hash` gehört. */
export function reviewHash(daten: Record<string, unknown>): string {
  return sha256Hex(kanonischerInhalt(daten));
}

/**
 * Stufe, die gerade gilt. 0, wenn das Feld fehlt, kaputt ist oder der Hash
 * nach einer Änderung nicht mehr stimmt.
 */
export function wirksameStufe(daten: Record<string, unknown>): 0 | ReviewStufe {
  const review = daten['review'];
  if (pruefeReview(review).length > 0 || !istObjekt(review)) return 0;
  if (review['hash'] !== reviewHash(daten)) return 0;
  return review['stufe'] as ReviewStufe;
}
