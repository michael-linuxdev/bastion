/**
 * Zufallszahlen mit Seed – die einzige Zufallsquelle für Kern und Generatoren.
 *
 * Gleicher Seed → gleiche Zahlenfolge, auf jedem Gerät und in jedem Browser.
 * Darauf beruht, dass eine Aufgabe aus `generator@version` + `seed`
 * jederzeit wieder erzeugt werden kann (INHALTSFORMAT I-6).
 *
 * Verfahren: sfc32 (schnell, gut verteilt, nur 32-Bit-Ganzzahlarithmetik),
 * Startzustand aus dem Seed über splitmix32. Nicht für Kryptografie gedacht.
 *
 * ACHTUNG: Jede Änderung an diesem Verfahren ändert alle erzeugten Aufgaben.
 * Die festen Erwartungswerte in rng.test.ts schützen davor.
 */

export interface Rng {
  /** Ganzzahl in [0, 2^32). */
  uint32(): number;
  /** Kommazahl in [0, 1). */
  zahl(): number;
  /** Ganzzahl in [min, max], beide Grenzen eingeschlossen, gleichverteilt. */
  int(min: number, max: number): number;
  /** Ein gleichverteilt gewähltes Element einer nicht leeren Liste. */
  pick<T>(liste: readonly T[]): T;
}

function splitmix32(zustand: number): () => number {
  let z = zustand >>> 0;
  return () => {
    z = (z + 0x9e3779b9) >>> 0;
    let t = z;
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return (t ^ (t >>> 15)) >>> 0;
  };
}

/** Erzeugt einen Zufallszahlengenerator. `seed` muss eine Ganzzahl in [0, 2^32) sein. */
export function rng(seed: number): Rng {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError(`Seed muss eine Ganzzahl in [0, 2^32) sein, war ${seed}`);
  }

  const start = splitmix32(seed);
  let a = start();
  let b = start();
  let c = start();
  let d = start();

  function uint32(): number {
    const t = (((a + b) >>> 0) + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) >>> 0;
    return t;
  }

  // Ein paar Runden verwerfen, damit ähnliche Seeds schnell auseinanderlaufen.
  for (let i = 0; i < 12; i++) uint32();

  function int(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
      throw new RangeError(`Ungültiger Bereich [${min}, ${max}]`);
    }
    const spanne = max - min + 1;
    if (spanne > 0x100000000) {
      throw new RangeError(`Bereich [${min}, ${max}] ist größer als 2^32`);
    }
    // Verwerfungsverfahren: kein Übergewicht kleiner Zahlen durch den Rest.
    const grenze = 0x100000000 - (0x100000000 % spanne);
    let x = uint32();
    while (x >= grenze) x = uint32();
    return min + (x % spanne);
  }

  return {
    uint32,
    zahl: () => uint32() / 0x100000000,
    int,
    pick<T>(liste: readonly T[]): T {
      if (liste.length === 0) throw new RangeError('pick: Liste ist leer');
      return liste[int(0, liste.length - 1)] as T;
    },
  };
}
