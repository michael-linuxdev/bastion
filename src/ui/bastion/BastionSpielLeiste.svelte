<script lang="ts">
  /**
   * Spiel-HUD auf dem Bastion-Reiter: Beutel (Vorrat) + Knopf zum Bauen/Planen.
   * Impuls nur beim Übergang aus dem Üben (M72); Innenansicht auf Wunsch (P88).
   */
  import { onMount } from 'svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import { menge, tt } from './thema.svelte';
  import type { Konto } from '../../core/ledger/buchung';
  import { t } from '../texte/texte';

  let {
    konto,
    vorrat,
    testRohstoffe = false,
    bauOffen = $bindable(false),
    ausUeben = false,
  }: {
    konto: Konto;
    vorrat: number;
    /** Eltern/Test: ∞ statt Zahlen */
    testRohstoffe?: boolean;
    bauOffen?: boolean;
    /** Einmaliger Beutel-Impuls nach Üben → Bastion */
    ausUeben?: boolean;
  } = $props();

  let beutelOffen = $state(false);
  let impuls = $state(false);

  onMount(() => {
    if (!ausUeben) return;
    impuls = true;
    beutelOffen = true;
    const tId = window.setTimeout(() => {
      impuls = false;
    }, 1600);
    return () => window.clearTimeout(tId);
  });
</script>

<div class="spiel" aria-label={tt('bastion.vorrat-kurz')}>
  <button
    class="beutel"
    class:impuls
    aria-expanded={beutelOffen}
    aria-controls="bastion-beutel-innen"
    aria-label={beutelOffen ? t('bastion.beutel-schliessen') : t('bastion.beutel')}
    onclick={() => (beutelOffen = !beutelOffen)}
  >
    <Symbol name="beutel" />
  </button>
  {#if beutelOffen}
    <div
      id="bastion-beutel-innen"
      class="innen"
      role="region"
      aria-label={t('bastion.beutel-innen')}
    >
      <p class="innen-titel">{t('bastion.beutel-innen')}</p>
      <ul class="chips">
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
    </div>
  {:else}
    <ul class="chips kompakt" aria-hidden="true">
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
  {/if}
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

  .beutel {
    font: inherit;
    display: grid;
    place-items: center;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    color: var(--farbe-akzent);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    cursor: pointer;
    flex-shrink: 0;
  }

  .beutel.impuls {
    animation: beutel-impuls 1.4s ease-out 1;
  }

  .beutel :global(svg) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }

  .innen {
    display: grid;
    gap: 0.2rem;
    padding: 0.35rem 0.5rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 94%, transparent);
    box-shadow: 0 1px 6px var(--farbe-schatten);
    min-inline-size: 0;
    max-inline-size: 100%;
  }

  .innen-titel {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
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

  .chips.kompakt {
    padding: 0.3rem 0.45rem;
  }

  .innen .chips {
    padding: 0;
    box-shadow: none;
    background: transparent;
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

  @keyframes beutel-impuls {
    0% {
      transform: scale(1);
    }
    35% {
      transform: scale(1.12);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .beutel.impuls {
      animation: none;
    }
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
