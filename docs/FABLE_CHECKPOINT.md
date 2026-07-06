# FABLE_CHECKPOINT — stato vivo della costruzione

> **Cos'è**: il filo di Arianna della sessione Fable. Se la sessione si interrompe,
> una nuova sessione riparte da qui: legge questo file + `git log --oneline -20`.
> **Procedura**: ogni milestone = 1 commit + aggiornamento di questo file (sezione «Dove sono»).
> I dettagli del *perché* stanno nei commit e nei report; qui solo la rotta.

---

## Dove sono (aggiornare SEMPRE per ultima cosa)

- **Data**: 2026-07-06
- **Branch**: `init/fondamenta`
- **Fase masterplan (§6)**: workstream 2–3 (skill-system + fondamenta DB) — avviati
- **Ultimo checkpoint**: CP1 — ambiente sbloccato, script Supabase robusti
- **Prossimo passo**: `npm run supabase:pull` (baseline schema live) → tipi → scaffold app

## Checkpoint fatti

| # | Data | Cosa | Commit |
|---|------|------|--------|
| CP1 | 2026-07-06 | Sblocco accesso DB (password in .env.local, account CLI senza privilegi management → wrapper `sb.mjs` + tipi via `--db-url`); `verify:setup` exit 0; sistema checkpoint installato | *(vedi git log)* |

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
