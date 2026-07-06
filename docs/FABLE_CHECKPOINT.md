# FABLE_CHECKPOINT — stato vivo della costruzione

> **Cos'è**: il filo di Arianna della sessione Fable. Se la sessione si interrompe,
> una nuova sessione riparte da qui: legge questo file + `git log --oneline -20`.
> **Procedura**: ogni milestone = 1 commit + aggiornamento di questo file (sezione «Dove sono»).
> I dettagli del *perché* stanno nei commit e nei report; qui solo la rotta.

---

## Dove sono (aggiornare SEMPRE per ultima cosa)

- **Data**: 2026-07-06
- **Branch**: `init/fondamenta` (= `integrazione`, entrambi pushati e protetti)
- **Fase masterplan (§6)**: ws1-3 ✅ **COMPLETI** (fondamenta prodotto validate · skill-system · DB audit-grade APPLICATO sul live) · prossimo: ws4-6 (port logica + shell UI dai mockup)
- **Ultimo checkpoint**: CP5 — 8 migration gap applicate, tipi rigenerati, gate verde
- **Prossimo passo**: FU-001 shell navigazione (mockup 06) + auth/inviti · FU-002 port hooks/services (verdetti ♻️ delle mappe)

## Checkpoint fatti

| # | Data | Cosa | Commit |
|---|------|------|--------|
| CP1 | 2026-07-06 | Sblocco accesso DB (password in .env.local, account CLI senza privilegi management → wrapper `sb.mjs` + tipi via `--db-url`); `verify:setup` exit 0; sistema checkpoint installato | *(vedi git log)* |
| CP2 | 2026-07-06 | Baseline schema live (`20260706015742`, 37 tabelle) + history remota allineata + tipi generati. Gap A0 **ri-verificati sul live: tutti confermati** | *(vedi git log)* |
| CP3 | 2026-07-06 | Skill-system installato (§14.5): bussola compilata (profili, routing, LOCK, 9 RULE §14.4), 3 porte allineate (CLAUDE/AGENTS/cursor), vocabolario seed (comandi v0 + 4 case canoniche; 7 nomi-elemento in PROPOSTE), ledger IDEE_ESPERIENZA + AGGIORNAMENTI_HACCP, COMPLIANCE_CONTEXT stampo, skill-consulenti (Ufficiale-HACCP, Ristoratore), 5 skill d'area (Oggi/Reparti/Scorte/Regia/DB), template report con «💡 Idee» + footer-tracciabilità, CHIUSURA compilata. Didattico OFF | *(vedi git log)* |
| CP4 | 2026-07-06 | Scaffold app snello (Vite 6 + React 18 + TS strict + Tailwind clinico-caldo + React Query + router 4 case + PWA manifest; NIENTE dead code legacy) + `src/compliance/haccp-rules.ts` (LOCK: stampo tipato, 3 regole seed `pending` con source_ref, verdetto colore, validatore) + gate-2 test (14 ✓). `npm run validate` verde · build+PWA ok · dev server verificato HTTP 200 · 0 vulnerabilità (bump vite 6/vitest 3) | *(vedi git log)* |
| CP5 | 2026-07-06 | **8 migration audit-grade APPLICATE sul DB live** (autorizzazione owner esplicita): 015+method NOT NULL, append-only+storno (temp/task/maintenance), `shift_seals`, ciclo scadenze products, `par_level`+`stock_counts`, companies beta, 4 RPC shopping, realtime ×10. History 9/9 · smoke REST 6/6 · tipi rigenerati (2390) · validate verde. Branch `integrazione` ff+push, `main`/`integrazione` protetti (no force-push/delete). Report deep: `docs/skill-system/sessioni/06-07-26/` | *(vedi git log)* |

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

**Ultimo aggiornamento**: 2026-07-06 · CP1 · sessione Fable avvio costruzione
