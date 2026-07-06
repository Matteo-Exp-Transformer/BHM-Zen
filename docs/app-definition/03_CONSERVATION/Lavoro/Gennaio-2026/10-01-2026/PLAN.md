# PLAN.md - Conservation Feature Multi-Agent Workflow v2.0

> **Data Creazione**: 2025-01-11
> **Versione**: 2.0 - "Verify First, Fix After"
> **Workers**: 6 (Worker 0-5)
> **Fasi Sequenziali**: 4 (FASE 0-3)
> **Tempo Stimato**: ~7h (variabile in base a verifiche Worker 0)

---

## 📋 INDICE

1. [Overview](#overview)
2. [Workflow Completo](#workflow-completo)
3. [Fase 0: Verifica (Worker 0)](#fase-0-verifica-worker-0)
4. [Fase 1: Fix (Workers 1-3)](#fase-1-fix-workers-1-3)
5. [Fase 2: Integration (Worker 4)](#fase-2-integration-worker-4)
6. [Fase 3: Final Verification (Worker 5)](#fase-3-final-verification-worker-5)
7. [Gate Functions](#gate-functions)
8. [Dipendenze Critiche](#dipendenze-critiche)
9. [Success Criteria](#success-criteria)
10. [Gestione Escalation](#gestione-escalation)
11. [Comandi Verifica](#comandi-verifica)
12. [Timeline](#timeline)

---

## 🎯 OVERVIEW

### Contesto

**Problema**: Sessione precedente Workers 1-4 ha dichiarato completamento con 24/24 test PASS, ma l'utente ha scoperto che **2 problemi critici + 6 problemi non verificati** sono ancora presenti.

**Root Cause Sessione Precedente**:
- Workers hanno fixato senza verificare prima se il problema esisteva
- Claim di completamento senza evidenza concreta
- Nessun gate function rigido tra fasi

**Soluzione v2.0**:
- Introduzione Worker 0 (Audit Specialist) per **verifica pre-fix**
- Gate Functions rigorose tra ogni fase
- Workflow "Verify First, Fix After"
- Blocco esecuzione fase N+1 se fase N REJECTED

### Obiettivi

1. ✅ **Verificare** ogni problema audit con evidenza concreta (screenshot/codice/comandi)
2. ✅ **Separare** problemi CONFERMATI da FALSI POSITIVI
3. ✅ **Fixare** solo problemi CONFERMATI con TDD (RED-GREEN-REFACTOR)
4. ✅ **Testare** con E2E flow completo + performance
5. ✅ **Validare** con comandi FRESH (no cache) prima del merge

### Problemi Confermati dall'Utente

| # | Problema | Location | Severity | Blocker |
|---|----------|----------|----------|---------|
| 1 | Select Ruolo non funzionante | AddPointModal.tsx:186-203 | CRITICAL | Blocca #2 |
| 2 | Campi Categoria/Dipendente mancanti | AddPointModal.tsx:207-265 | CRITICAL | Dipende da #1 |

**Root Cause #1**: Select usa `<select>` HTML nativo invece di `<Select>` UI component → non risponde ai click → `task.assegnatoARuolo` non popolato → condizione `{task.assegnatoARuolo && ...}` falsa → campi Categoria/Dipendente non renderizzati.

### Problemi da Verificare (Worker 0)

| # | Claim | Status | Worker 0 Task |
|---|-------|--------|---------------|
| 3 | z-index AddTemperatureModal | 🔍 DA VERIFICARE | Task 0.1 Sub-task 1 |
| 4 | Temperatura input range validation | 🔍 DA VERIFICARE | Task 0.1 Sub-task 2 |
| 5 | Pulsante "Completa" ScheduledMaintenanceCard | 🔍 DA VERIFICARE | Task 0.2 |
| 6 | Espansione card ScheduledMaintenanceCard | 🔍 DA VERIFICARE | Task 0.2 |
| 7 | Campo Reparto in TasksStep onboarding | 🔍 DA VERIFICARE | Task 0.3 |
| 8 | Elementi ConservationPointCard incompleti | 🔍 DA VERIFICARE | Task 0.4 |

---

## 🔄 WORKFLOW COMPLETO

```
┌──────────────────────────────────────────────────────────┐
│                    INIZIO WORKFLOW                       │
│                  (User approva piano)                    │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  FASE 0: VERIFICA (Worker 0 - Audit Specialist)         │
│  Tempo: 1.5h                                             │
│  ──────────────────────────────────────────────────────  │
│  Task 0.1: Verifica AddPointModal UI (30min)            │
│  Task 0.2: Verifica ScheduledMaintenanceCard (20min)    │
│  Task 0.3: Verifica TasksStep Reparto (15min)           │
│  Task 0.4: Verifica ConservationPointCard (15min)       │
│  ──────────────────────────────────────────────────────  │
│  OUTPUT: VERIFICATION_REPORT_[DATA].md                   │
│    ├─> VERIFIED ISSUES (✅ CONFIRMED con evidenza)      │
│    ├─> FALSE POSITIVES (❌ REJECTED con motivo)         │
│    └─> SUMMARY (totali + raccomandazioni)               │
└──────────────────────┬───────────────────────────────────┘
                       │
                  ╔════▼════╗
                  ║ GATE 1  ║
                  ╚════╤════╝
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ❌ REJECTED               ✅ APPROVED
    (0 issues)              (≥1 issue confirmed)
         │                           │
         ▼                           ▼
    🛑 STOP                 ┌────────────────────────────────────────┐
                           │  FASE 1: FIX (Workers 1-3)             │
                           │  Tempo: 2h 15min                       │
                           │  ────────────────────────────────────  │
                           │  Worker 1 (Frontend UI) - 2h 15min    │
                           │    Task 1.5: Fix Select Ruolo (45min) │
                           │      └─> 🔴 ROOT CAUSE CRITICO         │
                           │    Task 1.4: Verifica Categoria/       │
                           │              Dipendente (1h)           │
                           │      └─> ⚠️ BLOCKED BY Task 1.5        │
                           │    Task 1.6: Aggiungere Reparto (30m)  │
                           │  ────────────────────────────────────  │
                           │  OUTPUT: Fix + Test GREEN              │
                           └────────────┬───────────────────────────┘
                                        │
                                   ╔════▼════╗
                                   ║ GATE 2  ║
                                   ╚════╤════╝
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                     ❌ REJECTED                ✅ APPROVED
                     (test falliti)           (test GREEN)
                          │                           │
                          ▼                           ▼
                     ⬅️ FASE 1          ┌────────────────────────────────────┐
                                        │  FASE 2: INTEGRATION (Worker 4)    │
                                        │  Tempo: 2h 15min                   │
                                        │  ────────────────────────────────  │
                                        │  Task 4.1: Test E2E (1.5h)         │
                                        │    └─> Flusso completo manutenzioni│
                                        │  Task 4.2: Test Performance (45min)│
                                        │    └─> 100 punti × 4 manutenzioni  │
                                        │  ────────────────────────────────  │
                                        │  OUTPUT: E2E + Performance OK      │
                                        └────────────┬───────────────────────┘
                                                     │
                                                ╔════▼════╗
                                                ║ GATE 3  ║
                                                ╚════╤════╝
                                                     │
                                       ┌─────────────┴─────────────┐
                                       │                           │
                                  ❌ REJECTED                ✅ APPROVED
                                  (E2E falliti)            (E2E PASS)
                                       │                           │
                                       ▼                           ▼
                                  ⬅️ FASE 1         ┌───────────────────────────┐
                                                    │  FASE 3: FINAL            │
                                                    │  VERIFICATION (Worker 5)  │
                                                    │  Tempo: 1h                │
                                                    │  ───────────────────────  │
                                                    │  Task 5.1: Quality Check  │
                                                    │    └─> Comandi FRESH      │
                                                    │  ───────────────────────  │
                                                    │  OUTPUT:                  │
                                                    │  SUPERVISOR_FINAL_REPORT  │
                                                    └───────────┬───────────────┘
                                                                │
                                                           ╔════▼════╗
                                                           ║ VERDICT ║
                                                           ╚════╤════╝
                                                                │
                                                  ┌─────────────┴─────────────┐
                                                  │                           │
                                             ❌ REJECTED                ✅ APPROVED
                                                  │                           │
                                                  ▼                           ▼
                                             ⬅️ FASE X                  🎉 MERGE
```

---

## 📍 FASE 0: VERIFICA (Worker 0)

### Obiettivo
Verificare OGNI problema audit con evidenza concreta e classificare come ✅ CONFIRMED o ❌ REJECTED.

### Worker Responsabile
**Worker 0**: Audit Specialist 🔍

### Task (4 task, 1.5h)

**Task 0.1**: Verifica AddPointModal UI (30min, CRITICAL)
**Task 0.2**: Verifica ScheduledMaintenanceCard (20min, MEDIUM)
**Task 0.3**: Verifica TasksStep Reparto (15min, HIGH)
**Task 0.4**: Verifica ConservationPointCard (15min, LOW)

### Deliverable
`VERIFICATION_REPORT_[DATA].md` con sezioni:
- ✅ VERIFIED ISSUES (problemi confermati)
- ❌ FALSE POSITIVES (problemi rigettati)
- 📊 SUMMARY (raccomandazioni per Workers 1-3)

**Dettagli completi**: Vedi [TASKS.md](TASKS.md) - Fase 0

---

## 🔧 FASE 1: FIX (Workers 1-3)

### ⚠️ PREREQUISITI
- ✅ VERIFICATION_REPORT.md completo
- ✅ Worker 0 verdict = APPROVED
- ✅ Almeno 1 problema CONFIRMED

### Workers Responsabili
- **Worker 1**: Frontend UI (2h 15min)
- **Workers 2-3**: SKIP (già completati)

### Task Worker 1

**Task 1.5**: Fix Select Ruolo (45min, CRITICAL) 🔴 **ROOT CAUSE**
- Problema: `<select>` nativo → sostituire con `<Select>` UI component
- Blocca: Task 1.4
- TDD: RED → GREEN → REFACTOR

**Task 1.4**: Verifica Categoria/Dipendente (1h, CRITICAL)
- ⚠️ BLOCKED BY Task 1.5
- Test: campi visibili dopo selezione ruolo

**Task 1.6**: Aggiungere Reparto TasksStep (30min, MEDIUM)
- CONDIZIONALE: solo se Task 0.3 CONFIRMED

### Deliverable
- Fix implementati in AddPointModal.tsx
- Test unit GREEN
- Type check PASS

**Dettagli completi**: Vedi [TASKS.md](TASKS.md) - Fase 1

---

## 🧪 FASE 2: INTEGRATION (Worker 4)

### ⚠️ PREREQUISITI
- ✅ Fase 1 COMPLETED
- ✅ Tasks 1.4, 1.5 DONE
- ✅ Test unit GREEN

### Worker Responsabile
**Worker 4**: Testing & Integration (2h 15min)

### Task

**Task 4.1**: Test E2E Flusso Manutenzioni (1h 30min, HIGH)
- Test Playwright: Crea punto → Configura manutenzioni → Salva
- ✅ CRITICAL: Select ruolo funzionante
- ✅ CRITICAL: Campi Categoria/Dipendente visibili
- Screenshot evidenza obbligatori

**Task 4.2**: Test Performance (45min, MEDIUM)
- Seed: 100 punti × 4 manutenzioni
- Query time < 500ms
- Render time < 1000ms

### Deliverable
- Test E2E PASS
- Screenshot evidenza (10+)
- Performance report

**Dettagli completi**: Vedi [TASKS.md](TASKS.md) - Fase 2

---

## ✅ FASE 3: FINAL VERIFICATION (Worker 5)

### ⚠️ PREREQUISITI
- ✅ Fasi 0-2 APPROVED
- ✅ E2E tests GREEN
- ✅ Performance OK

### Worker Responsabile
**Worker 5**: Supervisor (1h)

### Task

**Task 5.1**: Final Quality Check (1h, CRITICAL)
- Esegui FRESH (no cache):
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e`
  - `node scripts/verify-conservation-db.js`

### Deliverable
`SUPERVISOR_FINAL_REPORT.md` con verdict:
- ✅ APPROVED → Ready to merge
- ❌ REJECTED → Torna a fase X con action items

**Dettagli completi**: Vedi [TASKS.md](TASKS.md) - Fase 3

---

## 🚦 GATE FUNCTIONS

### Gate 1: Fase 0 → Fase 1
**Condizioni PASS**:
- ✅ VERIFICATION_REPORT.md completo
- ✅ Almeno 1 problema CONFIRMED

**Se FAIL**: 🛑 STOP (se 0 CONFIRMED) o ⬅️ Fase 0 (se report incompleto)

---

### Gate 2: Fase 1 → Fase 2
**Condizioni PASS**:
- ✅ Tasks 1.4, 1.5 COMPLETED
- ✅ Test unit GREEN
- ✅ Type check PASS

**Se FAIL**: ⬅️ TORNA A FASE 1

---

### Gate 3: Fase 2 → Fase 3
**Condizioni PASS**:
- ✅ E2E tests PASS
- ✅ Performance OK
- ✅ Screenshot evidenza salvati

**Se FAIL**: ⬅️ TORNA A FASE 1 (se regressione) o FASE 2 (se flaky test)

---

### Verdict: Fase 3 → Merge/Reject
**Condizioni APPROVED**:
- ✅ type-check: 0 errors
- ✅ lint: 0 errors
- ✅ build: SUCCESS
- ✅ test: ALL PASS
- ✅ test:e2e: ALL PASS
- ✅ db-check: 0 orphans

**Se APPROVED**: 🎉 MERGE to main
**Se REJECTED**: ⬅️ TORNA A FASE indicata

---

## 🔗 DIPENDENZE CRITICHE

### Critical Path
```
Task 0.1 (Verifica select ruolo)
  └─> ✅ CONFIRMED
        │
        ▼
Task 1.5 (Fix Select Ruolo) 🔴 ROOT CAUSE
  └─> Sostituisci <select> con <Select>
        │
        ▼ SBLOCCA
        │
Task 1.4 (Verifica Categoria/Dipendente)
  └─> Test: campi visibili dopo selezione
        │
        ▼ RICHIESTO DA
        │
Task 4.1 (E2E Test)
  └─> Verifica flusso completo funzionante
```

**⚠️ Se Task 1.5 FAIL → blocca TUTTO il workflow**

---

## ✅ SUCCESS CRITERIA

### Workflow APPROVED se:

**Fase 0**:
- [ ] VERIFICATION_REPORT.md completo
- [ ] Almeno 1 problema CONFIRMED

**Fase 1**:
- [ ] Task 1.5 COMPLETED (select ruolo funzionante)
- [ ] Task 1.4 COMPLETED (campi visibili)
- [ ] Test unit GREEN
- [ ] Type check PASS

**Fase 2**:
- [ ] E2E tests PASS
- [ ] Select ruolo funzionante (screenshot)
- [ ] Campi Categoria/Dipendente visibili (screenshot)
- [ ] Performance OK (< 500ms query, < 1000ms render)

**Fase 3**:
- [ ] Tutti comandi FRESH GREEN
- [ ] SUPERVISOR_FINAL_REPORT.md = APPROVED

### Merge Requirements
- [x] type-check: 0 errors
- [x] lint: 0 errors
- [x] build: SUCCESS
- [x] test: ALL PASS
- [x] test:e2e: ALL PASS
- [x] db-check: 0 orphans
- [x] Documentazione aggiornata
- [x] Screenshot evidenza E2E

---

## 🚨 GESTIONE ESCALATION

### Escalation Decision Tree

```
FASE FAIL
   │
   ├─> FASE 0: 0 CONFIRMED → 🛑 STOP
   │           Report incompleto → ⬅️ Fase 0
   │
   ├─> FASE 1: Test RED → ⬅️ Fase 1 (re-implementa)
   │           Type errors → ⬅️ Fase 1 (fix types)
   │           Regressione → ⬅️ Fase 1 (debug)
   │
   ├─> FASE 2: E2E FAIL → ⬅️ Fase 1 (se Task 1.5/1.4)
   │           Timeout → Fix test, re-run Fase 2
   │           Performance → Worker 2 optimize
   │
   └─> FASE 3: Type/Build FAIL → ⬅️ Fase 1
               E2E FAIL → ⬅️ Fase 2 (flaky test)
               DB orphans → ⬅️ Fase 1 (Worker 2)
```

**Dettagli completi**: Vedi sezione Escalation in questo file

---

## 🔧 COMANDI VERIFICA

### Worker 0 - Verifica
```bash
# Select ruolo
grep -A 20 "Assegnato a Ruolo" src/features/conservation/components/AddPointModal.tsx

# Categoria/Dipendente
grep -B 5 -A 15 "task.assegnatoARuolo &&" src/features/conservation/components/AddPointModal.tsx
```

### Worker 1 - Fix
```bash
# TDD watch mode
npm run test -- AddPointModal --watch

# Verifica
npm run test
npm run type-check
npm run lint
```

### Worker 4 - E2E
```bash
# E2E conservation
npm run test:e2e -- conservation-flow

# Performance
npm run test:e2e -- performance
```

### Worker 5 - Final Check
```bash
# Pulisci cache
rm -rf node_modules/.vite node_modules/.cache dist

# Full suite FRESH
npm run type-check 2>&1 | tee type-check-final.log
npm run lint 2>&1 | tee lint-final.log
npm run build 2>&1 | tee build-final.log
npm run test 2>&1 | tee test-final.log
npm run test:e2e 2>&1 | tee e2e-final.log
node scripts/verify-conservation-db.js 2>&1 | tee db-check-final.log
```

---

## 📅 TIMELINE

| Fase | Tempo | Cumulativo |
|------|-------|------------|
| FASE 0: Verifica | 1h 30min | 1h 30min |
| FASE 1: Fix | 2h 15min | 3h 45min |
| FASE 2: Integration | 2h 15min | 6h 00min |
| FASE 3: Final Check | 1h 00min | 7h 00min |
| **TOTALE** | **~7h** | |

**Nota**: Tempo può ridursi se Worker 0 rigetta molti problemi o aumentare se gate function fail.

---

## 📝 SUMMARY

### Workflow v2.0 Key Points

1. **Verify First, Fix After**: Worker 0 verifica prima di fixare
2. **Gate Functions**: Blocco rigido tra fasi
3. **Root Cause Focus**: Task 1.5 sblocca Task 1.4
4. **TDD Obbligatorio**: RED-GREEN-REFACTOR
5. **E2E Evidenza**: Screenshot obbligatori
6. **Fresh Commands**: No cache in Fase 3

### Files Prodotti

1. **Fase 0**: VERIFICATION_REPORT.md
2. **Fase 1**: Fix codice + test
3. **Fase 2**: E2E test + screenshot
4. **Fase 3**: SUPERVISOR_FINAL_REPORT.md

### Success Path

```
FASE 0 ✅ → GATE 1 ✅ → FASE 1 ✅ → GATE 2 ✅ → FASE 2 ✅ → GATE 3 ✅ → FASE 3 ✅ → APPROVED ✅ → MERGE 🎉
```

---

## 📚 RIFERIMENTI

- [WORKER_PROMPTS.md](WORKER_PROMPTS.md) - Prompts dettagliati workers
- [TASKS.md](TASKS.md) - Task specifiche con comandi
- [00_MASTER_INDEX.md](00_MASTER_INDEX.md) - Audit report 8 problemi
- [ADD_POINT_MODAL.md](ADD_POINT_MODAL.md) - Documentazione componente
- [AddPointModal.tsx](../../src/features/conservation/components/AddPointModal.tsx) - Codice da fixare
- [TasksStep.tsx](../../src/components/onboarding-steps/TasksStep.tsx) - Pattern corretto
