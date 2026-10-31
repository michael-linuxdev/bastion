<script lang="ts">
  // Eltern/Test: virtueller Vorrat zum Ansehen des Baus – Ledger bleibt unberührt.
  import { testRohstoffeSetzen, testRohstoffeWahl } from '../plattform/ablage';
  import { t } from '../texte/texte';

  let { an = $bindable(false) }: { an?: boolean } = $props();

  void testRohstoffeWahl().then((v) => {
    an = v;
  });
</script>

<label class="schalter">
  <input
    type="checkbox"
    checked={an}
    onchange={(e) => {
      an = e.currentTarget.checked;
      void testRohstoffeSetzen(an);
    }}
  />
  {t('bastion.test-rohstoffe')}
</label>
<p class="leise">{t('bastion.test-rohstoffe-erklaerung')}</p>

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
