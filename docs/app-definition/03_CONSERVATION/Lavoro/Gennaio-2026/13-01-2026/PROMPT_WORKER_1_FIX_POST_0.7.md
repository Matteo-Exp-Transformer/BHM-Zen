# 🚀 PROMPT WORKER 1 - FIX POST TASK 0.7 (Task 0.5, 0.6 REMAINING)

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FIX REMAINING ERRORS POST TASK 0.7
═══════════════════════════════════════════════════════════════════

Completare fix RIMANENTI da Task 0.5 e 0.6 che bloccano GATE 0:
- Task 0.5: Fix TypeScript errors in ScheduledMaintenanceCard.test.tsx (10 errori)
- Task 0.6: Fix test failures in Conservation tests (7 failed)

⚠️ CRITICAL: Questi errori bloccano GATE 0. Devono essere risolti PRIMA di procedere.

═══════════════════════════════════════════════════════════════════
📚 CONTESTO ATTUALE
═══════════════════════════════════════════════════════════════════

**Status FASE 0**:
- Task 0.1, 0.3: ✅ COMPLETATE (Worker 1)
- Task 0.2, 0.4: ✅ COMPLETATE (Worker 2)
- Task 0.5: ⏳ IN PROGRESS (10 errori TypeScript rimanenti)
- Task 0.6: ⏳ IN PROGRESS (7 test failures rimanenti)
- Task 0.7: ✅ COMPLETATA (Worker 3)

**Problemi identificati che bloccano GATE 0**:

1. **TypeScript Errors in ScheduledMaintenanceCard.test.tsx** (10 errori):
   - Errori: `Argument of type '...' is not assignable to parameter of type '...'`
   - Linee: 94, 189, 296, 392, 516, 623, 756, 910, 1052
   - Causa: Type mismatch nei mock dei test (ConservationPoint type mismatch)

2. **Test Failures** (7 failed):
   - Test Files: 37 failed | 1 passed (38)
   - Tests: 7 failed | 25 passed (32)
   - Errors: 2 errors
   - Causa: Potenzialmente legati agli errori TypeScript

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.5 - Fix TypeScript Errors in Test Files
═══════════════════════════════════════════════════════════════════

**File**: src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx

**STEP 1 - IDENTIFY ERRORS (10min)**:
```bash
# Identifica tutti gli errori TypeScript
npm run type-check 2>&1 | grep -A 3 "ScheduledMaintenanceCard.test.tsx"

# Output atteso:
# src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx(94,54): error TS2345: ...
# [9 altri errori simili]
```

**STEP 2 - ANALYZE TYPE MISMATCH (15min)**:
```bash
# Leggi i mock nel test file
grep -A 20 "conservationPoints:" src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx | head -50

# Verifica il tipo ConservationPoint reale
grep -A 30 "export interface ConservationPoint" src/types/conservation.ts
# oppure
grep -A 30 "export type ConservationPoint" src/types/database.types.ts
```

**STEP 3 - FIX MOCK TYPES (25min)**:
```typescript
// Pattern di fix comune:
// Il problema è probabilmente che i mock non hanno tutti i campi richiesti da ConservationPoint

// PRIMA (incompleto):
const mockConservationPoint = {
  id: 'point-1',
  name: 'Test Point',
  // ... campi mancanti
}

// DOPO (completo):
const mockConservationPoint: ConservationPoint = {
  id: 'point-1',
  name: 'Test Point',
  company_id: 'company-1',
  department_id: 'dept-1',
  setpoint_temp: 4,
  type: 'fridge',
  product_categories: [],
  status: 'normal',
  is_blast_chiller: false,
  created_at: new Date(),
  updated_at: new Date(),
  // Tutti i campi richiesti da ConservationPoint
}

// OPPURE usa Partial<> se non tutti i campi sono necessari:
const mockConservationPoints: Partial<ConservationPoint>[] = [...]
// E poi usa 'as ConservationPoint' dove necessario
```

**STEP 4 - VERIFY (10min)**:
```bash
# Verifica che gli errori TypeScript sono risolti
npm run type-check 2>&1 | grep -c "ScheduledMaintenanceCard.test.tsx"
# ✅ Expected: 0 errori

# Verifica che i test passano
npm run test -- ScheduledMaintenanceCard.test.tsx --run
# ✅ Expected: ALL PASS
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 0.6 - Fix Test Failures
═══════════════════════════════════════════════════════════════════

**STEP 1 - IDENTIFY FAILURES (15min)**:
```bash
# Esegui test e identifica failures
npm run test -- conservation --run 2>&1 | tee logs/test-failures.log

# Analizza output:
# - Quali test falliscono?
# - Quali sono gli errori specifici?
# - Sono legati agli errori TypeScript fixati sopra?
```

**STEP 2 - FIX FAILURES (30min)**:
```bash
# Se i failures sono legati a TypeScript errors, dovrebbero essere risolti
# dopo il fix di Task 0.5

# Se ci sono altri problemi:
# 1. Selector ambigui → Usa selector più specifici (role, testid, within)
# 2. Async timing → Usa waitFor() invece di timeout fissi
# 3. Mock incompleti → Completa i mock con tutti i campi necessari
```

**STEP 3 - VERIFY (15min)**:
```bash
# Verifica che tutti i test passano
npm run test -- conservation --run
# ✅ Expected: ALL PASS (0 failed)

# Verifica anche test dashboard se modificati
npm run test -- dashboard --run
# ✅ Expected: ALL PASS
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
# Verifica che TUTTI i comandi hanno passato
npm run lint 2>&1 | grep -c "conservation\|dashboard"
# ✅ Expected: 0 errori

npm run type-check 2>&1 | grep -c "test.tsx"
# ✅ Expected: 0 errori

npm run test -- conservation --run
# ✅ Expected: ALL PASS

# Commit SOLO se tutto OK
git add src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx
git add src/features/conservation/components/__tests__/AddPointModal.test.tsx
git commit -m "fix(conservation): complete Task 0.5 and 0.6 - fix test TypeScript errors and failures

Task 0.5:
- Fix 10 TypeScript errors in ScheduledMaintenanceCard.test.tsx
- Align mock types with ConservationPoint interface
- Add missing required fields to mock objects

Task 0.6:
- Fix test failures in Conservation tests
- Resolve selector ambiguities
- Complete mock data for tests

Tests: ALL PASS
Type-check: PASS (0 test file errors)
Lint: PASS (0 conservation errors)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

**Task 0.5**:
- [ ] 0 errori TypeScript in ScheduledMaintenanceCard.test.tsx
- [ ] Mock types allineati con ConservationPoint interface
- [ ] Type-check PASS per test files (0 errori)
- [ ] Test ScheduledMaintenanceCard PASS

**Task 0.6**:
- [ ] 0 test failures in Conservation tests
- [ ] Test AddPointModal PASS (se modificato)
- [ ] Test ScheduledMaintenanceCard PASS
- [ ] Test stabili (no flaky)

**VERIFICA GLOBALE**:
- [ ] npm run lint: 0 errori conservation/dashboard
- [ ] npm run type-check: 0 errori test files
- [ ] npm run test -- conservation: ALL PASS
- [ ] Commit creato con messaggio dettagliato

SE ANCHE UNO ❌: NON sei completato. Risolvi prima di procedere.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 1
**Fase**: 0 (Fix Bloccanti - Post Task 0.7)
**Task**: 0.5, 0.6 (remaining)
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File modificati**:
- [ ] src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx (linee ___) 
- [ ] src/features/conservation/components/__tests__/AddPointModal.test.tsx (linee ___) [se necessario]

**Verification commands executed**:
- [ ] npm run lint: PASS
- [ ] npm run type-check: PASS (0 test file errors)
- [ ] npm run test -- conservation: ALL PASS

**Commit SHA**: _______________

**Errori fixati**:
- TypeScript errors ScheduledMaintenanceCard.test.tsx: ___ errori fixati
- Test failures: ___ failures fixati

**Handoff notes per GATE 0**:
Task 0.5, 0.6 COMPLETATE ✅ - Tutti fix FASE 0 completati. Pronto per GATE 0.

═══════════════════════════════════════════════════════════════════
⚠️ SE BLOCCATO
═══════════════════════════════════════════════════════════════════

1. **Identifica problema specifico**: Quale test? Quale errore TypeScript?
2. **Analizza root cause**: Perché il mock non matcha il tipo?
3. **Verifica tipo reale**: Controlla ConservationPoint interface/type reale
4. **Tenta fix**: Aggiungi campi mancanti o usa Partial<> con as
5. **SE ancora bloccato**: Documenta nel progress report e segnala

═══════════════════════════════════════════════════════════════════
```
