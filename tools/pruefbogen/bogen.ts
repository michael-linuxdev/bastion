// Prüfbogen für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2): setzt Erstvermittlungen,
// Fehlvorstellungen, Aufgabenvorlagen mit Stichprobe und Fachbegriffe ausgewählter Kompetenzen
// als druckbare HTML-Seite zusammen. Prüfende brauchen weder YAML noch Git.
// Rein: alle Inhalte und Generatoren werden hereingereicht; gleiche Eingabe, gleiche Seite.
import type { Fehlvorstellung } from '../../src/core/learning/fehlvorstellung';
import type { Instanz } from '../../src/core/learning/generator';
import {
  FRAGEN,
  pruefbogenModell,
  type AbschnittA,
  type AbschnittB,
  type AbschnittC,
  type AntwortZeile,
  type NiveauStichprobe,
  type PruefEingabe,
  type Teil,
  type Verweis,
} from '../../src/core/learning/pruefbogen';
import type { WerkzeugAngabe } from '../../src/core/learning/vermittlung';
import type { GeneratorVorlage } from '../../src/core/learning/vorlage';
import { breiten, startzustand } from '../../src/ui/vermittlung/werkzeuge/bruchstreifen';
import { stelle, striche } from '../../src/ui/vermittlung/werkzeuge/zahlenstrahl';
import { t, type TextSchluessel } from '../../src/ui/texte/texte';
import { esc } from './html';
import { GRUND_STIL, loesungText, text } from './satz';

/** Eingabe des Bogens: wie im Kern, mit Datum für den Kopf und fester Stichprobe. */
export interface BogenEingabe extends PruefEingabe {
  /** Aufgaben je Vorlage und Niveau (INHALTSFORMAT §8: 20) */
  readonly stichprobe: number;
  /** Datum auf dem Bogen, JJJJ-MM-TT */
  readonly datum: string;
}

export { genannteBegriffe, genannteFehlvorstellungen } from '../../src/core/learning/pruefbogen';

export interface BogenOptionen {
  /** Kurzer Name, z. B. „Musterfeld Brüche“; sonst die Titel der Kompetenzen */
  readonly name?: string;
}

const SCHRITT_NAMEN: Readonly<Record<string, string>> = {
  ziel: 'Ziel',
  anknuepfen: 'Vorwissen',
  entdecken: 'Entdecken',
  erklaeren: 'Erklären',
  beispiel: 'Beispiel',
  ergaenzen: 'Selbst ergänzen',
  gegenbeispiel: 'Gegenbeispiel',
  merksatz: 'Merksatz',
  pruefen: 'Prüfen',
  uebergang: 'Übergang ins Üben',
};

const TEIL_NAMEN: Readonly<Record<string, string>> = {
  'so-denkst-du': 'So denkst du',
  'warum-nicht': 'Warum es nicht stimmt',
  'so-stimmt-es': 'So stimmt es',
};

// Prüflisten aus VERMITTLUNG §2.5 und §3.5, in Fragen umformuliert; dieselben Texte wie in der App
const fragen = (teil: Teil) =>
  Array.from({ length: FRAGEN[teil] }, (_, i) =>
    t(`pruefen.frage.${teil}${i + 1}` as TextSchluessel),
  );

/** Kleines SVG für die Werkzeuge der Erstvermittlung (Bruchstreifen, Zahlenstrahl). */
export function werkzeugBild(w: WerkzeugAngabe): string {
  const p = w.parameter ?? {};
  if (w.werkzeug === 'bruchstreifen@1') {
    const z = startzustand(p);
    const b = breiten(z.teile, p['ungleich'] === true);
    let x = 0;
    const rechtecke = b.map((breite, i) => {
      const r = `<rect x="${(x * 240).toFixed(1)}" y="1" width="${(breite * 240).toFixed(1)}" height="22" fill="${z.gefaerbt[i] ? '#f0a830' : '#fff'}" stroke="#333"/>`;
      x += breite;
      return r;
    });
    const gefaerbt = z.gefaerbt.filter(Boolean).length;
    return `<figure><svg viewBox="0 0 242 25" width="242" height="25" role="img" aria-label="Bruchstreifen">${rechtecke.join('')}</svg><figcaption>Bruchstreifen: ${z.teile} ${z.teile === 1 ? 'Teil' : 'Teile'}${p['ungleich'] === true ? ' (absichtlich ungleich)' : ''}, ${gefaerbt} gefärbt</figcaption></figure>`;
  }
  if (w.werkzeug === 'zahlenstrahl@1') {
    const e = typeof p['einteilung'] === 'number' ? p['einteilung'] : 1;
    const s = striche(p);
    const markiert = p['markiert'];
    const teile = s.map((st) => {
      const x = (10 + st.lage * 260).toFixed(1);
      const lang = st.ganz ? 8 : 4;
      const marke = st.zaehler === markiert ? `<circle cx="${x}" cy="15" r="4" fill="#c03"/>` : '';
      const schrift = st.ganz
        ? `<text x="${x}" y="34" font-size="10" text-anchor="middle">${esc(stelle(st.zaehler, e))}</text>`
        : '';
      return `<line x1="${x}" x2="${x}" y1="${15 - lang}" y2="${15 + lang}" stroke="#333"/>${marke}${schrift}`;
    });
    const beschrift =
      typeof markiert === 'number' ? `, markiert bei ${stelle(markiert, e)}` : ', nichts markiert';
    return `<figure><svg viewBox="0 0 280 38" width="280" height="38" role="img" aria-label="Zahlenstrahl"><line x1="10" x2="270" y1="15" y2="15" stroke="#333"/>${teile.join('')}</svg><figcaption>Zahlenstrahl in ${e}-teln${beschrift}</figcaption></figure>`;
  }
  return `<p class="hinweis">Bild: ${esc(w.werkzeug)} ${esc(JSON.stringify(p))}</p>`;
}

/** Prüffragen, Urteil und Anmerkungen zum Ankreuzen. Ausfüllen am Bildschirm: App (T-22). */
function urteil(fragen: readonly string[]): string {
  return `<div class="urteil"><ul class="fragen">${fragen.map((f) => `<li>☐ ${esc(f)}</li>`).join('')}</ul>
<p class="kaesten">Urteil: ☐ passt &nbsp; ☐ passt mit Änderung &nbsp; ☐ falsch</p>
<p class="linien">Anmerkungen und neuer Wortlaut:</p></div>`;
}

const abschnitt = (klasse: string, s: string, titel: string) =>
  `<section class="${klasse} abschnitt" data-s="${esc(s)}" data-titel="${esc(titel)}"`;

const ohneTags = (html: string) => html.replace(/<[^>]+>/g, '');

interface Kontext {
  readonly e: BogenEingabe;
}

/** Verweis als Text, wie ihn die Prüfenden lesen */
function ziel(z: Verweis): string {
  switch (z.art) {
    case 'weiter':
      return 'weiter';
    case 'schritt':
      return `Schritt ${z.nr}`;
    case 'erstvermittlung':
      return `Erstvermittlung „${esc(z.titel)}“, Schritt ${z.nr ?? esc(z.schritt)}`;
    case 'voraussetzung':
      return `Voraussetzung „${esc(z.titel)}“`;
    case 'unbekannt':
      return esc(z.text);
  }
}

const fvName = (k: Kontext, id: string) => {
  const fv = k.e.fehlvorstellungen.get(id);
  return fv ? `<a href="#${esc(id)}">${esc(fv.name.de)}</a>` : esc(id);
};

function antwortHtml(k: Kontext, antworten: readonly AntwortZeile[], sonst?: Verweis): string {
  if (antworten.length === 0 && !sonst) return '';
  const zeilen = antworten.map((a) => {
    const wert = a.eingabe ? esc(a.wert) : text(a.wert);
    if (a.richtig) return `<li class="richtig">✓ ${a.eingabe ? 'Eingabe ' : ''}${wert}</li>`;
    return `<li>✗ ${wert}${a.fv ? ` · Fehler: ${fvName(k, a.fv)} → ${ziel(a.ziel ?? { art: 'weiter' })}` : ''}</li>`;
  });
  if (sonst) zeilen.push(`<li>Sonst falsch → ${ziel(sonst)}</li>`);
  return `<ul class="antworten">${zeilen.join('')}</ul>`;
}

function vermittlungHtml(k: Kontext, a: AbschnittA): string {
  const v = a.vermittlung;
  if (!v) return `<p class="hinweis">Keine Erstvermittlung.</p>`;
  const zeilen = a.schritte.map(({ nr, schritt: s, antworten, sonst }) => {
    const bild = s.bild ? werkzeugBild(s.bild) : '';
    const werkzeug = s.werkzeug
      ? `<p class="hinweis">Zum Ausprobieren:</p>${werkzeugBild({ werkzeug: s.werkzeug.id, parameter: s.werkzeug.parameter ?? {} })}`
      : '';
    const uebergang = s.vorlagen
      ? `<p class="hinweis">Danach ${s.anzahl ?? ''} Aufgaben aus: ${s.vorlagen.map(esc).join(', ')}</p>`
      : '';
    return `<tr><td class="nr">${nr}</td><td class="typ">${esc(SCHRITT_NAMEN[s.typ] ?? s.typ)}</td><td>${text(s.text.de)}${bild}${werkzeug}${s.antwort ? antwortHtml(k, antworten, sonst) : ''}${uebergang}</td><td class="notiz"></td></tr>`;
  });
  return `<p class="hinweis">Etwa ${v.dauer_min} Minuten · Niveau ${esc(v.niveau)} · <u>Unterstrichen</u> = Fachbegriff, antippbar (Teil D)</p>
<div class="tabelle"><table class="schritte"><thead><tr><th>Nr.</th><th>Art</th><th>Was das Kind sieht und antworten kann</th><th>Notiz</th></tr></thead><tbody>${zeilen.join('')}</tbody></table></div>
${urteil(fragen('A'))}`;
}

function fehlvorstellungHtml(k: Kontext, b: AbschnittB): string {
  const fv: Fehlvorstellung = b.fv;
  const lang = fv.erklaerung.lang
    .map(
      (t) =>
        `<dt>${esc(TEIL_NAMEN[t.teil] ?? t.teil)}</dt><dd>${text(t.de)}${t.bild ? werkzeugBild(t.bild) : ''}</dd>`,
    )
    .join('');
  const fehlerbilder = b.rueckmeldungen.map(
    (r) =>
      `<li><span class="quelle">${esc(r.vorlage)} · ${r.schritt ? `Schritt ${esc(r.schritt)} · ` : ''}${esc(r.fehlerbild)}</span><br>${text(r.text)}</li>`,
  );
  const rueckweg = [
    `Erklärung: ${ziel(b.rueckweg.erklaerung)}`,
    ...(b.rueckweg.voraussetzung ? [`Voraussetzung: ${ziel(b.rueckweg.voraussetzung)}`] : []),
  ].join('<br>');
  return `${abschnitt('fv', b.id, fv.name.de)} id="${esc(fv.id)}"><h3>${esc(fv.name.de)}</h3>
<p class="hinweis">${esc(fv.id)} · Art: ${esc(fv.art)} · gehört zu ${fv.kompetenzen.map((id) => esc(k.e.alleKompetenzen.get(id)?.titel.de ?? id)).join(', ')}</p>
<p><i>Für Prüfende:</i> ${esc(fv.beschreibung.de)}</p>
<dl><dt>Kurze Erklärung</dt><dd>${text(fv.erklaerung.kurz.de)}</dd>${lang}
<dt>Gegenbeispiel</dt><dd>${text(fv.gegenbeispiel.de)}</dd>
<dt>Rückweg</dt><dd>${rueckweg}</dd>
<dt>Kontrastaufgaben</dt><dd>${fv.kontrast.map(esc).join(', ')}</dd></dl>
${fehlerbilder.length > 0 ? `<p><b>Rückmeldungen in Aufgaben, unter denen die kurze Erklärung erscheint:</b></p><ul class="fehlerbilder">${fehlerbilder.join('')}</ul>` : ''}
${urteil(fragen('B'))}</section>`;
}

function instanzZeile(k: Kontext, v: GeneratorVorlage, i: Instanz, nr: number): string {
  const aufgabe = text(v.text.aufgabe.de, i.platzhalter);
  const optionen = i.optionen
    ? `<div class="optionen">${i.optionen
        .map(
          (o, n) =>
            `<span class="option"><b>${String.fromCharCode(65 + n)}</b> ${o.text ? esc(o.text.de) : ''}${o.bild ? o.bild.svg : ''}</span>`,
        )
        .join('')}</div>`
    : '';
  const bild = i.bild ? `<div class="aufgabenbild">${i.bild.svg}</div>` : '';
  const falsch = i.fehlerbilder
    .map((f) => `${loesungText(f.antwort, i.optionen)} <span class="quelle">(${esc(f.id)})</span>`)
    .join('<br>');
  return `<tr><td class="nr">${nr}</td><td>${aufgabe}${bild}${optionen}</td><td>${loesungText(i.loesung, i.optionen)}</td><td>${falsch}</td><td class="kasten">☐</td></tr>`;
}

function wegHtml(v: GeneratorVorlage, weg: NiveauStichprobe['weg']): string {
  if (!weg) return '';
  const zeilen = weg.zeilen.map((z) => {
    const frage = z.frage ? text(z.frage, z.platzhalter) : esc(z.id);
    const falsch = z.falsch
      .map((f) => `${loesungText(f.antwort)} <span class="quelle">(${esc(f.id)})</span>`)
      .join(', ');
    return `<li>${frage} → <b>${loesungText(z.loesung)}</b>${falsch ? ` · falsch erkannt: ${falsch}` : ''}</li>`;
  });
  return `<p><b>Zwischenschritte</b> (erscheinen nach einem falschen Ergebnis), am Beispiel ${text(v.text.aufgabe.de, weg.beispiel.platzhalter)}:</p><ol class="weg">${zeilen.join('')}</ol>`;
}

function vorlageHtml(k: Kontext, c: AbschnittC): string {
  const v = c.vorlage;
  const hilfen = v.hilfen.map((h) => `<li>${text(h.de)}</li>`).join('');
  const rueck = Object.entries(v.fehlerbilder)
    .map(([id, f]) => `<li><span class="quelle">${esc(id)}</span> ${text(f.de)}</li>`)
    .join('');
  const niveaus = c.generatorFehlt
    ? v.niveaus.map(() => `<p class="hinweis">Generator ${esc(v.generator)} fehlt.</p>`)
    : c.niveaus.map(
        (n) => `<h4>Niveau ${esc(n.niveau)}: ${n.aufgaben.length} Beispielaufgaben</h4>
<div class="tabelle"><table class="stichprobe"><thead><tr><th>Nr.</th><th>Aufgabe</th><th>Lösung</th><th>Erkannte falsche Antworten</th><th>ok</th></tr></thead><tbody>${n.aufgaben.map((i, s) => instanzZeile(k, v, i, s + 1)).join('')}</tbody></table></div>
${wegHtml(v, n.weg)}`,
      );
  const titel = text(v.text.aufgabe.de.replace(/\{[a-z_]+\}/g, '…'));
  return `${abschnitt('vorlage', c.id, ohneTags(titel))}><h3>${titel}</h3>
<p class="hinweis">${esc(v.id)} · Niveaus ${v.niveaus.join(', ')}</p>
<p><b>Hilfen:</b></p><ol>${hilfen}</ol>
<p><b>Rückmeldungen bei typischen falschen Antworten:</b></p><ul class="fehlerbilder">${rueck}</ul>
${niveaus.join('')}
${urteil(fragen('C'))}</section>`;
}

export function pruefbogen(e: BogenEingabe, optionen: BogenOptionen = {}): string {
  const k: Kontext = { e };
  const modell = pruefbogenModell(e);
  const begriffe = modell.d.begriffe;
  const titel = e.kompetenzen.map((x) => x.titel.de).join(' · ');

  const teilA = modell.a
    .map(
      (a, i) =>
        `${abschnitt('kompetenz', a.id, a.kompetenz.titel.de)}><h3>A${i + 1} ${esc(a.kompetenz.titel.de)}</h3><p>${esc(a.kompetenz.kann_satz.de)} <span class="hinweis">(${esc(a.kompetenz.id)}, Klasse ${a.kompetenz.klassenstufe_typisch.join('/')})</span></p>${vermittlungHtml(k, a)}</section>`,
    )
    .join('');
  const teilB = modell.b.map((b) => fehlvorstellungHtml(k, b)).join('');
  const teilC = modell.c.map((c) => vorlageHtml(k, c)).join('');
  const teilD = `${abschnitt('begriffe', 'D-begriffe', 'Fachbegriffe')}><div class="tabelle"><table class="begriffe"><thead><tr><th>Begriff</th><th>Erklärung für das Kind</th><th>ok</th></tr></thead><tbody>${begriffe
    .map(
      (b) =>
        `<tr><td><b>${esc(b.wort.de)}</b></td><td>${text(b.erklaerung.de)}</td><td class="kasten">☐</td></tr>`,
    )
    .join('')}</tbody></table></div>${urteil(fragen('D'))}</section>`;
  const fvIds = modell.b;
  const anzahlVorlagen = modell.c.length;

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfbogen ${esc(optionen.name ?? titel)}</title>
<style>${STIL}</style></head>
<body>
<header><h1>Prüfbogen Bastion</h1><p class="titel">${esc(titel)}</p>
<p>Stand der Inhalte: ${esc(e.datum)} · Alles ist KI-Entwurf und noch nicht fachlich geprüft.</p>
<p class="linien">Name der prüfenden Person: ____________________ &nbsp; Datum: ____________</p>
<h2>So geht die Prüfung</h2>
<ol>
<li><b>Teil A</b> zeigt jede Erstvermittlung Schritt für Schritt, wie das Kind sie sieht. Bei Fragen steht, welche Antworten richtig sind und wohin eine falsche Antwort führt.</li>
<li><b>Teil B</b> zeigt die Fehlvorstellungen: den Denkfehler, die Erklärungen und die Rückmeldungen, unter denen sie erscheinen.</li>
<li><b>Teil C</b> zeigt die Übungsaufgaben mit je ${e.stichprobe} erzeugten Beispielen pro Niveau. Bitte jede Zeile abhaken, die stimmt.</li>
<li><b>Teil D</b> zeigt die Fachbegriffe, die ein Kind antippen kann.</li>
</ol>
<p>Bitte unter jedem Abschnitt ein Urteil ankreuzen. Bei „passt mit Änderung“ den neuen Wortlaut direkt danebenschreiben. Zeilen-Nummern und Kennungen in grauer Schrift helfen beim Einarbeiten.</p>
<p>Inhalt: Teil A ${e.kompetenzen.length} Erstvermittlungen · Teil B ${fvIds.length} Fehlvorstellungen · Teil C ${anzahlVorlagen} Aufgabenvorlagen · Teil D ${begriffe.length} Fachbegriffe</p>
</header>
<h2 class="teil">Teil A: Erstvermittlungen</h2>${teilA}
<h2 class="teil">Teil B: Fehlvorstellungen</h2>${teilB}
<h2 class="teil">Teil C: Übungsaufgaben</h2>${teilC}
<h2 class="teil">Teil D: Fachbegriffe</h2>${teilD}
<footer><p class="linien">Gesamturteil und Unterschrift:</p></footer>
</body></html>
`;
}

const STIL = `${GRUND_STIL}
h1 { margin-block: 0; }
h2.teil { break-before: page; border-block-end: 2px solid #333; }
h3 { margin-block: 1.2rem .3rem; }
h4 { margin-block: .8rem .3rem; }
.titel { font-size: 13pt; font-weight: bold; }
.hinweis, .quelle { color: #666; font-size: 9pt; }
table { border-collapse: collapse; inline-size: 100%; margin-block: .5rem; }
th, td { border: 1px solid #999; padding: .25rem .35rem; vertical-align: top; text-align: start; }
th { background: #eee; }
tr { break-inside: avoid; }
td.nr { inline-size: 2rem; }
td.typ { inline-size: 6rem; font-weight: bold; }
td.notiz { inline-size: 9rem; }
td.kasten { inline-size: 2rem; text-align: center; }
ul.antworten { margin: .3rem 0 0; padding-inline-start: 1rem; list-style: none; }
li.richtig { color: #060; }
figure { margin: .3rem 0; }
figcaption { color: #666; font-size: 9pt; }
dl dt { font-weight: bold; margin-block-start: .4rem; }
dl dd { margin-inline-start: 1rem; }
.urteil { border: 1px solid #333; padding: .4rem .6rem; margin-block: .6rem 1.2rem; break-inside: avoid; }
.fragen { list-style: none; padding: 0; margin: 0; }
.kaesten { font-weight: bold; }
.linien::after { content: ''; display: block; block-size: 3.5rem; background: repeating-linear-gradient(transparent 0 1.15rem, #bbb 1.15rem 1.2rem); }
.optionen { display: flex; flex-wrap: wrap; gap: .5rem; }
.option svg, .aufgabenbild svg { max-block-size: 4rem; max-inline-size: 9rem; }
section.fv, section.vorlage, section.kompetenz { break-before: auto; }
@media print { body { padding: 0; max-inline-size: none; } a { color: inherit; text-decoration: none; } }
`;
