# Prompt: Funde des Reviews vom 10.11.2026 beheben

> Entwurf, erstellt von Claude am 10.11.2026 nach dem Review (Stand `main` f4340da).
> Die „Entscheidungen“ darin sind Vorschläge, die der PV noch nicht bestätigt hat.
> Vor dem Start bitte prüfen: die Schwelle in A1, die Sperre in A1c und B1.

````text
Lies CLAUDE.md, docs/SESSION-PROMPT.md, docs/session/QUALITAET-5-10.md und die
Strang-Dateien docs/session/LERNKERN.md und docs/session/OBERFLAECHE.md.

AUFTRAG
Behebe die Funde des Reviews vom 10.11.2026 (Stand main f4340da). Du arbeitest
strangübergreifend im Auftrag des Projektverantwortlichen (PV); das ist die
Ausnahme zu Regel 1 in SESSION-PROMPT.md. Trage je PR eine Zeile im Protokoll
des betroffenen Strangs ein.

STRENGE REGELN
1. Ein Fund = ein Thema = ein Commit = ein PR. Reihenfolge wie unten, Paket A zuerst.
2. Erst nachstellen, dann beheben. Schreibe zu jedem Fund zuerst einen Test, der
   ohne die Korrektur rot ist. Lässt sich ein Fund nicht nachstellen: nichts
   ändern, im Abschlussbericht als "nicht bestätigt" melden. Funde mit [U] sind
   nicht zweitgeprüft und besonders kritisch zu prüfen.
3. pnpm lint, pnpm test, pnpm build und pnpm fehlerschueler --grenze sind vor
   jedem Commit grün. Kein Test wird übersprungen, abgeschwächt oder gelöscht.
   Die Grenzdatei des Fehler-Schülers wird nicht angehoben.
4. Die Lehrplan- und Prüfungs-PDFs liegen dir nicht vor. Verwende nur die
   Tatsachen aus dem Abschnitt QUELLEN unten. Erfinde keine Lernbereichstitel,
   Seitenzahlen oder Prüfungsregeln. Fehlt dir eine Angabe: Rückfrage, nicht raten.
5. Keine neue Abhängigkeit. Keine Änderung am Datenbankschema. Keine Änderung
   am Format von kompetenz.yaml ohne Rückfrage.
6. Geänderte Inhaltsdateien fallen auf Review-Stufe 0 zurück, wie im Repo
   üblich. Setze selbst keine Stufe 1. Geänderte Generatoren bekommen eine neue
   Fassung (@2), die alte bleibt registriert, wenn Lernstände daran hängen.
7. Nicht in diesem Auftrag: alles, was der Strang Abitur baut (Prüfungsformate,
   Aufgabenfamilien, Rechenkern, Jahrgang 11/12), Grafik der Bastion, Variante B,
   Umbauten "bei der Gelegenheit".
8. Dokumente im selben Commit anpassen. Am Ende einen Abschnitt "Übergabe" in
   QUALITAET-5-10.md mit: erledigt, nicht bestätigt, offen beim PV.
9. Erkläre jede Änderung in einfachem Deutsch: was, warum, wie ausprobieren.

PAKET A - Fehler, die Lernende treffen
A1 "Gekonnt" in Klasse 9/10 unerreichbar.
   src/core/learning/fortschritt.ts:14 verlangt GEKONNT.vorlagen = 2, ebenso
   istGefestigt, niveau-wahl.ts:68 und die Diagnose (fortschritt.ts:105).
   Viele Themen haben je Niveau nur eine Vorlage (Beispiel M.DZ.ST.HISTOGRAMM).
   a) Zähle zuerst: Kompetenz x Niveau mit nur einer Vorlage, je Klasse.
   b) Regel: verlangt werden min(2, Zahl der vorhandenen Vorlagen auf dem
      Niveau). Die Zahl kommt als Parameter in den Kern, kein Zugriff auf Inhalte
      aus fortschritt.ts. Bestehende Stände dürfen nicht schlechter werden.
   c) Sperre in tools/inhalte/pruefen.ts: Liste der Paare mit nur einer Vorlage
      als Grenzdatei, die nur kürzer werden darf (Vorbild fehlerschueler-grenze).
   d) LEHRPLAN §6 und INHALTSFORMAT §10.1 anpassen, Entscheidung ins Log.
A2 Minustaste fehlt. tf.einheitskreis@1
   (src/generators/mathematik/trigonometrische-funktionen/tf.ts:135) und
   pz.tilgung@1 (prozent/kredit.ts:118) liefern negative Lösungen ohne Kennzeichen
   "vorzeichen". Beheben. Dazu ein Test über ALLE Generatoren und 150 Startwerte:
   Jede Lösung muss mit den Tasten eingebbar sein, die tastenFuer anbietet.
A3 Falsche Rundung. allgemeine-dreiecke/ad.ts:22 (gerundet): a=9, b=7, 30 Grad
   ergibt 15,75, hinterlegt ist 15,7, richtig 15,8. Runde wie rundeAuf im Kern.
   Suche alle weiteren Stellen mit Math.round(x * f) / f in src/generators und
   behandle sie gleich. Eigenschaftstest mit Halbwerten.
A4 Negative Restschuld. prozent/kredit.ts:103: Kredit 6000, 4 %, Rate 3240
   ergibt -120. Rate so begrenzen, dass die Restschuld nach zwei Jahren > 0 ist.
A5 Zwei richtige Optionen. aehnlichkeit/aehnlichkeit.ts:248: zu 4 x 6 sind
   8 x 12 und 9 x 6 beide ähnlich. Distraktoren auf Ähnlichkeit prüfen (auch
   gedreht). Niveau M: jeder Distraktor muss die Dreiecksungleichung erfüllen.
   Dazu ein allgemeiner Test: keine Auswahlaufgabe mit zwei fachlich richtigen
   Optionen, soweit maschinell prüfbar.
A6 [U] Unmögliche Figuren: M.GM.AD.FLAECHE.VIERECK (ad.ts:425, beide
   Teildreiecke ergeben verschiedene Diagonalen), M.GM.KP.PYRAMIDE.OBERFLAECHE
   (koerper/pyramiden.ts:259, Seitenhöhen passen nicht zusammen oder sind
   <= a/2), M.GM.KP.STUMPF.OBERFLAECHE (koerper/stumpf.ts:247), Parallelogramm
   mit Höhe = Seite in M.GM.FL.VIERECKE.FLAECHE. Maße aus einer gültigen Figur
   ableiten, je ein Test auf Existenz.
A7 [U] Kleines: Bruch mit Nenner 1 im Text (M.SF.BR.GLEICHUNGEN.MAL und
   .PLUS-MINUS); "345,6 Tiere" in exponentialfunktionen/wachstum.ts (nur ganze
   Ergebnisse oder Rundungsangabe); Radfahrer mit 50 bis 80 km/h
   (gleichungen/linear.ts:446); "y = -1x²"; "Rechne mit pi" ohne pi.
A8 [U] Grammatik: prozent/prozent.ts:70 ("ist den Grundwert"), :362 ("Jacke ...
   es"); kreis/aussagen.ts:47 und koerper/klasse9.ts ab 476 ("ihr Umfang",
   "ihre Volumen"); prozent/wirtschaft.ts:334 ("4 Eier" im Dativ);
   gleichungssysteme/lgs.ts:465 ("Zahl der Erwachsene"); brueche/begriff.ts:30
   und :44 ("1 Teile"); M.ZO.BR.DEZ-ORDNEN/vermittlung.yaml:38.

PAKET B - Elternschutz, Daten, Auslieferung
B1 "Ich bin erwachsen" (src/ui/profil/Profil.svelte:38, App.svelte:871): Ist
   eine Eltern-PIN gesetzt, verlangt das Setzen des Hakens die PIN. Ohne PIN
   bleibt es wie heute. Das Geburtsdatum darf den Elternbereich nicht ohne PIN
   abschalten, wenn eine PIN gesetzt ist. e2e-Test.
B2 Bastion laden (App.svelte:905): {:catch}-Zweig mit Meldung und "Noch einmal
   versuchen". e2e-Test: offline vor dem ersten Öffnen.
B3 Sicherung (src/ui/sicherung/Sicherung.svelte:44): nicht selbst "gespeichert"
   setzen. Auf Touch-Geräten über Teilen wie beim PDF (T-23); sonst nach dem
   Herunterladen fragen "Liegt die Datei bei dir?". einspielen mit try/catch.
B4 Update-Hinweis: in Diagnose, Probe-Klassenarbeit, Bewährungsprobe und
   Erstvermittlung nicht anzeigen, erst danach.
B5 Bewährungsprobe (App.svelte:929): Date.now() aus dem Bezug entfernen, höchstens
   ein Bauplan je Lerntag und Themenliste. Kommentar "idempotent" in
   src/storage/ablage.ts:344 muss danach stimmen.
B6 [U] Fehlerwerkstatt zählt nicht für "gekonnt" (gleiche Aufgabe, Lösung
   gesehen). Geratene Antworten zählen nicht zur aktiven Zeit
   (src/core/learning/sitzung.ts:71). Vermittlungs-Abschlüsse bekommen eine
   Tagesgrenze (src/core/ledger/regeln.ts:327). Vorher die Zahlen des Reviews
   nachstellen; Regeländerungen mit Begründung ins Entscheidungslog.
B7 Content-Security-Policy als Meta-Tag in index.html: nur eigene Herkunft,
   connect-src zusätzlich die beiden Open-Meteo-Adressen. Prüfe e2e, dass KaTeX,
   PDF, Pixi und der Service Worker weiter gehen. Geht es nicht ohne
   'unsafe-inline' für Skripte: Rückfrage. ARCHITEKTUR T-22 berichtigen (es gibt
   21 {@html}-Stellen, nicht eine).
B8 Lint-Lücken (eslint.config.js): in src/core und src/generators verbieten:
   Math.random, Date.now, globalThis.fetch/localStorage, Import von dexie.
   Je Fall eine Probe in tools/ordnergrenzen.test.ts.
B9 [U] leseBruch (src/core/learning/auswertung.ts:56): Unicode-Minus und
   "-1 3/4" annehmen; sehr große Zähler liefern "keine-zahl" statt Fehler.
   Einstellungen bei gleicher Zeit: ablage.ts:399 und einstellung.ts:204
   gleich entscheiden (Eltern gewinnen).
B10 [U] Einspielen einer fremden Sicherung darf eine gesetzte Eltern-PIN nicht
   verwerfen (ablage.ts:493, :527). Wetter-Einstellung nach dem Einspielen auf
   einem neuen Gerät aus, bis sie dort neu eingeschaltet wird.

PAKET C - Lehrplan-Zuordnung (nur Tatsachen aus QUELLEN)
C1 M.RF.GF.WINKELPAARE: Eintrag sachsen.oberschule ergänzen (Kl. 6, LB 3
   Geometrie in der Ebene).
C2 Voraussetzung M.RF.KR.BEGRUENDEN entfernen bei PY.PYTHAGORAS, PW.WURZEL,
   QF.GRAPH, QF.INHALTLICH, PW.GESETZE, PF.POTENZFUNKTION (Kommentar dort: "für
   Niveau E"). [U] Ebenso prüfen: BR.VERGLEICHEN und BR.DEZIMAL <- BR.ERWEITERN;
   KR.UMFANG-FLAECHE <- KR.LAGE; PZ.KREDIT <- EX.SACH; PW.GESETZE <- PW.WURZEL.
C3 Test: Keine Kompetenz mit Oberschul-Eintrag hat eine Voraussetzung ohne
   Oberschul-Eintrag. Die heute 18 Fälle einzeln entscheiden (Eintrag ergänzen
   nur mit Beleg aus QUELLEN, sonst Kante lösen oder Rückfrage).
C4 M.SF.TU.UNGLEICHUNGEN: Oberschule Kl. 10 ist Wahlbereich 2, nicht "LB 2".
   LEHRPLAN.md:564 und :581 mit berichtigen.
C5 M.RF.KR.LAGE und M.RF.KR.WINKELSAETZE: Oberschule Kl. 8 "LB 3 Kreis und
   Kreiszylinder". WINKELSAETZE: Oberschule nur Satz des Thales.
   LEHRPLAN.md:454, :515-516 berichtigen. [U] M.GM.KP.PRISMA: Oberschule Kl. 7 LB 4.
C6 Hauptschulbildungsgang: NICHT bauen. Schreibe in LEHRPLAN.md §11 einen
   Vorschlag (Feld je Bildungsgang, betroffene Themen, Aufwand) und stelle die
   Rückfrage an den PV. LEHRPLAN.md:460 ("der HS hat dieselben Inhalte")
   abschwächen.
C7 Fehlende Themen als neue Kompetenzen im heutigen Format, Stufe 0, je Thema
   ein PR, jeweils mit zwei Vorlagen je Niveau: Maßstab (Kl. 8), abhängige und
   unabhängige Ereignisse (Kl. 8), Produkt von Summen (Kl. 8/9), Kreisbogen und
   Kreisausschnitt (GY Kl. 9). Erst nach Paket A bis C5 beginnen.
C8 Dritte Wurzel: Erklärung (M.ZO.PW.WURZEL/vermittlung.yaml:37,
   FV.PW.WURZEL-VORZEICHEN) und M.SF.PF.WURZELFUNKTION.EIGENSCHAFT widersprechen
   sich bei negativen Zahlen. Nicht selbst entscheiden: Rückfrage an den PV
   mit beiden Möglichkeiten.

PAKET D - Prüfungen (nur Dokument und Aufgabenblatt)
D1 docs/PRUEFUNGEN.md nach QUELLEN berichtigen (Zeilen 18, 31, 36, 43, 64, 77),
   Notenspalte ergänzen, Operatorenliste ergänzen. Quelle weiter als [ST-LK],
   [ST-GK] kennzeichnen, Hinweis "an amtlicher Quelle zu prüfen" bleibt.
D2 Aufgabenblatt (src/core/learning/arbeitsblatt.ts): Bild in den
   Dublettenschlüssel; verbleibende Dubletten nicht still übernehmen, sondern
   Anzahl kürzen und melden; Lösungsseite druckt Einheit, Rundung und Feldnamen;
   Fußzeile mit Inhaltsstand, damit Blatt und Lösung zusammenpassen.
D3 Schalter "Anrede Sie" für das Blatt (Probe-Klassenarbeit ab Klasse 9).
   Texte in de.json.

QUELLEN (aus den Originalen abgelesen; "S." = gedruckte Seite)
Lehrplan Oberschule Mathematik 2019:
- Kl. 6, LB 3 "Geometrie in der Ebene" (S. 14): Nebenwinkelsatz und
  Scheitelwinkelsatz, Stufenwinkelsatz und Wechselwinkelsatz an geschnittenen
  Parallelen, Innenwinkelsatz für Dreiecke. [zweitgeprüft]
- Realschulbildungsgang Kl. 8: LB 3 "Kreis und Kreiszylinder", LB 4 Ähnlichkeit.
  Kreis: Sehne, Sekante, Tangente, Satz des Thales, "Kennen eines Beweises zum
  Satz des Thales". Peripheriewinkelsatz, In- und Umkreis stehen dort nicht.
- Kl. 10: LB 2 heißt "Funktionale Zusammenhänge"; Ungleichungen nur im
  Wahlbereich 2.
- Prismen berechnen: Kl. 7 LB 4; in Kl. 6 nur aus Quadern zusammengesetzte Körper.
- Hauptschulbildungsgang weicht ab: Zins Kl. 8, lineare Funktionen Kl. 9 LB 3,
  Kl. 7 LB 2 "Anteile und Prozente", Kl. 8 LB 1 "Wirtschaftliches Rechnen",
  LB 3 "Vom Vieleck zum Kreis".
Abitur Sachsen (STARK-Leseproben LK 2026, GK 2027, Hinweise S. I-III):
- Neue Struktur (Teil A mit zwei Aufgabengruppen, Teil B bis zu drei
  Pflichtaufgaben) seit der Abiturprüfung 2024. [zweitgeprüft]
- Ab Abitur 2025: Teil A 30 BE, Teil B 70 BE (LK); bis 2024 Teil B 90 BE,
  gesamt 120. Abgabe Teil A im LK ab 2025 innerhalb der ersten 110 Minuten.
  [zweitgeprüft] GK: 255 Minuten, 25 + 55 BE, Abgabe innerhalb 100 Minuten.
- Bis einschließlich Abitur 2025 war in Teil B ein GTR mit oder ohne CAS
  zugelassen; das modulare Mathematiksystem (MMS) gilt danach. [zweitgeprüft]
- "Bei schwerwiegenden und gehäuften Verstößen gegen die sprachliche Richtigkeit
  oder die äußere Form kann jeweils ein Punkt der einfachen Wertung abgezogen
  werden." (Notenpunkt, nicht BE) [zweitgeprüft]
- 100-BE-Skala, bezeichnet als "Skalierung passend ab Jahrgang 2025":
  15 Punkte = 1+, 14 = 1, 13 = 1-, 12 = 2+, 11 = 2, 10 = 2-, 9 = 3+, 8 = 3,
  7 = 3-, 6 = 4+, 5 = 4, 4 = 4-, 3 = 5+, 2 = 5, 1 = 5-, 0 = 6.
- In den Aufgaben vorkommende Operatoren: Geben Sie an, Beurteilen Sie,
  Beschreiben Sie, Stellen Sie dar, Weisen Sie nach, Schätzen Sie, Zeichnen Sie.
- Alle drei Prüfungen siezen, auch der Realschulabschluss ("Kreuzen Sie an").

ABSCHLUSS
Bericht mit drei Listen: behoben (PR-Nummer), nicht bestätigt (warum), offen
beim PV (C6, C8, B7 falls nötig, alles Unklare). Keine Aussage "fertig", solange
ein Punkt ohne Test geblieben ist.
````
