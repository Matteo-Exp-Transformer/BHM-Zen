# FABLE_CHECKPOINT — stato vivo della costruzione

> **Cos'è**: il filo di Arianna della sessione Fable. Se la sessione si interrompe,
> una nuova sessione riparte da qui: legge questo file + `git log --oneline -20`.
> **Procedura**: ogni milestone = 1 commit + aggiornamento di questo file (sezione «Dove sono»).
> I dettagli del *perché* stanno nei commit e nei report; qui solo la rotta.

---

## Dove sono (aggiornare SEMPRE per ultima cosa)

- **Data**: 2026-07-06
- **Branch**: `init/fondamenta` (push ok — origin allineato post-CP12; `integrazione` ff dopo ogni milestone)
- **Fase masterplan (§6)**: ws1-3 ✅ · **ws4-6 QUASI COMPLETI**: tutte e 4 le case vive (Oggi+Calendario · Reparti · Scorte · Regia) + E2E scrittura CP9
- **Ultimo checkpoint**: CP12 + post-Fable — skill lessico (62a8f98) + Playwright smoke (35b5926)
- **Prossimo passo**: **agente senior blindatura impronta** (`PROMPT_SENIOR_BLINDATURA.md`) · poi FU-001 inviti · estensione E2E · realtime
- **Prompt ripresa pronto**: `docs/skill-system/sessioni/06-07-26/PROMPT_RIPRESA_FABLE.md` (riga «Prossimo lavoro» aggiornata post-CP8)

## Checkpoint fatti

| # | Data | Cosa | Commit |
|---|------|------|--------|
| CP1 | 2026-07-06 | Sblocco accesso DB (password in .env.local, account CLI senza privilegi management → wrapper `sb.mjs` + tipi via `--db-url`); `verify:setup` exit 0; sistema checkpoint installato | *(vedi git log)* |
| CP2 | 2026-07-06 | Baseline schema live (`20260706015742`, 37 tabelle) + history remota allineata + tipi generati. Gap A0 **ri-verificati sul live: tutti confermati** | *(vedi git log)* |
| CP3 | 2026-07-06 | Skill-system installato (§14.5): bussola compilata (profili, routing, LOCK, 9 RULE §14.4), 3 porte allineate (CLAUDE/AGENTS/cursor), vocabolario seed (comandi v0 + 4 case canoniche; 7 nomi-elemento in PROPOSTE), ledger IDEE_ESPERIENZA + AGGIORNAMENTI_HACCP, COMPLIANCE_CONTEXT stampo, skill-consulenti (Ufficiale-HACCP, Ristoratore), 5 skill d'area (Oggi/Reparti/Scorte/Regia/DB), template report con «💡 Idee» + footer-tracciabilità, CHIUSURA compilata. Didattico OFF | *(vedi git log)* |
| CP4 | 2026-07-06 | Scaffold app snello (Vite 6 + React 18 + TS strict + Tailwind clinico-caldo + React Query + router 4 case + PWA manifest; NIENTE dead code legacy) + `src/compliance/haccp-rules.ts` (LOCK: stampo tipato, 3 regole seed `pending` con source_ref, verdetto colore, validatore) + gate-2 test (14 ✓). `npm run validate` verde · build+PWA ok · dev server verificato HTTP 200 · 0 vulnerabilità (bump vite 6/vitest 3) | *(vedi git log)* |
| CP5 | 2026-07-06 | **8 migration audit-grade APPLICATE sul DB live** (autorizzazione owner esplicita): 015+method NOT NULL, append-only+storno (temp/task/maintenance), `shift_seals`, ciclo scadenze products, `par_level`+`stock_counts`, companies beta, 4 RPC shopping, realtime ×10. History 9/9 · smoke REST 6/6 · tipi rigenerati (2390) · validate verde. Branch `integrazione` ff+push, `main`/`integrazione` protetti (no force-push/delete). Report deep: `docs/skill-system/sessioni/06-07-26/` | *(vedi git log)* |
| CP6 | 2026-07-06 | Revisione generale (verifiche: helper RLS solidi; **trovate 2 tabelle senza RLS** → migration hardening `20260706050000` **applicata**, history 10/10) + `docs/meta/REVISIONE_FONDAMENTA` (10 perplessità, 5 migliorie M1-M5) + `docs/meta/VISIONE_STRATEGICA_FABLE` (moat, GTM consulenti, pricing, manutenzione norme) + guide `docs/guide/` (SCOPE_PRODOTTO_BETA, PRATICHE_INGEGNERIA) + `PROMPT_RIPRESA_FABLE.md` + 2 idee nel ledger | *(vedi git log)* |
| CP7 | 2026-07-06 | **Shell + auth FUNZIONANTI** (FU-001 core): design token canonici mockup 06 (CSS vars light/dark → Tailwind), icone SVG disegnate, `AppShell` responsive (bottom bar mobile ↔ side-rail 82px desktop, Regia solo admin/responsabile, avatar/logout), `LoginPage` solo-invito voce umana, `SessionProvider` (ruolo da `company_members` sotto RLS), route protette + guard Regia, `CalmSplash`. Utente test creato (`scripts/create-test-user.mjs`, admin @ Al Ritrovo SRL) — **login reale verificato via API + membership RLS ok** · dev server 200 · validate verde | *(vedi git log)* |
| CP9 | 2026-07-06 | **FU-008+FU-009 chiusi** (autorizzazione owner esplicita): push branch su origin; migration `20260706070000` storno-trigger **APPLICATA** (dry-run pulito, history 11/11 — l'header «DRAFT» nel file resta: migration applicata = LOCK); `useStorna` unificata (mansioni + manutenzioni) e storno manutenzioni abilitato in OggiPage; **E2E SCRITTURA verde** via `npm run verify:flows:write` (flag `--write`, run base resta sola-lettura): lettura→trigger avanza next_due→storno manutenzione (trigger storno-aware provato live: task torna esigibile)→spunta+storno mansione→timbro+append-only shift_seals. Validate verde (29 test) | *(vedi git log)* |
| CP12 | 2026-07-06 | **Casa Regia viva (mockup 04)** + **icone PWA**: `useRespiro` (numeri reali dal DB, tono ok/warn/alarm), tile Temperature/Mansioni/Scadenze/Turni, dossier CSV del giorno (④ Dimostro — registri append-only), staff CRUD (①, invito password = follow-up FU-001), parametri HACCP sola lettura (dec. 6), anim `anim-breathe`. Icone PWA: `public/pwa-icon.svg` + manifest. Validate verde (53 test) · build+PWA ok | *(vedi git log)* |
| CP11 | 2026-07-06 | **Casa Scorte viva (dec. 12)** — port dal mockup 07: `stock.ts` puro (sotto-scorta par/rimanenza, stato scadenza, suggerimenti; 10 test), hooks (inventario per categoria + accordion dec. 12.6, giro d'inventario su `stock_counts` append-only con rimanenza aggiornata, liste spesa SOLO via le 4 RPC dec. 3), `ScortePage` (stepper da guanti, filtro reparto, spesa libera senza avanzamento dec. 12.4). **Verificato live**: conteggio +/− → stock_counts, lista creata via RPC, voce libera, spunta via RPC. Validate verde (53 test) | *(vedi git log)* |
| CP10 | 2026-07-06 | **Calendario vivo (dec. 13)** — sessione interrotta a metà (limite) e ripresa: fix TS test + gate. Feature DEFINITA (`FEATURE_Calendario_vista-completa.md` + dec. 13 + scope + skill Oggi) e COSTRUITA: `occurrences.ts` puro (specchio client di `calculate_next_due_date`, 14 unit test), `useCalendario` (mese navigabile, occorrenze mansioni/manutenzioni/temperature + registro storno-aware, filtro ruoli come Oggi), `CalendarioPage` agenda verticale (spunta con conferma armata per l'anticipato, storno, giorni chiusi, temperature mai spuntabili a distanza), route `/calendario` + 📅 in header Oggi, invalidazioni incrociate. Nessuna migration (solo letture + le 2 insert di Oggi). **Verificato live nel browser**: spunta anticipata 7 lug → riga nel registro → storno → torna esigibile. Validate verde (43 test) · build+PWA ok | *(vedi git log)* |
| CP8 | 2026-07-06 | **Port FU-002: Oggi+Reparti VIVE** (sessione interrotta a metà per limite → ripresa: commit WIP di sicurezza + 5 fix gate). Fondamenta condivise (`lib/dates` RULE-timezone, `compliance/point-verdict` ponte punto→regola SENZA numeri, sessione estesa staff/reparti, Sheet/Toast/VerdictChip, animazioni §13.5). **Oggi**: card-focus Ora/A breve/Fatto, ribbon, spunta mansioni (periodo per frequenza)+manutenzioni, **storno append-only** mansioni (dec.1), **timbro** su `shift_seals` (dec.7, sigillo animato + più turni/giorno). **Reparti**: switcher, schematico marker-verdetto (slot deterministici), tastierone da guanti condiviso, auto-complete task temperatura. Tab nome-reparto reale (FU-001). **Scoperto trigger non storno-aware** → migration draft `20260706070000` NON applicata (serve ok owner). `verify:flows` nuovo (E2E lettura RLS: 7 punti/10+10 task/5 mansioni ok) · validate 29 test verdi · build+PWA ok · dev 200 | `2201036`·`97bbe21`·`642b81d` |

## Decisioni prese in sessione (owner, 2026-07-06)

1. **Accesso DB**: `SUPABASE_DB_PASSWORD` in `.env.local` (l'account CLI loggato NON vede il progetto BHM → niente management API; tutto passa dalla connessione diretta pooler).
2. **MCP Supabase**: divieto CONFERMATO anche se i server risultano configurati nell'ambiente — solo CLI + script npm.
3. **Dati DB**: solo dati test/owner sul DB live → migration ok una volta fatta la baseline pull (comunque additive, append-only, mai distruttive).
4. **Utente test E2E**: credenziali in `.env.local` (`TEST_USER_*`); Fable è autorizzato a creare l'utente via admin API quando l'auth esiste.

## Vincoli sempre attivi (promemoria rapido)

- BHM-v.2 = solo lettura. Tutto il nuovo in BHM-Zen.
- DB live = verità; **no `db push` cieco**; migrazioni incrementali via CLI dopo baseline.
- Numeri HACCP solo in `src/compliance/haccp-rules.ts` (LOCK, quando esiste).
- UI nuova dai mockup `docs/meta/MOCKUP_UI/` — non copiare componenti legacy.
- Scope prodotto = masterplan §5 + 12 decisioni owner (`docs/meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`).

## Rotta (sequenza §6 masterplan, adattata)

1. ✅ Fondamenta prodotto (masterplan validato — nessuna contraddizione grave)
2. 🔄 Baseline DB: pull schema live → tipi generati (**prima** di ogni codice, schema = verità)
3. 🔄 Skill-system §14.5 (bussola, 3 porte, RULE, vocabolario, haccp-rules stampo)
4. ⬜ Scaffold app (Vite+React+TS, stack da §5 FABLE_AVVIO)
5. ⬜ Migration gap audit-grade (015, RPC shopping, shift_seals, append-only, products, companies)
6. ⬜ Port logica (hooks/services cherry-pick) + UI dai mockup
7. ⬜ Stabilizzazione + export audit-grade
8. ⬜ Beta (Vercel nuovo progetto)

---

**Ultimo aggiornamento**: 2026-07-06 · post-CP12: skill lessico + Playwright + prompt senior blindatura · → Report-skill-lessico-playwright
