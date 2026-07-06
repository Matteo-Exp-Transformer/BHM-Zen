# PIANO FIX CONSOLIDATO - Conservation Feature
## Data: 2026-01-14
## Versione: 4.0 (Post-Analisi Codice Reale)

---

## EXECUTIVE SUMMARY

### STATO REALE DEL CODICE (Verificato 2026-01-14)

L'analisi approfondita del codice ha rivelato che **la maggior parte delle funzionalità è GIÀ IMPLEMENTATA**, contrariamente a quanto indicato nei report precedenti.

| Funzionalità | Status Precedente | Status Reale | Evidenza |
|--------------|-------------------|--------------|----------|
| MiniCalendar | NON COMPLETATA | ✅ IMPLEMENTATA | AddPointModal.tsx:20,430,444 |
| Giorni settimana (calendar_settings) | NON COMPLETATA | ✅ IMPLEMENTATA | AddPointModal.tsx:175-203 |
| Raggruppamento per tipo | NON COMPLETATA | ✅ IMPLEMENTATA | ScheduledMaintenanceCard.tsx:204 |
| Select z-index | DA VERIFICARE | ✅ CORRETTO | AddPointModal.tsx z-[10000] |
| Visualizzazione assegnazione | PARZIALE | ✅ IMPLEMENTATA | ScheduledMaintenanceCard.tsx:174-201 |
| Filtro completate | PARZIALE | ✅ IMPLEMENTATA | ScheduledMaintenanceCard.tsx:137 |
| Salvataggio temperatura | DA VERIFICARE | ✅ IMPLEMENTATA | useTemperatureReadings.ts:73-83 |
| @ts-ignore | PRESENTE | ✅ RISOLTO | grep: 0 matches |
| Constant conditions | PRESENTE | ✅ RISOLTO | grep: 0 illegittime |

### PROBLEMI REALI IDENTIFICATI

| # | Problema | Severità | File | Fix Necessario |
|---|----------|----------|------|----------------|
| 1 | Enum MaintenanceFrequency con valori extra | MEDIUM | types/conservation.ts:138-146 | Rimuovere 'quarterly','biannually','as_needed','custom' |
| 2 | Migration 015 potrebbe non essere applicata | HIGH | Database Supabase | Verificare e applicare |
| 3 | Test AddPointModal falliti (selector ambiguo) | MEDIUM | __tests__/AddPointModal.test.tsx | Fix selector |
| 4 | TypeScript errors in altri moduli | LOW | inventory/management/settings | Out of scope |

---

## FASI DI LAVORO

### FASE 0 - VERIFICHE PRELIMINARI (Worker 5 - Supervisor)
**Tempo stimato: 30 min**
**Gate: Nessuno (verifica)**

### FASE 1 - FIX TECNICI (Worker 1-2)
**Tempo stimato: 2h**
**Gate: Build + Lint + Type-check**

### FASE 2 - FIX TEST (Worker 3)
**Tempo stimato: 1h**
**Gate: Test unit pass**

### FASE 3 - VERIFICA RUNTIME (Worker 4)
**Tempo stimato: 1h**
**Gate: Test E2E**

### GATE FINALE - APPROVAZIONE (Worker 5)
**Tempo stimato: 30 min**

---

## PROMPT WORKER SEQUENZIALI

---

### WORKER 5 - PROMPT 0: VERIFICA PRELIMINARE

```markdown
# WORKER 5 - Task 0: Verifica Stato Database

## OBIETTIVO
Verificare che la Migration 015 sia stata applicata al database Supabase.

## CONTESTO
I problemi runtime segnalati dall'utente (PGRST204) potrebbero essere causati da migration non applicata.

## AZIONI

### 1. Esegui script di verifica DB
```bash
cd "c:\Users\matte.MIO\Documents\GitHub\BHM-v.2"
node scripts/verify-conservation-db.js
```

### 2. Se migration NON applicata, esegui in Supabase SQL Editor:
```sql
-- Verifica campi esistenti
SELECT column_name FROM information_schema.columns
WHERE table_name = 'temperature_readings';

-- Se mancano method, notes, photo_evidence, recorded_by:
ALTER TABLE temperature_readings
ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'digital_thermometer',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS photo_evidence TEXT,
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);
```

### 3. Documenta risultato
- [ ] Migration 015 applicata: SI / NO
- [ ] Campi presenti: method, notes, photo_evidence, recorded_by

## OUTPUT
File: `VERIFICA_DB_RESULT.md` con esito verifica
```

---

### WORKER 1 - PROMPT 1: FIX ENUM TYPE

```markdown
# WORKER 1 - Task 1.1: Fix MaintenanceFrequency Enum

## OBIETTIVO
Rimuovere i valori non usati dall'enum MaintenanceFrequency per allineamento con il form.

## FILE DA MODIFICARE
`src/types/conservation.ts`

## CODICE ATTUALE (linee 138-146)
```typescript
export type MaintenanceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'      // NON USATO NEL FORM
  | 'biannually'     // NON USATO NEL FORM
  | 'annually'
  | 'as_needed'      // NON USATO NEL FORM
  | 'custom'         // VIETATO DALLE SPECIFICHE
```

## CODICE CORRETTO
```typescript
export type MaintenanceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annually'
```

## VERIFICA POST-FIX
```bash
npm run type-check 2>&1 | grep -i "conservation"
```
Se ci sono errori relativi a MaintenanceFrequency, significa che qualche file usa i valori rimossi - in tal caso aggiornare anche quei file.

## ACCEPTANCE CRITERIA
- [ ] Enum ridotto a 4 valori
- [ ] Nessun errore TypeScript in conservation/
- [ ] Build passa
```

---

### WORKER 1 - PROMPT 2: VERIFICA SELECT UI

```markdown
# WORKER 1 - Task 1.2: Verifica Select UI Runtime

## OBIETTIVO
Verificare che i Select Radix UI funzionino correttamente in AddPointModal.

## CONTESTO
L'utente segnala che "Select Ruolo non funziona". Il codice mostra z-[10000] corretto.
Possibili cause:
1. SelectPortal non funziona in modal
2. CSS override
3. Browser-specific issue

## VERIFICA

### 1. Controlla che SelectContent usi portal
File: `src/features/conservation/components/AddPointModal.tsx`
```typescript
// Linea 276, 302, 331 - verificare che ci sia:
<SelectContent className="z-[10000]">
```

### 2. Verifica che Select.tsx usi Portal
File: `src/components/ui/Select.tsx`
```typescript
// Deve contenere:
import * as SelectPrimitive from '@radix-ui/react-select'

// SelectContent deve usare Portal:
<SelectPrimitive.Portal>
  <SelectPrimitive.Content ...>
```

### 3. Se Portal mancante, aggiungilo:
```typescript
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-[10000] max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        className
      )}
      position={position}
      {...props}
    >
      {children}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
```

## ACCEPTANCE CRITERIA
- [ ] SelectContent usa Portal
- [ ] z-index >= 10000
- [ ] Test manuale: Select si apre sopra modal
```

---

### WORKER 2 - PROMPT 1: FIX CACHE INVALIDATION

```markdown
# WORKER 2 - Task 2.1: Fix Cache Invalidation

## OBIETTIVO
Assicurare che dopo completamento manutenzione la cache React Query sia invalidata.

## CONTESTO
L'utente segnala: "Manutenzione completata rimane visibile".
Il filtro c'è (linea 137), quindi il problema potrebbe essere cache.

## VERIFICA

### 1. Controlla invalidazione in useMaintenanceTasks
File: `src/features/conservation/hooks/useMaintenanceTasks.ts`

```typescript
// Cerca la mutation completeTask
// Deve avere onSuccess con invalidateQueries:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
  queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
}
```

### 2. Se mancante, aggiungi invalidazione
```typescript
const completeTaskMutation = useMutation({
  mutationFn: async (taskId: string) => {
    // ... mutation logic
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['maintenance-completions'] })
    queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
  }
})
```

### 3. Verifica anche in ScheduledMaintenanceCard
File: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`
Il componente deve chiamare refetch o la mutation deve invalidare.

## ACCEPTANCE CRITERIA
- [ ] completeTaskMutation ha invalidateQueries in onSuccess
- [ ] Tutte le query key rilevanti invalidate
- [ ] Test: dopo completamento, lista si aggiorna automaticamente
```

---

### WORKER 2 - PROMPT 2: VERIFICA DB SCHEMA

```markdown
# WORKER 2 - Task 2.2: Verifica e Applica Migration

## OBIETTIVO
Assicurare che il database abbia tutti i campi necessari.

## SQL DA ESEGUIRE IN SUPABASE

### 1. Verifica campi temperature_readings
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'temperature_readings'
ORDER BY ordinal_position;
```

**Campi attesi:**
- id, company_id, conservation_point_id, temperature, recorded_at, created_at
- method (VARCHAR, DEFAULT 'digital_thermometer')
- notes (TEXT)
- photo_evidence (TEXT)
- recorded_by (UUID)

### 2. Se campi mancanti, applica migration
```sql
ALTER TABLE temperature_readings
ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'digital_thermometer',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS photo_evidence TEXT,
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);
```

### 3. Verifica campi maintenance_tasks
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'maintenance_tasks'
ORDER BY ordinal_position;
```

**Campi attesi per assegnazione:**
- assigned_to_role (VARCHAR)
- assigned_to_category (VARCHAR)
- assigned_to_staff_id (UUID)
- assignment_type (VARCHAR)

### 4. Test insert temperatura
```sql
INSERT INTO temperature_readings (
  company_id, conservation_point_id, temperature, recorded_at,
  method, notes
) VALUES (
  'YOUR_COMPANY_ID'::uuid,
  'YOUR_POINT_ID'::uuid,
  4.5,
  now(),
  'digital_thermometer',
  'Test'
) RETURNING *;
```

## OUTPUT
Documenta in `DB_VERIFICATION_RESULT.md`:
- Campi presenti/mancanti
- Migration applicate
- Test insert result
```

---

### WORKER 3 - PROMPT 1: FIX TEST SELECTOR

```markdown
# WORKER 3 - Task 3.1: Fix Test AddPointModal

## OBIETTIVO
Risolvere i 3 test falliti in AddPointModal.test.tsx causati da selector ambiguo.

## ERRORE ATTUALE
```
Found multiple elements with the text: /Frequenza/i
```

## FILE DA MODIFICARE
`src/features/conservation/components/__tests__/AddPointModal.test.tsx`

## FIX

### 1. Usa selector più specifico invece di getByText
```typescript
// PRIMA (ambiguo):
const frequenzaSelect = screen.getByText(/Frequenza/i)

// DOPO (specifico):
const frequenzaSelect = screen.getByRole('combobox', { name: /frequenza/i })
// oppure
const frequenzaSelect = screen.getByLabelText(/Frequenza/i)
// oppure usa data-testid
const frequenzaSelect = screen.getByTestId('frequenza-select')
```

### 2. Se servono data-testid, aggiungili nel componente
In AddPointModal.tsx:
```typescript
<select
  data-testid="frequenza-select"
  value={task.frequenza}
  ...
>
```

### 3. Riesegui test specifici
```bash
npm run test -- --run AddPointModal
```

## ACCEPTANCE CRITERIA
- [ ] Tutti i test AddPointModal passano (13/13)
- [ ] Nessun selector ambiguo
- [ ] Test stabili (non flaky)
```

---

### WORKER 3 - PROMPT 2: FIX TEST TYPES

```markdown
# WORKER 3 - Task 3.2: Fix TypeScript Errors nei Test

## OBIETTIVO
Risolvere errori TypeScript nei file test di conservation.

## FILE DA CONTROLLARE
1. `src/features/conservation/components/__tests__/AddPointModal.test.tsx`
2. `src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx`

## ERRORI COMUNI E FIX

### 1. MaintenanceTask type mismatch
```typescript
// ERRORE: assigned_to_staff_id: null vs string | undefined
// FIX: usa undefined invece di null
const mockTask: MaintenanceTask = {
  // ...
  assigned_to_staff_id: undefined,  // NON null
}
```

### 2. Missing properties in mock
```typescript
// ERRORE: Missing 'total' in MaintenanceStats
// FIX: aggiungi proprietà mancante
const mockStats: MaintenanceStats = {
  total_tasks: 10,
  completed_tasks: 5,
  // ... altre proprietà richieste
}
```

### 3. Status type mismatch
```typescript
// ERRORE: Type '"completed"' not assignable
// FIX: usa il tipo corretto
status: 'completed' as const,
// oppure
status: 'completed' as MaintenanceTask['status'],
```

## VERIFICA
```bash
npm run type-check 2>&1 | grep -E "(AddPointModal|ScheduledMaintenance)"
```

## ACCEPTANCE CRITERIA
- [ ] 0 errori TypeScript nei file test conservation
- [ ] Test compilano correttamente
```

---

### WORKER 4 - PROMPT 1: TEST E2E

```markdown
# WORKER 4 - Task 4.1: Esegui Test E2E Conservation

## OBIETTIVO
Eseguire e verificare i test E2E per la feature conservation.

## FILE TEST ESISTENTI
- `tests/conservation/e2e-flow.spec.ts`
- `tests/conservation/completamento-feature-e2e.spec.ts`
- `tests/conservation/e2e-integration-verification.spec.ts`

## ESECUZIONE

### 1. Avvia dev server
```bash
npm run dev
```

### 2. Esegui test E2E conservation
```bash
npx playwright test tests/conservation/ --headed
```

### 3. Se test falliscono, documenta:
- Screenshot errore
- Console log
- Causa probabile

### 4. Fix test se necessario
- Aggiorna selector se UI è cambiata
- Aggiorna wait/timeout se necessario
- Aggiorna mock data se schema è cambiato

## ACCEPTANCE CRITERIA
- [ ] Tutti i test E2E conservation passano
- [ ] Screenshot success salvati
- [ ] Report generato
```

---

### WORKER 5 - PROMPT FINALE: GATE APPROVAZIONE

```markdown
# WORKER 5 - GATE FINALE: Quality Check

## OBIETTIVO
Verificare che tutti i fix siano stati applicati e approvare per merge.

## CHECKLIST

### Build & Quality
```bash
npm run build 2>&1 | tee build-final.log
npm run lint 2>&1 | tee lint-final.log
npm run type-check 2>&1 | tee type-check-final.log
```

### Test
```bash
npm run test -- --run 2>&1 | tee test-final.log
npx playwright test tests/conservation/ 2>&1 | tee e2e-final.log
```

### Verifica Specifiche

| Check | Command/File | Expected |
|-------|--------------|----------|
| Build | npm run build | Exit 0 |
| Lint Conservation | grep conservation lint-final.log | 0 errors |
| TypeScript Conservation | grep conservation type-check-final.log | 0 errors |
| Unit Tests | npm run test | All pass |
| E2E Tests | playwright test | All pass |
| Enum MaintenanceFrequency | types/conservation.ts | 4 valori |
| Migration 015 | DB check | Applicata |

## VERDICT

### APPROVED se:
- [ ] Build passa
- [ ] 0 errori lint in conservation/
- [ ] 0 errori TypeScript in conservation/
- [ ] Tutti unit test passano
- [ ] Tutti E2E test passano

### REJECTED se:
- Qualsiasi check fallisce
- Documentare problema e assegnare fix

## OUTPUT
File: `SUPERVISOR_FINAL_APPROVAL.md` con verdict APPROVED/REJECTED
```

---

## SEQUENZA ESECUZIONE

```
┌─────────────────────────────────────────────────────────────┐
│ WORKER 5 (Supervisor) - Prompt 0: Verifica DB               │
│ → Output: VERIFICA_DB_RESULT.md                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ WORKER 1 - Prompt 1: Fix Enum Type                          │
│ WORKER 1 - Prompt 2: Verifica Select UI                     │
│ → Output: Codice fixato                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (in parallelo)
┌─────────────────────────────────────────────────────────────┐
│ WORKER 2 - Prompt 1: Fix Cache Invalidation                 │
│ WORKER 2 - Prompt 2: Verifica/Applica Migration             │
│ → Output: DB_VERIFICATION_RESULT.md                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ WORKER 3 - Prompt 1: Fix Test Selector                      │
│ WORKER 3 - Prompt 2: Fix Test Types                         │
│ → Output: Test fixati                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ WORKER 4 - Prompt 1: Esegui Test E2E                        │
│ → Output: E2E report                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ ★ GATE FINALE ★                                             │
│ WORKER 5 (Supervisor) - Prompt Finale: Quality Check        │
│ → Output: SUPERVISOR_FINAL_APPROVAL.md (APPROVED/REJECTED)  │
└─────────────────────────────────────────────────────────────┘
```

---

## NOTE IMPORTANTI

### Cosa NON fare
- NON fixare errori TypeScript in altri moduli (inventory, management, settings) - out of scope
- NON modificare funzionalità già implementate (MiniCalendar, groupMaintenancesByType, ecc.)
- NON creare nuovi file di documentazione oltre a quelli specificati

### Cosa VERIFICARE prima di ogni fix
- Leggere il codice attuale prima di modificarlo
- Verificare che il "problema" esista davvero
- Testare manualmente dopo ogni modifica

### Acceptance Criteria Globali
1. Build passa (Exit 0)
2. 0 errori lint nei file conservation/
3. 0 errori TypeScript nei file conservation/
4. Tutti i test conservation passano
5. Migration 015 applicata al DB
6. Enum MaintenanceFrequency ha solo 4 valori

---

**Fine PIANO_FIX_CONSOLIDATO_20260114.md**
