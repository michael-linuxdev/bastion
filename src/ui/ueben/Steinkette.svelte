<script lang="ts">
  /**
   * Kompetenz-Pfad als kurze Steinkette (Design-Ideen K39): 3–5 Steine, kein Baum.
   * Zeigt Voraussetzungen und das aktuelle Thema in einer ruhigen Reihe.
   */
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { t } from '../texte/texte';

  let {
    kompetenz,
    kompetenzen,
    sitzt,
  }: {
    kompetenz: Kompetenz;
    kompetenzen: ReadonlyMap<string, Kompetenz>;
    sitzt: (id: string) => boolean;
  } = $props();

  /** Längste Voraussetzungs-Kette, gekürzt auf höchstens 4 + aktuelles Thema. */
  const steine = $derived.by(() => {
    const kette: { id: string; titel: string; aktuell: boolean; sitzt: boolean }[] = [];
    let id: string | undefined = kompetenz.voraussetzungen.find((v) => kompetenzen.has(v));
    // Tiefste Voraussetzung zuerst: eine Kette entlang der ersten Kante
    const vor: string[] = [];
    while (id && !vor.includes(id) && vor.length < 8) {
      vor.push(id);
      const k = kompetenzen.get(id);
      id = k?.voraussetzungen.find((v) => kompetenzen.has(v));
    }
    for (const v of vor.reverse().slice(-4)) {
      const k = kompetenzen.get(v);
      if (!k) continue;
      kette.push({ id: v, titel: k.titel.de, aktuell: false, sitzt: sitzt(v) });
    }
    kette.push({
      id: kompetenz.id,
      titel: kompetenz.titel.de,
      aktuell: true,
      sitzt: sitzt(kompetenz.id),
    });
    return kette;
  });
</script>

{#if steine.length > 1}
  <ol class="kette" aria-label={t('steinkette.aria')}>
    {#each steine as s, i (s.id)}
      {#if i > 0}<li class="strich" aria-hidden="true"></li>{/if}
      <li class="stein" class:sitzt={s.sitzt} class:aktuell={s.aktuell} title={s.titel}>
        <span class="punkt" aria-hidden="true"></span>
        <span class="name">{s.titel}</span>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .kette {
    list-style: none;
    margin: 0.35rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.35rem;
  }

  .stein {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    max-inline-size: 100%;
    font-size: 0.8rem;
    color: var(--farbe-text-leise);
  }

  .stein.aktuell {
    color: var(--farbe-text);
    font-weight: 700;
  }

  .punkt {
    inline-size: 0.7rem;
    block-size: 0.7rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--farbe-flaeche-leise);
    box-shadow: inset 0 0 0 1.5px var(--farbe-text-leise);
  }

  .stein.sitzt .punkt {
    background: var(--farbe-akzent);
    box-shadow: none;
  }

  .stein.aktuell .punkt {
    background: var(--farbe-akzent-warm, var(--farbe-akzent));
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--farbe-akzent-warm, var(--farbe-akzent)) 35%, transparent);
  }

  .strich {
    inline-size: 0.65rem;
    block-size: 2px;
    background: var(--farbe-rand);
    flex-shrink: 0;
    list-style: none;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-inline-size: 9rem;
  }
</style>
