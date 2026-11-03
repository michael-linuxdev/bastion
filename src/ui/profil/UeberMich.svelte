<script lang="ts">
  // O6: Seite „Über mich“ – gemeinsamer Seitenkopf, darunter drei Karten:
  // Angaben (L-15), Aussehen und Ton, Bildschirm.
  import type { Profil } from '../../core/policy/alter';
  import OrientierungWahl from '../grafik/OrientierungWahl.svelte';
  import Seitenkopf from '../start/Seitenkopf.svelte';
  import { t } from '../texte/texte';
  import ModusWahl from './ModusWahl.svelte';
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
  <div class="karte"><ModusWahl /></div>
  <div class="karte"><OrientierungWahl /></div>
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
  .karte :global(fieldset) {
    margin-block: 0;
  }
</style>
