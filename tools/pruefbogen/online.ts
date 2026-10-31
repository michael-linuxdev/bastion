// Online-Form des Prüfbogens (bogen.ts): eine Artefakt-Seite auf claude.ai, in der die prüfende
// Person direkt ankreuzt und Anmerkungen schreibt. Die Eingaben gehen in die Datenbank der Seite
// (Fähigkeit `db`, Sammlung `bewertung`, ein Dokument je Abschnitt) und zusätzlich in den
// Speicher des Browsers. Nicht Teil der App: Die Seite lädt Schriften von Google Fonts und
// spricht die Laufzeit von claude.ai an (`window.claude`).
import { esc } from './html';

export interface OnlineSeite {
  /** Kurzer Name für Titel und Speicherschlüssel */
  readonly name: string;
  /** Titel der Kompetenzen */
  readonly titel: string;
  readonly datum: string;
  readonly stichprobe: number;
  /** Teile A bis D als HTML */
  readonly inhalt: string;
}

/** Ohne doctype, html, head und body: Die Artefakt-Hülle legt sie beim Veröffentlichen an. */
export const onlineSeite = (o: OnlineSeite) => `<title>Prüfbogen ${esc(o.name)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bitter:wght@600;700&family=JetBrains+Mono:wght@400&display=swap">
<style>
${STIL}</style>


<div class="leiste"><div class="leiste-innen">
  <nav aria-label="Teile"><a href="#teil-a">A Erklären</a><a href="#teil-b">B Fehler</a><a href="#teil-c">C Aufgaben</a><a href="#teil-d">D Begriffe</a><a href="#schluss">Ergebnis</a></nav>
  <div class="fortschritt"><span id="zaehler">0 beurteilt</span><span class="balken"><i id="balken"></i></span></div>
  <span class="status" id="status" role="status">Wird geladen …</span>
</div></div>

<div class="huelle">
<header class="kopf">
  <h1>Prüfbogen Bastion</h1>
  <p class="unterzeile">${esc(o.name)}: <b>${esc(o.titel)}</b></p>
  <p>Bastion soll Kindern Mathe ohne Lehrkraft beibringen, ganz ohne KI in der App. Alle Texte hier sind mit KI-Hilfe entworfen und noch von keiner Lehrkraft geprüft. Ihre Prüfung entscheidet, ob sie so bleiben dürfen.</p>
  <ol class="anleitung">
    <li><span><b>Teil A</b> zeigt jede Erklärung Schritt für Schritt, so wie das Kind sie sieht. Bei Fragen steht, welche Antwort richtig ist und wohin eine falsche führt.</span></li>
    <li><span><b>Teil B</b> zeigt die typischen Denkfehler mit den Erklärungen, die ein Kind nach einer falschen Antwort bekommt.</span></li>
    <li><span><b>Teil C</b> zeigt die Übungsaufgaben mit je ${o.stichprobe} Beispielen pro Niveau. Haken Sie jede Zeile ab, die stimmt.</span></li>
    <li><span><b>Teil D</b> zeigt die Fachbegriffe, die ein Kind antippen kann.</span></li>
  </ol>
  <p class="hinweis">Stand der Inhalte: ${esc(o.datum)}</p>
  <p class="hinweis-box">Unter jedem Abschnitt wählen Sie ein Urteil. Bei „Passt mit Änderung“ schreiben Sie den neuen Wortlaut ins Feld. Alles wird beim Tippen gespeichert. Sie können jederzeit aufhören und später weitermachen.</p>
  <div class="felder">
    <label for="kopf--name">Name der prüfenden Person<input type="text" id="kopf--name" data-s="kopf" data-f="name" autocomplete="name"></label>
    <label for="kopf--schule">Schule und Fächer<input type="text" id="kopf--schule" data-s="kopf" data-f="schule"></label>
  </div>
</header>

${o.inhalt}


<section class="schluss" id="schluss">
  <h2>Gesamturteil</h2>
  <label class="notiz-label" for="kopf--gesamt">Was muss vor dem Test mit Kindern unbedingt anders werden?</label>
  <textarea id="kopf--gesamt" data-s="kopf" data-f="gesamt" rows="5"></textarea>
  <p>Wenn Sie fertig sind, ist nichts weiter zu tun. Ihre Eingaben sind gespeichert. Falls oben „nur auf diesem Gerät“ steht, kopieren Sie bitte die Zusammenfassung und schicken Sie sie per E-Mail.</p>
  <button type="button" id="kopieren">Zusammenfassung kopieren</button>
  <textarea id="zusammenfassung" rows="10" readonly hidden aria-label="Zusammenfassung zum Kopieren"></textarea>
</section>
</div>

<script>
${skript(o)}</script>
`;

const skript = (o: OnlineSeite) => `(() => {
  const LOKAL = ${JSON.stringify(`pruefbogen:${o.name}`)};
  const zustand = {};
  const timer = {};
  let db = null;
  let lokalNur = false;
  const statusEl = document.getElementById('status');
  const felder = () => document.querySelectorAll('[data-s][data-f]');
  const abschnitte = [...document.querySelectorAll('.urteil[data-abschnitt]')];

  function status(t) { statusEl.textContent = t; }

  function wertVon(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'radio') return el.checked ? el.value : undefined;
    return el.value;
  }

  function anwenden(s, werte) {
    for (const el of document.querySelectorAll(\`[data-s="\${CSS.escape(s)}"]\`)) {
      if (el === document.activeElement && el.tagName === 'TEXTAREA') continue;
      const v = werte[el.dataset.f];
      if (el.type === 'checkbox') el.checked = v === true;
      else if (el.type === 'radio') el.checked = v === el.value;
      else if (typeof v === 'string' && el.value !== v) el.value = v;
    }
  }

  function fortschritt() {
    let n = 0;
    for (const u of abschnitte) {
      const fertig = Boolean(zustand[u.dataset.abschnitt]?.urteil);
      u.classList.toggle('fertig', fertig);
      if (fertig) n++;
    }
    document.getElementById('zaehler').textContent = \`\${n} von \${abschnitte.length} beurteilt\`;
    document.getElementById('balken').style.inlineSize = \`\${(100 * n) / abschnitte.length}%\`;
  }

  function lokalSichern() {
    try { localStorage.setItem(LOKAL, JSON.stringify(zustand)); } catch { /* ohne Speicher weiter */ }
  }

  async function senden(s) {
    if (!db || lokalNur) return;
    try {
      await db.doc(\`bewertung/\${s}\`).set({ werte: zustand[s], stand: new Date().toISOString() });
      if (!Object.values(timer).some(Boolean)) status('Gespeichert');
    } catch (e) {
      lokalNur = true;
      status('Nur auf diesem Gerät gespeichert');
    }
  }

  document.addEventListener('input', (ev) => aenderung(ev.target));
  document.addEventListener('change', (ev) => aenderung(ev.target));
  function aenderung(el) {
    if (!el.dataset || !el.dataset.s || !el.dataset.f) return;
    const s = el.dataset.s;
    const v = wertVon(el);
    if (v === undefined) return;
    zustand[s] = { ...(zustand[s] ?? {}), [el.dataset.f]: v };
    lokalSichern();
    fortschritt();
    if (db && !lokalNur) status('Speichert …');
    clearTimeout(timer[s]);
    timer[s] = setTimeout(() => { timer[s] = 0; senden(s); }, 700);
  }

  try {
    const alt = JSON.parse(localStorage.getItem(LOKAL) ?? '{}');
    for (const [s, w] of Object.entries(alt)) { zustand[s] = w; anwenden(s, w); }
  } catch { /* leer anfangen */ }
  fortschritt();

  const ohneDb = setTimeout(() => { if (!db) { lokalNur = true; status('Nur auf diesem Gerät gespeichert'); } }, 10000);
  Promise.resolve(window.claude?.use?.('db') ?? null).then((d) => {
    clearTimeout(ohneDb);
    if (!d) { lokalNur = true; status('Nur auf diesem Gerät gespeichert'); return; }
    db = d;
    status('Verbunden');
    db.collection('bewertung').onSnapshot((snap) => {
      for (const doc of snap.docs) {
        if (timer[doc.id]) continue;
        const w = doc.data()?.werte;
        if (w && typeof w === 'object') { zustand[doc.id] = { ...w }; anwenden(doc.id, w); }
      }
      lokalSichern();
      fortschritt();
    }, () => { lokalNur = true; status('Nur auf diesem Gerät gespeichert'); });
  }).catch(() => { lokalNur = true; status('Nur auf diesem Gerät gespeichert'); });

  const URTEILE = { passt: 'passt', aendern: 'passt mit Änderung', falsch: 'falsch' };
  function zusammenfassung() {
    const k = zustand.kopf ?? {};
    const zeilen = [\`Prüfbogen Musterfeld Brüche\`, \`Prüfer/in: \${k.name ?? ''} · \${k.schule ?? ''}\`, ''];
    for (const sec of document.querySelectorAll('section.abschnitt')) {
      const s = sec.dataset.s; const w = zustand[s] ?? {};
      const fragen = [...sec.querySelectorAll('.fragen input')].filter((i) => i.checked).length;
      const alleFragen = sec.querySelectorAll('.fragen input').length;
      zeilen.push(\`[\${s}] \${sec.dataset.titel}\`);
      zeilen.push(\`  Urteil: \${URTEILE[w.urteil] ?? 'offen'} · Prüffragen erfüllt: \${fragen}/\${alleFragen}\`);
      const zeilenHaken = sec.querySelectorAll('td.kasten input');
      if (zeilenHaken.length) {
        const ok = [...zeilenHaken].filter((i) => i.checked).length;
        zeilen.push(\`  Zeilen abgehakt: \${ok}/\${zeilenHaken.length}\`);
      }
      if (w.notiz) zeilen.push(\`  Anmerkung: \${w.notiz.replace(/\\n/g, '\\n    ')}\`);
    }
    zeilen.push('', \`Gesamturteil: \${k.gesamt ?? ''}\`);
    return zeilen.join('\\n');
  }
  document.getElementById('kopieren').addEventListener('click', () => {
    const feld = document.getElementById('zusammenfassung');
    const text = zusammenfassung();
    feld.value = text; feld.hidden = false;
    const knopf = document.getElementById('kopieren');
    const markieren = () => { feld.focus(); feld.select(); knopf.textContent = 'Text markiert, bitte kopieren'; };
    try {
      navigator.clipboard.writeText(text).then(() => { knopf.textContent = 'Kopiert'; }, markieren);
    } catch { markieren(); }
  });
})();
`;

// Layout: eine Lesespalte wie ein Korrekturbogen, oben eine feste Leiste mit Fortschritt und
// Sprungmarken; Rotstift als einzige Akzentfarbe.
const STIL = `:root {
  --papier: #fbfcfd;
  --flaeche: #f1f4f7;
  --linie: #cfd6de;
  --text: #17202a;
  --leise: #5b6673;
  --tinte: #c4302b;
  --tinte-weich: #fbe9e7;
  --gut: #2f7d4a;
  --gut-weich: #e5f3ea;
  --mittel: #a86a00;
  --mittel-weich: #fbf0d9;
  --bildgrund: #ffffff;
  --karo: rgba(60, 90, 130, .08);
  --schrift-titel: "Bitter", Georgia, serif;
  --schrift: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
  --schrift-code: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --papier: #161b21; --flaeche: #1f262e; --linie: #36414c; --text: #e6ebf0; --leise: #9aa6b2;
    --tinte: #ff7b6e; --tinte-weich: #3a2220; --gut: #6fcf8f; --gut-weich: #1c3325;
    --mittel: #f0b54a; --mittel-weich: #3a2e14; --bildgrund: #f4f6f8; --karo: rgba(160, 190, 230, .07);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --papier: #161b21; --flaeche: #1f262e; --linie: #36414c; --text: #e6ebf0; --leise: #9aa6b2;
  --tinte: #ff7b6e; --tinte-weich: #3a2220; --gut: #6fcf8f; --gut-weich: #1c3325;
  --mittel: #f0b54a; --mittel-weich: #3a2e14; --bildgrund: #f4f6f8; --karo: rgba(160, 190, 230, .07);
  color-scheme: dark;
}
body { background: var(--papier); color: var(--text); font: 16px/1.5 var(--schrift); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--flaeche); }
.huelle { max-width: 50rem; margin-inline: auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 0 4rem; }
.leiste { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--flaeche); border-block-end: 1px solid var(--linie); }
.leiste-innen { max-width: 50rem; margin-inline: auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: .5rem; display: flex; flex-wrap: wrap; align-items: center; gap: .4rem 1rem; }
.leiste nav { display: flex; gap: .25rem; flex-wrap: wrap; }
.leiste nav a { color: var(--text); text-decoration: none; padding: .2rem .55rem; border-radius: .3rem; font-weight: 700; font-size: .9rem; }
.leiste nav a:hover, .leiste nav a:focus-visible { background: var(--papier); outline: 2px solid var(--tinte); outline-offset: 0; }
.fortschritt { display: flex; align-items: center; gap: .5rem; font-size: .9rem; font-variant-numeric: tabular-nums; margin-inline-start: auto; }
.balken { inline-size: 7rem; block-size: .45rem; background: var(--papier); border: 1px solid var(--linie); border-radius: 1rem; overflow: hidden; }
.balken i { display: block; block-size: 100%; inline-size: 0; background: var(--tinte); transition: inline-size .3s; }
.status { font-size: .8rem; color: var(--leise); }
.kopf { padding-block: 2rem 1rem; background-image: linear-gradient(var(--karo) 1px, transparent 1px), linear-gradient(90deg, var(--karo) 1px, transparent 1px); background-size: 1.25rem 1.25rem; border-block-end: 2px solid var(--text); }
h1, h2, h3, h4 { font-family: var(--schrift-titel); text-wrap: balance; line-height: 1.2; }
h1 { font-size: clamp(1.7rem, 5vw, 2.4rem); margin: 0 0 .4rem; }
.unterzeile { font-size: 1.1rem; margin: 0 0 1rem; }
.unterzeile b { color: var(--tinte); }
.anleitung { display: grid; gap: .6rem; margin: 1rem 0; padding: 0; list-style: none; counter-reset: a; }
.anleitung li { display: grid; grid-template-columns: 2rem 1fr; gap: .5rem; }
.anleitung li::before { counter-increment: a; content: counter(a); font-family: var(--schrift-titel); font-weight: 700; color: var(--tinte); font-size: 1.2rem; }
.felder { display: flex; flex-wrap: wrap; gap: .8rem 1.5rem; margin-block: 1rem .5rem; }
.felder label { display: grid; gap: .2rem; font-weight: 700; font-size: .9rem; flex: 1 1 14rem; min-width: 0; }
input[type="text"], input[type="date"], textarea { font: inherit; color: var(--text); background: var(--papier); border: 1px solid var(--linie); border-radius: .35rem; padding: .45rem .55rem; inline-size: 100%; box-sizing: border-box; }
input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 2px solid var(--tinte); outline-offset: 2px; }
input[type="checkbox"], input[type="radio"] { accent-color: var(--tinte); inline-size: 1.15rem; block-size: 1.15rem; margin: 0; flex: none; }
.hinweis-box { background: var(--tinte-weich); border-inline-start: 4px solid var(--tinte); padding: .6rem .8rem; border-radius: .3rem; font-size: .95rem; }
h2.teil { font-size: 1.6rem; margin-block: 3rem 1rem; padding-block-end: .4rem; border-block-end: 2px solid var(--text); scroll-margin-top: 4.5rem; }
h3 { font-size: 1.25rem; margin-block: 2.2rem .4rem; }
h4 { font-size: 1.05rem; margin-block: 1.4rem .4rem; }
section.abschnitt { scroll-margin-top: 4.5rem; }
.hinweis, .quelle { color: var(--leise); font-size: .85rem; }
.quelle { font-family: var(--schrift-code); font-size: .75rem; }
.tabelle { overflow-x: auto; }
table { border-collapse: collapse; inline-size: 100%; margin-block: .5rem; font-size: .95rem; }
th, td { border: 1px solid var(--linie); padding: .35rem .45rem; vertical-align: top; text-align: start; }
th { background: var(--flaeche); font-size: .85rem; }
td.nr { inline-size: 2rem; font-variant-numeric: tabular-nums; color: var(--leise); }
td.typ { inline-size: 6.5rem; font-weight: 700; }
td.notiz { display: none; }
table.schritte th:last-child { display: none; }
td.kasten { inline-size: 2.2rem; text-align: center; vertical-align: middle; }
ul.antworten { margin: .4rem 0 0; padding: 0; list-style: none; display: grid; gap: .15rem; }
li.richtig { color: var(--gut); font-weight: 700; }
a { color: var(--tinte); }
figure { margin: .4rem 0; }
figure svg, .aufgabenbild svg, .option svg { background: var(--bildgrund); border-radius: .25rem; padding: 2px; max-width: 100%; height: auto; }
figcaption { color: var(--leise); font-size: .8rem; }
.br { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; font-size: .8em; line-height: 1.1; }
.br > span:first-child { border-block-end: 1px solid currentcolor; }
.ueber { text-decoration: overline; }
dl { display: grid; gap: .2rem; }
dl dt { font-weight: 700; margin-block-start: .5rem; }
dl dd { margin-inline-start: 1rem; }
ul.fehlerbilder { display: grid; gap: .4rem; }
.optionen { display: flex; flex-wrap: wrap; gap: .5rem; margin-block-start: .3rem; }
.option { display: inline-flex; align-items: center; gap: .25rem; }
.option svg, .aufgabenbild svg { max-block-size: 4rem; max-inline-size: 9rem; }
.urteil { border: 2px solid var(--text); border-radius: .5rem; padding: .8rem 1rem; margin-block: 1rem 1.5rem; display: grid; gap: .6rem; background: var(--papier); }
.urteil.fertig { border-color: var(--linie); }
.urteil-kopf { margin: 0; font-weight: 700; font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: var(--leise); }
.fragen { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
.fragen label { display: flex; gap: .55rem; align-items: flex-start; cursor: pointer; }
.fragen input { margin-block-start: .2rem; }
.wahlen { border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: .5rem; }
.wahlen legend { font-weight: 700; margin-block-end: .35rem; padding: 0; }
.wahl { display: inline-flex; align-items: center; gap: .4rem; border: 1px solid var(--linie); border-radius: 2rem; padding: .35rem .8rem; cursor: pointer; font-weight: 700; }
.wahl:has(input:checked).wahl-passt { background: var(--gut-weich); border-color: var(--gut); color: var(--gut); }
.wahl:has(input:checked).wahl-aendern { background: var(--mittel-weich); border-color: var(--mittel); color: var(--mittel); }
.wahl:has(input:checked).wahl-falsch { background: var(--tinte-weich); border-color: var(--tinte); color: var(--tinte); }
.wahl-passt input { accent-color: var(--gut); } .wahl-aendern input { accent-color: var(--mittel); }
.notiz-label { font-weight: 700; }
.schluss { margin-block-start: 3rem; padding: 1.2rem; border: 2px solid var(--tinte); border-radius: .5rem; display: grid; gap: .8rem; }
.schluss h2 { margin: 0; font-size: 1.4rem; }
button { font: inherit; font-weight: 700; color: var(--papier); background: var(--tinte); border: 0; border-radius: .4rem; padding: .6rem 1rem; cursor: pointer; justify-self: start; }
#zusammenfassung { font-family: var(--schrift-code); font-size: .8rem; min-block-size: 10rem; }
@media (width < 36rem) { td.typ { inline-size: auto; } .fortschritt { margin-inline-start: 0; } }
@media (prefers-reduced-motion: reduce) { .balken i { transition: none; } }
`;
