<script lang="ts">
  // O11: ein Zurück-Knopf für die Seiten außerhalb des Lernpfads – mit Symbol, rundem Hover,
  // großem Tipp-Ziel. Seitenkopf nutzt ihn, ebenso Mein Stand, Wo stehe ich?, Klassenarbeit
  // und Fehlerwerkstatt (in App.svelte).
  import Symbol from '../grafik/Symbol.svelte';
  import { t } from '../texte/texte';

  let { onclick }: { onclick: () => void } = $props();
</script>

<!-- O15: data-zurueck – die Zurück-Taste des Geräts drückt genau diesen Knopf (App.svelte) -->
<button type="button" class="zurueck" data-zurueck {onclick}>
  <Symbol name="zurueck" />
  {t('uebung.zurueck')}
</button>

<style>
  .zurueck {
    font: inherit;
    font-weight: 700;
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: var(--ziel);
    padding-inline: 0.75rem 1rem;
    margin-inline-start: -0.75rem;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
  }
  /* O20: Hover nur mit Maus – am Handy blieb die Fläche nach dem Antippen stehen */
  @media (hover: hover) {
    .zurueck:hover {
      background: var(--farbe-flaeche-leise);
    }
  }
  .zurueck :global(svg) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }
</style>
