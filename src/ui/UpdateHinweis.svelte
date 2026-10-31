<script lang="ts">
  import { offline, updateInstallieren, updateSpaeter } from './plattform/offline.svelte';
  import { t } from './texte/texte';
</script>

{#if offline.updateBereit}
  <div class="hinweis" role="status">
    <p>{t('update.text')}</p>
    <div class="knoepfe">
      <button type="button" onclick={updateInstallieren}>{t('update.jetzt')}</button>
      <button type="button" class="leise" onclick={updateSpaeter}>{t('update.spaeter')}</button>
    </div>
  </div>
{/if}

<style>
  .hinweis {
    position: fixed;
    z-index: 20;
    inset-block-end: calc(env(safe-area-inset-bottom, 0px) + var(--abstand-s));
    inset-inline: var(--abstand-m);
    max-inline-size: 32rem;
    margin-inline: auto;
    padding: var(--abstand-m);
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  button {
    font: inherit;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    cursor: pointer;
  }

  button.leise {
    background: transparent;
    color: var(--farbe-text);
  }
</style>
