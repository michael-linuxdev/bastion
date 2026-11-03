/**
 * Eigene Szenerie (Wunsch PV 03.11.2026): „Jeder Schüler kann zufällig eine Szenerie
 * generieren.“ Ein Startwert legt fest, welche Dinge in der Umgebung wo stehen und in
 * welcher Form. Gespeichert als Einstellung `basebau.szenerie` (Ereignis, wie die Kamera).
 * Nur Aussehen: keine Belohnung, nicht ans Lernen gebunden, jederzeit neu oder zurück (R1).
 */
import { szenerieSetzen, szenerieWahl } from '../plattform/ablage';
import { neuerSeed } from '../plattform/zufall';

export const szenerie = $state<{ startwert: number }>({ startwert: 0 });

/** Gespeicherten Startwert holen (beim Öffnen der Bastion) */
export function szenerieLaden(): void {
  void szenerieWahl()
    .then((w) => (szenerie.startwert = w))
    .catch(() => undefined);
}

/** Neue Szenerie würfeln: echter Zufall nur hier, beim Antippen (DATENMODELL §3.2) */
export async function szenerieWuerfeln(): Promise<void> {
  const neu = neuerSeed() >>> 0 || 1;
  szenerie.startwert = neu;
  await szenerieSetzen(neu).catch(() => undefined);
}

/** Zurück zur Grundszenerie */
export async function szenerieZurueck(): Promise<void> {
  szenerie.startwert = 0;
  await szenerieSetzen(0).catch(() => undefined);
}
