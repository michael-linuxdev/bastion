<script lang="ts">
  // Zahlenstrahl (zahlenstrahl@1): zeigt eine Stelle oder lässt sie antippen.
  // Jeder Strich ist ein Knopf; die gewählte Stelle wird als Bruch gemeldet.
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import { stelle, striche, type StrahlParameter } from './zahlenstrahl';

  let {
    parameter,
    interaktiv = false,
    onzustand,
  }: {
    parameter: StrahlParameter;
    interaktiv?: boolean;
    /** gewählte Stelle als Zähler bezogen auf die Einteilung */
    onzustand?: (zaehler: number) => void;
  } = $props();

  const einteilung = $derived(
    Number.isInteger(parameter.einteilung) && (parameter.einteilung ?? 0) > 0
      ? (parameter.einteilung ?? 1)
      : 1,
  );
  const liste = $derived(striche(parameter));
  let markiert = $state<number | undefined>(untrack(() => parameter.markiert));
  const beschreibung = $derived(
    `${t('werkzeug.zahlenstrahl.name')} ${t('werkzeug.zahlenstrahl.von')} ${parameter.von ?? 0} ` +
      `${t('werkzeug.zahlenstrahl.bis')} ${parameter.bis ?? 1}` +
      (markiert !== undefined
        ? `, ${t('werkzeug.zahlenstrahl.markiert')} ${stelle(markiert, einteilung)}`
        : ''),
  );
</script>

<div class="strahl" role={interaktiv ? 'group' : 'img'} aria-label={beschreibung}>
  <span class="achse" aria-hidden="true"></span>
  {#each liste as s (s.zaehler)}
    {#if interaktiv}
      <button
        class="strich"
        class:ganz={s.ganz}
        class:markiert={markiert === s.zaehler}
        style:inset-inline-start="{s.lage * 100}%"
        aria-pressed={markiert === s.zaehler}
        aria-label={stelle(s.zaehler, einteilung)}
        onclick={() => {
          markiert = s.zaehler;
          onzustand?.(s.zaehler);
        }}
      ></button>
    {:else}
      <span
        class="strich"
        class:ganz={s.ganz}
        class:markiert={markiert === s.zaehler}
        style:inset-inline-start="{s.lage * 100}%"
      ></span>
    {/if}
    {#if s.ganz}
      <span class="zahl" style:inset-inline-start="{s.lage * 100}%" aria-hidden="true"
        >{stelle(s.zaehler, einteilung)}</span
      >
    {/if}
  {/each}
</div>
{#if interaktiv}
  <p class="stand" role="status">
    {markiert === undefined
      ? t('werkzeug.zahlenstrahl.tippen')
      : `${t('werkzeug.zahlenstrahl.markiert')} ${stelle(markiert, einteilung)}`}
  </p>
{/if}

<style>
  .strahl {
    position: relative;
    block-size: 4.5rem;
    max-inline-size: 28rem;
    margin-inline: var(--abstand-m);
    margin-block: var(--abstand-s);
  }

  .achse {
    position: absolute;
    inset-inline: -0.75rem;
    inset-block-start: 1.5rem;
    border-block-start: 3px solid var(--farbe-text);
  }

  .strich {
    position: absolute;
    inset-block-start: 1rem;
    inline-size: 2px;
    block-size: 1.1rem;
    margin-inline-start: -1px;
    padding: 0;
    border: none;
    background: var(--farbe-text);
  }

  .strich.ganz {
    inset-block-start: 0.6rem;
    block-size: 1.9rem;
    inline-size: 3px;
  }

  button.strich {
    cursor: pointer;
    background-clip: content-box;
    padding-inline: 0.6rem;
    margin-inline-start: -0.65rem;
    inline-size: calc(2px + 1.2rem);
    block-size: 2.2rem;
    inset-block-start: 0.4rem;
    background-color: var(--farbe-text);
  }

  .strich.markiert {
    background-color: var(--farbe-akzent-warm);
    inline-size: 6px;
  }

  button.strich.markiert {
    inline-size: calc(6px + 1.2rem);
  }

  .zahl {
    position: absolute;
    inset-block-start: 2.8rem;
    translate: -50% 0;
    font-weight: 700;
  }

  .stand {
    margin: 0;
    color: var(--farbe-text-leise);
  }
</style>
