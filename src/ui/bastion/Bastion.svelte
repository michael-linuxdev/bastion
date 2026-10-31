<script lang="ts">
  // Listenansicht der Bastion (ARCHITEKTUR §4.5, BASEBAU §11 Schritt 2.8):
  // barrierefrei und reizarm, gleichwertig zur späteren Grafik. Planen heißt
  // hier: Kosten und Hindernisse sehen – erst „Bauen“ bucht ab (§4.2).
  import {
    beginnHindernisse,
    einlagerbar,
    freierPlatz,
    plaetze,
    platzHindernisse,
    type BauHindernis,
  } from '../../core/bastion/bauen';
  import {
    GEBAEUDE_TYPEN,
    KATALOG,
    kosten,
    type Bauwerk,
    type GebaeudeTyp,
    type Kosten,
  } from '../../core/bastion/katalog';
  import {
    bauAusfuehren,
    bildSetzen,
    themaSetzen,
    zielSetzen,
    zielVorgemerkt,
    bastionLage,
    bildZeigen,
    testRohstoffeWahl,
    type BastionLage,
    type BauAuftrag,
  } from '../plattform/ablage';
  import {
    anzeigeKonto,
    anzeigeVorrat,
    probeBeginnen,
    testKonto,
  } from '../../core/bastion/test-vorrat';
  import type { Bastion as BastionStand } from '../../core/bastion/bauen';
  import { type TextSchluessel } from '../texte/texte';
  import Bauplatz from './Bauplatz.svelte';
  import BastionDarstellung from './BastionDarstellung.svelte';
  import BastionSpielLeiste from './BastionSpielLeiste.svelte';
  import BastionBauBlatt from './BastionBauBlatt.svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import FarbWahl from './FarbWahl.svelte';
  import WetterEinstellung from './WetterEinstellung.svelte';
  import OrientierungWahl from '../grafik/OrientierungWahl.svelte';
  import Hinterhof from './Hinterhof.svelte';
  import {
    aktiv,
    gebaeudeName,
    gebaeudeWozu,
    menge,
    ressourceName,
    tt,
    wort,
  } from './thema.svelte';
  import { THEMEN, type Thema } from '../../core/policy/einstellung';
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { KompetenzStand } from '../../core/learning/fortschritt';
  import { hinterhof } from '../../core/learning/hinterhof';
  import { epochenstand } from '../../core/bastion/epoche';
  import { turmJoker, type BewaehrungModus } from '../../core/bastion/bewaehrung';
  import { vormerken, ziellage, type Ziel } from '../../core/bastion/ziel';
  import { soundTipp } from './sound/sound';
  import { t } from '../texte/texte';

  let {
    kompetenzen,
    wetterEinstellen = false,
    staende = [],
    aufgaben = [],
    klasse = 5,
    spannung = false,
    onbewaehrung,
    onzumStart,
    ausUeben = false,
  }: {
    kompetenzen: readonly Kompetenz[];
    /** Ab 18 / ausdrücklich erwachsen: Wetter selbst schalten (T-15) */
    wetterEinstellen?: boolean;
    staende?: readonly KompetenzStand[];
    aufgaben?: readonly AufgabeEreignis[];
    klasse?: number;
    /** Aktive Bewährungsprobe: Spannungsoptik (G11) */
    spannung?: boolean;
    /** Start einer Bewährungsprobe mit Modus, Themen und Joker-Zahl */
    onbewaehrung?: (modus: BewaehrungModus, themen: readonly string[], joker: number) => void;
    /** Zurück zum Start-Hub (ohne Reiterleiste) */
    onzumStart?: () => void;
    /** Beutel-Impuls nur nach Übergang aus dem Üben (M72) */
    ausUeben?: boolean;
  } = $props();

  /** Bastion-Einstellungen hinter dem Zahnrad (nur Bauplatz auf der Seite) */
  let einstellungenOffen = $state(false);
  /** Bauen/Planen-Blatt auf dem Bastion-Bildschirm */
  let bauBlattOffen = $state(false);
  /** Kamera: Bauplatz oder Hinterhof (Chrome oben) */
  let blick = $state<'bauplatz' | 'hinterhof'>('bauplatz');
  let bewaehrungModus = $state<BewaehrungModus>('ueben');
  const kannSatz = $derived(new Map(kompetenzen.map((k) => [k.id, k.kann_satz.de])));
  const hinterhofFelder = $derived(hinterhof(kompetenzen, staende, aufgaben, klasse));

  let lage = $state<BastionLage | undefined>(undefined);
  let geladen = $state(false);
  let meldung = $state<readonly BauHindernis[]>([]);
  /** Gebäude, das gerade versetzt wird, mit gewähltem Feld */
  let versetzt = $state<{ id: string; x: number; y: number } | undefined>(undefined);
  /** Eltern/Test: virtueller Vorrat (Ledger unberührt) */
  let testRohstoffe = $state(false);
  /** Probe-Bastion nur im Speicher – beim Ausschalten verworfen */
  let probeBastion = $state<BastionStand | undefined>(undefined);

  function themaWaehlen(th: Thema) {
    aktiv.thema = th;
    void themaSetzen(th);
  }

  /** Vorgemerktes Ziel (B-20) */
  let ziel = $state<Ziel | undefined>(undefined);

  void Promise.all([bastionLage(), zielVorgemerkt(), bildZeigen(), testRohstoffeWahl()]).then(
    ([l, z, bild, test]) => {
      lage = l;
      ziel = z;
      testRohstoffe = test;
      if (!test) probeBastion = undefined;
      geladen = true;
      // Ohne Bild ist die Liste die Bastion (barrierefrei) → Einstellungen öffnen
      if (!bild) einstellungenOffen = true;
    },
  );

  $effect(() => {
    if (!testRohstoffe) probeBastion = undefined;
  });

  function merken(z: Ziel | undefined) {
    ziel = z;
    void zielSetzen(z);
  }

  const ist = (a: Angebot, z: Ziel | undefined) =>
    z !== undefined && z.typ === a.typ && z.stufe === a.stufe && z.gebaeude === a.ausbau?.id;

  const zielZustand = $derived(lage && ziel ? ziellage(lage.bastion, lage.konto, ziel) : undefined);
  // Begonnen oder fertig: Die Vormerkung hat ihren Zweck erfüllt
  $effect(() => {
    if (zielZustand?.erreicht) merken(undefined);
  });

  async function ausfuehren(auftrag: BauAuftrag): Promise<boolean> {
    // Test-Vorrat: Neubau/Ausbau nur in der Probe-Ansicht – Ledger bleibt echt
    if (testRohstoffe && auftrag.art === 'beginnen' && lage) {
      const basis = probeBastion ?? lage.bastion;
      const konto = testKonto(lage.konto.profil);
      const r = probeBeginnen(
        basis,
        konto,
        auftrag.typ,
        auftrag.ausbau ? { ausbau: auftrag.ausbau } : {},
      );
      if (!r.ok) {
        meldung = r.hindernisse;
        return false;
      }
      probeBastion = r.bastion;
      meldung = [];
      soundTipp('bauen');
      return true;
    }
    const r = await bauAusfuehren(auftrag);
    if ('hindernisse' in r) {
      meldung = r.hindernisse;
      return false;
    }
    lage = r;
    if (testRohstoffe) probeBastion = r.bastion;
    meldung = [];
    versetzt = undefined;
    if (auftrag.art === 'beginnen') soundTipp('bauen');
    else if (auftrag.art === 'aufstellen' || auftrag.art === 'versetzen') soundTipp('aufstellen');
    return true;
  }

  const name = gebaeudeName;
  const wozu = gebaeudeWozu;

  function kostenText(k: Kosten): string {
    return [
      k.fleiss > 0 ? menge('fleiss', k.fleiss) : '',
      k.behalten > 0 ? menge('behalten', k.behalten) : '',
      k.koennen > 0 ? menge('koennen', k.koennen) : '',
      k.schritt > 0 ? menge('schritt', k.schritt) : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function hindernisText(h: BauHindernis, typ: GebaeudeTyp, stufe: number): string {
    if (h === 'voraussetzung') {
      const b = KATALOG[typ].stufen[stufe - 1]?.braucht;
      if (b) return `${tt('bastion.braucht')} ${name(b.typ)} ${tt('bastion.stufe')} ${b.stufe}.`;
    }
    return tt(`bastion.hindernis.${h}` as TextSchluessel);
  }

  /** Was an jedem Angebot steht; der volle Bauplatz und fehlende Ressourcen werden zusammengefasst */
  const einzeln = (h: readonly BauHindernis[]) =>
    h.filter((x) => x !== 'kein-freier-bauplatz' && !x.startsWith('zu-wenig-'));
  const fehlt = (h: readonly BauHindernis[]) =>
    (['fleiss', 'behalten', 'koennen'] as const)
      .filter((r) => h.includes(`zu-wenig-${r}`))
      .map(ressourceName);
  /** B-14: zuerst Banner und Späherturm, dann der übrige Katalog */
  const REIHENFOLGE: readonly GebaeudeTyp[] = [
    'zeichen',
    'turm',
    ...GEBAEUDE_TYPEN.filter((x) => x !== 'zeichen' && x !== 'turm'),
  ];

  interface Angebot {
    readonly typ: GebaeudeTyp;
    readonly stufe: number;
    readonly ausbau?: Bauwerk;
    readonly hindernisse: readonly BauHindernis[];
  }

  const sichtBastion = $derived(
    lage ? (testRohstoffe && probeBastion ? probeBastion : lage.bastion) : undefined,
  );
  const sichtKonto = $derived(lage ? anzeigeKonto(lage.konto, testRohstoffe) : undefined);
  const belegt = $derived(
    sichtBastion !== undefined && sichtBastion.vorhaben.length >= plaetze(sichtBastion),
  );

  // Neubauten: alles, was in dieser Epoche noch dazukommen kann
  const neubauten = $derived.by((): Angebot[] => {
    const b = sichtBastion;
    const k = sichtKonto;
    if (!b || !k) return [];
    const platz = epochenstand(b, k).bauplatz;
    return REIHENFOLGE.flatMap((typ) => {
      const pos = freierPlatz(b, typ, platz);
      const h = beginnHindernisse(b, k, typ, { pos: pos ?? { x: 0, y: 0 } });
      if (!pos && !h.includes('belegt')) h.push('belegt');
      if (h.includes('nicht-baubar') || h.includes('hoechstzahl')) return [];
      return [{ typ, stufe: 1, hindernisse: h }];
    });
  });

  // Ausbau: jedes Gebäude, das noch eine Stufe höher kann
  const ausbauten = $derived.by((): Angebot[] => {
    const b = sichtBastion;
    const k = sichtKonto;
    if (!b || !k) return [];
    return b.bauwerke.flatMap((bw) => {
      const h = beginnHindernisse(b, k, bw.typ, { ausbau: bw.id });
      if (h.includes('nicht-baubar') || h.includes('hoechststufe')) return [];
      return [{ typ: bw.typ, stufe: bw.stufe + 1, ausbau: bw, hindernisse: h }];
    });
  });

  const gebaeude = $derived(
    [...(sichtBastion?.bauwerke ?? [])].sort(
      (a, b) =>
        REIHENFOLGE.indexOf(a.typ) - REIHENFOLGE.indexOf(b.typ) ||
        a.pos.y - b.pos.y ||
        a.pos.x - b.pos.x,
    ),
  );
  const datum = (ms: number) =>
    new Date(ms).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
  const feld = (x: number, y: number) =>
    `${tt('bastion.spalte')} ${x + 1}, ${tt('bastion.reihe')} ${y + 1}`;
</script>

<section
  class="bastion"
  class:szene={geladen && !!lage && !einstellungenOffen}
  class:probe={testRohstoffe && !einstellungenOffen}
  aria-label={testRohstoffe ? t('bastion.probe-rand') : undefined}
>
  {#if !(geladen && lage && !einstellungenOffen)}
    <header class="kopf">
      <h2>{tt('bastion.ueberschrift')}</h2>
      <button
        class="zahnrad"
        aria-expanded={einstellungenOffen}
        aria-controls="bastion-einstellungen"
        aria-label={t('bastion.einstellungen')}
        onclick={() => (einstellungenOffen = !einstellungenOffen)}
      >
        <Symbol name="einstellungen" />
      </button>
    </header>
  {/if}

  {#if geladen && !lage}
    <p>{tt('bastion.ohne-speicher')}</p>
  {:else if lage && sichtBastion && sichtKonto}
    {@const l = lage}
    {@const b = sichtBastion}
    {@const k = sichtKonto}
    {@const epoche = epochenstand(b, k)}

    {#if !einstellungenOffen}
      <h2 class="unsichtbar">{tt('bastion.ueberschrift')}</h2>
      <div class="oben" role="toolbar" aria-label={tt('bastion.ueberschrift')}>
        <div class="oben-start">
          {#if onzumStart}
            <button class="icon" aria-label={t('bastion.zur-startseite')} onclick={onzumStart}>
              <Symbol name="start" />
            </button>
          {/if}
          {#if hinterhofFelder.length > 0}
            <button
              class="icon"
              aria-label={blick === 'bauplatz'
                ? tt('hinterhof.zur-szene')
                : tt('hinterhof.zum-bauplatz')}
              onclick={() => (blick = blick === 'bauplatz' ? 'hinterhof' : 'bauplatz')}
            >
              <Symbol name="hinterhof" />
            </button>
          {/if}
        </div>
        <BastionSpielLeiste
          konto={k}
          vorrat={anzeigeVorrat(b.vorrat, testRohstoffe)}
          {testRohstoffe}
          {ausUeben}
          bind:bauOffen={bauBlattOffen}
        />
        <button
          class="icon zahnrad"
          aria-expanded={false}
          aria-controls="bastion-einstellungen"
          aria-label={t('bastion.einstellungen')}
          onclick={() => (einstellungenOffen = true)}
        >
          <Symbol name="einstellungen" />
        </button>
      </div>
      {#if testRohstoffe}
        <p class="test-hinweis" role="status">{t('bastion.test-rohstoffe-aktiv')}</p>
      {/if}
      <Bauplatz
        bastion={b}
        onaktion={ausfuehren}
        {hinterhofFelder}
        bauplatz={epoche.bauplatz}
        epoche={epoche.epoche}
        {spannung}
        konto={k}
        buecher={l.buecher.length}
        hinterhofKnopf={false}
        blattOffen={bauBlattOffen}
        bind:blick
      />
      {#if bauBlattOffen}
        <BastionBauBlatt
          neubauten={neubauten.map((a) => ({
            ...a,
            kostenText: (() => {
              const ko = kosten(a.typ, a.stufe);
              return ko ? kostenText(ko) : '';
            })(),
          }))}
          ausbauten={ausbauten.map((a) => ({
            ...a,
            kostenText: (() => {
              const ko = kosten(a.typ, a.stufe);
              return ko ? kostenText(ko) : '';
            })(),
          }))}
          {belegt}
          epoche={epoche.epoche}
          istZiel={(a) => ist(a, ziel)}
          {hindernisText}
          onschliessen={() => (bauBlattOffen = false)}
          onvormerken={(a) => merken(vormerken(b, a.typ, a.ausbau?.id))}
          onbauen={(a) =>
            void ausfuehren({
              art: 'beginnen',
              typ: a.typ,
              ...(a.ausbau ? { ausbau: a.ausbau.id } : {}),
            }).then((ok) => {
              if (ok) bauBlattOffen = false;
            })}
        />
      {/if}
    {/if}

    {#if einstellungenOffen}
      <div id="bastion-einstellungen" class="einstellungen">
        <h3>{t('bastion.einstellungen')}</h3>
        {#if onzumStart}
          <button class="zurueck-einstellungen" onclick={onzumStart}
            >← {t('bastion.zur-startseite')}</button
          >
        {/if}
        <button class="zurueck-einstellungen" onclick={() => (einstellungenOffen = false)}
          >← {t('bastion.zur-bastion')}</button
        >
        <BastionDarstellung
          onBildAus={() => {
            void bildSetzen(false);
            einstellungenOffen = true;
          }}
        />
        <OrientierungWahl />
        {#if onbewaehrung}
          {@const joker = turmJoker(b.bauwerke)}
          <section class="bewaehrung" aria-labelledby="bewaehrung-titel">
            <h3 id="bewaehrung-titel">{tt('bastion.bewaehrung')}</h3>
            <p class="leise">{tt('bastion.bewaehrung-erklaerung')}</p>
            <p class="leise">
              {tt('bastion.bewaehrung-joker')}: {joker}
            </p>
            <fieldset class="modus">
              <legend>{tt('bastion.bewaehrung-modus')}</legend>
              <label>
                <input type="radio" bind:group={bewaehrungModus} value="ueben" />
                {tt('bastion.bewaehrung-ueben')}
              </label>
              <label>
                <input type="radio" bind:group={bewaehrungModus} value="ernstfall" />
                {tt('bastion.bewaehrung-ernstfall')}
              </label>
            </fieldset>
            <button
              onclick={() =>
                onbewaehrung(
                  bewaehrungModus,
                  kompetenzen
                    .filter((k) => k.klassenstufe_typisch.includes(klasse))
                    .map((k) => k.id),
                  bewaehrungModus === 'ueben' ? joker : 0,
                )}>{tt('bastion.bewaehrung-start')}</button
            >
          </section>
        {/if}

        <h3>{tt('bastion.vorrat')}</h3>
        {#if testRohstoffe}
          <p class="leise" role="status">{t('bastion.test-rohstoffe-aktiv')}</p>
        {/if}
        <ul class="vorrat">
          {#each [['fleiss', 'ueben'], ['behalten', 'wiederholen'], ['koennen', 'diagnose']] as const as [r, symbol] (r)}
            <li>
              <Symbol name={symbol} /><span
                >{testRohstoffe ? t('bastion.test-unendlich') : menge(r, l.konto.stand[r])}</span
              >
            </li>
          {/each}
          <li>
            <Symbol name="bastion" /><span
              ><strong>{testRohstoffe ? t('bastion.test-unendlich') : l.bastion.vorrat}</strong>
              {tt('bastion.bauschritte-vorrat')}</span
            >
          </li>
        </ul>
        <p class="leise">{tt('bastion.bauschritte-erklaerung')}</p>

        {#if ziel && zielZustand && !zielZustand.erreicht}
          {@const z = ziel}
          {@const fehlend = (['fleiss', 'behalten', 'koennen'] as const)
            .filter((r) => zielZustand.fehlt[r] > 0)
            .map((r) => menge(r, zielZustand.fehlt[r]))}
          {@const k = kosten(z.typ, z.stufe)}
          {@const gesamt = k ? k.fleiss + k.behalten + k.koennen : 0}
          {@const offen =
            zielZustand.fehlt.fleiss + zielZustand.fehlt.behalten + zielZustand.fehlt.koennen}
          <section class="vorgemerkt" aria-labelledby="ziel-titel">
            <h3 id="ziel-titel">
              {tt('bastion.dein-ziel')}
              {name(z.typ)}{#if z.gebaeude}, {tt('bastion.stufe')} {z.stufe}{/if}
            </h3>
            {#if gesamt > 0}
              <progress
                max={gesamt}
                value={Math.max(0, gesamt - offen)}
                aria-label={tt('bastion.ziel-fortschritt')}
              ></progress>
            {/if}
            {#if fehlend.length > 0}
              <p>{tt('bastion.fehlt')} {fehlend.join(', ')}</p>
            {:else if zielZustand.hindernisse.length === 0}
              <p>{tt('bastion.alles-da')}</p>
            {/if}
            {#each zielZustand.hindernisse as h (h)}
              <p class="leise">{hindernisText(h, z.typ, z.stufe)}</p>
            {/each}
            <button onclick={() => merken(undefined)}>{tt('bastion.nicht-vormerken')}</button>
          </section>
        {/if}

        {#if epoche.fertig}
          <p class="geschafft" role="status">{tt('bastion.geschafft-ende')}</p>
        {:else}
          <h3>{tt('bastion.ziel-der-epoche')} {epoche.epoche}: {wort(epoche.nameKey)}</h3>
          <ul class="ziel">
            <li>
              {epoche.kern >= epoche.ziel.kern ? '✓' : '○'}
              {wort('gebaeude.kern')}
              {tt('bastion.auf-stufe')}
              {epoche.ziel.kern}
              ({tt('bastion.stufe')}
              {epoche.kern})
            </li>
            <li>
              {epoche.bauplaene >= epoche.ziel.bauplaene ? '✓' : '○'}
              {Math.min(epoche.bauplaene, epoche.ziel.bauplaene)}
              {tt('bastion.von')}
              {epoche.ziel.bauplaene}
              {tt('bastion.ziel-bauplaene')}
            </li>
          </ul>
          <p class="leise">{tt('bastion.ziel-erklaerung')}</p>
        {/if}

        {#if meldung.length > 0}
          <p class="meldung" role="status">
            {meldung.map((h) => tt(`bastion.hindernis.${h}` as TextSchluessel)).join(' ')}
          </p>
        {/if}

        {#if l.bastion.vorhaben.length > 0}
          <h3>{tt('bastion.im-bau')}</h3>
          <ul class="liste">
            {#each l.bastion.vorhaben as v (v.id)}
              <li>
                <span>
                  <strong>{name(v.typ)}</strong>
                  {#if v.stufe > 1}{tt('bastion.auf-stufe')} {v.stufe}{/if}
                  <br />
                  <progress max={v.bedarf} value={v.fortschritt}></progress>
                  {tt('bastion.bauschritten')}: {v.fortschritt}
                  {tt('bastion.von')}
                  {v.bedarf}
                </span>
                <button onclick={() => void ausfuehren({ art: 'abbrechen', vorhaben: v.id })}
                  >{tt('bastion.abbrechen')}</button
                >
              </li>
            {/each}
          </ul>
          <p class="leise">{tt('bastion.abbrechen-erklaerung')}</p>
        {/if}

        {#snippet angebot(a: Angebot)}
          {@const k = kosten(a.typ, a.stufe)}
          <li>
            <span>
              <strong>{name(a.typ)}</strong>
              {#if a.ausbau}{tt('bastion.auf-stufe')} {a.stufe}{/if}
              <br /><small class="leise">{wozu(a.typ)}</small>
              {#if k}<br /><small>{tt('bastion.kosten')} {kostenText(k)}</small>{/if}
              {#each einzeln(a.hindernisse) as h (h)}
                <br /><small class="hindernis">{hindernisText(h, a.typ, a.stufe)}</small>
              {/each}
              {#if fehlt(a.hindernisse).length > 0}
                <br /><small class="hindernis"
                  >{tt('bastion.reicht-nicht')} {fehlt(a.hindernisse).join(', ')}</small
                >
              {/if}
            </span>
            <span class="knoepfe">
              {#if a.hindernisse.length > 0}
                {#if ist(a, ziel)}
                  <small class="leise">{tt('bastion.vorgemerkt')}</small>
                {:else}
                  <button
                    onclick={() => lage && merken(vormerken(lage.bastion, a.typ, a.ausbau?.id))}
                    >{tt('bastion.vormerken')}</button
                  >
                {/if}
              {/if}
              <button
                disabled={a.hindernisse.length > 0}
                onclick={() =>
                  void ausfuehren({
                    art: 'beginnen',
                    typ: a.typ,
                    ...(a.ausbau ? { ausbau: a.ausbau.id } : {}),
                  })}>{a.ausbau ? tt('bastion.knopf-ausbauen') : tt('bastion.knopf-bauen')}</button
              >
            </span>
          </li>
        {/snippet}

        <h3>{tt('bastion.bauen')}</h3>
        {#if belegt}<p class="leise">{tt('bastion.hindernis.kein-freier-bauplatz')}</p>{/if}
        <ul class="liste">
          {#each neubauten as a (a.typ)}{@render angebot(a)}{/each}
        </ul>

        {#if ausbauten.length > 0}
          <h3>{tt('bastion.ausbauen')}</h3>
          <ul class="liste">
            {#each ausbauten as a (a.ausbau?.id)}{@render angebot(a)}{/each}
          </ul>
        {/if}

        <h3>{tt('bastion.gebaeude')}</h3>
        <ul class="liste">
          {#each gebaeude as b (b.id)}
            <li>
              <span>
                <strong>{name(b.typ)}</strong>
                {#if KATALOG[b.typ].stufen.length > 1}{tt('bastion.stufe')} {b.stufe}{/if}
                <br /><small class="leise">{tt('bastion.feld')}: {feld(b.pos.x, b.pos.y)}</small>
              </span>
              {#if versetzt && versetzt.id === b.id}
                <span class="versetzen">
                  <label
                    >{tt('bastion.spalte')}
                    <select bind:value={versetzt.x}>
                      {#each Array.from({ length: epoche.bauplatz.breite }, (_, i) => i) as i (i)}
                        <option value={i}>{i + 1}</option>
                      {/each}
                    </select></label
                  >
                  <label
                    >{tt('bastion.reihe')}
                    <select bind:value={versetzt.y}>
                      {#each Array.from({ length: epoche.bauplatz.tiefe }, (_, i) => i) as i (i)}
                        <option value={i}>{i + 1}</option>
                      {/each}
                    </select></label
                  >
                  <button
                    disabled={platzHindernisse(
                      l.bastion,
                      b.typ,
                      { x: versetzt.x, y: versetzt.y },
                      b.id,
                      epoche.bauplatz,
                    ).length > 0}
                    onclick={() =>
                      versetzt &&
                      void ausfuehren({
                        art: 'versetzen',
                        gebaeude: b.id,
                        pos: { x: versetzt.x, y: versetzt.y },
                      })}>{tt('bastion.hierhin')}</button
                  >
                </span>
              {:else}
                <span class="knoepfe">
                  <button onclick={() => (versetzt = { id: b.id, x: b.pos.x, y: b.pos.y })}
                    >{tt('bastion.versetzen')}</button
                  >
                  {#if einlagerbar(b.typ)}
                    <button onclick={() => void ausfuehren({ art: 'einlagern', gebaeude: b.id })}
                      >{tt('bastion.einlagern')}</button
                    >
                  {/if}
                </span>
              {/if}
              {#if einlagerbar(b.typ) && versetzt?.id !== b.id}
                <FarbWahl
                  farbe={b.farbe}
                  name={`farbe-${b.id}`}
                  onwahl={(f) => void ausfuehren({ art: 'gestalten', gebaeude: b.id, farbe: f })}
                />
              {/if}
            </li>
          {/each}
        </ul>
        <p class="leise">{tt('bastion.versetzen-erklaerung')}</p>

        {#if l.bastion.lager.length > 0}
          <h3>{tt('bastion.lager')}</h3>
          <ul class="liste">
            {#each l.bastion.lager as b (b.id)}
              <li>
                <strong>{name(b.typ)}</strong>
                <button onclick={() => void ausfuehren({ art: 'aufstellen', gebaeude: b.id })}
                  >{tt('bastion.aufstellen')}</button
                >
              </li>
            {/each}
          </ul>
          <p class="leise">{tt('bastion.lager-erklaerung')}</p>
        {/if}

        <h3>{tt('bastion.buecher')}</h3>
        <p class="leise">{tt('bastion.buecher-erklaerung')}</p>
        {#if l.buecher.length === 0}
          <p>{tt('bastion.buecher-leer')}</p>
        {:else}
          <ul class="regal">
            {#each l.buecher as buch (`${buch.kompetenz}@${buch.niveau}`)}
              <li>
                {wort('wissen-zeichen')}
                {kannSatz.get(buch.kompetenz) ?? buch.kompetenz}
                <small class="leise"
                  >({tt(buch.niveau === 'M' ? 'niveau.M' : 'niveau.G')}, {tt('bastion.seit')}
                  {datum(Date.parse(buch.seit))})</small
                >
              </li>
            {/each}
          </ul>
          {#if !l.bastion.bauwerke.some((b) => b.typ === 'wissen')}
            <p class="leise">{tt('bastion.buecher-ohne-stube')}</p>
          {/if}
        {/if}

        {#if l.bastion.fertig.length > 0}
          <h3>{tt('bastion.geschichte')}</h3>
          <ul>
            {#each [...l.bastion.fertig].reverse() as f (f.vorhaben)}
              <li>
                {name(f.typ)}{#if KATALOG[f.typ].stufen.length > 1}, {tt('bastion.stufe')}
                  {f.stufe}{/if}
                – {tt('bastion.fertig-am')}
                {datum(f.ts)}
              </li>
            {/each}
          </ul>
        {/if}

        <fieldset class="themen">
          <legend>{tt('bastion.thema')}</legend>
          {#each THEMEN as th (th)}
            <label
              ><input
                type="radio"
                name="thema"
                checked={aktiv.thema === th}
                onchange={() => themaWaehlen(th)}
              />
              {wort('name', th)}</label
            >
          {/each}
        </fieldset>
        <p class="leise">{tt('bastion.thema-erklaerung')}</p>

        {#if wetterEinstellen}
          <WetterEinstellung durch="jugendlich" />
        {/if}

        <Hinterhof {kompetenzen} {staende} {aufgaben} {klasse} />
      </div>
    {/if}
  {/if}
</section>

<style>
  .bastion {
    display: grid;
    gap: var(--abstand-s);
  }

  .bastion.szene {
    position: relative;
    gap: 0;
    block-size: 100%;
    min-block-size: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    background: var(--farbe-himmel);
  }

  .kopf {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
  }

  .kopf h2 {
    margin-block: 0;
  }

  /* Eine Chrome-Zeile: Hinterhof | Vorrat/Bauen | Zahnrad – Spalten, kein Overlap */
  .oben {
    position: absolute;
    inset-block-start: var(--abstand-s);
    inset-inline: var(--abstand-s);
    z-index: 3;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--abstand-s);
    pointer-events: none;
  }

  .oben > :global(*) {
    pointer-events: auto;
  }

  .oben-start {
    display: flex;
    flex-shrink: 0;
    gap: 0.35rem;
  }

  .test-hinweis {
    position: absolute;
    inset-block-start: 3.5rem;
    inset-inline: var(--abstand-s);
    z-index: 3;
    margin: 0;
    padding: 0.35rem 0.6rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    color: var(--farbe-text-leise);
    font-size: 0.8rem;
    font-weight: 700;
    pointer-events: none;
    text-align: center;
  }

  /* Probe-Bastion: Skizzenpapier-Rand (M73) */
  .bastion.probe.szene {
    outline: 3px dashed color-mix(in srgb, var(--farbe-akzent-warm) 70%, var(--farbe-rand));
    outline-offset: -6px;
    background-image:
      linear-gradient(
        color-mix(in srgb, var(--farbe-flaeche) 35%, transparent),
        color-mix(in srgb, var(--farbe-flaeche) 35%, transparent)
      ),
      repeating-linear-gradient(
        -12deg,
        transparent,
        transparent 11px,
        color-mix(in srgb, var(--farbe-rand) 18%, transparent) 11px,
        color-mix(in srgb, var(--farbe-rand) 18%, transparent) 12px
      );
    background-blend-mode: multiply;
  }

  @media (orientation: landscape) and (height < 30rem) {
    .oben {
      inset-block-start: max(0.35rem, env(safe-area-inset-top, 0px));
      gap: 0.35rem;
    }
  }

  .icon,
  .zahnrad {
    font: inherit;
    display: grid;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    cursor: pointer;
    flex-shrink: 0;
  }

  .unsichtbar {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .einstellungen {
    display: grid;
    gap: var(--abstand-s);
  }

  .zurueck-einstellungen {
    font: inherit;
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
    min-block-size: 2.75rem;
    justify-self: start;
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--abstand-s);
  }

  @media (width >= 36rem) {
    .vorrat {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .vorrat li {
    display: grid;
    justify-items: center;
    gap: 0.25rem;
    padding: var(--abstand-s);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
    color: var(--farbe-akzent);
    text-align: center;
  }

  .vorrat span {
    color: var(--farbe-text);
    font-weight: 700;
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
    padding: var(--abstand-s) var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
  }

  .themen {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .themen label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .ziel {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .geschafft {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
    font-weight: bold;
  }

  .regal {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .hindernis {
    color: var(--farbe-text-leise);
  }

  .meldung {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .vorgemerkt {
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    border-inline-start: 6px solid var(--farbe-akzent);
    padding: var(--abstand-m);
    display: grid;
    gap: var(--abstand-s);
  }

  .vorgemerkt h3,
  .vorgemerkt p {
    margin: 0;
  }

  .vorgemerkt button {
    justify-self: start;
  }

  .bewaehrung {
    margin-block: var(--abstand-m);
  }

  .bewaehrung .modus {
    border: none;
    padding: 0;
    margin-block: var(--abstand-s);
    display: flex;
    flex-direction: column;
    gap: var(--abstand-xs);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    justify-content: flex-end;
  }

  .versetzen {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
  }

  progress {
    inline-size: 8rem;
    accent-color: var(--farbe-akzent);
  }

  .vorgemerkt progress {
    inline-size: 100%;
    block-size: 0.75rem;
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
