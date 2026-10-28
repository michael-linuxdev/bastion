<script lang="ts">
  // Listenansicht der Bastion (ARCHITEKTUR §4.5, BASEBAU §11 Schritt 2.8):
  // barrierefrei und reizarm, gleichwertig zur späteren Grafik. Planen heißt
  // hier: Kosten und Hindernisse sehen – erst „Bauen“ bucht ab (§4.2).
  import {
    beginnHindernisse,
    freierPlatz,
    plaetze,
    platzHindernisse,
    type BauHindernis,
  } from '../../core/bastion/bauen';
  import {
    BAUPLATZ,
    GEBAEUDE_TYPEN,
    KATALOG,
    kosten,
    type Bauwerk,
    type GebaeudeTyp,
    type Kosten,
  } from '../../core/bastion/katalog';
  import {
    bauAusfuehren,
    bastionLage,
    type BastionLage,
    type BauAuftrag,
  } from '../plattform/ablage';
  import { t, type TextSchluessel } from '../texte/texte';

  let lage = $state<BastionLage | undefined>(undefined);
  let geladen = $state(false);
  let meldung = $state<readonly BauHindernis[]>([]);
  /** Gebäude, das gerade versetzt wird, mit gewähltem Feld */
  let versetzt = $state<{ id: string; x: number; y: number } | undefined>(undefined);

  void bastionLage().then((l) => {
    lage = l;
    geladen = true;
  });

  async function ausfuehren(auftrag: BauAuftrag) {
    const r = await bauAusfuehren(auftrag);
    if ('hindernisse' in r) meldung = r.hindernisse;
    else {
      lage = r;
      meldung = [];
      versetzt = undefined;
    }
  }

  const name = (typ: GebaeudeTyp) => t(`gebaeude.${typ}` as TextSchluessel);
  const wozu = (typ: GebaeudeTyp) => t(`gebaeude.${typ}.wozu` as TextSchluessel);
  const mit = (n: number, eins: TextSchluessel, mehrere: TextSchluessel) =>
    `${n} ${t(n === 1 ? eins : mehrere)}`;

  function kostenText(k: Kosten): string {
    return [
      k.stein > 0 ? `${k.stein} ${t('ressource.stein')}` : '',
      k.erz > 0 ? `${k.erz} ${t('ressource.erz')}` : '',
      k.bauplan > 0 ? mit(k.bauplan, 'ressource.bauplan-einer', 'ressource.bauplaene') : '',
      k.bauschritt > 0
        ? mit(k.bauschritt, 'ressource.bauschritt-einer', 'ressource.bauschritte')
        : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function hindernisText(h: BauHindernis, typ: GebaeudeTyp, stufe: number): string {
    if (h === 'voraussetzung') {
      const b = KATALOG[typ].stufen[stufe - 1]?.braucht;
      if (b) return `${t('bastion.braucht')} ${name(b.typ)} ${t('bastion.stufe')} ${b.stufe}.`;
    }
    return t(`bastion.hindernis.${h}` as TextSchluessel);
  }

  /** Was an jedem Angebot steht; der volle Bauplatz und fehlende Ressourcen werden zusammengefasst */
  const einzeln = (h: readonly BauHindernis[]) =>
    h.filter((x) => x !== 'kein-freier-bauplatz' && !x.startsWith('zu-wenig-'));
  const fehlt = (h: readonly BauHindernis[]) =>
    (['stein', 'erz', 'bauplan'] as const)
      .filter((r) => h.includes(`zu-wenig-${r}`))
      .map((r) => t(r === 'bauplan' ? 'ressource.bauplaene' : `ressource.${r}`));
  const belegt = $derived(
    lage !== undefined && lage.bastion.vorhaben.length >= plaetze(lage.bastion),
  );

  /** B-14: zuerst Banner und Späherturm, dann der übrige Katalog */
  const REIHENFOLGE: readonly GebaeudeTyp[] = [
    'banner',
    'spaeherturm',
    ...GEBAEUDE_TYPEN.filter((x) => x !== 'banner' && x !== 'spaeherturm'),
  ];

  interface Angebot {
    readonly typ: GebaeudeTyp;
    readonly stufe: number;
    readonly ausbau?: Bauwerk;
    readonly hindernisse: readonly BauHindernis[];
  }

  // Neubauten: alles, was in dieser Epoche noch dazukommen kann
  const neubauten = $derived.by((): Angebot[] => {
    const l = lage;
    if (!l) return [];
    return REIHENFOLGE.flatMap((typ) => {
      const pos = freierPlatz(l.bastion, typ);
      const h = beginnHindernisse(l.bastion, l.konto, typ, { pos: pos ?? { x: 0, y: 0 } });
      if (!pos && !h.includes('belegt')) h.push('belegt');
      if (h.includes('nicht-baubar') || h.includes('hoechstzahl')) return [];
      return [{ typ, stufe: 1, hindernisse: h }];
    });
  });

  // Ausbau: jedes Gebäude, das noch eine Stufe höher kann
  const ausbauten = $derived.by((): Angebot[] => {
    const l = lage;
    if (!l) return [];
    return l.bastion.bauwerke.flatMap((b) => {
      const h = beginnHindernisse(l.bastion, l.konto, b.typ, { ausbau: b.id });
      if (h.includes('nicht-baubar') || h.includes('hoechststufe')) return [];
      return [{ typ: b.typ, stufe: b.stufe + 1, ausbau: b, hindernisse: h }];
    });
  });

  const gebaeude = $derived(
    [...(lage?.bastion.bauwerke ?? [])].sort(
      (a, b) =>
        REIHENFOLGE.indexOf(a.typ) - REIHENFOLGE.indexOf(b.typ) ||
        a.pos.y - b.pos.y ||
        a.pos.x - b.pos.x,
    ),
  );
  const datum = (ms: number) =>
    new Date(ms).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
  const feld = (x: number, y: number) =>
    `${t('bastion.spalte')} ${x + 1}, ${t('bastion.reihe')} ${y + 1}`;
</script>

<section class="bastion">
  <h2>{t('bastion.ueberschrift')}</h2>
  <p class="leise">{t('bastion.einleitung')}</p>

  {#if geladen && !lage}
    <p>{t('bastion.ohne-speicher')}</p>
  {:else if lage}
    {@const l = lage}
    <h3>{t('bastion.vorrat')}</h3>
    <ul class="vorrat">
      <li><strong>{l.konto.stand.stein}</strong> {t('ressource.stein')}</li>
      <li><strong>{l.konto.stand.erz}</strong> {t('ressource.erz')}</li>
      <li>
        <strong>{l.konto.stand.bauplan}</strong>
        {t(l.konto.stand.bauplan === 1 ? 'ressource.bauplan-einer' : 'ressource.bauplaene')}
      </li>
      <li><strong>{l.bastion.vorrat}</strong> {t('bastion.bauschritte-vorrat')}</li>
    </ul>
    <p class="leise">{t('bastion.bauschritte-erklaerung')}</p>

    {#if meldung.length > 0}
      <p class="meldung" role="status">
        {meldung.map((h) => t(`bastion.hindernis.${h}` as TextSchluessel)).join(' ')}
      </p>
    {/if}

    {#if l.bastion.vorhaben.length > 0}
      <h3>{t('bastion.im-bau')}</h3>
      <ul class="liste">
        {#each l.bastion.vorhaben as v (v.id)}
          <li>
            <span>
              <strong>{name(v.typ)}</strong>
              {#if v.stufe > 1}{t('bastion.auf-stufe')} {v.stufe}{/if}
              <br />
              <progress max={v.bedarf} value={v.fortschritt}></progress>
              {v.fortschritt}
              {t('bastion.von')}
              {v.bedarf}
              {t('bastion.bauschritten')}
            </span>
            <button onclick={() => void ausfuehren({ art: 'abbrechen', vorhaben: v.id })}
              >{t('bastion.abbrechen')}</button
            >
          </li>
        {/each}
      </ul>
      <p class="leise">{t('bastion.abbrechen-erklaerung')}</p>
    {/if}

    {#snippet angebot(a: Angebot)}
      {@const k = kosten(a.typ, a.stufe)}
      <li>
        <span>
          <strong>{name(a.typ)}</strong>
          {#if a.ausbau}{t('bastion.auf-stufe')} {a.stufe}{/if}
          <br /><small class="leise">{wozu(a.typ)}</small>
          {#if k}<br /><small>{t('bastion.kosten')} {kostenText(k)}</small>{/if}
          {#each einzeln(a.hindernisse) as h (h)}
            <br /><small class="hindernis">{hindernisText(h, a.typ, a.stufe)}</small>
          {/each}
          {#if fehlt(a.hindernisse).length > 0}
            <br /><small class="hindernis"
              >{t('bastion.reicht-nicht')} {fehlt(a.hindernisse).join(', ')}</small
            >
          {/if}
        </span>
        <button
          disabled={a.hindernisse.length > 0}
          onclick={() =>
            void ausfuehren({
              art: 'beginnen',
              typ: a.typ,
              ...(a.ausbau ? { ausbau: a.ausbau.id } : {}),
            })}>{a.ausbau ? t('bastion.knopf-ausbauen') : t('bastion.knopf-bauen')}</button
        >
      </li>
    {/snippet}

    <h3>{t('bastion.bauen')}</h3>
    {#if belegt}<p class="leise">{t('bastion.hindernis.kein-freier-bauplatz')}</p>{/if}
    <ul class="liste">
      {#each neubauten as a (a.typ)}{@render angebot(a)}{/each}
    </ul>

    {#if ausbauten.length > 0}
      <h3>{t('bastion.ausbauen')}</h3>
      <ul class="liste">
        {#each ausbauten as a (a.ausbau?.id)}{@render angebot(a)}{/each}
      </ul>
    {/if}

    <h3>{t('bastion.gebaeude')}</h3>
    <ul class="liste">
      {#each gebaeude as b (b.id)}
        <li>
          <span>
            <strong>{name(b.typ)}</strong>
            {#if KATALOG[b.typ].stufen.length > 1}{t('bastion.stufe')} {b.stufe}{/if}
            <br /><small class="leise">{t('bastion.feld')}: {feld(b.pos.x, b.pos.y)}</small>
          </span>
          {#if versetzt && versetzt.id === b.id}
            <span class="versetzen">
              <label
                >{t('bastion.spalte')}
                <select bind:value={versetzt.x}>
                  {#each Array.from({ length: BAUPLATZ.breite }, (_, i) => i) as i (i)}
                    <option value={i}>{i + 1}</option>
                  {/each}
                </select></label
              >
              <label
                >{t('bastion.reihe')}
                <select bind:value={versetzt.y}>
                  {#each Array.from({ length: BAUPLATZ.tiefe }, (_, i) => i) as i (i)}
                    <option value={i}>{i + 1}</option>
                  {/each}
                </select></label
              >
              <button
                disabled={platzHindernisse(l.bastion, b.typ, { x: versetzt.x, y: versetzt.y }, b.id)
                  .length > 0}
                onclick={() =>
                  versetzt &&
                  void ausfuehren({
                    art: 'versetzen',
                    gebaeude: b.id,
                    pos: { x: versetzt.x, y: versetzt.y },
                  })}>{t('bastion.hierhin')}</button
              >
            </span>
          {:else}
            <button onclick={() => (versetzt = { id: b.id, x: b.pos.x, y: b.pos.y })}
              >{t('bastion.versetzen')}</button
            >
          {/if}
        </li>
      {/each}
    </ul>
    <p class="leise">{t('bastion.versetzen-erklaerung')}</p>

    {#if l.bastion.fertig.length > 0}
      <h3>{t('bastion.geschichte')}</h3>
      <ul>
        {#each [...l.bastion.fertig].reverse() as f (f.vorhaben)}
          <li>
            {name(f.typ)}{#if KATALOG[f.typ].stufen.length > 1}, {t('bastion.stufe')} {f.stufe}{/if}
            – {t('bastion.fertig-am')}
            {datum(f.ts)}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  .bastion {
    display: grid;
    gap: var(--abstand-s);
  }

  h3 {
    margin-block: var(--abstand-m) 0;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .vorrat {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-m);
  }

  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .liste li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--abstand-m);
    padding: var(--abstand-s);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .hindernis {
    color: var(--farbe-text-leise);
  }

  .meldung {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .versetzen {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
  }

  progress {
    inline-size: 8rem;
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
