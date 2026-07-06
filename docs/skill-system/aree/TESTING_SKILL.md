---
name: testing
description: >-
  Skill per test e verifica in BHM-Zen: unit Vitest, gate validate, E2E script verify:flows,
  QA manuale. Caricala in profilo Verifica o quando il task riguarda test/CI/debug test.
---

# Testing — Guida agente (BHM-Zen)

> Stack: **Vitest** + jsdom + Testing Library (unit/component) · **nessun Playwright/Cypress** (roadmap).
> E2E app = script Node `verify:flows` (login utente test + stesse query dei hook, RLS attiva).
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

Flussi app sotto RLS con utente test (Oggi + Reparti: letture + scrittura)
  → npm run verify:flows | verify:flows:write

Interazione UI reale (tap, layout, PWA)
  → QA manuale browser (npm run dev) — checklist HEALTH_CHECK §5
  → Playwright: NON presente (FU futuro se serve automazione browser)
```

---

## 3. Comandi

```bash
npm run test              # unit Vitest, una passata
npm run test:watch        # unit in watch
npm run validate          # gate pre-PR: lint + typecheck + test
npm run verify:setup      # bootstrap ambiente (prima sessione)
npm run verify:flows      # E2E lettura RLS — Oggi + Reparti (serve .env.local + TEST_USER_*)
npm run verify:flows:write  # E2E SCRITTURA sul DB live — righe permanenti; ok owner prima
npm run dev               # QA manuale → http://localhost:3000
npm run build             # smoke build PWA
```

**Prerequisiti `verify:flows*`:** `.env.local` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`. Utente mancante: `node scripts/create-test-user.mjs`.

---

## 4. Profilo Verifica — ordine consigliato

1. **`npm run validate`** — gate automatico. Se fallisce, la revisione si ferma.
2. **`npm run verify:flows`** — se l'area tocca Oggi/Reparti o fondamenta condivise (lettura RLS).
3. **QA manuale** sulle schermate toccate — checklist `HEALTH_CHECK_POST_FABLE.md` §5.
4. **`npm run verify:flows:write`** — solo se il task ha introdotto scritture DB e l'owner ha
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

## 5. Mappa test esistenti (unit)

| File | Cosa copre |
|------|------------|
| `src/compliance/haccp-rules.test.ts` | LOCK numeri HACCP, gate-2 Change-Control |
| `src/compliance/point-verdict.test.ts` | Ponte pdc → verdetto (zero numeri hardcoded) |
| `src/lib/dates.test.ts` | RULE timezone (mai `toISOString().split`) |
| `src/features/calendario/occurrences.test.ts` | Occorrenze calendario (logica pura) |
| `src/features/scorte/stock.test.ts` | Sotto-scorta, scadenze, suggerimenti |

**Gap noto:** nessun test automatico browser per Scorte/Regia/Calendario oltre unit puri;
`verify:flows` copre solo Oggi+Reparti (estensione = follow-up futuro).

---

## 6. LOCK di area

```
RULE  verify:flows:write = trigger DEEP + ok owner (Bussola §6)
RULE  non aggiungere test in docs/ — restano esclusi da Vitest
RULE  test che scrivono sul DB → documentare nel report cosa resta sul live
```

---

**Ultimo aggiornamento**: 2026-07-06 · compilata da template: Vitest + verify:flows + HEALTH_CHECK §5, viewport 390/768/1280, FU-004 chiuso · → sessione skill-system lessico+testing
