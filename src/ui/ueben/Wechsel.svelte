<script lang="ts">
  // Wechsel begleiten (LEHRPLAN L-12): nach übersprungenen Klassen gezielt die
  // Lücken daraus prüfen, nach einem Schulartwechsel die früher drankommenden
  // Themen. Freundlich, ohne Druck –
  // „Nicht jetzt“ schließt den Hinweis. Zurückstellen (Sitzenbleiben) zeigt nichts.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { KompetenzStand } from '../../core/learning/fortschritt';
  import {
    klassenLuecken,
    schulartLuecken,
    type WechselHinweis,
  } from '../../core/learning/wechsel';
  import { t } from '../texte/texte';

  let {
    hinweis,
    kompetenzen,
    staende,
    onauswahl,
    onschliessen,
  }: {
    hinweis: WechselHinweis;
    kompetenzen: readonly Kompetenz[];
    staende: readonly KompetenzStand[];
    onauswahl: (kompetenzen: readonly string[]) => void;
    onschliessen: () => void;
  } = $props();

  const luecken = $derived(
    hinweis.art === 'schulart'
      ? schulartLuecken(kompetenzen, staende, hinweis.alt, hinweis.neu, hinweis.klasse)
      : [],
  );
  /** Offene Themen aus den übersprungenen Klassen, je Klasse (L-12) */
  const klassenOffen = $derived.by(() => {
    if (hinweis.art !== 'klassen') return [];
    const offen = klassenLuecken(kompetenzen, staende, hinweis.klassen, hinweis.schulart);
    return hinweis.klassen
      .map((klasse) => ({
        klasse,
        themen: offen.filter((x) => x.klasse === klasse).map((x) => x.kompetenz),
      }))
      .filter((g) => g.themen.length > 0);
  });
</script>

{#if klassenOffen.length > 0 || luecken.length > 0}
  <aside class="wechsel" aria-labelledby="wechsel-titel">
    {#if hinweis.art === 'klassen'}
      <h3 id="wechsel-titel">{t('wechsel.klassen-titel')}</h3>
      <p>{t('wechsel.klassen-text')}</p>
      {#each klassenOffen as g (g.klasse)}
        <details>
          <summary>
            {`${t('wechsel.aus-klasse')} ${g.klasse}: ${g.themen.length} ${t('wechsel.themen-offen')}`}
          </summary>
          <ul>
            {#each g.themen as k (k.id)}<li>{k.titel.de}</li>{/each}
          </ul>
        </details>
      {/each}
      <p class="knoepfe">
        <button
          class="haupt"
          onclick={() => onauswahl(klassenOffen.flatMap((g) => g.themen.map((k) => k.id)))}
          >{t('wechsel.luecken-pruefen')}</button
        >
        <button class="zweit" onclick={onschliessen}>{t('wechsel.nicht-jetzt')}</button>
      </p>
    {:else}
      <h3 id="wechsel-titel">{t('wechsel.schulart-titel')}</h3>
      <p>{t('wechsel.schulart-text')}</p>
      <ul>
        {#each luecken as k (k.id)}<li>{k.titel.de}</li>{/each}
      </ul>
      <p class="knoepfe">
        <button class="haupt" onclick={() => onauswahl(luecken.map((k) => k.id))}
          >{t('wechsel.kurz-pruefen')}</button
        >
        <button class="zweit" onclick={onschliessen}>{t('wechsel.nicht-jetzt')}</button>
      </p>
    {/if}
  </aside>
{/if}

<style>
  /* C4 (Q-O1): Karte unter der Überschrift der Themenwahl, Klappzeile 44 px, zwei klare Knöpfe */
  .wechsel {
    display: grid;
    gap: var(--abstand-s);
    border-radius: var(--radius-karte);
    padding: var(--abstand-m);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
  }
  .wechsel h3,
  .wechsel p,
  .wechsel ul {
    margin-block: 0;
  }
  summary {
    min-block-size: var(--ziel);
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 700;
  }
  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }
</style>
