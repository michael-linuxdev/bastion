/**
 * Unförmige Insel (Wunsch PV, 03.11.2026): „Die Insel darf auch unförmig sein, wobei ein
 * nicht bebaubarer Teil über das bisherige Viereck hinausgeht.“ Und: „Bäume stehen zum
 * Teil im Wasser.“
 *
 * Der Bauplatz bleibt das Viereck (mit seiner Einfassung, eine Feldreihe rundherum).
 * Darum liegt ein Rand aus Land mit freier Küstenlinie: Buchten und Landzungen, mindestens
 * `RAND_MIN` Felder über die Einfassung hinaus. Dort stehen Bäume, Büsche und Steine; bauen
 * kann man dort nicht. Die Form folgt fest aus Bauplatzgröße und Szenerie-Startwert
 * (§18.2) – kein Zufall zur Laufzeit. Rein: keine Browser-APIs.
 */

export interface FeldPunkt {
  readonly gx: number;
  readonly gy: number;
}

/** Wie weit der Rand mindestens bzw. höchstens über die Einfassung hinausreicht (Felder) */
export const RAND_MIN = 1.1;
export const RAND_MAX = 3.4;
/** Punkte der Küstenlinie */
const PUNKTE = 96;

/** Feste Mischzahl 0 … 1 */
function misch(k: number, szenerie: number): number {
  const h = (Math.imul(k + 17, 2654435761) ^ Math.imul(szenerie + 3, 2246822519)) >>> 0;
  return ((h >>> 9) % 10000) / 10000;
}

/**
 * Küstenlinie im Uhrzeigersinn (Feldkoordinaten). `zusatz` legt die Linie weiter hinaus,
 * z. B. für den Strand vor dem Gras.
 */
export function inselRand(
  breite: number,
  tiefe: number,
  szenerie = 0,
  zusatz = 0,
): readonly FeldPunkt[] {
  // Einfassung: eine Feldreihe rund um den Bauplatz (Bodenkacheln -1 … breite)
  const x0 = -1;
  const y0 = -1;
  const x1 = breite + 1;
  const y1 = tiefe + 1;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  // Wellen der Küste: drei Sinuswellen mit festen, vom Startwert abhängigen Phasen
  const wellen = [0, 1, 2].map((i) => ({
    n: 2 + Math.floor(misch(10 + i, szenerie) * (3 + i * 2)),
    phase: misch(20 + i, szenerie) * Math.PI * 2,
    stark: [0.5, 0.32, 0.18][i] ?? 0.2,
  }));
  const aus: FeldPunkt[] = [];
  for (let k = 0; k < PUNKTE; k++) {
    const winkel = (k / PUNKTE) * Math.PI * 2;
    const dx = Math.cos(winkel);
    const dy = Math.sin(winkel);
    // Abstand von der Mitte bis zum Rand des Rechtecks in dieser Richtung
    const tx = Math.abs(dx) > 1e-9 ? (x1 - mx) / Math.abs(dx) : Infinity;
    const ty = Math.abs(dy) > 1e-9 ? (y1 - my) / Math.abs(dy) : Infinity;
    const r0 = Math.min(tx, ty);
    let w = 0;
    for (const welle of wellen) w += Math.sin(winkel * welle.n + welle.phase) * welle.stark;
    // w liegt in −1 … 1 → Abstand zwischen RAND_MIN und RAND_MAX
    const weg = RAND_MIN + ((w + 1) / 2) * (RAND_MAX - RAND_MIN) + zusatz;
    aus.push({ gx: mx + dx * (r0 + weg), gy: my + dy * (r0 + weg) });
  }
  return aus;
}

/** Liegt ein Punkt (Felder) innerhalb der Küstenlinie? (Strahlverfahren) */
export function aufInsel(p: FeldPunkt, rand: readonly FeldPunkt[]): boolean {
  let innen = false;
  for (let i = 0, j = rand.length - 1; i < rand.length; j = i++) {
    const a = rand[i];
    const b = rand[j];
    if (!a || !b) continue;
    if (
      a.gy > p.gy !== b.gy > p.gy &&
      p.gx < ((b.gx - a.gx) * (p.gy - a.gy)) / (b.gy - a.gy) + a.gx
    )
      innen = !innen;
  }
  return innen;
}
