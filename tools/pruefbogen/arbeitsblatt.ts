// Arbeitsblatt für Lehrkräfte (FOKUS F6, kleiner Vorläufer von U7): neue Aufgaben zu
// ausgewählten Kompetenzen auf einem Niveau, mit Platz zum Rechnen, dahinter eine Seite mit
// Lösungen und Lösungsweg. Druck im Browser als PDF, wie beim Prüfbogen.
// Rein: gleiche Eingabe und gleicher Seed ergeben dasselbe Blatt. Zufall nur über src/core/rng.
import type { Kompetenz, Niveau } from '../../src/core/competence/kompetenz';
import type { Generator, Instanz, Loesung } from '../../src/core/learning/generator';
import { wirksameStufe } from '../../src/core/learning/review';
import { zahlText } from '../../src/core/learning/text';
import type { GeneratorVorlage } from '../../src/core/learning/vorlage';
import { rng } from '../../src/core/rng/rng';
import { esc } from './html';
import { GRUND_STIL, loesungText, text } from './satz';

export interface BlattEingabe {
  /** Kompetenzen in der gewünschten Reihenfolge */
  readonly kompetenzen: readonly Kompetenz[];
  readonly vorlagen: readonly GeneratorVorlage[];
  readonly generatoren: ReadonlyMap<string, Generator<unknown>>;
}

export interface BlattOptionen {
  readonly niveau: Niveau;
  readonly anzahl: number;
  readonly seed: number;
}

export interface BlattAufgabe {
  readonly nr: number;
  readonly vorlage: GeneratorVorlage;
  readonly seed: number;
  readonly instanz: Instanz;
}

/** Wortlaut der Fußzeile je Review-Stufe (INHALTSFORMAT §8) */
export const STUFEN_TEXT: Readonly<Record<0 | 1 | 2 | 3, string>> = {
  0: 'Entwurf, nicht fachlich geprüft',
  1: 'Maschinell geprüft, noch nicht fachlich geprüft',
  2: 'Stichprobe von einer Lehrkraft fachlich geprüft',
  3: 'Fachlich geprüft und mit Lernenden bewährt',
};

const OHNE_BEGRIFFE = (s: string) => s.replace(/\[\[([^\]]+)\]\]/g, '$1');
const blattText = (s: string, i: Instanz) => text(OHNE_BEGRIFFE(s), i.platzhalter);

/** Vorlagen, die Aufgaben auf diesem Niveau erzeugen können, in der Reihenfolge der Kompetenzen. */
export function passendeVorlagen(e: BlattEingabe, niveau: Niveau): GeneratorVorlage[] {
  return e.kompetenzen.flatMap((k) =>
    e.vorlagen.filter(
      (v) =>
        v.kompetenz === k.id &&
        v.niveaus.includes(niveau) &&
        v.parameter[niveau] !== undefined &&
        e.generatoren.has(v.generator),
    ),
  );
}

/**
 * Aufgaben ziehen: die Vorlagen der Reihe nach, damit jede gleich oft vorkommt; der Seed je
 * Aufgabe kommt aus dem Blatt-Seed. Doppelte Aufgaben werden neu gezogen. Danach nach Vorlage
 * geordnet, damit Gleichartiges zusammensteht.
 */
export function ziehe(e: BlattEingabe, o: BlattOptionen): BlattAufgabe[] {
  const vorlagen = passendeVorlagen(e, o.niveau);
  const fehlend = e.kompetenzen.filter((k) => !vorlagen.some((v) => v.kompetenz === k.id));
  if (fehlend.length > 0)
    throw new Error(
      `Keine Aufgaben auf Niveau ${o.niveau} für: ${fehlend.map((k) => k.id).join(', ')}`,
    );
  const r = rng(o.seed);
  const gesehen = new Set<string>();
  const gezogen: Omit<BlattAufgabe, 'nr'>[] = [];
  for (let i = 0; i < o.anzahl; i++) {
    const vorlage = vorlagen[i % vorlagen.length] as GeneratorVorlage;
    const g = e.generatoren.get(vorlage.generator) as Generator<unknown>;
    let seed = 0;
    let instanz: Instanz | undefined;
    for (let versuch = 0; versuch < 20; versuch++) {
      seed = r.int(1, 0x7fffffff);
      instanz = g.erzeuge(seed, vorlage.parameter[o.niveau]);
      const schluessel = `${vorlage.id}|${blattText(vorlage.text.aufgabe.de, instanz)}|${JSON.stringify(instanz.optionen ?? instanz.elemente ?? '')}`;
      if (!gesehen.has(schluessel)) {
        gesehen.add(schluessel);
        break;
      }
    }
    gezogen.push({ vorlage, seed, instanz: instanz as Instanz });
  }
  const rang = (v: GeneratorVorlage) => vorlagen.indexOf(v);
  return gezogen
    .map((a, i) => ({ a, i }))
    .sort((x, y) => rang(x.a.vorlage) - rang(y.a.vorlage) || x.i - y.i)
    .map(({ a }, i) => ({ ...a, nr: i + 1 }));
}

/** Niedrigste wirksame Review-Stufe der benutzten Vorlagen: Das Blatt ist so gut geprüft wie sein schwächster Teil. */
export function blattStufe(aufgaben: readonly BlattAufgabe[]): 0 | 1 | 2 | 3 {
  const stufen = aufgaben.map((a) =>
    wirksameStufe(a.vorlage as unknown as Record<string, unknown>),
  );
  return stufen.length === 0 ? 0 : (Math.min(...stufen) as 0 | 1 | 2 | 3);
}

function loesungHtml(l: Loesung, i: Instanz): string {
  if (l.typ === 'bruch')
    return `<span class="br"><span>${zahlText(l.wert.zaehler)}</span><span>${zahlText(l.wert.nenner)}</span></span>`;
  return loesungText(l, i.optionen);
}

function aufgabeHtml(a: BlattAufgabe): string {
  const i = a.instanz;
  const bild = i.bild
    ? `<div class="bild" role="img" aria-label="${esc(i.bild.beschreibung.de)}">${i.bild.svg}</div>`
    : '';
  const elemente = i.elemente
    ? `<p class="elemente">${i.elemente.map(zahlText).join(' &nbsp; ')}</p>`
    : '';
  const optionen = i.optionen
    ? `<div class="optionen">${i.optionen
        .map(
          (o, n) =>
            `<span class="option"><b>${String.fromCharCode(65 + n)}</b> ${o.text ? esc(o.text.de) : ''}${o.bild ? o.bild.svg : ''}</span>`,
        )
        .join('')}</div>`
    : '';
  const antwort = i.optionen
    ? '<p class="antwort">Kreuze an oder schreibe den Buchstaben: ______</p>'
    : '<p class="antwort">Ergebnis: ____________________</p>';
  return `<section class="aufgabe"><p class="frage"><b class="nr">${a.nr}</b> ${blattText(a.vorlage.text.aufgabe.de, i)}</p>${bild}${elemente}${optionen}<div class="rechnen${i.optionen ? ' klein' : ''}" aria-label="Platz zum Rechnen"></div>${antwort}</section>`;
}

function loesungZeile(a: BlattAufgabe): string {
  const i = a.instanz;
  const weg =
    i.loesungsweg.length > 0
      ? `<ol class="weg">${i.loesungsweg.map((s) => `<li>${text(OHNE_BEGRIFFE(s.de), i.platzhalter)}</li>`).join('')}</ol>`
      : '';
  return `<div class="loesung"><p><b class="nr">${a.nr}</b> <b>${loesungHtml(i.loesung, i)}</b></p>${weg}</div>`;
}

export function arbeitsblatt(e: BlattEingabe, o: BlattOptionen): string {
  const aufgaben = ziehe(e, o);
  const thema = e.kompetenzen.map((k) => k.titel.de).join(' · ');
  const stufe = blattStufe(aufgaben);
  const fuss = `<footer><span>Bastion · Arbeitsblatt Nr. ${o.seed} · Niveau ${esc(o.niveau)}</span><span class="stufe">Inhalte: ${STUFEN_TEXT[stufe]} (Review-Stufe ${stufe})</span></footer>`;
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Arbeitsblatt ${esc(thema)}</title>
<style>${GRUND_STIL}${STIL}</style></head>
<body>
<main class="blatt">
<header class="kopf"><p class="zeile"><span>Name: ______________________________</span><span>Datum: ______________</span></p>
<h1>${esc(thema)}</h1>
<p class="hinweis">${aufgaben.length} Aufgaben · Niveau ${esc(o.niveau)} · Rechne im Kasten und schreibe das Ergebnis darunter.</p></header>
<div class="aufgaben">${aufgaben.map(aufgabeHtml).join('')}</div>
${fuss}
</main>
<main class="blatt loesungen">
<header class="kopf"><h1>Lösungen: ${esc(thema)}</h1>
<p class="hinweis">Arbeitsblatt Nr. ${o.seed} · Niveau ${esc(o.niveau)} · Für die Lehrkraft</p></header>
<div class="liste">${aufgaben.map(loesungZeile).join('')}</div>
${fuss}
</main>
</body></html>
`;
}

const STIL = `
@page { size: A4; margin: 15mm 15mm 18mm; }
h1 { font-size: 15pt; margin-block: .4rem; }
.kopf .zeile { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-block: 0; }
.hinweis { color: #555; font-size: 9pt; margin-block: 0 .6rem; }
.aufgaben { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem 1.2rem; }
.aufgabe { break-inside: avoid; display: flex; flex-direction: column; }
.frage { margin-block: 0 .3rem; }
.nr { display: inline-block; min-inline-size: 1.4rem; }
.rechnen { flex: 1; min-block-size: 4.5cm; border: 1px solid #999; background-image: linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px); background-size: 5mm 5mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.rechnen.klein { flex: 0 0 auto; min-block-size: 1.5cm; }
.antwort { margin-block: .3rem 0; }
.optionen { display: flex; flex-wrap: wrap; gap: .5rem; margin-block-end: .3rem; }
.option svg { inline-size: 6.5rem; block-size: auto; vertical-align: middle; }
.bild svg { inline-size: 9rem; block-size: auto; }
.blatt .br { font-size: 10.5pt; }
.elemente { font-size: 12pt; margin-block: .2rem; }
.loesungen { break-before: page; }
.liste { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem 1.2rem; }
.loesung { break-inside: avoid; border-block-start: 1px solid #bbb; padding-block-start: .3rem; }
.loesung p { margin: 0; }
ol.weg { margin: .2rem 0 0; padding-inline-start: 1.2rem; font-size: 10pt; }
footer { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; border-block-start: 1px solid #999; margin-block-start: 1rem; padding-block-start: .3rem; font-size: 8.5pt; color: #444; }
footer .stufe { font-weight: bold; }
@media (max-width: 36rem) { .aufgaben, .liste { grid-template-columns: 1fr; } }
@media print { body { padding: 0; max-inline-size: none; } }
`;
