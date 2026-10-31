<script lang="ts">
  /**
   * Spiel-HUD auf dem Bastion-Reiter: kompakter Vorrat + Knopf zum Bauen/Planen.
   * Liegt in der gemeinsamen oberen Chrome (kein eigenes Absolute).
   */
  import Symbol from '../grafik/Symbol.svelte';
  import { menge, tt } from './thema.svelte';
  import type { Konto } from '../../core/ledger/buchung';
  import { t } from '../texte/texte';

  let {
    konto,
    vorrat,
    testRohstoffe = false,
    bauOffen = $bindable(false),
  }: {
    konto: Konto;
    vorrat: number;
    /** Eltern/Test: ∞ statt Zahlen */
    testRohstoffe?: boolean;
    bauOffen?: boolean;
  } = $props();
</script>

<div class="spiel" aria-label={tt('bastion.vorrat-kurz')}>
  <!-- §U105: Probe-Banner und Test-Vorrat gekoppelt -->
  {#if testRohstoffe}
    <p class="probe" role="status">{t('bastion.probe-banner-an')}</p>
  {/if}
  <ul class="chips" class:probe-chips={testRohstoffe}>
    {#each [['fleiss', 'ueben'], ['behalten', 'wiederholen'], ['koennen', 'diagnose']] as const as [r, symbol] (r)}
      <li>
        <Symbol name={symbol} />
        <span>{testRohstoffe ? t('bastion.test-unendlich') : menge(r, konto.stand[r])}</span>
      </li>
    {/each}
    <li>
      <Symbol name="bastion" />
      <span><strong>{testRohstoffe ? t('bastion.test-unendlich') : vorrat}</strong></span>
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
    gap: 0.35rem 0.5rem;
    flex: 1 1 10rem;
    min-inline-size: 0;
    justify-content: center;
  }

  .probe {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 800;
    padding-block: 0.15rem;
    padding-inline: 0.45rem;
    border-radius: var(--radius);
    border: 1px dashed var(--farbe-akzent-warm);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    color: var(--farbe-text);
    white-space: nowrap;
  }

  .chips {
    list-style: none;
    margin: 0;
    padding: 0.3rem 0.45rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 90%, transparent);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    min-inline-size: 0;
    max-inline-size: 100%;
  }

  .chips.probe-chips {
    border: 1px dashed var(--farbe-akzent-warm);
  }

  .chips li {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    color: var(--farbe-akzent);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .chips span {
    color: var(--farbe-text);
  }

  .chips :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
    flex-shrink: 0;
  }

  .bauen {
    font: inherit;
    font-size: 0.9rem;
    min-block-size: 2.5rem;
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    color: inherit;
    cursor: pointer;
    box-shadow: 0 1px 4px var(--farbe-schatten);
    flex-shrink: 0;
  }

  @media (orientation: landscape) and (height < 30rem) {
    .chips {
      padding: 0.2rem 0.35rem;
      gap: 0.2rem 0.4rem;
    }

    .chips li {
      font-size: 0.75rem;
    }

    .bauen {
      min-block-size: 2.25rem;
      font-size: 0.85rem;
    }
  }
</style>
