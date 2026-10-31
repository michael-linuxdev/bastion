<script lang="ts">
  // „Mehr“ vom Start-Hub: alles, was nicht täglich gebraucht wird.
  import Symbol from '../grafik/Symbol.svelte';
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

  const eintraege = $derived<
    { ziel: Ziel; name: string; symbol: 'stand' | 'ueben' | 'eltern' | 'mehr' }[]
  >([
    { ziel: 'themen', name: t('mehr.themen'), symbol: 'ueben' },
    { ziel: 'stand', name: t('stand.knopf'), symbol: 'stand' },
    { ziel: 'klassenarbeit', name: t('ka.knopf'), symbol: 'mehr' },
    { ziel: 'profil', name: t('profil.knopf'), symbol: 'mehr' },
    { ziel: 'sicherung', name: t('sicherung.knopf'), symbol: 'mehr' },
    ...(eltern
      ? [{ ziel: 'eltern' as const, name: t('eltern.knopf'), symbol: 'eltern' as const }]
      : []),
  ]);
</script>

<section class="mehr">
  <button class="zurueck" onclick={() => onziel('start')}>
    <Symbol name="zurueck" />
    {t('uebung.zurueck')}
  </button>
  <p class="ort-zeile ort-name"><Symbol name="mehr" /> {t('mehr.ort')}</p>
  <p class="marke ort-name">{t('start.ueberschrift')}</p>
  <h2>{t('mehr.ueberschrift')}</h2>
  <p class="leise">{t('mehr.info')}</p>
  <ul class="liste">
    {#each eintraege as e (e.ziel)}
      <li>
        <button onclick={() => onziel(e.ziel)} class:eltern={e.ziel === 'eltern'}>
          <Symbol name={e.symbol} />
          <span>{e.name}</span>
        </button>
      </li>
    {/each}
  </ul>
  <p class="vertrauen" role="note">{t('start.vertrauen')}</p>
  <p class="versprechen">{t('start.versprechen')}</p>
  {#if offline}
    <p class="offline" role="status">{t('start.offline')}</p>
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
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
    min-block-size: var(--ziel);
  }
  .zurueck :global(svg) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }
  .ort-zeile {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--farbe-text-leise);
    font-size: 0.95rem;
  }
  .ort-zeile :global(svg) {
    inline-size: 1.1rem;
    block-size: 1.1rem;
  }
  .marke {
    font-size: 1.75rem;
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
  button:not(.zurueck) {
    font: inherit;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    inline-size: 100%;
    min-block-size: var(--ziel);
    padding-inline: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
    color: var(--farbe-text);
    text-align: start;
    cursor: pointer;
  }
  button.eltern {
    background: var(--farbe-flaeche-leise);
    box-shadow: none;
    border: 1px solid var(--farbe-rand);
  }
  .vertrauen {
    color: var(--farbe-text-leise);
    margin: 0;
    font-size: 0.95rem;
  }
  .versprechen {
    color: var(--farbe-text-leise);
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
    margin: 0;
  }
  .offline {
    color: var(--farbe-text-leise);
    font-size: 1rem;
    margin: 0;
  }
</style>
