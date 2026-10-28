// Sicherungsdatei verschlüsseln und öffnen (DATENMODELL §7.1, D-9): gzip über
// die eingebaute CompressionStream-Schnittstelle, AES-GCM mit einem Schlüssel
// per PBKDF2 aus dem Sicherungscode – alles im Browser, ohne Fremdpaket.
import { normalisiereCode } from '../../core/rng/wortcode';
import {
  FORMAT,
  inhaltPruefen,
  IV_LAENGE,
  KOPF_LAENGE,
  kopfLesen,
  kopfSchreiben,
  SALZ_LAENGE,
  type SicherungsInhalt,
} from '../../core/sicherung/sicherung';
import type { Tag } from '../../core/policy/lerntag';

/** Sechs Wörter (48 Bit) und viele Durchläufe: Durchprobieren lohnt nicht (D-9). */
const ITERATIONEN = 600_000;

async function schluessel(code: string, salz: Uint8Array): Promise<CryptoKey> {
  const roh = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalisiereCode(code)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salz as BufferSource, iterations: ITERATIONEN },
    roh,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function durch(bytes: Uint8Array, strom: CompressionStream | DecompressionStream) {
  const aus = new Blob([bytes as BlobPart]).stream().pipeThrough(strom);
  return new Uint8Array(await new Response(aus).arrayBuffer());
}

/** Inhalt → Datei (Kopf offen, Rest verschlüsselt; der Kopf ist in die Prüfung einbezogen). */
export async function verschluesseln(
  inhalt: SicherungsInhalt,
  code: string,
  erstellt: Tag,
): Promise<Uint8Array> {
  const salz = crypto.getRandomValues(new Uint8Array(SALZ_LAENGE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LAENGE));
  const kopf = kopfSchreiben({ format: FORMAT, erstellt, salz, iv });
  const gepackt = await durch(
    new TextEncoder().encode(JSON.stringify(inhalt)),
    new CompressionStream('gzip'),
  );
  const geheim = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, additionalData: kopf as BufferSource },
    await schluessel(code, salz),
    gepackt as BufferSource,
  );
  const datei = new Uint8Array(KOPF_LAENGE + geheim.byteLength);
  datei.set(kopf, 0);
  datei.set(new Uint8Array(geheim), KOPF_LAENGE);
  return datei;
}

export type OeffnenFehler = 'keine-sicherung' | 'zu-neu' | 'falscher-code' | 'beschaedigt';

/** Datei → Inhalt. Ein falscher Code und eine veränderte Datei sind für AES-GCM dasselbe. */
export async function oeffnen(
  datei: Uint8Array,
  code: string,
): Promise<SicherungsInhalt | OeffnenFehler> {
  const kopf = kopfLesen(datei);
  if (typeof kopf === 'string') return kopf;
  let gepackt: ArrayBuffer;
  try {
    gepackt = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: kopf.iv as BufferSource,
        additionalData: datei.subarray(0, KOPF_LAENGE) as BufferSource,
      },
      await schluessel(code, kopf.salz),
      datei.subarray(KOPF_LAENGE) as BufferSource,
    );
  } catch {
    return 'falscher-code';
  }
  try {
    const text = new TextDecoder().decode(
      await durch(new Uint8Array(gepackt), new DecompressionStream('gzip')),
    );
    return inhaltPruefen(JSON.parse(text));
  } catch {
    return 'beschaedigt';
  }
}
