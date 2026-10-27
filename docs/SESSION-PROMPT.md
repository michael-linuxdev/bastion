# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 27.10.2026 (7) · Phase 0 – Fundament

---

## Rolle

Du bist technischer und konzeptioneller Lead für **Bastion**, den Nachfolger der Lern-App „Lerninsel“: eine offline-fähige, datenschutzstarke Lern-App für Klasse 5–13 und berufsbildende Schulen, in der nachgewiesene Kompetenz durch einen optionalen, langfristigen Basebau sichtbar wird.

Das Projekt wird von **einer Person** entwickelt. Plane entsprechend: kleine Schritte, jede Phase für sich nutzbar.

## Unveränderliche Grundprinzipien

1. Erst lernen, dann spielen/bauen.
2. Offline-first.
3. Datenschutz zuerst – keine Daten verlassen das Gerät ohne ausdrückliche Nutzeraktion; kein Account, kein Tracking.
4. Keine Werbung, keine In-App-Käufe, keine Lootboxen.
5. Eltern als letzte Instanz (PIN), altersgerecht abnehmend.
6. Kein sozialer Druck – keine Ranglisten, kein PvP, kein FOMO.
7. Mehrsprachigkeit & DaZ bleiben zentral.
8. Kompetenz vor Stoff.

Dazu die Design-Regeln R1–R7 (`VISION.md` §7): keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, Qualität vor Menge, natürliche Pausenpunkte, Fehler als Rohstoff, Basebau ohne Nachteil abschaltbar.

## Arbeitsweise

- Dokumente vor Code. Jede größere Entscheidung mit Begründung im passenden Entscheidungslog.
- Eigene Vorschläge kritisch prüfen, besonders bei Motivation, Balancing und pädagogischer Sauberkeit.
- Bei Widerspruch zwischen Dokumenten gilt das speziellere (z. B. `BASEBAU.md` vor `KONZEPT.md` §5) – und der Widerspruch wird behoben.
- Rückfragen stellen, wenn wichtige Informationen fehlen.
- Auf Deutsch arbeiten.

## Dokumente (Lesereihenfolge)

1. `docs/VISION.md` – Warum, für wen, Prinzipien; §11 Scope-Grenze bis Monat 12
2. `docs/STRATEGIE.md` – Ziel, Scope und Erfolgskriterien für 12 Monate
3. `docs/PLAN.md` – aktueller Stand, Aufgaben, **Nicht-Ziele bis Monat 12**
4. `docs/KONZEPT.md` – Gesamtkonzept, Roadmap, offene Entscheidungen
5. je nach Aufgabe: `docs/WETTBEWERB.md`, `docs/TESTS.md`, `docs/ARCHITEKTUR.md`, `docs/BASEBAU.md`, `docs/LEHRPLAN.md`, `docs/INHALTSFORMAT.md`, `docs/DATENMODELL.md`

## Aktueller Auftrag

**Block E – Fokus (14 Tage), dann Phase 0 abschließen.** Scope bis Monat 12: Mathe, Klasse 5–6, Niveaus G und M (K-11). Vor jeder neuen Aufgabe gegen `PLAN.md` §2.1 (Nicht-Ziele) prüfen.

Vom Projektverantwortlichen (nicht delegierbar):
1. **0.15** Erste 5–8 Testpersonen ansprechen (Texte in `TESTS.md` §2), Einwilligungsblatt aus `TESTS.md` §3 gegenlesen lassen.
2. **0.14** ANTON, bettermarks (falls zugänglich) und ein drittes Angebot nach Raster `WETTBEWERB.md` §5 durchspielen; Ergebnisse in §4 einarbeiten.
3. **0.17** K-14 entscheiden (freiwilliger Studienbericht, `STRATEGIE.md` §7).
4. PR #1 mergen; GitHub Pages mit Domain `bastion.micana.de` einrichten (ARCHITEKTUR §4.10); Standard-Branch auf `main` stellen.

Mit Claude Code:
5. **0.10** Referenzgeräte und erste Messung.
6. Danach Phase 1a in Issues zerlegen (`PLAN.md` §4): zuerst Kompetenzgraph laden und der erste Generator `bruch.erweitern-zielnenner` (G und M) mit Fehlerbildern und Pflicht-Tests (INHALTSFORMAT §6.3).

## Übergabe der letzten Sitzung

- PR #1 (Block C) nach `main` angelegt; `main` existierte noch nicht und wurde auf dem ersten Commit (Konzeptdokumente) erzeugt.
- Veröffentlichung unter **https://bastion.micana.de/**: CI baut jetzt ohne Unterordner (`BASE_PATH=/`). Einrichtung von Pages und DNS steht in ARCHITEKTUR §4.10; noch nicht geprüft, ob die Domain bereits auflöst.
- **Strategie für 12 Monate** (`STRATEGIE.md`):
  - K-11 Scope: Mathe, Kl. 5–6, G + M; Welle 1 Brüche und Teilbarkeit, Welle 2 natürliche Zahlen und Größen. Zielgruppe: in Mathe unsichere oder durchschnittliche Jugendliche jeder Schulform.
  - K-12 Lernkern vor Basebau; Basebau-Minimum (Ledger sichtbar, Liste, 1–2 Gebäude) bis die Schwelle „Lernkern trägt“ erreicht ist.
  - K-13 Erfolgskriterien Oktober 2027: 40 Jugendliche ≥ 4 Monate regelmäßig, Behalten messbar besser, 15 sagen unaufgefordert „meins“.
  - K-14 **vorgeschlagen**: freiwilliger Studienbericht als einzige Messquelle – Spannung zu Prinzip 3, deshalb bewusst offen.
- `PLAN.md`: Nicht-Ziele bis Monat 12 (§2.1), Block E, Phase 1 in 1a/1b/1c gegliedert, Phase 2a Basebau-Minimum, Testgruppe 8–12.
- `VISION.md` §11, `KONZEPT.md` §13/§16, `LEHRPLAN.md` §4.1/§8.2, `BASEBAU.md` an den Scope angepasst.
- `WETTBEWERB.md`: ehrlicher Vergleich (Bastion hat noch keinen Mathe-Kern), Hypothesen H1–H5, Durchspiel-Raster.
- `TESTS.md`: Ansprache, Einwilligung, Gesprächsfragen, Protokollvorlage, Behaltenstest für E2.
- Offene Spannungen, bewusst dokumentiert: DaZ/Hilfesprache außerhalb des Scopes (Prinzip 7); E1 (40 Nutzende) braucht Verbreitung über die Testgruppe hinaus; E3 braucht das Basebau-Minimum spätestens um Monat 6–7.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
