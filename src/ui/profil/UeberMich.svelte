<script lang="ts">
  // O6: Seite „Über mich“ – gemeinsamer Seitenkopf, darunter die Angaben (L-15).
  // O19: Aussehen, Ton und Bildschirm stehen jetzt unter „Einstellungen“.
  import type { Profil } from '../../core/policy/alter';
  import Seitenkopf from '../start/Seitenkopf.svelte';
  import { t } from '../texte/texte';
  import ProfilForm from './Profil.svelte';

  let {
    profil,
    onspeichern,
    onzurueck,
  }: { profil: Profil; onspeichern: (p: Profil) => void; onzurueck: () => void } = $props();
</script>

<section class="ueber-mich">
  <Seitenkopf titel={t('profil.ueberschrift')} {onzurueck}>
    <p>{t('profil.freundlich')}</p>
  </Seitenkopf>
  <div class="karte"><ProfilForm {profil} {onspeichern} /></div>
  <!-- O20: Bastion kennt einen Stand je Browser – Familien mit einem Tablet sollen das wissen -->
  <p class="leise" role="note">{t('profil.geschwister')}</p>
</section>

<style>
  .ueber-mich {
    display: grid;
    gap: var(--abstand-m);
  }
  .karte {
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }
  .leise {
    margin: 0;
    color: var(--farbe-text-leise);
  }
  .karte :global(fieldset) {
    margin-block: 0;
  }
</style>
