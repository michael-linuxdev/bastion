<script lang="ts">
  /**
   * Spiel-HUD auf dem Bastion-Reiter: kompakter Vorrat + Knopf zum Bauen/Planen.
   * Design-Ideen K44: Vorrat-Chips einklappbar bei Überlauf / schmalem Platz.
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

  let aufgeklappt = $state(false);
</script>

<div class="spiel" aria-label={tt('bastion.vorrat-kurz')}>
  <div class="vorrat" class:eng={!aufgeklappt}>
    <ul class="chips" class:kurz={!aufgeklappt}>
      {#each [['fleiss', 'ueben'], ['behalten', 'wiederholen'], ['koennen', 'diagnose']] as const as [r, symbol] (r)}
        <li class:extra={r !== 'fleiss'}>
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
      type="button"
      class="klappen"
      aria-expanded={aufgeklappt}
      onclick={() => (aufgeklappt = !aufgeklappt)}
    >
      {aufgeklappt ? t('bastion.vorrat-weniger') : t('bastion.vorrat-mehr')}
    </button>
  </div>
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

  .vorrat {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    min-inline-size: 0;
    max-inline-size: 100%;
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

  .chips.kurz .extra {
    display: none;
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

  .klappen {
    font: inherit;
    font-size: 0.75rem;
    min-block-size: 2rem;
    padding-inline: 0.45rem;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--farbe-text-leise);
    text-decoration: underline;
    cursor: pointer;
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

  @media (width >= 40rem) {
    .chips.kurz .extra {
      display: flex;
    }

    .klappen {
      display: none;
    }
  }
</style>
