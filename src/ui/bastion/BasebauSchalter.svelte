<script lang="ts">
  // Basebau-Schalter (R7, BASEBAU B-13): ein- und ausschaltbar, ohne Nachteil.
  // Das Ledger bucht weiter (B-10) – beim Wiedereinschalten ist alles da.
  import { basebauSetzen } from '../plattform/ablage';
  import { tt } from './thema.svelte';

  let { an = $bindable(), durch }: { an: boolean; durch: 'jugendlich' | 'eltern' } = $props();
</script>

<label class="schalter">
  <input
    type="checkbox"
    checked={an}
    onchange={(e) => {
      an = e.currentTarget.checked;
      void basebauSetzen(an, durch);
    }}
  />
  {tt('basebau.schalter')}
</label>
<p class="leise">{tt('basebau.schalter-erklaerung')}</p>

<style>
  .schalter {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
  }

  .schalter input {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }
</style>
