/**
 * Balancing-Simulator (ARCHITEKTUR T-9, BASEBAU §8, Schritt 2.11).
 *
 * Spielt synthetische Lernprofile mit dem **echten Kern** durch: Aufgaben-
 * Ereignisse, Wiederholungsplanung (FSRS), „gekonnt“/„gefestigt“, Sitzungen,
 * Ledger-Regeln und Bauen. Ausgedacht sind nur die Jugendlichen: wann sie
 * lernen, wie viele Aufgaben, wie oft richtig, was sie bauen. Deterministisch.
 */
import {
  bastionAus,
  beginnen,
  beginnHindernisse,
  einlagerbar,
  einlagern,
  freierPlatz,
} from '../../src/core/bastion/bauen';
import type { BauEreignis, Bastion } from '../../src/core/bastion/bauen';
import { epochenstand } from '../../src/core/bastion/epoche';
import { BAUPLATZ, KATALOG, kosten, type GebaeudeTyp } from '../../src/core/bastion/katalog';
import { aufgabeEreignis, type AufgabeEreignis } from '../../src/core/learning/ereignis';
import { verarbeite, type Projektion } from '../../src/core/learning/fortschritt';
import { sitzungEreignis, type SitzungEreignis } from '../../src/core/learning/sitzung';
import { buchungsId, kontoAus, type BuchungEreignis } from '../../src/core/ledger/buchung';
import {
  koennenBuchungen,
  LEERER_TAG,
  sitzungsBuchungen,
  type Buchung,
  type Tagesstand,
} from '../../src/core/ledger/regeln';
import { lerntag } from '../../src/core/policy/lerntag';
import { rng, type Rng } from '../../src/core/rng/rng';
import { quelleAusSeed } from '../../src/core/rng/zufallsquelle';
import { istFaellig } from '../../src/core/srs/karten';
import { wiederholRunde } from '../../src/core/srs/rueckkehr';

const TAG_MS = 86_400_000;
const START = Date.UTC(2026, 8, 1, 14); // 1. September, 16 Uhr Ortszeit
const VERSATZ = 120;
const PROFIL = 'SIM';
const GERAET = 'sim00001';

/**
 * Lernstoff: Klasse 5 und 6 mit je zwei Niveaus – rund 130 Themen mit je zwei
 * Vorlagen. Die Regeln sind niveau- und fachneutral (B-4); es genügt ein Niveau.
 */
const KOMPETENZEN = Array.from({ length: 134 }, (_, i) => `K${String(i + 1).padStart(3, '0')}`);

export interface Lernprofil {
  readonly id: string;
  readonly name: string;
  /** Aufgaben an Tag `t` (0 = Lernpause); mehrere Werte = mehrere Sitzungen am Tag */
  readonly plan: (t: number) => readonly number[];
  /** Wahrscheinlichkeit einer richtigen Antwort */
  readonly richtig: number;
  /** Bearbeitungszeit je Aufgabe in Sekunden */
  readonly sekunden: number;
  /** nur leichte Aufgaben üben: keine Wiederholungen, keine Werkstatt, immer dieselben Themen */
  readonly farmer?: boolean;
  /**
   * Neue Themen je Woche – der Schulrhythmus (Standard 0,5: eines alle zwei Wochen,
   * etwa 25 im Schuljahr wie in BASEBAU §5.3). Dazwischen übt das Kind Bekanntes.
   */
  readonly neuJeWoche?: number;
}

const wochentag = (t: number) => (t + 1) % 7; // 1. 9. 2026 ist ein Dienstag → 0 = Montag
const an = (tage: readonly number[], n: number) => (t: number) =>
  tage.includes(wochentag(t)) ? [n] : [];

/** Profile aus BASEBAU §8 */
export const PROFILE: readonly Lernprofil[] = [
  {
    id: 'P1',
    name: 'regelmäßig (4×/Woche, 15 Min.)',
    plan: an([0, 1, 3, 5], 15),
    richtig: 0.85,
    sekunden: 45,
  },
  { id: 'P2', name: 'eifrig (täglich, 30 Min.)', plan: () => [30], richtig: 0.85, sekunden: 45 },
  {
    id: 'P3',
    name: 'Wochenende (2×/Woche, 45 Min.)',
    plan: an([5, 6], 45),
    richtig: 0.85,
    sekunden: 45,
  },
  {
    id: 'P4',
    name: 'Farmer (täglich viel, nur Leichtes)',
    plan: () => [60],
    richtig: 0.98,
    sekunden: 8,
    farmer: true,
  },
  {
    id: 'P5',
    name: 'Pause (P1 mit 3 Wochen krank)',
    plan: (t) => (t >= 70 && t < 91 ? [] : an([0, 1, 3, 5], 15)(t)),
    richtig: 0.85,
    sekunden: 45,
  },
  {
    id: 'P6',
    name: 'schwach (P1, Fehlerquote 50 %)',
    plan: an([0, 1, 3, 5], 15),
    richtig: 0.5,
    sekunden: 45,
  },
  {
    id: 'P7',
    name: 'Prüfungsphase (P1, 2 Wochen täglich 60 Min.)',
    plan: (t) => (t >= 140 && t < 154 ? [60] : an([0, 1, 3, 5], 15)(t)),
    richtig: 0.85,
    sekunden: 45,
  },
];

/** Bauplan der Simulation: erst das Banner, dann die Gebäude auf dem Weg zum Ziel der Epoche */
const ZIELE: readonly { typ: GebaeudeTyp; stufe: number }[] = [
  { typ: 'zeichen', stufe: 1 },
  { typ: 'turm', stufe: 1 },
  { typ: 'wissen', stufe: 1 },
  { typ: 'kern', stufe: 2 },
  { typ: 'werkstatt', stufe: 1 },
  { typ: 'eingang', stufe: 1 },
  { typ: 'turm', stufe: 1 },
  { typ: 'wissen', stufe: 2 },
  { typ: 'turm', stufe: 2 },
  { typ: 'turm', stufe: 2 },
  { typ: 'kern', stufe: 3 },
];
/** Aus Überschuss, ohne Können: Einfassung (bis 40) und Zierde im Wechsel */
const UEBERSCHUSS: readonly GebaeudeTyp[] = [
  'einfassung',
  'flaeche',
  'einfassung',
  'denkmal',
  'zeichen',
];

export interface Ergebnis {
  readonly profil: Lernprofil;
  /** Tag, an dem die Epoche 1 geschafft ist (undefined = nicht im Zeitraum) */
  readonly epocheTag?: number;
  /** Tage, an denen ein Gebäude fertig wurde (ohne Startzustand), mit Typ */
  readonly fertig: readonly { readonly tag: number; readonly typ: GebaeudeTyp }[];
  readonly lerntage: number;
  readonly aufgaben: number;
  readonly erworben: Readonly<Record<'fleiss' | 'behalten' | 'koennen' | 'schritt', number>>;
  readonly gefestigt: number;
  /** belegte Felder am Ende und nach 12 Monaten (Anteil 0 … 1) */
  readonly belegung: number;
  readonly belegung12: number;
  /** Wochen mit Lernen, aber ohne sichtbaren Fortschritt (kein Bauschritt, nichts fertig) */
  readonly wochenOhneFortschritt: number;
  readonly einfassung: number;
  /** wie oft Zierde eingelagert wurde, um Platz zu schaffen (B-21) */
  readonly eingelagert: number;
  /** alle Ereignisse – für die Gegenprüfung mit dem Neuaufbau */
  readonly sitzungen: readonly SitzungEreignis[];
  readonly aufgabenListe: readonly AufgabeEreignis[];
  readonly buchungen: readonly BuchungEreignis[];
  readonly bau: readonly BauEreignis[];
}

const belegt = (b: Bastion) =>
  b.bauwerke.reduce((s, x) => s + KATALOG[x.typ].groesse[0] * KATALOG[x.typ].groesse[1], 0) /
  (BAUPLATZ.breite * BAUPLATZ.tiefe);

export function simuliere(profil: Lernprofil, tage = 730, seed = 1): Ergebnis {
  const r: Rng = rng(seed);
  const zufall = quelleAusSeed(seed);
  const p: Projektion = { staende: new Map(), karten: new Map() };
  const aufgaben: AufgabeEreignis[] = [];
  const sitzungen: SitzungEreignis[] = [];
  const buchungen: BuchungEreignis[] = [];
  const bau: BauEreignis[] = [];
  const tagesstaende = new Map<string, Tagesstand>();
  const korrigiert = new Set<string>();
  const nachId = new Map<string, AufgabeEreignis>();
  const gebuchtePlaene = new Set<string>();
  const offeneFehler: AufgabeEreignis[] = [];
  let nr = 0;
  let epocheTag: number | undefined;
  let belegung12 = 0;
  let zierde = 0;
  let eingelagerteStuecke = 0;
  const fertigSchon = new Set<string>();
  const fertig: { tag: number; typ: GebaeudeTyp }[] = [];
  const wochen = new Map<number, { gelernt: boolean; fortschritt: boolean }>();

  const zufallZahl = () => r.int(0, 9999) / 10000;
  const neuerStand = (k: string) => p.staende.get(`${PROFIL}|${k}|G`);

  for (let t = 0; t < tage; t++) {
    const woche = Math.floor(t / 7);
    const plan = profil.plan(t);
    for (const [si, anzahl] of plan.entries()) {
      let jetzt = START + t * TAG_MS + si * 3 * 3_600_000;
      const sitzung = `S${t}-${si}`;
      const diese: AufgabeEreignis[] = [];
      const auftraege: {
        kompetenz: string;
        vorlage: string;
        faellig: boolean;
        korrigiert?: string;
      }[] = [];
      if (!profil.farmer) {
        // wie die App: aufgearbeitete Fehler (Werkstatt), fällige Wiederholungen (höchstens 20), dann Neues
        for (const f of offeneFehler.splice(0, 3))
          auftraege.push({
            kompetenz: f.kompetenz,
            vorlage: f.vorlage,
            faellig: false,
            korrigiert: f.id,
          });
        for (const k of wiederholRunde([...p.karten.values()], jetzt))
          if (auftraege.length < anzahl)
            auftraege.push({ kompetenz: k.kompetenz, vorlage: k.vorlage, faellig: true });
      }
      // Themen, die nach dem Schulrhythmus schon dran waren
      const freigegeben = Math.min(
        KOMPETENZEN.length,
        1 + Math.floor((t / 7) * (profil.neuJeWoche ?? 0.5)),
      );
      const offen = KOMPETENZEN.slice(0, freigegeben).filter((x) => {
        const s = neuerStand(x);
        return !s || s.status === 'in-arbeit';
      });
      const bekannt = KOMPETENZEN.slice(0, freigegeben).filter((x) => !offen.includes(x));
      while (auftraege.length < anzahl) {
        const i = auftraege.length;
        const k = profil.farmer
          ? KOMPETENZEN[i % 3]
          : (offen[0] ?? bekannt[r.int(0, Math.max(0, bekannt.length - 1))]);
        if (!k) break;
        auftraege.push({ kompetenz: k, vorlage: `${k}.V${i % 2}`, faellig: false });
      }
      for (const a of auftraege.slice(0, anzahl)) {
        const sekunden = Math.max(3, profil.sekunden + r.int(-10, 10));
        jetzt += (sekunden + 15) * 1000;
        const karte = p.karten.get(`${PROFIL}|${a.vorlage}|G`);
        const richtig = zufallZahl() < profil.richtig;
        const e = aufgabeEreignis(
          {
            profil: PROFIL,
            geraet: GERAET,
            sitzung,
            modus: a.korrigiert ? 'fehlerwerkstatt' : a.faellig ? 'wiederholen' : 'ueben',
            kompetenz: a.kompetenz,
            vorlage: a.vorlage,
            niveau: 'G',
            generator: 'sim@1',
            seed: (nr += 1),
            paket: 'sim',
            hilfen: 0,
            dauerMs: sekunden * 1000,
            faellig: karte !== undefined && istFaellig(karte, jetzt),
            platzhalter: {},
            loesung: { typ: 'zahl', wert: 1 },
            antwort: { typ: 'zahl', wert: richtig ? 1 : 2 },
            ergebnis: { richtig },
            ...(a.korrigiert ? { korrigiert: a.korrigiert } : {}),
          },
          jetzt,
          VERSATZ,
          zufall,
        );
        verarbeite(p, e);
        aufgaben.push(e);
        diese.push(e);
        nachId.set(e.id, e);
        if (!richtig && !profil.farmer) offeneFehler.push(e);
      }
      if (diese.length === 0) continue;
      wochen.set(woche, { gelernt: true, fortschritt: wochen.get(woche)?.fortschritt ?? false });

      // Sitzung und Buchungen – mit den echten Regeln, fortgeschrieben wie alleSitzungsBuchungen
      const s = sitzungEreignis(diese, 'regulaer');
      sitzungen.push(s);
      const { buchungen: neu, danach } = sitzungsBuchungen(
        s,
        diese,
        tagesstaende.get(s.tag) ?? LEERER_TAG,
        korrigiert,
        (id) => nachId.get(id),
      );
      tagesstaende.set(s.tag, danach);
      const plaene = koennenBuchungen([...p.staende.values()], gebuchtePlaene);
      plaene.forEach((b) => gebuchtePlaene.add(b.bezug));
      const alsEreignis = (b: Buchung): BuchungEreignis => ({
        ...b,
        id: buchungsId(PROFIL, b),
        art: 'buchung',
        v: 1,
        profil: PROFIL,
        ts: b.grund === 'sitzung' ? s.ts : jetzt,
        geraet: GERAET,
      });
      buchungen.push(...neu.map(alsEreignis), ...plaene.map(alsEreignis));
      if (neu.some((b) => b.ressource === 'schritt'))
        wochen.set(woche, { gelernt: true, fortschritt: true });

      // Bauen: das nächste Ziel, sonst Zierde mit überzähligem Fleiß
      for (let versuch = 0; versuch < 30; versuch++) {
        const b = bastionAus(bau, buchungen);
        const k = kontoAus(PROFIL, buchungen);
        const angaben = {
          profil: PROFIL,
          geraet: GERAET,
          id: `B${String((nr += 1)).padStart(8, '0')}`,
          jetzt: (jetzt += 1000),
          tag: lerntag(jetzt, VERSATZ),
        };
        const ziel = naechstesZiel(b);
        let e = undefined as ReturnType<typeof beginnen> | undefined;
        if (ziel) {
          const ausbau =
            ziel.stufe > 1
              ? b.bauwerke.find((x) => x.typ === ziel.typ && x.stufe === ziel.stufe - 1)
              : undefined;
          const pos = freierPlatz(b, ziel.typ);
          // Kein zusammenhängender Platz frei: Zierde einlagern (B-21) und es noch einmal versuchen
          if (!ausbau && !pos) {
            const zierStueck = b.bauwerke.find((x) => einlagerbar(x.typ) && x.typ !== 'ursprung');
            if (zierStueck) {
              const eingelagert = einlagern(b, zierStueck.id, angaben);
              if (eingelagert.ok) {
                bau.push(eingelagert.bau);
                eingelagerteStuecke++;
                continue;
              }
            }
          }
          const ort = ausbau ? { ausbau: ausbau.id } : pos ? { pos } : undefined;
          if (ort) e = beginnen(b, k, ziel.typ, ort, angaben);
        }
        if (!e?.ok) {
          // Zierde nur aus Überschuss: genug Fleiß für das nächste Ziel bleibt übrig
          const reserve = ziel ? (kosten(ziel.typ, ziel.stufe)?.fleiss ?? 0) : 0;
          const naechster = UEBERSCHUSS[zierde % UEBERSCHUSS.length] ?? 'zeichen';
          const einfassungVoll =
            b.bauwerke.filter((x) => x.typ === 'einfassung').length >=
            (KATALOG.einfassung.hoechstens ?? 0);
          const typ = naechster === 'einfassung' && einfassungVoll ? 'zeichen' : naechster;
          const preis = kosten(typ, 1)?.fleiss ?? 0;
          const pos = freierPlatz(b, typ);
          // Ein vernünftiges Kind hält Platz frei für die Gebäude, die noch fehlen
          const frei = BAUPLATZ.breite * BAUPLATZ.tiefe * (1 - belegt(b));
          const flaeche = KATALOG[typ].groesse[0] * KATALOG[typ].groesse[1];
          if (
            pos &&
            frei - flaeche >= platzFuerZiele(b) &&
            k.stand.fleiss - preis >= reserve + 20 &&
            beginnHindernisse(b, k, typ, { pos }).length === 0
          ) {
            e = beginnen(b, k, typ, { pos }, angaben);
            if (e.ok) zierde++;
          }
        }
        if (!e?.ok) break;
        bau.push(e.bau);
        buchungen.push(...e.buchungen);
      }
    }

    // Tagesende: fertige Gebäude, Epoche, Belegung
    const b = bastionAus(bau, buchungen);
    for (const f of b.fertig)
      if (!fertigSchon.has(f.vorhaben)) {
        fertigSchon.add(f.vorhaben);
        fertig.push({ tag: t, typ: f.typ });
        wochen.set(woche, { gelernt: wochen.get(woche)?.gelernt ?? false, fortschritt: true });
      }
    // Epoche 1 geschafft = freigeschaltete Epoche ≥ 2 (BASEBAU §5.4 / G9)
    if (epocheTag === undefined && epochenstand(b, kontoAus(PROFIL, buchungen)).epoche >= 2)
      epocheTag = t;
    if (t === 365) belegung12 = belegt(b);
  }

  const b = bastionAus(bau, buchungen);
  const k = kontoAus(PROFIL, buchungen);
  return {
    profil,
    ...(epocheTag !== undefined ? { epocheTag } : {}),
    fertig,
    lerntage: new Set(sitzungen.map((s) => s.tag)).size,
    aufgaben: aufgaben.length,
    erworben: k.erworben,
    gefestigt: [...p.staende.values()].filter((s) => s.gefestigtAm).length,
    belegung: belegt(b),
    belegung12,
    wochenOhneFortschritt: [...wochen.values()].filter((w) => w.gelernt && !w.fortschritt).length,
    einfassung: b.bauwerke.filter((x) => x.typ === 'einfassung').length,
    eingelagert: eingelagerteStuecke,
    sitzungen,
    aufgabenListe: aufgaben,
    buchungen,
    bau,
  };

  /** Felder, die die noch fehlenden Neubauten brauchen */
  function platzFuerZiele(b: Bastion): number {
    let n = 0;
    const gezaehlt = new Map<GebaeudeTyp, number>();
    for (const z of ZIELE.filter((x) => x.stufe === 1)) {
      const schon = gezaehlt.get(z.typ) ?? 0;
      gezaehlt.set(z.typ, schon + 1);
      const start = z.typ === 'einfassung' ? 4 : 0;
      const vorhanden =
        b.bauwerke.filter((x) => x.typ === z.typ).length -
        start +
        b.vorhaben.filter((v) => v.typ === z.typ && v.stufe === 1).length;
      if (vorhanden <= schon) n += KATALOG[z.typ].groesse[0] * KATALOG[z.typ].groesse[1];
    }
    return n;
  }

  function naechstesZiel(b: Bastion) {
    // Ziele der Reihe nach abhaken: Neubau zählt vorhandene, Ausbau zählt erreichte Stufen
    const zaehle = new Map<string, number>();
    for (const z of ZIELE) {
      const schluessel = `${z.typ}@${z.stufe}`;
      const schon = zaehle.get(schluessel) ?? 0;
      zaehle.set(schluessel, schon + 1);
      const vorhanden =
        b.bauwerke.filter((x) => x.typ === z.typ && x.stufe >= z.stufe).length +
        b.vorhaben.filter((v) => v.typ === z.typ && v.stufe === z.stufe).length;
      const start = z.typ === 'einfassung' ? 4 : 0;
      if (vorhanden - start <= schon) return z;
    }
    return undefined;
  }
}

/** Kennzahlen für den Bericht und die Prüfung gegen BASEBAU §8 */
export function auswerten(e: Ergebnis) {
  const jahr1 = e.fertig.filter((f) => f.tag < 365);
  const luecke = (liste: readonly { tag: number }[]) =>
    Math.max(0, ...liste.map((f, i) => f.tag - (i === 0 ? f.tag : (liste[i - 1]?.tag ?? f.tag))));
  const zierde = (f: { typ: GebaeudeTyp }) => KATALOG[f.typ].familie === 'zierde';
  const summeJahr1 = { fleiss: 0, behalten: 0, koennen: 0, schritt: 0 };
  for (const b of e.buchungen)
    if (
      b.menge > 0 &&
      (b.grund === 'sitzung' || b.grund === 'kompetenz-gefestigt') &&
      b.tag < '2027-09-01'
    )
      summeJahr1[b.ressource] += b.menge;
  return {
    epocheTag: e.epocheTag,
    erstesGebaeude: e.fertig[0]?.tag,
    lerntage: e.lerntage,
    aufgaben: e.aufgaben,
    jahr1: summeJahr1,
    fertigJahr1: jahr1.length,
    zierdeJahr1: jahr1.filter(zierde).length,
    lueckeJahr1: luecke(jahr1),
    lueckeOhneZierdeJahr1: luecke(jahr1.filter((f) => !zierde(f))),
    wochenOhneFortschritt: e.wochenOhneFortschritt,
    belegung12: Math.round(e.belegung12 * 100),
    belegung: Math.round(e.belegung * 100),
    einfassung: e.einfassung,
    eingelagert: e.eingelagert,
  };
}
