// Eltern-PIN (DATENMODELL §4.5, D-12; ARCHITEKTUR §7): PBKDF2 über WebCrypto.
// Ehrlich: Auf einem Gerät, das der Jugendliche kontrolliert, ist eine lokale
// PIN eine Hürde, keine Festung – das sagt die App auch so.
const ITERATIONEN = 150_000;

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const ausB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function ableiten(
  geheim: string,
  salz: Uint8Array,
  iterationen: number,
): Promise<Uint8Array> {
  const schluessel = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(geheim),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salz as BufferSource, iterations: iterationen },
    schluessel,
    256,
  );
  return new Uint8Array(bits);
}

/** Hash im Format "pbkdf2-sha256$Iterationen$Salz$Hash" (Base64). */
export async function hashe(geheim: string): Promise<string> {
  const salz = crypto.getRandomValues(new Uint8Array(16));
  const hash = await ableiten(geheim, salz, ITERATIONEN);
  return `pbkdf2-sha256$${ITERATIONEN}$${b64(salz)}$${b64(hash)}`;
}

export async function pruefe(geheim: string, gespeichert: string): Promise<boolean> {
  const [verfahren, iter, salz, hash] = gespeichert.split('$');
  if (verfahren !== 'pbkdf2-sha256' || !iter || !salz || !hash) return false;
  const neu = await ableiten(geheim, ausB64(salz), Number(iter));
  const alt = ausB64(hash);
  // Vergleich ohne frühes Abbrechen
  let unterschied = neu.length ^ alt.length;
  for (let i = 0; i < Math.min(neu.length, alt.length); i++)
    unterschied |= (neu[i] ?? 0) ^ (alt[i] ?? 0);
  return unterschied === 0;
}

/** PIN-Regel: 4 bis 8 Ziffern. */
export const pinGueltig = (pin: string) => /^\d{4,8}$/.test(pin);
