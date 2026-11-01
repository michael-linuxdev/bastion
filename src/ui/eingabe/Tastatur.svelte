<script lang="ts">
  // Eigene Tastatur für Zahlen und Terme (INHALTSFORMAT §5.2). Schreibt in das zuletzt
  // angetippte Feld des umgebenden Formulars, das `data-tastatur` trägt („feld“, „zaehler“
  // oder „nenner“). Die Felder haben inputmode="none", damit auf dem Handy nicht zusätzlich
  // die Systemtastatur aufgeht; am Rechner tippt man weiter mit der echten Tastatur.
  import type { Tastensatz } from '../../core/learning/tastatur';
  import { t } from '../texte/texte';

  let { tasten, gesperrt = false }: { tasten: Tastensatz; gesperrt?: boolean } = $props();

  let huelle = $state<HTMLElement | undefined>(undefined);
  let zuletzt: HTMLInputElement | undefined;

  const felder = (): HTMLInputElement[] => [
    ...(huelle?.closest('form')?.querySelectorAll<HTMLInputElement>('input[data-tastatur]') ?? []),
  ];

  $effect(() => {
    const form = huelle?.closest('form');
    if (!form) return;
    const merken = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.dataset['tastatur']) zuletzt = e.target;
    };
    form.addEventListener('focusin', merken);
    return () => form.removeEventListener('focusin', merken);
  });

  /** Das Feld, in das geschrieben wird: zuletzt angetippt, sonst das erste leere, sonst das erste */
  function ziel(): HTMLInputElement | undefined {
    const alle = felder().filter((f) => !f.disabled);
    if (zuletzt && alle.includes(zuletzt)) return zuletzt;
    return alle.find((f) => f.value === '') ?? alle[0];
  }

  function melden(feld: HTMLInputElement, wert: string, stelle: number) {
    feld.value = wert;
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    feld.focus();
    feld.setSelectionRange(stelle, stelle);
    zuletzt = feld;
  }

  function einfuegen(text: string) {
    const feld = ziel();
    if (!feld) return;
    const anfang = feld.selectionStart ?? feld.value.length;
    const ende = feld.selectionEnd ?? anfang;
    melden(feld, feld.value.slice(0, anfang) + text + feld.value.slice(ende), anfang + text.length);
  }

  function loeschen() {
    const feld = ziel();
    if (!feld) return;
    const anfang = feld.selectionStart ?? feld.value.length;
    const ende = feld.selectionEnd ?? anfang;
    const von = anfang === ende ? Math.max(0, anfang - 1) : anfang;
    melden(feld, feld.value.slice(0, von) + feld.value.slice(ende), von);
  }

  /** Bruchstrich: vom Zähler in den Nenner springen; ohne Nennerfeld „/“ schreiben */
  function bruchstrich() {
    const feld = ziel();
    const nenner = felder().find((f) => f.dataset['tastatur'] === 'nenner');
    if (feld?.dataset['tastatur'] === 'zaehler' && nenner) {
      nenner.focus();
      zuletzt = nenner;
    } else einfuegen('/');
  }

  const ZIFFERN = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
</script>

<!-- Knöpfe nehmen dem Feld den Fokus nicht weg: pointerdown ohne Standardverhalten -->
<div
  class="tastatur"
  role="group"
  aria-label={t('tastatur.name')}
  bind:this={huelle}
  onpointerdown={(e) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) e.preventDefault();
  }}
>
  {#if tasten.ziffern}
    <div class="ziffern">
      {#each ZIFFERN as z (z)}
        <button type="button" disabled={gesperrt} onclick={() => einfuegen(z)}>{z}</button>
      {/each}
      {#if tasten.komma}
        <button
          type="button"
          disabled={gesperrt}
          aria-label={t('tastatur.komma')}
          onclick={() => einfuegen(',')}>,</button
        >
      {/if}
      <button type="button" class="null" disabled={gesperrt} onclick={() => einfuegen('0')}
        >0</button
      >
    </div>
  {/if}
  <div class="zusatz">
    <button type="button" disabled={gesperrt} aria-label={t('tastatur.loeschen')} onclick={loeschen}
      >⌫</button
    >
    {#if tasten.minus}
      <button
        type="button"
        disabled={gesperrt}
        aria-label={t('tastatur.minus')}
        onclick={() => einfuegen('−')}>−</button
      >
    {/if}
    {#if tasten.bruchstrich}
      <button
        type="button"
        disabled={gesperrt}
        aria-label={t('tastatur.bruchstrich')}
        onclick={bruchstrich}>/</button
      >
    {/if}
    {#each tasten.variablen as v (v)}
      <button type="button" class="wort" disabled={gesperrt} onclick={() => einfuegen(v)}
        >{v}</button
      >
    {/each}
    {#each tasten.einheiten as e (e)}
      <button type="button" class="wort" disabled={gesperrt} onclick={() => einfuegen(` ${e}`)}
        >{e}</button
      >
    {/each}
  </div>
</div>

<style>
  .tastatur {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    margin-block: 0;
    max-inline-size: 20rem;
  }

  .ziffern {
    display: grid;
    grid-template-columns: repeat(3, 3rem);
    gap: var(--abstand-s);
  }

  .null {
    grid-column: 2;
  }

  .zusatz {
    display: grid;
    grid-template-columns: repeat(auto-fill, 3rem);
    grid-auto-flow: row;
    align-content: start;
    gap: var(--abstand-s);
    inline-size: 3rem;
  }

  button {
    font: inherit;
    font-size: 1.25rem;
    font-variant-numeric: tabular-nums;
    min-block-size: 3rem;
    min-inline-size: 3rem;
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    cursor: pointer;
    touch-action: manipulation;
  }

  button.wort {
    font-size: 1rem;
  }

  button:focus-visible {
    outline: 3px solid var(--farbe-akzent);
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (pointer: fine) {
    button {
      min-block-size: 2.5rem;
      min-inline-size: 2.5rem;
    }

    .ziffern {
      grid-template-columns: repeat(3, 2.5rem);
    }
  }

  /* Querformat Üben: kompakte Tastatur, ohne unter den Prüfen-Knopf zu rutschen */
  @media (orientation: landscape) and (max-block-size: 30rem) {
    .tastatur {
      margin-block: 0.25rem;
      gap: 0.35rem;
      max-inline-size: none;
    }

    .ziffern {
      grid-template-columns: repeat(3, 2.5rem);
      gap: 0.35rem;
    }

    .zusatz {
      grid-template-columns: repeat(auto-fill, 2.5rem);
      inline-size: 2.5rem;
      gap: 0.35rem;
    }

    button {
      min-block-size: var(--ziel);
      min-inline-size: var(--ziel);
      font-size: 1.1rem;
    }
  }
</style>
