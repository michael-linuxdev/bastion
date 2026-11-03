<script lang="ts">
  // O1: Beim ersten Start nur eine kleine Karte statt des ganzen Formulars „Über mich“.
  // „Jetzt angeben“ öffnet die Seite „Über mich“, „Lieber später“ fragt nicht wieder (L-15).
  import { t } from '../texte/texte';

  let { onjetzt, onspaeter }: { onjetzt: () => void; onspaeter: () => void } = $props();
</script>

<section class="einladung" aria-labelledby="profil-einladung">
  <h2 id="profil-einladung">{t('profil.ueberschrift')}</h2>
  <p>{t('profil.karte-text')}</p>
  <p class="knoepfe">
    <button type="button" class="haupt" onclick={onjetzt}>{t('profil.karte-jetzt')}</button>
    <button type="button" class="zweit" onclick={onspaeter}>{t('profil.ueberspringen')}</button>
  </p>
</section>

<style>
  .einladung {
    margin-block: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }
  h2 {
    margin-block: 0 0.25rem;
    font-size: 1.05rem;
  }
  p {
    margin-block: 0 var(--abstand-s);
    color: var(--farbe-text-leise);
  }
  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    margin-block-end: 0;
  }
</style>
