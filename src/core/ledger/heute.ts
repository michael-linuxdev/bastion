/**
 * Ertrag eines Lerntags für den Abschlussbildschirm (BASEBAU §6.1): welche
 * Ressourcen und woraus – nachvollziehbar (§3.5), aus den Buchungen des Tages.
 * Geratene Antworten zählen die Aufgaben selbst – ohne Stein gibt es dafür keine
 * Buchung. Rein.
 */
import type { Niveau } from '../competence/kompetenz';
import type { AufgabeEreignis } from '../learning/ereignis';
import { ernsthaft } from '../learning/sitzung';
import type { Tag } from '../policy/lerntag';
import type { BuchungEreignis } from './buchung';
import { ERTRAG, type Ressource } from './regeln';

export interface Tagesertrag {
  readonly menge: Readonly<Record<Ressource, number>>;
  /** ernsthaft bearbeitete Aufgaben, die Stein gebracht haben (voll oder halb) */
  readonly fleissAufgaben: number;
  /** Aufgaben jenseits des vollen Ertrags (ab der 26. am Tag, §3.1) */
  readonly weniger: boolean;
  /** sehr schnelle falsche Antworten ohne Stein (§3.1) */
  readonly geraten: number;
  readonly wiederholungen: number;
  readonly korrekturen: number;
  /** Erz über der Tagesgrenze */
  readonly gekappt: number;
  /** Heute gefestigte Themen, für die es einen Bauplan gab */
  readonly bauplaene: readonly { readonly kompetenz: string; readonly niveau: Niveau }[];
  /** Beide Bauschritte des Tages erreicht (§3.4) */
  readonly schritteVoll: boolean;
  /** Startpaket (B-24): für so viele in der Diagnose nachgewiesene Kompetenzen, mit Stein und Bauschritten */
  readonly startpaket: {
    readonly kompetenzen: number;
    readonly fleiss: number;
    readonly schritt: number;
  };
}

const zahl = (b: BuchungEreignis, schluessel: string) => b.aufschluesselung[schluessel] ?? 0;

export function tagesertrag(
  buchungen: readonly BuchungEreignis[],
  aufgaben: readonly AufgabeEreignis[],
  tag: Tag,
): Tagesertrag {
  // Nur Erarbeitetes – eine Erstattung nach Abbruch ist kein neuer Ertrag
  const heute = buchungen.filter(
    (b) =>
      b.tag === tag &&
      b.menge > 0 &&
      (b.grund === 'sitzung' || b.grund === 'kompetenz-gefestigt' || b.grund === 'vermittlung'),
  );
  const menge: Record<Ressource, number> = { fleiss: 0, behalten: 0, koennen: 0, schritt: 0 };
  let voll = 0;
  let halb = 0;
  const geraten = aufgaben.filter(
    (e) => e.tag === tag && e.ergebnis !== 'uebersprungen' && !ernsthaft(e),
  ).length;
  let wiederholungen = 0;
  let korrekturen = 0;
  let gekappt = 0;
  const bauplaene: { kompetenz: string; niveau: Niveau }[] = [];
  const startpaket = { kompetenzen: 0, fleiss: 0, schritt: 0 };
  for (const b of buchungen) {
    if (b.tag !== tag || b.grund !== 'startpaket' || b.menge <= 0) continue;
    if (b.ressource === 'fleiss') {
      startpaket.kompetenzen++;
      startpaket.fleiss += b.menge;
    } else if (b.ressource === 'schritt') startpaket.schritt += b.menge;
  }
  for (const b of heute) {
    menge[b.ressource] += b.menge;
    if (b.ressource === 'fleiss') {
      voll += zahl(b, 'voll');
      halb += zahl(b, 'halb');
    } else if (b.ressource === 'behalten') {
      wiederholungen += zahl(b, 'wiederholungen');
      korrekturen += zahl(b, 'korrekturen');
      gekappt += zahl(b, 'gekappt');
    } else if (b.ressource === 'koennen') {
      const [kompetenz = '', niveau] = b.bezug.split('@');
      if (niveau === 'G' || niveau === 'M' || niveau === 'E') bauplaene.push({ kompetenz, niveau });
    }
  }
  return {
    menge,
    fleissAufgaben: voll + halb,
    weniger: halb > 0,
    geraten,
    wiederholungen,
    korrekturen,
    gekappt,
    bauplaene,
    schritteVoll: menge.schritt >= ERTRAG.schritteJeTag,
    startpaket,
  };
}
