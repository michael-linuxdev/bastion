<script lang="ts">
  // Angebot vor dem ersten Üben einer neuen Kompetenz (VERMITTLUNG §2.4):
  // erst erklären lassen oder gleich üben – nie erzwungen.
  import { t } from '../texte/texte';
  import ZurueckKnopf from '../start/ZurueckKnopf.svelte';

  let {
    titel,
    kann,
    voraussetzungen = [],
    dauer,
    onja,
    onnein,
    onzurueck,
  }: {
    titel: string;
    /** „Ich kann …“-Satz der Kompetenz (D2: steht nicht mehr in der Themenwahl) */
    kann?: string;
    /** Namen der Themen, auf denen dieses aufbaut (B3: statt der Steinkette in der Liste) */
    voraussetzungen?: readonly string[];
    /** Minuten laut Sequenz */
    dauer: number | undefined;
    onja: () => void;
    onnein: () => void;
    onzurueck: () => void;
  } = $props();
</script>

<section class="angebot">
  <ZurueckKnopf onclick={onzurueck} />
  <article class="karte">
    <h2>{titel}</h2>
    {#if kann}<p class="kann">{kann}</p>{/if}
    {#if voraussetzungen.length > 0}
      <p class="leise">{t('vermittlung.angebot.voraussetzungen')} {voraussetzungen.join(', ')}</p>
    {/if}
    <p class="neu">{t('vermittlung.angebot.neu')} {t('vermittlung.angebot.frage')}</p>
    {#if dauer}
      <p class="leise">
        {t('vermittlung.angebot.dauer')}
        {dauer}
        {t('vermittlung.angebot.minuten')}
      </p>
    {/if}
    <div class="knoepfe">
      <button class="haupt" onclick={onja}>{t('vermittlung.angebot.ja')}</button>
      <button class="zweit" onclick={onnein}>{t('vermittlung.angebot.nein')}</button>
    </div>
    <p class="leise">{t('vermittlung.angebot.spaeter')}</p>
  </article>
</section>

<style>
  .angebot {
    display: grid;
    gap: var(--abstand-m);
  }

  .karte {
    display: grid;
    gap: var(--abstand-m);
    background: var(--farbe-flaeche);
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    padding: var(--abstand-m);
  }

  .karte > :global(*) {
    margin-block: 0;
  }

  h2 {
    font-size: 1.375rem;
  }

  .neu {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .kann {
    color: var(--farbe-text);
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .knoepfe .haupt {
    padding-inline: var(--abstand-l);
  }
</style>
