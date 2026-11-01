<script lang="ts">
  /**
   * Spiel-HUD: Vorrat wie Beutel/Truhe mit Material-Icons (Design B6).
   * Der Bauen-Knopf liegt als Werkzeug am Szenenrand (B7), nicht hier.
   * Design-Ideen K44: Vorrat-Chips einklappbar bei Überlauf / schmalem Platz.
   */
  import Symbol, { type SymbolName } from '../grafik/Symbol.svelte';
  import { menge, tt } from './thema.svelte';
  import type { Konto } from '../../core/ledger/buchung';
  import { t } from '../texte/texte';

  let {
    konto,
    vorrat,
    testRohstoffe = false,
  }: {
    konto: Konto;
    vorrat: number;
    /** Eltern/Test: ∞ statt Zahlen */
    testRohstoffe?: boolean;
  } = $props();

  let aufgeklappt = $state(false);

  const chips: readonly { r: 'fleiss' | 'behalten' | 'koennen'; symbol: SymbolName }[] = [
    { r: 'fleiss', symbol: 'stein' },
    { r: 'behalten', symbol: 'erz' },
    { r: 'koennen', symbol: 'bauplan' },
  ];
</script>

<div class="spiel" aria-label={tt('bastion.vorrat-kurz')}>
  <!-- §U105: Probe-Banner und Test-Vorrat gekoppelt -->
  {#if testRohstoffe}
    <p class="probe-banner" role="status">{t('bastion.probe-banner-an')}</p>
  {/if}
  <div class="vorrat">
    <ul class="chips" class:probe={testRohstoffe} class:kurz={!aufgeklappt}>
      <li class="beutel" aria-hidden="true"><Symbol name="beutel" /></li>
      {#each chips as { r, symbol } (r)}
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

  .probe-banner {
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
    padding: 0.35rem 0.55rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.55rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    box-shadow:
      0 1px 4px var(--farbe-schatten),
      0 0 0 1px color-mix(in srgb, var(--farbe-flaeche) 60%, transparent);
    backdrop-filter: blur(6px);
    min-inline-size: 0;
    max-inline-size: 100%;
  }

  .chips.kurz .extra {
    display: none;
  }

  .chips.probe {
    outline: 2px dashed color-mix(in srgb, var(--farbe-hinweis-rand) 70%, transparent);
    outline-offset: 1px;
  }

  .chips li {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    color: var(--farbe-akzent);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
    text-shadow: 0 1px 0 color-mix(in srgb, var(--farbe-flaeche) 80%, transparent);
  }

  .chips .beutel {
    color: var(--farbe-akzent-warm);
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

  @media (orientation: landscape) and (height < 30rem) {
    .chips {
      padding: 0.2rem 0.35rem;
      gap: 0.2rem 0.4rem;
    }

    .chips li {
      font-size: 0.75rem;
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
