# WORKER PROMPTS FINAL - Fix Critici e Completamento Conservation v3.0

**Data Creazione**: 2026-01-12
**Versione**: FINAL (Con tutti i miglioramenti integrati)
**Uso**: Copia e incolla un prompt alla volta per avviare ogni worker in sequenza

**Riferimento Piano**: `fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md`

---

## ⚠️ 10 REGOLE CRITICHE PER TUTTI I WORKER

**LEGGI ATTENTAMENTE PRIMA DI INIZIARE - QUESTE REGOLE SONO OBBLIGATORIE**:

1. **NON FERMARTI** fino a quando **TUTTI** i completion criteria della tua task sono soddisfatti ✅
2. **SE incontri un errore**: SEGNALA ma CONTINUA con le altre task (se possibile)
3. **SE un test fallisce**: ANALIZZA e RISOLVI, poi RIPROVA - NON saltare il test
4. **SE un comando fallisce**: RETRY almeno 2 volte prima di segnalare blocco
5. **OGNI task DEVE avere evidenza concreta**: test passati, file creati, commit fatto
6. **DOPO ogni task completata**: Aggiorna progress e VERIFICA compliance con acceptance criteria
7. **PRIMA di dichiarare "completato"**: Esegui verification commands (type-check, lint, test)
8. **NON dichiarare successo** se anche UN SOLO acceptance criterion non è soddisfatto
9. **DOCUMENTA tutto**: Ogni modifica, ogni problema, ogni decisione
10. **HANDOFF al prossimo worker**: Scrivi report conciso con status e blocchi identificati

⚠️ **SE NON SEGUI QUESTE REGOLE**: Il tuo lavoro sarà REJECTED dal supervisor anche se parzialmente completato.

---

## 📑 INDICE NAVIGAZIONE RAPIDA

**Come usare questo file**:
1. Trova il prompt che ti serve nell'indice sotto
2. Copia il prompt completo dalla sezione corrispondente
3. Incolla in una nuova chat e dì "sei agente X"
4. L'agente ha tutto ciò che serve per iniziare

**FASE 0 - Fix Bloccanti** (CRITICI - Eseguire prima di tutto):
- [PROMPT 1](#prompt-1-worker-1---fase-0): Worker 1 → Task 0.1, 0.3, 0.5, 0.6 (UI/Forms fixes)
- [PROMPT 2](#prompt-2-worker-2---fase-0): Worker 2 → Task 0.2, 0.4 (Database fixes)
- [PROMPT 3](#prompt-3-worker-3---fase-0): Worker 3 → Task 0.7 (Maintenance fix)
- [GATE 0](#gate-0-verification): Verifica completa prima di FASE 1

**FASE 1 - Fix Critici**:
- [PROMPT 4](#prompt-4-worker-1---fase-1-task-11): Worker 1 → Task 1.1 (Mini Calendario ESPANSO con calendar settings)
- [PROMPT 5](#prompt-5-worker-2---fase-1-task-21-22): Worker 2 → Task 2.1, 2.2 (Carica/Salva assegnazione)
- [PROMPT 6](#prompt-6-worker-3---fase-1-task-31-32): Worker 3 → Task 3.1, 3.2 MODIFICATO (Visualizza/Ordina + Filtro)
- [GATE 1](#gate-1-verification): Verifica FASE 1 completa

**FASE 2 - Completa Core**:
- [PROMPT 7](#prompt-7-worker-1---fase-2-task-12-13-14): Worker 1 → Task 1.2 MIGLIORATO, 1.3, 1.4 (Config giorni + validazione)
- [PROMPT 8](#prompt-8-worker-2---fase-2-task-23): Worker 2 → Task 2.3 (Salva campi temperatura)
- [PROMPT 9](#prompt-9-worker-3---fase-2-task-33): Worker 3 → Task 3.3 (Raggruppa manutenzioni)
- [GATE 2](#gate-2-verification): Verifica FASE 2 completa

**FASE 3 - Miglioramenti**:
- [PROMPT 10](#prompt-10-worker-1---fase-3-task-15-16): Worker 1 → Task 1.5, 1.6 (Aria-label + Modifica lettura)
- [PROMPT 11](#prompt-11-worker-3---fase-3-task-34): Worker 3 → Task 3.4 (Modifica punto con manutenzioni)
- [GATE 3](#gate-3-verification): Verifica FASE 3 completa

**FASE 4 - Integration**:
- [PROMPT 12](#prompt-12-worker-4---fase-4-task-41): Worker 4 → Task 4.1 (Test E2E completi)
- [GATE 4](#gate-4-verification): Verifica E2E tests

**FASE 5 - Final Verification**:
- [PROMPT 13](#prompt-13-worker-5---fase-5-task-51): Worker 5 → Task 5.1 (Supervisor Quality Check)
- [FINAL VERDICT](#final-verdict): APPROVED/REJECTED

---

## 📋 SEQUENZA ESECUZIONE COMPLETA

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 0: FIX BLOCCANTI (Priority 1-2) - 4-6h                     │
├─────────────────────────────────────────────────────────────────┤
│ Priority 1 - CRITICAL (Blocca Funzionalità):                    │
│   Worker 1 → Task 0.1: Fix Select Ruolo (1h)                   │
│   Worker 2 → Task 0.2: Fix Errore registrazione temp (30min)   │
│                                                                 │
│ Priority 2 - Code Quality (Blocca Merge):                       │
│   Worker 1 → Task 0.3: Fix constant conditions (30min)         │
│   Worker 2 → Task 0.4: Fix unused variables (15min)            │
│   Worker 1 → Task 0.5: Fix test TypeScript errors (1h)         │
│   Worker 1 → Task 0.6: Fix test failures (1h)                  │
│   Worker 3 → Task 0.7: Fix @ts-ignore usage (10min)            │
│                                                                 │
│ GATE 0: ✅ Lint PASS, ✅ Type-check PASS, ✅ Test GREEN         │
├─────────────────────────────────────────────────────────────────┤
│ FASE 1: FIX CRITICI (Workers 1-3) - 5h                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Worker 1 → Task 1.1: Mini Calendario (2h)                   │
│    ⚠️ ESPANSO: Con calendar settings integration completa       │
│                                                                 │
│ 2. Worker 2 → Task 2.1, 2.2: Assegnazione (1.5h)               │
│                                                                 │
│ 3. Worker 3 → Task 3.1, 3.2: Visualizza/Ordina (1.5h)         │
│    ⚠️ MODIFICATO: Task 3.2 include filtro manutenzioni         │
│    completate                                                   │
│                                                                 │
│ GATE 1: ✅ Test critici GREEN, ✅ Type-check PASS               │
├─────────────────────────────────────────────────────────────────┤
│ FASE 2: COMPLETA CORE (Workers 1-3) - 4h                        │
├─────────────────────────────────────────────────────────────────┤
│ 4. Worker 1 → Task 1.2: Config giorni settimana (1h)           │
│    ⚠️ MIGLIORATO: Con calendar settings integration             │
│                                                                 │
│ 5. Worker 1 → Task 1.3, 1.4: Validazione/Remove (1.5h)         │
│ 6. Worker 2 → Task 2.3: Salva campi temperatura (30min)        │
│ 7. Worker 3 → Task 3.3: Raggruppa manutenzioni (1h)            │
│                                                                 │
│ GATE 2: ✅ Core feature complete, ✅ E2E ready                  │
├─────────────────────────────────────────────────────────────────┤
│ FASE 3: MIGLIORAMENTI (Workers 1, 3) - 2h                       │
├─────────────────────────────────────────────────────────────────┤
│ 8. Worker 1 → Task 1.5, 1.6: Aria/Edit (1h)                   │
│ 9. Worker 3 → Task 3.4: Modifica punto (1h)                   │
│                                                                 │
│ GATE 3: ✅ UX complete, ✅ All features functional              │
├─────────────────────────────────────────────────────────────────┤
│ FASE 4: INTEGRATION (Worker 4) - 1h                             │
├─────────────────────────────────────────────────────────────────┤
│ 10. Worker 4 → Task 4.1: Test E2E (1h)                         │
│                                                                 │
│ GATE 4: ✅ E2E tests PASS, ✅ All scenarios covered             │
├─────────────────────────────────────────────────────────────────┤
│ FASE 5: SUPERVISOR (Worker 5) - 1h                              │
├─────────────────────────────────────────────────────────────────┤
│ 11. Worker 5 → Task 5.1: Final Quality Check (1h)              │
│                                                                 │
│ FINAL GATE: ✅ APPROVED → Merge | ❌ REJECTED → Fix & Retry     │
└─────────────────────────────────────────────────────────────────┘

TOTALE: 17-19h | 23 task | 6 fasi (0-5) | 5 workers
```

---

## PROMPT 1: WORKER 1 - FASE 0

### 🚀 PROMPT WORKER 1 - FASE 0 (Task 0.1, 0.3, 0.5, 0.6)

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 0: FIX BLOCCANTI (3.5h)
═══════════════════════════════════════════════════════════════════

Completare Task Priority 1-2:
- Task 0.1: Fix Select Ruolo non funziona (1h) - CRITICAL BLOCKER
- Task 0.3: Fix ConservationPointCard constant conditions (30min)
- Task 0.5: Fix TypeScript errors in test files (1h)
- Task 0.6: Fix test failures in AddPointModal (1h)

⚠️ CRITICAL: Questi fix bloccano funzionalità core e merge. Priorità assoluta.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (15min):
1. C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
   → Sezione "FASE 0: Fix Bloccanti" (linee 88-476)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/00_MASTER_INDEX.md
   → "10 REGOLE CRITICHE" (linee 29-44)

3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/RIEPILOGO_LAVORO_COMPLETATO_20260116.md
   → Problema #1 "Select Ruolo non funzionante" (sezione problemi utente)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.1 - Fix Select Ruolo (1h) - CRITICAL
═══════════════════════════════════════════════════════════════════

**Problema**: Select Ruolo (Radix UI) in AddPointModal non apre dropdown - blocca creazione punti con manutenzioni

**File**: src/features/conservation/components/AddPointModal.tsx (linee ~240-263)

**STEP 1 - ANALYZE (15min)**:
```bash
# 1.1. Leggi sezione Select Ruolo
grep -A 30 "Assegnato a Ruolo" src/features/conservation/components/AddPointModal.tsx

# 1.2. Verifica pattern corretto (riferimento funzionante)
grep -A 30 "Select.*role" src/components/onboarding-steps/TasksStep.tsx

# 1.3. Identifica differenze tra funzionante e non funzionante
```

**STEP 2 - IDENTIFY ROOT CAUSE (15min)**:
Possibili cause:
- SelectContent non renderizzato (manca portal container)
- Z-index insufficiente (deve essere > z-[9999] del modal)
- SelectTrigger senza event handlers corretti
- Valore iniziale undefined causa problemi
- Modal overflow nasconde dropdown

**STEP 3 - FIX (20min)**:
```typescript
// Pattern corretto (da TasksStep.tsx):
<Select
  value={task.assegnatoARuolo || ''}
  onValueChange={(value) => handleRoleChange(value, taskIndex)}
>
  <SelectTrigger>
    <SelectValue placeholder="Seleziona ruolo..." />
  </SelectTrigger>
  <SelectContent>
    {/* Options */}
  </SelectContent>
</Select>

// Verifica z-index modal parent deve permettere overflow
```

**STEP 4 - VERIFY (10min)**:
```bash
# 4.1. Test manuale
npm run dev
# Apri AddPointModal → Testa Select Ruolo → Verifica dropdown si apre

# 4.2. Test automatico (se esistono)
npm run test -- AddPointModal --run

# 4.3. Verifica lint
npm run lint -- src/features/conservation/components/AddPointModal.tsx
# ✅ Expected: 0 errori
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.3 - Fix Constant Conditions (30min)
═══════════════════════════════════════════════════════════════════

**Problema**: 4 errori `no-constant-condition` in ConservationPointCard.tsx (linee 146, 149, 163, 166)

**File**: src/features/conservation/ConservationPointCard.tsx

**STEP 1 - ANALYZE (10min)**:
```bash
# Leggi sezioni con condizioni costanti
sed -n '140,170p' src/features/conservation/ConservationPointCard.tsx

# Identifica: `if (true)` e `if (false)` - codice commentato
```

**STEP 2 - FIX (15min)**:
Opzioni:
1. Rimuovere codice commentato se non serve
2. Riattivare codice se serve (sbloccare check status)

**STEP 3 - VERIFY (5min)**:
```bash
npm run lint -- src/features/conservation/ConservationPointCard.tsx
# ✅ Expected: 0 errori no-constant-condition

npm run test -- ConservationPointCard --run
# ✅ Expected: PASS (no regression)
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.5 - Fix Test TypeScript Errors (1h)
═══════════════════════════════════════════════════════════════════

**Problema**: Type errors in test files bloccano type-check

**Files**:
- src/features/conservation/components/__tests__/AddPointModal.test.tsx
- src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx

**STEP 1 - IDENTIFY ERRORS (15min)**:
```bash
npm run type-check 2>&1 | grep -A 5 "AddPointModal.test\|ScheduledMaintenanceCard.test"
# Copia output completo errori
```

**STEP 2 - FIX TYPE DEFINITIONS (35min)**:
Errori comuni da fixare:
- Type mismatch `MaintenanceTask[]` (assigned_to_staff_id: null vs string | undefined)
- Missing properties in `Record<MaintenanceType, number>`
- 'total' does not exist in MaintenanceStats
- Type '"completed"' not assignable to status type

```typescript
// Fix pattern:
// 1. Allinea mock con types reali da src/types/conservation.ts
// 2. Usa Partial<> per mock incompleti
// 3. Aggiungi campi mancanti con valori corretti
```

**STEP 3 - VERIFY (10min)**:
```bash
npm run type-check 2>&1 | grep -c "AddPointModal.test\|ScheduledMaintenanceCard.test"
# ✅ Expected: 0 errori

npm run test -- AddPointModal.test.tsx --run
npm run test -- ScheduledMaintenanceCard.test.tsx --run
# ✅ Expected: PASS
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.6 - Fix Test Failures (1h)
═══════════════════════════════════════════════════════════════════

**Problema**: 3 test falliti in AddPointModal.test.tsx (selector ambiguo)

**File**: src/features/conservation/components/__tests__/AddPointModal.test.tsx

**STEP 1 - IDENTIFY FAILURES (15min)**:
```bash
npm run test -- AddPointModal.test.tsx --run
# Copia output completo errori: "Found multiple elements with the text: /Frequenza/i"
```

**STEP 2 - FIX SELECTORS (35min)**:
```typescript
// Problema: Selector ambiguo con più elementi "Frequenza"
// Soluzione: Usa selector più specifici

// BEFORE (ambiguo):
const frequenzaLabel = screen.getByText(/Frequenza/i)

// AFTER (specifico):
const frequenzaLabel = screen.getByRole('combobox', { name: /Frequenza/i })
// oppure
const frequenzaLabel = screen.getByTestId('frequency-select')
// oppure
const frequenzaLabel = within(maintenanceSection).getByText(/Frequenza/i)
```

**STEP 3 - VERIFY (10min)**:
```bash
npm run test -- AddPointModal.test.tsx --run
# ✅ Expected: 13/13 PASS (o quanti sono i test totali)
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT (Dopo TUTTE le task completate)
═══════════════════════════════════════════════════════════════════

```bash
# Verifica che TUTTI i comandi hanno passato
npm run lint 2>&1 | grep -c "conservation\|dashboard"
# ✅ Expected: 0 errori

npm run type-check 2>&1 | grep -c "test.tsx"
# ✅ Expected: 0 errori

npm run test -- --run
# ✅ Expected: ALL PASS

# Commit SOLO se tutto OK
git add src/features/conservation/components/AddPointModal.tsx
git add src/features/conservation/ConservationPointCard.tsx
git add src/features/conservation/components/__tests__/AddPointModal.test.tsx
git add src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx
git commit -m "fix(conservation): resolve critical UI and test blockers

Task 0.1 - CRITICAL:
- Fix Select Ruolo dropdown not opening in AddPointModal
- Root cause: [descrivi root cause trovata]
- Solution: [descrivi fix applicato]

Task 0.3:
- Remove constant conditions (if true/false) in ConservationPointCard
- Clean up commented code

Task 0.5:
- Fix TypeScript errors in test files
- Align mock types with MaintenanceTask interface

Task 0.6:
- Fix 3 test failures in AddPointModal.test.tsx
- Replace ambiguous selectors with specific ones

Tests: ALL PASS
Type-check: PASS (0 test file errors)
Lint: PASS (0 conservation errors)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

Prima di dichiarare "completato", verifica che TUTTI questi sono ✅:

**Task 0.1**:
- [ ] Select Ruolo apre dropdown quando cliccato
- [ ] Opzioni ruolo visibili e selezionabili
- [ ] Selezione ruolo aggiorna stato form
- [ ] Test manuale PASS (dropdown funziona)

**Task 0.3**:
- [ ] 0 errori `no-constant-condition` in lint
- [ ] Codice commentato rimosso o riattivato
- [ ] Test ConservationPointCard PASS (no regression)

**Task 0.5**:
- [ ] 0 errori TypeScript in AddPointModal.test.tsx
- [ ] 0 errori TypeScript in ScheduledMaintenanceCard.test.tsx
- [ ] Mock types allineati con types reali
- [ ] Type-check PASS per test files

**Task 0.6**:
- [ ] 13/13 test PASS in AddPointModal.test.tsx (o totale test)
- [ ] Nessun errore "multiple elements found"
- [ ] Selector specifici usati (role, testid, within)
- [ ] Test stabili (no flaky)

**VERIFICA GLOBALE**:
- [ ] npm run lint: 0 nuovi errori Conservation
- [ ] npm run type-check: 0 nuovi errori test files
- [ ] npm run test: ALL PASS (no regression)
- [ ] Commit creato con messaggio dettagliato

SE ANCHE UNO ❌: NON sei completato. Risolvi prima di procedere.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 1
**Fase**: 0 (Fix Bloccanti)
**Task**: 0.1, 0.3, 0.5, 0.6
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File modificati**:
- [ ] src/features/conservation/components/AddPointModal.tsx (linee ___)
- [ ] src/features/conservation/ConservationPointCard.tsx (linee ___)
- [ ] src/features/conservation/components/__tests__/AddPointModal.test.tsx (linee ___)
- [ ] src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx (linee ___)

**Verification commands executed**:
- [ ] npm run lint: PASS
- [ ] npm run type-check: PASS
- [ ] npm run test: PASS

**Commit SHA**: _______________

**Task 0.1 - Root Cause Identificata**:
___________________________________________________________________________

**Problemi incontrati**:
___________________________________________________________________________

**Handoff notes per Worker 2**:
Task 0.1, 0.3, 0.5, 0.6 COMPLETATE ✅ - Worker 2 può iniziare Task 0.2, 0.4

═══════════════════════════════════════════════════════════════════
⚠️ SE BLOCCATO
═══════════════════════════════════════════════════════════════════

1. **Identifica problema specifico**: Quale task? Quale comando fallisce?
2. **Analizza root cause**: Perché fallisce? Dependency? Type error?
3. **Tenta fix**: Risolvi e riprova (max 3 tentativi per task)
4. **SE ancora bloccato**: Documenta nel progress report con:
   - Task bloccata: 0.X
   - Comando fallito: [comando]
   - Errore: [errore completo]
   - Tentati fix: [cosa hai provato]
   - Status altri task: [completate/pending]
5. **CONTINUA con task non bloccate**: Se Task 0.1 bloccata, prova 0.3, 0.5, 0.6

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 2: WORKER 2 - FASE 0

### 🚀 PROMPT WORKER 2 - FASE 0 (Task 0.2, 0.4)

```
Sei Worker 2 - Database/Data Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 0: FIX BLOCCANTI (45min)
═══════════════════════════════════════════════════════════════════

Completare Task Priority 1-2:
- Task 0.2: Fix Errore registrazione temperatura (30min) - CRITICAL BLOCKER
- Task 0.4: Fix unused variables in useConservationPoints (15min)

⚠️ CRITICAL: Task 0.2 blocca registrazione temperature. Priorità assoluta.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (10min):
1. C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
   → Sezione "Task 0.2, Task 0.4" (linee 157-229, 280-314)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/RIEPILOGO_LAVORO_COMPLETATO_20260116.md
   → Problema #5 "Errore registrazione temperatura" (sezione problemi utente)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.2 - Fix Errore Registrazione (30min) - CRITICAL
═══════════════════════════════════════════════════════════════════

**Problema**: Campo 'conservation_point' invece di 'conservation_point_id' - errore PGRST204 blocca registrazione

**File**: src/features/conservation/hooks/useTemperatureReadings.ts (linee ~60-92)

**STEP 1 - ANALYZE (10min)**:
```bash
# 1.1. Leggi funzione createReadingMutation
grep -A 35 "createReadingMutation" src/features/conservation/hooks/useTemperatureReadings.ts

# 1.2. Identifica payload insert
# PROBLEMA: Payload include campo `conservation_point` (oggetto join/virtuale)
#           invece di solo `conservation_point_id` (UUID)

# 1.3. Verifica se AddTemperatureModal.tsx passa campo errato
grep -A 10 "onSave" src/features/conservation/components/AddTemperatureModal.tsx
```

**STEP 2 - FIX PAYLOAD (15min)**:
```typescript
// In useTemperatureReadings.ts, createReadingMutation:

// BEFORE (ERRATO - include campo join):
const payload = {
  ...data, // ❌ Potrebbe contenere `conservation_point` object
  conservation_point: data.conservation_point, // ❌ Campo join non esiste in tabella
}

// AFTER (CORRETTO - solo campi tabella):
const payload = {
  conservation_point_id: data.conservation_point_id, // ✅ UUID - campo corretto
  temperature: data.temperature,
  recorded_at: recordedAtString, // già convertito a string
  method: data.method,
  notes: data.notes,
  photo_evidence: data.photo_evidence,
  recorded_by: data.recorded_by,
  company_id: companyId,
  // ❌ NON includere `conservation_point` (campo join/virtuale)
}

// Verifica query .select() DOPO .insert()
// Se select include `conservation_point`, fare join separato o rimuoverlo
```

**STEP 3 - VERIFY (5min)**:
```bash
# 3.1. Type-check
npm run type-check 2>&1 | grep -i "temperature"
# ✅ Expected: 0 errori

# 3.2. Test manuale
npm run dev
# Apri AddTemperatureModal → Registra temperatura → Verifica NO errore PGRST204

# 3.3. Test automatico (se esistono)
npm run test -- useTemperatureReadings --run
# ✅ Expected: PASS
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.4 - Fix Unused Variables (15min)
═══════════════════════════════════════════════════════════════════

**Problema**: Variabili non usate in useConservationPoints.ts (linee 78, 166)

**File**: src/features/conservation/hooks/useConservationPoints.ts

**STEP 1 - IDENTIFY (5min)**:
```bash
# Leggi linee specifiche
sed -n '75,80p' src/features/conservation/hooks/useConservationPoints.ts
sed -n '163,168p' src/features/conservation/hooks/useConservationPoints.ts

# Identifica variabili dichiarate ma non usate
```

**STEP 2 - FIX (5min)**:
Opzioni:
1. Rimuovere variabili se non necessarie
2. Usare variabili se erano intese per essere usate
3. Prefissare con `_` se intenzionalmente non usate (es. `_unused`)

**STEP 3 - VERIFY (5min)**:
```bash
npm run lint -- src/features/conservation/hooks/useConservationPoints.ts
# ✅ Expected: 0 errori unused variables

npm run test -- useConservationPoints --run
# ✅ Expected: PASS (no regression)
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT (Dopo TUTTE le task completate)
═══════════════════════════════════════════════════════════════════

```bash
# Verifica che TUTTI i comandi hanno passato
npm run lint 2>&1 | grep -c "useConservationPoints\|useTemperatureReadings"
# ✅ Expected: 0 errori

npm run type-check 2>&1 | grep -c "useConservationPoints\|useTemperatureReadings"
# ✅ Expected: 0 errori

npm run test -- --run
# ✅ Expected: ALL PASS

# Commit SOLO se tutto OK
git add src/features/conservation/hooks/useTemperatureReadings.ts
git add src/features/conservation/hooks/useConservationPoints.ts
git commit -m "fix(conservation): resolve critical data blockers

Task 0.2 - CRITICAL:
- Fix temperature registration error PGRST204
- Remove 'conservation_point' field from insert payload (virtual field)
- Use only 'conservation_point_id' (UUID) for insert
- Temperature registration now works correctly

Task 0.4:
- Remove unused variables in useConservationPoints (lines 78, 166)

Tests: PASS
Type-check: PASS (0 errors)
Lint: PASS (0 unused variable warnings)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

**Task 0.2**:
- [ ] Payload insert NON include campo `conservation_point`
- [ ] Payload include solo `conservation_point_id` (UUID)
- [ ] Test manuale: Registrazione temperatura PASS (no errore PGRST204)
- [ ] Type-check PASS
- [ ] Test automatici PASS

**Task 0.4**:
- [ ] 0 warning "unused variable" in lint
- [ ] Variabili rimosse o usate correttamente
- [ ] Test PASS (no regression)

**VERIFICA GLOBALE**:
- [ ] npm run lint: 0 errori Conservation hooks
- [ ] npm run type-check: 0 errori Conservation hooks
- [ ] npm run test: ALL PASS
- [ ] Commit creato

SE ANCHE UNO ❌: NON sei completato.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 2
**Fase**: 0 (Fix Bloccanti)
**Task**: 0.2, 0.4
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File modificati**:
- [ ] src/features/conservation/hooks/useTemperatureReadings.ts (linee ___)
- [ ] src/features/conservation/hooks/useConservationPoints.ts (linee ___)

**Verification commands**:
- [ ] npm run lint: PASS
- [ ] npm run type-check: PASS
- [ ] npm run test: PASS
- [ ] Test manuale registrazione temperatura: ✅ PASS (no PGRST204)

**Commit SHA**: _______________

**Handoff notes per Worker 3**:
Task 0.2, 0.4 COMPLETATE ✅ - Worker 3 può iniziare Task 0.7

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 3: WORKER 3 - FASE 0

### 🚀 PROMPT WORKER 3 - FASE 0 (Task 0.7)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 0: FIX BLOCCANTI (10min)
═══════════════════════════════════════════════════════════════════

Completare Task Priority 2:
- Task 0.7: Fix @ts-ignore usage in useMaintenanceTasks (10min)

⚠️ Code Quality: Sostituire @ts-ignore con @ts-expect-error per merge.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE
═══════════════════════════════════════════════════════════════════

**LEGGI** (2min):
C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
→ Sezione "Task 0.7" (linee 399-440)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.7 - Fix @ts-ignore (10min)
═══════════════════════════════════════════════════════════════════

**Problema**: Usa `@ts-ignore` invece di `@ts-expect-error` (linee 299, 312)

**File**: src/features/conservation/hooks/useMaintenanceTasks.ts

**STEP 1 - IDENTIFY (2min)**:
```bash
grep -n "@ts-ignore" src/features/conservation/hooks/useMaintenanceTasks.ts
# Expected: 2 occorrenze (linee ~299, ~312)
```

**STEP 2 - REPLACE (5min)**:
```typescript
// BEFORE:
// @ts-ignore

// AFTER:
// @ts-expect-error - maintenance_completions table type not yet generated after migration

// Motivo: @ts-expect-error è preferito perché:
// 1. Forza rimozione quando errore viene fixato
// 2. Documenta che errore è intenzionale/temporaneo
// 3. Passa lint check (no-ts-ignore rule)
```

**STEP 3 - VERIFY (3min)**:
```bash
npm run lint -- src/features/conservation/hooks/useMaintenanceTasks.ts
# ✅ Expected: 0 errori "@typescript-eslint/ban-ts-comment"

npm run test -- useMaintenanceTasks --run
# ✅ Expected: PASS
```

**STEP 4 - COMMIT**:
```bash
git add src/features/conservation/hooks/useMaintenanceTasks.ts
git commit -m "fix(conservation): replace @ts-ignore with @ts-expect-error

- Replace 2 @ts-ignore with @ts-expect-error in useMaintenanceTasks
- Add comment explaining temporary nature (migration pending)
- Resolves lint error 'ban-ts-comment'

Lint: PASS
Tests: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

- [ ] 0 occorrenze `@ts-ignore` in useMaintenanceTasks.ts
- [ ] 2 occorrenze `@ts-expect-error` con commento esplicativo
- [ ] npm run lint: PASS (0 ban-ts-comment errors)
- [ ] npm run test: PASS
- [ ] Commit creato

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT
═══════════════════════════════════════════════════════════════════

**Worker**: 3
**Fase**: 0 (Fix Bloccanti)
**Task**: 0.7
**Status**: ✅ COMPLETATO
**Tempo impiegato**: ___ min

**File modificati**:
- [ ] src/features/conservation/hooks/useMaintenanceTasks.ts (linee 299, 312)

**Commit SHA**: _______________

**Handoff notes per GATE 0**:
Task 0.7 COMPLETATA ✅ - Tutti fix FASE 0 completati. Eseguire GATE 0.

═══════════════════════════════════════════════════════════════════
```

---

## GATE 0 VERIFICATION

### 🚦 GATE 0 VERIFICATION - PRIMA DI FASE 1

**TUTTI I WORKER FASE 0 DEVONO ESSERE COMPLETATI PRIMA DI GATE 0**

```bash
# ═══════════════════════════════════════════════════════════════
# GATE 0: Verifica Fix Bloccanti Completati
# ═══════════════════════════════════════════════════════════════

echo "🚦 GATE 0: Verifica Fix Bloccanti..."

# 1. Lint Check (CRITICAL)
echo "\n1. Lint Check..."
npm run lint 2>&1 | tee logs/gate0-lint.log
LINT_ERRORS=$(grep -c "conservation\|dashboard" logs/gate0-lint.log || echo "0")
echo "Lint errors Conservation: $LINT_ERRORS"
# ✅ PASS se: 0 errori
# ❌ FAIL se: > 0 errori → TORNA A FASE 0

# 2. Type-Check (CRITICAL)
echo "\n2. Type-Check..."
npm run type-check 2>&1 | tee logs/gate0-type-check.log
TYPE_ERRORS=$(grep -c "test.tsx" logs/gate0-type-check.log || echo "0")
echo "Type errors test files: $TYPE_ERRORS"
# ✅ PASS se: 0 errori test files
# ❌ FAIL se: > 0 errori → TORNA A FASE 0

# 3. Test Conservation (CRITICAL)
echo "\n3. Test Conservation..."
npm run test -- conservation --run 2>&1 | tee logs/gate0-test.log
# ✅ PASS se: ALL PASS
# ❌ FAIL se: ANY FAIL → TORNA A FASE 0

# 4. Build (IMPORTANT)
echo "\n4. Build Check..."
npm run build 2>&1 | tee logs/gate0-build.log
# ✅ PASS se: SUCCESS
# ❌ FAIL se: ERROR → TORNA A FASE 0

# ═══════════════════════════════════════════════════════════════
# VERDICT
# ═══════════════════════════════════════════════════════════════

echo "\n═══════════════════════════════════════════════════════════════"
echo "GATE 0 VERDICT:"
echo "═══════════════════════════════════════════════════════════════"

if [ "$LINT_ERRORS" -eq 0 ] && [ "$TYPE_ERRORS" -eq 0 ]; then
  echo "✅ APPROVED - Procedi a FASE 1"
  echo "\nProssimo step: Worker 1 Task 1.1 (Mini Calendario)"
else
  echo "❌ REJECTED - Fix richiesti:"
  [ "$LINT_ERRORS" -gt 0 ] && echo "  - Lint errors: $LINT_ERRORS"
  [ "$TYPE_ERRORS" -gt 0 ] && echo "  - Type errors: $TYPE_ERRORS"
  echo "\n⬅️ TORNA A FASE 0 e fixa errori prima di procedere"
fi

echo "═══════════════════════════════════════════════════════════════"
```

**SE GATE 0 PASS**: ✅ Procedi a FASE 1 con Worker 1 Task 1.1

**SE GATE 0 FAIL**: ❌ TORNA A FASE 0, fixa errori identificati, riprova Gate 0

---

## PROMPT 4: WORKER 1 - FASE 1 (Task 1.1)

### 🚀 PROMPT WORKER 1 - FASE 1 (Task 1.1) - ESPANSO CON CALENDAR SETTINGS

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 1: Mini Calendario (2h)
═══════════════════════════════════════════════════════════════════

Completare Task 1.1: **Mini Calendario Component per Frequenza Mensile/Annuale**

⚠️ CRITICAL: Questa feature è RICHIESTA ESPLICITAMENTE dall'utente (Problema #4).
⚠️ MIGLIORAMENTO: Integrazione COMPLETA con calendar settings dall'onboarding.

**NON usare input numerico. DEVE essere vero mini calendario con calendar settings.**

═══════════════════════════════════════════════════════════════════
🚨 PRE-REQUISITO - VERIFICA GATE 0 PASSED
═══════════════════════════════════════════════════════════════════

**VERIFICA** (2min):
```bash
# Verifica che GATE 0 è passato
ls logs/gate0-*.log 2>/dev/null
# ✅ SE ESISTONO: Gate 0 eseguito
# ❌ SE NON ESISTONO: FERMA - Esegui Gate 0 prima
```

**SE GATE 0 NON ESEGUITO**: FERMA e segnala blocco. NON iniziare senza Gate 0 PASS.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (20min):
1. C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
   → Sezione "Task 1.1 ESPANSO" (linee 698-1025) - LEGGI TUTTO

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/RIEPILOGO_LAVORO_COMPLETATO_20260116.md
   → Problema #4 "Mini calendario mensile/annuale"

3. .cursor/Skills/test-driven-development/SKILL.md
   → RED-GREEN-REFACTOR workflow (OBBLIGATORIO seguire)

4. src/hooks/useCalendarSettings.ts
   → Hook disponibile per caricare calendar settings

═══════════════════════════════════════════════════════════════════
📋 REQUISITI DETTAGLIATI - LEGGI ATTENTAMENTE
═══════════════════════════════════════════════════════════════════

**Mode: month** (grid 31 giorni):
- Mostra grid 7 colonne x 5 righe (31 giorni)
- Giorno selezionato evidenziato
- Callback onChange(day: number)

**Mode: year** (calendario annuale CON calendar settings):
- ⚠️ CRITICO: Integra useCalendarSettings() hook
- Carica fiscal_year_start, fiscal_year_end (NON anno gregoriano)
- Carica open_weekdays (array 1-7, lunedì=1, domenica=7)
- Carica closure_dates (array di date)
- Mostra SOLO giorni di apertura come selezionabili
- Disabilita giorni di chiusura (chiusure + weekdays non aperti)
- Calcola "giorno di attività" contando SOLO giorni lavorativi
  Esempio: Se settimana agosto chiusa, non conta nei 365 giorni
- Layout: Calendario VERO con settimane e mesi (NON grid numeri)
- Raggruppa per mese per visualizzazione
- Fallback: Se settings non configurati, usa tutti i giorni (compatibilità)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TDD (RIGIDO - SEGUI OGNI STEP)
═══════════════════════════════════════════════════════════════════

**STEP 1 - RED (40min)**:
```bash
# 1.1. Crea test file
mkdir -p src/components/ui/__tests__
touch src/components/ui/__tests__/MiniCalendar.test.tsx

# 1.2. Scrivi test che DEVONO essere presenti (copia da PLAN linee 722-777)
# Test obbligatori:
#   - Mode month: render grid 31 giorni
#   - Mode month: highlight selected day
#   - Mode month: onChange callback
#   - Mode year: load calendar settings
#   - Mode year: render fiscal year range (not gregorian)
#   - Mode year: only open weekdays selectable
#   - Mode year: disable closure dates
#   - Mode year: calculate working day number (only working days)
#   - Mode year: display real calendar layout (not number grid)
#   - Mode year: fallback to all days if settings not configured

# 1.3. Verifica che test falliscono (RED phase)
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Output deve essere FAIL con "MiniCalendar is not defined"
# ❌ SE PASSA: Qualcosa è sbagliato, ferma e analizza
```

**STEP 2 - GREEN (60min)**:
```bash
# 2.1. Crea componente (copia template da PLAN linee 782-950)
mkdir -p src/components/ui
touch src/components/ui/MiniCalendar.tsx

# 2.2. Implementa codice minimo per passare test
# TEMPLATE COMPLETO nel PLAN linee 786-950:
#   - Interface MiniCalendarProps
#   - Hook useCalendarSettings()
#   - renderMonthMode() con grid 31 giorni
#   - renderYearMode() con:
#     * fiscalYearStart/End calculation
#     * openWeekdays mapping
#     * closureDates filtering
#     * calendar generation (useMemo)
#     * working day counting
#     * month grouping
#     * real calendar layout con header giorni settimana

# 2.3. Integra in AddPointModal.tsx per frequenza mensile
# (copia codice da PLAN linee 953-966)

# 2.4. Integra in AddPointModal.tsx per frequenza annuale
# (copia codice da PLAN linee 970-988)

# 2.5. Verifica che test passano (GREEN phase)
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Output deve essere PASS (10/10 test)
# ❌ SE FALLISCE: Debug, fix, retry (NON andare avanti)
```

**STEP 3 - REFACTOR (15min)**:
```bash
# 3.1. Migliora codice senza cambiare comportamento
# - Verifica useMemo dependencies corrette
# - Ottimizza rendering year mode (365 giorni)
# - Verifica responsive design (mobile/tablet/desktop)
# - Aggiungi loading state durante caricamento settings
# - Migliora accessibilità (keyboard navigation)

# 3.2. Verifica test ancora GREEN dopo refactor
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Test ancora PASS (10/10)
```

**STEP 4 - VERIFY (15min)**:
```bash
# 4.1. Test componente
npm run test -- MiniCalendar.test.tsx --run
# ✅ MUST PASS: 10/10 test

# 4.2. Test AddPointModal (verifica integrazione)
npm run test -- AddPointModal --run
# ✅ MUST PASS: Nessuna regressione

# 4.3. Type-check
npm run type-check 2>&1 | grep -E "(MiniCalendar|AddPointModal)"
# ✅ MUST BE: 0 nuovi errori in questi file

# 4.4. Lint check
npm run lint 2>&1 | grep -E "(MiniCalendar|AddPointModal)"
# ✅ MUST BE: 0 nuovi errori in questi file

# 4.5. Test manuale (IMPORTANTE)
npm run dev
# - Apri AddPointModal
# - Seleziona frequenza "Mensile" → Verifica mini calendario mese (grid 31)
# - Seleziona frequenza "Annuale" per Sbrinamento → Verifica:
#   * Calendario annuale con mesi
#   * Solo giorni apertura selezionabili
#   * Giorni chiusura disabilitati
#   * Working day number mostrato
```

**STEP 5 - COMMIT (10min)**:
```bash
# 5.1. Verifica che TUTTI i comandi sopra hanno passato
# SE anche UNO è fallito: FERMA, risolvi, riprova

# 5.2. Commit SOLO se tutto OK
git add src/components/ui/MiniCalendar.tsx
git add src/components/ui/__tests__/MiniCalendar.test.tsx
git add src/features/conservation/components/AddPointModal.tsx
git commit -m "feat(conservation): add MiniCalendar with calendar settings integration

Task 1.1 - EXPANDED:
- Create MiniCalendar component with month and year modes
- Mode month: grid 31 days, selection and highlighting
- Mode year: FULL calendar settings integration
  * Load fiscal_year_start/end (not gregorian year)
  * Load open_weekdays, closure_dates from company_calendar_settings
  * Show only open weekdays as selectable
  * Disable closure dates
  * Calculate working day number (count only working days)
  * Display real calendar layout (weeks/months, not number grid)
  * Fallback to all days if settings not configured
- Integrate in AddPointModal for monthly and annual frequency
- Add 10 TDD tests verifying all modes and calendar settings

Tests: 10/10 passed
Type-check: PASS
Lint: PASS
Manual test: PASS (verified calendar settings integration)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

Prima di dichiarare "completato", verifica che TUTTI questi sono ✅:

**Componente**:
- [ ] MiniCalendar.tsx creato in src/components/ui/
- [ ] Test file MiniCalendar.test.tsx creato
- [ ] Interface MiniCalendarProps completa

**Mode month**:
- [ ] Grid 31 giorni (7 colonne)
- [ ] Giorno selezionato evidenziato
- [ ] onChange callback funziona

**Mode year - Calendar Settings Integration**:
- [ ] Hook useCalendarSettings() importato e usato
- [ ] Carica fiscal_year_start/end (NON anno gregoriano)
- [ ] Carica open_weekdays (array 1-7)
- [ ] Carica closure_dates
- [ ] SOLO giorni apertura selezionabili (altri disabilitati)
- [ ] Giorni chiusura disabilitati
- [ ] Working day number calcolato correttamente (solo working days)
- [ ] Layout calendario VERO (settimane/mesi, NON grid numeri)
- [ ] Raggruppamento per mese per visualizzazione
- [ ] Fallback a tutti i giorni se settings non configurati

**Integrazione**:
- [ ] Integrato in AddPointModal per frequenza mensile
- [ ] Integrato in AddPointModal per frequenza annuale (solo Sbrinamento)

**Test**:
- [ ] 10/10 test passano (npm run test -- MiniCalendar)
- [ ] Test AddPointModal PASS (no regression)
- [ ] Test manuale PASS (verified calendar settings work)

**Quality**:
- [ ] Type-check PASS: 0 nuovi errori
- [ ] Lint PASS: 0 nuovi errori
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading state durante caricamento settings
- [ ] Accessibilità (keyboard navigation, aria-labels)

**Commit**:
- [ ] Commit creato con messaggio dettagliato

SE ANCHE UNO ❌: NON sei completato. Risolvi prima di procedere.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 1
**Fase**: 1 (Fix Critici)
**Task**: 1.1 (Mini Calendario con Calendar Settings)
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File creati**:
- [ ] src/components/ui/MiniCalendar.tsx
- [ ] src/components/ui/__tests__/MiniCalendar.test.tsx

**File modificati**:
- [ ] src/features/conservation/components/AddPointModal.tsx (linee ___)

**Test results**:
- [ ] npm run test -- MiniCalendar: 10/10 PASS
- [ ] npm run test -- AddPointModal: PASS (no regression)
- [ ] npm run type-check: PASS (0 new errors)
- [ ] npm run lint: PASS (0 new errors)
- [ ] Test manuale: ✅ PASS (calendar settings verified)

**Calendar Settings Verification**:
- [ ] Fiscal year range: ___/___/___ to ___/___/___
- [ ] Open weekdays: [___] (es. [1,2,3,4,5] = Lun-Ven)
- [ ] Closure dates count: ___ dates
- [ ] Working days calculated: ___ days (of ___ total)
- [ ] Fallback tested: ✅ Works if settings null/empty

**Commit SHA**: _______________

**Problemi incontrati**:
___________________________________________________________________________

**Handoff notes per Worker 2**:
Task 1.1 COMPLETATA ✅ - Calendar settings integration working. Worker 2 può iniziare Task 2.1, 2.2.

═══════════════════════════════════════════════════════════════════
⚠️ SE BLOCCATO
═══════════════════════════════════════════════════════════════════

1. **Identifica problema specifico**: Quale parte fallisce? Test? Integration?
2. **Verifica calendar settings disponibili**:
   ```bash
   # Query Supabase per verificare settings
   SELECT * FROM company_calendar_settings WHERE company_id = '<YOUR_COMPANY_ID>';
   ```
3. **Se settings null/empty**: Verifica fallback funziona (deve mostrare tutti i giorni)
4. **Se layout non corretto**: Verifica month grouping e week layout logic
5. **Tenta fix**: Risolvi e riprova (max 3 tentativi)
6. **SE ancora bloccato**: Documenta dettagliatamente e segnala

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 5: WORKER 2 - FASE 1 (Task 2.1, 2.2)

### 🚀 PROMPT WORKER 2 - FASE 1 (Task 2.1, 2.2)

```
Sei Worker 2 - Database/Data Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 1 (1.5h)
═══════════════════════════════════════════════════════════════════

Completare:
- Task 2.1: **Carica campi assegnazione manutenzioni** (30min)
- Task 2.2: **Salva campi assegnazione da AddPointModal** (1h)

⚠️ CRITICAL: Questi campi sono GIÀ nel DB ma NON vengono caricati/salvati.

═══════════════════════════════════════════════════════════════════
🚨 PRE-REQUISITO - VERIFICA GATE 0 PASSED
═══════════════════════════════════════════════════════════════════

```bash
# Verifica Gate 0 eseguito
ls logs/gate0-*.log 2>/dev/null
# ✅ SE ESISTONO: Gate 0 passed, continua
# ❌ SE NON ESISTONO: FERMA - Esegui Gate 0 prima
```

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (10min):
1. C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
   → Sezione "FASE 1" per contesto generale

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/RIEPILOGO_LAVORO_COMPLETATO_20260116.md
   → Problema #2 "Dettagli assegnazione incompleti"

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 2.1 - Carica Campi Assegnazione (30min)
═══════════════════════════════════════════════════════════════════

**File**: src/features/conservation/hooks/useMaintenanceTasks.ts

**STEP 1 - READ QUERY (10min)**:
```bash
# Leggi query SELECT esistente
grep -A 30 ".select\(" src/features/conservation/hooks/useMaintenanceTasks.ts | head -40

# Identifica campi MANCANTI:
# - assignment_type
# - assigned_to_role
# - assigned_to_category
# - assigned_to_staff_id
# - department_id (tramite join conservation_point.departments)
```

**STEP 2 - UPDATE QUERY (15min)**:
```typescript
// In useMaintenanceTasks.ts, aggiorna query SELECT:

const { data, error } = await supabase
  .from('maintenance_tasks')
  .select(`
    *,
    assigned_to_role,
    assigned_to_category,
    assigned_to_staff_id,
    assignment_type,
    conservation_point:conservation_points!inner(
      id,
      name,
      department:departments(id, name)
    ),
    assigned_user:staff(id, name)
  `)
  .eq('company_id', companyId)

// Aggiorna type MaintenanceTask in src/types/conservation.ts:
export interface MaintenanceTask {
  // ... existing fields
  assignment_type?: 'role' | 'category' | 'staff' | null
  assigned_to_role?: string | null
  assigned_to_category?: string | null
  assigned_to_staff_id?: string | null
  conservation_point?: {
    id: string
    name: string
    department?: {
      id: string
      name: string
    }
  }
  assigned_user?: {
    id: string
    name: string
  }
}
```

**STEP 3 - VERIFY (5min)**:
```bash
npm run type-check 2>&1 | grep -E "useMaintenanceTasks|MaintenanceTask"
# ✅ Expected: 0 errori
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 2.2 - Salva Campi Assegnazione (1h)
═══════════════════════════════════════════════════════════════════

**Files**:
- src/features/conservation/components/AddPointModal.tsx
- src/features/conservation/hooks/useConservationPoints.ts

**STEP 1 - UPDATE AddPointModal (30min)**:
```typescript
// In AddPointModal.tsx, handleSubmit, trasforma maintenanceTasks:

const transformedTasks = formData.maintenanceTasks.map(task => ({
  type: task.tipo === 'rilevamento_temperatura' ? 'temperature' :
        task.tipo === 'sanificazione' ? 'sanitization' :
        task.tipo === 'sbrinamento' ? 'defrosting' : 'expiry_check',
  frequency: task.frequenza,
  next_due: calculateNextDue(task),

  // ✅ AGGIUNGI campi assegnazione:
  assignment_type: task.assegnatoA, // 'ruolo' | 'categoria' | 'dipendente'
  assigned_to_role: task.assegnatoARuolo || null,
  assigned_to_category: task.assegnatoACategoria || null,
  assigned_to_staff_id: task.assegnatoADipendente || null,
  department_id: formData.department_id, // Dal punto parent
}))
```

**STEP 2 - VERIFY Payload (20min)**:
```bash
# Type-check
npm run type-check 2>&1 | grep AddPointModal
# ✅ Expected: 0 errori

# Test manuale (IMPORTANTE):
npm run dev
# 1. Crea punto con 4 manutenzioni
# 2. Configura assegnazione completa:
#    - Ruolo: Cuoco
#    - Categoria: Cucina
#    - Dipendente specifico: Mario Rossi
# 3. Salva
# 4. Verifica in Supabase che campi sono salvati
```

**STEP 3 - VERIFY DB (10min)**:
```sql
-- Query Supabase per verificare:
SELECT
  id, type, frequency,
  assignment_type,
  assigned_to_role,
  assigned_to_category,
  assigned_to_staff_id,
  department_id
FROM maintenance_tasks
WHERE conservation_point_id = '<POINT_ID_APPENA_CREATO>'
ORDER BY type;

-- ✅ Expected: 4 righe con tutti campi popolati
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/conservation/hooks/useMaintenanceTasks.ts
git add src/features/conservation/components/AddPointModal.tsx
git add src/types/conservation.ts
git commit -m "feat(conservation): load and save complete assignment details

Task 2.1:
- Update useMaintenanceTasks SELECT to include assignment fields
- Add assignment_type, assigned_to_role, assigned_to_category,
  assigned_to_staff_id to query
- Include department via conservation_point join
- Update MaintenanceTask type with new fields

Task 2.2:
- Transform maintenanceTasks data in AddPointModal handleSubmit
- Include all assignment fields in payload
- Map Italian tipo values to English type enum
- Verified DB: all assignment fields saved correctly

Type-check: PASS
DB Verification: ✅ All fields saved

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

**Task 2.1**:
- [ ] Query include assignment_type, assigned_to_role, assigned_to_category, assigned_to_staff_id
- [ ] Query include department via conservation_point join
- [ ] Type MaintenanceTask aggiornato
- [ ] Type-check PASS

**Task 2.2**:
- [ ] AddPointModal trasforma maintenanceTasks correttamente
- [ ] Payload include tutti campi assegnazione
- [ ] Mapping tipo corretto (rilevamento_temperatura → temperature, etc.)
- [ ] Test manuale: Punto creato con assegnazione completa
- [ ] DB verification: SELECT conferma campi salvati
- [ ] Type-check PASS

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT
═══════════════════════════════════════════════════════════════════

**Worker**: 2
**Fase**: 1 (Fix Critici)
**Task**: 2.1, 2.2
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File modificati**:
- [ ] src/features/conservation/hooks/useMaintenanceTasks.ts (query SELECT)
- [ ] src/types/conservation.ts (MaintenanceTask interface)
- [ ] src/features/conservation/components/AddPointModal.tsx (handleSubmit)

**DB Verification**:
```sql
-- Query results:
[incolla risultati query qui]
```

**Commit SHA**: _______________

**Handoff notes per Worker 3**:
Task 2.1, 2.2 COMPLETATE ✅ - Campi assegnazione caricati e salvati. Worker 3 può iniziare Task 3.1 (DIPENDE da 2.1).

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 6: WORKER 3 - FASE 1 (Task 3.1, 3.2 MODIFICATO)

### 🚀 PROMPT WORKER 3 - FASE 1 (Task 3.1, 3.2)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 1 (1.5h)
═══════════════════════════════════════════════════════════════════

Completare:
- Task 3.1: **Visualizza dettagli assegnazione** (1h) - DIPENDE DA Task 2.1 ✅
- Task 3.2: **Ordina manutenzioni + Filtro completate** (30min) - MODIFICATO

⚠️ BLOCKER: Task 3.1 RICHIEDE che Task 2.1 sia COMPLETED.

═══════════════════════════════════════════════════════════════════
🚨 PRE-REQUISITO BLOCCANTE
═══════════════════════════════════════════════════════════════════

**VERIFICA Task 2.1 COMPLETATO** (5min):
```bash
# Verifica campi assegnazione caricati
grep -A 10 "assigned_to_role\|assignment_type" src/features/conservation/hooks/useMaintenanceTasks.ts

# Verifica type aggiornato
grep -A 10 "assigned_to_role\|assigned_to_category" src/types/conservation.ts

# ✅ SE TROVATI: Continua
# ❌ SE NON TROVATI: FERMA - Task 2.1 NON completato
```

**SE BLOCCATO**: Segnala "Task 3.1 BLOCCATA - Waiting for Task 2.1" e FERMA.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE
═══════════════════════════════════════════════════════════════════

**LEGGI** (10min):
1. C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
   → Sezioni Task 3.1, Task 3.2 MODIFICATO (linee 528-532, 1230-1324)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/RIEPILOGO_LAVORO_COMPLETATO_20260116.md
   → Problema #2, #6 (Dettagli assegnazione + Filtro completate)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.1 - Visualizza Dettagli (1h)
═══════════════════════════════════════════════════════════════════

**File**: src/features/dashboard/components/ScheduledMaintenanceCard.tsx

**STEP 1 - TDD RED (20min)**:
```bash
# Crea test (se non esiste)
touch src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx

# Test che verifica visualizzazione completa
# Deve mostrare: Ruolo | Reparto | Categoria | Dipendente (se presente)
```

**STEP 2 - GREEN (30min)**:
```typescript
// In ScheduledMaintenanceCard.tsx, aggiungi helper function:

function formatAssignmentDetails(task: MaintenanceTask): string {
  const parts: string[] = []

  // Ruolo
  if (task.assigned_to_role) {
    parts.push(`Ruolo: ${task.assigned_to_role}`)
  }

  // Reparto (via conservation_point.department)
  if (task.conservation_point?.department?.name) {
    parts.push(`Reparto: ${task.conservation_point.department.name}`)
  }

  // Categoria Staff
  if (task.assigned_to_category) {
    parts.push(`Categoria: ${task.assigned_to_category}`)
  }

  // Dipendente specifico
  if (task.assigned_user?.name) {
    parts.push(`Dipendente: ${task.assigned_user.name}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'Non assegnato'
}

// Nel rendering, sostituisci visualizzazione semplice:
<div className="text-sm text-gray-600">
  {formatAssignmentDetails(task)}
</div>
```

**STEP 3 - VERIFY (10min)**:
```bash
npm run test -- ScheduledMaintenanceCard --run
# ✅ Expected: PASS

npm run type-check 2>&1 | grep ScheduledMaintenanceCard
# ✅ Expected: 0 errori
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.2 MODIFICATO - Ordina + Filtro (30min)
═══════════════════════════════════════════════════════════════════

**File**: src/features/dashboard/components/ScheduledMaintenanceCard.tsx

**MODIFICA**: Task 3.2 ora include filtro manutenzioni completate (Problema Utente #6)

**STEP 1 - IMPLEMENT (20min)**:
```typescript
// In ScheduledMaintenanceCard.tsx, aggiorna useMemo:

const sortedMaintenances = useMemo(() => {
  return maintenances
    .filter(task => task.status !== 'completed') // ✅ NUOVO: Filtra completate
    .sort((a, b) => {
      // Ordina per next_due ascendente (più prossime prima)
      const dateA = new Date(a.next_due).getTime()
      const dateB = new Date(b.next_due).getTime()
      return dateA - dateB
    })
}, [maintenances])

// Usa sortedMaintenances invece di maintenances nel rendering:
{sortedMaintenances.map(task => renderMaintenanceTask(task))}
```

**STEP 2 - VERIFY Cache Invalidation (5min)**:
```typescript
// In useMaintenanceTasks.ts, verifica completeTaskMutation invalida cache:

const completeTaskMutation = useMutation({
  mutationFn: async (taskId: string) => {
    // ... logica completamento
  },
  onSuccess: () => {
    // ✅ MUST HAVE: Invalida cache per ricaricare manutenzioni
    queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    toast.success('Manutenzione completata')
  }
})
```

**STEP 3 - TEST (5min)**:
```bash
# Test manuale (IMPORTANTE):
npm run dev
# 1. Vai a Conservation page
# 2. Vedi manutenzioni ordinate per scadenza (più prossime prima)
# 3. Completa una manutenzione
# 4. Verifica che manutenzione completata scompare
# 5. Verifica che prossima non completata è mostrata

npm run test -- ScheduledMaintenanceCard --run
# ✅ Expected: PASS
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/dashboard/components/ScheduledMaintenanceCard.tsx
git commit -m "feat(conservation): display assignment details and filter completed tasks

Task 3.1:
- Display complete assignment details in ScheduledMaintenanceCard
- Format: Role | Department | Category | Staff (if assigned)
- Handle optional fields gracefully
- Test: Verify all details displayed

Task 3.2 MODIFIED:
- Sort maintenances by next_due ascending (closest first)
- Filter out completed maintenances (status === 'completed')
- After completion, cache invalidation shows next pending task
- Verified: completed tasks disappear, next pending shown

Tests: PASS
Type-check: PASS
Manual test: ✅ Verified filtering and sorting work correctly

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

**Task 3.1**:
- [ ] Visualizzazione mostra: Ruolo | Reparto | Categoria | Dipendente
- [ ] Campi opzionali gestiti (non mostrati se null)
- [ ] Formato con separatori corretti
- [ ] Test PASS

**Task 3.2 MODIFICATO**:
- [ ] Manutenzioni ordinate per next_due ascendente
- [ ] Manutenzioni completate FILTRATE (.filter(task => status !== 'completed'))
- [ ] Dopo completamento, cache invalidata correttamente
- [ ] Test manuale: Completata scompare, prossima mostrata
- [ ] Test automatici PASS

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT
═══════════════════════════════════════════════════════════════════

**Worker**: 3
**Fase**: 1 (Fix Critici)
**Task**: 3.1, 3.2 MODIFICATO
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**Pre-requisito verificato**:
- [ ] Task 2.1 COMPLETED ✅

**File modificati**:
- [ ] src/features/dashboard/components/ScheduledMaintenanceCard.tsx

**Test manual verification**:
- [ ] Ordinamento corretto (più prossime prima): ✅
- [ ] Filtro completate funziona: ✅
- [ ] Dopo completamento, prossima mostrata: ✅

**Commit SHA**: _______________

**Handoff notes per GATE 1**:
FASE 1 COMPLETATA ✅ - Tutti fix critici implementati. Eseguire GATE 1 verification.

═══════════════════════════════════════════════════════════════════
```

---

## GATE 1 VERIFICATION

### 🚦 GATE 1 - Fine FASE 1, Prima di FASE 2

```bash
echo "🚦 GATE 1: Verifica FASE 1 completata..."

# 1. Test Conservation
npm run test -- conservation --run 2>&1 | tee logs/gate1-test.log
# ✅ PASS se: Tutti test Conservation PASS

# 2. Type-Check Conservation
npm run type-check 2>&1 | grep -i "conservation\|maintenance" | tee logs/gate1-type.log
# ✅ PASS se: 0 nuovi errori

# 3. Build
npm run build 2>&1 | tee logs/gate1-build.log
# ✅ PASS se: SUCCESS

# VERDICT
if [ $? -eq 0 ]; then
  echo "✅ GATE 1 APPROVED - Procedi a FASE 2"
else
  echo "❌ GATE 1 REJECTED - Fix errori e riprova"
fi
```

**SE PASS**: ✅ Procedi a FASE 2
**SE FAIL**: ❌ Torna a FASE 1, fixa errori

---

## PROMPT 7: WORKER 1 - FASE 2 (Task 1.2, 1.3, 1.4)

### 🚀 PROMPT WORKER 1 - FASE 2 (Task 1.2 MIGLIORATO, 1.3, 1.4)

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 2 (2.5h)
═══════════════════════════════════════════════════════════════════

Completare:
- Task 1.2: **Config giorni settimana CON calendar settings** (1h) - MIGLIORATO
- Task 1.3: **Validazione manutenzioni specifica** (1h)
- Task 1.4: **Rimuovi frequenza custom** (30min)

⚠️ Task 1.2 MIGLIORATO: Integrazione calendar settings per giorni default dall'onboarding (Problema Utente #3).

═══════════════════════════════════════════════════════════════════
🚨 PRE-REQUISITO - VERIFICA GATE 1 PASSED
═══════════════════════════════════════════════════════════════════

```bash
ls logs/gate1-*.log 2>/dev/null
# ✅ SE ESISTONO: Gate 1 passed
# ❌ SE NON ESISTONO: FERMA - Esegui Gate 1
```

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE
═══════════════════════════════════════════════════════════════════

**LEGGI** (15min):
C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md
→ Sezione "Task 1.2 MIGLIORATO" (linee 1028-1227) - LEGGI TUTTO

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 1.2 MIGLIORATO - Config Giorni Settimana (1h)
═══════════════════════════════════════════════════════════════════

**File**: src/features/conservation/components/AddPointModal.tsx

**STEP 1 - LOAD CALENDAR SETTINGS (15min)**:
```typescript
// In AddPointModal.tsx, all'inizio del componente:

import { useCalendarSettings } from '@/hooks/useCalendarSettings'

export function AddPointModal({ ... }) {
  // Carica calendar settings
  const { calendarSettings, isLoading: isLoadingCalendarSettings } = useCalendarSettings()

  // Calcola giorni di apertura disponibili
  const availableWeekdays = useMemo(() => {
    if (!calendarSettings?.open_weekdays || calendarSettings.open_weekdays.length === 0) {
      // Fallback: tutti i giorni (compatibilità retroattiva)
      return ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
    }

    // Mappa giorni numerici (1-7) a nomi italiani
    const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
    return calendarSettings.open_weekdays
      .sort((a, b) => a - b)
      .map(dayNum => dayNames[dayNum - 1])
  }, [calendarSettings])

  // Default giorni per frequenza giornaliera
  const defaultDailyWeekdays = useMemo(() => {
    return availableWeekdays // Tutti i giorni di apertura
  }, [availableWeekdays])

  // Default giorno per frequenza settimanale
  const defaultWeeklyWeekday = useMemo(() => {
    return availableWeekdays[0] || 'Lunedì' // Primo giorno apertura
  }, [availableWeekdays])
}
```

**STEP 2 - IMPLEMENT CHECKBOX (20min)**:
```typescript
// Per frequenza GIORNALIERA:
{frequenzaSelezionata === 'daily' && (
  <div className="space-y-2">
    <Label>Giorni della settimana</Label>
    <p className="text-xs text-gray-500">
      Disponibili solo i giorni di apertura dall'onboarding.
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {availableWeekdays.map(day => (
        <label key={day} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.giorniSettimana?.includes(day)}
            onChange={(e) => {
              const newGiorni = e.target.checked
                ? [...(formData.giorniSettimana || []), day]
                : (formData.giorniSettimana || []).filter(d => d !== day)
              setFormData({ ...formData, giorniSettimana: newGiorni })
            }}
            className="rounded border-gray-300 text-primary"
          />
          <span className="text-sm">{day}</span>
        </label>
      ))}
    </div>
    {isLoadingCalendarSettings && (
      <p className="text-xs text-gray-400">Caricamento giorni...</p>
    )}
  </div>
)}

// Per frequenza SETTIMANALE:
{frequenzaSelezionata === 'weekly' && (
  <div className="space-y-2">
    <Label htmlFor="weekday-select">Giorno della settimana</Label>
    <select
      id="weekday-select"
      value={formData.giornoSettimana || defaultWeeklyWeekday}
      onChange={(e) => setFormData({ ...formData, giornoSettimana: e.target.value })}
      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
    >
      {availableWeekdays.map(day => (
        <option key={day} value={day}>{day}</option>
      ))}
    </select>
    <p className="text-xs text-gray-500">
      Disponibili solo i giorni di apertura dall'onboarding.
    </p>
  </div>
)}
```

**STEP 3 - SET DEFAULTS (10min)**:
```typescript
// useEffect per impostare default quando frequenza cambia:
useEffect(() => {
  if (frequenzaSelezionata === 'daily' && !formData.giorniSettimana) {
    setFormData(prev => ({ ...prev, giorniSettimana: defaultDailyWeekdays }))
  } else if (frequenzaSelezionata === 'weekly' && !formData.giornoSettimana) {
    setFormData(prev => ({ ...prev, giornoSettimana: defaultWeeklyWeekday }))
  }
}, [frequenzaSelezionata, defaultDailyWeekdays, defaultWeeklyWeekday])
```

**STEP 4 - TEST (15min)**:
```bash
npm run test -- AddPointModal --run
# ✅ Expected: PASS

# Test manuale CRITICO:
npm run dev
# 1. Verifica calendar settings caricati (controlla Supabase)
# 2. Frequenza giornaliera → Verifica solo giorni apertura mostrati
# 3. Frequenza settimanale → Verifica primo giorno apertura default
# 4. Se settings null → Verifica fallback tutti i giorni
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 1.3 - Validazione Specifica (1h)
═══════════════════════════════════════════════════════════════════

**STEP 1 - IMPLEMENT VALIDATION (40min)**:
```typescript
// In AddPointModal.tsx, aggiungi validazione specifica:

function validateMaintenanceTasks(tasks: MaintenanceTask[]): string[] {
  const errors: string[] = []

  tasks.forEach((task, index) => {
    // 1. Frequenza obbligatoria
    if (!task.frequenza) {
      errors.push(`Task ${index + 1}: Frequenza obbligatoria`)
    }

    // 2. Assegnazione obbligatoria
    if (!task.assegnatoARuolo && !task.assegnatoACategoria && !task.assegnatoADipendente) {
      errors.push(`Task ${index + 1}: Assegnazione obbligatoria (ruolo, categoria o dipendente)`)
    }

    // 3. Giorni settimana per giornaliera
    if (task.frequenza === 'daily' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      errors.push(`Task ${index + 1}: Seleziona almeno un giorno per frequenza giornaliera`)
    }

    // 4. Giorno settimana per settimanale
    if (task.frequenza === 'weekly' && !task.giornoSettimana) {
      errors.push(`Task ${index + 1}: Seleziona giorno per frequenza settimanale`)
    }

    // 5. Giorno mese per mensile
    if (task.frequenza === 'monthly' && !task.giornoDelMese) {
      errors.push(`Task ${index + 1}: Seleziona giorno del mese per frequenza mensile`)
    }
  })

  return errors
}

// Nel handleSubmit, PRIMA di onSave:
const maintenanceErrors = validateMaintenanceTasks(formData.maintenanceTasks)
if (maintenanceErrors.length > 0) {
  setValidationErrors({ maintenances: maintenanceErrors.join(', ') })
  return // Blocca submit
}
```

**STEP 2 - VERIFY (20min)**:
```bash
npm run test -- AddPointModal --run
# ✅ Expected: PASS

npm run type-check 2>&1 | grep AddPointModal
# ✅ Expected: 0 errori
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 1.4 - Rimuovi Frequenza Custom (30min)
═══════════════════════════════════════════════════════════════════

**STEP 1 - REMOVE (20min)**:
```typescript
// In AddPointModal.tsx, rimuovi opzione 'custom' da select frequenza:

// BEFORE:
<option value="custom">Personalizzata</option>

// AFTER: (rimuovi completamente la linea)

// Rimuovi anche handling logica custom se presente
```

**STEP 2 - VERIFY (10min)**:
```bash
grep -i "custom" src/features/conservation/components/AddPointModal.tsx
# ✅ Expected: 0 risultati (o solo in commenti)

npm run test -- AddPointModal --run
# ✅ Expected: PASS
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/conservation/components/AddPointModal.tsx
git commit -m "feat(conservation): config weekdays with calendar settings, validation, remove custom

Task 1.2 IMPROVED:
- Load calendar settings (fiscal year, open_weekdays, closures)
- Daily frequency: checkbox only for open weekdays, all selected by default
- Weekly frequency: select only open weekdays, first as default
- Fallback to all days if settings not configured
- Map numeric weekdays (1-7) to Italian names

Task 1.3:
- Add specific maintenance validation
- Validate frequency, assignment, weekdays required
- Show errors before submit, block if invalid

Task 1.4:
- Remove 'custom' frequency option completely

Tests: PASS
Type-check: PASS
Manual test: ✅ Calendar settings integration verified

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

**Task 1.2**:
- [ ] Hook useCalendarSettings() used
- [ ] availableWeekdays calculated from open_weekdays
- [ ] Daily: checkbox only open days, all default
- [ ] Weekly: select only open days, first default
- [ ] Fallback to all days if settings null/empty
- [ ] Loading state shown

**Task 1.3**:
- [ ] Validation function checks all requirements
- [ ] Errors shown before submit
- [ ] Submit blocked if invalid
- [ ] Test PASS

**Task 1.4**:
- [ ] 'custom' frequency removed from options
- [ ] No 'custom' logic remaining
- [ ] Test PASS

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT
═══════════════════════════════════════════════════════════════════

**Worker**: 1
**Fase**: 2 (Completa Core)
**Task**: 1.2 MIGLIORATO, 1.3, 1.4
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**Calendar Settings Verification**:
- [ ] open_weekdays: [___]
- [ ] Daily default: [___]
- [ ] Weekly default: ___
- [ ] Fallback tested: ✅

**Commit SHA**: _______________

**Handoff notes per Worker 2**:
Task 1.2, 1.3, 1.4 COMPLETATE ✅ - Worker 2 può iniziare Task 2.3.

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 8: WORKER 2 - FASE 2 (Task 2.3)

### 🚀 PROMPT WORKER 2 - FASE 2 (Task 2.3)

```
Sei Worker 2 - Database/Data Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 2 (30min)
═══════════════════════════════════════════════════════════════════

Task 2.3: **Salva campi temperatura (method, notes, photo_evidence)**

⚠️ Questi campi esistono nella tabella ma non vengono salvati dal frontend.

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 2.3 (30min)
═══════════════════════════════════════════════════════════════════

**Files**:
- src/features/conservation/components/AddTemperatureModal.tsx
- src/features/conservation/hooks/useTemperatureReadings.ts

**STEP 1 - VERIFY FIELDS IN MODAL (10min)**:
```bash
# Verifica che AddTemperatureModal ha i campi:
grep -A 5 "method\|notes\|photo" src/features/conservation/components/AddTemperatureModal.tsx

# Se NON presenti, aggiungi nel form:
# - Select per method (digital_thermometer, probe, manual)
# - Textarea per notes
# - Input file per photo_evidence (URL)
```

**STEP 2 - UPDATE PAYLOAD (15min)**:
```typescript
// In useTemperatureReadings.ts, createReadingMutation:

const payload = {
  conservation_point_id: data.conservation_point_id,
  temperature: data.temperature,
  recorded_at: recordedAtString,
  method: data.method || 'digital_thermometer', // ✅ DEFAULT
  notes: data.notes || null, // ✅ OPTIONAL
  photo_evidence: data.photo_evidence || null, // ✅ OPTIONAL
  recorded_by: data.recorded_by,
  company_id: companyId,
}
```

**STEP 3 - VERIFY (5min)**:
```bash
npm run type-check 2>&1 | grep -i "temperature"
# ✅ Expected: 0 errori

# Test manuale:
npm run dev
# Registra temperatura con method/notes → Verifica salvati in DB
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/conservation/hooks/useTemperatureReadings.ts
git add src/features/conservation/components/AddTemperatureModal.tsx
git commit -m "feat(conservation): save temperature method, notes, photo fields

- Include method, notes, photo_evidence in temperature reading payload
- Default method: digital_thermometer
- Verified DB: fields saved correctly

Type-check: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

- [ ] Payload include method, notes, photo_evidence
- [ ] Default method: digital_thermometer
- [ ] Type-check PASS
- [ ] DB verification: Fields saved

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 9: WORKER 3 - FASE 2 (Task 3.3)

### 🚀 PROMPT WORKER 3 - FASE 2 (Task 3.3)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 2 (1h)
═══════════════════════════════════════════════════════════════════

Task 3.3: **Raggruppa manutenzioni per tipo**

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.3 (1h)
═══════════════════════════════════════════════════════════════════

**File**: src/features/dashboard/components/ScheduledMaintenanceCard.tsx

**STEP 1 - IMPLEMENT GROUPING (40min)**:
```typescript
// Raggruppa manutenzioni per tipo:
const groupedByType = useMemo(() => {
  const groups: Record<MaintenanceType, MaintenanceTask[]> = {
    temperature: [],
    sanitization: [],
    defrosting: [],
    expiry_check: []
  }

  sortedMaintenances.forEach(task => {
    if (groups[task.type]) {
      groups[task.type].push(task)
    }
  })

  return groups
}, [sortedMaintenances])

// Rendering con espansione per tipo:
{Object.entries(groupedByType).map(([type, tasks]) => {
  if (tasks.length === 0) return null

  return (
    <div key={type} className="mb-4">
      <button
        onClick={() => toggleExpanded(type)}
        className="flex items-center justify-between w-full"
      >
        <h4>{getTypeLabel(type)} ({tasks.length})</h4>
        <ChevronDown className={expanded[type] ? 'rotate-180' : ''} />
      </button>
      {expanded[type] && (
        <div className="mt-2 space-y-2">
          {tasks.map(task => renderTask(task))}
        </div>
      )}
    </div>
  )
})}
```

**STEP 2 - VERIFY (20min)**:
```bash
npm run test -- ScheduledMaintenanceCard --run
# ✅ Expected: PASS

npm run type-check 2>&1 | grep ScheduledMaintenanceCard
# ✅ Expected: 0 errori
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/dashboard/components/ScheduledMaintenanceCard.tsx
git commit -m "feat(conservation): group maintenances by type with expansion

- Group maintenances by type (temperature, sanitization, etc.)
- Expandable sections per type
- Show count per type
- Tests: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
```

---

## GATE 2 VERIFICATION

### 🚦 GATE 2 - Fine FASE 2, Prima di FASE 3

```bash
echo "🚦 GATE 2: Verifica FASE 2 completata..."

npm run test -- conservation --run 2>&1 | tee logs/gate2-test.log
npm run type-check 2>&1 | grep -i "conservation" | tee logs/gate2-type.log
npm run build 2>&1 | tee logs/gate2-build.log

if [ $? -eq 0 ]; then
  echo "✅ GATE 2 APPROVED - Procedi a FASE 3"
else
  echo "❌ GATE 2 REJECTED - Fix errori"
fi
```

---

## PROMPT 10: WORKER 1 - FASE 3 (Task 1.5, 1.6)

### 🚀 PROMPT WORKER 1 - FASE 3 (Task 1.5, 1.6)

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 3 (1h)
═══════════════════════════════════════════════════════════════════

- Task 1.5: **Aria-label accessibilità** (30min)
- Task 1.6: **Modifica lettura temperatura** (30min)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 1.5 - Aria-label (30min)
═══════════════════════════════════════════════════════════════════

**File**: src/features/conservation/ConservationPointCard.tsx

```typescript
// Aggiungi aria-label a tutti elementi interattivi:
<button aria-label="Aggiungi temperatura" onClick={...}>
<button aria-label={`Elimina punto ${point.name}`} onClick={...}>
<div role="region" aria-label="Dettagli punto conservazione">
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 1.6 - Modifica Lettura (30min)
═══════════════════════════════════════════════════════════════════

**Files**:
- src/features/conservation/ConservationPage.tsx
- src/features/conservation/components/AddTemperatureModal.tsx

```typescript
// In ConservationPage, aggiungi stato per edit:
const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null)

// Passa a modal:
<AddTemperatureModal
  isOpen={isTemperatureModalOpen}
  onClose={...}
  onSave={...}
  editingReading={editingReading} // ✅ NUOVO
/>

// In AddTemperatureModal, load data se editing:
useEffect(() => {
  if (editingReading) {
    setFormData({
      temperature: editingReading.temperature,
      method: editingReading.method,
      notes: editingReading.notes,
      ...
    })
  }
}, [editingReading])
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/conservation/ConservationPointCard.tsx
git add src/features/conservation/ConservationPage.tsx
git add src/features/conservation/components/AddTemperatureModal.tsx
git commit -m "feat(conservation): add aria-labels and temperature edit

Task 1.5:
- Add aria-label to all interactive elements
- Improve accessibility

Task 1.6:
- Enable temperature reading editing
- Load existing data in modal when editing
- Tests: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
```

---

## PROMPT 11: WORKER 3 - FASE 3 (Task 3.4)

### 🚀 PROMPT WORKER 3 - FASE 3 (Task 3.4)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 3 (1h)
═══════════════════════════════════════════════════════════════════

Task 3.4: **Modifica punto con manutenzioni**

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.4 (1h)
═══════════════════════════════════════════════════════════════════

**Files**:
- src/features/conservation/components/AddPointModal.tsx
- src/features/conservation/hooks/useMaintenanceTasks.ts

```typescript
// In AddPointModal, quando editing, carica manutenzioni esistenti:
useEffect(() => {
  if (editingPoint) {
    // Carica maintenanceTasks per questo punto
    const { data: tasks } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('conservation_point_id', editingPoint.id)

    // Popola form con task esistenti
    setFormData({
      ...editingPoint,
      maintenanceTasks: tasks
    })
  }
}, [editingPoint])

// In useMaintenanceTasks, aggiungi updateTaskMutation se non esiste
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add src/features/conservation/components/AddPointModal.tsx
git add src/features/conservation/hooks/useMaintenanceTasks.ts
git commit -m "feat(conservation): enable point editing with maintenances

- Load existing maintenances when editing point
- Enable maintenance task updates
- Tests: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
```

---

## GATE 3 VERIFICATION

### 🚦 GATE 3 - Fine FASE 3, Prima di FASE 4

```bash
echo "🚦 GATE 3: Verifica FASE 3 completata..."

npm run test -- conservation --run 2>&1 | tee logs/gate3-test.log
npm run type-check 2>&1 | grep -i "conservation" | tee logs/gate3-type.log
npm run build 2>&1 | tee logs/gate3-build.log

if [ $? -eq 0 ]; then
  echo "✅ GATE 3 APPROVED - Procedi a FASE 4"
else
  echo "❌ GATE 3 REJECTED - Fix errori"
fi
```

---

## PROMPT 12: WORKER 4 - FASE 4 (Task 4.1)

### 🚀 PROMPT WORKER 4 - FASE 4 (Task 4.1)

```
Sei Worker 4 - Integration/Testing Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 4 (1h)
═══════════════════════════════════════════════════════════════════

Task 4.1: **Test E2E completi per tutte le nuove feature**

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 4.1 (1h)
═══════════════════════════════════════════════════════════════════

**Crea file**: tests/conservation/complete-new-features.spec.ts

**Scenari CRITICI da testare**:

```typescript
test('Mini calendario - Mode month (Task 1.1)', async ({ page }) => {
  // 1. Apri AddPointModal
  // 2. Seleziona frequenza mensile
  // 3. Verifica mini calendario mese (grid 31 giorni)
  // 4. Seleziona giorno 15
  // 5. Screenshot evidenza
})

test('Mini calendario - Mode year con calendar settings (Task 1.1)', async ({ page }) => {
  // 1. Apri AddPointModal
  // 2. Seleziona frequenza annuale per Sbrinamento
  // 3. Verifica calendario annuale con mesi
  // 4. Verifica solo giorni apertura selezionabili
  // 5. Screenshot evidenza
})

test('Config giorni settimana con calendar settings (Task 1.2)', async ({ page }) => {
  // 1. Apri AddPointModal
  // 2. Seleziona frequenza giornaliera
  // 3. Verifica checkbox solo giorni apertura
  // 4. Verifica tutti default selezionati
  // 5. Screenshot evidenza
})

test('Dettagli assegnazione completi (Task 2.1, 3.1)', async ({ page }) => {
  // 1. Crea punto con assegnazione completa
  // 2. Verifica visualizzazione: Ruolo | Reparto | Categoria | Dipendente
  // 3. Screenshot evidenza
})

test('Ordinamento e filtro manutenzioni (Task 3.2)', async ({ page }) => {
  // 1. Verifica manutenzioni ordinate per scadenza
  // 2. Completa una manutenzione
  // 3. Verifica che completata scompare
  // 4. Verifica prossima mostrata
  // 5. Screenshot evidenza
})

test('Validazione manutenzioni (Task 1.3)', async ({ page }) => {
  // 1. Prova submit senza frequenza
  // 2. Verifica errore mostrato
  // 3. Prova submit senza assegnazione
  // 4. Verifica errore mostrato
  // 5. Screenshot evidenza
})

test('Campi temperatura salvati (Task 2.3)', async ({ page }) => {
  // 1. Registra temperatura con method/notes
  // 2. Verifica DB: campi salvati
  // 3. Screenshot evidenza
})
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add tests/conservation/complete-new-features.spec.ts
git commit -m "test(conservation): E2E tests for all new features

- Test mini calendario (month/year modes)
- Test calendar settings integration
- Test assignment details display
- Test sorting and filtering
- Test validation
- All tests PASS with evidence screenshots

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
```

---

## GATE 4 VERIFICATION

### 🚦 GATE 4 - Fine FASE 4, Prima di FASE 5

```bash
echo "🚦 GATE 4: Verifica E2E tests..."

npm run test:e2e -- tests/conservation/complete-new-features.spec.ts 2>&1 | tee logs/gate4-e2e.log
ls -la test-evidence/ # Verifica screenshot salvati

if [ $? -eq 0 ]; then
  echo "✅ GATE 4 APPROVED - Procedi a FASE 5 (Supervisor)"
else
  echo "❌ GATE 4 REJECTED - Fix test failures"
fi
```

---

## PROMPT 13: WORKER 5 - FASE 5 (Task 5.1)

### 🚀 PROMPT WORKER 5 - SUPERVISOR (Task 5.1)

```
Sei Worker 5 - Supervisor per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FASE 5 (1h)
═══════════════════════════════════════════════════════════════════

Task 5.1: **Final Quality Check COMPLETO**

⚠️ CRITICAL: Questo è il check FINALE prima del merge. ZERO tolleranza per errori.

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW FINAL QUALITY CHECK (1h)
═══════════════════════════════════════════════════════════════════

**ESEGUI TUTTI I COMANDI FRESH (no cache)**:

**STEP 1 - TypeScript Check (10min)**:
```bash
rm -rf node_modules/.cache
npm run type-check 2>&1 | tee logs/final-type-check.log

# ANALIZZA OUTPUT:
# - Conta errori Conservation-specifici
# - Separa errori pre-esistenti da nuovi
# - ✅ PASS se: 0 NUOVI errori Conservation
# - ❌ FAIL se: > 0 nuovi errori
```

**STEP 2 - Lint Check (10min)**:
```bash
npm run lint 2>&1 | tee logs/final-lint.log

# ANALIZZA OUTPUT:
# - Conta errori/warning Conservation
# - ✅ PASS se: 0 errori Conservation
# - ❌ FAIL se: > 0 errori
```

**STEP 3 - Build Check (10min)**:
```bash
rm -rf dist
npm run build 2>&1 | tee logs/final-build.log

# ✅ PASS se: Build SUCCESS
# ❌ FAIL se: Build ERROR
```

**STEP 4 - Unit Tests (10min)**:
```bash
npm run test -- --run 2>&1 | tee logs/final-test.log

# ANALIZZA OUTPUT:
# - Verifica tutti test Conservation PASS
# - ✅ PASS se: ALL PASS
# - ❌ FAIL se: ANY FAIL
```

**STEP 5 - E2E Tests (15min)**:
```bash
npm run test:e2e 2>&1 | tee logs/final-e2e.log

# ANALIZZA OUTPUT:
# - Verifica E2E tests PASS
# - Verifica screenshot evidenza salvati
# - ✅ PASS se: ALL PASS
# - ❌ FAIL se: ANY FAIL
```

**STEP 6 - Database Integrity (5min)**:
```bash
# Se hai script verify-conservation-db.js:
node scripts/verify-conservation-db.js 2>&1 | tee logs/final-db-check.log

# Verifica:
# - 0 punti orfani (senza manutenzioni)
# - 0 temperature orfane (senza punti)
# - ✅ PASS se: 0 orphans
# - ❌ FAIL se: > 0 orphans
```

═══════════════════════════════════════════════════════════════════
📊 COMPILA FINAL REPORT
═══════════════════════════════════════════════════════════════════

Crea file: `SUPERVISOR_FINAL_REPORT_COMPLETAMENTO.md`

```markdown
# SUPERVISOR FINAL REPORT - Conservation Feature Completion

**Data**: YYYY-MM-DD
**Supervisor**: Worker 5
**Versione**: v3.0 FINAL

## 📊 VERIFICATION RESULTS

### 1. TypeScript Check
- **Status**: ✅ PASS / ❌ FAIL
- **Errori Conservation**: X
- **Log**: logs/final-type-check.log

### 2. Lint Check
- **Status**: ✅ PASS / ❌ FAIL
- **Errori Conservation**: X
- **Log**: logs/final-lint.log

### 3. Build Check
- **Status**: ✅ PASS / ❌ FAIL
- **Log**: logs/final-build.log

### 4. Unit Tests
- **Status**: ✅ PASS / ❌ FAIL
- **Passed**: X/Y
- **Log**: logs/final-test.log

### 5. E2E Tests
- **Status**: ✅ PASS / ❌ FAIL
- **Passed**: X/Y
- **Screenshots**: X files in test-evidence/
- **Log**: logs/final-e2e.log

### 6. Database Integrity
- **Status**: ✅ PASS / ❌ FAIL
- **Orphan points**: X
- **Orphan readings**: X
- **Log**: logs/final-db-check.log

## 📋 FEATURE CHECKLIST

**FASE 0 - Fix Bloccanti**:
- [ ] Task 0.1: Select Ruolo fixed
- [ ] Task 0.2: Errore registrazione temperatura fixed
- [ ] Task 0.3-0.7: Code quality fixed

**FASE 1 - Fix Critici**:
- [ ] Task 1.1: Mini Calendario con calendar settings ✅
- [ ] Task 2.1, 2.2: Assegnazione completa ✅
- [ ] Task 3.1, 3.2: Visualizza/Ordina + Filtro ✅

**FASE 2 - Completa Core**:
- [ ] Task 1.2: Config giorni con calendar settings ✅
- [ ] Task 1.3, 1.4: Validazione + Remove custom ✅
- [ ] Task 2.3: Salva campi temperatura ✅
- [ ] Task 3.3: Raggruppa manutenzioni ✅

**FASE 3 - Miglioramenti**:
- [ ] Task 1.5, 1.6: Aria-label + Modifica lettura ✅
- [ ] Task 3.4: Modifica punto con manutenzioni ✅

**FASE 4 - Integration**:
- [ ] Task 4.1: E2E tests completi ✅

## 🎯 FINAL VERDICT

### ✅ APPROVED - Ready to Merge

**Motivo**: Tutti i verification checks PASS. Feature completata correttamente con calendar settings integration, filtro manutenzioni completate, e tutti i fix bloccanti risolti.

**Merge Instructions**:
1. Create PR: `git push origin NoClerk`
2. Titolo PR: "feat(conservation): complete feature with calendar settings and fixes"
3. Reviewer: Assign to team lead
4. Merge strategy: Squash and merge

---

### ❌ REJECTED - Fixes Required

**Motivo**: [Specifica motivo reiezione]

**Action Items**:
1. [ ] Fix TypeScript errors in [file]
2. [ ] Fix test failures in [test]
3. [ ] Fix lint errors in [file]

**Torna a FASE**: [Specifica fase]

---

**Report completato**: YYYY-MM-DD HH:MM
**Signature**: Worker 5 (Supervisor)
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA SUPERVISOR
═══════════════════════════════════════════════════════════════════

**APPROVED richiede TUTTI questi**:
- [ ] type-check: 0 NUOVI errori Conservation
- [ ] lint: 0 errori Conservation
- [ ] build: SUCCESS
- [ ] test: ALL PASS
- [ ] test:e2e: ALL PASS
- [ ] db-check: 0 orphans
- [ ] Final report creato e completo

**SE ANCHE UNO FAIL**: Verdict = REJECTED con action items specifici

═══════════════════════════════════════════════════════════════════
```

---

## FINAL VERDICT

**Dopo Worker 5 completa Task 5.1**:

### ✅ SE APPROVED:
```bash
echo "🎉 CONSERVATION FEATURE COMPLETAMENTO APPROVED!"
echo "Ready to merge to main branch"
echo "Tutte le fasi (0-5) completate con successo"
echo "Calendar settings integration ✅"
echo "Filtro manutenzioni completate ✅"
echo "Tutti fix bloccanti risolti ✅"
```

### ❌ SE REJECTED:
```bash
echo "❌ FIX RICHIESTI - Vedere SUPERVISOR_FINAL_REPORT_COMPLETAMENTO.md"
echo "Torna alla fase indicata nel report"
echo "Risolvi action items e riprova verification"
```

---

**Fine WORKER_PROMPTS_FINAL.md - File Consolidato Completo**
