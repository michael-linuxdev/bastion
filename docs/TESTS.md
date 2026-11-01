# Bastion – Realitätstests mit Jugendlichen

Status: Entwurf v0.1 · Stand: 27.10.2026 · Aufgaben 0.11, 0.15 · Bezug: `STRATEGIE.md` §4 und §6

> **Wichtig:** In dieses Repository kommen **keine** Namen, Kontaktdaten, Schulen, Fotos, Tonaufnahmen oder Notizen, die auf eine Person schließen lassen. Protokolle werden lokal und offline geführt. Hier stehen nur Vorgehen, Vorlagen und zusammengefasste, anonyme Ergebnisse.
>
> Die Vorlagen in §3 sind **keine Rechtsberatung**. Vor der ersten Runde einmal von jemandem mit Datenschutz-Erfahrung (z. B. Datenschutzbeauftragte:r einer Schule) gegenlesen lassen.

---

## 1. Was wir herausfinden wollen

Nicht: „Finden sie den Knopf?“ Sondern:

| Frage | Woran wir es erkennen | Kriterium |
|---|---|---|
| **Kommen sie von allein wieder?** | Nutzung ohne Erinnerung von uns, über Wochen | E1 |
| **Behalten sie mehr?** | Behaltenstest nach Pause (§5) | E2 |
| **Gehört ihnen die Bastion?** | Was sie unaufgefordert über ihre Bastion sagen | E3 |
| **Ist der Lernkern besser als ihr bisheriges Üben?** | Offene Frage nach Vergleich (§4.3) | Schwelle K-12 |

## 2. Testgruppe zusammenstellen

**Größe:** zuerst 5–8, bis etwa Monat 3 insgesamt **8–12** Jugendliche aus **Sachsen**, Klasse 5–12. Solange es nur Inhalte der Klasse 5 gibt (K-15): vor allem Jugendliche aus Klasse 5, dazu einige Ältere, bei denen Stoff der Klasse 5 (z. B. Brüche) wackelt.

**Stand (29.10.2026):** Drei Testerinnen im Alter von 12 bis 16 Jahren stehen bereit, für den Moment mit Rückhalt ihrer Eltern. Die Einwilligung nach §3 ist vor der ersten Testrunde noch einzuholen. Namen stehen nicht im Repository. Zuerst soll die Grafik ansprechender werden (K-22). Die Mischung unten bleibt das Ziel: Bisher fehlen Jungen, die Klassen 5–6 und mehrere Schularten.

**Mischung (Ziel):**

| Merkmal | Ziel |
|---|---|
| Mag „normalerweise keine Lern-Apps“ | **mindestens 3–4** |
| Unsicher oder durchschnittlich in Mathe (Zielgruppe K-11) | mindestens die Hälfte |
| Schularten | mindestens drei verschiedene: Oberschule Hauptschulbildungsgang, Oberschule Realschulbildungsgang, Gymnasium; wenn möglich Gemeinschaftsschule/Oberschule+ oder Förderschule |
| Altersstufen | mindestens eine Person aus Kl. 5–7, eine aus Kl. 8–10 und, sobald passende Inhalte da sind, eine aus der Oberstufe |
| Eigene Kinder und Kinder enger Freunde | höchstens ein Drittel – sie sind zu höflich |

**Wo suchen:** Kolleginnen und Kollegen, Nachbarschaft, Sportverein, Hausaufgabenhilfe, Jugendtreff, Elternvertretung einer Schule. Ausdrücklich auch dort fragen, wo Kinder „keinen Bock auf Mathe“ haben.

**Ansprache an Eltern (Vorlage, kurz):**

> Hallo …, ich entwickle in meiner Freizeit eine Mathe-App für Jugendliche ab Klasse 5: ohne Werbung, ohne Konto, die Daten bleiben auf dem Gerät. Ich suche Kinder, die sie ein paar Wochen ausprobieren und mir ehrlich sagen, was sie davon halten – **gerade auch Kinder, die Lern-Apps eigentlich nicht mögen.** Aufwand: ein Treffen von etwa 30 Minuten zum Start, danach nutzen, wann und wie oft sie wollen, und alle paar Wochen ein kurzes Gespräch. Hättet ihr Lust? Ich schicke euch gern eine Seite mit allen Infos.

**Ansprache an Jugendliche (mündlich, sinngemäß):**

> Ich baue eine Mathe-App und brauche Leute, die mir ehrlich sagen, was daran nervt. Du musst nichts gut finden. Wenn du sie blöd findest, ist das für mich genauso wichtig.

**Dankeschön:** Wenn es eines gibt, dann für alle gleich und unabhängig davon, wie oft jemand die App nutzt – sonst messen wir das Dankeschön statt der App.

## 3. Einwilligung

Zwei Teile: Eltern willigen schriftlich ein, das Kind stimmt in eigenen Worten zu. Ohne beides keine Teilnahme.

**Info- und Einwilligungsblatt für Eltern (Gliederung):**

1. Worum es geht: Test einer Mathe-App für Jugendliche ab Kl. 5, Dauer etwa bis …, freiwillig.
2. Was passiert: Starttreffen (ca. 30 Min., Eltern dürfen dabei sein), App auf eigenem Gerät, Gespräche alle 3–4 Wochen (ca. 15 Min.), ggf. ein kurzer Mathe-Test auf Papier (§5) – keine Note, keine Weitergabe an die Schule.
3. Welche Daten entstehen:
   - In der App: alles bleibt auf dem Gerät. Die App sendet nichts.
   - Gesprächsnotizen: handschriftlich bzw. lokal, nur mit **Teilnehmer-Nummer**, ohne Namen. Gültige Nummern (mit Prüfziffer, z. B. T-01-8) gibt `pnpm testnummern` aus.
   - Ein **Testprotokoll** (K-14), nur wenn Sie es im Elternbereich mit dem Testcode einschalten. Es enthält, welche Aufgaben bearbeitet wurden, Antworten bei Fehlern, welche Seiten geöffnet wurden und wie lange. Es enthält keinen Namen und keinen Spitznamen, nur die Teilnehmer-Nummer. Die App zeigt es Ihnen und Ihrem Kind vorher lesbar an. Sie geben die Datei selbst weiter. Ausschalten und Löschen geht jederzeit. Ausgewertet wird sie mit `pnpm auswertung` (§4.5).
   - Keine Fotos, keine Ton- oder Videoaufnahmen.
4. Wer sieht die Daten: nur der Projektverantwortliche. Veröffentlicht werden nur zusammengefasste Ergebnisse ohne Personenbezug (z. B. „5 von 9 sagten …“) und einzelne Zitate ohne Namen, Alter in Klassenstufe, ohne Schule.
5. Widerruf: jederzeit ohne Begründung; Notizen werden dann gelöscht.
6. Löschung: alle Notizen spätestens … (z. B. drei Monate nach Testende).
7. Kontakt: …
8. Einwilligung: Name Kind, Name Elternteil, Datum, Unterschrift. **Dieses Blatt wird getrennt von den Notizen aufbewahrt** – nur hier steht die Verbindung von Name und Nummer.

**Zustimmung des Kindes (vorlesen oder selbst lesen lassen):**

> Du testest eine Mathe-App. Du darfst alles sagen, auch wenn es gemein klingt – genau das hilft. Du musst nichts gut finden. Du kannst jederzeit aufhören, ohne zu sagen warum. Ich schreibe auf, was du sagst, aber nicht deinen Namen. Okay?

## 4. Ablauf der Testrunden

~~Testrunden nach den Stufen von Phase 1 (`PLAN.md` §4): nach **1a**, **1b**, **1c** und nach dem **Basebau-Minimum (2a)**.~~ *Seit K-17 (`STRATEGIE.md` §2): Die Testrunden beginnen, wenn der Lehrplan bis Klasse 12 aufgebaut ist.*

### 4.1 Starttreffen (ca. 30 Min.)

1. App auf dem eigenen Gerät öffnen lassen – **nicht helfen**. Nur notieren, wo jemand hängt.
2. Laut denken lassen: „Sag einfach, was du gerade denkst.“
3. Nach 15 Minuten: offene Fragen (§4.3), dann Ende. Keine Aufforderung, regelmäßig zu üben.

### 4.2 Zwischen den Treffen

- **Keine Erinnerungen von uns.** Kein „Hast du schon geübt?“ – sonst messen wir unsere Nachrichten, nicht die App.
- Eltern bitten, ebenfalls nicht zu erinnern (oder, falls doch, es beim nächsten Gespräch zu sagen).

### 4.3 Gespräch alle 3–4 Wochen (ca. 15 Min.)

Immer offene Fragen, nie Suggestivfragen. **Wörtlich mitschreiben**, auch Abwertendes.

| Thema | Frage (offen) | Nicht fragen |
|---|---|---|
| Wiederkommen | „Wann hast du die App zuletzt aufgemacht? Warum da?“ · „Was hat dich davon abgehalten?“ | „Nutzt du sie regelmäßig?“ |
| Vergleich | „Wie übst du sonst Mathe? Was ist hier anders – besser oder schlechter?“ | „Ist das besser als …?“ |
| Fehler | „Erinnerst du dich an eine Aufgabe, bei der du was falsch hattest? Was ist dann passiert?“ | „Hilft dir die Fehlerwerkstatt?“ |
| Können | „Was kannst du jetzt, was du vorher nicht konntest?“ | „Hast du was gelernt?“ |
| Bastion (ab 2a) | „Erzähl mal: Was ist das da?“ · „Wem würdest du das zeigen – oder lieber nicht?“ · „Was wäre, wenn das weg wäre?“ | „Gefällt dir deine Bastion?“, „Ist das deine?“ |
| Nerven | „Was nervt am meisten?“ · „Was würdest du sofort rauswerfen?“ | – |

### 4.4 Protokoll (Vorlage, lokal führen)

```
Teilnehmer-Nr.: T07      Runde: 1b      Datum: 2027-02-10
Klasse: 6               Mag Lern-Apps: nein      Mathe nach eigener Aussage: „geht so“
Zuletzt geöffnet (eigene Aussage): „vor drei Tagen, weil Arbeit war“
Wörtliche Zitate:
  - „…“
  - „…“
Beobachtet (wo gehangen, was übersprungen):
  - …
Unaufgefordert über Bastion: ja/nein – Zitat: „…“
Besser/schlechter als bisheriges Üben: besser / gleich / schlechter / weiß nicht – Zitat: „…“
Mein Eindruck (getrennt von den Zitaten!): …
```

Ins Repository kommt pro Runde nur eine **Zusammenfassung** in §7 – ohne Nummern, die sich über Runden verfolgen lassen, wenn die Gruppe so klein ist, dass das jemanden erkennbar machen könnte.

### 4.5 Testprotokolle auswerten (U4b, FOKUS F4)

**Ablauf:**

1. **Dateien einsammeln.** Eltern speichern das Testprotokoll im Elternbereich (Testphase → Export) und geben die JSON-Datei von Hand weiter. Die Dateien liegen nur lokal beim Projektverantwortlichen, nie im Repository.
2. **Auswerten:** `pnpm auswertung protokoll-1.json protokoll-2.json … > bericht.md`. Mehrere Dateien derselben Person (zweimal exportiert) werden zusammengeführt, doppelte Ereignisse zählen einmal.
3. **Bericht lesen.** Er beantwortet die messbaren Kriterien aus `STRATEGIE.md` §0 mit ja, nein oder „noch offen“. Personen heißen „Person 1 …“ in der Reihenfolge der Dateien. Mit `--nummern` stehen die Teilnehmer-Nummern daneben; so einen Bericht nicht weitergeben.
4. **Mit den Notizen abgleichen.** Wer das Thema laut Gespräch schon vorher konnte, zählt für Kriterium 1 nicht (die App weiß das nur, wenn vorher in ihr geübt wurde). Solche Personen beim Lesen der Tabelle von Hand herausnehmen.
5. Die Zusammenfassung ohne Nummern kommt in §7.

**Festlegung „Einstiegsaufgaben“ (Kriterium 1, Vermitteln; 01.11.2026):**

- Die Einstiegsaufgaben einer Kompetenz sind die **ersten 3 Aufgaben auf Niveau G** dieser Kompetenz, die nach dem **ersten Abschluss ihrer Erstvermittlung** im Üben oder Wiederholen bearbeitet werden. Diagnose, Fehlerwerkstatt und Prüfung zählen nicht.
- **Ohne Hilfe gelöst** heißt: alle drei richtig, ohne Tipp. Lösungsweg, Erklärung der Fehlvorstellung und „Weiter ohne Weg“ gibt es erst nach einer falschen Antwort, sie sind darin also schon enthalten.
- Ist eine der Aufgaben falsch oder mit Tipp gelöst, gilt die Kompetenz für diese Person als **nicht gelöst**, auch wenn die dritte noch fehlt.
- **Nicht gezählt** wird eine Person für eine Kompetenz, wenn sie (a) noch keine 3 Aufgaben bearbeitet hat oder (b) vor der Erstvermittlung schon Aufgaben dieser Kompetenz bearbeitet hat. Ausnahme zu (b): falsche Aufgaben aus der Diagnose; sie zeigen gerade, dass das Thema neu war.
- **Erfüllt** ist Kriterium 1 für eine Kompetenz, wenn mindestens zwei Drittel der gezählten Personen gelöst haben, und es mindestens 3 sind. Bei weniger Personen heißt es „noch offen“.

**F5 (Diagnostizieren):** Gezählt werden alle falschen Antworten außer in der Diagnose. Erfüllt bei mindestens 80 % mit Fehlerbild. Die übrigen stehen im Bericht als „unbekannte Fehler“, nach Vorlage gruppiert, mit Aufgabe, Lösung und Antwort. Sie sind Stoff für den Fehlerkatalog (`VERMITTLUNG.md` §3.4).

**Außerdem im Bericht, je Person:** Tipps und Lösungswege, Zwischenschritte (im ersten oder zweiten Versuch richtig, gezeigt), „Weiter ohne Weg“ und abgebrochene Erstvermittlungen mit dem zuletzt beantworteten Schritt. Schritte zum reinen Lesen erzeugen kein Ereignis; „vor der ersten Antwort“ heißt also, beim Lesen oder bei der ersten Frage aufgehört.

Die Rechnungen stehen rein und getestet in `src/core/testphase/auswertung.ts`, das Werkzeug in `tools/auswertung/`.

## 5. Behaltenstest (E2)

Frage: Behalten Jugendliche Bruch-Kompetenzen besser, wenn Bastion sie über Wochen wiederholt, als ohne?

**Aufbau (innerhalb jeder Person, damit kleine Gruppen genügen):**

1. Vier Kompetenzen aus der laufenden Klassenstufe auswählen, die die Person **noch nicht** sicher kann (Diagnose), z. B. ERWEITERN, VERGLEICHEN, ADD-SUB, MULT.
2. Je Person werden zwei davon **mit Bastion-Wiederholung** geübt, zwei **nur einmal im Block** (eine Übungssitzung, dann keine Wiederholung in der App). Welche zwei, wird **pro Person gewechselt** (ausbalanciert), damit nicht die leichteren immer auf einer Seite landen.
3. Nach **4 Wochen** ohne gezieltes Üben dieser vier: kurzer Papiertest, je Kompetenz 4 Aufgaben mit **neuen** Zahlen.
4. Vergleich: Anteil richtiger Antworten „mit Wiederholung“ gegen „nur Block“ – je Person und gesamt.
5. Danach bekommen alle auch die „Block“-Kompetenzen in die Wiederholung. Niemand soll durch den Test schlechter dastehen.

**Ehrlich auswerten:** Bei 8–12 Personen gibt es keine statistisch belastbare Aussage. Berichtet wird: „Bei x von n Personen war das Behalten mit Wiederholung besser, im Mittel um y Prozentpunkte.“ E2 gilt als erreicht, wenn das in der Kerngruppe klar in eine Richtung zeigt – und widerlegt, wenn nicht.

*Technische Voraussetzung:* Die App muss für die Studiengruppe einzelne Kompetenzen von der Wiederholung ausnehmen können (Studienschalter). Gehört zu K-14 und wird mit ihm entschieden.

## 6. Schwelle „Lernkern trägt“ prüfen

Nach jeder Runde ab 1b auswerten (`STRATEGIE.md` §3):

- Wie viele beschreiben den Lernkern auf die Vergleichsfrage als **besser** als ihr bisheriges Üben?
- Wie viele davon gehören zur Gruppe „mag eigentlich keine Lern-Apps“?
- Schwelle erreicht bei **mindestens der Hälfte**, darunter **mindestens zwei** aus dieser Gruppe.

Erst dann wird der Basebau über das Minimum hinaus ausgebaut.

## 7. Ergebnisse (anonym, zusammengefasst)

| Runde | Datum | n | Kernaussagen (ungeschönt) | Schwelle | Folgen für den Plan |
|---|---|---|---|---|---|
| – | – | – | noch keine Runde | – | – |
