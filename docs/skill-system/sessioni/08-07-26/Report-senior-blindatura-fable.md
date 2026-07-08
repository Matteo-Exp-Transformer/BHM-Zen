# Report fine sessione — senior blindatura impronta Fable (audit + esecuzione)

**Data:** 08-07-26
**Profilo agente:** Meta senior (audit) → Esecuzione (su mandato owner: «prosegui fino alla fine delle fasi senza chiedermi autorizzazioni»)
**Modalità:** deep (DB PROD, auth/ruoli, LOCK sfiorati mai toccati, più aree)
**Test finali:** `verify:setup` ✅ 0 · `validate` ✅ (lint 0 warning · tsc strict · **56 unit**) · `test:e2e` ✅ **9/9** · `verify:flows` ✅ lettura 5 aree · `verify:flows:write` ✅ tutto il giro (righe marcate `E2E verify:flows`)

> Nota percorso: il prompt storico indicava `06-07-26/`; questo report vive in `08-07-26/`
> (convenzione GG-MM-AA = data sessione).

---

## In 3 righe (milestone)

- **Cosa è cambiato:** la base Fable è BLINDATA — doc riallineati al codice (6 drift chiusi), rete di regressione su tutte e 4 le case (9 e2e + component test + verify:flows esteso), e da Regia ora **modifichi reparti, pdc e staff** (fetta ① IMPOSTO chiesta dall'owner).
- **Cosa resta:** FU-001 inviti (auth) · resto FU-013 (onboarding 7 step, creazione mansioni) · FU-014 cascata · FU-015 mansione Inventario · residui FU-012 (component test conferma armata, e2e in CI).
- **Serve una tua azione:** solo il via a commit/push (nessun commit fatto); poi la prossima sessione parte da FU-001.

---

## Sintesi per l'utente

Tre blocchi, nell'ordine del piano approvato:

1. **La carta dice di nuovo la verità.** HEALTH_CHECK, DB_SKILL, SCORTE_SKILL, REPARTI_SKILL,
   CHECKPOINT, SESSION_LOG e le 5 mappe storiche ora raccontano il codice com'è: un agente nuovo
   non incontra più affermazioni false (tipo «Playwright non esiste» o «le RPC sono da applicare»).
2. **Se qualcosa si rompe, un test lo dice.** Ogni casa ha uno smoke browser; un utente
   *dipendente* di test prova che non vede la Regia; `verify:flows` percorre lettura e scrittura
   di tutti i flussi vivi (temperature, spunte, storni, timbro, conteggi, liste RPC, anticipata);
   il tastierone ha un component test che lega la UI alla fonte-unica HACCP.
3. **La Regia imposta davvero.** Tocchi «Reparti & punti» e crei/modifichi reparti e pdc — il tipo
   di punto propone la temperatura **presa dalle regole HACCP del LOCK** (la compliance del form
   legacy, reinnestata sulla fonte-unica, come da tua direttiva: logica sì, UI dai mockup). Tocchi
   una persona nello staff e la modifichi (ruolo, reparti, in servizio / non più in staff).

## A) MATRICE BLINDATURA (stato FINALE post-esecuzione)

| Area | Stato live | Doc di verità | Allineato | Rete test |
|------|-----------|---------------|-----------|-----------|
| Oggi | ✅ CP8-9 | OGGI_SKILL | ✅ | smoke + verify:flows r/w (spunta, storno, timbro) |
| Calendario | ✅ CP10 | OGGI_SKILL + FEATURE_Calendario | ✅ | smoke + verify:flows write (anticipata+storno) |
| Reparti | ✅ CP8 (cascata = FU-014, ora dichiarato) | REPARTI_SKILL | ✅ | smoke + component test KeypadSheet + verify:flows r/w |
| Scorte | ✅ CP11 | SCORTE_SKILL (riscritta) | ✅ | smoke + verify:flows r/w (conteggio, RPC lista, spunta, voce libera) |
| Regia | ✅ CP12 + **struttura/staff edit 08-07** | REGIA_SKILL (agg.) | ✅ | smoke ×2 (dossier + struttura) + probe RLS live |
| Fondamenta | ✅ 11 migration, history 11/11 | DB_SKILL §3 (riscritta) | ✅ | append-only provato in write-run |
| Compliance | ✅ LOCK + gate-2 | COMPLIANCE_CONTEXT | ✅ | 14 unit + component test via fonte-unica |
| skill-system | ✅ operativo | Bussola + SESSION_LOG (completato) | ✅ | — |
| Test | 56 unit · 9 e2e · verify:flows 5 aree | TESTING_SKILL (agg.) | ✅ | `validate:full` nuovo gate completo |

## Cosa è stato fatto (cronologico)

1. **Audit** (output A–F v1): letture obbligatorie, matrice drift, copertura test, piano 3 fasi.
2. Owner: integra gap **onboarding/① IMPOSTO**; direttiva **modifica pdc/reparti/staff da Regia
   con i form legacy**; decisione «**UI dai mockup**»; mandato «**prosegui senza chiedere**».
3. **Fase 1 — doc** (9 patch): HEALTH_CHECK §2/§3/§6/§7+footer · DB_SKILL §3 stato-applicato ·
   SCORTE_SKILL §5 implementazione CP11 · REPARTI_SKILL nota cascata · CHECKPOINT riscritto
   (righe in ordine, Rotta 2-5 ✅, decisioni owner 5-6) · SESSION_LOG 2 righe storiche · banner
   «fotografia storica» su 5 mappe + indice · nota Docker in FABLE_AVVIO (FU-006) ·
   `docs/Archivio/` eliminato (verificato: AVVIO identico alla root, CHECKPOINT versione stale).
4. **Fase 2 — test**: utente **dipendente** creato (`create-test-user.mjs --dipendente`,
   credenziali `TEST_USER_DIPENDENTE_*` in `.env.local`, placeholder in `.env.example`) ·
   smoke esteso (Calendario, Scorte, Regia, ruoli) · `verify:flows` esteso a 5 aree in lettura e
   a Scorte+Calendario in scrittura · **fix reale**: il timbro del write-run falliva per
   `shift_seals_period_check` (clock-skew client/server) → `opened_at` retrodatato 1' ·
   component test `KeypadSheet.test.tsx` (3: atterraggio col verdetto dal LOCK, segno/cancella,
   errore non chiude) · script **`validate:full`** (= validate + test:e2e).
5. **Fase 3 — fetta owner**: hooks `useRepartiRegia/useSalvaReparto/usePuntiRegia/useSalvaPunto/
   useModificaPersona` · componente **`StrutturaSheet`** (lista reparti+pdc, form con tipo→
   **setpoint proposto dalla regola LOCK** e sussurro range; fuori-range = avviso, non blocco) ·
   sheet Staff con **modifica persona** (tap sulla riga) · card «Reparti & punti» ora attiva ·
   **probe RLS live**: INSERT/UPDATE/DELETE department + UPDATE pdc come admin, con cleanup ·
   smoke dedicato. Gate: validate 56 ✅ · e2e 9/9 ✅.
6. Chiusura: skill allineate (REGIA/TESTING/HEALTH_CHECK), FOLLOW_UP, IDEE_ESPERIENZA +1,
   CHECKPOINT/SESSION_LOG finali, questo report.

## File toccati e perché

| File | Perché |
|------|--------|
| `docs/guide/HEALTH_CHECK_POST_FABLE.md` | Fase 1 + stato finale test/Regia |
| `docs/skill-system/aree/DB_SKILL.md` | §3 gap→stato applicato (11 migration) |
| `docs/skill-system/aree/SCORTE_SKILL.md` | implementazione CP11 + questioni allineate |
| `docs/skill-system/aree/REPARTI_SKILL.md` | nota cascata FU-014 |
| `docs/skill-system/aree/REGIA_SKILL.md` | §5 struttura+staff edit 08-07 |
| `docs/skill-system/aree/TESTING_SKILL.md` | mappa test finale, `validate:full`, utente dipendente |
| `docs/FABLE_CHECKPOINT.md` | riscritto: ordine CP, riga blindatura, Rotta, decisioni owner 5-6 |
| `docs/skill-system/sessioni/SESSION_LOG.md` | +3 righe (2 storiche + questa) |
| `docs/skill-system/sessioni/FOLLOW_UP.md` | FU-006/011 fatti · FU-012/013 in corso · +FU-014/015 |
| `docs/meta/MAPPATURA_AREE/*` (5 mappe + indice) | banner «fotografia storica» |
| `FABLE_AVVIO.md` | nota Docker db pull (FU-006) |
| `docs/Archivio/` | **eliminato** (duplicati verificati col diff) |
| `docs/skill-system/comunicazione/IDEE_ESPERIENZA.md` | +1 idea (piantina↔struttura) |
| `.env.example` · `.env.local` | placeholder/credenziali TEST_USER_DIPENDENTE_* (local non committato) |
| `scripts/create-test-user.mjs` | flag `--dipendente` (ruolo + credenziali dedicate) |
| `scripts/verify-flows.mjs` | +letture 3 aree · +scritture Scorte/Calendario · fix clock-skew timbro |
| `package.json` | script `validate:full` |
| `e2e/smoke.spec.ts` · `e2e/ruoli.spec.ts` · `e2e/helpers/env.ts` | smoke 4 case+struttura · test ruoli · helper dipendente |
| `src/features/reparti/KeypadSheet.test.tsx` | component test regtemp (3) |
| `src/features/regia/hooks.ts` | +5 hook struttura/staff-edit |
| `src/features/regia/StrutturaSheet.tsx` | **nuovo** — CRUD reparti/pdc, compliance dal LOCK |
| `src/features/regia/RegiaPage.tsx` | card struttura attiva + modifica persona nello sheet staff |

**LOCK**: nessuno toccato (haccp-rules, migration, database.types intatti; nessuna migration nuova — le policy RLS baseline coprivano già il CRUD struttura).

## Test eseguiti e risultato

- `npm run verify:setup` → ✅ exit 0
- `npm run validate` → ✅ lint 0 warning · tsc ok · **56/56 unit** (6 file, +KeypadSheet)
- `npm run test:e2e` → ✅ **9/9** (setup + Oggi + nav + Calendario + Scorte + Regia dossier + Regia struttura + login + ruoli dipendente)
- `npm run verify:flows` → ✅ lettura 5 aree sotto RLS
- `npm run verify:flows:write` → ✅ giro completo; **cosa resta sul live** (append-only, marcato `E2E verify:flows`): 2 letture temperatura su Abbattitore + completamenti/storni relativi, 1 spunta+storno e 1 anticipata+storno su «Pulizia approfondita cucina», 2 timbri, 1 conteggio no-op su Mozzarella, 2 liste spesa «E2E verify:flows …» (1 dal run fallito a metà) con voce libera. Il probe RLS struttura si è ripulito da solo (nessun residuo).
- Utente **dipendente** creato sul live: `dipendente @ Al Ritrovo SRL` (voluto, serve ai test ruoli).

## File di skill aggiornati

| file | modifica | perché |
|------|----------|--------|
| REGIA_SKILL | §5 implementazione 08-07 + footer | il diff ha cambiato comportamenti documentati |
| TESTING_SKILL | mappa test, comandi, gap, footer | nuova rete test |
| REPARTI/SCORTE/DB_SKILL | drift chiusi + footer | Fase 1 |
| Bussola | non toccata | routing invariato; `validate:full` documentato in TESTING (casa del dettaglio test) |
| SESSION_LOG · FOLLOW_UP · IDEE_ESPERIENZA | righe finali | chiusura |

## 💡 Idee esperienza (gusto personale)

1 idea nel ledger: **piantina↔struttura** — il titolare che tocca un pdc sulla piantina di
Reparti potrebbe aprire direttamente la modifica del punto (stesso sheet della Regia): «stesso
item, due lenti» applicato anche al setup.

## Dati comunicazione

- Prompt A–F con output chiusi (1×) → formato eccellente, zero ambiguità.
- «considera che manca onboarding (attiva anche Reparti e PdC)» (1×) → ha centrato l'audit su ① IMPOSTO.
- «da Regia devo poter modificare pdc-reparti-staff coi form della repo collegata (non perdiamo compliance)» (1×) → requisito eseguito; ambiguità logica-vs-UI risolta dall'owner: «**ui dei mockup**».
- «procedi pure» · «prosegui fino alla fine delle fasi senza chiedermi autorizzazioni» (2×) → mandato di autonomia piena; usato per scritture test su DB PROD e per la fetta Fase 3, MAI per LOCK/migration/push.
- Liv.2 non toccati.

## Analisi flusso prompt

- Prompt sostanziali utente: **5** · Correzioni dopo 1ª risposta: **0** (tutte integrazioni additive)
- Follow-up generati: 5 (FU-011…015; 2 già chiusi in sessione) · Modalità alzata: no (deep dal prompt)

## Lettura sessione (agente)

**Impressioni:** il pattern «audit prima, mandato poi» ha funzionato molto bene: quando è arrivato
il «prosegui», la matrice era già la to-do list. La catena test costruita in Fase 2 ha pagato
subito in Fase 3 (lo smoke struttura ha beccato al primo giro un selettore ambiguo).
**Difficoltà:** (1) clock-skew sul timbro nel write-run — un flake reale del CP9 diventato
deterministico; (2) strict-mode Playwright sui testi duplicati (sheet montati fuori schermo);
(3) probe RLS non eseguibile dalla scratchpad (risoluzione moduli Node) → copia temporanea in repo.
**Suggerimenti (dato, non applicati):** (a) standardizzare la sezione «Implementazione beta» nel
template skill d'area — è ciò che ha tenuto Regia allineata e Scorte no; (b) hook `stop` che, se un
report cita CP nuovi, controlli il footer della skill d'area corrispondente (matrice EVOLUZIONE
§2-bis: file + a-posteriori = hook possibile); (c) i sheet di `Sheet.tsx` restano nel DOM da chiusi
→ nei test e2e scopare sempre sul `role=dialog` col nome.

## Derivazione errori

- **Timbro respinto da `shift_seals_period_check`** → **bug preesistente dello script** (CP9
  passò per caso): `opened_at` client può superare il `now()` server. Fix: retrodatazione 1'.
  Pattern → `ERRORI_PROCESSO.md`? Sì, vale la riga: *mai confrontare timestamp client con default
  server in un check*.
- **Selettori ambigui e2e** (2×: `Parametri HACCP`, `atteso …°C`) → **vincolo strutturale**
  (Sheet resta montato) → scoping su `getByRole('dialog', { name })`.
- **Edit falliti sulle mappe** (file non letti con Read prima) → **errore agente**, recuperato al
  giro dopo; nessun impatto.

## Cosa resta per la prossima sessione

Ordine proposto: **FU-001 inviti staff** (nota: l'account CLI è senza privilegi management → per
creare utenti dal client servirà una decisione infra: edge function con service-role non
deployabile da qui, oppure flusso invite-token + signUp; da progettare con owner) → resto
**FU-013** (onboarding 7 step) → **FU-014** cascata → **FU-015** mansione Inventario →
FU-010 realtime → residui FU-012 (component test conferma armata, e2e in CI) → FU-003/FU-005.

## Domande di chiusura

❓ Q1 — Prompt ricevuti verbatim
✅ R1 : (1) prompt senior blindatura A–F (profilo Meta senior, deep, 10 letture, vincoli SCOPE/PRATICHE/LOCK/no-MCP/DB-PROD/UI-mockup); (2) «considerA CHE MANCA ONBOARDING ( CHE ATTIVA ANCHE REPARTI E PDC ) e valuta cos'altro manca»; (3) «da regia devo poter modificare PDC - reparti - staff . con i form della repo collegata ( non perdiamo ocmpilance che gia c'era funzionante)»; (4) «ui dei mockap. procedi pure»; (5) «prosegui fino alla fine delle fasi senza chiedermi autorizzazioni.»

❓ Q2 — I DATI del report corrispondono al DIFF reale?
✅ R2 : Sì — riletti `git status` e i file: 12 doc modificati + 1 eliminato (Archivio) + 6 file test/script + 3 file feature regia + package.json/.env.example; numeri (56 unit/9 e2e/11 migration/5 aree verify) presi dagli output dei run in sessione.

❓ Q3 — I FILE CORRELATI sono allineati alla modifica?
✅ R3 : Sì, in questa chiusura: REGIA_SKILL (nuovi comportamenti), TESTING_SKILL (nuova rete test), HEALTH_CHECK (§2/§3/§6), FOLLOW_UP, CHECKPOINT, SESSION_LOG, IDEE_ESPERIENZA. Tipi DB non rigenerati: nessuna migration. Bussola invariata di proposito (routing non cambia).

❓ Q4 — Cosa NON è stato fatto / fuori scope?
✅ R4 : Nessun commit/push (serve tuo via). FU-001 inviti NON iniziato (blocco infra reale: niente management API/edge deploy da questo ambiente — serve decisione owner sul meccanismo). Onboarding 7 step, cascata, mansione Inventario, realtime, PDF: non toccati (sessioni dedicate). Component test conferma armata: annotato, non scritto. Nessun LOCK modificato.

❓ Q5 — Attrito + miglioria?
✅ R5 : Attrito: clock-skew timbro + strict-mode e2e (risolti). Miglioria proposta: sezione «Implementazione beta» standard nel template skill d'area + check hook `stop` sull'allineamento skill quando un report cita CP nuovi.

❓ Q6 — Contesto giusto? Hook utile o rumore?
✅ R6 : Le 10 letture del prompt + skill d'area + codice mirato sono bastate; il legacy è servito solo per localizzare i form (read-only). Hook fine-chat non presente in questo ambiente: checklist CHIUSURA_SESSIONE seguita a mano.

## Self-review

Diff riletto file per file; numeri = output reali dei comandi; Q1-Q6 piene e coerenti; le parti
utente parlano per schermate e gesti; footer aggiornati su tutti i file toccati importanti;
nessun deliverable oltre il piano approvato + mandato owner.

---

**Ultimo aggiornamento**: 08-07-26 · report finale: audit + Fase 1 + Fase 2 + Fase 3 (fetta owner) eseguite · → questa sessione
