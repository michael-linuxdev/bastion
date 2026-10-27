# Bastion – Vision

> „Baue deine Bastion.“

Status: Entwurf v0.1 · Stand: 27.10.2026 · Verantwortlich: Tech/Konzept-Lead

---

## 1. Das Problem

Jugendliche zwischen 10 und 19 lernen in einem Umfeld, das um ihre Aufmerksamkeit kämpft. Die meisten Lern-Apps reagieren darauf auf eine von zwei Arten:

- **Sie werden selbst zur Aufmerksamkeitsmaschine** – Streaks, Ranglisten, Zufallsbelohnungen, Push-Druck. Kurzfristig wirksam, langfristig ermüdend, pädagogisch fragwürdig.
- **Sie bleiben trockene Aufgabensammlungen** – sauber, aber ohne Grund, morgen wiederzukommen.

Dazu kommen drei strukturelle Lücken:

1. **Schulformen werden ignoriert.** Angebote richten sich meist implizit an Gymnasiasten. Hauptschule, Gesamtschule und vor allem berufsbildende Schulen sind unterversorgt.
2. **Datenschutz ist ein Nachgedanke.** Accounts, Cloud-Zwang, Tracking und Werbung sind Standard.
3. **Lernen wird als Stoffabarbeitung gezeigt, nicht als Kompetenzaufbau.** Jugendliche sehen selten, was sie *können* – nur, was sie noch *müssen*.

## 2. Die Antwort

**Bastion ist eine offline-fähige, datenschutzstarke Lern-App für Klasse 5–13 und berufsbildende Schulen, in der echte, nachgewiesene Kompetenz sichtbar wird – als eigene Festung, die über Jahre wächst.**

Die Bastion ist kein Belohnungsautomat. Sie ist ein **Spiegel**: Jedes Gebäude, jede Mauer, jeder Turm steht für etwas, das der Jugendliche tatsächlich beherrscht. Wer seine Bastion anschaut, sieht seinen eigenen Lernweg.

## 3. Leitbild in einem Satz

> Bastion macht sichtbar, was du kannst – und gibt dir einen Ort, der mit dir wächst.

## 4. Für wen

| Gruppe | Was sie von Bastion brauchen |
|---|---|
| Schüler:innen Kl. 5–7 | Orientierung, klare Struktur, spielerischer Einstieg, Übergang aus der Grundschule (Lerninsel-Nachfolge) |
| Schüler:innen Kl. 8–10 | Differenzierung nach Niveau, Abschlussvorbereitung (ESA/MSA), Autonomie |
| Oberstufe Kl. 11–13 | Prüfungsvorbereitung Abitur, Selbststeuerung, ernstes Erscheinungsbild ohne Kindlichkeit |
| Berufsbildende Schulen | Lernfeld-Bezug, berufsbezogene Kompetenzen, allgemeinbildende Fächer, Abschlussprüfung |
| Jugendliche mit DaZ | Bildungssprache und Fachsprache als eigener Pfad, Hilfesprache durchgängig |
| Jugendliche mit Fokus-Schwierigkeiten | Reizarme Modi, kurze Einheiten, klare Abschlüsse |
| Eltern / Erziehungsberechtigte | Kontrolle und Einblick ohne Überwachung, altersgerecht abnehmend |

## 5. Was Bastion ist

- **Ein Lernwerkzeug zuerst.** Die Lerninhalte funktionieren vollständig ohne den Basebau.
- **Ein langfristiger Begleiter.** Konzipiert für Jahre, nicht für Wochen. Eine Bastion aus Klasse 5 kann in Klasse 12 noch existieren.
- **Ein Kompetenznachweis für den Jugendlichen selbst.** Das Kompetenzportfolio gehört dem Nutzer.
- **Ruhig.** Bastion wartet. Sie verfällt nicht, sie wird nicht angegriffen, während man weg ist.

## 6. Was Bastion ausdrücklich nicht ist

- Kein Clash-of-Clans-Klon. Wir übernehmen das **Gefühl** von Aufbau und Planung, **nicht** die Mechaniken, die Clash of Clans monetarisieren: Echtzeit-Timer, Beschleuniger, Angriffe auf Abwesende, Clan-Druck.
- Kein soziales Netzwerk.
- Kein Bewertungs- oder Notensystem. Bastion benotet nicht.
- Kein Überwachungswerkzeug für Eltern oder Schule.
- Kein Ersatz für Unterricht.

## 7. Unveränderliche Grundprinzipien

Diese Prinzipien sind die Verfassung des Projekts. Jede Funktion muss sich an ihnen messen lassen.

1. **Erst lernen, dann spielen/bauen.** Bau-Ressourcen entstehen ausschließlich durch Lernen.
2. **Offline-first.** Nach dem ersten Laden vollständig offline nutzbar.
3. **Datenschutz zuerst.** Keine personenbezogenen Daten verlassen das Gerät, außer durch explizit vom Nutzer ausgelöste Exporte oder QR-Transfers. Kein Zwangs-Account, kein Tracking.
4. **Keine Werbung, keine In-App-Käufe, keine Lootboxen.**
5. **Eltern als letzte Instanz** – PIN-geschützter Bereich mit Berichten und Einstellungen.
6. **Kein sozialer Druck.** Keine öffentlichen Ranglisten, kein Pflicht-PvP, kein FOMO-Design.
7. **Mehrsprachigkeit & Integration.** Hilfesprache und eigener DaZ-Pfad bleiben zentral.
8. **Kompetenz vor Stoff.** Sichtbare, übertragbare Kompetenzen stehen im Mittelpunkt.

### Abgeleitete Design-Regeln (neu, verbindlich)

Aus den Prinzipien folgen konkrete Regeln, die wir hier festhalten, damit sie nicht in späteren Diskussionen aufweichen:

- **R1 – Keine Zufallsbelohnungen.** Jede Belohnung ist vorhersehbar und nachvollziehbar. Keine variablen Belohnungsquoten, keine „Truhen“.
- **R2 – Keine Echtzeit-Timer.** Bauen dauert *Lerneinheiten*, nicht Stunden auf der Uhr. Niemand muss um 6:40 Uhr die App öffnen.
- **R3 – Kein Verfall, keine Verluste.** Pausen werden nie bestraft. Ferien, Krankheit, Prüfungsstress: Die Bastion wartet unverändert.
- **R4 – Qualität schlägt Menge.** Ressourcen belohnen nachgewiesenes, dauerhaftes Können (z. B. bestandene Wiederholungen nach Tagen) stärker als reine Klickmenge. Tägliches Farmen hat abnehmenden Ertrag.
- **R5 – Natürliche Pausenpunkte.** Jede Sitzung hat ein klares Ende. Die App sagt aktiv „Für heute ist das gut“.
- **R6 – Fehler sind Rohstoff, keine Strafe.** Wer einen Fehler später korrigiert, wird dafür belohnt.
- **R7 – Der Basebau ist abschaltbar** – vollständig und ohne Nachteil für den Lernfortschritt.

## 8. Erfolgskriterien

Bastion ist erfolgreich, wenn:

- Nutzer **nachweislich behalten**, was sie gelernt haben (gemessen lokal über Wiederholungserfolg, nicht über Nutzungsdauer).
- Nutzer über **Monate und Schuljahre** wiederkommen, ohne dass Druckmechanismen nötig sind.
- Ein Hauptschüler und eine Abiturientin die App **beide als „für mich gemacht“** empfinden.
- Eltern sagen: „Ich weiß, was mein Kind lernt, ohne es zu überwachen.“
- Jugendliche ihr Kompetenzportfolio **freiwillig** zeigen (Bewerbung, Lehrkraft, Familie).

Bewusst **keine** Erfolgskriterien: tägliche aktive Nutzer, Sitzungsdauer, Streak-Längen.

## 9. Abgrenzung zur Lerninsel

| | Lerninsel | Bastion |
|---|---|---|
| Alter | 6–10 | 10–19+ |
| Welt | Kinderinsel, freundlich | Festung, Zufluchtsort, eigenständig |
| Motivation | Sterne, kurze Spiele | Langfristiger Aufbau, Planung, Sichtbarkeit von Können |
| Inhalt | Grundschulstoff | Fachkompetenzen nach Schulform, Niveau, Bildungsgang |
| Eltern | Volle Kontrolle | Mit dem Alter abnehmend bis Selbstverwaltung |
| Ziel | Grundlagen sichern | Kompetenz, Abschlüsse, Übergänge |

## 10. Das Versprechen an die Nutzer

> Was du hier baust, hast du dir selbst erarbeitet. Niemand kann es dir kaufen, niemand kann es dir wegnehmen, und es verrät niemandem etwas über dich, das du nicht selbst teilst.
