<script lang="ts">
  // Übersicht der Kompetenzen einer Klassenstufe, nach Bereich und Feld. Ohne Niveau: das wählt
  // die App still je Thema (L-22, src/core/learning/niveau-wahl.ts).
  import { nachGraph, passtZurSchulart, type Kompetenz } from '../../core/competence/kompetenz';
  import { empfohlen } from '../../core/learning/empfehlung';
  import type { Zustand } from '../plattform/ablage';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { t, type TextSchluessel } from '../texte/texte';
  import GeradeDran from './GeradeDran.svelte';
  import KlassenWahl from './KlassenWahl.svelte';
  import Steinkette from './Steinkette.svelte';
  import { BEREICHE } from './reihenfolge';
  import { sitzt, statusGesamt } from './stand';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    klasse = $bindable(5),
    schulart = $bindable(undefined),
    geradeDran = $bindable([]),
    vermittelt = new Set(),
    onwahl,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
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
  const status = (k: Kompetenz) => statusGesamt(zustand, k.id, jetzt);
  // Empfohlen (L-5): alle Voraussetzungen sitzen, die Kompetenz selbst noch nicht – gesperrt wird nichts
  const empfehlungen = $derived(
    new Set(empfohlen(kompetenzen, (id) => sitzt(statusGesamt(zustand, id, jetzt)))),
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
          passtZurSchulart(k, schulart) &&
          vorlagen.some((v) => v.kompetenz === k.id),
      ),
    })).filter((b) => b.kompetenzen.length > 0),
  );
  const nachId = $derived(new Map(kompetenzen.map((k) => [k.id, k])));
  const sitztId = (id: string) => sitzt(statusGesamt(zustand, id, jetzt));
</script>

<section class="uebersicht register-ort">
  <h2>{t('uebersicht.ueberschrift')}</h2>
  <p class="entwurf">{t('uebersicht.entwurf')}</p>
  <p class="leise">{t('uebersicht.gespeichert')}</p>

  <!-- L18: „Neues Thema“ erst, wenn schon etwas geübt wurde – beim ersten Besuch ist alles neu -->
  {#if empfehlungen.size > 0 && !entdeckungWeg && zustand.staende.size > 0}
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
    kompetenzen={kompetenzen.filter((k) => vorlagen.some((v) => v.kompetenz === k.id))}
    {klasse}
    {schulart}
    bind:auswahl={geradeDran}
    {onwahl}
  />

  <h3>{t('klasse.name')} {klasse}</h3>
  {#if bereiche.length === 0}
    <p class="leise">{t('uebersicht.klasse-leer')}</p>
  {/if}
  <!-- L18: Bereiche eingeklappt; offen sind der erste Bereich und jeder, in dem schon geübt oder erklärt wurde -->
  {#each bereiche as b, i (b.bereich)}
    <details
      class="bereich"
      open={i === 0 || b.kompetenzen.some((k) => status(k) !== 'neu' || vermittelt.has(k.id))}
    >
      <summary>
        <h4>{t(`bereich.${b.bereich}` as TextSchluessel)}</h4>
        <span class="anzahl"
          >{b.kompetenzen.length}
          {t(b.kompetenzen.length === 1 ? 'uebersicht.thema' : 'uebersicht.themen')}</span
        >
      </summary>
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
                <Steinkette kompetenz={k} kompetenzen={nachId} sitzt={sitztId} />
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </details>
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

  .bereich {
    display: grid;
    gap: var(--abstand-s);
  }

  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
    margin-block-start: var(--abstand-s);
    padding-block: var(--abstand-s);
    border-block-end: 1px solid var(--farbe-rand);
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '▸';
    color: var(--farbe-akzent);
  }

  .bereich[open] > summary::before {
    content: '▾';
  }

  h4 {
    margin: 0;
    color: var(--farbe-akzent);
  }

  .anzahl {
    color: var(--farbe-text-leise);
    font-size: 1rem;
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
