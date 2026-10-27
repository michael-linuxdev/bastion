# Bastion – Vergleich mit bestehenden Angeboten

Status: Entwurf v0.1 · Stand: 27.10.2026 · Aufgabe 0.14 · Bezug: `STRATEGIE.md` §2
Zielgruppe des Vergleichs: Mathe in Sachsen, Klasse 5–12, alle Schularten, Niveaus G und M, zum Start Schwerpunkt Brüche (K-11).

*Sachsen-spezifisch noch zu prüfen:* ob bettermarks oder andere Systeme in Sachsen per Landeslizenz verfügbar sind; welche Materialien das Sächsische Bildungsportal (OER) zur Bruchrechnung anbietet; welche Rolle LernSax für Übungsangebote spielt.

> **Quellenhinweis:** Die Angaben zu fremden Angeboten stammen aus einer kurzen Web-Recherche (Quellen in §6) und aus allgemeinem Wissen. Preise, Funktionen und Datenschutzpraxis ändern sich. Alles mit *(prüfen)* muss in 0.14 durch eigenes Ausprobieren bestätigt werden, bevor es nach außen kommuniziert wird.

---

## 1. Schonungslose Ausgangslage

**Bastion hat heute keinen Mathe-Kern.** Es gibt ein offline-fähiges Gerüst, Zufallszahlen mit Seed, IDs und die Lerntag-Berechnung. Es gibt keinen einzigen Generator, keine Aufgabe, keine Wiederholung, keine Diagnose. Verglichen wird deshalb **das Konzept** (`LEHRPLAN.md`, `INHALTSFORMAT.md`, `BASEBAU.md`) mit **fertigen Produkten**. Das schmeichelt Bastion – Konzepte haben keine Fehler, Produkte schon.

Daraus folgt: Der Vergleich beantwortet nicht „Ist Bastion besser?“, sondern **„Wo *kann* Bastion überhaupt besser werden – und wo nie?“**

## 2. Die Alternativen

| | ANTON | bettermarks | simpleclub / Studyflix (Erklärvideos) | Khan Academy | Übungsheft (z. B. Duden „Mathe in 15 Min“) | KI-Chatbot (z. B. für Hausaufgaben) |
|---|---|---|---|---|---|---|
| **Wie man drankommt** | kostenlos, Kl. 1–13 | meist über Schul- bzw. Landeslizenz (z. B. RLP, Hessen) | App kostenlos, Inhalte großteils in kostenpflichtiger Mitgliedschaft | kostenlos | ca. 10 € einmalig *(prüfen)* | kostenlos bis Abo |
| **Werbung / Upsell** | werbefrei; „ANTON Plus“ kostenpflichtig | keine | Hinweise auf Bezahl-Mitgliedschaft | keine | – | je nach Dienst |
| **Konto / Daten** | Datenpraxis je nach Funktion und Alter *(prüfen)* | Schulkonto | Konto für Mitgliedschaft | Konto für Fortschritt | keine | Konto, Eingaben gehen an den Anbieter |
| **Offline** | laut Store-Eintrag nur mit Plus | nein *(prüfen)* | nein *(prüfen)* | eingeschränkt *(prüfen)* | ja | nein |
| **Umfang** | sehr groß, Mathe von Grundrechnen bis Funktionen | > 200 000 Aufgaben, Kl. 3–13 | sehr viele Videos | groß, aber am US-Lehrplan ausgerichtet; deutsche Lehrplanpassung nicht belegt | ein Thema pro Heft | unbegrenzt |
| **Rückmeldung auf Fehler** | richtig/falsch, teils Erklärung *(prüfen)* | **analysiert Zwischenschritte**, erkennt konkrete Fehler (z. B. Vorzeichen) | keine (Video) | Hinweise, Schritt-Lösungen | Lösungsteil | erklärt alles – auch, wenn man nur abschreiben will |
| **Wiederholung über Wochen** | *(prüfen)* | Lehrkraft steuert; Lücken-Empfehlungen | nein | „Mastery“-Wiederholungen *(prüfen)* | nein | nein |
| **Niveau-Differenzierung** | nach Klassenstufe *(prüfen)* | adaptiv | nein | nach Kurs | nach Heft | beliebig |
| **Motivation** | Sterne, Avatar, Spiele | Fortschritt im Kurs | Videos, Humor | Punkte, Abzeichen | – | sofortige Antwort |
| **Für Eltern** | Eltern-Funktionen in Plus | über die Schule | – | Elternkonto | sichtbar auf Papier | unsichtbar |
| **Nutzerzahl** | sehr hoch | ca. 500 000 Schüler:innen (Angabe Hessen) | sehr hoch | sehr hoch (international) | – | sehr hoch |

## 3. Wo Bastion nie gewinnt (bis Monat 12)

Ehrlich und endgültig – hier nicht konkurrieren:

1. **Umfang.** ANTON und bettermarks decken 10+ Klassenstufen ab. Bastion deckt 23 Kompetenzen auf 2 Niveaus ab.
2. **Fehleranalyse von Zwischenschritten.** bettermarks wertet Rechenwege aus. Bastion vergleicht nach `INHALTSFORMAT.md` die *Endantwort* mit bekannten Fehlerbildern. Das ist schwächer und bleibt bis Monat 12 so.
3. **Erklärvideos.** simpleclub und Studyflix sind dafür gebaut. Bastion macht keine Videos.
4. **Platz in der Schule.** bettermarks hat Landeslizenzen und Lehrkräfte-Werkzeuge. Bastion hat keinen Lehrkräfte-Modus (Nicht-Ziel).
5. **Sofortige Antwort auf jede Frage.** KI-Chatbots beantworten alles. Bastion beantwortet nur, was es kennt.

## 4. Wo Bastion besser werden *kann*

Nur diese Punkte tragen die Behauptung „spürbar besser für die Zielgruppe“. Jeder ist eine **Hypothese**, die die Testgruppe bestätigen oder widerlegen muss (`TESTS.md`).

| Nr. | Hypothese | Warum es eine Lücke sein könnte | Was Bastion dafür liefern muss |
|---|---|---|---|
| H1 | **„Bruchrechnung, die bleibt.“** Wiederholung derselben *Kompetenz* über Wochen, jedes Mal mit neuen Zahlen (FSRS + Generatoren, L-4), schlägt Durcharbeiten von Kapiteln. | Die meisten Angebote sind kapitel- oder kursweise aufgebaut; gezielte Wiederholung über Wochen ist selten der Kern *(in 0.14 prüfen)*. Verteiltes Üben ist in Studien mit Siebtklässlern deutlich besser als massiertes Üben (Emeny/Hartwig/Rohrer), die Lage ist aber nicht einheitlich. | Wiederholungen, die nicht langweilen; ein spürbares „das kann ich jetzt einfach“. E2 in `STRATEGIE.md` misst genau das. |
| H2 | **Fehlerwerkstatt nach Ursachen.** „Du verwechselst manchmal Erweitern mit Addieren“ – über Tage gesammelt, gezielt geübt, Korrektur wird belohnt (R6). | Gezielte Rückmeldung pro Aufgabe gibt es (bettermarks); eine *persönliche Sammlung der eigenen Fehlermuster über Zeit* für Jugendliche selbst ist seltener *(prüfen)*. | Gute Fehlerbilder je Generator, Rückmeldung in einfacher Sprache, Werkstatt, die sich nicht nach Strafe anfühlt. |
| H3 | **Für die, die nicht zu den Stärksten gehören.** G und M ohne Schulform-Schublade (L-2); keine Ranglisten, keine Uhr, keine Beschämung. | Viele Angebote messen an der Klassenstufe; wer hinterherhängt, sieht vor allem, was fehlt. | Diagnose, die von dort startet, wo jemand steht; sichtbarer Fortschritt („gefestigt“) statt Prozentbalken des Kapitels. |
| H4 | **Komplett ohne Konto, ohne Werbung, offline, kostenlos – auch für Eltern-Funktionen.** | Bei ANTON kostet Offline und Eltern-Funktion Plus; andere brauchen Konto oder Schule. | Muss *funktionieren*, nicht nur versprochen werden: Offline-Test in der CI existiert bereits. **Achtung:** Jugendliche wählen Apps nicht nach Datenschutz. H4 überzeugt Eltern und Lehrkräfte (Phase D), nicht die Zielgruppe selbst. |
| H5 | **Die Bastion als Spiegel des Könnens.** Etwas, das mir gehört und zeigt, was ich kann – nicht Sterne für Klicks. | Belohnungen sind meist an Menge gebunden (Sterne, Münzen). R4 bindet an Behalten. | Erst nach der Schwelle „Lernkern trägt“ ausbauen (K-12). Bis dahin nur das Minimum, um H5 überhaupt testen zu können. |

**Zusammengefasst:** Bastion kann nicht „mehr“ sein. Es kann für eine kleine Gruppe **gründlicher** sein: weniger Stoff, der dafür sitzt; Fehler, die verstanden werden; ein Fortschritt, der nicht verfällt. Wenn H1 und H2 in den Tests nicht halten, gibt es keinen Grund für Bastion – egal wie schön die Festung wird.

## 5. Raster zum Selbst-Durchspielen (0.14)

Jedes Angebot ca. 30 Minuten, mit denselben drei Aufgaben auf Niveau G/M:

1. „Erweitere 3/4 auf den Nenner 20.“ – absichtlich falsch: **3/20** (nur den Nenner geändert) und **19/20** (addiert statt multipliziert)
2. „Berechne 1/3 + 1/4.“ – absichtlich falsch: **2/7** (Zähler und Nenner addiert)
3. „Kürze 12/18 vollständig.“ – absichtlich falsch: **6/9** (nicht vollständig gekürzt)

Für jedes Angebot festhalten (wörtlich, mit Bildschirmfoto ohne persönliche Daten):

| Frage | Notiz |
|---|---|
| Wie viele Schritte bis zur ersten Bruchaufgabe? Konto nötig? | |
| Werbung, Upsell, Kaufaufforderungen? Wann? | |
| Was sagt die App zu jedem absichtlichen Fehler? Erkennt sie den *Grund*? | |
| Kommt dieselbe Schwierigkeit später wieder? Wann? Mit neuen Zahlen? | |
| Nach einer Woche wieder geöffnet: Was passiert? | |
| Läuft es im Flugmodus? | |
| Was sieht man über das eigene Können? Wie fühlt sich das an? | |
| Was würde ein Kind daran mögen, das Mathe nicht mag? | |
| Was macht das Angebot **besser** als das Bastion-Konzept? | |

Ergebnis in §4 einarbeiten: Hypothesen bestätigen, schärfen oder streichen.

## 6. Quellen der Recherche (27.10.2026)

- ANTON: [appgefahren.de – kostenlose Lern-App zum Schulstart](https://www.appgefahren.de/anton-kostenlose-lern-app-ist-eine-empfehlung-zum-schulstart-306696.html), [trusted.de – ANTON](https://trusted.de/anton), App-Store-Eintrag „ANTON – Lernen – Schule“ (Plus: Offline-Lernen, Avatar, Spiele)
- bettermarks: [Hessisches Kultusministerium – Adaptives Mathematik-Lernsystem](https://kultus.hessen.de/schulsystem/adaptives-mathematik-lernsystem/), [Hessen führt intelligentes Lernsystem ein](https://kultus.hessen.de/presse/hessen-fuehrt-neues-intelligentes-lernsystem-fuer-mathematik-ein), [Bildungsserver RLP – Landeslizenz](https://bildung.rlp.de/fileadmin/user_upload/mint.bildung.rlp.de/2026/Unterstuetzunsmassnahmen/bettermarks.pdf), [Friedrich Verlag – Adaptivität im Unterricht](https://www.friedrich-verlag.de/friedrich-plus/sekundarstufe/inklusion-sonderpaedagogik/mathematik/individualisiertes-mathematisches-lernen-ermoglichen-23599)
- simpleclub: [Elternguide – Lernen mit simpleclub](https://www.elternguide.online/en/learning-with-thesimpleclub/)
- Studyflix: [Bruchrechnen](https://studyflix.de/mathematik/bruchrechnen-2591)
- Übungsheft: [Duden – Mathe in 15 Minuten, Brüche 5./6. Klasse (Leseprobe)](https://shop.duden.de/media/ca/9b/22/1687429126/Leseprobe_9783411720125_Mathe_in_15_Min_Brüche_5_6_Klasse.pdf)
- Verteiltes Üben: [PsyPost – Spacing math practice (Emeny, Hartwig, Rohrer)](https://www.psypost.org/spacing-math-practice-across-multiple-sessions-improves-students-test-scores-and-helps-them-accurately-judge-their-learning/), [Loughborough – Spaced and interleaved practice in mathematics](https://blog.lboro.ac.uk/cmc/?p=577) (Befundlage uneinheitlich)
- Gamification: [hubbs.schule – Übersicht](https://hubbs.schule/sodix/proxy-file/21102/1) (im Mittel Vorteil, Befunde nicht eindeutig)

Nicht belegt gefunden und deshalb oben als *(prüfen)* markiert: deutsche Lehrplanpassung der Khan Academy, Wiederholungslogik von ANTON, Offline-Fähigkeit von bettermarks und simpleclub.
