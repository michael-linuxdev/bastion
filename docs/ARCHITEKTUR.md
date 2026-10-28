# Bastion – Architektur & Tech-Stack

Status: v0.3 (Entscheidungen bestätigt) · Stand: 27.10.2026 · Bezug: `VISION.md`, `KONZEPT.md` (O-1)
Auftrag: Tech-Stack ohne Rücksicht auf den Lerninsel-Stack neu denken.

---

## 1. Anforderungen, die den Stack bestimmen

Der Stack wird nicht nach Vorliebe gewählt, sondern aus diesen Anforderungen abgeleitet. Jede Technologieentscheidung unten verweist auf sie.

| ID | Anforderung | Herkunft |
|---|---|---|
| A1 | Vollständig offline nach dem ersten Laden | Prinzip 2 |
| A2 | Keine Daten verlassen das Gerät; keine Drittanbieter zur Laufzeit (auch keine CDN-Fonts, kein Analytics) | Prinzip 3 |
| A3 | Läuft auf schwachen Geräten: Schul-Chromebooks, ältere Android-Handys, iPads, Linux-Rechner | Zielgruppe, Bildungsgerechtigkeit |
| A4 | Lebensdauer von Jahren; Spielstände müssen Updates und Gerätewechsel überleben | Bastion als Langzeitbegleiter |
| A5 | Barrierearm: Screenreader, Tastatur, reizarmer Modus, Vorlesen | Fokus-Hilfen, KONZEPT §9 |
| A6 | Mehrsprachig inkl. Rechts-nach-links-Schriften (Arabisch, Persisch) | DaZ / Hilfesprache |
| A7 | Mathematische und naturwissenschaftliche Notation offline | Inhalte Kl. 5–13 (Start: Sachsen, Kl. 5–12) |
| A8 | Große, modular nachladbare Inhaltsmengen | Fächer × Schulformen × Niveaus |
| A9 | Basebau als 2D-Welt mit flüssiger Darstellung – und vollständig abschaltbar | R7, K-1 |
| A10 | Wartbar durch ein kleines Team; geringe Abhängigkeit von einzelnen Frameworks | Projektrealität |
| A11 | Gerätetransfer per QR und Datei | Lerninsel-Erbe |

## 2. Grundsatzentscheidung: Web-App (PWA) statt nativ

**Entscheidung T-1:** Bastion wird eine Progressive Web App. Native Hüllen für App-Stores sind ein späterer, optionaler Schritt.

*Warum:*
- Eine Codebasis für Chromebook, Android, iOS, Windows und Linux (A3).
- Schulgeräte erlauben oft keine App-Installation, aber einen Browser.
- Verteilung ohne Store-Konto, ohne Store-Tracking (A2).

*Verworfen:*
| Alternative | Grund |
|---|---|
| Flutter | Web-Ausgabe schwer und bei Barrierefreiheit schwächer (A3, A5) |
| Unity / Godot (Web-Export) | Große Downloads, Lernoberfläche wäre eine Spiele-Engine-UI ohne echte Barrierefreiheit (A5) |
| Nativ (Kotlin/Swift) | Zwei bis drei Codebasen für ein kleines Team (A10) |

*Bekanntes Risiko – iOS/Safari:* Safari kann Speicher von Webseiten nach längerer Nichtnutzung löschen; für zum Home-Bildschirm hinzugefügte Web-Apps gilt das nach heutigem Stand nicht. Konsequenz, verbindlich:
1. Installation auf dem Home-Bildschirm aktiv anleiten.
2. `navigator.storage.persist()` anfordern.
3. **Automatische Erinnerung an Sicherungsexport** (z. B. monatlich, abschaltbar). Ein Spielstand aus vier Jahren darf nicht an einer Browser-Regel sterben.

Dieses Verhalten der Browser ist vor Phase 1 erneut zu prüfen.

## 3. Architektur: Kern ohne Framework

**Entscheidung T-2:** Die gesamte Fachlogik liegt in einem framework-freien TypeScript-Kern. Die Oberfläche ist austauschbar.

```
bastion/
├─ packages/
│  ├─ core/          Domänenlogik, reines TypeScript, keine UI, keine Browser-APIs
│  │  ├─ competence/   Kompetenzgraph, Niveaus, Fortschritt
│  │  ├─ learning/     Aufgaben-Engine, Auswertung, Diagnose
│  │  ├─ srs/          Wiederholungsplanung
│  │  ├─ ledger/       Ressourcen-Buchungen, Regeln, Tageskurve
│  │  ├─ bastion/      Gebäude, Bauvorhaben, Epochen (liest nur Ledger)
│  │  └─ policy/       Zeitsystem, Elternstufen
│  ├─ storage/       Persistenz-Adapter (IndexedDB), Migrationen
│  ├─ content-schema/ Formate + Validierung für Inhaltspakete
│  └─ generators/    Parametrisierte Aufgabengeneratoren
├─ apps/
│  └─ web/           PWA: Oberfläche, Service Worker, Bastion-Renderer
├─ content/          Inhaltsquellen (eigenes Repo möglich, s. §6)
└─ tools/
   ├─ sim/           Balancing-Simulator (Node)
   └─ content-build/ Baut und prüft Inhaltspakete
```

*Warum:*
- Frameworks wechseln im Jahrestakt, der Lernkern soll ein Jahrzehnt halten (A4, A10).
- Der Kern ist ohne Browser testbar – auch im Balancing-Simulator (§8).
- Abhängigkeitsrichtung ist fest: `core` kennt nichts außer sich selbst. `bastion` kennt nur `ledger`. Das setzt K-1 technisch durch, nicht nur per Absprache.

## 4. Der Stack

### 4.1 Übersicht

| Bereich | Wahl | Alternativen | Begründung |
|---|---|---|---|
| Sprache | **TypeScript** (strict) | JavaScript | Langlebigkeit, Refactoring-Sicherheit bei großem Datenmodell (A4) |
| Build | **Vite** | Webpack, Rspack | Schnell, Standard, gute PWA-Integration |
| UI | **Svelte 5** | Preact, Solid, Vue, React | s. 4.2 |
| Routing | SPA, statisch ausgeliefert | SSR/SvelteKit mit Server | Kein Server nötig, kein Server erwünscht (A1, A2) |
| PWA / Offline | **vite-plugin-pwa (Workbox)** | Eigener Service Worker | Bewährt; Precaching der App-Hülle, Laufzeit-Caching der Inhaltspakete |
| Lokale Datenbank | **Dexie.js über IndexedDB** | SQLite-WASM mit OPFS, rohes IndexedDB | s. 4.3 |
| Wiederholung | **FSRS** (Bibliothek `ts-fsrs`) | SM-2, Leitner | s. 4.4 |
| Bastion-Darstellung | **PixiJS (WebGL/Canvas)**, nachgeladen | Canvas 2D selbstgebaut, SVG, Phaser | s. 4.5 |
| Mathe-Satz | **KaTeX** (lokal gebündelt) | MathJax | Schneller, kleiner, offline (A7) |
| Formeleingabe | **MathLive** (zu prüfen) | Eigenes Eingabefeld | Virtuelle Mathe-Tastatur auf Tablets; Gewicht und Barrierefreiheit vor Einsatz testen |
| Oberflächen-Übersetzung | **Paraglide JS** | i18next | Übersetzungen werden kompiliert und nur geladen, wenn gebraucht |
| RTL | CSS Logical Properties durchgängig | Nachträgliche Anpassung | RTL muss ab Tag 1 eingebaut sein, sonst nie (A6) |
| Krypto | **WebCrypto** (Browser-eigen) | Fremdbibliotheken | PIN-Hashing, verschlüsselter Export, keine Abhängigkeit |
| QR erzeugen / lesen | `qrcode` + `BarcodeDetector`, Fallback `zxing-wasm` | jsQR | `BarcodeDetector` fehlt in Safari und Firefox, daher Fallback nötig |
| Tests | **Vitest**, **Playwright**, **fast-check** | Jest, Cypress | Einheiten, Ende-zu-Ende inkl. Offline, Eigenschaftstests für Generatoren |
| Paketverwaltung | **pnpm Workspaces** | npm, Nx, Turborepo | Monorepo ohne Zusatzwerkzeug |
| Hosting | Statisch; Entwicklung über GitHub Pages, Produktivbetrieb offen (O-13) | Eigene Cloud | Nur Dateien, keine Logs mit Nutzerbezug (A2) |

Alle Versionen werden in Phase 0 festgelegt und gepinnt; die Bibliotheksnamen oben sind Kandidaten, deren aktueller Stand vor der Festlegung zu prüfen ist.

### 4.2 Warum Svelte 5

Kandidaten waren Svelte, Preact und Solid (klein, schnell) sowie React und Vue (großes Ökosystem).

- **Bundle und Laufzeit:** Svelte kompiliert zu schlankem Code ohne großes Laufzeit-Framework – direkt wirksam auf alten Geräten (A3).
- **Lesbarkeit:** Komponenten sind nah an HTML/CSS; Beitragende aus dem Bildungsbereich finden sich schneller zurecht (A10).
- **Reaktivität (Runes)** passt gut zu einem Kern, der Zustand als Ereignisse liefert.
- **Gegenargument React:** größter Pool an Entwicklern und Bibliotheken. Wiegt hier weniger, weil die Fachlogik ohnehin framework-frei ist (T-2) und wir wenige UI-Bibliotheken brauchen.

**Entscheidung T-3:** Svelte 5. Durch T-2 ist das eine umkehrbare Entscheidung: Ein Wechsel beträfe nur die Oberfläche.

*Bestätigt im Review (27.10.2026):* Ausschlaggebend war, dass keine Framework-Vorerfahrung besteht; Svelte ist am leichtesten zu lernen und am besten lesbar. **Verbindliche Regel:** ausschließlich Svelte-5-Schreibweise (Runes: `$state`, `$derived`, `$effect`, `$props`; Ereignisse als `onclick`). Keine Svelte-4-Syntax (`export let`, `$:`, `on:click`, Stores für lokalen Zustand). KI-Werkzeuge mischen sonst alte Syntax hinein; Compiler-Warnungen zu veralteter Syntax gelten im Build als Fehler.

### 4.3 Speicher: Dexie statt SQLite-WASM

- **Dexie/IndexedDB:** überall verfügbar, ausgereift, gute Migrationsunterstützung, kein WASM-Download.
- **SQLite-WASM:** echte Abfragesprache, attraktiv für komplexe Auswertungen – aber zusätzliches Gewicht, mehr Browser-Sonderfälle und für unser Datenmodell nicht nötig.

**Entscheidung T-4:** Dexie. Zugriff ausschließlich über Repository-Schnittstellen in `src/storage/` (umgesetzt: `ablage.ts`), damit ein späterer Wechsel möglich bleibt.

localStorage nur für kleine Geräteeinstellungen (Theme, Sprache), nie für Lern- oder Bastion-Daten.

### 4.4 Wiederholung: FSRS statt Leitner

Die Lerninsel nutzt eine Lernkartei. Für Bastion schlage ich **FSRS** vor, ein modernes Wiederholungsverfahren, das Abstände aus dem tatsächlichen Erinnerungsverhalten schätzt.

- Weniger unnötige Wiederholungen bei gleicher Behaltensleistung – wichtig, weil Lernzeit begrenzt ist.
- Liefert eine **Erinnerungswahrscheinlichkeit pro Element**. Genau diese Größe brauchen wir für Erz (KONZEPT §5.1) und für ehrliche Elternberichte („gefestigt“).
- Für Jugendliche bleibt die Oberfläche einfach (zwei bis drei Bewertungsstufen, nicht vier).

**Entscheidung T-5:** FSRS als Planungsverfahren, sichtbar als einfache Kartei.

*Umsetzung (1b):* `src/core/srs/karten.ts` – eine Karte je Vorlage und Niveau, Zielerinnerung 90 %, Bewertung „nochmal/schwer/gut“ aus dem Ereignis (DATENMODELL §4.1).

### 4.5 Bastion-Darstellung

- **PixiJS:** flüssige 2D-Darstellung mit vielen Objekten, Zoom, Animationen; fällt automatisch auf Canvas zurück. Wird **nur geladen, wenn der Basebau aktiv ist** (R7, A3).
- **Barrierefreiheit:** Eine Canvas-Welt ist für Screenreader unsichtbar. Daher gibt es eine gleichwertige **Listenansicht der Bastion** (DOM): Gebäude, Stufen, Bauvorhaben, Aktionen. Sie ist zugleich der reizarme Modus. Der Kern liefert beiden Ansichten dieselben Daten.
- *Verworfen:* Phaser (vollständige Spiel-Engine, wir brauchen keine Physik oder Szenenverwaltung); reines SVG (bei hunderten Objekten auf schwachen Geräten zu langsam).

**Entscheidung T-6:** PixiJS, nachgeladen, mit gleichwertiger Listenansicht.

Grafikstil (isometrisch vs. Draufsicht) ist eine Gestaltungsentscheidung für `BASEBAU.md`; technisch tragen beide. *Entschieden: Draufsicht (BASEBAU B-11). PixiJS bleibt nach Rückfrage am 28.10.2026 gesetzt.*

*Umsetzung (2.12):* PixiJS 8.22.0 (§4.6). Nur `src/ui/bastion/grafik/grafik-buehne.ts` importiert es, und nur per dynamischem Import aus `Bauplatz.svelte` – also erst, wenn die Bastion bei eingeschaltetem Basebau geöffnet wird. `tools/nachgeladen.ts` bestimmt aus dem Vite-Manifest, welche Dateien nur nachgeladen werden: Sie stehen **nicht** im Vorab-Speicher des Service Workers, werden beim ersten Öffnen gespeichert (CacheFirst) und gehen danach offline. Damit das schon beim ersten Besuch klappt, übernimmt der Service Worker die Seite sofort (`clientsClaim`); Updates warten weiter auf Zustimmung. Ohne WebGL oder bei einem Fehler entfällt das Bild; die Liste bleibt.

### 4.6 Festgelegte Versionen

Alle Versionen sind in `package.json` exakt gepinnt (`.npmrc`: `save-exact=true`), das Lockfile `pnpm-lock.yaml` wird mit committet. Stand 27.10.2026:

| Baustein | Version | Art |
|---|---|---|
| Node.js | ≥ 22 | Werkzeug |
| pnpm | 10.28.0 | Werkzeug |
| TypeScript | 6.0.3 | Werkzeug |
| @types/node | 22.20.5 | Werkzeug (nur `tools/`, `tests/`, Konfiguration) |
| Vite | 8.3.5 | Werkzeug |
| Svelte | 5.57.3 | wird in die App kompiliert (T-3) |
| @sveltejs/vite-plugin-svelte | 7.3.1 | Werkzeug |
| svelte-check | 4.7.7 | Werkzeug |
| vite-plugin-pwa | 2.0.0 | Werkzeug (erzeugt Service Worker und Manifest) |
| workbox-window | 7.4.1 | **Laufzeit**, ca. 2 KB komprimiert: meldet der Seite neue Versionen. Teil der Entscheidung „vite-plugin-pwa (Workbox)“, §4.1 |
| Vitest | 5.0.5 | Werkzeug |
| @playwright/test | 1.63.0 | Werkzeug (Ende-zu-Ende-Tests, Leistungsmessung) |
| yaml | 2.9.1 | Werkzeug (liest die Inhalte in `content/`, nicht in der App) |
| Dexie | 4.4.6 | **Laufzeit**, ca. 32 KB komprimiert: Speicher im Browser (T-4). Freigegeben vom Projektverantwortlichen am 28.10.2026; bewusst nicht die jüngste Version 4.4.7 (erst 9 Tage alt) |
| pixi.js | 8.22.0 | **Laufzeit**, nur nachgeladen: Grafik der Bastion (T-6). Freigegeben vom Projektverantwortlichen am 28.10.2026 (veröffentlicht am 1.10.2026). Mitgebrachte Pakete mit MIT-, ISC- oder BSD-Lizenz. Etwa 147 KB komprimiert, eigenes Budget 300 KB (§9) |
| ts-fsrs | 5.4.2 | **Laufzeit**: Wiederholungsplanung FSRS (T-5). Freigegeben vom Projektverantwortlichen am 28.10.2026. Eingestellt ohne Zufall in den Abständen und ohne Minuten-Lernschritte, damit die Planung aus den Ereignissen wiederholbar ist |
| fake-indexeddb | 6.2.5 | Werkzeug (IndexedDB in Node für Tests der Ablage) |
| fast-check | 4.10.2 | Werkzeug (Eigenschaftstests) |
| ESLint | 10.13.0 | Werkzeug |
| typescript-eslint | 8.72.1 | Werkzeug |
| eslint-plugin-svelte | 3.23.1 | Werkzeug |
| eslint-plugin-boundaries | 7.4.0 | Werkzeug (Ordnergrenzen, T-10) |
| Prettier (+ prettier-plugin-svelte) | 3.9.10 (4.1.1) | Werkzeug |

TypeScript 7 (die neue, native Umsetzung) wird noch nicht genutzt, weil `svelte-check` und `typescript-eslint` sie noch nicht unterstützen.

Zwei TypeScript-Konfigurationen: `tsconfig.json` für die App (`src/`, Browser-Typen, keine Node-Typen) und `tsconfig.node.json` für `tools/`, `tests/` und Konfigurationsdateien (Node-Typen). `pnpm check` prüft beide.

Einheitentests liegen als `*.test.ts` direkt neben dem Code; `tests/` enthält die Ende-zu-Ende-Tests.

### 4.7 Leitplanken im Lint (umgesetzt in 0.7b)

`pnpm lint` führt nacheinander ESLint, Prettier (`--check`) und `svelte-check` aus; jede Meldung macht ihn rot.

| Regel | Werkzeug |
|---|---|
| `src/core` importiert nichts aus `src/ui`, `src/storage`, `src/generators`, `src/main.ts` | `eslint-plugin-boundaries` |
| `src/core/bastion` importiert nur aus `src/core/ledger`, keine Fremdpakete | `eslint-plugin-boundaries` + `no-restricted-imports` |
| Keine Browser-APIs (`window`, `localStorage`, `crypto`, Timer …) und kein Svelte in `src/core` | `no-restricted-globals`, `no-restricted-imports` |
| Nur Runes-Syntax: `export let` und `$:` sind Compilerfehler, `on:click` u. a. Warnungen gelten als Fehler | Svelte `runes: true`, `onwarn` im Build, `svelte/valid-compile`, `svelte-check --fail-on-warnings` |

| Nur logische CSS-Eigenschaften (`margin-inline-start` statt `margin-left`, `inline-size` statt `width` …) | Test `tools/logische-css.test.ts` |

`tools/ordnergrenzen.test.ts` prüft bei jedem Testlauf, dass absichtlich falsche Importe tatsächlich gemeldet werden – so kann eine Konfigurationsänderung die Grenzen nicht unbemerkt abschalten.

### 4.8 Oberflächen-Grundlage (umgesetzt in 0.7d)

- Oberflächentexte stehen in `src/ui/texte/de.json` und werden über `t('schluessel')` geholt; Tippfehler im Schlüssel sind Typfehler. Die Datei legt auch Sprache und Schreibrichtung (`lang`, `dir`) fest.
- Grund-CSS in `src/ui/grund.css`: Farben als CSS-Variablen, Hell/Dunkel folgt der Systemeinstellung (`prefers-color-scheme`), reduzierte Bewegung wird respektiert, nur Systemschriften.
- Eine Umschaltung Hell/Dunkel in der App folgt mit den Einstellungen (Phase 1).

### 4.9 Offline-Hülle (umgesetzt in 0.8)

- **Precaching:** Beim ersten Laden speichert der Service Worker die komplette App-Hülle (HTML, JS, CSS, Icons, Manifest). Danach startet die App ohne Netz.
- **Updates:** `registerType: 'prompt'`. Eine neue Version wird im Hintergrund geladen, aber erst aktiviert, wenn die Person im Hinweis „Jetzt aktualisieren“ wählt. „Später“ blendet den Hinweis aus; beim nächsten Start wird erneut gefragt. So wechselt die Version nie mitten in einer Sitzung.
- **Dauerhafter Speicher:** Beim Start wird `navigator.storage.persist()` angefragt (T-1). Das Ergebnis zeigt der Elternbereich zusammen mit dem Datum der letzten Sicherung (seit 1c). Die Erinnerung an eine Sicherung erscheint monatlich auf der Startseite (`sicherungFaellig` in `src/core/sicherung/sicherung.ts`).
- **Icons:** `public/icon.svg` ist die Vorlage; die PNG-Icons sind daraus abgeleitet (Platzhalter bis zur Gestaltung).
- Code: `vite.config.ts` (Manifest, Workbox), `src/ui/plattform/offline.svelte.ts`, `src/ui/plattform/speicher.ts`, `src/ui/UpdateHinweis.svelte`.

### 4.10 Tests und CI (umgesetzt in 0.9)

Workflow `.github/workflows/ci.yml`, bei jedem Push und Pull Request:

1. `pnpm lint` – ESLint inkl. Ordnergrenzen, Prettier, Typprüfung
2. `pnpm test` – Einheitentests (Vitest), darunter die Tests der Leitplanken
3. `pnpm build` – mit `BASE_PATH=/` wie unter https://bastion.micana.de/
4. `pnpm budget` – Größenbudget §9: App-Hülle ≤ 250 KB, Generatoren ≤ 400 KB, Grafik ≤ 300 KB, jeweils gzip (`tools/groessenbudget.ts`)
5. `pnpm test:e2e` – Playwright gegen den fertigen Build: einmal online laden, dann offline neu laden; dabei darf keine Anfrage an eine fremde Adresse gehen (A2)
6. Nur auf `main`: Veröffentlichung auf GitHub Pages unter **https://bastion.micana.de/**

Alle GitHub Actions sind auf Commit-Hashes gepinnt. Für die Veröffentlichung muss in den Repository-Einstellungen unter *Settings → Pages → Source* „GitHub Actions“ gewählt und unter *Custom domain* `bastion.micana.de` eingetragen sein (mit „Enforce HTTPS“). Beim DNS-Anbieter von `micana.de` braucht es dafür einen CNAME-Eintrag `bastion` → `michael-linuxdev.github.io`. Eine `CNAME`-Datei im Build ist bei Veröffentlichung über Actions nicht nötig. GitHub Pages für private Repositories setzt einen kostenpflichtigen GitHub-Plan voraus; solange das Repository privat ist (O-8), schlägt nur der Schritt „Veröffentlichen“ fehl, die Prüfungen laufen trotzdem.

## 5. Datenmodell: Ereignisse als Wahrheit

**Entscheidung T-7:** Lernereignisse und Ressourcenbuchungen werden als unveränderliche Ereignisse gespeichert (append-only). Aktuelle Zustände sind daraus abgeleitet und werden zwischengespeichert.

```
LearningEvent   { id, ts, competenceId, itemId, kind, outcome, contentVersion }
LedgerEntry     { id, ts, resource, amount, sourceEventId, ruleVersion }
BuildAction     { id, ts, buildingId, action, cost[] }
Snapshot        { ts, derivedState, lastEventId }   // Zwischenstand für schnelles Laden
```

*Warum:*
- **Nachvollziehbarkeit:** „Woher kommt dieses Erz?“ ist jederzeit beantwortbar – auch für Eltern.
- **Rebalancing ohne Datenverlust:** `ruleVersion` erlaubt neue Balancing-Regeln für künftige Buchungen, ohne alte Erfolge zu entwerten. Bestehende Bastionen werden **nie** rückwirkend verkleinert (R3).
- **Zukunftsfähig für Mehrgeräte-Synchronisation:** Ereignislisten lassen sich zusammenführen, Zustandsabbilder nicht.
- **Datensparsamkeit:** Alte Rohereignisse können nach einer Frist zu Zusammenfassungen verdichtet werden. Elternberichte arbeiten nur auf Zusammenfassungen.

Ausgearbeitet in `DATENMODELL.md`; dort werden Snapshots durch Projektionen und Verdichtungs-Ereignisse ersetzt. Jedes Schema hat eine Versionsnummer; jede Migration hat einen Test mit echten Altständen (Testdaten-Archiv ab Phase 1).

## 6. Inhalte als Daten

**Entscheidung T-8:** Inhalte sind versionierte Datenpakete, kein Code in der App. Ausnahme: Generatoren.

- **Quellformat:** YAML oder Markdown mit Kopfdaten, validiert gegen JSON-Schema. Lesbar und bearbeitbar für Lehrkräfte ohne Programmierkenntnisse (Vorbereitung für O-2).
- **Paketierung:** `tools/content-build` prüft, verknüpft mit dem Kompetenzgraphen und erzeugt Pakete pro *Fach × Bereich* mit allen Niveaus (korrigiert durch I-10, siehe `INHALTSFORMAT.md`) mit Prüfsumme und Version.
- **Laden:** Die App-Hülle ist sofort offline nutzbar; Inhaltspakete werden nach Auswahl (Schulform, Klasse, Fächer) geladen und gespeichert. Speicherbedarf wird vorher angezeigt.
- **Generatoren:** TypeScript-Module mit festgelegter Schnittstelle (`seed → Aufgabe + Lösung + Lösungsweg`), reproduzierbar über den Seed. Eigenschaftstests prüfen z. B. „Lösung ist immer ganzzahlig auf Niveau grundlegend“.
- **Lizenz:** Inhalte getrennt vom Code lizenzierbar (O-8); eigenes Repository möglich.
- Ein Paket darf nie Code enthalten, der zur Laufzeit ausgeführt wird. Das hält Fremdbeiträge sicher.

## 7. Sicherheit, ehrlich betrachtet

- **Eltern-PIN:** gehasht mit PBKDF2 über WebCrypto. Ehrliche Einordnung: Auf einem Gerät, das der Jugendliche kontrolliert, ist eine lokale PIN eine **Hürde, keine Festung**. Mit Entwicklerwerkzeugen lässt sie sich umgehen. Das dokumentieren wir offen im Elternbereich, statt falsche Sicherheit zu versprechen.
- **Manipulation von Spielständen:** bewusst akzeptiert (KONZEPT §11) – ohne Ranglisten schadet sie niemandem.
- **Export:** verschlüsselt mit Passphrase (AES-GCM über WebCrypto).
- **Abhängigkeiten:** minimal halten; jede neue Laufzeitabhängigkeit braucht einen Eintrag im Entscheidungslog. Lockfile, gepinnte Versionen, keine Laufzeit-CDNs. Content Security Policy ohne Fremd-Domains.

## 8. Balancing-Simulator

**Entscheidung T-9:** Ab Phase 2 gibt es ein Simulationswerkzeug (`tools/sim`), das den echten Kern mit synthetischen Lernprofilen durchspielt.

Beispielprofile: „15 Min. täglich, gemischte Leistung“, „Wochenend-Lernerin“, „Farmer, der nur leichte Aufgaben macht“, „drei Wochen krank“, „Prüfungsphase“.

Ausgabe: Wie schnell wächst die Bastion pro Profil über Wochen und Jahre? Lohnt Farmen? Wird die Wochenend-Lernerin abgehängt?

*Umsetzung (2.11):* `tools/sim/simulator.ts`, Aufruf `pnpm sim`. Ergebnisse in `BASEBAU.md` §8a.

*Warum:* Balancing-Fehler sind in einem Langzeitspiel teuer, weil wir Erfolge nie zurücknehmen (R3). Wir müssen sie finden, bevor echte Jugendliche sie finden. Das ist nur möglich, weil der Kern framework-frei ist (T-2).

## 9. Leistungsbudget

Zielwerte, in der Build-Pipeline geprüft:

| Messgröße | Ziel |
|---|---|
| App-Hülle + Lernkern (komprimiert) | ≤ 250 KB JavaScript |
| Bastion-Modul (zusätzlich, nachgeladen) | ≤ 300 KB + Grafiken |
| Aufgaben-Generatoren (nachgeladen, vorab gespeichert, T-14) | ≤ 400 KB JavaScript |
| Erste Nutzbarkeit auf Referenz-Altgerät | ≤ 3 s |
| Referenzgeräte | ein günstiges Android-Handy (ca. 4 Jahre alt), ein Schul-Chromebook, ein älteres iPad |

Die Zahlen sind Startwerte und werden in Phase 1 an Messungen angepasst.


*Seit 2.12 prüft `pnpm budget` beides getrennt:* App-Hülle und Lernkern ≤ 250 KB, Nachgeladenes (Grafik der Bastion) ≤ 300 KB, jeweils gzip. Stand 28.10.2026: 156 KB und 147 KB. *Seit T-14 (28.10.2026) dazu die Aufgaben-Generatoren getrennt:* ≤ 400 KB. Stand nach dem Umbau mit Klasse 5 bis 8: App-Hülle 120 KB (vorher 212 KB), Generatoren 93 KB, Grafik 148 KB.
### 9.1 Referenzgeräte (Aufgabe 0.10)

| Rolle | Kriterium | Gerät |
|---|---|---|
| Günstiges Android-Handy | ca. 4 Jahre alt, ≤ 3 GB RAM, Chrome | *vom Projektverantwortlichen festzulegen* |
| Schul-Chromebook | Einstiegsmodell, wie es Schulen ausgeben | *festzulegen (oder Ersatz: alter Laptop mit Chrome)* |
| Älteres iPad | ≥ 5 Jahre alt, aktuellstes noch unterstütztes iPadOS, Safari | *festzulegen* |

Geräte aus dem eigenen Umfeld oder dem der Testgruppe genügen. Wichtig ist, dass sie gleich bleiben, damit Messungen vergleichbar sind.

### 9.2 Messung

**Nachgeahmt (reproduzierbar):** `pnpm build && pnpm messen` (`tools/messung.ts`) lädt den Build in Chromium – je fünfmal mit leerem Browserprofil – einmal ungedrosselt und einmal als „Altgerät“ (CPU sechsfach gedrosselt, langsames 4G: 150 ms Latenz, 1,6 Mbit/s). Gemessen werden die erste Darstellung, „nutzbar“ (Überschrift sichtbar) und die übertragene Datenmenge, jeweils für den ersten Besuch online und den Neustart offline. Die Drosselung wirkt relativ zum Messrechner; Werte verschiedener Rechner sind nur grob vergleichbar.

**Erste Messung (27.10.2026, Gerüst-App, Messrechner: Cloud-Container):**

| Profil | Fall | Erste Darstellung | Nutzbar | Übertragen |
|---|---|---|---|---|
| Desktop, ungedrosselt | erster Besuch online | 56 ms | 98 ms | 17,9 KB |
| Desktop, ungedrosselt | Neustart offline | 44 ms | 69 ms | 0 KB |
| Altgerät (CPU ÷6, langsames 4G) | erster Besuch online | 556 ms | 716 ms | 17,9 KB |
| Altgerät (CPU ÷6, langsames 4G) | Neustart offline | 156 ms | 323 ms | 0 KB |

Ziel „erste Nutzbarkeit ≤ 3 s“ ist für die Gerüst-App deutlich erfüllt. Aussagekräftig wird die Messung erst mit Lernkern und Inhalten; sie wird bei jeder größeren Änderung wiederholt und hier ergänzt.

**Auf echten Geräten (offen):** Seite `https://bastion.micana.de/` in einem frischen privaten Fenster öffnen und die Zeit bis zur sichtbaren Überschrift notieren; genauer über die Entwicklerwerkzeuge (Android: Chrome-Fernzugriff über `chrome://inspect`; iPad: Safari-Webinformationen über einen Mac). Danach Flugmodus an, App neu öffnen, ebenso messen. Ergebnisse in eine Tabelle wie oben eintragen.

## 10. Später, nicht jetzt

| Thema | Wann | Bemerkung |
|---|---|---|
| App-Store-Hüllen (Capacitor / Trusted Web Activity) | nach Phase 3 | Nur, wenn Schulen oder Familien es brauchen (O-10) |
| Mehrgeräte-Synchronisation | offen | Nur lokal (z. B. QR, Datei, lokales Netzwerk), nie über unseren Server; Ereignismodell (T-7) bereitet vor |
| Lokale KI für Freitext | offen (O-6) | Erst, wenn Modelle zuverlässig und klein genug auf Schulgeräten laufen |
| Offline-Vorlesen | Phase 3 | Web Speech API nutzt Systemstimmen; Verfügbarkeit offline und je Sprache schwankt, vorher pro Plattform testen |

## 11. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| T-1 | PWA statt nativ; Sicherungs-Erinnerung wegen Speicherlöschung | Entschieden |
| T-2 | Framework-freier TypeScript-Kern, Monorepo | Entschieden |
| T-3 | Svelte 5 für die Oberfläche | Entschieden |
| T-4 | Dexie/IndexedDB hinter Repository-Schicht | Entschieden |
| T-5 | FSRS als Wiederholungsverfahren | Entschieden |
| T-6 | PixiJS nachgeladen + gleichwertige Listenansicht | Entschieden |
| T-7 | Ereignisbasiertes Datenmodell mit Regelversionen | Entschieden |
| T-8 | Inhalte als validierte Datenpakete, Generatoren als Code | Entschieden |
| T-9 | Balancing-Simulator ab Phase 2 | Entschieden |
| T-10 | Ein Paket mit erzwungenen Ordnergrenzen statt Monorepo | Entschieden |
| T-11 | Stack-Bausteine phasenweise einführen | Entschieden |
| T-12 | GitHub-Repo als einzige Quelle der Wahrheit; Phasen als Milestones, Aufgaben als Issues | Entschieden |
| T-13 | Implementierung überwiegend mit Claude Code; Qualität über automatische Prüfungen und `CLAUDE.md` abgesichert | Entschieden |
| T-14 | **Aufgaben-Generatoren nachgeladen, aber vorab gespeichert:** `src/generators/alle.ts` sammelt alle Generatoren und wird mit den Inhaltspaketen nachgeladen (`generatorenLaden()` in `src/generators/index.ts`). Der Service Worker speichert die Datei trotzdem beim Installieren, Üben geht also auch ohne Netz. So bleibt die App-Hülle klein, auch wenn bis Klasse 12 und darüber hinaus Generatoren dazukommen. Keine neue Abhängigkeit. Eigenes Budget 400 KB (§9) | Entschieden (28.10.2026, freigegeben vom Projektverantwortlichen) |

## 12. Offene Punkte zum Stack

- **Formeleingabe:** MathLive gegen eigenes, schlankes Eingabefeld testen (Gewicht, Tablet-Bedienung, Screenreader).
- **Hosting-Ort und Domain (O-13):** Domain ist `bastion.micana.de` (27.10.2026), ausgeliefert vorerst über GitHub Pages. Weil die App nur über die eigene Domain erreichbar ist, ist ein späterer Umzug des Hosters für Nutzer unsichtbar – wichtig, weil Service Worker und lokale Daten an die Adresse gebunden sind. GitHub Pages ist für Entwicklung und Tests bequem. Für den Produktivbetrieb ist zu prüfen, ob ein Anbieter mit Sitz in der EU (z. B. Codeberg Pages oder ein deutscher Webhoster) besser passt: Beim ersten Laden erhält jeder Host die IP-Adresse, und Schulen achten bei US-Anbietern besonders auf Datenschutzfragen. Da die App eine statische Seite ist, ist ein späterer Umzug einfach.
- **Lerninsel-Daten übernehmen?** Ein Import des Lerninsel-Spielstands als „Erbstück“ in der Bastion wäre ein schöner Übergang – setzt Kenntnis des Lerninsel-Speicherformats voraus.

## 13. Anpassung an das Ein-Personen-Projekt

Stand nach KONZEPT §12. Die Architekturprinzipien bleiben, der Aufwand wird gesenkt.

**Entscheidung T-10: Ein Paket statt Monorepo – Grenzen per Regel statt per Paket.**
Start mit einem einzigen Projekt und der Ordnerstruktur aus §3 (`src/core/…`, `src/storage/`, `src/ui/`, `tools/`). Die Abhängigkeitsregeln (z. B. „`core` importiert nichts aus `ui`“, „`bastion` importiert nur `ledger`“) werden durch eine Lint-Regel im Build erzwungen (z. B. dependency-cruiser oder ESLint-Grenzregeln).
*Warum:* Workspaces, getrennte Builds und Paketversionen kosten eine Einzelperson laufend Zeit, ohne dass jemand parallel arbeitet. Die Lint-Regel sichert dieselbe Trennung (T-2). Aufteilen in Pakete ist später ein mechanischer Schritt.

**Entscheidung T-11: Stack-Teile erst einführen, wenn ihre Phase beginnt.**

| Baustein | Eingeführt in |
|---|---|
| TypeScript, Vite, Svelte 5, vite-plugin-pwa, Dexie, ts-fsrs, KaTeX, Vitest, Playwright, fast-check | Phase 0/1 |
| Balancing-Simulator (`tools/sim`) | Phase 2 |
| PixiJS, QR (`qrcode`, `BarcodeDetector`, Fallback) | Phase 3 |
| Formeleingabe (MathLive oder eigene Lösung) | Phase 4, nur falls Tests sie erfordern |
| Paraglide JS (weitere Oberflächensprachen) | Phase 5 – Texte aber ab Phase 1 nicht hart im Code, sondern in einer Textdatei |

Was ab Tag 1 drin sein muss, weil Nachrüsten teuer ist: RTL-fähiges CSS (Logical Properties), ereignisbasiertes Datenmodell mit Schemaversion (T-7), Export/Import, Offline-Ende-zu-Ende-Test.

**Testumfang für eine Person:** Einheitentests für den Kern (Ledger, FSRS-Anbindung, Generatoren, Migrationen) sind Pflicht. Ende-zu-Ende-Tests nur für wenige kritische Wege: erster Start offline, Lernsitzung, Export und Import, Update ohne Datenverlust.

**Arbeitsweise mit dem Repository (T-12):** Das GitHub-Repository ist die einzige Quelle der Wahrheit für Code *und* Konzept. Jede Arbeitssitzung – allein oder mit KI-Unterstützung – beginnt mit `docs/SESSION-PROMPT.md` und endet mit dessen Aktualisierung. Dokumentänderungen laufen über Commits wie Code; Entscheidungen werden im selben Commit dokumentiert, in dem sie umgesetzt werden. Roadmap-Phasen werden als GitHub-Milestones, Aufgaben aus `PLAN.md` als Issues geführt.

## 14. Implementierung mit Claude Code

**Entscheidung T-13:** Der Code entsteht überwiegend mit Claude Code. Der Projektverantwortliche steuert, prüft Verhalten und Ergebnisse und trifft Entscheidungen; er muss nicht jede Codezeile selbst schreiben.

*Konsequenz:* Weil Code nicht Zeile für Zeile von Hand geprüft wird, tragen **automatische Prüfungen** die Qualität. Sie sind deshalb ab Phase 0 Pflicht und nicht verhandelbar:
- TypeScript im strengen Modus, Lint inklusive Ordnergrenzen (T-10) und Svelte-5-Regel (T-3)
- Tests für jeden Kern-Baustein; Generator-Tests nach INHALTSFORMAT §6.3
- Offline-Ende-zu-Ende-Test und Größenbudget in der CI
- Kein Merge mit roter CI

*Arbeitsregeln für Claude Code* stehen in `CLAUDE.md` im Wurzelverzeichnis. Kernpunkte: kleine Schritte, jede Änderung in einfachem Deutsch erklären, Dokumente im selben Commit aktualisieren, keine neue Laufzeitabhängigkeit und keine Netzwerkverbindung ohne Eintrag im Entscheidungslog.

*Lernpfad nebenbei:* Wer mit KI programmiert, sollte die Grundbegriffe trotzdem verstehen, um Erklärungen bewerten zu können. Empfehlung: Das offizielle Svelte-Tutorial einmal durcharbeiten, bevor Phase 1 beginnt.

