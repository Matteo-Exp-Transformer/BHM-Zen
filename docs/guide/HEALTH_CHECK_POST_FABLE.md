# Health check app — stato reale post-Fable (CP12)

> **Scopo:** punto di partenza per **testare, debuggare e capire cosa c’è davvero** nel codice
> dopo la sessione di costruzione Fable (2026-07-06). Non è il masterplan: è la fotografia
> operativa della repo **oggi**.
>
> **Aggiornare** questo file quando cambia qualcosa di rilevante per chi testa (nuova casa,
> migration, utente test, gap chiusi).

**Data snapshot:** 2026-07-08 · **Commit di riferimento:** `35b5926` (`test(e2e): configura Playwright con smoke autenticato`)
**Branch attivo:** `init/fondamenta` = `integrazione` = `origin` (allineati)

---

## 1. In una frase

**BHM-Zen è una PWA React collegata al DB Supabase live** (stesso progetto di BHM-v.2).
Le **4 case** del mockup 06 sono **navigabili e scrivono sul database** sotto RLS:
Oggi (+ Calendario figlio), Reparti, Scorte, Regia. Auth solo-invito: **gli inviti staff
funzionano** (08-07 pom.) e il titolare ha l'**onboarding «cantiere»** ripetibile su `/onboarding`.

Non è ancora la beta pubblica: mancano cascata prodotti (FU-014), export PDF audit-grade,
SMTP custom per le email (FU-017), realtime e una passata sistematica di QA manuale.

---

## 2. Mappa dell’app (dove clicchi cosa)

| Dove nell’app | Route | Chi la vede | Cosa fa oggi (reale) |
|---------------|-------|-------------|----------------------|
| **Oggi** | `/` | tutti | Diario del turno: mansioni e manutenzioni di oggi, spunta, **storno** (append-only), **timbro** turno su `shift_seals`. Pulsante 📅 → Calendario. |
| **Calendario** | `/calendario` | tutti (stesse regole di Oggi) | Agenda verticale del mese: cose future, registro passato, **completamento anticipato** (conferma armata), storno. Temperature **non** spuntabili a distanza. |
| **Reparti** | `/reparti` | tutti | Mappa schematica punti di conservazione, **tastierone temperatura**, auto-complete task temperatura, verdetto colore da `haccp-rules.ts`. |
| **Scorte** | `/scorte` | tutti | Inventario per categoria, giro conteggi (`stock_counts`), liste spesa via **4 RPC** shopping, spunta voci. |
| **Regia** | `/regia` | solo **admin / responsabile** | Respiro (numeri dal DB), dossier CSV del giorno, staff **aggiungi+modifica+INVITA nell'app** (solo titolare; email opzionale + link da copiare), **Reparti & punti modificabili** (sheet Struttura, setpoint proposto dal LOCK — 08-07), card **«La tua azienda»** → cantiere, parametri HACCP **sola lettura**. |
| **Onboarding** | `/onboarding` | solo admin/responsabile | **Cantiere 7 passi** full-screen (mockup 05 v2): anagrafica, reparti, staff, punti (temp dal LOCK), attività+manutenzioni generate, inventario (recap), calendario. **Ripetibile** già compilato; obbligatorio solo per azienda vuota. |
| **Accetta invito** | `/accept-invite?token=…` | anon / invitato | Imposta password (arrivo da email) o crea account (link condiviso); membership agganciata al primo accesso. |
| **Login** | `/login` | anon | Email + password (no sign-up pubblico). |

**Storage / dati:** tutto vive su **Supabase Postgres** remoto (project ref `hjteuounjwkadmsbsmdm`).
Il browser tiene solo sessione auth (Supabase client) e cache React Query — niente localStorage
business-critical oltre alla sessione.

---

## 3. Stato di partenza reale del codice

### Stack

- **Vite 6** + **React 18** + **TypeScript strict** + **Tailwind** (tema clinico-caldo §13)
- **TanStack Query** per fetch/cache
- **Supabase JS** client-side con **RLS** (anon key + JWT utente)
- **PWA** minima: service worker, manifest, icona SVG `public/pwa-icon.svg` (PNG maskable = TODO)

### Struttura feature (codice applicativo)

```
src/
├── features/
│   ├── auth/LoginPage.tsx
│   ├── oggi/          hooks.ts, OggiPage.tsx
│   ├── calendario/    occurrences.ts (+ test), hooks.ts, CalendarioPage.tsx
│   ├── reparti/       hooks.ts, RepartiPage.tsx, KeypadSheet.tsx
│   ├── scorte/        stock.ts (+ test), hooks.ts, ScortePage.tsx
│   └── regia/         hooks.ts, RegiaPage.tsx
├── compliance/        haccp-rules.ts (LOCK numeri), point-verdict.ts
├── components/        shell, icone SVG, UI condivisa (Toast, Sheet, VerdictChip)
└── lib/               dates, supabase client, auth session
```

### Cosa è LIVE vs cosa è ancora assente

| Area | Stato | Note |
|------|--------|------|
| Oggi + Reparti | ✅ Live, E2E lettura + scrittura | CP8–CP9 |
| Calendario | ✅ Live, smoke browser CP10 | Nessuna tabella nuova |
| Scorte | ✅ Live, smoke browser CP11 | RPC shopping già sul DB (CP5) |
| Regia | ✅ Live CP12+08-07 | Respiro + dossier CSV + staff (add/edit/**invita**) + **struttura reparti/pdc modificabile** + card cantiere |
| Inviti staff (password) | ✅ Fatto 08-07 pom. | `invites.ts` + `/accept-invite` + claim al login; `verify:invite` verde. Email: kill-switch `VITE_INVITE_EMAIL_ENABLED`; SMTP custom prima dell'uso reale (FU-017) |
| Onboarding titolare | ✅ Fatto 08-07 pom. | `/onboarding` cantiere 7 passi, ripetibile pre-compilato, gate azienda vuota. Profili frigo = FU-005; cascata (passo 6) = FU-014 |
| Realtime invalidate | ❌ Solo refetch on focus | FU-010, dec. 11 |
| Export PDF audit-grade | ❌ Solo CSV dossier giorno | ws7 masterplan |
| Playwright E2E | ✅ smoke read-only **10 test** | `npm run test:e2e`: login + 4 case + ruoli + struttura Regia + onboarding. Scritture via UI = da fare (FU-012) |
| Multi-sede / IA / pagamenti | ❌ Fuori scope beta | |

### Database

- **11 migration** in `supabase/migrations/` applicate sul live (baseline + audit-grade CP5 + RLS CP6 + storno trigger CP9).
- **Schema = verità:** tipi in `src/types/database.types.ts` — **generati, non editare a mano**.
- **Regola d’oro:** registri **append-only** — annullare = riga di **storno**, mai DELETE su completamenti/letture.

---

## 4. Bootstrap per chi testa (prima volta)

### 4.1 Prerequisiti

- Node.js (LTS) + `npm install` in root repo
- File **`.env.local`** (gitignored) con almeno:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` (utente test admin)
  - `SUPABASE_DB_PASSWORD` (solo se usi CLI/migration — vedi `FABLE_AVVIO.md`)
- **Docker Desktop** attivo se fai `db pull` / stack locale Supabase

### 4.2 Verifica ambiente (health check automatico)

Eseguire **in ordine** — tutti devono uscire **0**:

```bash
npm run verify:setup          # CLI + env + legacy path
npm run verify:supabase-env   # .env.local + ping REST
npm run validate              # lint + tsc + 58 unit test
npm run verify:flows          # E2E lettura RLS (5 aree)
```

**Scrittura sul DB live** (solo se autorizzato — crea righe permanenti):

```bash
npm run verify:flows:write    # temperatura, spunta, storno, timbro, conteggio, lista RPC
npm run verify:invite         # flusso inviti (si ripulisce da solo; email vera solo con INVITE_TEST_EMAIL)
```

### 4.3 Avvio app in locale

```bash
npm run dev                   # http://localhost:3000
```

Login con credenziali `TEST_USER_*` da `.env.local`.
L’utente test è **admin** su azienda demo (Al Ritrovo SRL) — vede anche **Regia**.

Se manca l’utente: `node scripts/create-test-user.mjs` (richiede service key in env).

### 4.4 Build produzione (smoke PWA)

```bash
npm run build                 # dist/ + service worker
npm run preview               # opzionale, serve dist
```

---

## 5. Checklist QA manuale consigliata

Usare come prima passata sistematica. Segnare ✅ / ❌ / ⚠️ con data e note.

### Oggi (`/`)

- [ ] Caricamento mansioni/manutenzioni di oggi senza errori console
- [ ] Spunta mansione → scompare da «da fare», compare in «fatto»
- [ ] Storno mansione → torna esigibile, registro mostra traccia
- [ ] Spunta manutenzione → `next_due` avanza (trigger DB)
- [ ] Storno manutenzione → task torna esigibile (trigger storno-aware CP9)
- [ ] Registra temperatura da Reparti → mansione temp scompare da Oggi
- [ ] Timbro turno → riga su `shift_seals`, UI sigillo
- [ ] 📅 apre Calendario e torna indietro

### Calendario (`/calendario`)

- [ ] Navigazione mese ±
- [ ] Occorrenze future visibili (mansioni daily/weekly, manutenzioni con «in programma»)
- [ ] Completamento anticipato → conferma armata → registro oggi
- [ ] Storno da registro → occorrenza futura riappare
- [ ] Temperature future: messaggio + «Vai al punto» solo se oggi

### Reparti (`/reparti`)

- [ ] Switch reparto (tab centrale con nome reale)
- [ ] Marker verdetto coerente con ultima lettura
- [ ] Tastierone: inserimento °C + metodo → lettura append-only
- [ ] Verdetto colore (ok/warn/alarm) allineato a `haccp-rules.ts`

### Scorte (`/scorte`)

- [ ] Inventario per categoria / accordion
- [ ] Giro conteggio +/− → `stock_counts`
- [ ] Crea lista spesa (RPC) → voci visibili
- [ ] Spunta voce lista (RPC)
- [ ] Voce libera senza avanzare stock (dec. 12.4)

### Regia (`/regia`) — solo admin/responsabile

- [ ] Respiro: numeri non zero se ci sono dati oggi
- [ ] Tono ok/warn/alarm sensato
- [ ] Genera dossier → anteprima righe → scarica CSV
- [ ] Aggiungi persona staff → compare in lista
- [ ] Parametri HACCP: sola lettura, nessun input modificabile

### Auth / ruoli

- [ ] Dipendente (se esiste utente test) **non** vede Regia
- [ ] Logout / re-login

---

## 6. Cosa è già stato verificato (Fable)

| Verifica | Quando | Esito |
|----------|--------|-------|
| `npm run validate` (53 test) | CP12 | ✅ verde |
| `npm run verify:flows` (lettura RLS) | CP8 | ✅ |
| `npm run verify:flows:write` (scrittura) | CP9 | ✅ (con ok owner) |
| Smoke browser Calendario (spunta anticipata + storno) | CP10 | ✅ |
| Smoke browser Scorte | CP11 | ✅ (sessione Fable) |
| Smoke browser Regia | CP12 | parziale (codice + validate; QA manuale sistematico **da fare**) |
| Smoke Playwright (`test:e2e`) — login, 4 case, ruolo dipendente, struttura Regia | blindatura 08-07 | ✅ 9 test |
| `verify:flows` esteso a Scorte + Calendario + Regia (lettura) e `--write` (RPC spesa, conteggio, anticipata+storno) | blindatura 08-07 | ✅ |
| Component test KeypadSheet (verdetto SOLO dalla fonte-unica) | blindatura 08-07 | ✅ 3 test |
| Probe RLS struttura (INSERT/UPDATE/DELETE departments + UPDATE pdc, admin, cleanup) | blindatura 08-07 | ✅ |
| `npm run verify:invite` — token RLS admin, function attiva, validazione anonima, login invitato, claim membership, pulizia | 08-07 pom. | ✅ (email vera = passo owner, FU-017) |
| Smoke Playwright onboarding (cantiere pre-compilato + temperatura dal LOCK) | 08-07 pom. | ✅ (tot **10 test**) |
| `npm run validate` post inviti+onboarding | 08-07 pom. | ✅ 58 unit |

**Gap QA:** gli smoke Playwright sono **read-only** (nessuna scrittura via UI: spunta, regtemp, timbro). Estensioni = FU-012. Email invito reale non ancora cliccata da inbox vera (FU-017).

---

## 7. Lavori aperti (priorità suggerita per debug/test)

| Priorità | Cosa | Perché conta per chi testa |
|----------|------|---------------------------|
| **P0** | QA manuale checklist §5 su device reale (mobile + desktop) | Prima beta interna |
| **P0** | Test email invito da inbox vera + SMTP custom (FU-017) | Il flusso è verde via API; manca il click reale dal messaggio |
| **P1** | PNG PWA 192/512 maskable | Installazione iOS/Android affidabile |
| **P1** | Cascata prodotti (FU-014, mockup 03) | Completa il passo 6 del cantiere |
| **P1** | Realtime / invalidate on change (FU-010) | Due tab aperte non si allineano subito |
| **P2** | Hardening RLS legacy (FU-016) + profili frigo nella fonte-unica (FU-005) | Sicurezza inviti · passo 4 coi profili |
| **P2** | Export PDF audit-grade (ws7) | Oggi solo CSV dossier giorno |
| **P2** | `haccp-rules.ts`: regole `pending` → validate con consulente | Verdetti su tipi punto incompleti |
| **P3** | Code-split bundle (>500 kB warning build) | Performance, non funzionalità |

Dettaglio follow-up: `docs/skill-system/sessioni/FOLLOW_UP.md`.

---

## 8. Trappole note (debug)

1. **DB = PROD** — project ref `hjteuounjwkadmsbsmdm`. Ogni scrittura di test resta nel registro.
   Usare `--write` solo consapevolmente. Stornare per «pulire» dove previsto.
2. **No MCP Supabase** in sessione Fable — solo CLI + script npm (`FABLE_AVVIO.md`).
3. **Numeri HACCP** solo in `src/compliance/haccp-rules.ts` — non cercare soglie hardcoded in UI.
4. **Legacy BHM-v.2** read-only — non copiare componenti UI da lì; logica sì (cherry-pick).
5. **Migration file con header DRAFT** — se applicata sul live, **non modificare** il file (append-only migrations).
6. **Account CLI ≠ account dashboard** — management API può dare 403; usare connessione diretta pooler.
7. **Dati test sporchi** — sessioni Fable precedenti possono aver lasciato completamenti/storni
   (es. spunta anticipata Calendario 7 lug). Normale per append-only.
8. **Regia staff senza invito** — persona in tabella `staff` ≠ utente auth in `auth.users`.

---

## 9. Riferimenti utili

| Documento | Uso |
|-----------|-----|
| `docs/FABLE_CHECKPOINT.md` | Filo di Arianna costruzione (CP1–CP12) |
| `docs/guide/SCOPE_PRODOTTO_BETA.md` | Cosa è dentro/fuori beta |
| `docs/meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md` | 12+ decisioni vincolanti |
| `docs/meta/MAPPATURA_AREE/FEATURE_Calendario_vista-completa.md` | Spec Calendario (dec. 13) |
| `docs/skill-system/sessioni/06-07-26/Report-sessione-cp10-12-fable.md` | Report deep CP10–12 |
| `FABLE_AVVIO.md` | Bootstrap DB, env, comandi Supabase |
| `docs/meta/MOCKUP_UI/` | Verità visiva (06 shell, 01 Oggi, 04 Regia, 07 Scorte) |

---

## 10. Comandi rapidi (copia-incolla)

```bash
# Health check completo (~2 min)
npm run verify:setup && npm run validate && npm run verify:flows

# Sviluppo
npm run dev

# Dopo modifiche codice
npm run validate && npm run build

# Solo unit test area
npx vitest run src/features/calendario
npx vitest run src/features/scorte
```

---

**Ultimo aggiornamento:** 2026-07-08 pom. · inviti staff + onboarding cantiere + modal v2 (§1/§2/§3/§4/§6/§7) · → `docs/skill-system/sessioni/08-07-26/Report-esecuzione-inviti-onboarding.md`
