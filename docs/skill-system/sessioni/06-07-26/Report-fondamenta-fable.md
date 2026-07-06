# Report fine sessione — Fondamenta BHM-Zen (sessione Fable, avvio costruzione)

**Data:** 06-07-26
**Profilo agente:** Esecuzione (Fable, autonomo su mandato owner)
**Modalità:** deep (DB live + file LOCK + più aree)
**Test:** `npm run validate` → ✅ lint 0 warning · tsc strict ok · 14/14 test gate-2

---

## In 3 righe

- **Cosa è cambiato:** la casa nuova è in piedi — ambiente sbloccato, schema live baseline+tipi,
  skill-system operativo, app scaffoldata (gira su :3000), fonte-unica HACCP con gate-2, e le
  8 migration audit-grade **applicate sul DB live** (append-only attivo, RPC shopping deployate).
- **Cosa resta:** shell UI dai mockup, port hooks/services legacy, archetipi Ristoratore,
  export dossier — vedi FOLLOW_UP FU-001…FU-007.
- **Serve una tua azione:** no (autorizzazioni già date in sessione).

## Cosa è stato fatto (cronologico)

1. **Sblocco ambiente**: la CLI era loggata su un account senza il progetto BHM → password DB in
   `.env.local` + wrapper `scripts/sb.mjs` che la carica; tipi via `--db-url` (la management API
   risponde 403). `npm run verify:setup` → exit 0.
2. **Domande owner (tutte insieme)**: password DB ✅ · MCP vietato confermato · dati solo test ·
   utente test autorizzato. Push migration autorizzato esplicitamente in corsa.
3. **Baseline DB (verità)**: `db pull` → `20260706015742_remote_schema.sql` (37 tabelle), history
   remota riallineata (2 entry fantasma riparate). Gap delle mappe A0 **ri-verificati sul live:
   tutti confermati**.
4. **Skill-system §14.5**: bussola compilata (routing 4 case + DB + compliance, 9 RULE §14.4,
   LOCK), 3 porte (CLAUDE/AGENTS/cursor), vocabolario seed, ledger idee + aggiornamenti HACCP,
   COMPLIANCE_CONTEXT, skill-consulenti, 5 skill d'area. Didattico OFF.
5. **Scaffold app**: Vite 6 + React 18 + TS strict + Tailwind (clinico-caldo §13) + React Query +
   router (Oggi/Reparti/Scorte/Regia) + PWA. NIENTE dead code legacy. Dev server verificato
   HTTP 200. 0 vulnerabilità npm.
6. **Fonte-unica HACCP**: `src/compliance/haccp-rules.ts` (LOCK) — stampo tipato, 3 regole seed
   `pending` con source_ref (dpr-327-1980, dlgs-110-1992), verdetto-colore §13.5, validatore.
   Gate-2 = `haccp-rules.test.ts` (14 test).
7. **Migration audit-grade** (dry-run → autorizzazione owner → push): temperature_readings
   colonne 015 + `method` NOT NULL (dec.8) + append-only (dec.1, trigger + drop policy UPDATE/
   DELETE) · storno completions (`reverses_completion_id`) + policy task_completions (il live ne
   era PRIVO con RLS attiva) · `shift_seals` (dec.7) · ciclo scadenze products (dec.10) ·
   `par_level`+`stock_counts` (dec.12) · companies `vat_number`+`onboarding_completed` (dec.4) ·
   4 RPC shopping SECURITY INVOKER (dec.3) · publication realtime ×10 tabelle (dec.11).
8. **Verifiche post-push**: history 9/9 allineata · smoke REST 200 su tutti i nuovi oggetti ·
   RPC stats risponde · tipi rigenerati (2390 righe) · validate verde.
9. **Git §15**: branch `integrazione` fast-forward al lavoro e pushato; `main` e `integrazione`
   protetti (no force-push/delete) via API GitHub.

## File toccati e perché (linguaggio utente)

- **Quando registri una temperatura ora il DB pretende il metodo e non lascia più modificare o
  cancellare la lettura** — è il registro difendibile a un controllo (migrations 040000-040100).
- **Il timbro di fine turno ha la sua tabella immutabile** (`shift_seals`) pronta per il gesto-firma.
- **Le liste spesa funzionano via RPC** (prima il flusso era rotto: 4 funzioni assenti).
- **Le soglie HACCP vivono in un solo file protetto** con test che blocca i cambi malformati.
- **Chi riprende la sessione legge `docs/FABLE_CHECKPOINT.md`** e riparte dal punto giusto.

## Domande poste e risposte

| Domanda | Risposta owner |
|---------|----------------|
| Accesso DB bloccato (account CLI sbagliato) | password DB aggiunta in .env.local |
| MCP Supabase presente nell'ambiente ma vietato nei doc | divieto confermato — solo CLI |
| Dati reali sul DB condiviso? | solo dati test → migration ok |
| Utente test E2E / Vercel | credenziali in .env.local; Fable autorizzato a creare l'utente |
| Push delle 8 migration sul live | Sì, applica ora |

## Test eseguiti

`npm run validate` → ✅ (lint 0 warning, tsc strict, 14/14 gate-2) · `npm run build` → ✅ (+PWA)
· dev server HTTP 200 · smoke REST post-migration 6/6 · dry-run push = 8 migration attese.

## File di skill aggiornati (obbligatorio)

| File | Modifica | Perché |
|------|----------|--------|
| `00_BUSSOLA_SKILL.md` | compilata da template | installazione §14.5 |
| `aree/*_SKILL.md` (7) | creati | routing aree reali + consulenti |
| `context/COMPLIANCE_CONTEXT.md` | creato + ancore/razionali seed | §14.3 senso↔numeri |
| `comunicazione/VOCABOLARIO.md` | seed A+B | §14.6 |
| `comunicazione/PROPOSTE.md` | 7 nomi-elemento candidati | §14.6 (decide owner) |
| `comunicazione/IDEE_ESPERIENZA.md` · `AGGIORNAMENTI_HACCP.md` | creati | §11 · §14.3 |
| `sessioni/_TEMPLATE_REPORT.md` | sezione «💡 Idee» + footer-tracciabilità | §11.3 · §14.5.7 |
| `comunicazione/CHIUSURA_SESSIONE.md` | Parte B compilata (validate, branch §15, DB unico) | segnaposto |

## 💡 Idee esperienza (gusto personale)

- **Il verdetto-colore come API di sistema**: `computeTemperatureVerdict` restituisce
  `ok/warn/alarm` con margine "ambra" configurabile — se il margine diventasse per-categoria
  (es. surgelati più severi), il "sussurro HACCP" §13.5 potrebbe dire *perché* è ambra
  ("sei a 1° dal limite"), rendendo il sapere-che-si-rivela ancora più didattico. → annotata
  anche come nota di prodotto in COMPLIANCE_CONTEXT §4.

## Dati comunicazione

- Prompt owner: mandato unico di autonomia + 5 risposte a domande mirate. Nessuna correzione
  in corsa. Il pattern «domande tutte insieme all'inizio» ha funzionato — replicare.
- Voce Liv.2 applicate: nessuna (sessione bootstrap, vocabolario appena installato).

## La TUA lettura della sessione ⭐

- **Impressioni**: masterplan e mappe eccellenti come fonte di verità — quasi zero ambiguità
  operativa. Lo skill-system v0 si è installato senza forzature.
- **Difficoltà**: (1) account CLI ≠ account progetto (risolto con password + wrapper);
  (2) `db pull` richiede Docker e il primo tentativo troncato ha sporcato la history remota
  (riparata con `migration repair`); (3) `task_completions` live aveva RLS senza policy —
  drift non documentato nelle mappe, ora fixato in migration.
- **Migliorie suggerite** (dati, non auto-adottate): aggiornare FABLE_AVVIO §2.2 con la nota
  Docker richiesto per `db pull`; valutare bump CLI 2.109.

## Derivazione errori

| Causa | Cosa è successo | Da cosa derivava | Come si eviterà |
|-------|-----------------|------------------|-----------------|
| errore agente | pipeline PowerShell troncata ha ucciso `db pull` a metà, lasciando entry fantasma nella history remota | `Select-Object -First` chiude il pipe del processo nativo | comandi lunghi → log su file/background (fatto da CP2 in poi) |
| vincolo strutturale | 403 management API (gen types/login role) | account CLI senza il progetto BHM | wrapper `sb.mjs` + `--db-url`; documentato in checkpoint |
| bug preesistente | task_completions: RLS on, zero policy sul live | drift restore Nov-2025 | policy create in migration 040100 |

## Cosa resta per la prossima sessione

Vedi `FOLLOW_UP.md` FU-001…FU-007 (shell UI, port hooks, archetipi, testing skill, export).

## Commit della sessione

`53846be` cp1 · `2d3c370` cp2 · `fbaf5b9` cp3 · `0f4fa26`+`61e50d9` cp4 · `a902685` cp5-draft ·
(cp5 finale: tipi rigenerati + questo report — vedi git log)

---

**Ultimo aggiornamento**: 06-07-2026 · report sessione fondamenta · → questo file È il report
