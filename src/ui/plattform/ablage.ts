// Verbindet die App mit der Ablage im Browser: echte Uhr, echter Zufall,
// Lernsitzungen (DATENMODELL §4.2): Eine Sitzung endet mit „Fertig für heute“,
// nach 30 Minuten Ruhe oder mit dem Lerntag; nie beendete trägt der nächste Start nach. Ist IndexedDB nicht nutzbar (z. B. privater
// Modus mancher Browser), funktioniert Üben weiter – nur ohne Speichern.
import { aufgabeEreignis, type AufgabeAngaben } from '../../core/learning/ereignis';
import type { KompetenzStand } from '../../core/learning/fortschritt';
import { neueSitzungNoetig, sitzungEreignis } from '../../core/learning/sitzung';
import type { BuchungEreignis, Konto } from '../../core/ledger/buchung';
import {
  abbrechen,
  aufstellen,
  beginnen,
  einlagern,
  gestalten,
  freierPlatz,
  versetzen,
  type Bastion,
  type BauHindernis,
  type Ergebnis,
} from '../../core/bastion/bauen';
import type { Farbe, GebaeudeTyp, Position } from '../../core/bastion/katalog';
import { buecher, type Buch } from '../../core/bastion/wissen';
import { zielAus, zielText, type Ziel } from '../../core/bastion/ziel';
import { ulid } from '../../core/rng/ulid';
import {
  aufDiesemGeraet,
  BASEBAU_SCHLUESSEL,
  basebauAktiv,
  THEMA_SCHLUESSEL,
  themaAus,
  MODUS_SCHLUESSEL,
  modusAus,
  type Modus,
  ZIEL_SCHLUESSEL,
  BILD_SCHLUESSEL,
  ZOOM_SCHLUESSEL,
  KLASSE_SCHLUESSEL,
  klasseAus,
  SCHULART_SCHLUESSEL,
  schulartAus,
  GEBURTSDATUM_SCHLUESSEL,
  ERWACHSEN_SCHLUESSEL,
  PROFIL_GEFRAGT_SCHLUESSEL,
  SCHULJAHR_SCHLUESSEL,
  GERADE_DRAN_SCHLUESSEL,
  KLASSENARBEIT_SCHLUESSEL,
  type Thema,
  einstellungEreignis,
  JE_GERAET,
  PIN_NACH_SICHERUNG,
  vonAnderemGeraet,
} from '../../core/policy/einstellung';
import { lerntag } from '../../core/policy/lerntag';
import { geburtsdatumAus, type Profil } from '../../core/policy/alter';
import {
  CODE_WOERTER,
  dateiname,
  ERINNERUNG_SCHLUESSEL,
  erinnerungTage,
  sicherungFaellig,
} from '../../core/sicherung/sicherung';
import { oeffnen, verschluesseln, type OeffnenFehler } from './sicherung';
import { normalisiereCode, wortcode } from '../../core/rng/wortcode';
import { hashe, pruefe } from './pin';
import type { AufgabeEreignis } from '../../core/learning/ereignis';
import type { ZufallsQuelle } from '../../core/rng/zufallsquelle';
import { istFaellig, type Karte } from '../../core/srs/karten';
import { gruppiere, offeneFehler, type Fehlergruppe } from '../../core/learning/werkstatt';
import {
  aufgaben,
  bastion,
  bastionAktualisieren,
  bauSpeichern,
  buchen,
  buchungen,
  einrichten,
  konto,
  einstellung,
  einstellungsEreignisse,
  ersteAufgabe,
  exportieren,
  importieren,
  letzteSicherung,
  sicherungVermerken,
  sitzungenNachtragen,
  speichereEinstellung,
  speichereSitzung,
  karte,
  karten,
  kompetenzStaende,
  speichereAufgabe,
  type Installation,
  type Melder,
} from '../../storage/ablage';
import { BastionDatenbank } from '../../storage/datenbank';

const zufall: ZufallsQuelle = {
  fuelle: (bytes) => {
    const neu = crypto.getRandomValues(new Uint8Array(bytes.length));
    bytes.set(neu);
  },
};
const db = new BastionDatenbank();
let sitzung = ulid(Date.now(), zufall);
/** Antworten der laufenden Sitzung – daraus entsteht ihr Sitzungs-Ereignis */
let laufende: AufgabeEreignis[] = [];
let installation: Promise<Installation | undefined> | undefined;

function bereit(): Promise<Installation | undefined> {
  installation ??= einrichten(db, Date.now(), zufall)
    .then(async (inst) => {
      await sitzungenNachtragen(db, inst, sitzung).catch(() => 0);
      // Das Ledger bucht immer, auch bei abgeschaltetem Basebau (B-10)
      await buchenUndBauen(inst);
      return inst;
    })
    .catch(() => undefined);
  return installation;
}

const versatz = (ts: number) => -new Date(ts).getTimezoneOffset();

/** Neue IDs und Lerntage für Ereignisse, die die Ablage selbst schreibt. */
const melder: Melder = {
  id: () => ulid(Date.now(), zufall),
  tag: (ts) => lerntag(ts, versatz(ts)),
};

/** Ledger buchen, dann die Bastion mit neuen Bauschritten fortschreiben. */
async function buchenUndBauen(inst: Installation): Promise<void> {
  await buchen(db, inst, Date.now()).catch(() => []);
  await bastionAktualisieren(db, inst, melder).catch(() => undefined);
}

/** Laufende Sitzung abschließen und eine neue beginnen (nur wenn es Antworten gab). */
async function sitzungAbschliessen(
  inst: Installation,
  abschluss: 'regulaer' | 'nachgetragen',
): Promise<void> {
  const fertig = laufende;
  if (fertig.length === 0) return;
  laufende = [];
  sitzung = ulid(Date.now(), zufall);
  await speichereSitzung(db, sitzungEreignis(fertig, abschluss)).catch(() => undefined);
  await buchenUndBauen(inst);
}

/** „Fertig für heute“: Die Sitzung ist regulär beendet. */
export async function sitzungBeenden(): Promise<void> {
  const inst = await bereit();
  if (inst) await sitzungAbschliessen(inst, 'regulaer');
}

/** Alle Buchungen des Profils (Abschlussbildschirm). */
export async function alleBuchungen(): Promise<BuchungEreignis[]> {
  const inst = await bereit();
  return inst ? buchungen(db, inst.profil).catch(() => []) : [];
}

/** Kontostand des Profils (leer, wenn nicht gespeichert werden kann). */
export async function kontostand(): Promise<Konto | undefined> {
  const inst = await bereit();
  return inst ? konto(db, inst.profil).catch(() => undefined) : undefined;
}

export type Antwortdaten = Omit<AufgabeAngaben, 'profil' | 'geraet' | 'sitzung' | 'faellig'>;

/** Speichert eine beantwortete Aufgabe; Fehler beim Speichern unterbrechen das Üben nicht. */
export async function merke(daten: Antwortdaten): Promise<void> {
  const inst = await bereit();
  if (!inst) return;
  const jetzt = Date.now();
  // Lange Ruhe oder neuer Lerntag: Die alte Sitzung gilt als beendet, ohne „Fertig für heute“
  if (neueSitzungNoetig(laufende.at(-1), jetzt, lerntag(jetzt, versatz(jetzt))))
    await sitzungAbschliessen(inst, 'nachgetragen');
  // „Fällig“ hält fest, ob die Karte in diesem Moment zur Wiederholung anstand (LEHRPLAN §6).
  const k = await karte(db, inst.profil, daten.vorlage, daten.niveau).catch(() => undefined);
  const e = aufgabeEreignis(
    {
      ...daten,
      profil: inst.profil,
      geraet: inst.geraet,
      sitzung,
      faellig: k !== undefined && istFaellig(k, jetzt),
    },
    jetzt,
    -new Date(jetzt).getTimezoneOffset(),
    zufall,
  );
  const gespeichert = await speichereAufgabe(db, e).then(
    () => true,
    () => false,
  );
  if (gespeichert) laufende.push(e);
}

export interface Zustand {
  /** Stände, Schlüssel "Kompetenz|Niveau" */
  readonly staende: ReadonlyMap<string, KompetenzStand>;
  readonly karten: readonly Karte[];
}

/** Stände und Karten des Profils (leer, wenn nicht gespeichert werden kann). */
export async function zustand(): Promise<Zustand> {
  const inst = await bereit();
  if (!inst) return { staende: new Map(), karten: [] };
  const [liste, alleKarten] = await Promise.all([
    kompetenzStaende(db, inst.profil).catch(() => []),
    karten(db, inst.profil).catch(() => []),
  ]);
  return {
    staende: new Map(liste.map((s) => [`${s.kompetenz}|${s.niveau}`, s])),
    karten: alleKarten,
  };
}

/** Offene Fehler, nach Ursache gruppiert (Fehlerwerkstatt). */
export async function fehlergruppen(): Promise<Fehlergruppe[]> {
  const inst = await bereit();
  if (!inst) return [];
  const alle = await aufgaben(db, inst.profil).catch(() => []);
  return gruppiere(offeneFehler(alle));
}

/** Alle Aufgaben des Profils (Elternbericht, „Was meine Eltern sehen“). */
export async function alleAufgaben(): Promise<AufgabeEreignis[]> {
  const inst = await bereit();
  if (!inst) return [];
  return aufgaben(db, inst.profil).catch(() => []);
}

async function setze(
  schluessel: string,
  wert: string | number | boolean,
  durch: 'jugendlich' | 'eltern' = 'eltern',
): Promise<void> {
  const inst = await bereit();
  if (!inst) throw new Error('Speichern nicht möglich');
  const jetzt = Date.now();
  await speichereEinstellung(
    db,
    einstellungEreignis(
      { profil: inst.profil, geraet: inst.geraet, schluessel, wert, durch },
      jetzt,
      -new Date(jetzt).getTimezoneOffset(),
      zufall,
    ),
  );
}

async function lies(schluessel: string): Promise<string | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  // PIN und Wiederherstellungscode gelten nur auf diesem Gerät (D-15)
  const w = JE_GERAET.has(schluessel)
    ? aufDiesemGeraet(
        await einstellungsEreignisse(db, inst.profil).catch(() => []),
        schluessel,
        inst.geraet,
      )?.wert
    : await einstellung(db, inst.profil, schluessel).catch(() => undefined);
  return typeof w === 'string' ? w : undefined;
}

export interface BastionLage {
  readonly bastion: Bastion;
  readonly konto: Konto;
  /** Studierstube: ein Buch je gefestigter Kompetenz (B-6) */
  readonly buecher: readonly Buch[];
}

/** Bastion und Kontostand (Listenansicht, BASEBAU §11 Schritt 2.8). */
export async function bastionLage(): Promise<BastionLage | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  const [b, k, alle] = await Promise.all([
    bastion(db, inst.profil),
    konto(db, inst.profil),
    buchungen(db, inst.profil),
  ]);
  return { bastion: b, konto: k, buecher: buecher(alle) };
}

export type BauAuftrag =
  | { readonly art: 'beginnen'; readonly typ: GebaeudeTyp; readonly ausbau?: string }
  | { readonly art: 'abbrechen'; readonly vorhaben: string }
  | { readonly art: 'versetzen'; readonly gebaeude: string; readonly pos: Position }
  | { readonly art: 'einlagern'; readonly gebaeude: string }
  | { readonly art: 'aufstellen'; readonly gebaeude: string }
  | { readonly art: 'gestalten'; readonly gebaeude: string; readonly farbe: Farbe };

/**
 * Eine Bau-Aktion ausführen. Ein Neubau kommt auf das erste freie Feld; versetzen
 * lässt er sich danach kostenlos. Liefert die neue Lage oder die Hindernisse.
 */
export async function bauAusfuehren(
  auftrag: BauAuftrag,
): Promise<BastionLage | { readonly hindernisse: readonly BauHindernis[] }> {
  const inst = await bereit();
  if (!inst) return { hindernisse: ['nicht-baubar'] };
  const lage = await bastionLage();
  if (!lage) return { hindernisse: ['nicht-baubar'] };
  const jetzt = Date.now();
  const a = {
    profil: inst.profil,
    geraet: inst.geraet,
    id: ulid(jetzt, zufall),
    jetzt,
    tag: lerntag(jetzt, versatz(jetzt)),
  };
  let e: Ergebnis;
  if (auftrag.art === 'beginnen') {
    const pos = freierPlatz(lage.bastion, auftrag.typ);
    const ort = auftrag.ausbau ? { ausbau: auftrag.ausbau } : pos ? { pos } : undefined;
    if (!ort) return { hindernisse: ['belegt'] };
    e = beginnen(lage.bastion, lage.konto, auftrag.typ, ort, a);
  } else if (auftrag.art === 'abbrechen') e = abbrechen(lage.bastion, auftrag.vorhaben, a);
  else if (auftrag.art === 'einlagern') e = einlagern(lage.bastion, auftrag.gebaeude, a);
  else if (auftrag.art === 'gestalten')
    e = gestalten(lage.bastion, auftrag.gebaeude, auftrag.farbe, a);
  else if (auftrag.art === 'aufstellen') {
    const typ = lage.bastion.lager.find((x) => x.id === auftrag.gebaeude)?.typ;
    const pos = typ ? freierPlatz(lage.bastion, typ) : undefined;
    if (!pos) return { hindernisse: ['belegt'] };
    e = aufstellen(lage.bastion, auftrag.gebaeude, pos, a);
  } else e = versetzen(lage.bastion, auftrag.gebaeude, auftrag.pos, a);
  if (!e.ok) return { hindernisse: e.hindernisse };
  const b = await bauSpeichern(db, inst, e, melder);
  return { ...lage, bastion: b, konto: await konto(db, inst.profil) };
}

/** Ist der Basebau eingeschaltet (R7)? Ohne Speicher: an (B-13). */
export async function basebauAn(): Promise<boolean> {
  const inst = await bereit();
  if (!inst) return basebauAktiv(undefined);
  return basebauAktiv(
    await einstellung(db, inst.profil, BASEBAU_SCHLUESSEL).catch(() => undefined),
  );
}

/** Gewähltes Thema der Bastion (B-17); ohne Speicher: Bastion. */
export async function themaWahl(): Promise<Thema> {
  const inst = await bereit();
  if (!inst) return themaAus(undefined);
  return themaAus(await einstellung(db, inst.profil, THEMA_SCHLUESSEL).catch(() => undefined));
}

/** Thema wechseln – jederzeit, kostenlos, ohne Verlust (B-17). */
export const themaSetzen = (thema: Thema) => setze(THEMA_SCHLUESSEL, thema, 'jugendlich');

/** Hell, dunkel oder System (GRAFIK §2); ohne Speicher: System. */
export async function modusWahl(): Promise<Modus> {
  const inst = await bereit();
  if (!inst) return modusAus(undefined);
  return modusAus(await einstellung(db, inst.profil, MODUS_SCHLUESSEL).catch(() => undefined));
}

export const modusSetzen = (modus: Modus) => setze(MODUS_SCHLUESSEL, modus, 'jugendlich');

/** Gewählte Klassenstufe und Schulart (L-12); ohne Speicher: Klasse 5, keine Schulart. */
export async function lernWahl(): Promise<{
  klasse: number;
  schulart: 'oberschule' | 'gymnasium' | undefined;
  /** noch nie gewählt – dann zählt beim ersten Hochstellen auch Klasse 5 als übersprungen */
  neu: boolean;
}> {
  const inst = await bereit();
  if (!inst) return { klasse: 5, schulart: undefined, neu: true };
  const k = await einstellung(db, inst.profil, KLASSE_SCHLUESSEL).catch(() => undefined);
  return {
    neu: k === undefined,
    klasse: klasseAus(k),
    schulart: schulartAus(
      await einstellung(db, inst.profil, SCHULART_SCHLUESSEL).catch(() => undefined),
    ),
  };
}

/** Klasse und Schulart pflegen Kind und Eltern (L-17) – protokolliert mit „durch wen“. */
export const klasseSetzen = (klasse: number, durch: 'jugendlich' | 'eltern' = 'jugendlich') =>
  setze(KLASSE_SCHLUESSEL, klasse, durch);
/** Keine Angabe wird als leerer Text gespeichert. */
export const schulartSetzen = (
  schulart: 'oberschule' | 'gymnasium' | undefined,
  durch: 'jugendlich' | 'eltern' = 'jugendlich',
) => setze(SCHULART_SCHLUESSEL, schulart ?? '', durch);

/** Profil (L-15): freiwilliges Geburtsdatum, „Ich bin erwachsen“, ob schon gefragt wurde. */
export async function profilWahl(): Promise<Profil & { gefragt: boolean }> {
  const inst = await bereit();
  if (!inst) return { geburtsdatum: undefined, erwachsen: false, gefragt: true };
  const jetzt = Date.now();
  const wert = (s: string) => einstellung(db, inst.profil, s).catch(() => undefined);
  return {
    geburtsdatum: geburtsdatumAus(
      await wert(GEBURTSDATUM_SCHLUESSEL),
      lerntag(jetzt, -new Date(jetzt).getTimezoneOffset()),
    ),
    erwachsen: (await wert(ERWACHSEN_SCHLUESSEL)) === true,
    gefragt: (await wert(PROFIL_GEFRAGT_SCHLUESSEL)) === true,
  };
}

export async function profilSetzen(p: Profil): Promise<void> {
  await setze(GEBURTSDATUM_SCHLUESSEL, p.geburtsdatum ?? '', 'jugendlich');
  await setze(ERWACHSEN_SCHLUESSEL, p.erwachsen, 'jugendlich');
  await setze(PROFIL_GEFRAGT_SCHLUESSEL, true, 'jugendlich');
}

export const profilUebersprungen = () => setze(PROFIL_GEFRAGT_SCHLUESSEL, true, 'jugendlich');

/** Zuletzt bestätigtes Schuljahr (L-17) – oder keins. */
export async function schuljahrGemerkt(): Promise<number | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  const w = await einstellung(db, inst.profil, SCHULJAHR_SCHLUESSEL).catch(() => undefined);
  return typeof w === 'number' ? w : undefined;
}

export const schuljahrSetzen = (jahr: number) => setze(SCHULJAHR_SCHLUESSEL, jahr, 'jugendlich');

/** „Gerade in der Schule dran“ (L-18) – gespeicherter Text; gelesen mit `auswahlAus`. */
export async function geradeDranWahl(): Promise<unknown> {
  const inst = await bereit();
  if (!inst) return undefined;
  return einstellung(db, inst.profil, GERADE_DRAN_SCHLUESSEL).catch(() => undefined);
}

export const geradeDranSetzen = (ids: readonly string[]) =>
  setze(GERADE_DRAN_SCHLUESSEL, ids.join(','), 'jugendlich');

/** Nächste Klassenarbeit (L-19) – gespeicherter Text; gelesen mit `klassenarbeitAus`. */
export async function klassenarbeitWahl(): Promise<unknown> {
  const inst = await bereit();
  if (!inst) return undefined;
  return einstellung(db, inst.profil, KLASSENARBEIT_SCHLUESSEL).catch(() => undefined);
}

export const klassenarbeitSetzen = (text: string) =>
  setze(KLASSENARBEIT_SCHLUESSEL, text, 'jugendlich');

/** Bauplatz als Bild zeigen (2.13)? Standard ja; aus = reizarm, nur die Liste. */
export async function bildZeigen(): Promise<boolean> {
  const inst = await bereit();
  if (!inst) return true;
  return (await einstellung(db, inst.profil, BILD_SCHLUESSEL).catch(() => undefined)) !== false;
}

export const bildSetzen = (an: boolean) => setze(BILD_SCHLUESSEL, an, 'jugendlich');

/** Gewählter Zoom des Bauplatzes (2.13a) – oder keiner (dann passt die App ihn an). */
export async function zoomWahl(): Promise<number | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  const w = await einstellung(db, inst.profil, ZOOM_SCHLUESSEL).catch(() => undefined);
  return typeof w === 'number' && w >= 1 && w <= 2 ? w : undefined;
}

export const zoomSetzen = (zoom: number) => setze(ZOOM_SCHLUESSEL, zoom, 'jugendlich');

/** Vorgemerktes Bauvorhaben (B-20) – oder keins. */
export async function zielVorgemerkt(): Promise<Ziel | undefined> {
  const inst = await bereit();
  if (!inst) return undefined;
  return zielAus(await einstellung(db, inst.profil, ZIEL_SCHLUESSEL).catch(() => undefined));
}

/** Ziel vormerken oder (ohne Ziel) die Vormerkung aufheben. */
export const zielSetzen = (z: Ziel | undefined) =>
  setze(ZIEL_SCHLUESSEL, z ? zielText(z) : '', 'jugendlich');

/** Basebau ein- oder ausschalten – Jugendliche und Eltern dürfen das (B-13). Das Ledger bucht weiter (B-10). */
export const basebauSetzen = (an: boolean, durch: 'jugendlich' | 'eltern') =>
  setze(BASEBAU_SCHLUESSEL, an, durch);

export const pinGesetzt = async () => (await lies('eltern.pin')) !== undefined;

/** Gibt es für dieses Profil eine PIN von einem anderen Gerät, aber keine hier (D-15)? */
export async function pinAusSicherung(): Promise<boolean> {
  const inst = await bereit();
  if (!inst || (await pinGesetzt())) return false;
  const alle = await einstellungsEreignisse(db, inst.profil).catch(() => []);
  return vonAnderemGeraet(alle, 'eltern.pin', inst.geraet);
}

/** Lerntage, an denen die PIN nach dem Einspielen einer Sicherung neu festgelegt wurde (D-15). */
export async function pinVermerke(): Promise<string[]> {
  const inst = await bereit();
  if (!inst) return [];
  const alle = await einstellungsEreignisse(db, inst.profil).catch(() => []);
  return alle
    .filter((e) => e.schluessel === PIN_NACH_SICHERUNG && typeof e.wert === 'string')
    .sort((a, b) => a.ts - b.ts)
    .map((e) => String(e.wert));
}

/** PIN festlegen (oder neu setzen); liefert den neuen Wiederherstellungscode (D-12). */
export async function pinFestlegen(pin: string): Promise<string> {
  if (await pinAusSicherung()) {
    const jetzt = Date.now();
    await setze(PIN_NACH_SICHERUNG, lerntag(jetzt, -new Date(jetzt).getTimezoneOffset()));
  }
  const code = wortcode(zufall);
  await setze('eltern.pin', await hashe(pin));
  await setze('eltern.wiederherstellung', await hashe(normalisiereCode(code)));
  return code;
}

export async function pinPruefen(pin: string): Promise<boolean> {
  const h = await lies('eltern.pin');
  return h !== undefined && pruefe(pin, h);
}

/** Mit dem Wiederherstellungscode eine neue PIN setzen; liefert den neuen Code oder undefined. */
export async function mitCodeZuruecksetzen(
  code: string,
  neuePin: string,
): Promise<string | undefined> {
  const h = await lies('eltern.wiederherstellung');
  if (h === undefined || !(await pruefe(normalisiereCode(code), h))) return undefined;
  return pinFestlegen(neuePin);
}

/** Ist es Zeit, an eine Sicherung zu erinnern (monatlich, ARCHITEKTUR §2)? */
export async function sicherungAnstehend(): Promise<boolean> {
  const inst = await bereit();
  if (!inst) return false;
  const [letzte, erste, tage] = await Promise.all([
    letzteSicherung(db).catch(() => undefined),
    ersteAufgabe(db, inst.profil).catch(() => undefined),
    erinnerungAlle(),
  ]);
  return sicherungFaellig(letzte, erste, Date.now(), tage);
}

/** Abstand der Sicherungs-Erinnerung in Tagen; 0 = aus (D-O4). */
export async function erinnerungAlle(): Promise<number> {
  const inst = await bereit();
  if (!inst) return erinnerungTage(undefined);
  return erinnerungTage(
    await einstellung(db, inst.profil, ERINNERUNG_SCHLUESSEL).catch(() => undefined),
  );
}

/** Eltern stellen den Abstand ein (als Einstellungs-Ereignis, D-5). */
export const erinnerungSetzen = (tage: number) => setze(ERINNERUNG_SCHLUESSEL, tage);

export async function letzteSicherungAm(): Promise<number | undefined> {
  return (await bereit()) ? letzteSicherung(db).catch(() => undefined) : undefined;
}

export interface NeueSicherung {
  readonly code: string;
  readonly name: string;
  readonly datei: Uint8Array;
}

/** Profil-Sicherung mit neuem Sicherungscode aus sechs Wörtern erstellen (D-9). */
export async function sicherungErstellen(): Promise<NeueSicherung> {
  const inst = await bereit();
  if (!inst) throw new Error('Speichern nicht möglich');
  const jetzt = Date.now();
  const tag = lerntag(jetzt, -new Date(jetzt).getTimezoneOffset());
  const code = wortcode(zufall, CODE_WOERTER);
  const datei = await verschluesseln(await exportieren(db, inst.profil), code, tag);
  return { code, name: dateiname(tag), datei };
}

/** Nach dem Speichern der Datei: für die Erinnerung festhalten. */
export async function sicherungGespeichert(): Promise<void> {
  if (await bereit()) await sicherungVermerken(db, Date.now());
}

export type EinspielenErgebnis =
  | { readonly ok: true; readonly neu: number }
  | { readonly ok: false; readonly grund: OeffnenFehler | 'anderes-profil' | 'speicher' };

/** Sicherungsdatei mit Code öffnen und einspielen (DATENMODELL §7.2). */
export async function sicherungEinspielen(
  datei: Uint8Array,
  code: string,
): Promise<EinspielenErgebnis> {
  const inst = await bereit();
  if (!inst) return { ok: false, grund: 'speicher' };
  const inhalt = await oeffnen(datei, code);
  if (typeof inhalt === 'string') return { ok: false, grund: inhalt };
  const r = await importieren(db, inhalt, inst.profil, Date.now()).catch(() => undefined);
  if (!r) return { ok: false, grund: 'speicher' };
  if (!r.ok) return r;
  installation = undefined; // Profil kann gewechselt haben
  await bereit(); // bucht, was aus der Sicherung noch fehlt
  return { ok: true, neu: r.neu };
}
