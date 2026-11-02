// „Fehler-Schüler“ (FOKUS F5): spielt die Diagnose regelbasiert durch und sucht
// Verdachtsfälle, wie Stufe 1 sie gefunden hat, bevor ein Mensch Zeit darauf
// verwendet. Ohne KI. Funde werden gemeldet, nie automatisch korrigiert.
//
// Schon in `pnpm test` geprüft und hier nicht wiederholt (Bestandsaufnahme 01.11.2026):
//   - jede Fehlerbild-Antwort einer Vorlage wird als genau dieses Fehlerbild erkannt,
//     die Lösung als richtig (auswertung.test.ts, 200 Seeds je Niveau),
//   - jeder Schrittfehler wird erkannt und ist nie richtig (pflichttests.ts),
//   - jede Antwortmöglichkeit mit fv in einer Erstvermittlung ergibt genau diese
//     Fehlvorstellung (abspielen.test.ts),
//   - Fehlvorstellungen haben kurze Erklärung, Gegenbeispiel und einen Rückweg auf
//     einen vorhandenen Schritt (pruefeFehlvorstellung), sie nennen die Kompetenz
//     jeder Vorlage, in der sie vorkommen (pruefen.test.ts).
//
// Neu hier:
//   A  Fehlerbild der Vorlage oder eines Schritts wird in keinem Seed erzeugt (toter Text)
//   B  Rückweg der Fehlvorstellung führt aus der Kompetenz und ihren Voraussetzungen heraus
//   C  Schritt-Fehlerbild: Fehlvorstellung fehlt oder nennt die Kompetenz nicht
//   D  Erstvermittlung: Antwort mit fv, deren Fehlvorstellung nicht zu dieser Kompetenz
//      oder einer Voraussetzung gehört
//   E  Erstvermittlung: der Rückweg im Schritt (`bei`) führt woanders hin als der
//      Rückweg der Fehlvorstellung in derselben Erstvermittlung
import type { Kompetenz } from '../../src/core/competence/kompetenz';
import type { Fehlvorstellung } from '../../src/core/learning/fehlvorstellung';
import type { Generator } from '../../src/core/learning/generator';
import type { Schritt } from '../../src/core/learning/vermittlung';
import { musterweg } from '../../src/core/learning/zwischenschritte';
import type { Pruefbericht } from './pruefen';

export type VerdachtArt = 'A' | 'B' | 'C' | 'D' | 'E';

export const VERDACHT_ARTEN: Readonly<Record<VerdachtArt, string>> = {
  A: 'Fehlerbild wird nie erzeugt',
  B: 'Rückweg führt aus Kompetenz und Voraussetzungen heraus',
  C: 'Schritt-Fehlerbild ohne passende Fehlvorstellung',
  D: 'Fehlvorstellung passt nicht zur Kompetenz der Erstvermittlung',
  E: 'Rückweg im Schritt weicht vom Rückweg der Fehlvorstellung ab',
};

export interface Verdacht {
  readonly feld: string;
  readonly art: VerdachtArt;
  readonly text: string;
  /** Fundstellen mit gleicher Ursache: Vorlage oder Erstvermittlung, mit Fehlerbild oder Schritt */
  readonly wo: readonly string[];
}

/** Kompetenz mit allen Voraussetzungen, transitiv */
function mitVoraussetzungen(
  id: string,
  nachId: ReadonlyMap<string, Kompetenz>,
): ReadonlySet<string> {
  const s = new Set<string>();
  const offen = [id];
  for (let k = offen.pop(); k !== undefined; k = offen.pop()) {
    if (s.has(k)) continue;
    s.add(k);
    offen.push(...(nachId.get(k)?.voraussetzungen ?? []));
  }
  return s;
}

const kompetenzDes = (rueckweg: string) => rueckweg.split('#')[0] ?? '';

export function fehlerschueler(
  bericht: Pruefbericht,
  generatoren: ReadonlyMap<string, Generator<unknown>>,
  optionen: { readonly seeds?: number } = {},
): Verdacht[] {
  const seeds = optionen.seeds ?? 200;
  const nachId = new Map(bericht.kompetenzen.map((k) => [k.id, k]));
  const fvs = new Map(bericht.fehlvorstellungen.map((f) => [f.id, f]));
  const feld = (k: string) => nachId.get(k)?.feld ?? '?';
  // Gleiche Ursache (Art, Kompetenz, Text) einmal, mit allen Fundstellen
  const funde = new Map<string, { feld: string; art: VerdachtArt; text: string; wo: string[] }>();
  const melde = (k: string, art: VerdachtArt, wo: string, text: string) => {
    const schluessel = `${art}|${k}|${text}`;
    const da = funde.get(schluessel);
    if (da) {
      if (!da.wo.includes(wo)) da.wo.push(wo);
    } else funde.set(schluessel, { feld: feld(k), art, text, wo: [wo] });
  };

  /** B: Rückweg (und Voraussetzung) der Fehlvorstellung liegen in der Kompetenz oder darunter */
  const pruefeRueckweg = (k: string, wo: string, fv: Fehlvorstellung) => {
    const erlaubt = mitVoraussetzungen(k, nachId);
    const ziel = kompetenzDes(fv.rueckweg.vermittlung);
    if (!erlaubt.has(ziel))
      melde(
        k,
        'B',
        wo,
        `${fv.id}: Rückweg ${fv.rueckweg.vermittlung} liegt weder in ${k} noch in einer Voraussetzung`,
      );
    const vor = fv.rueckweg.voraussetzung;
    if (vor && !erlaubt.has(vor))
      melde(k, 'B', wo, `${fv.id}: Grundlage ${vor} ist keine Voraussetzung von ${k}`);
  };

  // --- Vorlagen
  for (const v of bericht.vorlagen) {
    const g = generatoren.get(v.generator);
    if (!g) continue;
    const erzeugt = new Set<string>();
    const schrittErzeugt = new Map<string, Set<string>>();
    const ids = v.schritte?.map((s) => s.id);
    for (const niveau of v.niveaus)
      for (let seed = 0; seed < seeds; seed++) {
        const p = v.parameter[niveau];
        for (const f of g.erzeuge(seed, p).fehlerbilder) erzeugt.add(f.id);
        if (ids)
          for (const { id, aufgabe } of musterweg(g, seed, p, ids)) {
            const s = schrittErzeugt.get(id) ?? new Set<string>();
            for (const f of aufgabe.fehlerbilder) s.add(f.id);
            schrittErzeugt.set(id, s);
          }
      }

    for (const [fid, t] of Object.entries(v.fehlerbilder)) {
      const wo = `${v.id} · ${fid}`;
      if (!erzeugt.has(fid))
        melde(
          v.kompetenz,
          'A',
          wo,
          `in ${seeds} Seeds je Niveau nie erzeugt (${g.id}@${g.version})`,
        );
      const fv = t.fv ? fvs.get(t.fv) : undefined;
      if (fv) pruefeRueckweg(v.kompetenz, wo, fv);
    }

    for (const s of v.schritte ?? [])
      for (const [fid, t] of Object.entries(s.fehlerbilder)) {
        const wo = `${v.id} · Schritt ${s.id} · ${fid}`;
        if (!schrittErzeugt.get(s.id)?.has(fid))
          melde(v.kompetenz, 'A', wo, `in ${seeds} Seeds je Niveau nie erzeugt`);
        const fv = t.fv ? fvs.get(t.fv) : undefined;
        if (!fv) {
          melde(v.kompetenz, 'C', wo, `Fehlvorstellung ${t.fv ?? '(keine)'} fehlt im Katalog`);
          continue;
        }
        if (!fv.kompetenzen.includes(v.kompetenz))
          melde(v.kompetenz, 'C', wo, `${fv.id} nennt ${v.kompetenz} nicht unter kompetenzen`);
        pruefeRueckweg(v.kompetenz, wo, fv);
      }
  }

  // --- Erstvermittlungen
  for (const sequenz of bericht.vermittlungen) {
    const k = sequenz.kompetenz;
    const erlaubt = mitVoraussetzungen(k, nachId);
    for (const s of sequenz.schritte) {
      for (const fvId of fvsIn(s)) {
        const wo = `${sequenz.id} (Vermittlung) · ${s.id}`;
        const fv = fvs.get(fvId);
        if (!fv) continue; // meldet pruefeVermittlung
        if (!fv.kompetenzen.some((x) => erlaubt.has(x)))
          melde(k, 'D', wo, `${fv.id} gehört zu ${fv.kompetenzen.join(', ')}`);
        pruefeRueckweg(k, wo, fv);
        // E: Rückweg im Schritt gegen Rückweg der Fehlvorstellung
        const [zielK = '', zielSchritt = ''] = fv.rueckweg.vermittlung.split('#');
        const tatsaechlich = s.bei?.[fvId] ?? s.bei?.['sonst'] ?? s.weiter;
        if (zielK === k) {
          if (tatsaechlich !== zielSchritt)
            melde(
              k,
              'E',
              wo,
              `${fv.id} in „${s.id}“: Schritt führt zu „${tatsaechlich ?? '(Ende)'}“, die Fehlvorstellung zu „${zielSchritt}“`,
            );
        }
        // Fehlvorstellung einer anderen Kompetenz ohne eigenen Eintrag in `bei`: Es geht
        // mit `sonst` oder `weiter` in der Sequenz weiter. Das ist meist Absicht, darum kein Fund.
      }
    }
  }
  return [...funde.values()];
}

function fvsIn(s: Schritt): string[] {
  const a = s.antwort;
  if (!a) return [];
  const liste =
    'optionen' in a
      ? a.optionen.flatMap((o) => (o.fv ? [o.fv] : []))
      : (a.eingabe.fehler ?? []).map((f) => f.fv);
  return [...new Set(liste)];
}

/** Liste je Feld als Markdown */
export function verdachtsliste(funde: readonly Verdacht[]): string {
  if (funde.length === 0) return 'Keine Verdachtsfälle.\n';
  const z: string[] = [`# Fehler-Schüler: ${funde.length} Verdachtsfälle`, ''];
  const zahl = (a: VerdachtArt) => funde.filter((f) => f.art === a).length;
  z.push(
    'Gleiche Ursache steht einmal, mit allen Fundstellen. Verdacht heißt: ein Mensch schaut nach.',
    '',
  );
  for (const a of Object.keys(VERDACHT_ARTEN) as VerdachtArt[])
    z.push(`- ${a} ${VERDACHT_ARTEN[a]}: ${zahl(a)}`);
  z.push('');
  const felder = [...new Set(funde.map((f) => f.feld))].sort();
  for (const feld of felder) {
    z.push(`## ${feld}`, '');
    for (const f of funde
      .filter((x) => x.feld === feld)
      .sort((x, y) => (x.art + x.text < y.art + y.text ? -1 : 1)))
      z.push(
        `- **${f.art}** ${f.text} – ${f.wo.slice(0, 3).join('; ')}${f.wo.length > 3 ? ` und ${f.wo.length - 3} weitere` : ''}`,
      );
    z.push('');
  }
  return z.join('\n');
}
