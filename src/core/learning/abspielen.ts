/**
 * Abspielen einer Erstvermittlung (VERMITTLUNG §2.2, INHALTSFORMAT §15): Antwort
 * auswerten und den nächsten Schritt bestimmen. Es wird nur verzweigt, was die
 * Sequenz vorgibt – nach richtig, nach erkannter Fehlvorstellung oder „sonst“.
 *
 * Rein: Die Sequenz und die Antwort werden hereingereicht.
 */
import { leseBruch, leseZahl } from './auswertung';
import { gleichGeschrieben } from './bruch';
import type { Schritt, Vermittlung } from './vermittlung';

/** Antwort der lernenden Person: Index der gewählten Option oder die Eingabe als Text. */
export type Eingabe = { readonly option: number } | { readonly text: string };

export type Bewertung =
  | { readonly richtig: true }
  /** fv: erkannte Fehlvorstellung; ohne fv ist die falsche Antwort unbekannt */
  | { readonly richtig: false; readonly fv?: string }
  /** Eingabe ist nicht lesbar (leer, keine Zahl) – zählt nicht als Antwort */
  | { readonly ungueltig: true };

/** Gleiche Schreibweise einer Zahl oder eines Bruchs (Bruch: genau so, nicht nur wertgleich). */
function gleich(art: 'zahl' | 'bruch', a: string, b: string): boolean | undefined {
  if (art === 'zahl') {
    const x = leseZahl(a);
    const y = leseZahl(b);
    return x.ok && y.ok ? x.wert === y.wert : undefined;
  }
  const x = leseBruch(a);
  const y = leseBruch(b);
  return x.ok && y.ok ? gleichGeschrieben(x.wert, y.wert) : undefined;
}

export function bewerte(schritt: Schritt, eingabe: Eingabe): Bewertung {
  const a = schritt.antwort;
  if (!a) return { richtig: true };
  if ('optionen' in a) {
    if (!('option' in eingabe)) return { ungueltig: true };
    const o = a.optionen[eingabe.option];
    if (!o) return { ungueltig: true };
    if (o.richtig === true) return { richtig: true };
    return o.fv ? { richtig: false, fv: o.fv } : { richtig: false };
  }
  if (!('text' in eingabe)) return { ungueltig: true };
  const { art, loesung, fehler = [] } = a.eingabe;
  const richtig = gleich(art, eingabe.text, loesung);
  if (richtig === undefined) return { ungueltig: true };
  if (richtig) return { richtig: true };
  const fv = fehler.find((x) => gleich(art, eingabe.text, x.wert))?.fv;
  return fv ? { richtig: false, fv } : { richtig: false };
}

export type Ziel =
  | { readonly art: 'schritt'; readonly schritt: Schritt }
  /** Rückweg: Diese Voraussetzung fehlt vermutlich (VERMITTLUNG §2.2). */
  | { readonly art: 'voraussetzung'; readonly kompetenz: string; readonly danach?: Schritt }
  /** Nach `uebergang` ist die Sequenz zu Ende. */
  | { readonly art: 'ende' };

const schrittMit = (v: Vermittlung, id: string | undefined) =>
  id === undefined ? undefined : v.schritte.find((s) => s.id === id);

/** Der erste Schritt der Sequenz. */
export const erster = (v: Vermittlung): Schritt | undefined => v.schritte[0];

/**
 * Wohin nach diesem Schritt? Richtig oder ohne Antwort: `weiter`. Falsch: der Eintrag
 * in `bei` zur erkannten Fehlvorstellung, sonst `bei.sonst`, sonst `weiter`.
 * Ein Ziel, das kein Schritt ist, ist eine Kompetenz-ID (Rückweg zur Voraussetzung).
 * Ist diese Kompetenz nicht ausgeliefert (`verfuegbar` sagt nein, öffentliche Seite
 * ARCHITEKTUR T-20), geht es ohne Umweg bei `weiter` weiter: kein Rückweg ins Leere.
 */
export function naechstes(
  v: Vermittlung,
  schritt: Schritt,
  b?: Bewertung,
  verfuegbar: (kompetenz: string) => boolean = () => true,
): Ziel {
  if (schritt.typ === 'uebergang') return { art: 'ende' };
  const falsch = b !== undefined && 'richtig' in b && !b.richtig;
  const ziel = falsch
    ? ((b.fv ? schritt.bei?.[b.fv] : undefined) ?? schritt.bei?.['sonst'] ?? schritt.weiter)
    : schritt.weiter;
  const s = schrittMit(v, ziel);
  if (s) return { art: 'schritt', schritt: s };
  if (ziel === undefined) return { art: 'ende' };
  const danach = schrittMit(v, schritt.weiter);
  if (!verfuegbar(ziel)) return danach ? { art: 'schritt', schritt: danach } : { art: 'ende' };
  return danach
    ? { art: 'voraussetzung', kompetenz: ziel, danach }
    : { art: 'voraussetzung', kompetenz: ziel };
}

/** Text der richtigen Antwort, für die Rückmeldung nach einer falschen Antwort. */
export function richtigeAntwort(schritt: Schritt): string | undefined {
  const a = schritt.antwort;
  if (!a) return undefined;
  if ('optionen' in a) return a.optionen.find((o) => o.richtig === true)?.wert.de;
  return a.eingabe.loesung;
}

/** Kurzfassung zum Nachschlagen (VERMITTLUNG §2.4): nur Beispiele und Merksätze. */
export const kurzfassung = (v: Vermittlung): Schritt[] =>
  v.schritte.filter((s) => s.typ === 'beispiel' || s.typ === 'merksatz');
