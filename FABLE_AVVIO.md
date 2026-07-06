# FABLE_AVVIO — Bootstrap sessione esecuzione masterplan

> **Stato**: ✅ verificato owner 2026-07-06 (Supabase CLI linkata, DB remoto raggiungibile)
> **Repo**: [BHM-Zen](https://github.com/Matteo-Exp-Transformer/BHM-Zen)
> **DB**: stesso progetto Supabase di BHM-v.2 — ref `hjteuounjwkadmsbsmdm`
> **Vincolo sessione**: **NO MCP Supabase** → usa **CLI + script npm** in questa repo.

---

## 0. Cosa devi fare (in ordine)

1. Leggi questo file per intero.
2. Esegui `npm run verify:setup` → **deve uscire 0** prima di scrivere codice.
3. Leggi il masterplan in legacy: `../BHM-v.2/Production/Conoscenze_congelate/META/MASTERPLAN_RILANCIO_BHM_v2.md`
4. **Valida** il masterplan (rischi, incoerenze) → poi **esegui** §6 con subagents.
5. Rispetta scope §5 e regola: migliora tecnica, non allargare prodotto senza chiedere.

---

## 1. Architettura a due repo

| Repo | Ruolo | Scrivi? |
|------|-------|---------|
| **BHM-Zen** (questa) | Casa nuova — codice, docs curati, migration, skill-system | ✅ Sì |
| **BHM-v.2** (`../BHM-v.2`) | Archivio + magazzino logica + masterplan in costruzione | ❌ Solo lettura |

**Claude Code con entrambe:**
```bash
cd c:\Users\matte.MIO\Documents\GitHub\BHM-Zen
claude --add-dir c:\Users\matte.MIO\Documents\GitHub\BHM-v.2
```

---

## 2. Supabase — stesso DB identico

| Campo | Valore |
|-------|--------|
| Project ref | `hjteuounjwkadmsbsmdm` |
| URL | `https://hjteuounjwkadmsbsmdm.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/hjteuounjwkadmsbsmdm |
| Region | eu-west-1 · Postgres 17 |
| Link CLI | già fatto in `supabase/.temp/project-ref` (non committare) |

### 2.1 Setup env (owner → Fable)

```powershell
cd BHM-Zen
copy .env.example .env.local
# Compila VITE_SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY dalla dashboard API
# (oppure copia da BHM-v.2/.env.test se stesso ambiente owner)
```

`.env.local` è **gitignored** — non committare mai le chiavi.

### 2.2 Comandi Supabase (sostituto MCP)

| Comando | Cosa fa |
|---------|---------|
| `npm run verify:supabase-cli` | CLI installata, login, link, ping DB |
| `npm run verify:supabase-env` | Chiavi .env.local + smoke REST su 3 tabelle |
| `npm run verify:setup` | Tutto sopra + masterplan legacy trovato |
| `npm run supabase:tables` | Dimensioni tabelle live (schema reale) |
| `npm run supabase:migrations` | Stato migration locali vs remote |
| `npm run supabase:pull` | **Primo passo DB**: baseline schema remoto → `supabase/migrations/` |
| `npm run supabase:types` | Genera `src/types/database.types.ts` dal DB linkato |

**Se `supabase login` scade:**
```bash
supabase login
npm run supabase:link
```

### 2.3 ⚠️ Stato migration (critico per Fable)

Il DB remoto **esiste ed è popolato** (companies, conservation_points, staff, … verificato 2026-07-06).

Le migration in `BHM-v.2/supabase/migrations/` **non risultano applicate** nella tabella tracking remota di Supabase (probabilmente schema applicato manualmente / restore). **Non fare `db push` cieco.**

**Procedura corretta (§6.3 masterplan):**
1. `npm run supabase:pull` → crea migration baseline dallo schema **live** (verità).
2. Confronta con `docs/meta/MAPPATURA_AREE/MAPPA_Fondamenta_DB-tipi.md` (portare da legacy).
3. Nuove migration **incrementali** solo per gap audit-grade (append-only, shift-seal, ecc.).
4. `npm run supabase:types` dopo ogni migration applicata.
5. Gate macchina: test validazione su `src/compliance/haccp-rules.ts` (§14.3).

### 2.4 Tabelle core già presenti (snapshot 2026-07-06)

Verificate via `supabase inspect db table-stats --linked`:

- `companies`, `company_members`, `staff`, `departments`
- `conservation_points`, `temperature_readings`, `maintenance_tasks`
- `products`, `product_categories`, `tasks`, `task_completions`
- `user_sessions`, `invite_tokens`, `audit_logs`, `csrf_tokens`

Usa `npm run supabase:tables` per lista aggiornata.

---

## 3. Documentazione in repo (già copiata 2026-07-06)

| Path | Contenuto |
|------|-----------|
| `docs/meta/` | Masterplan, mockup, mappature, kit team |
| `docs/app-definition/` | Conoscenze Fase 3 verificate |
| `docs/skill-system/` | Skill-system v0 (da adattare §14) |
| `docs/INIT_CHECKLIST.md` | Checklist fase init corrente |

Adatta secondo §14 masterplan:
- `docs/skill-system/` → bussola, context, aree, RULE §14.4
- Root: `CLAUDE.md` (già presente), `.cursor/rules/comandi-base.mdc`, `AGENTS.md`
- `docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md` → fonte decisioni prodotto

**NON portare:** `Production/Archive/` (1100+ doc quarantena), UI vecchia (`src/features/**/components`).

---

## 4. Sequenza esecuzione masterplan (§6)

| # | Workstream | Azione Fable |
|---|------------|--------------|
| 1 | Fondamenta prodotto | ✅ Già in masterplan — valida |
| 2 | Skill-system + compliance | §14.5 checklist installazione |
| 3 | Fondamenta DB audit-grade | `supabase:pull` → gap migration → `supabase:types` |
| 4 | Mappatura aree | Leggi `docs/meta/MAPPATURA_AREE/` (dopo copy) |
| 5 | Sedute UI | Mockup `docs/meta/MOCKUP_UI/` = verità visiva |
| 6 | Port logica + UI nuova | Cherry-pick hooks/services da legacy; UI dai mockup |
| 7 | Stabilizzazione + export | PDF/CSV audit-grade |
| 8 | Beta IT | Deploy Vercel nuovo progetto |

---

## 5. Stack tecnico target (da ereditare)

Copia e adatta da `BHM-v.2/package.json` quando scaffoldi l'app:

- React 18 + TypeScript + Vite 5
- Supabase JS client
- Tailwind + Radix UI
- React Query
- Vitest + Playwright (test)
- Sentry (opzionale beta)

**Alias import:** `@/` → `src/` (come legacy).

---

## 6. Branch e git (§15)

Dopo bootstrap:
```bash
git checkout -b integrazione
git push -u origin integrazione
```

Topologia: `feature/*` → `integrazione` → `main` (main protetto, solo owner).

Remote legacy (opzionale, per cherry-pick):
```bash
git remote add legacy https://github.com/Matteo-Exp-Transformer/BHM-v.2.git
git fetch legacy
```

---

## 7. Checklist verifica (owner ha testato)

Esegui e conferma **exit code 0**:

```powershell
cd BHM-Zen
supabase --version                    # ≥ 2.106
npm run verify:supabase-cli           # ✅ CLI + link + DB
npm run verify:supabase-env           # ✅ dopo .env.local
npm run verify:setup                  # ✅ tutto
```

**Esito atteso verify:supabase-cli (2026-07-06):**
- ✅ CLI installata
- ✅ CLI autenticata
- ✅ Progetto linkato `hjteuounjwkadmsbsmdm`
- ✅ Connessione DB remoto (public.companies visibile)

---

## 8. File creati in questa repo (inventario bootstrap)

| File | Scopo |
|------|-------|
| `FABLE_AVVIO.md` | **Questo file** — handoff completo |
| `CLAUDE.md` | Porta d'ingresso Claude Code |
| `.env.example` | Template chiavi Supabase |
| `package.json` | Script verify + supabase |
| `scripts/verify-*.mjs` | Test automatici (no MCP) |
| `supabase/config.toml` | Config CLI (generato da `supabase init`) |
| `supabase/.temp/` | Link al progetto (gitignored) |

---

## 9. Cosa NON fare

- ❌ Non usare MCP Supabase (non disponibile).
- ❌ Non scrivere in BHM-v.2.
- ❌ Non committare `.env.local` né `supabase/.temp/`.
- ❌ Non `db push` migration legacy senza baseline pull.
- ❌ Non copiare UI vecchia — ricostruire da mockup §13.
- ❌ Non duplicare numeri HACCP fuori da `src/compliance/haccp-rules.ts` (§14.3).

---

## 10. Domande aperte per owner (se blocchi)

- Credenziali test user (`TEST_USER_*`) per E2E
- Nuovo progetto Vercel o stesso account?
- Priorità assoluta post-bootstrap: skill-system (§14) vs schema pull (§6.3)?

---

**Ultimo aggiornamento**: 2026-07-06 · Bootstrap BHM-Zen + Supabase CLI linkata e testata · → sessione owner setup Fable
