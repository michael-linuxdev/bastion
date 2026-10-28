// Bittet den Browser, die Daten dieser App nicht von selbst zu löschen
// (ARCHITEKTUR T-1). Manche Browser entscheiden still, Firefox fragt nach.
export async function dauerhaftenSpeicherAnfragen(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}

/** Hat der Browser zugesagt, die Daten zu behalten? (Anzeige im Elternbereich) */
export async function istDauerhaft(): Promise<boolean> {
  return (await navigator.storage?.persisted?.().catch(() => false)) ?? false;
}
