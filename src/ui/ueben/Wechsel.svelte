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
          class="zweit"
          onclick={() => onauswahl(klassenOffen.flatMap((g) => g.themen.map((k) => k.id)))}
          >{t('wechsel.luecken-pruefen')}</button
        >
        <button class="leise-knopf" onclick={onschliessen}>{t('wechsel.nicht-jetzt')}</button>
      </p>
    {:else}
      <h3 id="wechsel-titel">{t('wechsel.schulart-titel')}</h3>
      <p>{t('wechsel.schulart-text')}</p>
      <ul>
        {#each luecken as k (k.id)}<li>{k.titel.de}</li>{/each}
      </ul>
      <p class="knoepfe">
        <button class="zweit" onclick={() => onauswahl(luecken.map((k) => k.id))}
          >{t('wechsel.kurz-pruefen')}</button
        >
        <button class="leise-knopf" onclick={onschliessen}>{t('wechsel.nicht-jetzt')}</button>
      </p>
    {/if}
  </aside>
{/if}

<style>
  .wechsel {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-m);
    margin-block: var(--abstand-m);
    background: var(--farbe-flaeche);
  }
  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }
  .leise-knopf {
    background: none;
    border: none;
    text-decoration: underline;
    color: var(--farbe-text-leise);
    min-block-size: 2.75rem;
  }
</style>
