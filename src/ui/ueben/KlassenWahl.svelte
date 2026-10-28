<script lang="ts">
  // Wahl der Klassenstufe – gemeinsam für Übersicht, „Mein Stand“ und Diagnose.
  import { t } from '../texte/texte';

  let { klasse = $bindable(5) }: { klasse?: number } = $props();

  /** Klassenstufen, für die es schon Aufgaben gibt (K-15: 5 und 6) */
  const KLASSEN = [5, 6] as const;
</script>

<fieldset class="klasse">
  <legend>{t('klasse.ueberschrift')}</legend>
  {#each KLASSEN as k (k)}
    <label><input type="radio" value={k} bind:group={klasse} /> {t('klasse.name')} {k}</label>
  {/each}
</fieldset>

<style>
  .klasse {
    display: flex;
    gap: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .klasse label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }
</style>
