<script lang="ts">
  // „Mehr“ vom Start-Hub: Kind-Themen klar getrennt von Erwachsenen-Bereich (M69 / T102).
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

  const fuerDich = $derived<{ ziel: Ziel; name: string }[]>([
    { ziel: 'themen', name: t('mehr.themen') },
    { ziel: 'stand', name: t('stand.knopf') },
    { ziel: 'klassenarbeit', name: t('ka.knopf') },
  ]);

  const fuerErwachsene = $derived<{ ziel: Ziel; name: string }[]>([
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

  <h3 class="zone">{t('mehr.fuer-dich')}</h3>
  <ul class="liste">
    {#each fuerDich as e (e.ziel)}
      <li>
        <button onclick={() => onziel(e.ziel)}>
          {#if e.ziel === 'stand'}<Symbol name="stand" />
          {:else if e.ziel === 'themen'}<Symbol name="ueben" />{/if}
          <span>{e.name}</span>
        </button>
      </li>
    {/each}
  </ul>

  <div class="erwachsen">
    <h3 class="zone">{t('mehr.fuer-erwachsene')}</h3>
    <p class="leise klein">{t('mehr.fuer-erwachsene-info')}</p>
    <ul class="liste">
      {#each fuerErwachsene as e (e.ziel)}
        <li>
          <button class="nüchtern" onclick={() => onziel(e.ziel)}>
            <span>{e.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>

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
  .zone {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--farbe-text);
  }
  .leise {
    color: var(--farbe-text-leise);
    margin: 0;
  }
  .klein {
    font-size: 0.9rem;
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
  .erwachsen {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    border: 2px dashed var(--farbe-rand);
    background: var(--farbe-flaeche-leise);
  }
  .erwachsen .nüchtern {
    box-shadow: none;
    background: var(--farbe-flaeche);
    font-weight: 600;
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
