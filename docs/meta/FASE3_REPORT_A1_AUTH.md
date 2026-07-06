# Report FASE 3 — Area A1 Auth + Onboarding

**Data**: 2026-07-05  
**Agente**: A1  
**Modalità**: read-only  
**Priorità area**: P1  
**Cross-ref A0**: `FASE3_REPORT_A0_DB_SCHEMA.md` (supplemento DB live 2026-07-05)  
**Supplemento DB live**: 2026-07-05 via MCP `supabase-bhm` → `https://hjteuounjwkadmsbsmdm.supabase.co`

---

## 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 28 |
| Allineati doc↔codice | 11 |
| Gap critici | 2 |
| Gap medi/bassi | 9 |
| Non verificato (runtime DB / Vercel) | 3 |
| Verificato DB live (MCP supplemento) | 5 |

**Esito area**: 🟡 — Login e onboarding sono implementati e in gran parte allineati alle fix feb 2026 (CSRF URL, AuthCallbackPage). Restano gap funzionali su **Remember Me** (UI attiva ma flusso login non lo applica), **validazione password duplicata/inconsistente**, **CSRF non enforced sul login**, route **/sign-up** ancora pubblica, **numero licenza** ancora in UI onboarding. Redirect post-login: codice aggiornato (fix 1.8); doc FASE 2 lo segnava ancora aperto — **codice più recente del catalogo**.

---

## 5.2 Matrice verifica

| Feature/Componente | Doc dice (FASE 2 / conoscenze) | Codice reale | DB/Schema | Esito |
|--------------------|--------------------------------|--------------|-----------|-------|
| **Login CSRF** | Fix Vercel 07-02: URL assoluto, path `auth-csrf-token`, header anon | `useCsrfToken.ts:49-59` fetch Edge Function; `LoginForm.tsx:36` hook; submit rigenera token client in `authClient.ts:439-453` | **Live MCP**: tabella `csrf_tokens` **esiste** (8 colonne: `id`, `token`, `expires_at`, `created_at`, `ip_address`, `user_id`, `used_at`, `created_by`); RLS on; **0 righe**; Edge Function **non** inserisce in tabella | ⚠️ Schema DB ok; tabella **vuota**; validazione CSRF al login **assente** (`authClient.login` → Supabase diretto) |
| **Redirect post-login Vercel** | Doc 07-02: ancora problematico; fix 1.8/1.9: risolto | `LoginPage.tsx:47` → `/auth/callback?post_login=true`; `AuthCallbackPage.tsx:33-56` attende `useAuth` poi `/dashboard` o `/onboarding` | Dipende da `company_members` popolato (`useAuth` query companies) | ⚠️ Codice coerente con fix 1.8; **runtime Vercel non testato** in questa sessione |
| **Remember Me** | Doc: disabilitato; LOGIN_FLOW: da abilitare | Checkbox **abilitata** `LoginForm.tsx:319-335`; `authClient.login` **TODO** `authClient.ts:320-323`; implementazione reale solo in `useAuth.signIn` `useAuth.ts:418-431` + `RememberMeService.ts` — **non usato da LoginForm** | Edge Function `supabase/functions/remember-me/index.ts` presente | ❌ Gap: UI promette 30 giorni, flusso login non chiama `rememberMeService` |
| **Password 12 char** | Policy 12 char + lettere/numeri | **Due schemi**: client `features/auth/schemas/authSchemas.ts:25-32` (solo alfanumerico); API `api/schemas/authSchemas.ts:24-28` + `types/auth.ts:313-319` (stampabili ASCII, più permissivo). Login valida con schema **client** poi `authClient` con schema **API** | Supabase Auth gestisce hash (non bcrypt custom nel client) | ⚠️ 12 char sì; regole **inconsistenti** tra file |
| **Rate limiting login** | Escalation server-side in LOGIN_FLOW | Solo **client** `useRateLimit.ts` + localStorage `bhm_rate_limit`; `LoginForm.tsx:94-98,117-118` | Nessuna tabella rate limit verificata | ⚠️ Feedback UI sì; non sicurezza server |
| **Link "Registrati"** | LOGIN_FLOW: da rimuovere | `LoginPage.tsx` e `LoginForm.tsx`: **nessun** link registrazione | — | ✅ Rimosso dalla UI login |
| **Route /sign-up pubblica** | Design: solo via invito | `App.tsx:117` route `<RegisterPage />` ancora attiva | — | ⚠️ Registrazione libera ancora raggiungibile per URL diretto |
| **Password dimenticata** | LOGIN_FLOW: link funzionante | **Nessun** link in `LoginForm`/`LoginPage` verso `/forgot-password`; pagina esiste `ForgotPasswordPage.tsx` + route `App.tsx:118` | — | ⚠️ Funzione esiste ma **non linkata** dal login |
| **Registrazione / Inviti** | Solo invito | `AcceptInvitePage.tsx` + `inviteService.ts`; rollback auth su errore member **TODO** `inviteService.ts:322` | **Live MCP**: `company_members` INSERT `"Allow insert during signup"` `WITH CHECK (true)` ✅; `invite_tokens` SELECT `"Allow read for token validation"` + UPDATE `"Allow update for acceptance"` ✅ — allineati a `fix-signup-policies-minimal.sql` | ⚠️ Flusso invito + RLS signup **ok su remoto**; rollback auth ancora TODO |
| **ProtectedRoute senza company** | Fix 07-02: redirect onboarding | `ProtectedRoute.tsx:195-199` → `/onboarding` se `!isAuthorized` | — | ✅ |
| **OnboardingGuard** | Dev + redirect se no company | `OnboardingGuard.tsx:41-55`; bypass se `localStorage onboarding-completed` | — | ⚠️ Flag solo localStorage, non DB (`onboardingHelpers.ts:2328-2329`) |
| **Wizard 7 step** | ONBOARDING_FLOW: 7 step | `OnboardingWizard.tsx:31` `TOTAL_STEPS = 7`; 7 file in `onboarding-steps/` | — | ✅ |
| **Numero licenza** | ONBOARDING_FLOW: **DA RIMUOVERE** | Campo ancora in `BusinessInfoStep.tsx:274-283` `license_number` | **Live MCP**: colonna `license_number` **assente** in `companies`; prefill dev `onboardingHelpers.ts:463` usa valore non persistibile su DB | ❌ UI mostra campo che il DB non ha |
| **Acceptance criteria onboarding** | Tutti `[ ]` aperti in ONBOARDING_FLOW | Implementazione parziale verificabile solo a campione; completamento marca `localStorage` non colonne DB | `onboarding_completed` **non** in `companies` (nota codice `onboardingHelpers.ts:2328`) | ⚠️ Spec non chiusa; stato “completato” solo client |
| **Salvataggio companies onboarding** | INSERT in companies + member admin | `createCompanyFromOnboarding` `onboardingHelpers.ts:1502-1537` insert + upsert `company_members` | **Live MCP**: `companies` INSERT `"Allow company insert during onboarding"` `WITH CHECK (auth.uid() IS NOT NULL)` ✅; SELECT onboarding policy ✅ — identiche a `fix-companies-insert-onboarding.sql` e `supabase/migrations/20260705140000_*` | ✅ RLS onboarding **applicata su remoto** |
| **Dev buttons onboarding** | Da rimuovere in prod | `OnboardingWizard.tsx:377-380` `DevButtons` se `import.meta.env.DEV`; `MainLayout.tsx:111` `showDevButtons={import.meta.env.DEV}` | — | ✅ Nascosti in build prod (env); ancora in dev |
| **Dev helpers in App** | PRE_PRODUCTION cleanup | `App.tsx:82-108` log funzioni dev su `window` in DEV | — | ⚠️ Solo dev |
| **Bcrypt password** | LOGIN_FLOW decisione #2 | Solo in Edge `supabase/functions/shared/business-logic.ts:224-243`; login usa `signInWithPassword` Supabase | Supabase Auth interno | ⚠️ Non applicato lato app (by design Supabase) |
| **Recovery password** | Email enumeration protection in spec | `ForgotPasswordPage` usa `useAuth.resetPassword` → Supabase `resetPasswordForEmail` `useAuth.ts:473-478` (no enumeration client-side) | — | ✅ Path semplice; link assente da login |
| **CSRF su invite/register** | CSRF obbligatorio | `InviteAcceptForm.tsx` CSRF; `RegisterPage.tsx:32-48` `csrfService` locale | — | ⚠️ Register usa CSRF client-side non server |

---

## 5.3 Bug confermati (nuovi o aggiornati)

> Non modificare `BUG_TRACKER.md` in Fase 3 — proposte per consolidatore A8.

| ID suggerito | Severity | Evidenza | File:Riga |
|--------------|----------|----------|-----------|
| **BUG-A1-001** | MEDIUM | Remember Me: checkbox attiva ma `authClient.login` non invoca `rememberMeService` né `useAuth.signIn` | `LoginForm.tsx:124-129`, `authClient.ts:320-323` vs `useAuth.ts:418-431` |
| **BUG-A1-002** | LOW | Doppio schema password login: validazione client (solo alfanumerico) vs API (ASCII stampabile) | `features/auth/schemas/authSchemas.ts:25-32` vs `api/schemas/authSchemas.ts:24-28` |
| **BUG-A1-003** | MEDIUM | CSRF “cosmetico” sul login: token richiesto in UI ma `login()` non verifica token server/edge | `authClient.ts:283-295`, `authClient.ts:439-453` |
| **BUG-A1-004** | LOW | Link recupero password assente dalla pagina login nonostante route `/forgot-password` | `LoginPage.tsx`, `LoginForm.tsx` (assenza link); `App.tsx:118` |
| **BUG-A1-005** | MEDIUM | Registrazione pubblica `/sign-up` ancora esposta (design solo invito) | `App.tsx:117`, `RegisterPage.tsx` |
| **BUG-A1-006** | LOW | Campo numero licenza ancora in onboarding (doc richiede rimozione) | `BusinessInfoStep.tsx:274-283` |

**BUG_TRACKER esistenti confermati nel codice:**

| ID | Stato codice | Evidenza |
|----|--------------|----------|
| Auth TODO `authClient.ts:314` | **Obsoleto parzialmente** — testo dice "Implementare Remember Me" ma `RememberMeService` esiste; manca wiring in `authClient.login` | `authClient.ts:322`, `RememberMeService.ts:39-79` |
| `inviteService.ts:322` rollback | **Ancora aperto** | `inviteService.ts:320-324` |
| `inviteService.ts:507` query RLS | **Ancora aperto** — `.eq('user_id', email)` errato semanticamente | `inviteService.ts:504-508` |

---

## 5.4 Documentazione obsoleta

| Path doc | Claim errato | Evidenza codice | Azione suggerita |
|----------|--------------|-----------------|------------------|
| `CATALOGO_...FASE1.md` riga 27608 | Redirect post-login su Vercel ancora problematico | Fix 1.8 `AuthCallbackPage.tsx`, `LoginPage.tsx:47` | Aggiornare FASE 3: ⚠️ codice fixato, test prod da confermare |
| `CATALOGO_...FASE1.md` riga 27608 | Remember me disabilitato | Checkbox abilitata; servizio non collegato | `verificato-gap` |
| `LOGIN_FLOW.md` righe 17-29 | Remember me disabled; LoginPage righe 188+ link registrazione | LoginPage refactor senza link; remember UI on | Riscrivere sezione STATO ATTUALE |
| `LOGIN_FLOW.md` | Password minLength 8 → 12 “da fare” | 12 char in entrambi gli schemi API | Marcare fatto con nota dual-schema |
| `ONBOARDING_FLOW.md` | Numero licenza DA RIMUOVERE | Campo ancora presente | `verificato-gap` |
| `ONBOARDING_FLOW.md` | Acceptance criteria tutti aperti | Non verificabile tutti in read-only; localStorage-only completion | `verificato-gap` + test E2E |
| `REPORT_CSRF_LOGIN_VERCEL_07-02-2026.md` §6 | Redirect ancora aperto | Superato da §7-10 stesso file | Catalogo FASE 2 non allineato al report Auth più recente |
| `IMPLEMENTAZIONE_REMEMBER_ME_COMPLETATA.md` (DOC-0154) | Implementazione completa | Login path non usa il servizio | `verificato-gap` |

---

## 5.5 Aggiornamenti catalogo (`stato_percepito`)

| DOC-id / path | Campo | Nuovo `stato_percepito` |
|---------------|-------|-------------------------|
| DOC-0014 `LOGIN_FLOW.md` | allineamento codice | `verificato-gap` |
| DOC-0015 `ONBOARDING_FLOW.md` | acceptance + licenza | `verificato-gap` |
| DOC-0017 `REPORT_CSRF_LOGIN_VERCEL_07-02-2026.md` | stato redirect | `verificato-ok` (per codice); runtime `non-verificato` |
| DOC-0154 `IMPLEMENTAZIONE_REMEMBER_ME_COMPLETATA.md` | wiring login | `verificato-gap` |
| DOC-0004 `docs/auth/CSRF_VERCEL_TROUBLESHOOTING.md` | operativo deploy | `verificato-ok` |
| Matrice FASE 2 riga Login | feature row | → vedi append §3.1 sotto |

### Append catalogo — sezione `3.1 Auth + Onboarding` (per A8)

```markdown
### 3.1 — Auth + Onboarding (2026-07-05)
**Agente**: A1
**Esito area**: 🟡
**Report**: META/FASE3_REPORT_A1_AUTH.md

| Feature | Doc (FASE 2) | Verifica codice | Verifica DB | Stato finale |
|---------|--------------|-----------------|-------------|--------------|
| Login CSRF fetch | ✅ fix feb | ⚠️ token non validato al submit | ✅ tabella `csrf_tokens` live (0 righe) | 🟡 PARZIALE |
| Redirect post-login | ❌ aperto | ✅ AuthCallbackPage | company_members RLS signup ✅ | 🟡 CODICE OK |
| Remember Me | ❌ disabilitato | ❌ UI sì, login no | EF remember-me | 🔴 GAP |
| Password 12 char | ⚠️ forse non applicata | ⚠️ dual schema | Supabase Auth | 🟡 PARZIALE |
| Solo invito | design | ⚠️ /sign-up ancora attivo | RLS signup ✅ live | 🟡 GAP |
| Onboarding 7 step | ✅ | ✅ | ✅ RLS companies INSERT/SELECT live | 🟢 DB OK |
| Numero licenza | da rimuovere | ❌ ancora in UI | ❌ colonna assente su `companies` | 🔴 GAP |
| Dev buttons prod | da rimuovere | ✅ gated DEV | — | 🟢 OK build prod |
```

---

## 5.6 Non verificato / fuori scope

- **Runtime login su Vercel** dopo fix 1.8–1.9 (nessun deploy/test in questa sessione).
- **Esecuzione E2E** login/onboarding (citati test storici in `Production/Archive/`, config probabilmente datate).
- **Edge Functions deployate** (`auth-csrf-token`, `remember-me`, `auth/recovery/*`) — codice presente; `auth-csrf-token` risponde (A0 conferma progetto); persistenza token in `csrf_tokens` non verificata end-to-end.
- **Ogni acceptance criterion** onboarding step-by-step (campione codice only).
- **Fix implementativi** — esplicitamente fuori scope Fase 3.

~~RLS remoto~~ → **verificato** in Supplemento DB live §S1–S4 sotto.

---

## Dettaglio tecnico per Owner (linguaggio semplice)

### Dove vive l’Auth nell’app

- **Pagina login** (`LoginPage.tsx`): schermata `/sign-in` — mostra il form e dopo il login manda l’utente a una pagina intermedia `/auth/callback?post_login=true` invece che direttamente alla dashboard.
- **Form login** (`LoginForm.tsx`): raccoglie email/password, chiede il token CSRF, valida con Zod, chiama `authClient.login`.
- **Callback** (`AuthCallbackPage.tsx`): aspetta che `useAuth` finisca di caricare sessione e aziende, poi manda a **dashboard** (se hai già un’azienda) o **onboarding** (se sei loggato ma senza company).
- **Onboarding** (`OnboardingWizard.tsx` + 7 step in `src/components/onboarding-steps/`): wizard iniziale per nuovo ristorante; salva su Supabase tramite `utils/onboardingHelpers.ts`.

### Storage / dati

| Storage | Cosa contiene | Note |
|---------|---------------|------|
| `localStorage` `bhm-supabase-auth` | Sessione Supabase (JWT) | Gestito da Supabase client |
| `localStorage` `onboarding-data` | Bozza wizard onboarding | `OnboardingWizard.tsx:45-48` |
| `localStorage` `onboarding-completed` | Flag "ho finito onboarding" | **Solo browser**, non DB `onboardingHelpers.ts:2329` |
| `localStorage` `bhm_rate_limit` | Contatore tentativi login | Solo client |
| `localStorage` `bhm-remember-me-session` | Metadata remember me | Scritto solo se passi da `useAuth.signIn` con remember — **non** dal login form attuale |
| DB `companies` | Anagrafica azienda | Creata in onboarding `onboardingHelpers.ts:1502-1510` |
| DB `company_members` | Collegamento utente ↔ azienda + ruolo | Critico per entrare in app dopo login |

### Cross-ref A0 (DB) — aggiornato MCP live

| Tema | File repo | Stato LIVE (MCP 2026-07-05) |
|------|-----------|----------------------------|
| INSERT `companies` in onboarding | `BackupDB/fix-companies-insert-onboarding.sql` | ✅ **Applicato** — policy `"Allow company insert during onboarding"` presente |
| SELECT `companies` in onboarding | idem + `20260705140000_fix_companies_onboarding_rls.sql` | ✅ **Applicato** — policy `"Allow company select during onboarding"` presente |
| INSERT signup `company_members` | `BackupDB/fix-signup-policies-minimal.sql` | ✅ **Applicato** — `"Allow insert during signup"` `WITH CHECK (true)` |
| INSERT signup `user_sessions` / `user_profiles` | `fix-signup-policies-minimal.sql` | ✅ **Applicato** — entrambe le policy presenti |
| Inviti `invite_tokens` | `fix-signup-policies-minimal.sql` | ✅ **Applicato** — read/update pubbliche per validazione/accettazione |
| Schema `csrf_tokens` | `supabase/migrations/20250127000001_csrf_tokens.sql` | ✅ Tabella live 8 colonne; RLS on; **0 righe**; Edge Function non popola tabella |
| `license_number` su `companies` | UI onboarding + prefill dev | ❌ Colonna **assente** su remoto |

---

## Test esistenti citati (non eseguiti)

- `src/services/auth/__tests__/RememberMeService.test.ts` — unit test servizio (non integrazione login).
- `Production/Archive/.../TEST_TUTTE_DECISIONI_IMPLEMENTATE.spec.ts` — Vitest storico ott 2025 su LoginForm/RegisterPage.
- Playwright multi-agent: `npm run test:agent2` (forms/auth) — non eseguito in Fase 3.

---

## Supplemento DB live — 2026-07-05

**Agente**: A1 (supplemento)  
**MCP**: `supabase-bhm` → `https://hjteuounjwkadmsbsmdm.supabase.co`  
**Modalità**: read-only (`execute_sql`)  
**Allineamento A0**: conferma presenza `csrf_tokens` citata in `FASE3_REPORT_A0_DB_SCHEMA.md` §S7; questo supplemento dettaglia **RLS Auth/onboarding** (delegato da A0 §5.6).

### S1 — `csrf_tokens` (esistenza e colonne)

**Query MCP**:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='csrf_tokens'
ORDER BY ordinal_position;
```

| Colonna | Tipo live | Migration `20250127000001_csrf_tokens.sql` |
|---------|-----------|---------------------------------------------|
| `id` | uuid (PK, default `gen_random_uuid()`) | ✅ |
| `token` | text NOT NULL | ✅ |
| `expires_at` | timestamptz NOT NULL | ✅ |
| `created_at` | timestamptz (default `now()`) | ✅ |
| `ip_address` | text | ✅ |
| `user_id` | uuid (FK auth.users) | ✅ |
| `used_at` | timestamptz | ✅ |
| `created_by` | text (default `'system'`) | ✅ |

| Metrica | Valore live |
|---------|-------------|
| RLS abilitato | ✅ `rowsecurity = true` |
| Policy | `csrf_tokens_service_role_only` (ALL); `csrf_tokens_user_read_own` (SELECT) |
| Righe in tabella | **0** |

**Conclusione**: schema migration **applicato** sul remoto; la Edge Function `auth-csrf-token` genera token in risposta HTTP ma **non scrive** in questa tabella (coerente con 0 righe e codice `auth-csrf-token/index.ts`).

### S2 — RLS `companies` (onboarding INSERT/SELECT)

**Confronto** `BackupDB/fix-companies-insert-onboarding.sql` + `supabase/migrations/20260705140000_fix_companies_onboarding_rls.sql` vs **live**:

| Policy live | CMD | Definizione live | Match script repo |
|-------------|-----|------------------|-------------------|
| `Allow company insert during onboarding` | INSERT | `WITH CHECK (auth.uid() IS NOT NULL)` | ✅ identica |
| `Allow company select during onboarding` | SELECT | `id IN (active company_members) OR NOT EXISTS (active membership)` | ✅ identica |
| `Users can view their companies` | SELECT | membership attiva | (policy base, non nel fix script) |
| `Admins can update company info` | UPDATE | `is_admin(id)` | (policy base) |

**Esito**: migration/fix companies RLS **applicata** sul remoto (A0 segnalava `20260705140000` come “non verificato (A1)” → **ora verificato**).

### S3 — RLS `company_members` + signup

**Confronto** `BackupDB/fix-signup-policies-minimal.sql` vs **live**:

| Policy live | CMD | `with_check` / `qual` | Match script |
|-------------|-----|----------------------|--------------|
| `Allow insert during signup` | INSERT | `WITH CHECK (true)` | ✅ identica |
| `Admins can create memberships` | INSERT | `WITH CHECK (is_admin(company_id))` | (policy admin preesistente) |
| `Users can view their memberships` | SELECT | `user_id = auth.uid() OR is_admin(...)` | (policy base) |

**Nota**: due policy INSERT permissive — PostgreSQL valuta in OR; signup/onboarding insert consentito via `"Allow insert during signup"`.

### S4 — Altre policy signup (`fix-signup-policies-minimal.sql`)

| Tabella | Policy attesa nello script | Stato LIVE |
|---------|---------------------------|------------|
| `user_sessions` | `Allow insert during signup` INSERT `true` | ✅ presente |
| `user_profiles` | `Allow insert during signup` INSERT `true` | ✅ presente |
| `invite_tokens` | `Allow read for token validation` SELECT `true` | ✅ presente |
| `invite_tokens` | `Allow update for acceptance` UPDATE `true`/`true` | ✅ presente |

### S5 — Sintesi confronto script BackupDB vs remoto

| Script repo | Contenuto | Esito LIVE |
|-------------|-----------|------------|
| `fix-companies-insert-onboarding.sql` | 2 policy `companies` | ✅ **100% applicato** |
| `fix-signup-policies-minimal.sql` | 5 policy signup/inviti | ✅ **100% applicato** |
| `supabase/migrations/20260705140000_*` | Duplicato fix companies | ✅ equivalente al BackupDB script |

### S6 — Impatto su gap A1 (post-live)

| Voce report | Prima supplemento | Dopo supplemento |
|-------------|-------------------|------------------|
| Onboarding INSERT company | `non-verificato` | ✅ **verificato-ok** RLS live |
| Signup / invite RLS | `non-verificato` | ✅ **verificato-ok** |
| `csrf_tokens` schema | inferito da migration | ✅ **verificato-ok** (tabella vuota) |
| Numero licenza | “colonna in prefill dev” | ❌ colonna **non esiste** su `companies` live |
| CSRF enforcement login | gap codice | invariato — DB pronto ma **non usato** dal flusso login attuale |

### S7 — Criteri done supplemento A1

- [x] `csrf_tokens` colonne verificate live
- [x] `pg_policies` su `companies` e `company_members` (INSERT onboarding/signup)
- [x] Confronto con `fix-signup-policies-minimal.sql` e `fix-companies-insert-onboarding.sql`
- [x] Cross-ref A0 aggiornato (`20260705140000` verificato)
- [x] Nessuna modifica a `src/`, migrations, DB, `BUG_TRACKER.md`

---

*Report generato da Agente A1 — Fase 3 controverifica parallela. Supplemento DB live 2026-07-05. Nessuna modifica a `src/`, migrations o DB.*
