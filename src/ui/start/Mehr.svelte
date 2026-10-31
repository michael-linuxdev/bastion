<script lang="ts">
  // „Mehr“: zwei Zonen – Für dich / Für Erwachsene (§T102–§T104). Keine Suche.
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

  const fuerDich = $derived<{ ziel: Ziel; name: string; symbol?: 'stand' | 'ueben' }[]>([
    { ziel: 'themen', name: t('mehr.themen'), symbol: 'ueben' },
    { ziel: 'stand', name: t('stand.knopf'), symbol: 'stand' },
    { ziel: 'klassenarbeit', name: t('ka.knopf') },
    { ziel: 'profil', name: t('profil.knopf') },
    { ziel: 'sicherung', name: t('sicherung.knopf') },
  ]);

  const fuerErwachsene = $derived<{ ziel: Ziel; name: string }[]>(
    eltern ? [{ ziel: 'eltern', name: t('eltern.knopf') }] : [],
  );
</script>

<section class="mehr">
  <button class="zurueck" onclick={() => onziel('start')}>← {t('uebung.zurueck')}</button>
  <p class="marke">{t('start.ueberschrift')}</p>
  <h2>{t('mehr.ueberschrift')}</h2>
  <p class="leise">{t('mehr.info')}</p>

  <section class="zone" aria-labelledby="mehr-dich">
    <h3 id="mehr-dich">{t('mehr.fuer-dich')}</h3>
    <ul class="liste">
      {#each fuerDich as e (e.ziel)}
        <li>
          <button onclick={() => onziel(e.ziel)}>
            {#if e.symbol === 'stand'}<Symbol name="stand" />
            {:else if e.symbol === 'ueben'}<Symbol name="ueben" />{/if}
            <span>{e.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <section class="zone erwachsene" aria-labelledby="mehr-erwachsene">
    <h3 id="mehr-erwachsene">{t('mehr.fuer-erwachsene')}</h3>
    {#if fuerErwachsene.length > 0}
      <ul class="liste">
        {#each fuerErwachsene as e (e.ziel)}
          <li>
            <button onclick={() => onziel(e.ziel)}>
              <span>{e.name}</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="leise">{t('mehr.erwachsene-leer')}</p>
    {/if}
    <!-- §T104: Versions-/Build-Info nur hier -->
    <p class="version" role="note">{t('mehr.version')}</p>
  </section>

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
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
  }
  .leise {
    color: var(--farbe-text-leise);
    margin: 0;
  }
  .zone {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 1px 6px var(--farbe-schatten);
  }
  .zone.erwachsene {
    background: var(--farbe-flaeche-leise);
    box-shadow: none;
    border: 1px dashed var(--farbe-rand);
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
    box-shadow: 0 1px 4px var(--farbe-schatten);
    color: var(--farbe-text);
    text-align: start;
    cursor: pointer;
  }
  .erwachsene button:not(.zurueck) {
    background: var(--farbe-flaeche);
  }
  .version {
    margin: 0;
    font-size: 0.85rem;
    color: var(--farbe-text-leise);
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
