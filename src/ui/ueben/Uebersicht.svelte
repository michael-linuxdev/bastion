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
    vermittelt = new Set(),
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
    /** Kompetenzen mit abgeschlossener Erstvermittlung: Zustand „erklärt“ vor dem ersten Üben */
    vermittelt?: ReadonlySet<string>;
    onwahl: (kompetenz: Kompetenz) => void;
  } = $props();

  // Status zur Anzeige, einmal beim Öffnen berechnet (kein laufender Timer, R2)
  const jetzt = Date.now();
  const status = (k: Kompetenz) => statusVon(zustand, k.id, niveau, jetzt);
  // Empfohlen (L-5): alle Voraussetzungen sitzen, die Kompetenz selbst noch nicht – gesperrt wird nichts
  const empfehlungen = $derived(
    new Set(empfohlen(kompetenzen, (id) => sitzt(statusVon(zustand, id, niveau, jetzt)))),
  );
  /** Ruhige Entdeckungskarte einmalig pro Sitzung (O83) */
  let entdeckungWeg = $state(false);

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

  <fieldset class="niveau steine">
    <legend>{t('niveau.stufe')}</legend>
    <label class="stein" class:aktiv={niveau === 'G'}>
      <input type="radio" value="G" bind:group={niveau} />
      <span class="kette" aria-hidden="true"
        ><span class="kiesel voll"></span><span class="kiesel"></span></span
      >
      <span>{t('niveau.stein-g')}</span>
    </label>
    <label class="stein" class:aktiv={niveau === 'M'}>
      <input type="radio" value="M" bind:group={niveau} />
      <span class="kette" aria-hidden="true"
        ><span class="kiesel voll"></span><span class="kiesel voll"></span></span
      >
      <span>{t('niveau.stein-m')}</span>
    </label>
  </fieldset>

  {#if empfehlungen.size > 0 && !entdeckungWeg}
    {@const neu = [...empfehlungen][0]}
    {@const k = kompetenzen.find((x) => x.id === neu)}
    {#if k}
      <aside class="entdeckung" role="status">
        <p class="entdeckung-titel">{t('entdeckung.neu')}</p>
        <p>{k.titel.de}</p>
        <div class="entdeckung-knoepfe">
          <button
            class="haupt"
            onclick={() => {
              entdeckungWeg = true;
              onwahl(k);
            }}>{t('entdeckung.weiter')}</button
          >
          <button class="zweit" onclick={() => (entdeckungWeg = true)}
            >{t('entdeckung.spaeter')}</button
          >
        </div>
      </aside>
    {/if}
  {/if}

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
    <ul class="orte">
      {#each b.kompetenzen as k (k.id)}
        <li>
          <button class="ort" onclick={() => onwahl(k)}>
            <span class="ort-bild" aria-hidden="true" data-feld={k.feld ?? b.bereich}></span>
            <span class="ort-text">
              <span class="titel">
                {k.titel.de}
                {#if status(k) !== 'neu'}
                  <span class="status {status(k)}">
                    {status(k) === 'gekonnt' || status(k) === 'gefestigt' ? '✓ ' : ''}{t(
                      `status.${status(k) as 'in-arbeit' | 'gekonnt' | 'gefestigt' | 'auffrischen'}`,
                    )}
                  </span>
                {:else if vermittelt.has(k.id)}
                  <span class="status">{t('vermittlung.erklaert')}</span>
                {:else if empfehlungen.has(k.id)}
                  <span class="status empfohlen">{t('status.empfohlen')}</span>
                {/if}
              </span>
              <span class="kann">{k.kann_satz.de}</span>
            </span>
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
    flex-wrap: wrap;
    gap: var(--abstand-s);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-s);
  }

  .niveau.steine {
    gap: var(--abstand-m);
  }

  .stein {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .stein.aktiv {
    background: var(--farbe-flaeche-leise);
  }

  .stein input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .kette {
    display: inline-flex;
    gap: 0.25rem;
  }

  .kiesel {
    inline-size: 0.85rem;
    block-size: 0.85rem;
    border-radius: 50%;
    background: var(--farbe-flaeche);
    box-shadow: inset 0 0 0 1.5px var(--farbe-text-leise);
  }

  .kiesel.voll {
    background: var(--farbe-akzent);
    box-shadow: none;
  }

  .entdeckung {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
    border: 2px solid var(--farbe-hinweis-rand);
  }

  .entdeckung-titel {
    margin: 0;
    font-weight: 800;
  }

  .entdeckung-knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .entdeckung .haupt,
  .entdeckung .zweit {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .entdeckung .haupt {
    border: none;
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
  }

  .entdeckung .zweit {
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
  }

  h4 {
    margin-block: var(--abstand-m) 0;
    color: var(--farbe-akzent);
  }

  .orte {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .ort {
    font: inherit;
    inline-size: 100%;
    text-align: start;
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    gap: var(--abstand-s);
    align-items: center;
    min-block-size: var(--ziel);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 2px solid transparent;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
    color: var(--farbe-text);
    cursor: pointer;
  }

  .ort:hover,
  .ort:focus-visible {
    border-color: var(--farbe-akzent);
  }

  .ort-bild {
    inline-size: 3.25rem;
    block-size: 3.25rem;
    border-radius: var(--radius);
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--farbe-akzent) 35%, var(--farbe-himmel, #cfe7f5)),
      var(--farbe-akzent-warm)
    );
    box-shadow: inset 0 -0.55rem 0 color-mix(in srgb, var(--farbe-boden, #6b8f4e) 70%, transparent);
  }

  .ort-text {
    display: grid;
    gap: 0.2rem;
    min-inline-size: 0;
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
