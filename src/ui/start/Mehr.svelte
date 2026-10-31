<script lang="ts">
  // „Mehr“ vom Start-Hub: alles, was nicht täglich gebraucht wird.
  // Design-Ideen K47: Offline-Hinweis einmalig, kein Dauerbanner.
  import { onMount } from 'svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import { offlineHinweisGesehen, offlineHinweisSetzen } from '../plattform/ablage';
  import { t } from '../texte/texte';
  import type { Ziel } from './Startseite.svelte';

  let {
    eltern,
    offline,
    onziel,
  }: {
    /** Elternbereich anbieten (nicht bei Erwachsenen, L-15) */
    eltern: boolean;
    offline: boolean;
    onziel: (z: Ziel | 'start') => void;
  } = $props();

  let offlineZeigen = $state(false);

  onMount(() => {
    if (!offline) return;
    void offlineHinweisGesehen().then((gesehen) => {
      offlineZeigen = !gesehen;
    });
  });

  $effect(() => {
    if (offline) {
      void offlineHinweisGesehen().then((gesehen) => {
        offlineZeigen = !gesehen;
      });
    } else offlineZeigen = false;
  });

  function offlineOk() {
    offlineZeigen = false;
    void offlineHinweisSetzen();
  }

  const eintraege = $derived<{ ziel: Ziel; name: string }[]>([
    { ziel: 'themen', name: t('mehr.themen') },
    { ziel: 'stand', name: t('stand.knopf') },
    { ziel: 'klassenarbeit', name: t('ka.knopf') },
    { ziel: 'profil', name: t('profil.knopf') },
    { ziel: 'sicherung', name: t('sicherung.knopf') },
    ...(eltern ? [{ ziel: 'eltern' as const, name: t('eltern.knopf') }] : []),
  ]);
</script>

<section class="mehr">
  <button class="zurueck" onclick={() => onziel('start')}>← {t('uebung.zurueck')}</button>
  <p class="marke">{t('start.ueberschrift')}</p>
  <h2>{t('mehr.ueberschrift')}</h2>
  <p class="leise">{t('mehr.info')}</p>
  <ul class="liste">
    {#each eintraege as e (e.ziel)}
      <li>
        <button onclick={() => onziel(e.ziel)}>
          {#if e.ziel === 'stand'}<Symbol name="stand" />
          {:else if e.ziel === 'themen'}<Symbol name="ueben" />{/if}
          <span>{e.name}</span>
        </button>
      </li>
    {/each}
  </ul>
  <p class="versprechen">{t('start.versprechen')}</p>
  {#if offlineZeigen}
    <p class="offline" role="status">
      <span>{t('start.offline')}</span>
      <button type="button" class="haupt" onclick={offlineOk}>{t('start.offline-ok')}</button>
    </p>
  {/if}
</section>

<style>
  .mehr {
    display: grid;
    gap: var(--abstand-m);
  }
  .zurueck {
    font: inherit;
    justify-self: start;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
    min-block-size: 2.75rem;
  }
  .marke {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--farbe-akzent);
    margin: 0;
  }
  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  .leise {
    color: var(--farbe-text-leise);
    margin: 0;
  }
  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  button:not(.zurueck):not(.haupt) {
    font: inherit;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    inline-size: 100%;
    min-block-size: 3.25rem;
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
    color: var(--farbe-text);
    text-align: start;
    cursor: pointer;
  }
  .versprechen {
    color: var(--farbe-text-leise);
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
    margin: 0;
  }
  .offline {
    display: grid;
    gap: var(--abstand-s);
    justify-items: start;
    color: var(--farbe-text);
    font-size: 1rem;
    margin: 0;
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche-leise);
  }
</style>
