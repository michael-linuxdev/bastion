<script lang="ts">
  // Übersicht der Kompetenzen einer Klassenstufe, nach Bereich und Feld, mit Wahl des Niveaus.
  import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
  import { empfohlen } from '../../core/learning/empfehlung';
  import type { Zustand } from '../plattform/ablage';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { t, type TextSchluessel } from '../texte/texte';
  import GeradeDran from './GeradeDran.svelte';
  import KlassenWahl from './KlassenWahl.svelte';
  import { BEREICHE } from './reihenfolge';
  import { sitzt, statusVon } from './stand';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    niveau = $bindable(),
    klasse = $bindable(5),
    schulart = $bindable(undefined),
    geradeDran = $bindable([]),
    onwahl,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    niveau: Niveau;
    /** Klassenstufe, deren Kompetenzen gezeigt werden (K-15: 5 und 6 haben Inhalte) */
    klasse?: number;
    schulart?: 'oberschule' | 'gymnasium' | undefined;
    /** „Gerade in der Schule dran“ (L-18) */
    geradeDran?: readonly string[];
    onwahl: (kompetenz: Kompetenz) => void;
  } = $props();

  // Status zur Anzeige, einmal beim Öffnen berechnet (kein laufender Timer, R2)
  const jetzt = Date.now();
  const status = (k: Kompetenz) => statusVon(zustand, k.id, niveau, jetzt);
  // Empfohlen (L-5): alle Voraussetzungen sitzen, die Kompetenz selbst noch nicht – gesperrt wird nichts
  const empfehlungen = $derived(
    new Set(empfohlen(kompetenzen, (id) => sitzt(statusVon(zustand, id, niveau, jetzt)))),
  );

  const bereiche = $derived(
    BEREICHE.map((bereich) => ({
      bereich,
      kompetenzen: nachGraph(kompetenzen).filter(
        (k) =>
          k.bereich === bereich &&
          k.klassenstufe_typisch.includes(klasse) &&
          vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes(niveau)),
      ),
    })).filter((b) => b.kompetenzen.length > 0),
  );
</script>

<section class="uebersicht">
  <h2>{t('uebersicht.ueberschrift')}</h2>
  <p class="entwurf">{t('uebersicht.entwurf')}</p>
  <p class="leise">{t('uebersicht.gespeichert')}</p>

  <fieldset class="niveau">
    <legend>{t('niveau.ueberschrift')}</legend>
    <label><input type="radio" value="G" bind:group={niveau} /> {t('niveau.G')}</label>
    <label><input type="radio" value="M" bind:group={niveau} /> {t('niveau.M')}</label>
  </fieldset>

  <KlassenWahl bind:klasse bind:schulart mitSchulart />

  <GeradeDran
    kompetenzen={kompetenzen.filter((k) =>
      vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes(niveau)),
    )}
    {klasse}
    {schulart}
    bind:auswahl={geradeDran}
    {onwahl}
  />

  <h3>{t('klasse.name')} {klasse}</h3>
  {#each bereiche as b (b.bereich)}
    <h4>{t(`bereich.${b.bereich}` as TextSchluessel)}</h4>
    <ul class="liste">
      {#each b.kompetenzen as k (k.id)}
        <li>
          <button onclick={() => onwahl(k)}>
            <span class="titel">
              {k.titel.de}
              {#if status(k) !== 'neu'}
                <span class="status {status(k)}">
                  {status(k) === 'gekonnt' || status(k) === 'gefestigt' ? '✓ ' : ''}{t(
                    `status.${status(k) as 'in-arbeit' | 'gekonnt' | 'gefestigt' | 'auffrischen'}`,
                  )}
                </span>
              {:else if empfehlungen.has(k.id)}
                <span class="status empfohlen">{t('status.empfohlen')}</span>
              {/if}
            </span>
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
    min-block-size: var(--ziel);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px solid transparent;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
    color: var(--farbe-text);
    cursor: pointer;
  }

  .liste button:hover,
  .liste button:focus-visible {
    border-color: var(--farbe-akzent);
  }

  .titel {
    font-weight: 800;
  }

  .status {
    font-weight: normal;
    font-size: 0.9rem;
    color: var(--farbe-text-leise);
    margin-inline-start: var(--abstand-s);
  }

  .status.gekonnt,
  .status.gefestigt {
    color: var(--farbe-erfolg);
    font-weight: bold;
  }

  .status.empfohlen {
    color: var(--farbe-akzent);
  }

  .status.auffrischen {
    color: var(--farbe-akzent);
  }

  .leise {
    color: var(--farbe-text-leise);
    font-size: 1rem;
    margin-block: 0;
  }

  .kann {
    color: var(--farbe-text-leise);
    font-size: 1rem;
  }
</style>
