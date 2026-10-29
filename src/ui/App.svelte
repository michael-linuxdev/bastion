<script lang="ts">
  import type { Kompetenz, Niveau } from '../core/competence/kompetenz';
  import { naechsteVorlage, vorlagenFuer } from '../core/learning/uebung';
  import { istRueckkehr, wiederholRunde } from '../core/srs/rueckkehr';
  import type { Antwort } from '../core/learning/diagnose';
  import type { Fehlergruppe } from '../core/learning/werkstatt';
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
    schulartSetzen,
    sicherungAnstehend,
    zustand as ladeZustand,
    type Antwortdaten,
    type Zustand,
  } from './plattform/ablage';
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
  import BastionAnsicht from './bastion/Bastion.svelte';
  import Hinterhof from './bastion/Hinterhof.svelte';
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
  import ModusWahl from './profil/ModusWahl.svelte';
  import Startseite, { type Ziel } from './start/Startseite.svelte';
  import Leiste, { type Bereich } from './start/Leiste.svelte';
  import Mehr from './start/Mehr.svelte';

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

  async function aktualisiere() {
    zustand = await ladeZustand();
    const jetzt = Date.now();
    rueckkehr ??= istRueckkehr(zustand.karten, jetzt);
    faellig = wiederholRunde(zustand.karten, jetzt).length;
    gruppen = await fehlergruppen();
    aufgabenListe = await alleAufgaben();
    sichern = await sicherungAnstehend();
    basebau = await basebauAn();
    aktiv.thema = await themaWahl();
    darstellungSetzen(await modusWahl());
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
    const kompetenz = geladen.kompetenzen.find((k) => k.id === g.kompetenz);
    werkstattListe = g.fehler.flatMap((e) => {
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

  /** Ein Bereich der App öffnen – von der Startseite oder aus der Leiste unten. */
  function gehe(ziel: Ziel | 'start' | 'mehr') {
    if (ziel !== 'start' && ziel !== 'mehr' && ziel !== 'sicherung' && ziel !== 'profil')
      inhalte ??= ladeInhalte();
    switch (ziel) {
      case 'ueben':
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

  /** Hervorgehobener Bereich in der Leiste unten */
  const bereich = $derived<Bereich | undefined>(
    ansicht === 'start' || ansicht === 'bastion'
      ? ansicht
      : ansicht === 'abschluss'
        ? undefined
        : ['mehr', 'stand', 'profil', 'sicherung', 'eltern', 'klassenarbeit'].includes(ansicht)
          ? 'mehr'
          : 'ueben',
  );

  /** Laufendes Speichern – der Abschluss wartet darauf, damit die letzte Antwort mitzählt. */
  let speichern: Promise<void> = Promise.resolve();

  async function ergebnis(daten: Antwortdaten) {
    speichern = speichern.then(() => merke(daten));
    await speichern;
    await aktualisiere();
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
    return (i: number): Auftrag | undefined => {
      const v = naechsteVorlage(auswahl, i);
      return v ? { kompetenz: k, vorlage: v, niveau: n } : undefined;
    };
  }
</script>

<main class="start">
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
        <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
        <BastionAnsicht kompetenzen={geladen.kompetenzen} />
        <Hinterhof
          kompetenzen={geladen.kompetenzen}
          staende={[...zustand.staende.values()]}
          aufgaben={aufgabenListe}
          {klasse}
        />
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
        />
      {:else if ansicht === 'eltern'}
        <button class="zurueck" onclick={() => (ansicht = 'start')}>← {t('uebung.zurueck')}</button>
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
          onueben={(k) => {
            gewaehlt = k;
            ansicht = 'uebung';
          }}
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
          bind:uebergreifend={diagnoseUebergreifend}
          onklasse={(k) => {
            stillerWechsel = k !== klasse;
            klasse = k;
            ansicht = 'uebersicht';
          }}
          onergebnis={(d) => void ergebnis(d)}
          onueben={(k) => {
            gewaehlt = k;
            niveau = 'G';
            ansicht = 'uebung';
          }}
          onende={() => {
            ansicht = 'start';
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
            gewaehlt = k;
            niveau = 'G';
            ansicht = 'uebung';
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
          {gruppen}
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
          onwahl={(k) => {
            gewaehlt = k;
            ansicht = 'uebung';
          }}
        />
      {/if}
    {:catch}
      <p role="alert">{t('uebersicht.fehler')}</p>
    {/await}
  {/if}
</main>

<Leiste aktuell={bereich} {basebau} onwahl={gehe} />

<UpdateHinweis />

<style>
  .start {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding-block: var(--abstand-m) 6rem;
    padding-inline: var(--abstand-m);
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
