// Bruchstreifen (VERMITTLUNG §2.3, Werkzeug bruchstreifen@1): ein Ganzes als
// Streifen, in Teile geteilt, Teile färbbar. Reine Logik; die Darstellung ist
// Bruchstreifen.svelte.

/** Parameter aus vermittlung.yaml (INHALTSFORMAT §15) */
export interface StreifenParameter {
  readonly teile?: number;
  readonly gefaerbt?: number;
  /** Knopf „Jedes Teil halbieren“ statt Teile frei wählen */
  readonly verfeinern?: boolean;
  /** Absichtlich ungleich große Teile (Gegenbeispiel) */
  readonly ungleich?: boolean;
}

export interface StreifenZustand {
  readonly teile: number;
  /** je Teil: gefärbt oder nicht */
  readonly gefaerbt: readonly boolean[];
}

export const MAX_TEILE = 24;

const ganz = (x: unknown, rueckfall: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= 0 ? x : rueckfall;

/** Anfangszustand: die ersten `gefaerbt` Teile sind gefärbt. */
export function startzustand(p: StreifenParameter): StreifenZustand {
  const teile = Math.min(MAX_TEILE, Math.max(1, ganz(p.teile, 1)));
  const gefaerbt = Math.min(teile, ganz(p.gefaerbt, 0));
  return { teile, gefaerbt: Array.from({ length: teile }, (_, i) => i < gefaerbt) };
}

/** Anzahl der Teile ändern; gefärbt bleiben höchstens so viele wie vorher, von vorn. */
export function geteilt(z: StreifenZustand, teile: number): StreifenZustand {
  const n = Math.min(MAX_TEILE, Math.max(1, teile));
  const vorher = anzahlGefaerbt(z);
  return { teile: n, gefaerbt: Array.from({ length: n }, (_, i) => i < Math.min(vorher, n)) };
}

/** Jedes Teil in `faktor` gleich große Teile zerlegen – der gefärbte Anteil bleibt (Erweitern). */
export function verfeinert(z: StreifenZustand, faktor = 2): StreifenZustand {
  if (z.teile * faktor > MAX_TEILE) return z;
  return {
    teile: z.teile * faktor,
    gefaerbt: z.gefaerbt.flatMap((g) => Array.from({ length: faktor }, () => g)),
  };
}

export function umgeschaltet(z: StreifenZustand, i: number): StreifenZustand {
  return { ...z, gefaerbt: z.gefaerbt.map((g, j) => (j === i ? !g : g)) };
}

export const anzahlGefaerbt = (z: StreifenZustand) => z.gefaerbt.filter(Boolean).length;

/**
 * Breiten der Teile als Anteile von 1. Bei `ungleich` ist das erste Teil
 * deutlich größer – damit man sieht, dass es kein echter Bruchteil ist.
 */
export function breiten(teile: number, ungleich = false): number[] {
  if (!ungleich || teile < 2) return Array.from({ length: teile }, () => 1 / teile);
  const erstes = 0.5;
  return [erstes, ...Array.from({ length: teile - 1 }, () => (1 - erstes) / (teile - 1))];
}
