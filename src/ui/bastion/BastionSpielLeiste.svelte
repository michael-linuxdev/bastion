<script lang="ts">
  /**
   * Spiel-HUD auf dem Bastion-Reiter: kompakter Vorrat + Knopf zum Bauen/Planen.
   * Liegt in der gemeinsamen oberen Chrome (kein eigenes Absolute).
   */
  import Symbol from '../grafik/Symbol.svelte';
  import { menge, tt } from './thema.svelte';
  import type { Konto } from '../../core/ledger/buchung';

  let {
    konto,
    vorrat,
    bauOffen = $bindable(false),
  }: {
    konto: Konto;
    vorrat: number;
    bauOffen?: boolean;
  } = $props();
</script>

<div class="spiel" aria-label={tt('bastion.vorrat-kurz')}>
  <ul class="chips">
    {#each [['fleiss', 'ueben'], ['behalten', 'wiederholen'], ['koennen', 'diagnose']] as const as [r, symbol] (r)}
      <li>
        <Symbol name={symbol} />
        <span>{menge(r, konto.stand[r])}</span>
      </li>
    {/each}
    <li>
      <Symbol name="bastion" />
      <span><strong>{vorrat}</strong></span>
    </li>
  </ul>
  <button
    class="bauen"
    aria-expanded={bauOffen}
    aria-controls="bastion-bau-blatt"
    onclick={() => (bauOffen = !bauOffen)}
  >
    {bauOffen ? tt('bastion.bauen-schliessen') : tt('bastion.bauen-oeffnen')}
  </button>
</div>

<style>
  .spiel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
    flex: 1 1 12rem;
    min-inline-size: 0;
  }

  .chips {
    list-style: none;
    margin: 0;
    padding: 0.35rem 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.65rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 90%, transparent);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    min-inline-size: 0;
  }

  .chips li {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--farbe-akzent);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .chips span {
    color: var(--farbe-text);
  }

  .chips :global(svg) {
    inline-size: 1.1rem;
    block-size: 1.1rem;
  }

  .bauen {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    color: inherit;
    cursor: pointer;
    box-shadow: 0 1px 4px var(--farbe-schatten);
    flex-shrink: 0;
  }
</style>
