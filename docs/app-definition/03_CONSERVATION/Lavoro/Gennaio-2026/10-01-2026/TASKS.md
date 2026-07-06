# TASKS - Conservation Multi-Agent System v2.0

**Data Creazione**: 2026-01-11
**Versione**: 2.0.0
**Motivo Aggiornamento**: Riorganizzate per workflow 4 fasi con Worker 0 (Audit)

---

## 📋 COME USARE QUESTO FILE

### Per Worker 0 (Audit)
1. Esegui task in ordine (0.1 → 0.2 → 0.3 → 0.4)
2. Per ogni claim: IDENTIFY → RUN → READ → VERIFY → DOCUMENT
3. Scrivi risultati in `VERIFICATION_REPORT_[DATA].md`
4. Verdict finale: APPROVED (procedi) / STOP (nessun problema)

### Per Workers 1-3 (Fix)
1. **PREREQUISITO**: Worker 0 completato con verdict APPROVED
2. Leggi `VERIFICATION_REPORT.md` - fix SOLO problemi ✅ CONFIRMED
3. Segui TDD workflow: RED → GREEN → REFACTOR
4. Aggiorna `MASTER_INDEX.md` quando completo

### Per Worker 4 (Integration)
1. **PREREQUISITO**: Workers 1-3 completati + test GREEN
2. Scrivi test E2E flussi critici
3. Test performance
4. NO timeout fissi (usa condition-based-waiting)

### Per Worker 5 (Supervisor)
1. **PREREQUISITO**: Tutti workers 0-4 completati
2. Esegui GATE FUNCTION (7 comandi FRESH)
3. Scrivi `SUPERVISOR_FINAL_REPORT.md`
4. Verdict: APPROVED (merge) / REJECTED (fix & retry)

---

# FASE 0: VERIFICA (Worker 0)

## TASK 0.1: Verifica AddPointModal UI

**Priority**: CRITICAL
**Time**: 30min
**Dependencies**: None

### Obiettivo
Verificare 4 claims UI nel modal AddPointModal:
1. Z-index insufficiente (z-50 invece z-9999)
2. Temperatura input manuale invece range predefinito
3. Select ruolo non funzionante
4. Campi Categoria/Dipendente non visibili

### Sub-Tasks

#### Claim 1: Z-Index z-50 invece z-[9999]

**Comando Verifica**:
```bash
grep -n "className.*z-" src/features/conservation/components/AddPointModal.tsx
```

**Output Atteso**: Trova `z-50` o `z-[50]` alla linea ~588

**Verify**:
- ✅ CONFIRMED se trova z-50
- ❌ REJECTED se trova z-9999 o z-[9999]

**Screenshot Richiesto**: Modal sotto header/navigation

---

#### Claim 2: Temperatura Input Manuale

**Comando Verifica**:
```bash
# Leggi sezione temperatura target
grep -A 30 "Temperatura target" src/features/conservation/components/AddPointModal.tsx
```

**Output Atteso**: Input con `type="number"` senza range suggestions

**Verify**:
- ✅ CONFIRMED se input vuoto senza default basato su tipologia
- ❌ REJECTED se temperatura si auto-aggiorna quando tipologia cambia

**Screenshot Richiesto**: Input temperatura vuoto

---

#### Claim 3: Select Ruolo Non Funzionante

**Comando Verifica**:
```bash
# Cerca select ruolo
grep -A 20 "Assegnato a Ruolo" src/features/conservation/components/AddPointModal.tsx | head -30
```

**Output Atteso**: Trova `<select>` HTML nativo (non `<Select>` component UI)

**Pattern SBAGLIATO**:
```typescript
<select
  value={task.assegnatoARuolo}
  onChange={(e) => updateTask(...)}
>
```

**Pattern CORRETTO** (da TasksStep.tsx):
```typescript
<Select
  value={task.assegnatoARuolo}
  onValueChange={(value) => updateTask(...)}
>
```

**Verify**:
- ✅ CONFIRMED se usa `<select>` nativo
- ❌ REJECTED se usa `<Select>` component UI

**Root Cause se CONFIRMED**: Uso componente HTML nativo incompatibile con design system

**Screenshot Richiesto**: Click su select → nessuna risposta

---

#### Claim 4: Campi Categoria/Dipendente Non Visibili

**Comando Verifica**:
```bash
# Cerca campi condizionali
grep -B 5 -A 15 "task.assegnatoARuolo &&" src/features/conservation/components/AddPointModal.tsx
```

**Output Atteso**: Codice esiste (linee ~207-265) ma condizione non soddisfatta

**Verify**:
- ✅ CONFIRMED se codice esiste ma campi non appaiono dopo selezione ruolo
- ❌ REJECTED se campi appaiono correttamente

**Root Cause se CONFIRMED**: Dipende da Claim 3 (select ruolo non funziona → `task.assegnatoARuolo` non viene popolato → condizione non soddisfatta)

**Screenshot Richiesto**: Form manutenzione senza campi categoria/dipendente

---

### Acceptance Criteria

- [ ] Ogni claim verificato con comando specifico
- [ ] Screenshot per claims confermati
- [ ] Root cause identificata per claims confermati
- [ ] Severity assegnata (CRITICAL/HIGH/MEDIUM)
- [ ] Raccomandazioni per Worker 1

### Output

Sezione in `VERIFICATION_REPORT_[DATA].md`:

```markdown
## VERIFIED ISSUES - AddPointModal UI

### 1. Select Ruolo Non Funzionante - ✅ CONFIRMED (CRITICAL)

**Claim Originale**: Select "Seleziona ruolo..." non permette selezione

**Evidenza**:
- **File**: `src/features/conservation/components/AddPointModal.tsx`
- **Linee**: 186-203
- **Comando**: `grep -A 20 "Assegnato a Ruolo" src/features/conservation/components/AddPointModal.tsx`
- **Pattern Trovato**:
  ```typescript
  <select
    className="w-full px-3 py-2 border rounded-md"
    value={task.assegnatoARuolo || ''}
    onChange={(e) => updateTask(index, 'assegnatoARuolo', e.target.value)}
  >
    <option value="">Seleziona ruolo...</option>
    ...
  </select>
  ```
- **Screenshot**: [select-non-funzionante.png]

**Root Cause**: Uso `<select>` HTML nativo invece `<Select>` component UI da `@/components/ui/Select`

**Recommendation**:
- **Worker**: Worker 1 (UI/Forms)
- **Task**: Task 1.5 - Fix Select Ruolo
- **Pattern Riferimento**: `src/components/onboarding-steps/TasksStep.tsx` linee 680-698
- **Complexity**: MEDIUM
- **ETA**: 45min

**Severity**: CRITICAL
**Blocca**: Task 1.4 (campi Categoria/Dipendente dipendono da questo fix)
```

---

## TASK 0.2: Verifica ScheduledMaintenanceCard

**Priority**: MEDIUM
**Time**: 20min
**Dependencies**: None

### Obiettivo
Verificare 2 claims in componente manutenzioni programmate:
1. Pulsante "Completa" mancante nelle card
2. Espansione card non funzionante

### Sub-Tasks

#### Claim 1: Pulsante "Completa" Mancante

**Comando Verifica**:
```bash
# Cerca pulsante completa
grep -n "complet\|Complet\|button.*onClick" src/features/dashboard/components/ScheduledMaintenanceCard.tsx | head -20
```

**Output Atteso**: Nessun pulsante "Completa" o "onClick.*complete" trovato

**Verify**:
- ✅ CONFIRMED se pulsante non esiste
- ❌ REJECTED se pulsante presente e funzionante

**Root Cause se CONFIRMED**: Pulsante non implementato in card

**Screenshot Richiesto**: Card manutenzione senza pulsante azione

---

#### Claim 2: Card Non Espandibile

**Comando Verifica**:
```bash
# Cerca stato expanded o onClick per espansione
grep -n "expanded\|onClick.*expand\|collaps" src/features/dashboard/components/ScheduledMaintenanceCard.tsx | head -20
```

**Output Atteso**: Nessun meccanismo espansione trovato

**Verify**:
- ✅ CONFIRMED se meccanismo non esiste
- ❌ REJECTED se espansione funzionante

**Screenshot Richiesto**: Click su card → nessuna espansione

---

### Acceptance Criteria

- [ ] Entrambi claims verificati
- [ ] Screenshot se confermati
- [ ] Raccomandazioni per Worker 3

### Output

Sezione in `VERIFICATION_REPORT.md` con claims confermati/rigettati

---

## TASK 0.3: Verifica TasksStep Reparto

**Priority**: HIGH
**Time**: 15min
**Dependencies**: None

### Obiettivo
Verificare claim: Campo Reparto mancante in modal onboarding (TasksStep)

### Comando Verifica

```bash
# Cerca campo reparto o department nel TasksStep
grep -n -i "reparto\|department" src/components/onboarding-steps/TasksStep.tsx | head -30
```

**Output Atteso**: Nessun campo reparto trovato nel form manutenzioni

**Verify**:
- ✅ CONFIRMED se campo mancante
- ❌ REJECTED se campo presente

**Confronto**: AddPointModal HA campo reparto, TasksStep NO

---

### Acceptance Criteria

- [ ] Claim verificato
- [ ] Confronto con AddPointModal documentato
- [ ] Raccomandazione per Worker 1

### Output

Sezione in `VERIFICATION_REPORT.md`

---

## TASK 0.4: Verifica ConservationPointCard

**Priority**: LOW
**Time**: 15min
**Dependencies**: None

### Obiettivo
Verificare claim: Elementi mancanti da ConservationPointCard

### Comando Verifica

```bash
# Leggi componente completo
cat src/features/conservation/components/ConservationPointCard.tsx | head -100
```

**Elementi da Verificare** (da documentazione):
1. Nome punto
2. Reparto
3. Tipo (frigorifero/freezer/ambiente/abbattitore)
4. Temperatura target
5. Stato (badge colorato)
6. Ultima lettura temperatura
7. Categorie prodotti associate

**Verify**: Confronta elementi presenti vs documentazione

---

### Acceptance Criteria

- [ ] Tutti elementi verificati
- [ ] Lista elementi mancanti (se applicabile)

### Output

Sezione in `VERIFICATION_REPORT.md`

---

## TASK 0.5: Scrivi VERIFICATION_REPORT e Verdict

**Priority**: CRITICAL
**Time**: 30min
**Dependencies**: Tasks 0.1-0.4 COMPLETED

### Obiettivo
Consolidare tutte le verifiche in report finale con verdict

### Template Report

File: `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/VERIFICATION_REPORT_20260111.md`

```markdown
# VERIFICATION REPORT - Conservation Audit

**Data**: 2026-01-11
**Worker**: 0 (Audit Specialist)
**Audit Source**: 00_MASTER_INDEX.md - Bug & Fix Log

---

## VERIFIED ISSUES (Problemi Confermati)

[Sezione con problemi ✅ CONFIRMED da Tasks 0.1-0.4]

### 1. [Nome Problema] - ✅ CONFIRMED (SEVERITY)

**Claim Originale**: [...]
**Evidenza**: [...]
**Root Cause**: [...]
**Recommendation for Workers**: [...]
**Severity**: [CRITICAL/HIGH/MEDIUM]
**Blocca**: [task dipendenti]

---

## FALSE POSITIVES (Problemi Rigettati)

[Sezione con problemi ❌ REJECTED da Tasks 0.1-0.4]

### 1. [Nome Problema] - ❌ REJECTED

**Claim Originale**: [...]
**Motivo Rigetto**: [...]
**Note**: [...]

---

## SUMMARY

**Totale Problemi Audit**: 8
**Confermati**: [N] ([%])
**Rigettati**: [N] ([%])

**Breakdown per Severity**:
- 🔴 CRITICAL: [N] problemi
- 🟡 HIGH: [N] problemi
- 🟢 MEDIUM: [N] problemi

**Raccomandazioni**:
1. Worker 1 deve fixare [N] problemi UI (Task 1.5, 1.4, 1.6)
2. Worker 3 deve fixare [N] problemi Maintenance (Task 3.4, 3.5)
3. Priority order: Task 1.5 (ROOT CAUSE) → Task 1.4 → ...

**Next Steps**:
- FASE 1: Workers 1-3 fixano problemi confermati
- Priority: Task 1.5 è BLOCKER per Task 1.4

---

## FINAL VERDICT

### ✅ APPROVED - Procedi a FASE 1

**Justification**:
- [N] problemi confermati con evidenza
- [N] problemi critici richiedono fix immediato
- Workers 1-3 hanno task chiare da VERIFICATION_REPORT

**Workers Assigned**:
- Worker 1: [N] task
- Worker 2: SKIP (nessun problema DB)
- Worker 3: [N] task
- Worker 4: Integration dopo FASE 1

---

oppure

### ❌ STOP - Workflow Terminato

**Justification**:
- Nessun problema confermato
- Tutti claims erano falsi positivi
- No fix necessario

**Recommendation**: Chiudi issue audit report con motivazione
```

---

### Acceptance Criteria

- [ ] Tutte verifiche consolidate
- [ ] Summary con totali corretti
- [ ] Verdict chiaro: APPROVED / STOP
- [ ] Se APPROVED: worker assignments chiari
- [ ] File salvato in cartella Conservation

---

# FASE 1: FIX (Workers 1-3)

**PREREQUISITO**: Worker 0 completato con verdict APPROVED

---

## WORKER 1: UI/Forms

### TASK 1.5: Fix Select Ruolo (ROOT CAUSE)

**Priority**: CRITICAL
**Time**: 45min
**Dependencies**: Task 0.1 APPROVED
**Blocca**: Task 1.4

### Problema

Select "Assegnato a Ruolo" usa `<select>` HTML nativo invece `<Select>` component UI → non risponde ai click

### File da Modificare

`src/features/conservation/components/AddPointModal.tsx` (linee 186-203)

### Implementation (TDD Workflow)

#### 1. RED - Scrivi Test che Fallisce

File: `src/features/conservation/components/__tests__/AddPointModal.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPointModal } from '../AddPointModal'

describe('AddPointModal - Select Ruolo', () => {
  test('Select ruolo permette selezione opzione', async () => {
    const mockUpdate = vi.fn()

    render(
      <AddPointModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        // ... altre props
      />
    )

    // Trova select ruolo nella prima manutenzione
    const select = screen.getByLabelText(/Assegnato a Ruolo/i)

    // Click per aprire dropdown
    await userEvent.click(select)

    // Click su opzione "Dipendente"
    await userEvent.click(screen.getByText('Dipendente'))

    // Verifica che selezione triggera update
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.any(Number),
      'assegnatoARuolo',
      'dipendente'
    )
  })
})
```

#### 2. GREEN - Implementa Fix Minimo

**PRIMA (SBAGLIATO)**:
```typescript
<select
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
  value={task.assegnatoARuolo || ''}
  onChange={(e) => updateTask(index, 'assegnatoARuolo', e.target.value)}
>
  <option value="">Seleziona ruolo...</option>
  {STAFF_ROLES.map(role => (
    <option key={role.value} value={role.value}>
      {role.label}
    </option>
  ))}
</select>
```

**DOPO (CORRETTO)**:
```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

<Select
  value={task.assegnatoARuolo || ''}
  onValueChange={(value) => updateTask(index, 'assegnatoARuolo', value as StaffRole)}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Seleziona ruolo..." />
  </SelectTrigger>
  <SelectContent>
    {STAFF_ROLES.map(role => (
      <SelectItem key={role.value} value={role.value}>
        {role.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Pattern Riferimento**: `src/components/onboarding-steps/TasksStep.tsx` linee 680-698

#### 3. REFACTOR - Cleanup

- Rimuovi import `<select>` non necessari
- Verifica consistency con altri Select nel componente
- Check naming conventions

#### 4. VERIFY - Nessuna Regressione

```bash
# Test questo componente
npm run test -- AddPointModal

# Tutti test dell'app
npm run test

# Type-check
npm run type-check
```

---

### Acceptance Criteria

- [ ] Test RED → GREEN
- [ ] Select cliccabile e funzionante
- [ ] Opzioni visibili nel dropdown
- [ ] Selezione triggera `updateTask` correttamente
- [ ] **Campi Categoria/Dipendente appaiono dopo selezione** (verifica prerequisito Task 1.4)
- [ ] Nessuna regressione (test pre-esistenti passano)
- [ ] Type-check → 0 nuovi errori

---

### TASK 1.4: Verifica Categoria/Dipendente Visibili

**Priority**: CRITICAL
**Time**: 1h
**Dependencies**: Task 1.5 COMPLETED (**BLOCKER ASSOLUTO**)

### Problema

Campi "Categoria Staff" e "Dipendente Specifico" esistono (linee 207-265) ma non appaiono dopo selezione ruolo

**Root Cause**: Dipende da Task 1.5 (select ruolo non funziona → `task.assegnatoARuolo` non popolato → condizione `{task.assegnatoARuolo && ...}` non soddisfatta)

### File da Verificare

`src/features/conservation/components/AddPointModal.tsx` (linee 207-265)

### Implementation (TDD Workflow)

#### 1. RED - Test che Fallisce

```typescript
test('Campi Categoria/Dipendente visibili dopo selezione ruolo', async () => {
  render(<AddPointModal isOpen={true} ... />)

  // PRIMA selezione: campi assenti
  expect(screen.queryByLabelText('Categoria Staff')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Dipendente Specifico')).not.toBeInTheDocument()

  // Seleziona ruolo "Dipendente"
  const selectRuolo = screen.getByLabelText(/Assegnato a Ruolo/i)
  await userEvent.click(selectRuolo)
  await userEvent.click(screen.getByText('Dipendente'))

  // DOPO selezione: campi presenti
  expect(screen.getByLabelText('Categoria Staff')).toBeInTheDocument()
  expect(screen.getByLabelText('Dipendente Specifico')).toBeInTheDocument()
})
```

#### 2. GREEN - Verifica Fix

**DOPO Task 1.5, codice dovrebbe funzionare automaticamente**:

```typescript
{task.assegnatoARuolo && (
  <div>
    <Label>Categoria Staff</Label>
    <Select ... />  {/* DEVE apparire dopo fix 1.5 */}
  </div>
)}

{task.assegnatoARuolo && (
  <div>
    <Label>Dipendente Specifico</Label>
    <Select ... />  {/* DEVE apparire dopo fix 1.5 */}
  </div>
)}
```

**SE campi NON appaiono**:
- Debug: `console.log('task.assegnatoARuolo:', task.assegnatoARuolo)`
- Verifica che Task 1.5 ha popolato correttamente lo stato
- Verifica condizione `{task.assegnatoARuolo && ...}`

#### 3. Test Filtri Staff

```typescript
test('Categoria filtra staff per ruolo selezionato', async () => {
  // Seleziona ruolo "Dipendente"
  // Seleziona categoria "Cucina"
  // Verifica che dropdown Dipendente mostra solo staff ruolo=dipendente + categoria=cucina
})

test('Dipendente filtra per ruolo + categoria', async () => {
  // Seleziona ruolo + categoria
  // Verifica che dropdown Dipendente è filtrato correttamente
})
```

---

### Acceptance Criteria

- [ ] Test GREEN dopo fix Task 1.5
- [ ] Campi appaiono automaticamente dopo selezione ruolo
- [ ] Filtro staff per ruolo funziona
- [ ] Filtro staff per categoria funziona
- [ ] Test E2E: Seleziona ruolo → Vedi categoria → Vedi staff filtrato
- [ ] Nessuna regressione

---

### TASK 1.6: Aggiungere Reparto in TasksStep

**Priority**: MEDIUM
**Time**: 30min
**Dependencies**: Task 0.3 APPROVED

**⚠️ SKIP se Worker 0 rigetta claim**

### Problema

Campo Reparto mancante in modal onboarding (TasksStep) per configurazione manutenzioni

### File da Modificare

`src/components/onboarding-steps/TasksStep.tsx`

### Implementation

Aggiungi select Reparto nel MaintenanceAssignmentForm:

```typescript
<div>
  <Label>Reparto *</Label>
  <Select
    value={plan.departmentId || ''}
    onValueChange={value => updatePlan(index, { departmentId: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Seleziona reparto..." />
    </SelectTrigger>
    <SelectContent>
      {departments.map(dept => (
        <SelectItem key={dept.id} value={dept.id}>
          {dept.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Acceptance Criteria

- [ ] Campo presente e funzionante
- [ ] Validazione appropriata
- [ ] Test pass

---

# FASE 2: INTEGRATION (Worker 4)

**PREREQUISITO**: Workers 1-3 COMPLETED + Test GREEN

---

## TASK 4.1: Test E2E Flusso Manutenzioni

**Priority**: HIGH
**Time**: 1.5h
**Dependencies**: Tasks 1.4, 1.5 COMPLETED

### Obiettivo

Test end-to-end che verifica:
1. Select ruolo funzionante (Task 1.5)
2. Campi Categoria/Dipendente appaiono (Task 1.4)
3. Flusso completo: Crea punto → Configura manutenzioni → Verifica DB

### File da Creare

`tests/conservation/e2e-flow-complete.spec.ts`

### Implementation (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Conservation - Flusso Manutenzioni Completo', () => {
  test('Crea punto → Assegna manutenzioni con select funzionante', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // 2. Naviga Conservation
    await page.goto('/conservation')
    await page.waitForSelector('[data-testid="conservation-page"]')

    // 3. Apri modal AddPoint
    await page.click('button:has-text("Aggiungi Punto")')
    await page.waitForSelector('[data-testid="add-point-modal"]')

    // 4. Compila form base
    await page.fill('input[name="name"]', 'Test Frigo E2E Complete')
    await page.selectOption('select[name="department"]', { label: 'Cucina' })
    await page.fill('input[name="temperature"]', '4')

    // 5. Seleziona categoria prodotto
    await page.click('button:has-text("Carni fresche")')

    // 6. Configura manutenzione 1: Rilevamento Temperatura
    const maint1 = page.locator('[data-maintenance="rilevamento_temperatura"]')

    // ⚠️ CRITICAL TEST: SELECT RUOLO DEVE FUNZIONARE
    await page.screenshot({ path: 'test-evidence/before-select-ruolo.png' })
    await maint1.locator('[data-testid="ruolo-select"]').click()
    await page.click('text=Dipendente')
    await page.screenshot({ path: 'test-evidence/after-select-ruolo.png' })

    // ⚠️ CRITICAL TEST: CAMPI CATEGORIA/DIPENDENTE DEVONO APPARIRE
    await expect(maint1.locator('[data-testid="categoria-select"]')).toBeVisible()
    await page.screenshot({ path: 'test-evidence/categoria-visible.png' })

    await maint1.locator('[data-testid="categoria-select"]').click()
    await page.click('text=Cucina')

    await expect(maint1.locator('[data-testid="dipendente-select"]')).toBeVisible()
    await page.screenshot({ path: 'test-evidence/dipendente-visible.png' })

    await maint1.locator('[data-testid="dipendente-select"]').click()
    await page.click('text=Mario Rossi')

    // 7. Configura frequenza
    await maint1.locator('select[name="frequenza"]').selectOption('mensile')

    // 8. Configura altre 3 manutenzioni (sanificazione, sbrinamento, controllo scadenze)
    // [... codice simile per maint2, maint3, maint4 ...]

    // 9. Salva punto
    await page.screenshot({ path: 'test-evidence/before-save.png' })
    await page.click('button:has-text("Salva")')

    // 10. Verifica successo
    await expect(page.locator('text=Punto creato con successo')).toBeVisible({ timeout: 5000 })
    await page.screenshot({ path: 'test-evidence/punto-creato.png' })

    // 11. Verifica database tramite API
    const response = await page.request.get('/api/conservation-points?name=Test Frigo E2E Complete')
    const data = await response.json()

    expect(data).toBeTruthy()
    expect(data.name).toBe('Test Frigo E2E Complete')
    expect(data.maintenanceTasks).toHaveLength(4)
    expect(data.maintenanceTasks[0].assigned_to_role).toBe('dipendente')
    expect(data.maintenanceTasks[0].assigned_to_category).toBe('cucina')
    expect(data.maintenanceTasks[0].assigned_to_user_id).toBeTruthy()

    // 12. Cleanup: elimina punto creato
    await page.request.delete(`/api/conservation-points/${data.id}`)
  })
})
```

---

### Acceptance Criteria

- [ ] Test passa end-to-end
- [ ] Screenshot salvati ad ogni step critico
- [ ] Database verifica: 1 punto + 4 manutenzioni inserite
- [ ] UI verifica: manutenzioni visibili in ScheduledMaintenanceCard
- [ ] Tempo esecuzione < 10s
- [ ] Cleanup automatico (punto eliminato)

---

## TASK 4.2: Test Performance

**Priority**: MEDIUM
**Time**: 45min
**Dependencies**: None

### Obiettivo

Testare performance caricamento pagina Conservation con 100 punti + 400 manutenzioni

### Seed Script

File: `database/test_data/seed_conservation_performance.sql`

```sql
-- Seed 100 conservation points + 400 maintenance tasks
-- Tempo esecuzione: ~5s

DO $$
DECLARE
  company_id_var UUID;
  dept_id UUID;
  point_id UUID;
  i INTEGER;
BEGIN
  -- Get test company
  SELECT id INTO company_id_var FROM companies WHERE name = 'Test Company' LIMIT 1;
  SELECT id INTO dept_id FROM departments WHERE company_id = company_id_var LIMIT 1;

  -- Seed 100 conservation points
  FOR i IN 1..100 LOOP
    INSERT INTO conservation_points (
      company_id, department_id, name, type, setpoint_temp
    ) VALUES (
      company_id_var, dept_id, 'Test Frigo ' || i, 'fridge', 4
    ) RETURNING id INTO point_id;

    -- 4 maintenance tasks per point
    INSERT INTO maintenance_tasks (
      company_id, conservation_point_id, task_type, frequency, assigned_to_role, next_due
    ) VALUES
      (company_id_var, point_id, 'rilevamento_temperatura', 'daily', 'dipendente', NOW() + INTERVAL '1 day'),
      (company_id_var, point_id, 'sanificazione', 'weekly', 'dipendente', NOW() + INTERVAL '7 days'),
      (company_id_var, point_id, 'sbrinamento', 'monthly', 'responsabile', NOW() + INTERVAL '30 days'),
      (company_id_var, point_id, 'controllo_scadenze', 'daily', 'dipendente', NOW() + INTERVAL '1 day');
  END LOOP;
END $$;
```

### Test Performance

File: `tests/conservation/performance.spec.ts`

```typescript
test('Performance: caricamento 400 manutenzioni < 500ms', async ({ page }) => {
  // Prerequisito: esegui seed script
  await execSQL('database/test_data/seed_conservation_performance.sql')

  // Misura tempo query
  const queryStart = performance.now()
  await page.goto('/conservation')
  await page.waitForSelector('[data-testid="maintenance-card"]')
  const queryTime = performance.now() - queryStart

  expect(queryTime).toBeLessThan(500) // <500ms per query

  // Misura tempo render
  const cards = await page.locator('[data-testid="maintenance-card"]').count()
  expect(cards).toBeGreaterThan(0)

  // Cleanup
  await execSQL('DELETE FROM conservation_points WHERE name LIKE "Test Frigo %"')
})

test('Performance: navigazione sezioni < 200ms', async ({ page }) => {
  await page.goto('/conservation')

  // Misura tempo switch sezione
  const start = performance.now()
  await page.click('button:has-text("Letture Temperature")')
  await page.waitForSelector('[data-testid="temperature-readings"]')
  const switchTime = performance.now() - start

  expect(switchTime).toBeLessThan(200) // <200ms per switch
})
```

---

### Acceptance Criteria

- [ ] Seed script crea 100 punti + 400 manutenzioni
- [ ] Query time < 500ms
- [ ] Render time < 1000ms
- [ ] Navigazione sezioni < 200ms
- [ ] Cleanup automatico

---

# FASE 3: FINAL VERIFICATION (Worker 5 - Supervisor)

**PREREQUISITO**: Workers 0-4 COMPLETED

---

## TASK 5.1: Final Quality Check

**Priority**: CRITICAL
**Time**: 1h
**Dependencies**: ALL Workers 0-4 COMPLETED

### Obiettivo

Eseguire GATE FUNCTION completa: 7 comandi FRESH che verificano TUTTO

### Checklist GATE FUNCTION

#### 1. TypeScript Check

```bash
npm run type-check 2>&1 | tee logs/type-check.log
```

**✅ PASS se**:
- 0 errors (o solo pre-esistenti documentati)
- Nessun nuovo errore correlato a Conservation

**❌ FAIL se**:
- Nuovi errori TypeScript
- Errori in file modificati da Workers 1-3

---

#### 2. Lint Check

```bash
npm run lint 2>&1 | tee logs/lint.log
```

**✅ PASS se**:
- 0 errors
- Warnings pre-esistenti OK

**❌ FAIL se**:
- Nuovi errori lint

---

#### 3. Build Check

```bash
npm run build 2>&1 | tee logs/build.log
```

**✅ PASS se**:
- Build completa con SUCCESS
- No errori critici

**❌ FAIL se**:
- Build fallisce

---

#### 4. Unit Tests

```bash
npm run test 2>&1 | tee logs/test.log
```

**✅ PASS se**:
- Tutti test passano
- Conservation tests: AddPointModal, useMaintenanceTasks GREEN

**❌ FAIL se**:
- Almeno un test FAIL
- Regressioni in test pre-esistenti

---

#### 5. E2E Tests

```bash
npm run test:e2e -- conservation 2>&1 | tee logs/e2e.log
```

**✅ PASS se**:
- Test 4.1 (flusso manutenzioni) PASS
- Test 4.2 (performance) PASS

**❌ FAIL se**:
- E2E falliscono

---

#### 6. Database Integrity

```bash
node scripts/verify-conservation-db.js 2>&1 | tee logs/db-check.log
```

**✅ PASS se**:
- 0 orphan points
- 0 orphan temperature_readings
- Migrations 015, 016 applicate

**❌ FAIL se**:
- Orphan records
- Migrations mancanti

---

#### 7. Performance (Opzionale)

```bash
npm run test:performance 2>&1 | tee logs/perf.log
```

**✅ PASS se**:
- All benchmarks within thresholds

---

### Deliverable

File: `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/SUPERVISOR_FINAL_REPORT_20260111.md`

[Usa template completo da WORKER_PROMPTS.md - Worker 5]

---

### Acceptance Criteria

- [ ] Tutti 7 comandi eseguiti FRESH
- [ ] Output salvato in file log
- [ ] Verdict chiaro: APPROVED / REJECTED
- [ ] Se REJECTED: action items dettagliati con Worker responsabile + ETA
- [ ] Se APPROVED: merge instructions complete

---

**Fine TASKS.md v2.0**
