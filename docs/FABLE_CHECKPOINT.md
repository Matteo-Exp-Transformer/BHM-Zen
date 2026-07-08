# FABLE_CHECKPOINT — stato vivo della costruzione

> **Cos'è**: il filo di Arianna della sessione Fable. Se la sessione si interrompe,
> una nuova sessione riparte da qui: legge questo file + `git log --oneline -20`.
> **Procedura**: ogni milestone = 1 commit + aggiornamento di questo file (sezione «Dove sono»).
> I dettagli del *perché* stanno nei commit e nei report; qui solo la rotta.

---

## Dove sono (aggiornare SEMPRE per ultima cosa)

- **Data**: 2026-07-08 (pomeriggio)
- **Branch**: `init/fondamenta` (commit blindatura `7402694`·`4636162`·`df5c9d9` + commit inviti/onboarding — push su ok owner)
- **Fase masterplan (§6)**: ws1-3 ✅ · ws4-6 COMPLETI nel perimetro beta (4 case vive + ① IMPOSTO chiuso) · blindatura ✅
- **Ultimo checkpoint**: **inviti+onboarding 08-07 pom.** — **FU-001 CHIUSO** (invites.ts ♻️ legacy, `/accept-invite`, claim al login, «Invita nell'app» in Regia, `verify:invite` verde, kill-switch `VITE_INVITE_EMAIL_ENABLED`) · **FU-013 CHIUSO** (onboarding «cantiere» 7 passi full-screen, ripetibile e pre-compilato, gate azienda vuota, mansioni+manutenzioni dal passo 5) · modal v2 (2 colonne md + scrollbar integrata, keypad/timbro stretti)
- **Prossimo passo**: test email inviti con inbox vera (owner, FU-017) → **FU-014 cascata** (completa il passo 6 del cantiere) → FU-005 profili frigo nella fonte-unica → FU-015 mansione Inventario · FU-016 hardening RLS legacy · FU-010 realtime · residui FU-012
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
| CP8 | 2026-07-06 | **Port FU-002: Oggi+Reparti VIVE** (sessione interrotta a metà per limite → ripresa: commit WIP di sicurezza + 5 fix gate). Fondamenta condivise (`lib/dates` RULE-timezone, `compliance/point-verdict` ponte punto→regola SENZA numeri, sessione estesa staff/reparti, Sheet/Toast/VerdictChip, animazioni §13.5). **Oggi**: card-focus Ora/A breve/Fatto, ribbon, spunta mansioni (periodo per frequenza)+manutenzioni, **storno append-only** mansioni (dec.1), **timbro** su `shift_seals` (dec.7, sigillo animato + più turni/giorno). **Reparti**: switcher, schematico marker-verdetto (slot deterministici), tastierone da guanti condiviso, auto-complete task temperatura. Tab nome-reparto reale (FU-001). **Scoperto trigger non storno-aware** → migration draft `20260706070000` NON applicata (serve ok owner). `verify:flows` nuovo (E2E lettura RLS: 7 punti/10+10 task/5 mansioni ok) · validate 29 test verdi · build+PWA ok · dev 200 | `2201036`·`97bbe21`·`642b81d` |
| CP9 | 2026-07-06 | **FU-008+FU-009 chiusi** (autorizzazione owner esplicita): push branch su origin; migration `20260706070000` storno-trigger **APPLICATA** (dry-run pulito, history 11/11 — l'header «DRAFT» nel file resta: migration applicata = LOCK); `useStorna` unificata (mansioni + manutenzioni) e storno manutenzioni abilitato in OggiPage; **E2E SCRITTURA verde** via `npm run verify:flows:write` (flag `--write`, run base resta sola-lettura): lettura→trigger avanza next_due→storno manutenzione (trigger storno-aware provato live: task torna esigibile)→spunta+storno mansione→timbro+append-only shift_seals. Validate verde (29 test) | *(vedi git log)* |
| CP10 | 2026-07-06 | **Calendario vivo (dec. 13)** — sessione interrotta a metà (limite) e ripresa: fix TS test + gate. Feature DEFINITA (`FEATURE_Calendario_vista-completa.md` + dec. 13 + scope + skill Oggi) e COSTRUITA: `occurrences.ts` puro (specchio client di `calculate_next_due_date`, 14 unit test), `useCalendario` (mese navigabile, occorrenze mansioni/manutenzioni/temperature + registro storno-aware, filtro ruoli come Oggi), `CalendarioPage` agenda verticale (spunta con conferma armata per l'anticipato, storno, giorni chiusi, temperature mai spuntabili a distanza), route `/calendario` + 📅 in header Oggi, invalidazioni incrociate. Nessuna migration (solo letture + le 2 insert di Oggi). **Verificato live nel browser**: spunta anticipata 7 lug → riga nel registro → storno → torna esigibile. Validate verde (43 test) · build+PWA ok | *(vedi git log)* |
| CP11 | 2026-07-06 | **Casa Scorte viva (dec. 12)** — port dal mockup 07: `stock.ts` puro (sotto-scorta par/rimanenza, stato scadenza, suggerimenti; 10 test), hooks (inventario per categoria + accordion dec. 12.6, giro d'inventario su `stock_counts` append-only con rimanenza aggiornata, liste spesa SOLO via le 4 RPC dec. 3), `ScortePage` (stepper da guanti, filtro reparto, spesa libera senza avanzamento dec. 12.4). **Verificato live**: conteggio +/− → stock_counts, lista creata via RPC, voce libera, spunta via RPC. Validate verde (53 test) | *(vedi git log)* |
| CP12 | 2026-07-06 | **Casa Regia viva (mockup 04)** + **icone PWA**: `useRespiro` (numeri reali dal DB, tono ok/warn/alarm), tile Temperature/Mansioni/Scadenze/Turni, dossier CSV del giorno (④ Dimostro — registri append-only), staff CRUD (①, invito password = follow-up FU-001), parametri HACCP sola lettura (dec. 6), anim `anim-breathe`. Icone PWA: `public/pwa-icon.svg` + manifest. Validate verde (53 test) · build+PWA ok | *(vedi git log)* |
| post-CP12 | 2026-07-06 | Skill-system lessico elemento owner (pdc, regtemp, piantina, prova haccp…) + PREPARA_PROMPT/TESTING compilate (`62a8f98`) · Playwright smoke autenticato (`35b5926`) · HEALTH_CHECK in repo · prompt senior blindatura | `62a8f98`·`35b5926` |
| inviti+onboarding | 2026-07-08 pom. | **FU-001 + FU-013 CHIUSI** (mandato owner: «prosegui»). **Inviti**: `features/auth/invites.ts` (♻️ logica legacy su schema nuovo, RLS `is_admin` per creare, email opzionale via function `send-invite-email` GIÀ attiva — zero deploy), pagina `/accept-invite` (2 percorsi: sessione dal link email → password; link manuale → signUp), claim automatico al primo login (SessionProvider), Regia → persona → «Accesso all'app» (invita/copia link/annulla, solo titolare), `verify:invite` live verde con pulizia. Kill-switch email: `VITE_INVITE_EMAIL_ENABLED=false`. **Onboarding «cantiere»** `/onboarding` (mockup 05 v2): rail collassabile con progresso+anteprima azienda, 7 passi navigabili con dipendenze, RIPETIBILE già compilato, gate d'avvio solo per azienda vuota, «Chiudi il cantiere» → `onboarding_completed`; passo 4 setpoint dal LOCK (`suggestedSetpointForType` in point-verdict, riusato da StrutturaSheet); passo 5 genera manutenzioni obbligatorie per punto + crea mansioni. **Modal v2**: 2 colonne+font maggiore su md (mobile invariato), scrollbar integrata per tutti i dialog, keypad/timbro `layout="stretto"`. Gate: 58 unit ✅ · **10/10 e2e** ✅ · verify:invite ✅. Profili frigo NON portati (numeri fuori LOCK → FU-005) | *(vedi git log)* |
| blindatura | 2026-07-08 | **Sessione Meta senior → esecuzione completa**: matrice drift 9 aree + piano 3 fasi. **Fase 1** doc riallineati (HEALTH_CHECK, DB_SKILL §3, SCORTE_SKILL, REPARTI_SKILL cascata, SESSION_LOG, banner mappe, nota Docker, `docs/Archivio/` rimosso). **Fase 2**: smoke Playwright **9 test** (4 case + struttura + login) · utente test **dipendente** (`--dipendente`) + test ruoli (non vede Regia) · `verify:flows` esteso a 5 aree, `--write` con Scorte (conteggio, RPC lista, spunta, voce libera) e Calendario (anticipata+storno) · fix clock-skew timbro · component test KeypadSheet (3, verdetto dal LOCK) · `validate:full`. **Fase 3 (fetta owner)**: **Regia → StrutturaSheet** (crea/modifica reparti e pdc, setpoint proposto DAL LOCK) + **modifica staff** (ruolo, reparti, in servizio) — RLS provata live (probe insert/update/delete pulito). Gate: validate 56 unit ✅ · e2e 9/9 ✅. Decisioni owner: UI dai mockup (logica legacy sì, componenti no) | *(vedi git log)* |

## Decisioni prese in sessione (owner, 2026-07-06)

1. **Accesso DB**: `SUPABASE_DB_PASSWORD` in `.env.local` (l'account CLI loggato NON vede il progetto BHM → niente management API; tutto passa dalla connessione diretta pooler).
2. **MCP Supabase**: divieto CONFERMATO anche se i server risultano configurati nell'ambiente — solo CLI + script npm.
3. **Dati DB**: solo dati test/owner sul DB live → migration ok una volta fatta la baseline pull (comunque additive, append-only, mai distruttive).
4. **Utente test E2E**: credenziali in `.env.local` (`TEST_USER_*`); Fable è autorizzato a creare l'utente via admin API quando l'auth esiste.

**Decisioni owner 2026-07-08 (sessione blindatura):**

5. **Form legacy in Regia/onboarding**: si riusa la **logica di validazione/compliance** dei form BHM-v.2 (conservation, management, onboarding-steps) — la **UI resta dai mockup** (conferma vincolo SCOPE).
6. **Onboarding** = gap ① IMPOSTO da chiudere in Fase 3 (attiva creazione reparti+pdc da UI).

## Vincoli sempre attivi (promemoria rapido)

- BHM-v.2 = solo lettura. Tutto il nuovo in BHM-Zen.
- DB live = verità; **no `db push` cieco**; migrazioni incrementali via CLI dopo baseline.
- Numeri HACCP solo in `src/compliance/haccp-rules.ts` (LOCK, quando esiste).
- UI nuova dai mockup `docs/meta/MOCKUP_UI/` — non copiare componenti legacy.
- Scope prodotto = masterplan §5 + 12 decisioni owner (`docs/meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`).

## Rotta (sequenza §6 masterplan, adattata)

1. ✅ Fondamenta prodotto (masterplan validato — nessuna contraddizione grave)
2. ✅ Baseline DB: pull schema live + tipi generati (CP2)
3. ✅ Skill-system §14.5 (CP3; lessico owner post-CP12)
4. ✅ Scaffold app (CP4)
5. ✅ Migration gap audit-grade (CP5 + CP6 + CP9 — history 11/11)
6. ✅ Port logica + UI dai mockup — 4 case vive (CP7–CP12) + struttura da Regia + **onboarding cantiere + inviti staff (08-07 pom.)**; fuori perimetro step: cascata (FU-014), profili frigo (FU-005)
7. 🔄 Stabilizzazione + export audit-grade — blindatura 08-07 COMPLETA (doc + rete test: 10 e2e, 58 unit, verify:flows 5 aree, verify:invite); export = solo CSV giorno (PDF ws7)
8. ⬜ Beta (Vercel nuovo progetto)

---

**Ultimo aggiornamento**: 2026-07-08 pom. · inviti+onboarding: FU-001/FU-013 chiusi, rotta 6 ✅ · → `docs/skill-system/sessioni/08-07-26/Report-esecuzione-inviti-onboarding.md`
