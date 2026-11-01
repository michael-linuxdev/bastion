<script lang="ts">
  // Eltern/Test: virtueller Vorrat zum Ansehen des Baus – Ledger bleibt unberührt.
  // §U105: Schalter und Probe-Banner immer gekoppelt sichtbar.
  import { testRohstoffeSetzen, testRohstoffeWahl } from '../plattform/ablage';
  import { t } from '../texte/texte';

  let { an = $bindable(false) }: { an?: boolean } = $props();

  void testRohstoffeWahl().then((v) => {
    an = v;
  });
</script>

<div class="probe" class:aktiv={an} role="group" aria-label={t('bastion.probe-gruppe')}>
  <p class="banner" role="status">
    {an ? t('bastion.probe-banner-an') : t('bastion.probe-banner-aus')}
  </p>
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
</div>

<style>
  .probe {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px dashed var(--farbe-rand);
    background: var(--farbe-flaeche-leise);
  }

  .probe.aktiv {
    border-color: var(--farbe-akzent-warm);
    background: color-mix(in srgb, var(--farbe-hinweis-flaeche) 80%, var(--farbe-flaeche));
  }

  .banner {
    margin: 0;
    font-weight: 800;
    font-size: 0.95rem;
  }

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
