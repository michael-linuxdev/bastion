<script lang="ts">
  // Wahl der Klassenstufe – gemeinsam für Übersicht, „Mein Stand“ und Diagnose.
  // Mit `mitSchulart` auch die freiwillige Schulart (L-9, L-12).
  import { t } from '../texte/texte';
  import { KLASSEN } from './klassen';

  let {
    klasse = $bindable(5),
    schulart = $bindable(undefined),
    mitSchulart = false,
  }: {
    klasse?: number;
    schulart?: 'oberschule' | 'gymnasium' | undefined;
    mitSchulart?: boolean;
  } = $props();

  /** „keine Angabe“ als leerer Wert im Formular */
  let schulartFeld = $derived(schulart ?? '');
  const SCHULARTEN = ['', 'oberschule', 'gymnasium'] as const;
</script>

<fieldset class="klasse">
  <legend>{t('klasse.ueberschrift')}</legend>
  {#each KLASSEN as k (k)}
    <label><input type="radio" value={k} bind:group={klasse} /> {t('klasse.name')} {k}</label>
  {/each}
</fieldset>
{#if mitSchulart}
  <fieldset class="klasse">
    <legend>{t('klasse.schulart')}</legend>
    {#each SCHULARTEN as s (s)}
      <label
        ><input
          type="radio"
          name="schulart"
          value={s}
          checked={schulartFeld === s}
          onchange={() => (schulart = s === '' ? undefined : s)}
        />
        {t(
          s === ''
            ? 'klasse.schulart-keine'
            : s === 'oberschule'
              ? 'klasse.oberschule'
              : 'klasse.gymnasium',
        )}</label
      >
    {/each}
  </fieldset>
{/if}

<style>
  .klasse {
    display: flex;
    flex-wrap: wrap;
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
