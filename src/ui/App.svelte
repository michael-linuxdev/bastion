<script lang="ts">
  import type { Kompetenz, Niveau } from '../core/competence/kompetenz';
  import { naechsteVorlage, vorlagenFuer } from '../core/learning/uebung';
  import { istRueckkehr, wiederholRunde } from '../core/srs/rueckkehr';
  import type { Fehlergruppe } from '../core/learning/werkstatt';
  import {
    fehlergruppen,
    merke,
    zustand as ladeZustand,
    type Antwortdaten,
    type Zustand,
  } from './plattform/ablage';
  import { offline } from './plattform/offline.svelte';
  import { ladeInhalte, type Inhalte } from './plattform/pakete';
  import { t } from './texte/texte';
  import type { Auftrag } from './ueben/auftrag';
  import Uebersicht from './ueben/Uebersicht.svelte';
  import Uebung from './ueben/Uebung.svelte';
  import Werkstatt from './ueben/Werkstatt.svelte';
  import UpdateHinweis from './UpdateHinweis.svelte';

  let ansicht = $state<
    'start' | 'uebersicht' | 'uebung' | 'wiederholen' | 'werkstatt' | 'werkstatt-uebung'
  >('start');
  let gruppen = $state<readonly Fehlergruppe[]>([]);
  /** Aufträge der gerade aufgearbeiteten Fehlergruppe. */
  let werkstattListe = $state<readonly Auftrag[]>([]);
  let inhalte = $state<Promise<Inhalte> | undefined>(undefined);
  let niveau = $state<Niveau>('G');
  let gewaehlt = $state<Kompetenz | undefined>(undefined);
  let zustand = $state<Zustand>({ staende: new Map(), karten: [] });
  /** Fällige Karten, festgehalten beim Start einer Wiederholungsrunde. */
  let wiederholListe = $state<readonly Auftrag[]>([]);

  // Fällig ist, was beim letzten Laden fällig war – kein laufender Timer (R2).
  // Gezeigt wird die Größe der nächsten Runde (höchstens eine Portion), nie ein Berg.
  let faellig = $state(0);
  /** Rückkehr nach einer Pause – einmal beim App-Start festgestellt (BASEBAU §6.3). */
  let rueckkehr = $state<boolean | undefined>(undefined);

  async function aktualisiere() {
    zustand = await ladeZustand();
    const jetzt = Date.now();
    rueckkehr ??= istRueckkehr(zustand.karten, jetzt);
    faellig = wiederholRunde(zustand.karten, jetzt).length;
    gruppen = await fehlergruppen();
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

  async function ergebnis(daten: Antwortdaten) {
    await merke(daten);
    await aktualisiere();
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
  <h1>{t('start.ueberschrift')}</h1>

  {#if ansicht === 'start'}
    {#if rueckkehr}
      <p class="untertitel" role="status">{t('rueckkehr.gruss')}</p>
      {#if faellig > 0}<p>{t('rueckkehr.hinweis')}</p>{/if}
    {:else}
      <p class="untertitel">{t('start.untertitel')}</p>
      <p>{t('start.status')}</p>
    {/if}
    <p class="knoepfe">
      <button class="haupt" onclick={ueben}>{t('start.ueben')}</button>
      {#if faellig > 0}
        <button class="zweit" onclick={() => void wiederholen()}>{t('wiederholen.knopf')}</button>
      {/if}
      {#if offeneFehler > 0}
        <button class="zweit" onclick={werkstatt}>{t('werkstatt.knopf')}</button>
      {/if}
    </p>
    {#if faellig > 0}
      <p class="hinweis">
        {faellig === 1 ? t('wiederholen.eine') : `${faellig} ${t('wiederholen.mehrere')}`}
      </p>
    {/if}
    {#if offeneFehler > 0}
      <p class="hinweis">
        {offeneFehler === 1
          ? t('werkstatt.offen-eins')
          : `${offeneFehler} ${t('werkstatt.offen-mehrere')}`}
      </p>
    {/if}
    <p class="versprechen">{t('start.versprechen')}</p>
    {#if offline.bereit}
      <p class="offline" role="status">{t('start.offline')}</p>
    {/if}
  {:else if inhalte}
    {#await inhalte}
      <p role="status">{t('uebersicht.laedt')}</p>
    {:then geladen}
      {#if ansicht === 'werkstatt'}
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
          auftrag={(i) => werkstattListe[i]}
          modus="fehlerwerkstatt"
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
          auftrag={(i) => wiederholListe[i]}
          modus="wiederholen"
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
        <Uebung
          ueberschrift="{gewaehlt.titel.de} · {t(niveau === 'G' ? 'niveau.G' : 'niveau.M')}"
          auftrag={uebenAuftrag(geladen, gewaehlt)}
          modus="ueben"
          paketVon={geladen.paketVon}
          onzurueck={() => (ansicht = 'uebersicht')}
          onergebnis={(d) => void ergebnis(d)}
        />
      {:else}
        <Uebersicht
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          {zustand}
          bind:niveau
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

<UpdateHinweis />

<style>
  .start {
    max-inline-size: 40rem;
    margin-inline: auto;
    padding-block: var(--abstand-l);
    padding-inline: var(--abstand-m);
  }

  h1 {
    font-size: 2.5rem;
    color: var(--farbe-akzent);
    margin-block-end: var(--abstand-s);
  }

  .untertitel {
    font-size: 1.375rem;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .haupt,
  .zweit {
    font: inherit;
    font-size: 1.25rem;
    min-block-size: 3rem;
    padding-inline: var(--abstand-l);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .haupt {
    border: none;
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }

  .zweit {
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
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

  .hinweis {
    color: var(--farbe-text-leise);
  }

  .versprechen {
    color: var(--farbe-text-leise);
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .offline {
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }
</style>
