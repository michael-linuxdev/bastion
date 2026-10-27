<script lang="ts">
  // Übersicht der Kompetenzen der Klasse 5, nach Bereich und Feld, mit Wahl des Niveaus.
  import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    kompetenzen,
    vorlagen,
    niveau = $bindable(),
    onwahl,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    niveau: Niveau;
    onwahl: (kompetenz: Kompetenz) => void;
  } = $props();

  const REIHENFOLGE = [
    'zahl-und-operation',
    'strukturen-und-funktionaler-zusammenhang',
    'groessen-und-messen',
    'raum-und-form',
    'daten-und-zufall',
  ];

  const bereiche = $derived(
    REIHENFOLGE.map((bereich) => ({
      bereich,
      kompetenzen: nachGraph(kompetenzen).filter(
        (k) =>
          k.bereich === bereich &&
          k.klassenstufe_typisch.includes(5) &&
          vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes(niveau)),
      ),
    })).filter((b) => b.kompetenzen.length > 0),
  );
</script>

<section class="uebersicht">
  <h2>{t('uebersicht.ueberschrift')}</h2>
  <p class="entwurf">{t('uebersicht.entwurf')}</p>

  <fieldset class="niveau">
    <legend>{t('niveau.ueberschrift')}</legend>
    <label><input type="radio" value="G" bind:group={niveau} /> {t('niveau.G')}</label>
    <label><input type="radio" value="M" bind:group={niveau} /> {t('niveau.M')}</label>
  </fieldset>

  <h3>{t('uebersicht.klasse5')}</h3>
  {#each bereiche as b (b.bereich)}
    <h4>{t(`bereich.${b.bereich}` as TextSchluessel)}</h4>
    <ul class="liste">
      {#each b.kompetenzen as k (k.id)}
        <li>
          <button onclick={() => onwahl(k)}>
            <span class="titel">{k.titel.de}</span>
            <span class="kann">{k.kann_satz.de}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/each}
</section>

<style>
  .uebersicht {
    display: grid;
    gap: var(--abstand-s);
  }

  .entwurf {
    color: var(--farbe-text-leise);
    font-size: 1rem;
    border-inline-start: 4px solid var(--farbe-rand);
    padding-inline-start: var(--abstand-m);
  }

  .niveau {
    display: flex;
    gap: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .niveau label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  h4 {
    margin-block: var(--abstand-m) 0;
    color: var(--farbe-akzent);
  }

  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .liste button {
    font: inherit;
    inline-size: 100%;
    text-align: start;
    display: grid;
    gap: 0.2rem;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    cursor: pointer;
  }

  .liste button:hover,
  .liste button:focus-visible {
    border-color: var(--farbe-akzent);
  }

  .titel {
    font-weight: bold;
  }

  .kann {
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }
</style>
