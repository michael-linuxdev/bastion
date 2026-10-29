<script lang="ts" module>
  export type Bereich = 'start' | 'ueben' | 'bastion' | 'mehr';
</script>

<script lang="ts">
  // Leiste unten (GRAFIK §1): Start, Üben, Bastion, Mehr – immer sichtbar,
  // der aktuelle Bereich ist hervorgehoben. Ohne Basebau fehlt die Bastion (R7).
  import Symbol from '../grafik/Symbol.svelte';
  import { tt } from '../bastion/thema.svelte';
  import { t } from '../texte/texte';

  let {
    aktuell,
    basebau,
    onwahl,
  }: {
    aktuell: Bereich | undefined;
    basebau: boolean;
    onwahl: (b: Bereich) => void;
  } = $props();

  const bereiche = $derived<Bereich[]>(
    basebau ? ['start', 'ueben', 'bastion', 'mehr'] : ['start', 'ueben', 'mehr'],
  );
  const name = (b: Bereich) =>
    b === 'start'
      ? t('leiste.start')
      : b === 'ueben'
        ? t('start.ueben')
        : b === 'bastion'
          ? tt('bastion.knopf')
          : t('leiste.mehr');
</script>

<nav class="leiste" aria-label={t('leiste.name')}>
  {#each bereiche as b (b)}
    <button
      class:aktiv={aktuell === b}
      aria-current={aktuell === b ? 'page' : undefined}
      onclick={() => onwahl(b)}
    >
      <Symbol name={b} />
      <span>{name(b)}</span>
    </button>
  {/each}
</nav>

<style>
  .leiste {
    position: fixed;
    inset-inline: 0;
    inset-block-end: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    gap: var(--abstand-s);
    padding-block: var(--abstand-s) max(var(--abstand-s), env(safe-area-inset-bottom));
    padding-inline: var(--abstand-s);
    background: var(--farbe-flaeche);
    box-shadow: 0 -2px 12px var(--farbe-schatten);
  }

  button {
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 700;
    flex: 1;
    max-inline-size: 7rem;
    min-block-size: var(--ziel);
    display: grid;
    justify-items: center;
    gap: 0.125rem;
    padding-block: 0.375rem;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--farbe-text-leise);
    cursor: pointer;
  }

  .aktiv {
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-akzent);
  }
</style>
