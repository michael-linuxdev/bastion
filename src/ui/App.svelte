<script lang="ts">
  import type { Kompetenz, Niveau } from '../core/competence/kompetenz';
  import type { KompetenzStand } from '../core/learning/fortschritt';
  import { merke, staende, type Antwortdaten } from './plattform/ablage';
  import { offline } from './plattform/offline.svelte';
  import { ladeInhalte, type Inhalte } from './plattform/pakete';
  import { t } from './texte/texte';
  import Uebersicht from './ueben/Uebersicht.svelte';
  import Uebung from './ueben/Uebung.svelte';
  import UpdateHinweis from './UpdateHinweis.svelte';

  let ansicht = $state<'start' | 'uebersicht' | 'uebung'>('start');
  let inhalte = $state<Promise<Inhalte> | undefined>(undefined);
  let niveau = $state<Niveau>('G');
  let gewaehlt = $state<Kompetenz | undefined>(undefined);
  let stand = $state<ReadonlyMap<string, KompetenzStand>>(new Map());

  async function aktualisiere() {
    stand = await staende();
  }

  function ueben() {
    inhalte ??= ladeInhalte();
    ansicht = 'uebersicht';
    void aktualisiere();
  }

  async function ergebnis(daten: Antwortdaten) {
    await merke(daten);
    await aktualisiere();
  }
</script>

<main class="start">
  <h1>{t('start.ueberschrift')}</h1>

  {#if ansicht === 'start'}
    <p class="untertitel">{t('start.untertitel')}</p>
    <p>{t('start.status')}</p>
    <p><button class="haupt" onclick={ueben}>{t('start.ueben')}</button></p>
    <p class="versprechen">{t('start.versprechen')}</p>
    {#if offline.bereit}
      <p class="offline" role="status">{t('start.offline')}</p>
    {/if}
  {:else if inhalte}
    {#await inhalte}
      <p role="status">{t('uebersicht.laedt')}</p>
    {:then geladen}
      {#if ansicht === 'uebung' && gewaehlt}
        <Uebung
          kompetenz={gewaehlt}
          {niveau}
          vorlagen={geladen.vorlagen}
          paketVon={geladen.paketVon}
          onzurueck={() => (ansicht = 'uebersicht')}
          onergebnis={(d) => void ergebnis(d)}
        />
      {:else}
        <Uebersicht
          kompetenzen={geladen.kompetenzen}
          vorlagen={geladen.vorlagen}
          staende={stand}
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

  .haupt {
    font: inherit;
    font-size: 1.25rem;
    min-block-size: 3rem;
    padding-inline: var(--abstand-l);
    border-radius: var(--radius);
    border: none;
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
    cursor: pointer;
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
