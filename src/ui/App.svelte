<script lang="ts">
  import type { Kompetenz, Niveau } from '../core/competence/kompetenz';
  import { naechsteVorlage, vorlagenFuer } from '../core/learning/uebung';
  import { istRueckkehr, wiederholRunde } from '../core/srs/rueckkehr';
  import type { Antwort } from '../core/learning/diagnose';
  import {
    gruppiere,
    offeneFehler as offeneAufgaben,
    type Fehlergruppe,
  } from '../core/learning/werkstatt';
  import {
    alleAufgaben,
    fehlergruppen,
    merke,
    sitzungBeenden,
    alleBuchungen,
    basebauAn,
    themaWahl,
    modusWahl,
    lernWahl,
    profilWahl,
    profilSetzen,
    profilUebersprungen,
    schuljahrGemerkt,
    schuljahrSetzen,
    geradeDranWahl,
    geradeDranSetzen,
    klassenarbeitWahl,
    klassenarbeitSetzen,
    klasseSetzen,
    merkeVermittlung,
    nutzungMerken,
    testStand,
    alleVermittlungen,
    vermittelteKompetenzen,
    schulartSetzen,
    sicherungAnstehend,
    bewaehrungBelohnen,
    orientierungWahl,
    zustand as ladeZustand,
    type Antwortdaten,
    type Zustand,
  } from './plattform/ablage';
  import { bewaehrungBestanden, type BewaehrungModus } from '../core/bastion/bewaehrung';
  import { offline } from './plattform/offline.svelte';
  import { ladeInhalte, type Inhalte } from './plattform/pakete';
  import { t } from './texte/texte';
  import { alsText, fuelle } from '../core/learning/text';
  import type { Auftrag } from './ueben/auftrag';
  import Diagnose from './ueben/Diagnose.svelte';
  import KlassenarbeitAnsicht from './ueben/Klassenarbeit.svelte';
  import MeinStand from './ueben/MeinStand.svelte';
  import Elternbereich from './eltern/Elternbereich.svelte';
  import Sicherung from './sicherung/Sicherung.svelte';
  import type { AufgabeEreignis } from '../core/learning/ereignis';
  import type { BuchungEreignis } from '../core/ledger/buchung';
  import { sitzt, statusVon } from './ueben/stand';
  import { rueckweg } from '../core/learning/empfehlung';
  import Abschluss from './ueben/Abschluss.svelte';
  import AnleitungAnsicht from './ueben/Anleitung.svelte';
  import type { Anleitung } from '../core/learning/anleitung';
  import { begriffeBereitstellen } from './ueben/begriffe';
  import type { Begriffskarte } from '../core/learning/begriffe';
  import Uebersicht from './ueben/Uebersicht.svelte';
  import Uebung from './ueben/Uebung.svelte';
  import Werkstatt from './ueben/Werkstatt.svelte';
  import UpdateHinweis from './UpdateHinweis.svelte';
  import Wechsel from './ueben/Wechsel.svelte';
  import ProfilForm from './profil/Profil.svelte';
  import {
    schuljahrFragen,
    schuljahrVon,
    selbstverwaltet,
    type Profil,
  } from '../core/policy/alter';
  import Schuljahr from './ueben/Schuljahr.svelte';
  import { lerntag as lerntagVon } from '../core/policy/lerntag';
  import { KLASSEN } from './ueben/klassen';
  import { uebersprungeneKlassen, type WechselHinweis } from '../core/learning/wechsel';
  import {
    klassenarbeitAus,
    klassenarbeitText,
    type Klassenarbeit,
  } from '../core/learning/klassenarbeit';
  import { untrack } from 'svelte';
  import { aktiv } from './bastion/thema.svelte';
  import { darstellungSetzen } from './grafik/darstellung.svelte';
  import { orientierungLaden } from './grafik/orientierung.svelte';
  import OrientierungWahl from './grafik/OrientierungWahl.svelte';
  import ModusWahl from './profil/ModusWahl.svelte';
  import Startseite, { type Ziel } from './start/Startseite.svelte';
  import Mehr from './start/Mehr.svelte';
  import { naechsteKompetenz } from './ueben/naechste';
  import VermittlungAnsicht from './vermittlung/Vermittlung.svelte';
  import Angebot from './vermittlung/Angebot.svelte';
  import {
    FV_REGELN,
    fvKatalog,
    fvZustaende,
    type FvStand,
    type FvZustand,
  } from '../core/learning/fv-diagnose';
  import type { VermittlungEreignis } from '../core/learning/vermittlung-ereignis';
  import type { Fehlvorstellung } from '../core/learning/fehlvorstellung';

  let ansicht = $state<
    | 'start'
    | 'uebersicht'
    | 'uebung'
    | 'wiederholen'
    | 'werkstatt'
    | 'werkstatt-uebung'
    | 'diagnose'
    | 'klassenarbeit'
    | 'stand'
    | 'eltern'
    | 'profil'
    | 'sicherung'
    | 'abschluss'
    | 'anleitung'
    | 'vermittlung'
    | 'angebot'
    | 'bastion'
    | 'mehr'
  >('start');
  let aufgabenListe = $state<readonly AufgabeEreignis[]>([]);
  let buchungsListe = $state<readonly BuchungEreignis[]>([]);
  /** Basebau-Schalter (R7, B-13) */
  let basebau = $state(true);
  /** Antworten des laufenden Diagnosegangs – bleiben bis zum Neuladen, damit „Später“ weitergeht. */
  let diagnoseAntworten = $state<Antwort[]>([]);
  /** Klasse des laufenden Diagnosegangs – bleibt fest, sobald geantwortet wurde */
  let diagnoseKlasse = $state(5);
  let gruppen = $state<readonly Fehlergruppe[]>([]);
  /** Aufträge der gerade aufgearbeiteten Fehlergruppe. */
  let werkstattListe = $state<readonly Auftrag[]>([]);
  let inhalte = $state<Promise<Inhalte> | undefined>(undefined);
  let niveau = $state<Niveau>('G');
  let klasse = $state(5);
  /** Freiwillige Schulart (L-9) */
  let schulart = $state<'oberschule' | 'gymnasium' | undefined>(undefined);
  /** Zuletzt gespeicherte Wahl – Vergleich für „Wechsel begleiten“ (L-12) */
  let gemerkt = $state<{
    klasse: number;
    schulart: 'oberschule' | 'gymnasium' | undefined;
    neu: boolean;
  }>();
  let wechsel = $state<WechselHinweis | undefined>(undefined);
  /** Profil (L-15) – freiwillig; ohne Angabe: Schülerin oder Schüler mit Elternbereich */
  let profil = $state<Profil>({ geburtsdatum: undefined, erwachsen: false });
  let profilGefragt = $state(true);
  const heuteTag = lerntagVon(Date.now(), -new Date().getTimezoneOffset());
  const selbst = $derived(selbstverwaltet(profil, heuteTag));
  /** Neues Schuljahr begonnen – einmal nach der Klasse fragen (L-17) */
  let neuesSchuljahr = $state(false);
  /** „Gerade in der Schule dran“ (L-18) – Kompetenz-IDs */
  let geradeDran = $state<readonly string[]>([]);
  /** zuletzt gespeicherter Stand – nur Änderungen werden gespeichert */
  let geradeDranGespeichert: string | undefined;
  $effect(() => {
    const text = geradeDran.join(',');
    if (geradeDranGespeichert === undefined || text === geradeDranGespeichert) return;
    geradeDranGespeichert = text;
    void geradeDranSetzen(geradeDran);
  });
  /** Nächste Klassenarbeit (L-19) – nach dem Termin vorbei */
  let klassenarbeit = $state<Klassenarbeit | undefined>(undefined);
  let klassenarbeitGespeichert: string | undefined;
  $effect(() => {
    const text = klassenarbeit ? klassenarbeitText(klassenarbeit) : '';
    if (klassenarbeitGespeichert === undefined || text === klassenarbeitGespeichert) return;
    klassenarbeitGespeichert = text;
    void klassenarbeitSetzen(text);
  });
  /** Laufende Diagnose ist eine Probe-Klassenarbeit (L-19) */
  let diagnoseProbe = $state(false);
  /** Laufende Bewährungsprobe (BASEBAU §5.6 / G11); null = keine */
  let bewaehrung = $state<{
    readonly modus: BewaehrungModus;
    readonly bezug: string;
    readonly joker: number;
  } | null>(null);
  /** Spannungsoptik auf dem Bauplatz bis zum nächsten Verlassen der Bastion */
  let bewaehrungSpannung = $state(false);
  let bewaehrungHinweis = $state<string | undefined>(undefined);
  /** Schuljahr erst mit der ersten Klassenwahl merken – beim ersten Start wird nichts gespeichert */
  let schuljahrBekannt = false;
  /** Diagnose nur für ausgewählte Kompetenzen (nach einem Schulartwechsel) */
  let diagnoseAuswahl = $state<readonly string[] | undefined>(undefined);
  /** Wiedereinstieg über alle Klassen (L-16); für Erwachsene vorgewählt */
  let diagnoseUebergreifend = $state(false);
  /** Klasse kommt aus dem Wiedereinstieg – dann kein Hinweis auf übersprungene Klassen */
  let stillerWechsel = false;
  $effect(() => {
    const k = klasse;
    const s = schulart;
    untrack(() => {
      if (!gemerkt) return;
      if (k !== gemerkt.klasse) {
        const ueber = uebersprungeneKlassen(gemerkt.neu ? 4 : gemerkt.klasse, k, KLASSEN);
        // Hochstellen über Klassen hinweg: Diagnose anbieten; zurückstellen: nichts (neutral)
        wechsel =
          ueber.length > 0 && !stillerWechsel
            ? { art: 'klassen', klassen: ueber, schulart: s }
            : undefined;
        stillerWechsel = false;
        void klasseSetzen(k, ansicht === 'eltern' ? 'eltern' : 'jugendlich');
        if (!schuljahrBekannt) {
          schuljahrBekannt = true;
          void schuljahrSetzen(schuljahrVon(heuteTag));
        }
      }
      if (s !== gemerkt.schulart) {
        wechsel =
          gemerkt.schulart && s
            ? { art: 'schulart', alt: gemerkt.schulart, neu: s, klasse: k }
            : wechsel;
        void schulartSetzen(s, ansicht === 'eltern' ? 'eltern' : 'jugendlich');
      }
      gemerkt = { klasse: k, schulart: s, neu: gemerkt.neu && k === gemerkt.klasse };
    });
  });
  let gewaehlt = $state<Kompetenz | undefined>(undefined);
  let zustand = $state<Zustand>({ staende: new Map(), karten: [] });
  /** Fachbegriffe aus dem Grundpaket – für alle Texte (L-7) */
  let begriffe = $state<Begriffskarte | undefined>(undefined);
  begriffeBereitstellen({
    get karte() {
      return begriffe;
    },
  });
  $effect(() => {
    void inhalte?.then((i) => (begriffe = i.begriffe)).catch(() => undefined);
  });
  /** Fällige Karten, festgehalten beim Start einer Wiederholungsrunde. */
  let wiederholListe = $state<readonly Auftrag[]>([]);
  /** Geöffnete Zeichen-Anleitung (L-10) */
  let anleitung = $state<Anleitung | undefined>(undefined);

  // Fällig ist, was beim letzten Laden fällig war – kein laufender Timer (R2).
  // Gezeigt wird die Größe der nächsten Runde (höchstens eine Portion), nie ein Berg.
  let faellig = $state(0);
  /** Rückkehr nach einer Pause – einmal beim App-Start festgestellt (BASEBAU §6.3). */
  let rueckkehr = $state<boolean | undefined>(undefined);
  /** Erinnerung an eine Sicherung (monatlich, ARCHITEKTUR §2) – beim Laden festgestellt. */
  let sichern = $state(false);

  /** Kompetenzen mit abgeschlossener Erstvermittlung (VERMITTLUNG §2.4) */
  let vermittelte = $state<ReadonlySet<string>>(new Set());
  let vermittlungListe = $state<readonly VermittlungEreignis[]>([]);
  /** Testprotokoll eingeschaltet (K-14): Hinweis auf der Startseite */
  let testphase = $state(false);

  // Nutzungsprotokoll (D-18): jede Ansicht mit der Verweildauer der vorigen.
  // nutzungMerken schreibt nur, wenn das Testprotokoll eingeschaltet ist.
  let ansichtSeit = Date.now();
  $effect(() => {
    const ziel = ansicht;
    const jetzt = Date.now();
    const dauer = jetzt - ansichtSeit;
    ansichtSeit = jetzt;
    void nutzungMerken('ansicht', ziel, dauer);
  });
  $effect(() => {
    const sichtbar = () =>
      void nutzungMerken('app', document.visibilityState === 'visible' ? 'vorn' : 'hintergrund');
    document.addEventListener('visibilitychange', sichtbar);
    return () => document.removeEventListener('visibilitychange', sichtbar);
  });
  /** Rückweg aus dem Fehlerkatalog: an dieser Stelle der Erstvermittlung beginnen */
  let vermittlungStart = $state<string | undefined>(undefined);
  /**
   * Kontrastaufgaben, die beim Üben als Nächstes drankommen (VERMITTLUNG §3.3).
   * Bewusst nicht reaktiv: Die laufende Aufgabe darf sich dadurch nicht ändern.
   */
  let kontrastSchlange: Auftrag[] = [];

  /** Diagnose der Fehlvorstellungen aus allen Ereignissen (U3e) */
  function fvStaende(geladen: Inhalte): ReadonlyMap<string, FvStand> {
    return fvZustaende(
      aufgabenListe,
      vermittlungListe,
      fvKatalog(geladen.vorlagen, [...geladen.fehlvorstellungen.values()]),
    );
  }

  /** Fehlerwerkstatt nach Ursachen (U3j): gleiche Fehlvorstellung = eine Gruppe */
  function gruppenNachUrsache(geladen: Inhalte): Fehlergruppe[] {
    const katalog = fvKatalog(geladen.vorlagen, [...geladen.fehlvorstellungen.values()]);
    return gruppiere(offeneAufgaben(aufgabenListe), (e) => {
      const aus = e.fehlerbild ? katalog.fvVon(e.vorlage, e.fehlerbild) : undefined;
      return aus ?? e.schritte?.flatMap((s) => (s.fehler ?? []).map((f) => f.fv)).find(Boolean);
    });
  }

  /** Fehlvorstellungen, die eine Antwort zeigt: Fehlerbild des Ergebnisses und der Schritte */
  function fvsVon(geladen: Inhalte, d: Antwortdaten): string[] {
    const vorlage = geladen.vorlagen.find((v) => v.id === d.vorlage);
    const aus =
      !d.ergebnis.richtig && d.ergebnis.fehlerbild
        ? vorlage?.fehlerbilder[d.ergebnis.fehlerbild]?.fv
        : undefined;
    const schritte = (d.schritte ?? []).flatMap((s) =>
      (s.fehler ?? []).flatMap((f) => (f.fv ? [f.fv] : [])),
    );
    return [...new Set([aus, ...schritte].filter((x): x is string => x !== undefined))];
  }

  /**
   * Rückweg aus der langen Erklärung (VERMITTLUNG §3.2, §3.3): „wieder da“ führt zur
   * Voraussetzung, falls es eine gibt; sonst zurück in die Erstvermittlung an der
   * genannten Stelle, falls es sie schon gibt.
   */
  function rueckwegArt(
    geladen: Inhalte,
    fv: Fehlvorstellung,
    zustand: FvZustand | undefined,
  ): 'erklaerung' | 'grundlage' | undefined {
    const v = fv.rueckweg.voraussetzung;
    if (zustand === 'wieder-da' && v && geladen.kompetenzen.some((k) => k.id === v))
      return 'grundlage';
    const kid = fv.rueckweg.vermittlung.split('#')[0] ?? '';
    return geladen.vermittlungen.has(kid) ? 'erklaerung' : undefined;
  }

  function rueckwegGehen(geladen: Inhalte, fv: Fehlvorstellung, art: 'erklaerung' | 'grundlage') {
    if (art === 'grundlage') {
      const k = geladen.kompetenzen.find((x) => x.id === fv.rueckweg.voraussetzung);
      if (k) zumUeben(geladen, k);
      return;
    }
    const [kid = '', schritt] = fv.rueckweg.vermittlung.split('#');
    const k = geladen.kompetenzen.find((x) => x.id === kid);
    if (!k) return;
    gewaehlt = k;
    vermittlungStart = schritt;
    ansicht = 'vermittlung';
  }

  /**
   * Zum Üben einer Kompetenz. Ist sie neu und gibt es eine Erstvermittlung, kommt
   * vorher das Angebot „Erst erklären lassen?“ – überspringbar (U3d).
   */
  function zumUeben(geladen: Inhalte, k: Kompetenz) {
    gewaehlt = k;
    const neu =
      !vermittelte.has(k.id) && ![...zustand.staende.values()].some((s) => s.kompetenz === k.id);
    ansicht = neu && geladen.vermittlungen.has(k.id) ? 'angebot' : 'uebung';
  }

  async function aktualisiere() {
    zustand = await ladeZustand();
    vermittelte = await vermittelteKompetenzen();
    vermittlungListe = await alleVermittlungen();
    testphase = (await testStand()).aktiv;
    const jetzt = Date.now();
    rueckkehr ??= istRueckkehr(zustand.karten, jetzt);
    faellig = wiederholRunde(zustand.karten, jetzt).length;
    gruppen = await fehlergruppen();
    aufgabenListe = await alleAufgaben();
    sichern = await sicherungAnstehend();
    basebau = await basebauAn();
    aktiv.thema = await themaWahl();
    darstellungSetzen(await modusWahl());
    orientierungLaden(await orientierungWahl());
    const pr = await profilWahl();
    profil = { geburtsdatum: pr.geburtsdatum, erwachsen: pr.erwachsen };
    profilGefragt = pr.gefragt;
    if (!gemerkt) {
      const w = await lernWahl();
      klasse = w.klasse;
      schulart = w.schulart;
      gemerkt = w;
      const gd = await geradeDranWahl();
      geradeDranGespeichert = typeof gd === 'string' ? gd : '';
      geradeDran = geradeDranGespeichert === '' ? [] : geradeDranGespeichert.split(',');
      const ka = await klassenarbeitWahl();
      klassenarbeit = klassenarbeitAus(ka, heuteTag);
      klassenarbeitGespeichert = typeof ka === 'string' ? ka : '';
      const sj = await schuljahrGemerkt();
      schuljahrBekannt = sj !== undefined;
      neuesSchuljahr = !w.neu && schuljahrFragen(sj, heuteTag, profil.erwachsen);
    }
  }

  const offeneFehler = $derived(gruppen.reduce((n, g) => n + g.fehler.length, 0));

  function werkstatt() {
    inhalte ??= ladeInhalte();
    ansicht = 'werkstatt';
    void aktualisiere();
  }

  /** Genau die damaligen Aufgaben – nur, wenn der Generator noch dieselbe Version hat. */
  function aufarbeiten(geladen: Inhalte, g: Fehlergruppe) {
    const vorlagen = new Map(geladen.vorlagen.map((v) => [v.id, v]));
    werkstattListe = g.fehler.flatMap((e) => {
      // Eine Gruppe nach Denkfehler kann Aufgaben mehrerer Kompetenzen enthalten
      const kompetenz = geladen.kompetenzen.find((k) => k.id === e.kompetenz);
      const vorlage = vorlagen.get(e.vorlage);
      return kompetenz &&
        vorlage &&
        vorlage.generator === `${e.quelle.generator}@${e.quelle.version}` &&
        e.schnappschuss
        ? [
            {
              kompetenz,
              vorlage,
              niveau: e.niveau,
              seed: e.quelle.seed,
              korrigiert: e.id,
              frueher: e.schnappschuss.antwort,
            },
          ]
        : [];
    });
    ansicht = 'werkstatt-uebung';
  }
  void aktualisiere();

  function ueben() {
    inhalte ??= ladeInhalte();
    ansicht = 'uebersicht';
    void aktualisiere();
  }

  /**
   * „Üben“ vom Start-Hub: direkt zur nächsten bzw. offenen Aufgabe.
   * Läuft schon eine Runde, bleiben wir dort. Sonst Übersicht nur als Notfall.
   */
  async function zumNaechstenUeben() {
    if (
      ansicht === 'wiederholen' ||
      ansicht === 'werkstatt-uebung' ||
      ansicht === 'angebot' ||
      ansicht === 'vermittlung' ||
      ansicht === 'anleitung' ||
      (ansicht === 'uebung' && gewaehlt)
    )
      return;
    inhalte ??= ladeInhalte();
    const geladen = await inhalte.catch(() => undefined);
    await aktualisiere();
    if (!geladen) {
      ansicht = 'uebersicht';
      return;
    }
    const k = naechsteKompetenz(
      geladen.kompetenzen,
      geladen.vorlagen,
      geradeDran,
      niveau,
      klasse,
      zustand,
      Date.now(),
    );
    if (k) zumUeben(geladen, k);
    else ansicht = 'uebersicht';
  }

  async function wiederholen() {
    inhalte ??= ladeInhalte();
    const geladen = await inhalte;
    await aktualisiere();
    const jetzt = Date.now();
    const vorlage = new Map(geladen.vorlagen.map((v) => [v.id, v]));
    const kompetenz = new Map(geladen.kompetenzen.map((k) => [k.id, k]));
    wiederholListe = wiederholRunde(zustand.karten, jetzt).flatMap((k) => {
      const v = vorlage.get(k.vorlage);
      const komp = kompetenz.get(k.kompetenz);
      return v && komp ? [{ kompetenz: komp, vorlage: v, niveau: k.niveau }] : [];
    });
    ansicht = 'wiederholen';
  }

  /** Ein Bereich der App öffnen – vom Start-Hub oder aus Unterseiten. */
  function gehe(ziel: Ziel | 'start') {
    if (ziel !== 'start' && ziel !== 'mehr' && ziel !== 'sicherung' && ziel !== 'profil')
      inhalte ??= ladeInhalte();
    switch (ziel) {
      case 'ueben':
        void zumNaechstenUeben();
        return;
      case 'themen':
        ueben();
        return;
      case 'wiederholen':
        void wiederholen();
        return;
      case 'werkstatt':
        werkstatt();
        return;
      case 'diagnose':
        if (diagnoseAntworten.length === 0) {
          diagnoseKlasse = klasse;
          diagnoseAuswahl = undefined;
          diagnoseUebergreifend = selbst;
          diagnoseProbe = false;
        }
        ansicht = 'diagnose';
        return;
      default:
        ansicht = ziel;
        if (ziel === 'start' || ziel === 'stand' || ziel === 'eltern') void aktualisiere();
    }
  }

  /** Laufendes Speichern – der Abschluss wartet darauf, damit die letzte Antwort mitzählt. */
  let speichern: Promise<void> = Promise.resolve();

  async function ergebnis(daten: Antwortdaten) {
    const geladen = inhalte ? await inhalte.catch(() => undefined) : undefined;
    const vorher = geladen ? fvStaende(geladen) : undefined;
    speichern = speichern.then(() => merke(daten));
    await speichern;
    await aktualisiere();
    if (!geladen || !vorher || daten.modus !== 'ueben') return;
    // Neu „vermutet“ oder „wieder da“: als Nächstes Kontrastaufgaben (VERMITTLUNG §3.3)
    const nachher = fvStaende(geladen);
    for (const fv of fvsVon(geladen, daten)) {
      const z = nachher.get(fv)?.zustand;
      if ((z !== 'vermutet' && z !== 'wieder-da') || vorher.get(fv)?.zustand === z) continue;
      const kontrast = (geladen.fehlvorstellungen.get(fv)?.kontrast ?? []).flatMap((id) => {
        const v = geladen.vorlagen.find((x) => x.id === id);
        const k = v && geladen.kompetenzen.find((x) => x.id === v.kompetenz);
        const n = v && (v.niveaus.includes(daten.niveau) ? daten.niveau : v.niveaus[0]);
        return v && k && n ? [{ kompetenz: k, vorlage: v, niveau: n }] : [];
      });
      for (let i = 0; i < FV_REGELN.kontraste && kontrast.length > 0; i++)
        kontrastSchlange.push(kontrast[i % kontrast.length] as Auftrag);
    }
  }

  async function fertig() {
    await speichern;
    await sitzungBeenden();
    buchungsListe = await alleBuchungen();
    await aktualisiere();
    ansicht = 'abschluss';
  }

  function uebenAuftrag(geladen: Inhalte, k: Kompetenz) {
    const auswahl = vorlagenFuer(geladen.vorlagen, k.id, niveau);
    const n = niveau;
    // Jede Nummer bekommt ihren Auftrag genau einmal – auch wenn neu berechnet wird
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- bewusst nicht reaktiv
    const vergeben = new Map<number, Auftrag | undefined>();
    return (i: number): Auftrag | undefined => {
      if (vergeben.has(i)) return vergeben.get(i);
      const v = naechsteVorlage(auswahl, i);
      const a =
        kontrastSchlange.shift() ?? (v ? { kompetenz: k, vorlage: v, niveau: n } : undefined);
      vergeben.set(i, a);
      return a;
    };
  }
</script>

<main class="start" class:bastion-szene={ansicht === 'bastion'}>
  <!-- Der Name steht sichtbar unter „Mehr“; hier nur für Screenreader -->
  <h1 class="unsichtbar">{t('start.ueberschrift')}</h1>

  {#if ansicht === 'start'}
    <Startseite
      heute={new Date()}
      rueckkehr={rueckkehr === true}
      {faellig}
      {offeneFehler}
      {basebau}
      geradeDran={geradeDran.length}
      klassenarbeit={klassenarbeit?.termin}
      {sichern}
      {testphase}
      erstesMal={aufgabenListe.length === 0}
      onziel={gehe}
    >
      {#if neuesSchuljahr}
        <Schuljahr
          vorschlag={Math.min(klasse + 1, KLASSEN[KLASSEN.length - 1] ?? klasse)}
          onbestaetigen={(k) => {
            klasse = k;
            neuesSchuljahr = false;
            geradeDran = []; // neues Schuljahr, neue Themen (L-17)
            void schuljahrSetzen(schuljahrVon(heuteTag));
          }}
        />
      {/if}
      {#if !profilGefragt}
        <ProfilForm
          {profil}
          erstesMal
          onspeichern={(p) => {
            profil = p;
            profilGefragt = true;
            void profilSetzen(p);
          }}
          onueberspringen={() => {
            profilGefragt = true;
            void profilUebersprungen();
          }}
        />
      {/if}
    </Startseite>
  {:else if ansicht === 'mehr'}
    <Mehr eltern={!selbst} offline={offline.bereit} onziel={gehe} />
  {:else if ansicht === 'profil'}
    <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
    <ProfilForm
      {profil}
      onspeichern={(p) => {
        profil = p;
        profilGefragt = true;
        void profilSetzen(p);
        ansicht = 'start';
      }}
    />
    <ModusWahl />
    <OrientierungWahl />
  {:else if ansicht === 'sicherung'}
    <button
      class="zurueck"
      onclick={() => {
        ansicht = 'start';
        void aktualisiere();
      }}>← {t('uebung.zurueck')}</button
    >
    <Sicherung oneingespielt={() => void aktualisiere()} />
  {:else if inhalte}
    {#await inhalte}
      <p role="status">{t('uebersicht.laedt')}</p>
    {:then geladen}
      {#if ansicht === 'bastion'}
        {#await import('./bastion/Bastion.svelte')}
          <p role="status">{t('uebersicht.laedt')}</p>
        {:then bastionMod}
          {@const BastionAnsicht = bastionMod.default}
          <BastionAnsicht
            kompetenzen={geladen.kompetenzen}
            wetterEinstellen={selbst}
            staende={[...zustand.staende.values()]}
            aufgaben={aufgabenListe}
            {klasse}
            spannung={bewaehrungSpannung}
            onzumStart={() => {
              bewaehrungSpannung = false;
              bewaehrungHinweis = undefined;
              gehe('start');
            }}
            onbewaehrung={(modus, themen, joker) => {
              const liste = themen.length > 0 ? themen : geladen.kompetenzen.map((k) => k.id);
              diagnoseAntworten = [];
              diagnoseAuswahl = liste;
              diagnoseUebergreifend = false;
              diagnoseProbe = true;
              bewaehrung = {
                modus,
                bezug: `bewaehrung:${heuteTag}:${liste.slice(0, 3).join('+')}:${Date.now()}`,
                joker,
              };
              bewaehrungSpannung = true;
              bewaehrungHinweis = undefined;
              ansicht = 'diagnose';
            }}
          />
          {#if bewaehrungHinweis}
            <p class="geschafft" role="status">{bewaehrungHinweis}</p>
          {/if}
        {/await}
      {:else if ansicht === 'angebot' && gewaehlt}
        {@const k = gewaehlt}
        <Angebot
          titel={k.titel.de}
          dauer={geladen.vermittlungen.get(k.id)?.dauer_min}
          onja={() => (ansicht = 'vermittlung')}
          onnein={() => (ansicht = 'uebung')}
          onzurueck={() => (ansicht = 'uebersicht')}
        />
      {:else if ansicht === 'vermittlung' && gewaehlt && geladen.vermittlungen.has(gewaehlt.id)}
        {@const v = geladen.vermittlungen.get(gewaehlt.id)}
        {#if v}
          {@const k = gewaehlt}
          {@const angaben = { kompetenz: k.id, inhalt: `${v.id}@${v.version}` }}
          <VermittlungAnsicht
            vermittlung={v}
            start={vermittlungStart}
            titel={k.titel.de}
            fehlvorstellungen={geladen.fehlvorstellungen}
            kompetenzName={(id) => geladen.kompetenzen.find((x) => x.id === id)?.titel.de}
            onantwort={(s, antwort, b) => {
              if ('richtig' in b)
                void merkeVermittlung({
                  ...angaben,
                  schritt: s.id,
                  typ: 'antwort',
                  richtig: b.richtig,
                  antwort,
                  ...(!b.richtig && b.fv ? { fv: b.fv } : {}),
                });
            }}
            onende={() => {
              vermittelte = new Set([...vermittelte, k.id]);
              speichern = merkeVermittlung({
                ...angaben,
                schritt: 'uebergang',
                typ: 'abgeschlossen',
              });
              ansicht = 'uebung';
            }}
            onvoraussetzung={(id) => {
              const ziel = geladen.kompetenzen.find((x) => x.id === id);
              if (ziel) gewaehlt = ziel;
              ansicht = 'uebung';
            }}
            onzurueck={() => {
              void nutzungMerken('abbruch', `vermittlung:${k.id}`);
              ansicht = 'uebung';
            }}
          />
        {/if}
      {:else if ansicht === 'anleitung' && anleitung}
        <AnleitungAnsicht {anleitung} onzurueck={() => (ansicht = 'uebung')} />
      {:else if ansicht === 'abschluss'}
        <Abschluss
          kompetenzen={geladen.kompetenzen}
          {zustand}
          aufgaben={aufgabenListe}
          buchungen={buchungsListe}
          {basebau}
          onstart={() => (ansicht = 'start')}
          onbastion={() => gehe('bastion')}
        />
      {:else if ansicht === 'eltern'}
        <button
          class="zurueck"
          onclick={() => {
            ansicht = 'start';
            void aktualisiere();
          }}>← {t('uebung.zurueck')}</button
        >
        <Elternbereich
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          {zustand}
          aufgaben={aufgabenListe}
          bind:basebau
          bind:klasse
          bind:schulart
        />
      {:else if ansicht === 'stand'}
        <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
        <MeinStand
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          {zustand}
          aufgaben={aufgabenListe}
          bind:basebau
          bind:niveau
          bind:klasse
          {selbst}
          onueben={(k) => zumUeben(geladen, k)}
        />
      {:else if ansicht === 'diagnose'}
        <button
          class="zurueck"
          onclick={() => {
            ansicht = 'start';
            void aktualisiere();
          }}>← {t('uebung.zurueck')}</button
        >
        <Diagnose
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          paketVon={geladen.paketVon}
          bind:antworten={diagnoseAntworten}
          bind:klasse={diagnoseKlasse}
          auswahl={diagnoseAuswahl}
          probe={diagnoseProbe}
          joker={bewaehrung?.joker ?? 0}
          bind:uebergreifend={diagnoseUebergreifend}
          onklasse={(k) => {
            stillerWechsel = k !== klasse;
            klasse = k;
            ansicht = 'uebersicht';
          }}
          onergebnis={(d) => void ergebnis(d)}
          onueben={(k) => {
            niveau = 'G';
            zumUeben(geladen, k);
          }}
          onende={() => {
            const lauf = bewaehrung;
            if (lauf) {
              const richtig = diagnoseAntworten.filter((a) => a.richtig).length;
              const gesamt = diagnoseAntworten.length;
              const ok = bewaehrungBestanden(richtig, gesamt);
              if (ok && lauf.modus === 'ernstfall') {
                void bewaehrungBelohnen(lauf.bezug, heuteTag).then((neu) => {
                  bewaehrungHinweis = neu
                    ? `${t('bastion.bewaehrung-bestanden')} ${t('bastion.bewaehrung-bauplan')}`
                    : t('bastion.bewaehrung-bestanden');
                });
              } else if (ok) bewaehrungHinweis = t('bastion.bewaehrung-bestanden');
              else bewaehrungHinweis = t('bastion.bewaehrung-nicht');
              bewaehrung = null;
            }
            diagnoseProbe = false;
            ansicht = 'bastion';
            void aktualisiere();
          }}
        />
      {:else if ansicht === 'klassenarbeit'}
        <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
        <KlassenarbeitAnsicht
          kompetenzen={geladen.kompetenzen.filter(
            (k) => vorlagenFuer(geladen.vorlagen, k.id, 'G').length > 0,
          )}
          {klasse}
          {schulart}
          {zustand}
          {geradeDran}
          heute={heuteTag}
          bind:klassenarbeit
          onueben={(k) => {
            niveau = 'G';
            zumUeben(geladen, k);
          }}
          onprobe={(themen) => {
            diagnoseAntworten = [];
            diagnoseAuswahl = themen;
            diagnoseUebergreifend = false;
            diagnoseProbe = true;
            ansicht = 'diagnose';
          }}
        />
      {:else if ansicht === 'werkstatt'}
        <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
        <Werkstatt
          gruppen={gruppenNachUrsache(geladen)}
          fehlvorstellungen={geladen.fehlvorstellungen}
          fvStaende={fvStaende(geladen)}
          vorlagen={new Map(geladen.vorlagen.map((v) => [v.id, v]))}
          kompetenzen={new Map(geladen.kompetenzen.map((k) => [k.id, k]))}
          onaufarbeiten={(g) => aufarbeiten(geladen, g)}
        />
      {:else if ansicht === 'werkstatt-uebung'}
        <Uebung
          ueberschrift={t('werkstatt.ueberschrift')}
          anzahl={werkstattListe.length}
          auftrag={(i) => werkstattListe[i]}
          modus="fehlerwerkstatt"
          onfertig={() => void fertig()}
          fehlvorstellungen={geladen.fehlvorstellungen}
          fvStaende={fvStaende(geladen)}
          rueckwegArt={(fv, z) => rueckwegArt(geladen, fv, z)}
          onnutzung={(was, ziel) => void nutzungMerken(was, ziel)}
          onrueckweg={(fv, art) => rueckwegGehen(geladen, fv, art)}
          paketVon={geladen.paketVon}
          onzurueck={() => {
            ansicht = 'werkstatt';
            void aktualisiere();
          }}
          onergebnis={(d) => void ergebnis(d)}
        />
      {:else if ansicht === 'wiederholen'}
        <Uebung
          ueberschrift={t('wiederholen.ueberschrift')}
          anzahl={wiederholListe.length}
          auftrag={(i) => wiederholListe[i]}
          modus="wiederholen"
          onfertig={() => void fertig()}
          fehlvorstellungen={geladen.fehlvorstellungen}
          fvStaende={fvStaende(geladen)}
          rueckwegArt={(fv, z) => rueckwegArt(geladen, fv, z)}
          onnutzung={(was, ziel) => void nutzungMerken(was, ziel)}
          onrueckweg={(fv, art) => rueckwegGehen(geladen, fv, art)}
          paketVon={geladen.paketVon}
          onzurueck={() => {
            ansicht = 'start';
            void aktualisiere();
          }}
          onergebnis={(d) => void ergebnis(d)}
        />
        {#if wiederholListe.length === 0}
          <p>{t('wiederholen.keine')}</p>
        {/if}
      {:else if ansicht === 'uebung' && gewaehlt}
        {#key gewaehlt}
          <Uebung
            ueberschrift={gewaehlt.titel.de}
            stufe={t(niveau === 'G' ? 'niveau.G' : 'niveau.M')}
            auftrag={uebenAuftrag(geladen, gewaehlt)}
            modus="ueben"
            onfertig={() => void fertig()}
            paketVon={geladen.paketVon}
            onzurueck={() => (ansicht = 'uebersicht')}
            onergebnis={(d) => void ergebnis(d)}
            vorschlag={(id, fehler) => {
              const jetzt = Date.now();
              const ziel = rueckweg(
                id,
                geladen.kompetenzen,
                (x) => sitzt(statusVon(zustand, x, niveau, jetzt)),
                fehler,
              );
              return geladen.kompetenzen.find((k) => k.id === ziel);
            }}
            onwechsel={(k) => (gewaehlt = k)}
            onerklaerung={geladen.vermittlungen.has(gewaehlt.id)
              ? () => {
                  vermittlungStart = undefined;
                  ansicht = 'vermittlung';
                }
              : undefined}
            fehlvorstellungen={geladen.fehlvorstellungen}
            fvStaende={fvStaende(geladen)}
            rueckwegArt={(fv, z) => rueckwegArt(geladen, fv, z)}
            onnutzung={(was, ziel) => void nutzungMerken(was, ziel)}
            onrueckweg={(fv, art) => rueckwegGehen(geladen, fv, art)}
          />
        {/key}
        {@const zuKompetenz = geladen.anleitungen.filter((a) => a.kompetenz === gewaehlt?.id)}
        {#if zuKompetenz.length > 0}
          <p class="anleitungen">
            {t('anleitung.knopf')}
            {#each zuKompetenz as a (a.id)}
              <button
                class="dezent"
                onclick={() => {
                  anleitung = a;
                  ansicht = 'anleitung';
                }}>{alsText(fuelle(a.titel.de, {}))}</button
              >
            {/each}
          </p>
        {/if}
      {:else}
        {#if wechsel}
          <Wechsel
            hinweis={wechsel}
            kompetenzen={geladen.kompetenzen}
            staende={[...zustand.staende.values()]}
            onauswahl={(ids) => {
              wechsel = undefined;
              diagnoseAntworten = [];
              diagnoseAuswahl = ids;
              diagnoseProbe = false;
              ansicht = 'diagnose';
            }}
            onschliessen={() => (wechsel = undefined)}
          />
        {/if}
        <Uebersicht
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          {zustand}
          bind:niveau
          bind:klasse
          bind:schulart
          bind:geradeDran
          vermittelt={vermittelte}
          onwahl={(k) => zumUeben(geladen, k)}
        />
      {/if}
    {:catch}
      <p role="alert">{t('uebersicht.fehler')}</p>
    {/await}
  {/if}
</main>

<UpdateHinweis />

<style>
  .start {
    max-inline-size: 40rem;
    margin-inline: auto;
    /* oben Abstand zur Statusleiste des iPhones (viewport-fit=cover) */
    padding-block: calc(env(safe-area-inset-top) + var(--abstand-l))
      calc(env(safe-area-inset-bottom) + var(--abstand-s));
    padding-inline: var(--abstand-m);
  }

  /* Bastion-Szene: vollflächig.
     Klassen .bastion/.einstellungen kommen aus dem nachgeladenen Modul → :global. */
  .start.bastion-szene:global(:has(.bastion.szene)) {
    max-inline-size: none;
    margin-inline: 0;
    padding-block: env(safe-area-inset-top) env(safe-area-inset-bottom);
    padding-inline: 0;
    block-size: 100dvh;
    overflow: hidden;
  }

  .start.bastion-szene:global(:has(.bastion.szene) .geschafft) {
    position: absolute;
    inset-inline: var(--abstand-m);
    inset-block-start: calc(env(safe-area-inset-top) + 3.5rem);
    z-index: 4;
    margin: 0;
    padding: var(--abstand-s);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
  }

  /* Bastion-Einstellungen: wieder normaler Lesebereich */
  .start.bastion-szene:global(:has(.einstellungen)) {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding-block: calc(env(safe-area-inset-top) + var(--abstand-l))
      calc(env(safe-area-inset-bottom) + var(--abstand-s));
    padding-inline: var(--abstand-m);
    block-size: auto;
    overflow: visible;
  }

  .unsichtbar {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .zurueck {
    font: inherit;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
    min-block-size: 2.75rem;
  }

  .anleitungen {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--abstand-m);
    margin-block: 0;
  }
</style>
