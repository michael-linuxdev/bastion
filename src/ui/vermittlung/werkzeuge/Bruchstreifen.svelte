<script lang="ts">
  // Bruchstreifen (bruchstreifen@1): zeigt einen Anteil oder lässt ihn herstellen.
  // Bedienung ohne Ziehen: Teile sind Knöpfe, dazu Knöpfe für die Einteilung (VERMITTLUNG §2.3).
  import { untrack } from 'svelte';
  import { t } from '../../texte/texte';
  import {
    anzahlGefaerbt,
    breiten,
    geteilt,
    startzustand,
    umgeschaltet,
    verfeinert,
    MAX_TEILE,
    type StreifenParameter,
    type StreifenZustand,
  } from './bruchstreifen';

  let {
    parameter,
    interaktiv = false,
    onzustand,
  }: {
    parameter: StreifenParameter;
    interaktiv?: boolean;
    onzustand?: (z: StreifenZustand) => void;
  } = $props();

  let zustand = $state<StreifenZustand>(untrack(() => startzustand(parameter)));
  const anteile = $derived(breiten(zustand.teile, parameter.ungleich === true));
  const beschreibung = $derived(
    `${anzahlGefaerbt(zustand)} ${t('werkzeug.von')} ${zustand.teile} ${t(zustand.teile === 1 ? 'werkzeug.streifen.teil-gefaerbt' : 'werkzeug.streifen.teilen-gefaerbt')}` +
      (parameter.ungleich ? ` ${t('werkzeug.streifen.ungleich')}` : ''),
  );

  function setze(z: StreifenZustand) {
    zustand = z;
    onzustand?.(z);
  }
</script>

<div class="streifen-werkzeug">
  {#if interaktiv}
    <div class="streifen" role="group" aria-label={t('werkzeug.streifen.name')}>
      {#each zustand.gefaerbt as g, i (i)}
        <button
          class="teil"
          class:gefaerbt={g}
          style:flex-grow={anteile[i]}
          aria-pressed={g}
          aria-label="{t('werkzeug.streifen.teil')} {i + 1}"
          onclick={() => setze(umgeschaltet(zustand, i))}
        ></button>
      {/each}
    </div>
    <p class="steuerung">
      {#if parameter.verfeinern}
        <button
          class="zweit"
          disabled={zustand.teile * 2 > MAX_TEILE}
          onclick={() => setze(verfeinert(zustand))}>{t('werkzeug.streifen.halbieren')}</button
        >
      {:else}
        <button
          class="zweit"
          aria-label={t('werkzeug.streifen.weniger')}
          disabled={zustand.teile <= 1}
          onclick={() => setze(geteilt(zustand, zustand.teile - 1))}>−</button
        >
        <span
          >{zustand.teile}
          {t(zustand.teile === 1 ? 'werkzeug.streifen.teil' : 'werkzeug.streifen.teile')}</span
        >
        <button
          class="zweit"
          aria-label={t('werkzeug.streifen.mehr')}
          disabled={zustand.teile >= MAX_TEILE}
          onclick={() => setze(geteilt(zustand, zustand.teile + 1))}>+</button
        >
      {/if}
    </p>
    <p class="stand" role="status">{beschreibung}</p>
  {:else}
    <div class="streifen" role="img" aria-label={beschreibung}>
      {#each zustand.gefaerbt as g, i (i)}
        <span class="teil" class:gefaerbt={g} style:flex-grow={anteile[i]}></span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .streifen-werkzeug {
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-s);
  }

  .streifen {
    display: flex;
    block-size: 3rem;
    max-inline-size: 28rem;
    border: 3px solid var(--farbe-text);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .teil {
    flex-basis: 0;
    min-inline-size: 0;
    padding: 0;
    border: none;
    border-inline-end: 2px solid var(--farbe-text);
    background: var(--farbe-flaeche);
    font: inherit;
  }

  .teil:last-child {
    border-inline-end: none;
  }

  button.teil {
    cursor: pointer;
    min-block-size: var(--ziel);
  }

  .teil.gefaerbt {
    background: var(--farbe-akzent-warm);
  }

  .steuerung {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    margin: 0;
  }

  .stand {
    margin: 0;
    color: var(--farbe-text-leise);
  }
</style>
