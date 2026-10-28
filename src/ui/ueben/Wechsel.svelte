<script lang="ts">
  // Wechsel begleiten (LEHRPLAN L-12): nach übersprungenen Klassen oder einem
  // Schulartwechsel eine kurze Diagnose anbieten. Freundlich, ohne Druck –
  // „Nicht jetzt“ schließt den Hinweis. Zurückstellen (Sitzenbleiben) zeigt nichts.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { KompetenzStand } from '../../core/learning/fortschritt';
  import { schulartLuecken, type WechselHinweis } from '../../core/learning/wechsel';
  import { t } from '../texte/texte';

  let {
    hinweis,
    kompetenzen,
    staende,
    onklasse,
    onauswahl,
    onschliessen,
  }: {
    hinweis: WechselHinweis;
    kompetenzen: readonly Kompetenz[];
    staende: readonly KompetenzStand[];
    onklasse: (klasse: number) => void;
    onauswahl: (kompetenzen: readonly string[]) => void;
    onschliessen: () => void;
  } = $props();

  const luecken = $derived(
    hinweis.art === 'schulart'
      ? schulartLuecken(kompetenzen, staende, hinweis.alt, hinweis.neu, hinweis.klasse)
      : [],
  );
</script>

{#if hinweis.art === 'klassen' || luecken.length > 0}
  <aside class="wechsel" aria-labelledby="wechsel-titel">
    {#if hinweis.art === 'klassen'}
      <h3 id="wechsel-titel">{t('wechsel.klassen-titel')}</h3>
      <p>{t('wechsel.klassen-text')}</p>
      <p class="knoepfe">
        {#each hinweis.klassen as k (k)}
          <button class="zweit" onclick={() => onklasse(k)}
            >{t('wechsel.klasse-pruefen')} {k}</button
          >
        {/each}
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
