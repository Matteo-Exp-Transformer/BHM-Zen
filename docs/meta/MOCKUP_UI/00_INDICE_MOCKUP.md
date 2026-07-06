# Mockup UI — direzione visiva BHM v.2

> **Stato**: 🟢 ATTIVO · **Creato**: 2026-07-05
> **Fonte di verità della direzione**: [`../MASTERPLAN_RILANCIO_BHM_v2.md`](../MASTERPLAN_RILANCIO_BHM_v2.md) §13.
> Questi file **mostrano** ciò che il §13 **decide**. Se divergono, vince il masterplan (e allinealo).

## A cosa serve questa cartella (doppio uso)

1. **Fonte unica di verità per costruire la UI** — quando si ricostruisce la UI ad hoc (repo nuova),
   questi mockup HTML self-contained sono il riferimento visivo/interazione approvato dall'owner:
   palette, tipografia, gerarchia, pattern dei 3 gesti-firma, micro-interazioni.
2. **Materiale marketing / demo / video** — sono navigabili in browser, girano ovunque (mobile→desktop),
   light/dark: usabili per promo, screenshot, video presentativi del prodotto.

## Come aprirli

File `.html` self-contained (nessuna dipendenza esterna): doppio click → si aprono nel browser.
Interattivi. Toggle light/dark disponibile dove il visore lo espone.

## Indice mockup

| # | Schermata | File | Gesti-firma dimostrati | Artifact online |
|---|-----------|------|------------------------|-----------------|
| 1 | **Oggi** (dipendente) | [`01_OGGI_dipendente.html`](./01_OGGI_dipendente.html) | 🌡️ temperatura che atterra · 🔖 timbro fine turno · spunta ottimistica | https://claude.ai/code/artifact/13f022b8-34d5-41a5-bee1-5af908e17a5d |
| 2 | **Reparto** (Cucina — mappa punti + temperatura dallo spazio) | [`02_REPARTO_cucina.html`](./02_REPARTO_cucina.html) | 🗺️ schematico punti · 🌡️ registra dal punto · 💧 assaggio cascata | https://claude.ai/code/artifact/7ab16ce0-b5ee-4366-8028-82c7d58dd521 |
| 3 | **Form a cascata** che si scioglie ✅ | [`03_FORM_CASCATA.html`](./03_FORM_CASCATA.html) | 💧 opzioni che svaniscono (ritmo lento) · sussurro HACCP · parametri pre-compilati | https://claude.ai/code/artifact/eb037d91-3315-49eb-9285-0a36c514488b |
| 4 | **Regia** — vista titolare su tablet (respiro + "Genera dossier") | [`04_REGIA_titolare.html`](./04_REGIA_titolare.html) | 🫧 respiro azienda · 📦 dossier che si assembla · side-rail (unfold desktop) | https://claude.ai/code/artifact/a9dd38c4-11e3-4715-b579-71570c3ad9f3 |
| 5 | **Onboarding titolare** — barra cantiere chiudibile/navigabile + temperatura dal profilo · 🔄 **v2 — attesa ok owner** | [`05_ONBOARDING_admin.html`](./05_ONBOARDING_admin.html) | 🏗️ 7 aree navigabili · 🌡️ temperatura che atterra read-only (dal profilo) · barra che apre/chiude sul progresso | https://claude.ai/code/artifact/face8ef3-3591-4bb0-a81b-eae7a5fd72fa |
| 6 | **Scheletro di navigazione** — le 4 case su mobile **e** desktop, ruolo/reparti commutabili · 🔄 **proposto — attesa ok navigazione** | [`06_NAVIGAZIONE_shell.html`](./06_NAVIGAZIONE_shell.html) | 🧭 side-rail (desktop) ↔ bottom-bar (mobile) sincronizzati · barra che si trasforma col ruolo · tab Reparti dinamica · "stesso item, due lenti" | https://claude.ai/code/artifact/d4947df9-7c2c-4212-b9e5-d599a48aff69 |
| 7 | **Scorte** v2 — inventario-mansione + spesa flessibile · 🔄 **proposto** | [`07_SCORTE.html`](./07_SCORTE.html) | 📦 **Inventario = mansione** (giro punti → conta rimanenze col +/− → conferma scadenza) · ingredienti **per categoria** · «dovrei avere N / ho M» · spesa auto-compilata ma **libera** (no completamento) | https://claude.ai/code/artifact/e1e1a5d2-033b-443f-a41a-6757d4fe8204 |

> 📋 Mappa dei campi per ogni step (fonte legacy) → [`MAPPATURA_ONBOARDING_STEP.md`](./MAPPATURA_ONBOARDING_STEP.md). È la base del "cosa chiediamo" del mockup 5.

## Note di interazione (feedback owner — regole per il build reale)

- **Form a cascata (💧) — ritmo obbligato**: la sequenza è *selezione → **mostro le possibilità** (tempo per vederle) → **scioglimento lento** delle incompatibili → **scelta corretta evidenziata***. L'animazione NON deve essere veloce: se è troppo rapida si perde il senso didattico (l'owner "non ha visto bene l'animazione" nella v1). Tempi attuali nel mockup 3: ~1,1s di lettura, sussurro, poi melt scaglionati ~240ms, poi pulse sul "consigliato". Da preservare in produzione (con `prefers-reduced-motion` che salta le pause).
- **Scroll / rivelazione dei passi — da migliorare (feedback owner)**: lo **scorrimento automatico** quando si rivela un nuovo passo non è super fluido; l'auto-scroll dello schermo risulta **troppo caotico**. In produzione: rivelazione dei passi **più lenta e in dissolvenza** (fade-in morbido) e **niente salto di scroll brusco** — il nuovo passo emerge dolcemente sotto, senza spostare lo schermo di colpo. Vale per la cascata (mockup 3) e ovunque un contenuto si riveli progressivamente. _(annotato, non ancora implementato)_
- **⏱️ TEMPO delle animazioni — regola GLOBALE dell'app (feedback owner, 2026-07-06)**: le animazioni sono **troppo veloci**. La sensazione da trasmettere **non è fretta** ma **pulizia nitida e tranquilla** — movimenti calmi, distesi, che si leggono bene. Vale per **tutte** le animazioni dell'app (non solo l'onboarding): la coreografia "card che si alza → raggruppa → vola nella sidebar" del mockup 5, la cascata, la rivelazione dei passi, i micro-feedback. In pratica: **durate più lunghe**, easing morbido, nessuna transizione che dia sensazione di scatto/urgenza; le pause fanno parte del gesto. _(annotato, mockup 5 non ancora rallentato — da applicare qui e come default di sistema.)_

### Mockup 5 — Onboarding titolare · feedback owner v1 → ✅ risolti in v2 (2026-07-05)

> **v2 pubblicata** (stesso artifact `face8ef3`). Prima è stata scritta la **mappa dei 7 step**
> ([`MAPPATURA_ONBOARDING_STEP.md`](./MAPPATURA_ONBOARDING_STEP.md), su richiesta owner: "capire cosa chiedere e poi fare UI").
> Come sono stati affrontati i 5 punti (attesa validazione owner prima di blindare §13.8):
>
> 1. **Caos/mobile** → layout a **2 zone** (barra + pannello), l'anteprima «La tua azienda» ora vive **dentro** la barra aperta (niente 3ª colonna). Mobile = colonna singola con barra-striscia in alto; breakpoint a 760px.
> 2. **Temperatura fissa** → rimossi i `±`. Flusso Frigo: **attrezzatura → profilo** (5 profili con temp reali 2/3/4/1/4°C); la temperatura **atterra read-only** con pill «decisa dal profilo» e le **categorie si auto-assegnano**. Reso esplicito il concetto «profilo punto di conservazione».
> 3. **Barra chiudibile** → chiusa mentre compili; su «Aggiungi» si apre in animazione a mostrare il progresso, poi si richiude da sola (se non l'hai aperta a mano). Toggle sempre disponibile.
> 4. **Non saltabile** → link «saltare» **rimosso**.
> 5. **Aree navigabili** → i 7 passi (mini-dots e lista) sono **cliccabili**; i futuri sono lucchettati finché non si sbloccano.

_(Nota residua per Track A: il «profilo punto di conservazione» va replicato anche nel **modal della pagina Conservazione** — da mockup-are separatamente, non in questo file.)_

<details><summary>Testo originale feedback v1 (storico)</summary>

Concept (cantiere che si popola + anteprima azienda viva) **promosso in principio**, ma la v1 andava rifatta sui punti sotto.

1. **Troppo caotico + dubbio compatibilità mobile.** L'idea della compilazione che si arricchisce man mano è buona, ma il layout a 3 colonne (cantiere + modal + anteprima) è **denso e probabilmente non regge su mobile**. Va **semplificato** e va **definita davvero la resa mobile**, non solo dichiarata.
2. **Temperatura target = valore FISSO, non modificabile dall'utente.** ❌ Rimuovere i pulsanti `± ` e ogni gesto di modifica manuale della temperatura. **È l'app che decide** la temperatura **in base al PROFILO** del punto scelto.
   - ⚠️ **Manca il concetto di «profilo punto di conservazione»** nel flusso. Se non vive nell'onboarding, vive nella **pagina Conservazione** dell'app → **modal di inserimento/modifica punto di conservazione**. Il profilo determina la temperatura consigliata/target. _(cfr. legacy: `profileId`, `applianceCategory` già presenti nei dati prefill — la logica esiste, va resa esplicita in UI.)_
3. **Barra laterale sinistra (cantiere) CHIUDIBILE per guadagnare spazio.** Coreografia desiderata:
   - Mentre **compilo il modal** → barra **chiusa** (massimo spazio alla compilazione).
   - Quando **aggiungo/finisco** → **animazione**: la barra **si apre**, mostra il **progresso aggiornato**, poi **si richiude** lasciando a sinistra un **riassunto compatto del progresso**; quindi l'inquadratura **si riapre sul modal successivo**.
   - **Stesso comportamento su mobile.**
   - 🎯 Vincolo forte: UI **davvero compatibile mobile** E che **sfrutti sul serio lo spazio desktop** per una compilazione comoda.
4. **Onboarding NON saltabile** — è una **configurazione obbligatoria**. ❌ Rimuovere il link «saltare» in basso a sinistra. _(NB: contraddice il wizard legacy che ha il tasto «Salta» → in produzione va tolto anche lì.)_
5. **I pulsanti nella barra sinistra devono essere CLICCABILI** → devono permettere la **navigazione tra le aree** già configurate (non sono solo indicatori di stato).

</details>

## Direzione bloccata (sintesi §13)

- **Temperamento**: clinico-caldo — ground greige caldo, card bianche crisp, inchiostro caldo.
- **Accento**: terracotta `#C0552E`, solo sulle azioni. Verdetti semantici separati: verde/oro/rosso.
- **Type**: sans, niente serif (evita il cliché AI); cifre tabellari protagoniste.
- **Interazione**: UI ottimistica, delizia nel feedback, voce umana da cucina, icone disegnate (no emoji in UI).
- **Device**: responsive-everywhere; mobile perfetto, desktop/tablet come banco sempre-acceso.

---

**Ultimo aggiornamento**: 2026-07-06 · serie base 4/4 approvata · mockup 5 v2 · mockup 6 Navigazione · **mockup 7 Scorte** pubblicato (inventario + scadenze + «cosa manca → lista spesa» + spunta liste). **Onboarding dipendente**: NON si mockup-a — decisione owner = stesso stile dell'onboarding admin ma **semplificato**, **carta bianca a Fable**. Residue prima di Fable: setup Regia · stati-eccezione. → report sessione mappatura/UI 2026-07-06.
