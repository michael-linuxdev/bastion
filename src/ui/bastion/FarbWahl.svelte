<script lang="ts">
  // Farbe für Zierde wählen (Schritt 2.14): Farbfelder als Auswahlknöpfe mit Namen.
  import { FARBEN, type Farbe } from '../../core/bastion/katalog';
  import { FARBWERT } from './farben';
  import { tt } from './thema.svelte';
  import type { TextSchluessel } from '../texte/texte';

  let {
    farbe,
    name,
    onwahl,
  }: { farbe: Farbe | undefined; name: string; onwahl: (f: Farbe) => void } = $props();
</script>

<fieldset class="farben">
  <legend>{tt('bastion.farbe')}</legend>
  {#each FARBEN as f (f)}
    <label title={tt(`farbe.${f}` as TextSchluessel)}>
      <input
        type="radio"
        {name}
        value={f}
        checked={farbe === f}
        onchange={() => onwahl(f)}
        aria-label={tt(`farbe.${f}` as TextSchluessel)}
      />
      <span class="feld" style:background={FARBWERT[f]}></span>
    </label>
  {/each}
</fieldset>

<style>
  .farben {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    border: none;
    padding: 0;
    margin: 0;
  }

  legend {
    font-size: 0.9rem;
    color: var(--farbe-text-leise);
    margin-block-end: var(--abstand-s);
  }

  label {
    position: relative;
    display: inline-flex;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .feld {
    inline-size: 2.75rem;
    block-size: 2.75rem;
    border-radius: 50%;
    border: 2px solid var(--farbe-rand);
  }

  input:checked + .feld {
    outline: 3px solid var(--farbe-akzent);
    outline-offset: 2px;
  }

  input:focus-visible + .feld {
    outline: 3px dashed var(--farbe-akzent);
    outline-offset: 2px;
  }
</style>
