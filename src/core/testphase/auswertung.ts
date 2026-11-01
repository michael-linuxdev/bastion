/**
 * Auswertung der Testprotokolle für U4b (FOKUS F4, TESTS.md §4.5): beantwortet
 * die messbaren Kriterien aus STRATEGIE §0 mit Ja oder Nein, statt nur Rohdaten
 * zu liefern. Rein: Protokolle werden hereingereicht, nichts wird gelesen.
 *
 * - Kriterium 1 (Vermitteln): Wer eine Erstvermittlung abgeschlossen hat, löst
 *   danach die Einstiegsaufgaben dieser Kompetenz ohne Hilfe. Mindestens 2 von 3.
 * - F5 (Diagnostizieren): Mindestens 80 % der falschen Antworten haben ein Fehlerbild.
 * - Dazu Zwischenschritte, „Weiter ohne Weg“ und abgebrochene Erstvermittlungen.
 */
import type { AufgabeEreignis } from '../learning/ereignis';
import type { VermittlungEreignis } from '../learning/vermittlung-ereignis';
import type { NutzungEreignis } from './nutzung';
import { PROTOKOLL_FORMAT, type ProtokollEreignis, type Testprotokoll } from './protokoll';

/** Einstiegsaufgaben (TESTS.md §4.5): die ersten 3 Aufgaben auf Niveau G nach der Erstvermittlung */
export const EINSTIEG_ANZAHL = 3;
export const EINSTIEG_NIVEAU = 'G';
/** Modi, in denen Einstiegsaufgaben zählen: freies Üben und Wiederholen, keine Diagnose */
const EINSTIEG_MODI: ReadonlySet<AufgabeEreignis['modus']> = new Set(['ueben', 'wiederholen']);
/** STRATEGIE §0, Kriterium 1: mindestens 2 von 3 Lernenden */
export const KRITERIUM1_ANTEIL = 2 / 3;
export const KRITERIUM1_MINDESTENS_PERSONEN = 3;
/** STRATEGIE §0, F5: mindestens 80 % der falschen Antworten mit Fehlerbild */
export const F5_SCHWELLE = 0.8;

type Aufgabe = Omit<AufgabeEreignis, 'profil' | 'geraet'>;
type Vermittlung = Omit<VermittlungEreignis, 'profil' | 'geraet'>;
type Nutzung = Omit<NutzungEreignis, 'profil' | 'geraet'>;

const istAufgabe = (e: ProtokollEreignis): e is Aufgabe => e.art === 'aufgabe';
const istVermittlung = (e: ProtokollEreignis): e is Vermittlung => e.art === 'vermittlung';
const istNutzung = (e: ProtokollEreignis): e is Nutzung => e.art === 'nutzung';

// ---------------------------------------------------------------------------
// Datei lesen und zusammenführen

/** Prüft eine eingelesene Datei; liefert das Protokoll oder einen Grund. */
export function protokollLesen(
  daten: unknown,
): { readonly protokoll: Testprotokoll } | { readonly fehler: string } {
  if (typeof daten !== 'object' || daten === null) return { fehler: 'keine JSON-Datei' };
  const d = daten as Partial<Record<keyof Testprotokoll, unknown>>;
  if (d.format !== PROTOKOLL_FORMAT)
    return { fehler: `Format ${String(d.format)} statt ${PROTOKOLL_FORMAT}` };
  if (typeof d.teilnehmer !== 'string' || d.teilnehmer === '')
    return { fehler: 'keine Teilnehmer-Nummer' };
  if (!Array.isArray(d.ereignisse)) return { fehler: 'keine Ereignisliste' };
  for (const e of d.ereignisse as unknown[]) {
    const x = e as { id?: unknown; art?: unknown; ts?: unknown } | null;
    if (
      typeof x !== 'object' ||
      x === null ||
      typeof x.id !== 'string' ||
      typeof x.art !== 'string' ||
      typeof x.ts !== 'number'
    )
      return { fehler: 'Ereignis ohne id, art oder ts' };
  }
  return { protokoll: daten as Testprotokoll };
}

/**
 * Mehrere Dateien derselben Person (zweimal exportiert) werden zu einer:
 * Ereignisse nach `id` ohne Doppelte, nach Zeit sortiert. Reihenfolge der
 * Personen wie die der ersten Datei je Nummer.
 */
export function zusammenfuehren(protokolle: readonly Testprotokoll[]): Testprotokoll[] {
  const je = new Map<string, Testprotokoll>();
  for (const p of protokolle) {
    const da = je.get(p.teilnehmer);
    if (!da) {
      je.set(p.teilnehmer, p);
      continue;
    }
    const nachId = new Map<string, ProtokollEreignis>();
    for (const e of [...da.ereignisse, ...p.ereignisse]) nachId.set(e.id, e);
    je.set(p.teilnehmer, {
      ...da,
      erstellt: da.erstellt > p.erstellt ? da.erstellt : p.erstellt,
      seit: Math.min(da.seit, p.seit),
      ereignisse: [...nachId.values()].sort(
        (x, y) => x.ts - y.ts || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0),
      ),
      unbekannteFehler: [],
    });
  }
  return [...je.values()];
}

// ---------------------------------------------------------------------------
// Je Person

export type EinstiegStatus =
  /** alle Einstiegsaufgaben richtig und ohne Hilfe */
  | 'geloest'
  /** mindestens eine falsch oder mit Hilfe */
  | 'nicht-geloest'
  /** noch keine 3 Aufgaben auf Niveau G seit der Erstvermittlung, alle bisher ohne Hilfe – zählt nicht */
  | 'zu-wenig'
  /** schon vor der Erstvermittlung geübt (außer falschen Diagnose-Aufgaben) – zählt nicht */
  | 'vorher-geuebt';

export interface EinstiegAufgabe {
  readonly vorlage: string;
  readonly ergebnis: Aufgabe['ergebnis'];
  readonly hilfen: number;
  readonly ohneHilfe: boolean;
}

export interface Einstieg {
  readonly kompetenz: string;
  readonly status: EinstiegStatus;
  readonly aufgaben: readonly EinstiegAufgabe[];
}

export interface Abbruch {
  readonly kompetenz: string;
  /** zuletzt beantworteter Schritt vor dem Verlassen; fehlt, wenn noch keiner beantwortet war */
  readonly schritt?: string;
}

export interface Schrittnutzung {
  /** falsche Aufgaben, bei denen Zwischenschritte bearbeitet wurden */
  readonly aufgabenMitWeg: number;
  readonly schritte: number;
  /** im ersten Versuch richtig */
  readonly ersterVersuch: number;
  /** im zweiten Versuch richtig */
  readonly zweiterVersuch: number;
  /** auch im zweiten Versuch falsch, Bastion zeigt den Schritt */
  readonly gezeigt: number;
  /** „Weiter ohne Weg“ */
  readonly ohneWeg: number;
}

export interface UnbekannteAntwort {
  readonly vorlage: string;
  readonly niveau: string;
  readonly platzhalter: unknown;
  readonly loesung: unknown;
  readonly antwort: unknown;
}

export interface PersonAuswertung {
  readonly teilnehmer: string;
  readonly aufgaben: number;
  /** Erstvermittlungen mit Abschluss */
  readonly vermittlungen: number;
  readonly einstieg: readonly Einstieg[];
  /** falsche Antworten außerhalb der Diagnose */
  readonly falsch: number;
  readonly mitFehlerbild: number;
  readonly unbekannt: readonly UnbekannteAntwort[];
  readonly schritte: Schrittnutzung;
  readonly abbrueche: readonly Abbruch[];
  readonly tipps: number;
  readonly loesungswege: number;
}

/** Ohne Hilfe: richtig, kein Tipp. Lösungsweg und Erklärung gibt es erst nach einer falschen Antwort. */
const ohneHilfe = (a: Aufgabe) => a.ergebnis === 'richtig' && a.hilfen === 0;

function einstiegFuer(
  kompetenz: string,
  abgeschlossen: number,
  aufgaben: readonly Aufgabe[],
): Einstieg {
  const dieser = aufgaben.filter((a) => a.kompetenz === kompetenz);
  // Eine falsche Diagnose-Aufgabe vorher zeigt gerade, dass das Thema neu war
  const vorher = (a: Aufgabe) =>
    a.ts < abgeschlossen && !(a.modus === 'diagnose' && a.ergebnis !== 'richtig');
  if (dieser.some(vorher)) return { kompetenz, status: 'vorher-geuebt', aufgaben: [] };
  const danach = dieser
    .filter(
      (a) => a.ts >= abgeschlossen && a.niveau === EINSTIEG_NIVEAU && EINSTIEG_MODI.has(a.modus),
    )
    .slice(0, EINSTIEG_ANZAHL)
    .map((a) => ({
      vorlage: a.vorlage,
      ergebnis: a.ergebnis,
      hilfen: a.hilfen,
      ohneHilfe: ohneHilfe(a),
    }));
  // Eine falsche oder mit Tipp gelöste Aufgabe entscheidet schon vor der dritten
  const status: EinstiegStatus = danach.some((a) => !a.ohneHilfe)
    ? 'nicht-geloest'
    : danach.length < EINSTIEG_ANZAHL
      ? 'zu-wenig'
      : 'geloest';
  return { kompetenz, status, aufgaben: danach };
}

export function personAuswerten(p: Testprotokoll): PersonAuswertung {
  const ereignisse = [...p.ereignisse].sort((x, y) => x.ts - y.ts);
  const aufgaben = ereignisse.filter(istAufgabe);
  const vermittlungen = ereignisse.filter(istVermittlung);
  const nutzungen = ereignisse.filter(istNutzung);

  // Erster Abschluss je Kompetenz (wie `vermittelt` im Kern)
  const erster = new Map<string, number>();
  for (const v of vermittlungen)
    if (v.typ === 'abgeschlossen' && !erster.has(v.kompetenz)) erster.set(v.kompetenz, v.ts);
  const einstieg = [...erster].map(([k, ts]) => einstiegFuer(k, ts, aufgaben));

  const falsch = aufgaben.filter((a) => a.ergebnis === 'falsch' && a.modus !== 'diagnose');
  const unbekannt = falsch
    .filter((a) => !a.fehlerbild)
    .map((a) => ({
      vorlage: a.vorlage,
      niveau: a.niveau,
      platzhalter: a.schnappschuss?.platzhalter,
      loesung: a.schnappschuss?.loesung,
      antwort: a.schnappschuss?.antwort,
    }));

  let aufgabenMitWeg = 0;
  let schritte = 0;
  let ersterVersuch = 0;
  let zweiterVersuch = 0;
  let gezeigt = 0;
  for (const a of aufgaben) {
    if (!a.schritte || a.schritte.length === 0) continue;
    aufgabenMitWeg += 1;
    for (const s of a.schritte) {
      schritte += 1;
      if (!s.richtig) gezeigt += 1;
      else if (s.versuche <= 1) ersterVersuch += 1;
      else zweiterVersuch += 1;
    }
  }

  const abbrueche: Abbruch[] = [];
  for (const n of nutzungen) {
    if (n.was !== 'abbruch' || !n.ziel?.startsWith('vermittlung:')) continue;
    const kompetenz = n.ziel.slice('vermittlung:'.length);
    const letzte = vermittlungen
      .filter((v) => v.kompetenz === kompetenz && v.ts <= n.ts && v.typ === 'antwort')
      .at(-1);
    abbrueche.push({ kompetenz, ...(letzte ? { schritt: letzte.schritt } : {}) });
  }

  const hilfe = (vorsatz: string) =>
    nutzungen.filter((n) => n.was === 'hilfe' && n.ziel?.startsWith(vorsatz)).length;

  return {
    teilnehmer: p.teilnehmer,
    aufgaben: aufgaben.length,
    vermittlungen: erster.size,
    einstieg,
    falsch: falsch.length,
    mitFehlerbild: falsch.length - unbekannt.length,
    unbekannt,
    schritte: {
      aufgabenMitWeg,
      schritte,
      ersterVersuch,
      zweiterVersuch,
      gezeigt,
      ohneWeg: nutzungen.filter((n) => n.was === 'weg-uebersprungen').length,
    },
    abbrueche,
    tipps: hilfe('tipp:'),
    loesungswege: hilfe('loesungsweg:'),
  };
}

// ---------------------------------------------------------------------------
// Zusammen

/** ja, nein oder „noch nicht messbar“ (zu wenige Daten) */
export type Urteil = 'ja' | 'nein' | 'offen';

export interface Kriterium1Kompetenz {
  readonly kompetenz: string;
  /** Personen mit Status geloest oder nicht-geloest */
  readonly ausgewertet: number;
  readonly geloest: number;
  /** zu-wenig oder vorher-geuebt */
  readonly nichtGezaehlt: number;
  readonly erfuellt: Urteil;
}

export interface Gesamt {
  readonly personen: readonly PersonAuswertung[];
  readonly kriterium1: readonly Kriterium1Kompetenz[];
  readonly f5: {
    readonly falsch: number;
    readonly mitFehlerbild: number;
    /** 0 … 1; fehlt ohne falsche Antworten */
    readonly anteil?: number;
    readonly erfuellt: Urteil;
  };
  /** unbekannte Fehler je Vorlage, häufigste zuerst */
  readonly unbekanntJeVorlage: readonly {
    readonly vorlage: string;
    readonly antworten: readonly UnbekannteAntwort[];
  }[];
}

export function kriterium1Urteil(geloest: number, ausgewertet: number): Urteil {
  if (ausgewertet < KRITERIUM1_MINDESTENS_PERSONEN) return 'offen';
  // ganzzahlig vergleichen: geloest / ausgewertet ≥ 2/3
  return geloest * 3 >= ausgewertet * 2 ? 'ja' : 'nein';
}

export function f5Urteil(mitFehlerbild: number, falsch: number): Urteil {
  if (falsch === 0) return 'offen';
  // ganzzahlig vergleichen: mitFehlerbild / falsch ≥ 80 %
  return mitFehlerbild * 10 >= falsch * 8 ? 'ja' : 'nein';
}

export function gesamtAuswerten(protokolle: readonly Testprotokoll[]): Gesamt {
  const personen = zusammenfuehren(protokolle).map(personAuswerten);

  const jeKompetenz = new Map<string, { ausgewertet: number; geloest: number; nicht: number }>();
  for (const p of personen)
    for (const e of p.einstieg) {
      const z = jeKompetenz.get(e.kompetenz) ?? { ausgewertet: 0, geloest: 0, nicht: 0 };
      if (e.status === 'geloest' || e.status === 'nicht-geloest') z.ausgewertet += 1;
      else z.nicht += 1;
      if (e.status === 'geloest') z.geloest += 1;
      jeKompetenz.set(e.kompetenz, z);
    }
  const kriterium1 = [...jeKompetenz]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([kompetenz, z]) => ({
      kompetenz,
      ausgewertet: z.ausgewertet,
      geloest: z.geloest,
      nichtGezaehlt: z.nicht,
      erfuellt: kriterium1Urteil(z.geloest, z.ausgewertet),
    }));

  const falsch = personen.reduce((s, p) => s + p.falsch, 0);
  const mitFehlerbild = personen.reduce((s, p) => s + p.mitFehlerbild, 0);

  const jeVorlage = new Map<string, UnbekannteAntwort[]>();
  for (const p of personen)
    for (const u of p.unbekannt) jeVorlage.set(u.vorlage, [...(jeVorlage.get(u.vorlage) ?? []), u]);
  const unbekanntJeVorlage = [...jeVorlage]
    .map(([vorlage, antworten]) => ({ vorlage, antworten }))
    .sort(
      (a, b) =>
        b.antworten.length - a.antworten.length ||
        (a.vorlage < b.vorlage ? -1 : a.vorlage > b.vorlage ? 1 : 0),
    );

  return {
    personen,
    kriterium1,
    f5: {
      falsch,
      mitFehlerbild,
      ...(falsch > 0 ? { anteil: mitFehlerbild / falsch } : {}),
      erfuellt: f5Urteil(mitFehlerbild, falsch),
    },
    unbekanntJeVorlage,
  };
}

// ---------------------------------------------------------------------------
// Bericht (Markdown)

const URTEIL: Record<Urteil, string> = { ja: 'ja', nein: 'nein', offen: 'noch offen' };
const STATUS: Record<EinstiegStatus, string> = {
  geloest: 'gelöst',
  'nicht-geloest': 'nicht gelöst',
  'zu-wenig': 'zu wenige Aufgaben',
  'vorher-geuebt': 'vorher geübt',
};

const prozent = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')} %`;
const json = (x: unknown) => (x === undefined ? '–' : JSON.stringify(x));

/**
 * Bericht als Markdown. Personen heißen „Person 1 …“ in der Reihenfolge der
 * Dateien; die Teilnehmer-Nummern erscheinen nur mit `mitNummern`, damit der
 * Bericht ohne Nummern weitergegeben werden kann (TESTS.md §4.4).
 */
export function bericht(g: Gesamt, optionen: { readonly mitNummern?: boolean } = {}): string {
  const name = (p: PersonAuswertung, i: number) =>
    optionen.mitNummern ? `Person ${i + 1} (${p.teilnehmer})` : `Person ${i + 1}`;
  const z: string[] = [];
  z.push('# Auswertung der Testprotokolle (U4b)', '');
  z.push(`Personen: ${g.personen.length}`, '');

  z.push('## Kriterium 1 – Einstiegsaufgaben nach der Erstvermittlung', '');
  z.push(
    `Gelöst heißt: die ersten ${EINSTIEG_ANZAHL} Aufgaben auf Niveau ${EINSTIEG_NIVEAU} nach dem Abschluss der Erstvermittlung alle richtig, ohne Tipp (TESTS.md §4.5). Erfüllt bei mindestens 2 von 3 Personen.`,
    '',
  );
  if (g.kriterium1.length === 0) z.push('Keine abgeschlossene Erstvermittlung.', '');
  else {
    z.push('| Kompetenz | gelöst | nicht gezählt | erfüllt |', '|---|---|---|---|');
    for (const k of g.kriterium1)
      z.push(
        `| ${k.kompetenz} | ${k.geloest} von ${k.ausgewertet} | ${k.nichtGezaehlt} | ${URTEIL[k.erfuellt]} |`,
      );
    z.push('');
  }

  z.push('## F5 – falsche Antworten mit Fehlerbild', '');
  z.push(
    `${g.f5.mitFehlerbild} von ${g.f5.falsch} falschen Antworten` +
      (g.f5.anteil === undefined ? '' : ` (${prozent(g.f5.anteil)})`) +
      ` haben ein Fehlerbild. Schwelle ${prozent(F5_SCHWELLE)}. Erfüllt: ${URTEIL[g.f5.erfuellt]}.`,
    '',
  );
  if (g.unbekanntJeVorlage.length > 0) {
    z.push('### Unbekannte Fehler je Vorlage', '');
    for (const u of g.unbekanntJeVorlage) {
      z.push(`- **${u.vorlage}** (${u.antworten.length})`);
      for (const a of u.antworten)
        z.push(
          `  - ${a.niveau}: Aufgabe ${json(a.platzhalter)}, Lösung ${json(a.loesung)}, Antwort ${json(a.antwort)}`,
        );
    }
    z.push('');
  }

  z.push('## Je Person', '');
  g.personen.forEach((p, i) => {
    const s = p.schritte;
    z.push(`### ${name(p, i)}`, '');
    z.push(
      `- Aufgaben: ${p.aufgaben}, Erstvermittlungen abgeschlossen: ${p.vermittlungen}`,
      `- Falsch: ${p.falsch}, davon mit Fehlerbild: ${p.mitFehlerbild}`,
      `- Tipps geöffnet: ${p.tipps}, Lösungsweg geöffnet: ${p.loesungswege}`,
      `- Zwischenschritte: ${s.aufgabenMitWeg} Aufgaben, ${s.schritte} Schritte (im 1. Versuch ${s.ersterVersuch}, im 2. Versuch ${s.zweiterVersuch}, gezeigt ${s.gezeigt}); „Weiter ohne Weg“: ${s.ohneWeg}`,
    );
    for (const e of p.einstieg) {
      const zeichen = e.aufgaben.map((a) => (a.ohneHilfe ? '✓' : '✗')).join(' ');
      z.push(`- Einstieg ${e.kompetenz}: ${STATUS[e.status]}${zeichen ? ` (${zeichen})` : ''}`);
    }
    for (const a of p.abbrueche)
      z.push(
        `- Erstvermittlung abgebrochen: ${a.kompetenz}, ${a.schritt ? `zuletzt beantwortet „${a.schritt}“` : 'vor der ersten Antwort'}`,
      );
    z.push('');
  });
  return z.join('\n');
}
