<script lang="ts">
  // Schuljahreswechsel (LEHRPLAN L-17): einmal je Schuljahr ab 1. August fragen.
  // Vorschlag Klasse + 1; dieselbe Klasse zu wählen ist ohne Kommentar möglich.
  import { t } from '../texte/texte';
  import { KLASSEN } from './klassen';

  let { vorschlag, onbestaetigen }: { vorschlag: number; onbestaetigen: (klasse: number) => void } =
    $props();

  let wahl = $derived(vorschlag);
</script>

<section class="schuljahr" aria-labelledby="schuljahr-titel">
  <h3 id="schuljahr-titel">{t('schuljahr.titel')}</h3>
  <fieldset>
    <legend>{t('schuljahr.frage')}</legend>
    {#each KLASSEN as k (k)}
      <label><input type="radio" value={k} bind:group={wahl} /> {t('klasse.name')} {k}</label>
    {/each}
  </fieldset>
  <p class="leise">{t('schuljahr.hinweis')}</p>
  <button class="haupt" onclick={() => onbestaetigen(wahl)}>{t('schuljahr.bestaetigen')}</button>
</section>

<style>
  .schuljahr {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-m);
    margin-block: var(--abstand-m);
    background: var(--farbe-flaeche);
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-m);
    border: none;
    padding: 0;
  }
  label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }
</style>
