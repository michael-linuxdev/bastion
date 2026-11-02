<script lang="ts">
  // Eigene Druckseite für ein Aufgabenblatt (Adresse ?blatt=…). Grund: Die auf dem iPhone
  // installierte App (Home-Bildschirm) druckt nicht – window.print() bleibt dort ohne Wirkung,
  // und es gibt keinen Teilen-Knopf. Der Elternbereich öffnet darum diese Seite im Browser.
  // Sie braucht keine PIN und keine gespeicherten Daten: Dieselben Angaben ergeben dasselbe
  // Blatt (Blatt-Nr.). Gezeigt werden nur neu erzeugte Übungsaufgaben, nichts vom Kind.
  import { leseBlattAbfrage, optionenGueltig, ziehe } from '../../core/learning/arbeitsblatt';
  import type { Generator } from '../../core/learning/generator';
  import { generatoren } from '../../generators';
  import { ladeInhalte } from '../plattform/pakete';
  import { t } from '../texte/texte';
  import Druckblatt from './Druckblatt.svelte';
  import SafariWeg from './SafariWeg.svelte';

  // Doch in der installierten iPhone-App aufgegangen: dort wirkt Drucken nicht
  const iosApp = (navigator as Navigator & { standalone?: boolean }).standalone === true;

  let { abfrage }: { abfrage: string } = $props();

  const angaben = $derived(leseBlattAbfrage(abfrage));
  const gens = generatoren as ReadonlyMap<string, Generator<unknown>>;

  async function erzeuge() {
    const a = angaben;
    if (!a) return undefined;
    const geladen = await ladeInhalte();
    const kompetenzen = a.kompetenzen
      .map((id) => geladen.kompetenzen.find((k) => k.id === id))
      .filter((k) => k !== undefined);
    if (kompetenzen.length !== a.kompetenzen.length) return undefined;
    const optionen = { niveau: a.niveau, anzahl: a.anzahl, seed: a.nr };
    if (!optionenGueltig(optionen)) return undefined;
    const aufgaben = ziehe(
      { kompetenzen, vorlagen: geladen.vorlagen, generatoren: gens },
      optionen,
    );
    if (aufgaben.length === 0) return undefined;
    const thema = a.titel.trim() || kompetenzen.map((k) => k.titel.de).join(' · ');
    const datumText = a.datum ? new Date(`${a.datum}T12:00:00`).toLocaleDateString('de-DE') : '';
    return { a, aufgaben, thema, datumText };
  }
</script>

<main class="druckseite">
  <h1 class="titel">{t('blatt.titel')}</h1>
  {#await erzeuge()}
    <p role="status">{t('uebersicht.laedt')}</p>
  {:then blatt}
    {#if blatt}
      {#if iosApp}
        <SafariWeg adresse={location.href} />
      {:else}
        <button type="button" class="haupt drucken" onclick={() => window.print()}
          >{t('blatt.drucken')}</button
        >
        <p class="leise">{t('blatt.druckseite-hinweis')}</p>
      {/if}
      <Druckblatt
        aufgaben={blatt.aufgaben}
        thema={blatt.thema}
        niveau={blatt.a.niveau}
        blattNr={blatt.a.nr}
        loesungen={blatt.a.loesungen}
        punkte={blatt.a.punkte}
        datumText={blatt.datumText}
      />
    {:else}
      <p role="alert">{t('blatt.druckseite-fehlt')}</p>
    {/if}
  {:catch}
    <p role="alert">{t('blatt.druckseite-fehlt')}</p>
  {/await}
</main>

<style>
  .druckseite {
    display: grid;
    gap: var(--abstand-m);
    max-inline-size: 52rem;
    margin-inline: auto;
    padding: var(--abstand-m);
  }
  .titel {
    font-size: 1.25rem;
    margin: 0;
  }
  .leise {
    color: var(--farbe-text-leise);
    margin: 0;
  }
  @media print {
    .titel,
    .drucken,
    .leise {
      display: none;
    }
    .druckseite {
      padding: 0;
      max-inline-size: none;
    }
  }
</style>
