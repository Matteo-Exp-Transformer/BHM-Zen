---
name: testing
description: >-
  Skill per test e verifica in BHM-Zen: unit Vitest, gate validate, E2E script verify:flows,
  QA manuale. Caricala in profilo Verifica o quando il task riguarda test/CI/debug test.
---

# Testing — Guida agente (BHM-Zen)

> Stack: **Vitest** + jsdom + Testing Library (unit/component) · **Playwright** (E2E browser).
> E2E API = script Node `verify:flows` (login utente test + stesse query dei hook, RLS attiva).
> Fonte operativa: `docs/guide/HEALTH_CHECK_POST_FABLE.md` §4–§6.

---

## 0. Quando caricare questo skill

| Il task riguarda… | Skill |
|-------------------|-------|
| Aggiungere/modificare test | **questo** |
| Analizzare un test che fallisce | **questo** |
| Profilo Verifica («revisiona/verifica/debugga») | **questo** + skill dell'area revisionata |
| Modificare solo codice app (non i test) | skill della zona |

---

## 1. Regole d'oro

- **Prima di scrivere un test nuovo, verifica se ne esiste già uno utile** ed estendilo.
- **Nessun test tocca dati di produzione arbitrari.** Il DB `hjteuounjwkadmsbsmdm` è l'unico DB
  (dati test owner); `verify:flows:write` crea righe **permanenti** — solo con ok owner esplicito.
- **Unit test = logica pura** accanto al modulo (`*.test.ts` nella stessa cartella del sorgente).
- **`docs/**` è escluso** da Vitest (`vite.config.ts`) — artefatti Fase 3 non sono test del progetto.

---

## 2. Quando usare cosa

```
Logica senza browser (date, occorrenze, stock, haccp-rules, point-verdict)
  → Vitest unit (npm run test)

Interazione UI reale (tap, layout, PWA, navigazione 4 case)
  → Playwright (npm run test:e2e) — smoke autenticato + login page
  → QA manuale browser (npm run dev) — checklist HEALTH_CHECK §5

Flussi dati sotto RLS senza browser (Oggi + Reparti lettura/scrittura)
  → npm run verify:flows | verify:flows:write
```

---

## 3. Comandi

```bash
npm run test              # unit Vitest, una passata
npm run test:watch        # unit in watch
npm run test:e2e          # Playwright — avvia dev server + smoke browser
npm run test:e2e:ui       # Playwright UI mode (debug)
npm run test:e2e:report   # apre ultimo report HTML Playwright
npm run validate          # gate pre-PR: lint + typecheck + test (unit only)
npm run validate:full     # validate + test:e2e (gate completo, serve .env.local)
npm run verify:setup      # bootstrap ambiente (prima sessione)
npm run verify:flows      # E2E lettura RLS — Oggi + Reparti (serve .env.local + TEST_USER_*)
npm run verify:flows:write  # E2E SCRITTURA sul DB live — righe permanenti; ok owner prima
npm run verify:invite     # flusso inviti live (si ripulisce; email vera solo con INVITE_TEST_EMAIL)
npm run dev               # QA manuale → http://localhost:3000
npm run build             # smoke build PWA
```

**Prerequisiti `verify:flows*`:** `.env.local` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`. Utente mancante: `node scripts/create-test-user.mjs`.

---

## 4. Profilo Verifica — ordine consigliato

1. **`npm run validate`** — gate automatico (unit). Se fallisce, la revisione si ferma.
2. **`npm run test:e2e`** — smoke browser (login + Oggi + navigazione case). Serve `.env.local` + `TEST_USER_*`.
3. **`npm run verify:flows`** — se l'area tocca Oggi/Reparti o fondamenta condivise (lettura RLS).
4. **QA manuale** sulle schermate toccate — checklist `HEALTH_CHECK_POST_FABLE.md` §5.
5. **`npm run verify:flows:write`** — solo se il task ha introdotto scritture DB e l'owner ha
   autorizzato (modalità **deep**; crea temperature, completamenti, timbri reali).
5. **Registro esiti** nel report: tabella ID · viewport · esito · nota.

### Viewport QA manuale (responsive §13.3)

Ripeti gli stessi passi funzionali su **tre larghezze** (breakpoint shell: Tailwind `md` = 768px):

| Viewport | Ruolo |
|----------|--------|
| **390px** | telefono — bottom bar |
| **768px** | soglia mobile/desktop |
| **1280px** | desktop banco — side-rail 82px |

Non dichiarare «verificato» con una sola larghezza né con la sola lettura del codice.

---

## 5. Mappa test esistenti

| Percorso | Cosa copre |
|----------|------------|
| `e2e/auth.setup.ts` | Login utente test admin → `e2e/.auth/user.json` (gitignored) |
| `e2e/smoke.spec.ts` | Oggi caricato, navigazione case, Calendario, Scorte, Regia (dossier+parametri), struttura Regia, **onboarding** (cantiere pre-compilato + temp dal LOCK), pagina login |
| `e2e/ruoli.spec.ts` | Guard ruoli: dipendente non vede Regia (barra + route `/regia` rimbalza) — login fresco `TEST_USER_DIPENDENTE_*` |
| `playwright.config.ts` | webServer Vite :3000, progetto chromium |

**Utente dipendente:** `node scripts/create-test-user.mjs --dipendente` (credenziali
`TEST_USER_DIPENDENTE_*` in `.env.local`).

### Unit (Vitest)

| File | Cosa copre |
|------|------------|
| `src/compliance/haccp-rules.test.ts` | LOCK numeri HACCP, gate-2 Change-Control |
| `src/compliance/point-verdict.test.ts` | Ponte pdc → verdetto (zero numeri hardcoded) |
| `src/lib/dates.test.ts` | RULE timezone (mai `toISOString().split`) |
| `src/features/calendario/occurrences.test.ts` | Occorrenze calendario (logica pura) |
| `src/features/scorte/stock.test.ts` | Sotto-scorta, scadenze, suggerimenti |
| `src/features/reparti/KeypadSheet.test.tsx` | Component: regtemp — cablaggio UI→fonte-unica (verdetto calcolato dal LOCK nel test, hook mockato), segno/cancella, errore non chiude |

**verify:flows** (esteso 08-07): lettura RLS su Oggi+Reparti+Scorte+Calendario+Regia;
`--write` copre regtemp→trigger→storno, spunta+storno, timbro, giro conteggio, lista via
RPC + spunta + voce libera, spunta anticipata+storno. Gate completo: `npm run validate:full`
(= validate + test:e2e).

**verify:invite** (08-07 pom., FU-001): flusso inviti live — token con RLS `is_admin`,
raggiungibilità edge function, validazione token da anonimo, login invitato, claim membership,
token usato; **si ripulisce da solo**. Email vera solo con `INVITE_TEST_EMAIL` in `.env.local`
(GoTrue rifiuta i domini finti — vedi ERRORI_PROCESSO); `--cleanup` rimuove gli artefatti
del test email dopo il click manuale.

**Gap noto:** gli smoke Playwright sono read-only (nessuna scrittura via UI: spunta, regtemp,
timbro); component test = solo KeypadSheet (manca conferma armata Calendario — FU-012 residuo);
`test:e2e` non è nel gate `validate` (usare `validate:full` — CI da decidere).

---

## 6. LOCK di area

```
RULE  verify:flows:write = trigger DEEP + ok owner (Bussola §6)
RULE  non aggiungere test in docs/ — restano esclusi da Vitest
RULE  test che scrivono sul DB → documentare nel report cosa resta sul live
```

---

**Ultimo aggiornamento**: 2026-07-08 pom. · smoke 10 test (+onboarding), `verify:invite` nuovo, 58 unit · → `sessioni/08-07-26/Report-esecuzione-inviti-onboarding.md`
