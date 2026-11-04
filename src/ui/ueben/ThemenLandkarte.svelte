<script lang="ts">
  // Themen-/Fortschritts-Landkarte (Design „Danach“ J32): ruhige Karte statt
  // langer Liste – Felder je Lernbereich, Steine je Status. Keine Noten, kein
  // Feiern (VISION R1/R4, GRAFIK §9: Lern-UI ohne Animationen).
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AnzeigeStatus } from '../../core/learning/fortschritt';
  import { t, type TextSchluessel } from '../texte/texte';
  import { BEREICHE } from './reihenfolge';

  let {
    themen,
    status,
    onueben,
  }: {
    themen: readonly Kompetenz[];
    status: ReadonlyMap<string, AnzeigeStatus>;
    onueben: (k: Kompetenz) => void;
  } = $props();

  const gruppen = $derived(
    BEREICHE.map((bereich) => ({
      bereich,
      liste: themen.filter((k) => k.bereich === bereich),
    })).filter((g) => g.liste.length > 0),
  );

  /** O18: je Bereich zwei Zahlen in der Kopfzeile – wie viel sitzt, woran gerade gearbeitet wird */
  const zaehle = (liste: readonly Kompetenz[]) => {
    let sicher = 0;
    let arbeit = 0;
    for (const k of liste) {
      const s = status.get(k.id);
      if (s === 'gekonnt' || s === 'gefestigt') sicher++;
      else if (s === 'in-arbeit' || s === 'auffrischen') arbeit++;
    }
    return { sicher, arbeit };
  };
  /** Offen ist, wo gerade etwas läuft; ist nichts angefangen, der erste Bereich */
  const offen = $derived.by(() => {
    const laufend = gruppen.filter((g) => zaehle(g.liste).arbeit > 0).map((g) => g.bereich);
    return new Set(laufend.length > 0 ? laufend : gruppen.slice(0, 1).map((g) => g.bereich));
  });

  const stein = (s: AnzeigeStatus | undefined): string => {
    if (s === 'gefestigt') return 'voll';
    if (s === 'gekonnt') return 'sicher';
    if (s === 'auffrischen') return 'wackel';
    if (s === 'in-arbeit') return 'arbeit';
    return 'leer';
  };
</script>

<section class="landkarte" aria-labelledby="landkarte-titel">
  <h3 id="landkarte-titel">{t('landkarte.titel')}</h3>
  <p class="legende">{t('landkarte.legende')}</p>

  {#if themen.length === 0}
    <p class="leer">{t('landkarte.leer')}</p>
  {:else}
    <ul class="felder">
      {#each gruppen as g (g.bereich)}
        {@const z = zaehle(g.liste)}
        <li class="feld">
          <!-- O18: Klappkarten statt einer 3 800 px langen Seite am Handy -->
          <details open={offen.has(g.bereich)}>
            <summary>
              <h4>{t(`bereich.${g.bereich}` as TextSchluessel)}</h4>
              <span class="feld-zahlen"
                >{z.sicher}
                {t('landkarte.von')}
                {g.liste.length}
                {t('landkarte.sicher')}{#if z.arbeit > 0}
                  · {z.arbeit} {t('landkarte.in-arbeit')}{/if}</span
              >
            </summary>
            <ul class="steine">
              {#each g.liste as k (k.id)}
                {@const s = status.get(k.id) ?? 'neu'}
                {@const statusText =
                  s === 'neu' ? t('stand.neu') : t(`status.${s}` as TextSchluessel)}
                <li>
                  <button
                    class="stein {stein(s)}"
                    title="{k.titel.de} – {statusText}"
                    aria-label="{k.titel.de}: {statusText}"
                    onclick={() => onueben(k)}
                  >
                    <span class="punkt" aria-hidden="true"></span>
                    <span class="name">{k.titel.de}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </details>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .landkarte {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background:
      radial-gradient(
        ellipse at 20% 0%,
        color-mix(in srgb, var(--farbe-himmel, #d6ecf3) 55%, transparent),
        transparent 55%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--farbe-flaeche) 92%, var(--farbe-akzent)) 0%,
        var(--farbe-flaeche) 45%,
        color-mix(in srgb, var(--farbe-flaeche) 88%, var(--farbe-akzent-warm, #c4603a)) 100%
      );
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .legende,
  .leer {
    margin: 0;
    color: var(--farbe-text-leise);
    font-size: 0.95rem;
  }

  .felder {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .feld {
    padding: var(--abstand-s);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 78%, transparent);
    border: 1px solid color-mix(in srgb, var(--farbe-rand) 70%, transparent);
  }

  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    column-gap: var(--abstand-s);
    min-block-size: var(--ziel, 2.75rem);
    align-content: center;
    cursor: pointer;
    list-style: none;
  }
  details[open] > summary {
    margin-block-end: 0.35rem;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  /* Pfeil zeigt, dass sich der Bereich aufklappen lässt */
  summary::after {
    content: '';
    order: 2;
    inline-size: 0.5rem;
    block-size: 0.5rem;
    margin-inline-start: 0.25rem;
    border-inline-end: 2px solid var(--farbe-text-leise);
    border-block-end: 2px solid var(--farbe-text-leise);
    transform: rotate(-45deg);
    align-self: center;
  }
  details[open] > summary::after {
    transform: rotate(45deg);
  }
  .feld-zahlen {
    margin-inline-start: auto;
  }
  h4 {
    display: inline;
    margin: 0;
    font-size: 0.95rem;
    color: var(--farbe-akzent);
  }
  .feld-zahlen {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--farbe-text-leise);
  }

  .steine {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .stein {
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    max-inline-size: 100%;
    min-block-size: 2.75rem;
    padding-block: 0.35rem;
    padding-inline: 0.55rem;
    border: none;
    border-radius: 999px;
    background: color-mix(in srgb, var(--farbe-flaeche-leise) 90%, transparent);
    color: var(--farbe-text);
    cursor: pointer;
    text-align: start;
  }

  .punkt {
    inline-size: 0.7rem;
    block-size: 0.7rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--farbe-rand);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--farbe-text-leise) 40%, transparent);
  }

  .stein.arbeit .punkt {
    background: color-mix(in srgb, var(--farbe-akzent) 55%, white);
  }
  .stein.wackel .punkt {
    background: var(--farbe-akzent);
  }
  .stein.sicher .punkt {
    background: color-mix(in srgb, var(--farbe-erfolg) 70%, white);
  }
  .stein.voll .punkt {
    background: var(--farbe-erfolg);
  }

  .name {
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.2;
    /* O18: ganze Namen, umgebrochen statt „Brüche und Dezimalzahlen a…“ */
    overflow-wrap: anywhere;
  }
</style>
