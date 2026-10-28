// Echter Zufall für neue Aufgaben – nur hier, nie im Kern (DATENMODELL §3.2).
export function neuerSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}
