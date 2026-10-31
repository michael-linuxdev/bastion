// Prüfbogen für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2): setzt Erstvermittlungen,
// Fehlvorstellungen, Aufgabenvorlagen mit Stichprobe und Fachbegriffe ausgewählter Kompetenzen
// als druckbare HTML-Seite zusammen. Prüfende brauchen weder YAML noch Git.
// Rein: alle Inhalte und Generatoren werden hereingereicht; gleiche Eingabe, gleiche Seite.
import type { Kompetenz, Niveau } from '../../src/core/competence/kompetenz';
import type { Begriff } from '../../src/core/learning/begriffe';
import type { Fehlvorstellung } from '../../src/core/learning/fehlvorstellung';
import type { Generator, Instanz, Loesung, Wert } from '../../src/core/learning/generator';
import { fuelle, zahlText, type Textteil } from '../../src/core/learning/text';
import type { Schritt, Vermittlung, WerkzeugAngabe } from '../../src/core/learning/vermittlung';
import type { GeneratorVorlage } from '../../src/core/learning/vorlage';
import { musterweg } from '../../src/core/learning/zwischenschritte';
import { breiten, startzustand } from '../../src/ui/vermittlung/werkzeuge/bruchstreifen';
import { stelle, striche } from '../../src/ui/vermittlung/werkzeuge/zahlenstrahl';
import { esc } from './html';
import { onlineSeite } from './online';

export interface BogenEingabe {
  /** Die zu prüfenden Kompetenzen, in dieser Reihenfolge */
  readonly kompetenzen: readonly Kompetenz[];
  /** Alle Kompetenzen, für Titel in Rückwegen */
  readonly alleKompetenzen: ReadonlyMap<string, Kompetenz>;
  readonly vermittlungen: ReadonlyMap<string, Vermittlung>;
  readonly vorlagen: readonly GeneratorVorlage[];
  readonly fehlvorstellungen: ReadonlyMap<string, Fehlvorstellung>;
  readonly begriffe: readonly Begriff[];
  readonly generatoren: ReadonlyMap<string, Generator<unknown>>;
  /** Aufgaben je Vorlage und Niveau (INHALTSFORMAT §8: 20) */
  readonly stichprobe: number;
  /** Datum auf dem Bogen, JJJJ-MM-TT */
  readonly datum: string;
}

/** `druck`: Seite zum Ausdrucken. `online`: Artefakt-Seite zum Ausfüllen, speichert die Eingaben. */
export type Form = 'druck' | 'online';

export interface BogenOptionen {
  readonly form?: Form;
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

// Prüflisten aus VERMITTLUNG §2.5 und §3.5, in Fragen umformuliert
const V_FRAGEN = [
  'V1 Ist das Ziel in einem Satz klar?',
  'V2 Wird das Vorwissen geprüft, und führt eine Lücke zurück zur Voraussetzung?',
  'V3 Hat jede Grundvorstellung ein Bild oder Werkzeug?',
  'V4 Gibt es ein vorgerechnetes und ein selbst zu ergänzendes Beispiel?',
  'V5 Stammt das Gegenbeispiel aus einem echten Schülerfehler?',
  'V6 Sind die falschen Antworten typische Fehler, und führt jede an die passende Stelle zurück?',
  'V8 Ist die Sprache einfach (etwa 40 Wörter je Bildschirm), sind Fachbegriffe erklärt?',
  'V9 Stimmt alles fachlich und passt es zum sächsischen Lehrplan?',
];
const F_FRAGEN = [
  'Ist das ein echter, häufiger Schülerfehler?',
  'Passt die kurze Erklärung zu jedem Fehlerbild darunter, ohne ihm zu widersprechen?',
  'F4 Ist die lange Erklärung wertschätzend und widerlegt sie mit Bild oder Gegenbeispiel?',
  'Stimmen Gegenbeispiel und Rückweg fachlich?',
];
const A_FRAGEN = [
  'Sind die Aufgaben eindeutig: weiß ein sicheres Kind, was es eintippen soll?',
  'Stimmen alle Lösungen?',
  'Passt der Schwierigkeitsgrad zum Niveau?',
  'Passt jede Rückmeldung zu der falschen Antwort, bei der sie erscheint?',
];

function teileHtml(teile: readonly Textteil[]): string {
  return teile
    .map((t) => {
      if (t.art === 'bruch')
        return `<span class="br"><span>${esc(t.zaehler)}</span><span>${esc(t.nenner)}</span></span>`;
      if (t.art === 'hoch') return `<sup>${esc(t.text)}</sup>`;
      if (t.art === 'wurzel') return `√<span class="ueber">${esc(t.text)}</span>`;
      const inhalt = t.art === 'begriff' ? `<u>${esc(t.text)}</u>` : esc(t.text);
      return t.fett ? `<b>${inhalt}</b>` : inhalt;
    })
    .join('');
}

/** Text füllen; Platzhalter ohne Wert (Rückmeldungen ohne konkrete Aufgabe) bleiben als ‹name›. */
const text = (s: string, platzhalter: Readonly<Record<string, Wert>> = {}) =>
  teileHtml(
    fuelle(
      s.replace(/\{([a-z_]+)\}/g, (m, name: string) => (name in platzhalter ? m : `‹${name}›`)),
      platzhalter,
    ),
  );

function loesungText(l: Loesung, optionen?: Instanz['optionen']): string {
  switch (l.typ) {
    case 'bruch':
      return `${zahlText(l.wert.zaehler)}/${zahlText(l.wert.nenner)}`;
    case 'zahl':
      return zahlText(l.wert);
    case 'auswahl': {
      const o = optionen?.[l.wert];
      return `${String.fromCharCode(65 + l.wert)}${o?.text ? ` (${esc(o.text.de)})` : ''}`;
    }
    case 'reihenfolge':
      return l.wert.map(zahlText).join(' < ');
    case 'punkt':
      return `(${zahlText(l.wert.x)} | ${zahlText(l.wert.y)})`;
    case 'mit-rest':
      return `${zahlText(l.wert.quotient)} Rest ${zahlText(l.wert.rest)}`;
  }
}

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

const D_FRAGEN = [
  'Sind die Erklärungen fachlich richtig?',
  'Versteht ein Kind der passenden Klasse jede Erklärung?',
];

const URTEILE = [
  ['passt', 'Passt'],
  ['aendern', 'Passt mit Änderung'],
  ['falsch', 'Falsch'],
] as const;

/** Prüffragen, Urteil und Anmerkungen zu Abschnitt `s`. Online: Felder mit data-s/data-f. */
function urteil(k: Kontext, s: string, fragen: readonly string[]): string {
  if (k.form === 'druck')
    return `<div class="urteil"><ul class="fragen">${fragen.map((f) => `<li>☐ ${esc(f)}</li>`).join('')}</ul>
<p class="kaesten">Urteil: ☐ passt &nbsp; ☐ passt mit Änderung &nbsp; ☐ falsch</p>
<p class="linien">Anmerkungen und neuer Wortlaut:</p></div>`;
  const id = esc(s);
  const li = fragen
    .map(
      (f, i) =>
        `<li><label><input type="checkbox" id="${id}--f${i}" data-s="${id}" data-f="f${i}"> <span>${esc(f)}</span></label></li>`,
    )
    .join('');
  const wahlen = URTEILE.map(
    ([w, t]) =>
      `<label class="wahl wahl-${w}"><input type="radio" name="${id}--urteil" id="${id}--urteil-${w}" data-s="${id}" data-f="urteil" value="${w}"> <span>${t}</span></label>`,
  ).join('');
  return `<div class="urteil" data-abschnitt="${id}"><p class="urteil-kopf">Prüffragen</p><ul class="fragen">${li}</ul>
<fieldset class="wahlen"><legend>Urteil</legend>${wahlen}</fieldset>
<label class="notiz-label" for="${id}--notiz">Anmerkungen und neuer Wortlaut</label>
<textarea id="${id}--notiz" data-s="${id}" data-f="notiz" rows="3" placeholder="Was soll anders heißen? Bitte den Schritt oder die Aufgaben-Nr. nennen."></textarea></div>`;
}

/** Kästchen „Zeile stimmt“ in Tabellen */
function kasten(k: Kontext, s: string, f: string, nr: number): string {
  if (k.form === 'druck') return '<td class="kasten">☐</td>';
  return `<td class="kasten"><input type="checkbox" id="${esc(s)}--${esc(f)}" data-s="${esc(s)}" data-f="${esc(f)}" aria-label="Zeile ${nr} stimmt"></td>`;
}

const abschnitt = (klasse: string, s: string, titel: string) =>
  `<section class="${klasse} abschnitt" data-s="${esc(s)}" data-titel="${esc(titel)}"`;

const ohneTags = (html: string) => html.replace(/<[^>]+>/g, '');

interface Kontext {
  readonly e: BogenEingabe;
  readonly form: Form;
  /** Schritt-Nummern je Erstvermittlung: Kompetenz-ID → Schritt-ID → Nummer */
  readonly nummern: ReadonlyMap<string, ReadonlyMap<string, number>>;
}

/** Ziel eines Verweises lesbar: Schritt der eigenen Sequenz, anderer Schritt oder Kompetenz. */
function ziel(k: Kontext, verweis: string, eigene?: string): string {
  const [kid, sid] = verweis.includes('#') ? verweis.split('#') : [undefined, verweis];
  if (kid === undefined && eigene !== undefined) {
    const n = k.nummern.get(eigene)?.get(sid ?? '');
    if (n !== undefined) return `Schritt ${n}`;
  }
  const kompetenz = k.e.alleKompetenzen.get(kid ?? sid ?? '');
  if (kid !== undefined && kompetenz) {
    const n = k.nummern.get(kid)?.get(sid ?? '');
    return `Erstvermittlung „${esc(kompetenz.titel.de)}“, Schritt ${n ?? esc(sid ?? '')}`;
  }
  if (kompetenz) return `Voraussetzung „${esc(kompetenz.titel.de)}“`;
  return esc(verweis);
}

const fvName = (k: Kontext, id: string) => {
  const fv = k.e.fehlvorstellungen.get(id);
  return fv ? `<a href="#${esc(id)}">${esc(fv.name.de)}</a>` : esc(id);
};

function antwortHtml(k: Kontext, s: Schritt, kid: string): string {
  if (!s.antwort) return '';
  const zurueck = (fv: string) => {
    const z = s.bei?.[fv];
    return z ? ` → ${ziel(k, z, kid)}` : ' → weiter';
  };
  const zeilen: string[] = [];
  if ('optionen' in s.antwort) {
    for (const o of s.antwort.optionen) {
      if (o.richtig === true) zeilen.push(`<li class="richtig">✓ ${text(o.wert.de)}</li>`);
      else
        zeilen.push(
          `<li>✗ ${text(o.wert.de)}${o.fv ? ` · Fehler: ${fvName(k, o.fv)}${zurueck(o.fv)}` : ''}</li>`,
        );
    }
  } else {
    const ein = s.antwort.eingabe;
    zeilen.push(`<li class="richtig">✓ Eingabe ${esc(ein.loesung)}</li>`);
    for (const f of ein.fehler ?? [])
      zeilen.push(`<li>✗ ${esc(f.wert)} · Fehler: ${fvName(k, f.fv)}${zurueck(f.fv)}</li>`);
  }
  if (s.bei?.['sonst']) zeilen.push(`<li>Sonst falsch → ${ziel(k, s.bei['sonst'], kid)}</li>`);
  return `<ul class="antworten">${zeilen.join('')}</ul>`;
}

function vermittlungHtml(k: Kontext, komp: Kompetenz): string {
  const v = k.e.vermittlungen.get(komp.id);
  if (!v) return `<p class="hinweis">Keine Erstvermittlung.</p>`;
  const zeilen = v.schritte.map((s, i) => {
    const bild = s.bild ? werkzeugBild(s.bild) : '';
    const werkzeug = s.werkzeug
      ? `<p class="hinweis">Zum Ausprobieren:</p>${werkzeugBild({ werkzeug: s.werkzeug.id, parameter: s.werkzeug.parameter ?? {} })}`
      : '';
    const uebergang = s.vorlagen
      ? `<p class="hinweis">Danach ${s.anzahl ?? ''} Aufgaben aus: ${s.vorlagen.map(esc).join(', ')}</p>`
      : '';
    return `<tr><td class="nr">${i + 1}</td><td class="typ">${esc(SCHRITT_NAMEN[s.typ] ?? s.typ)}</td><td>${text(s.text.de)}${bild}${werkzeug}${antwortHtml(k, s, komp.id)}${uebergang}</td><td class="notiz"></td></tr>`;
  });
  return `<p class="hinweis">Etwa ${v.dauer_min} Minuten · Niveau ${esc(v.niveau)} · <u>Unterstrichen</u> = Fachbegriff, antippbar (Teil D)</p>
<div class="tabelle"><table class="schritte"><thead><tr><th>Nr.</th><th>Art</th><th>Was das Kind sieht und antworten kann</th><th>Notiz</th></tr></thead><tbody>${zeilen.join('')}</tbody></table></div>
${urteil(k, `A-${komp.id}`, V_FRAGEN)}`;
}

/** Fehlvorstellungen in der Reihenfolge, in der die Kompetenzen und ihre Dateien sie nennen. */
export function genannteFehlvorstellungen(e: BogenEingabe): string[] {
  const ids = new Set<string>();
  const sammle = (x: unknown) => {
    for (const m of JSON.stringify(x).matchAll(/FV\.[A-Z]{2}\.[A-Z0-9-]+/g)) ids.add(m[0]);
  };
  for (const komp of e.kompetenzen) {
    sammle(e.vermittlungen.get(komp.id));
    for (const v of e.vorlagen) if (v.kompetenz === komp.id) sammle(v);
  }
  return [...ids].filter((id) => e.fehlvorstellungen.has(id));
}

function fehlvorstellungHtml(k: Kontext, fv: Fehlvorstellung): string {
  const lang = fv.erklaerung.lang
    .map(
      (t) =>
        `<dt>${esc(TEIL_NAMEN[t.teil] ?? t.teil)}</dt><dd>${text(t.de)}${t.bild ? werkzeugBild(t.bild) : ''}</dd>`,
    )
    .join('');
  const fehlerbilder = k.e.vorlagen.flatMap((v) => [
    ...Object.entries(v.fehlerbilder)
      .filter(([, f]) => f.fv === fv.id)
      .map(
        ([id, f]) =>
          `<li><span class="quelle">${esc(v.id)} · ${esc(id)}</span><br>${text(f.de)}</li>`,
      ),
    ...(v.schritte ?? []).flatMap((s) =>
      Object.entries(s.fehlerbilder)
        .filter(([, f]) => f.fv === fv.id)
        .map(
          ([id, f]) =>
            `<li><span class="quelle">${esc(v.id)} · Schritt ${esc(s.id)} · ${esc(id)}</span><br>${text(f.de)}</li>`,
        ),
    ),
  ]);
  const rueckweg = [
    `Erklärung: ${ziel(k, fv.rueckweg.vermittlung)}`,
    ...(fv.rueckweg.voraussetzung ? [`Voraussetzung: ${ziel(k, fv.rueckweg.voraussetzung)}`] : []),
  ].join('<br>');
  return `${abschnitt('fv', `B-${fv.id}`, fv.name.de)} id="${esc(fv.id)}"><h3>${esc(fv.name.de)}</h3>
<p class="hinweis">${esc(fv.id)} · Art: ${esc(fv.art)} · gehört zu ${fv.kompetenzen.map((id) => esc(k.e.alleKompetenzen.get(id)?.titel.de ?? id)).join(', ')}</p>
<p><i>Für Prüfende:</i> ${esc(fv.beschreibung.de)}</p>
<dl><dt>Kurze Erklärung</dt><dd>${text(fv.erklaerung.kurz.de)}</dd>${lang}
<dt>Gegenbeispiel</dt><dd>${text(fv.gegenbeispiel.de)}</dd>
<dt>Rückweg</dt><dd>${rueckweg}</dd>
<dt>Kontrastaufgaben</dt><dd>${fv.kontrast.map(esc).join(', ')}</dd></dl>
${fehlerbilder.length > 0 ? `<p><b>Rückmeldungen in Aufgaben, unter denen die kurze Erklärung erscheint:</b></p><ul class="fehlerbilder">${fehlerbilder.join('')}</ul>` : ''}
${urteil(k, `B-${fv.id}`, F_FRAGEN)}</section>`;
}

function instanzZeile(
  k: Kontext,
  v: GeneratorVorlage,
  i: Instanz,
  niveau: Niveau,
  nr: number,
): string {
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
  return `<tr><td class="nr">${nr}</td><td>${aufgabe}${bild}${optionen}</td><td>${loesungText(i.loesung, i.optionen)}</td><td>${falsch}</td>${kasten(k, `C-${v.id}`, `${niveau}${nr}`, nr)}</tr>`;
}

function wegHtml(v: GeneratorVorlage, g: Generator<unknown>, niveau: Niveau): string {
  if (!v.schritte) return '';
  const parameter = v.parameter[niveau];
  const i = g.erzeuge(1, parameter);
  const weg = musterweg(
    g,
    1,
    parameter,
    v.schritte.map((x) => x.id),
  );
  const bisher: Record<string, Wert> = {};
  const zeilen = weg.map(({ id, aufgabe }) => {
    const s = v.schritte?.find((x) => x.id === id);
    const frage = s
      ? text(s.frage.de, { ...i.platzhalter, ...aufgabe.platzhalter, ...bisher })
      : esc(id);
    const l = aufgabe.loesung;
    if (l.typ === 'bruch' || l.typ === 'zahl') bisher[id] = l.wert;
    const falsch = aufgabe.fehlerbilder
      .map((f) => `${loesungText(f.antwort)} <span class="quelle">(${esc(f.id)})</span>`)
      .join(', ');
    return `<li>${frage} → <b>${loesungText(l)}</b>${falsch ? ` · falsch erkannt: ${falsch}` : ''}</li>`;
  });
  return `<p><b>Zwischenschritte</b> (erscheinen nach einem falschen Ergebnis), am Beispiel ${text(v.text.aufgabe.de, i.platzhalter)}:</p><ol class="weg">${zeilen.join('')}</ol>`;
}

function vorlageHtml(k: Kontext, v: GeneratorVorlage): string {
  const e = k.e;
  const g = e.generatoren.get(v.generator);
  const hilfen = v.hilfen.map((h) => `<li>${text(h.de)}</li>`).join('');
  const rueck = Object.entries(v.fehlerbilder)
    .map(([id, f]) => `<li><span class="quelle">${esc(id)}</span> ${text(f.de)}</li>`)
    .join('');
  const niveaus = v.niveaus.map((n) => {
    if (!g) return `<p class="hinweis">Generator ${esc(v.generator)} fehlt.</p>`;
    const zeilen = Array.from({ length: e.stichprobe }, (_, s) =>
      instanzZeile(k, v, g.erzeuge(s + 1, v.parameter[n]), n, s + 1),
    );
    return `<h4>Niveau ${esc(n)}: ${e.stichprobe} Beispielaufgaben</h4>
<div class="tabelle"><table class="stichprobe"><thead><tr><th>Nr.</th><th>Aufgabe</th><th>Lösung</th><th>Erkannte falsche Antworten</th><th>ok</th></tr></thead><tbody>${zeilen.join('')}</tbody></table></div>
${wegHtml(v, g, n)}`;
  });
  const titel = text(v.text.aufgabe.de.replace(/\{[a-z_]+\}/g, '…'));
  return `${abschnitt('vorlage', `C-${v.id}`, ohneTags(titel))}><h3>${titel}</h3>
<p class="hinweis">${esc(v.id)} · Niveaus ${v.niveaus.join(', ')}</p>
<p><b>Hilfen:</b></p><ol>${hilfen}</ol>
<p><b>Rückmeldungen bei typischen falschen Antworten:</b></p><ul class="fehlerbilder">${rueck}</ul>
${niveaus.join('')}
${urteil(k, `C-${v.id}`, A_FRAGEN)}</section>`;
}

/** Fachbegriffe, die in den Texten der gewählten Kompetenzen markiert sind. */
export function genannteBegriffe(e: BogenEingabe, fvIds: readonly string[]): Begriff[] {
  const roh = JSON.stringify([
    ...e.kompetenzen.map((k) => e.vermittlungen.get(k.id)),
    ...e.vorlagen,
    ...fvIds.map((id) => e.fehlvorstellungen.get(id)),
  ]);
  const formen = new Set([...roh.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]));
  return e.begriffe.filter((b) => b.formen.some((f) => formen.has(f)));
}

export function pruefbogen(e: BogenEingabe, optionen: BogenOptionen = {}): string {
  const form = optionen.form ?? 'druck';
  const nummern = new Map(
    [...e.vermittlungen].map(([id, v]) => [id, new Map(v.schritte.map((s, i) => [s.id, i + 1]))]),
  );
  const k: Kontext = { e, form, nummern };
  const fvIds = genannteFehlvorstellungen(e);
  const begriffe = genannteBegriffe(e, fvIds);
  const titel = e.kompetenzen.map((x) => x.titel.de).join(' · ');

  const teilA = e.kompetenzen
    .map(
      (komp, i) =>
        `${abschnitt('kompetenz', `A-${komp.id}`, komp.titel.de)}><h3>A${i + 1} ${esc(komp.titel.de)}</h3><p>${esc(komp.kann_satz.de)} <span class="hinweis">(${esc(komp.id)}, Klasse ${komp.klassenstufe_typisch.join('/')})</span></p>${vermittlungHtml(k, komp)}</section>`,
    )
    .join('');
  const teilB = fvIds
    .map((id) => e.fehlvorstellungen.get(id))
    .filter((fv): fv is Fehlvorstellung => fv !== undefined)
    .map((fv) => fehlvorstellungHtml(k, fv))
    .join('');
  const teilC = e.kompetenzen
    .flatMap((komp) => e.vorlagen.filter((v) => v.kompetenz === komp.id))
    .map((v) => vorlageHtml(k, v))
    .join('');
  const teilD = `${abschnitt('begriffe', 'D-begriffe', 'Fachbegriffe')}><div class="tabelle"><table class="begriffe"><thead><tr><th>Begriff</th><th>Erklärung für das Kind</th><th>ok</th></tr></thead><tbody>${begriffe
    .map(
      (b, i) =>
        `<tr><td><b>${esc(b.wort.de)}</b></td><td>${text(b.erklaerung.de)}</td>${kasten(k, 'D-begriffe', `b${i + 1}`, i + 1)}</tr>`,
    )
    .join('')}</tbody></table></div>${urteil(k, 'D-begriffe', D_FRAGEN)}</section>`;
  const anzahlVorlagen = e.kompetenzen.flatMap((x) =>
    e.vorlagen.filter((v) => v.kompetenz === x.id),
  ).length;

  if (form === 'online')
    return onlineSeite({
      name: optionen.name ?? titel,
      titel,
      datum: e.datum,
      stichprobe: e.stichprobe,
      inhalt: `<h2 class="teil" id="teil-a">Teil A: Erstvermittlungen</h2>${teilA}
<h2 class="teil" id="teil-b">Teil B: Fehlvorstellungen</h2>${teilB}
<h2 class="teil" id="teil-c">Teil C: Übungsaufgaben</h2>${teilC}
<h2 class="teil" id="teil-d">Teil D: Fachbegriffe</h2>${teilD}`,
    });

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

const STIL = `
:root { color-scheme: light; }
body { font: 11pt/1.4 system-ui, sans-serif; color: #111; background: #fff; max-inline-size: 48rem; margin-inline: auto; padding: 1rem; }
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
.br { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; font-size: 9pt; line-height: 1.1; }
.br > span:first-child { border-block-end: 1px solid currentcolor; }
.ueber { text-decoration: overline; }
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
