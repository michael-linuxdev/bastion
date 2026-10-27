<script lang="ts">
  import { offline } from './plattform/offline.svelte';
  import { t } from './texte/texte';
  import UpdateHinweis from './UpdateHinweis.svelte';
</script>

<main class="start">
  <h1>{t('start.ueberschrift')}</h1>
  <p class="untertitel">{t('start.untertitel')}</p>
  <p>{t('start.status')}</p>
  <p class="versprechen">{t('start.versprechen')}</p>
  {#if offline.bereit}
    <p class="offline" role="status">{t('start.offline')}</p>
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
