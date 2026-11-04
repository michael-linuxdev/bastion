<script lang="ts">
  // Wahl der Klassenstufe – gemeinsam für Übersicht, „Mein Stand“ und Diagnose.
  // Mit `mitSchulart` auch die freiwillige Schulart (L-9, L-12) und in Jahrgang 11/12 am
  // Gymnasium den freiwilligen Kurs (B9b).
  import { t } from '../texte/texte';
  import { KLASSEN, OBERSTUFE } from './klassen';

  let {
    klasse = $bindable(5),
    schulart = $bindable(undefined),
    kurs = $bindable(undefined),
    mitSchulart = false,
  }: {
    klasse?: number;
    schulart?: 'oberschule' | 'gymnasium' | undefined;
    kurs?: 'gk' | 'lk' | undefined;
    mitSchulart?: boolean;
  } = $props();

  /** „keine Angabe“ als leerer Wert im Formular */
  let schulartFeld = $derived(schulart ?? '');
  let kursFeld = $derived(kurs ?? '');
  const SCHULARTEN = ['', 'oberschule', 'gymnasium'] as const;
  const KURSE = ['', 'gk', 'lk'] as const;
</script>

<fieldset class="klasse">
  <legend>{t('klasse.ueberschrift')}</legend>
  {#each KLASSEN as k (k)}
    <label
      ><input type="radio" value={k} bind:group={klasse} />
      {k === OBERSTUFE ? t('klasse.oberstufe') : `${t('klasse.name')} ${k}`}</label
    >
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
  {#if klasse === OBERSTUFE && schulart === 'oberschule'}
    <p class="hinweis">{t('klasse.oberstufe-gymnasium')}</p>
  {:else if klasse === OBERSTUFE}
    <fieldset class="klasse">
      <legend>{t('klasse.kurs')}</legend>
      {#each KURSE as k (k)}
        <label
          ><input
            type="radio"
            name="kurs"
            value={k}
            checked={kursFeld === k}
            onchange={() => (kurs = k === '' ? undefined : k)}
          />
          {t(k === '' ? 'klasse.kurs-keine' : k === 'gk' ? 'klasse.gk' : 'klasse.lk')}</label
        >
      {/each}
    </fieldset>
  {/if}
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

  .hinweis {
    margin: 0;
    color: var(--farbe-text-leise);
  }
</style>
