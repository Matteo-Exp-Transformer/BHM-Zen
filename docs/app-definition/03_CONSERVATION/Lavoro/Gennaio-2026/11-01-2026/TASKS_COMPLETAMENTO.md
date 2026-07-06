# TASKS - Completamento Feature Conservation v3.0

**Data Creazione**: 2026-01-16
**Versione**: 3.0.0
**Motivo Aggiornamento**: Task dettagliate per completamento feature e fix identificati
**Fonte**: `STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md`

---

## ⚠️ IMPORTANTE PER GLI AGENTI

**SE SEI UN AGENT CHE DEVE ESEGUIRE QUESTE TASK**:

👉 **NON leggere direttamente questo file**. Questo è un documento di **RIFERIMENTO TECNICO**.

✅ **USA INVECE**: [PROMPTS_SEQUENZA_START.md](./PROMPTS_SEQUENZA_START.md)
   - Contiene i **PROMPT COMPLETI** pronti da copiare/incollare
   - Contiene le **10 REGOLE CRITICHE** obbligatorie
   - Contiene il **WORKFLOW STEP-BY-STEP** con comandi bash
   - Fa riferimento a questo file per i dettagli tecnici quando necessario

Questo file contiene i dettagli tecnici e template di codice che vengono referenziati dai prompt in PROMPTS_SEQUENZA_START.md.

---

## 📋 COME USARE QUESTO FILE

### Per Worker 1 (UI/Forms)
1. **PREREQUISITO**: Fase precedente COMPLETED
2. Leggi sezione corrispondente (FASE 1/2/3)
3. Segui TDD workflow: RED → GREEN → REFACTOR
4. Esegui comandi verifica dopo ogni task
5. Aggiorna progress quando completo

### Per Worker 2 (Database/Data)
1. **PREREQUISITO**: Fase precedente COMPLETED
2. Leggi sezione corrispondente (FASE 1/2)
3. Verifica query/codice esistente
4. Implementa modifiche necessarie
5. Test query e type-check

### Per Worker 3 (Maintenance/Logic)
1. **PREREQUISITO**: Fase precedente COMPLETED
2. Leggi sezione corrispondente (FASE 1/2/3)
3. Segui TDD workflow
4. Test logica e visualizzazione

### Per Worker 4 (Integration)
1. **PREREQUISITO**: Fase 3 COMPLETED
2. Leggi sezione FASE 4
3. Scrivi test E2E per nuove feature
4. Usa condition-based-waiting (no timeout fissi)

### Per Worker 5 (Supervisor)
1. **PREREQUISITO**: Fase 4 COMPLETED
2. Leggi sezione FASE 5
3. Esegui GATE FUNCTION (6 comandi FRESH)
4. Scrivi SUPERVISOR_FINAL_REPORT

---

# FASE 1: FIX CRITICI (Workers 1-3)

**PREREQUISITO**: Analisi completata (`STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md`)

---

## WORKER 1: UI/Forms - FASE 1

### TASK 1.1: Mini Calendario Component per Frequenza Mensile/Annuale

**Priority**: CRITICAL  
**Time**: 1.5h  
**Dependencies**: None  
**Blocca**: Configurazione frequenze manutenzioni

#### Obiettivo

Creare componente `MiniCalendar` per selezione giorno mese/anno invece di input numerico (requisito specifico utente).

#### File da Creare

- `src/components/ui/MiniCalendar.tsx` (nuovo componente)

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (linee frequenza manutenzioni ~166-180)
- `src/components/ui/MiniCalendar.test.tsx` (nuovo file test)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

File: `src/components/ui/__tests__/MiniCalendar.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MiniCalendar } from '../MiniCalendar'

describe('MiniCalendar', () => {
  test('MiniCalendar mensile permette selezione giorno (1-31)', async () => {
    const mockOnSelect = vi.fn()
    render(<MiniCalendar mode="month" onSelect={mockOnSelect} />)

    // Trova e clicca giorno 15
    const day15 = screen.getByText('15')
    await userEvent.click(day15)

    expect(mockOnSelect).toHaveBeenCalledWith(15)
  })

  test('MiniCalendar annuale permette selezione giorno dell\'anno (1-365)', async () => {
    const mockOnSelect = vi.fn()
    render(<MiniCalendar mode="year" onSelect={mockOnSelect} />)

    // Trova e clicca giorno 100 dell'anno
    const day100 = screen.getByText('100')
    await userEvent.click(day100)

    expect(mockOnSelect).toHaveBeenCalledWith(100)
  })

  test('MiniCalendar mensile mostra grid 31 giorni', () => {
    render(<MiniCalendar mode="month" onSelect={vi.fn()} />)

    // Verifica presenza giorni 1-31
    for (let i = 1; i <= 31; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }
  })

  test('MiniCalendar evidenzia giorno selezionato', async () => {
    const mockOnSelect = vi.fn()
    render(<MiniCalendar mode="month" selectedDay={15} onSelect={mockOnSelect} />)

    const day15 = screen.getByText('15')
    expect(day15).toHaveClass('bg-blue-600', 'text-white') // o classe evidenziazione
  })
})
```

**Comando Verifica RED**:
```bash
npm run test -- MiniCalendar.test.tsx --run
```

**Output Atteso**: FAIL con "MiniCalendar is not defined" o errori import

---

##### 2. GREEN - Implementa Componente Minimo

File: `src/components/ui/MiniCalendar.tsx`

```typescript
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  mode: 'month' | 'year'
  selectedDay?: number
  onSelect: (day: number) => void
  className?: string
}

export function MiniCalendar({ mode, selectedDay, onSelect, className }: MiniCalendarProps) {
  const days = mode === 'month' 
    ? Array.from({ length: 31 }, (_, i) => i + 1)
    : Array.from({ length: 365 }, (_, i) => i + 1)

  return (
    <div className={cn('grid grid-cols-7 gap-2 p-4 border rounded-lg', className)}>
      {mode === 'month' && (
        <>
          {/* Header giorni settimana (opzionale per mensile) */}
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, idx) => (
            <div key={idx} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </>
      )}
      
      {days.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onSelect(day)}
          className={cn(
            'p-2 text-sm rounded-md transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
            selectedDay === day && 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {day}
        </button>
      ))}
    </div>
  )
}
```

**Pattern Riferimento**: Verificare se esistono componenti calendario esistenti in `src/components/ui/`

**Nota**: Per modalità "year", potrebbe essere meglio un calendario visuale con mesi (da implementare se necessario)

---

##### 3. Integra in AddPointModal

File: `src/features/conservation/components/AddPointModal.tsx`

**PRIMA (input numerico)**:
```typescript
{task.frequenza === 'mensile' && (
  <div>
    <Label>Giorno del mese (1-31)</Label>
    <Input
      type="number"
      min="1"
      max="31"
      value={task.giornoMese || ''}
      onChange={(e) => updateTask('giornoMese', parseInt(e.target.value))}
    />
  </div>
)}

{task.frequenza === 'annuale' && (
  <div>
    <Label>Giorno dell'anno (1-365)</Label>
    <Input
      type="number"
      min="1"
      max="365"
      value={task.giornoAnno || ''}
      onChange={(e) => updateTask('giornoAnno', parseInt(e.target.value))}
    />
  </div>
)}
```

**DOPO (MiniCalendar)**:
```typescript
import { MiniCalendar } from '@/components/ui/MiniCalendar'

{task.frequenza === 'mensile' && (
  <div>
    <Label>Giorno del mese *</Label>
    <MiniCalendar
      mode="month"
      selectedDay={task.giornoMese}
      onSelect={(day) => updateTask('giornoMese', day)}
      className="mt-2"
    />
  </div>
)}

{task.frequenza === 'annuale' && task.manutenzione === 'sbrinamento' && (
  <div>
    <Label>Giorno dell'anno *</Label>
    <MiniCalendar
      mode="year"
      selectedDay={task.giornoAnno}
      onSelect={(day) => updateTask('giornoAnno', day)}
      className="mt-2"
    />
  </div>
)}
```

**Nota**: Frequenza "annuale" disponibile SOLO per manutenzione "sbrinamento" (verificare validazione)

---

##### 4. REFACTOR - Cleanup

- Ottimizza rendering per modalità "year" (potrebbe essere pesante con 365 giorni)
- Considera paginazione o vista mensile per modalità "year"
- Verifica responsive design (mobile/tablet/desktop)
- Aggiungi keyboard navigation se necessario

---

##### 5. VERIFY - Nessuna Regressione

```bash
# Test componente
npm run test -- MiniCalendar.test.tsx --run
# ✅ PASS: 4/4 test passati

# Test AddPointModal (verifica integrazione)
npm run test -- AddPointModal.test.tsx --run
# ✅ PASS: Nessuna regressione

# Type-check
npm run type-check
# ✅ PASS: 0 nuovi errori
```

---

#### Acceptance Criteria

- [ ] Componente MiniCalendar creato e funzionante
- [ ] Test RED → GREEN (4/4 test passati)
- [ ] Integrato in AddPointModal per frequenza mensile
- [ ] Integrato in AddPointModal per frequenza annuale (solo sbrinamento)
- [ ] Responsive design mobile/tablet/desktop
- [ ] Type-check PASS (0 nuovi errori)
- [ ] Nessuna regressione (test pre-esistenti passano)

---

#### Output

Sezione in progress report:
- Componente creato: `src/components/ui/MiniCalendar.tsx`
- Test creati: `src/components/ui/__tests__/MiniCalendar.test.tsx`
- Integrazione: `AddPointModal.tsx` (linee frequenza)
- Test: 4/4 passati
- Type-check: PASS

---

# FASE 2: COMPLETA FEATURE CORE (Workers 1-3)

**PREREQUISITO**: FASE 1 COMPLETED + Test critici GREEN

---

## WORKER 1: UI/Forms - FASE 2

### TASK 1.2: Configurazione Giorni Settimana (Giornaliera/Settimanale)

**Priority**: HIGH  
**Time**: 1h  
**Dependencies**: FASE 1 COMPLETED

#### Obiettivo

Aggiungere checkbox giorni settimana per frequenza giornaliera/settimanale con default appropriati.

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (frequenza manutenzioni)
- `src/features/conservation/components/__tests__/AddPointModal.test.tsx` (aggiungere test)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

File: `src/features/conservation/components/__tests__/AddPointModal.test.tsx`

```typescript
describe('AddPointModal - Configurazione Giorni Settimana', () => {
  test('Frequenza giornaliera: tutte le checkbox giorni selezionate di default', async () => {
    render(<AddPointModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />)

    // Seleziona frequenza "Giornaliera" per prima manutenzione
    const frequenzaSelect = screen.getAllByLabelText(/Frequenza/i)[0]
    await userEvent.click(frequenzaSelect)
    await userEvent.click(screen.getByText('Giornaliera'))

    // Verifica che checkbox giorni settimana appaiono
    const giorniSection = screen.getByText(/Giorni settimana/i)
    expect(giorniSection).toBeInTheDocument()

    // Verifica che tutte le checkbox (Lun-Dom) sono selezionate
    const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
    giorni.forEach(giorno => {
      const checkbox = screen.getByLabelText(giorno)
      expect(checkbox).toBeChecked()
    })
  })

  test('Frequenza settimanale: solo lunedì selezionato di default', async () => {
    render(<AddPointModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />)

    // Seleziona frequenza "Settimanale" per prima manutenzione
    const frequenzaSelect = screen.getAllByLabelText(/Frequenza/i)[0]
    await userEvent.click(frequenzaSelect)
    await userEvent.click(screen.getByText('Settimanale'))

    // Verifica che checkbox giorni settimana appaiono
    expect(screen.getByText(/Giorni settimana/i)).toBeInTheDocument()

    // Verifica che solo lunedì è selezionato
    expect(screen.getByLabelText('Lunedì')).toBeChecked()
    expect(screen.getByLabelText('Martedì')).not.toBeChecked()
    expect(screen.getByLabelText('Mercoledì')).not.toBeChecked()
    // ... altri giorni non selezionati
  })

  test('Configurazione giorni settimana salvata correttamente', async () => {
    const mockOnSave = vi.fn()
    render(<AddPointModal isOpen={true} onClose={vi.fn()} onSave={mockOnSave} />)

    // Configura frequenza settimanale con giorni specifici
    const frequenzaSelect = screen.getAllByLabelText(/Frequenza/i)[0]
    await userEvent.click(frequenzaSelect)
    await userEvent.click(screen.getByText('Settimanale'))

    // Seleziona lunedì e mercoledì
    await userEvent.click(screen.getByLabelText('Martedì'))
    await userEvent.click(screen.getByLabelText('Mercoledì'))

    // Salva form
    await userEvent.click(screen.getByText(/Salva|Crea/i))

    // Verifica che giorni settimana sono inclusi nel payload
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          frequenza: 'settimanale',
          giorniSettimana: expect.arrayContaining(['lunedi', 'martedi', 'mercoledi'])
        })
      ])
    )
  })
})
```

**Comando Verifica RED**:
```bash
npm run test -- AddPointModal.test.tsx --run
```

**Output Atteso**: FAIL con errori "checkbox giorni settimana non trovati" o "giorniSettimana non presente"

---

##### 2. GREEN - Implementa Checkbox Giorni Settimana

File: `src/features/conservation/components/AddPointModal.tsx`

**Aggiungi type per giorni settimana**:
```typescript
type Weekday = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'

interface MandatoryMaintenanceTask {
  // ... campi esistenti ...
  giorniSettimana?: Weekday[] // Nuovo campo per configurazione giorni
}
```

**Aggiungi costante giorni settimana**:
```typescript
const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

const ALL_WEEKDAYS: Weekday[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica']
```

**Aggiungi useEffect per default giorni**:
```typescript
// In MaintenanceTaskForm o AddPointModal
useEffect(() => {
  if (task.frequenza === 'giornaliera' && !task.giorniSettimana) {
    // Default: tutte selezionate
    updateTask('giorniSettimana', ALL_WEEKDAYS)
  } else if (task.frequenza === 'settimanale' && !task.giorniSettimana) {
    // Default: solo lunedì
    updateTask('giorniSettimana', ['lunedi'])
  }
}, [task.frequenza])
```

**Aggiungi UI checkbox giorni**:
```typescript
{(task.frequenza === 'giornaliera' || task.frequenza === 'settimanale') && (
  <div>
    <Label>Giorni settimana *</Label>
    <div className="grid grid-cols-4 gap-2 mt-2">
      {WEEKDAYS.map(weekday => (
        <label key={weekday.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={task.giorniSettimana?.includes(weekday.value) || false}
            onChange={(e) => {
              const current = task.giorniSettimana || []
              const updated = e.target.checked
                ? [...current, weekday.value]
                : current.filter(d => d !== weekday.value)
              updateTask('giorniSettimana', updated)
            }}
            className="rounded border-gray-300"
          />
          <span className="text-sm">{weekday.label}</span>
        </label>
      ))}
    </div>
  </div>
)}
```

**Aggiorna getRequiredMaintenanceTasks** (se necessario):
```typescript
const getRequiredMaintenanceTasks = (pointType: ConservationPointType): MandatoryMaintenanceTask[] => {
  // ... codice esistente ...
  // Aggiungere giorniSettimana: undefined per default (verrà impostato da useEffect)
}
```

---

##### 3. Aggiorna Trasformazione Dati per Salvataggio

File: `src/features/conservation/components/AddPointModal.tsx` (handleSubmit)

**Verifica che giorniSettimana viene incluso nel payload** (già gestito tramite `maintenanceTasks` prop)

**Verifica useConservationPoints** (già gestisce campi custom, potrebbe essere necessario aggiungere campo `giorni_settimana` se presente nel DB)

---

##### 4. REFACTOR - Cleanup

- Rimuovi codice duplicato
- Verifica naming consistency
- Ottimizza rendering checkbox (useMemo se necessario)

---

##### 5. VERIFY - Nessuna Regressione

```bash
npm run test -- AddPointModal.test.tsx --run
# ✅ PASS: Test nuovi + pre-esistenti passano

npm run type-check
# ✅ PASS: 0 nuovi errori
```

---

#### Acceptance Criteria

- [ ] Checkbox giorni settimana implementati
- [ ] Default corretti (tutte per giornaliera, lunedì per settimanale)
- [ ] Salvataggio configurazione giorni funziona
- [ ] Test RED → GREEN (3/3 test passati)
- [ ] Type-check PASS (0 nuovi errori)
- [ ] Nessuna regressione

---

### TASK 1.3: Validazione Manutenzioni Specifica

**Priority**: HIGH  
**Time**: 1h  
**Dependencies**: FASE 1 COMPLETED

#### Obiettivo

Migliorare validazione per indicare quale manutenzione è incompleta invece di errore generico.

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (validazione, linee ~544-588)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

```typescript
test('Validazione indica quale manutenzione è incompleta', async () => {
  render(<AddPointModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />)

  // Compila form base
  await userEvent.type(screen.getByLabelText(/Nome/i), 'Test Point')
  // ... altri campi base ...

  // Lascia prima manutenzione incompleta (senza frequenza)
  // Completa seconda manutenzione

  // Prova a salvare
  await userEvent.click(screen.getByText(/Salva|Crea/i))

  // Verifica errore specifico per prima manutenzione
  expect(screen.getByText(/Manutenzione.*Rilevamento Temperature.*frequenza/i)).toBeInTheDocument()
})

test('Validazione evidenzia visivamente manutenzioni incomplete', async () => {
  // ... simile al test sopra ...
  
  // Verifica che card prima manutenzione ha bordo rosso
  const maintenanceCard = screen.getAllByText(/Rilevamento Temperature/i)[0].closest('.border')
  expect(maintenanceCard).toHaveClass('border-red-500') // o classe errore
})
```

---

##### 2. GREEN - Implementa Validazione Specifica

**Aggiorna validateForm**:
```typescript
const validateForm = () => {
  const errors: Record<string, string> = {}
  const maintenanceErrors: Record<number, string[]> = {} // Nuovo: errori per manutenzione

  // ... validazione campi base esistente ...

  // Validazione manutenzioni con errori specifici
  maintenanceTasks.forEach((task, index) => {
    const taskErrors: string[] = []
    const taskName = MAINTENANCE_TYPES[task.manutenzione]?.label || `Manutenzione ${index + 1}`

    if (!task.frequenza) {
      taskErrors.push(`seleziona frequenza`)
    }
    if (!task.assegnatoARuolo) {
      taskErrors.push(`seleziona ruolo`)
    }
    if (task.frequenza === 'mensile' && !task.giornoMese) {
      taskErrors.push(`seleziona giorno del mese`)
    }
    if (task.frequenza === 'annuale' && !task.giornoAnno) {
      taskErrors.push(`seleziona giorno dell'anno`)
    }
    if ((task.frequenza === 'giornaliera' || task.frequenza === 'settimanale') && 
        (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      taskErrors.push(`seleziona almeno un giorno settimana`)
    }

    if (taskErrors.length > 0) {
      maintenanceErrors[index] = taskErrors
      errors[`maintenance_${index}`] = `${taskName}: ${taskErrors.join(', ')}`
    }
  })

  if (Object.keys(maintenanceErrors).length > 0) {
    errors.maintenanceTasks = 'Completa tutte le manutenzioni obbligatorie'
  }

  setValidationErrors(errors)
  setMaintenanceErrors(maintenanceErrors) // Nuovo state per errori specifici
  return Object.keys(errors).length === 0
}
```

**Aggiungi state per errori manutenzioni**:
```typescript
const [maintenanceErrors, setMaintenanceErrors] = useState<Record<number, string[]>>({})
```

**Aggiorna rendering errore riepilogo**:
```typescript
{Object.keys(validationErrors).length > 0 && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <p className="text-sm font-medium text-red-800 mb-2">
      Correggi i seguenti errori:
    </p>
    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
      {Object.entries(validationErrors)
        .filter(([key]) => key.startsWith('maintenance_'))
        .map(([key, error], idx) => (
          <li key={idx}>{error}</li>
        ))}
      {Object.entries(validationErrors)
        .filter(([key]) => !key.startsWith('maintenance_'))
        .map(([key, error], idx) => (
          <li key={idx}>{error}</li>
        ))}
    </ul>
  </div>
)}
```

**Aggiorna MaintenanceTaskForm per evidenziazione visiva**:
```typescript
<MaintenanceTaskForm
  task={task}
  index={index}
  // ... altre props ...
  hasError={!!maintenanceErrors[index]} // Nuovo prop
/>

// In MaintenanceTaskForm
<div className={cn(
  'border rounded-lg p-4 bg-white space-y-4',
  hasError && 'border-red-500 border-2' // Evidenziazione errore
)}>
  {/* ... contenuto esistente ... */}
  {hasError && (
    <div className="text-sm text-red-600 flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      <span>Completa tutti i campi obbligatori</span>
    </div>
  )}
</div>
```

---

##### 3. REFACTOR - Cleanup

- Estrai logica validazione in funzione separata se complessa
- Migliora messaggi errore (più specifici)
- Aggiungi scroll automatico alla prima manutenzione con errore

---

##### 4. VERIFY

```bash
npm run test -- AddPointModal.test.tsx --run
npm run type-check
```

---

#### Acceptance Criteria

- [ ] Validazione specifica per ogni manutenzione
- [ ] Errore indica quale manutenzione è incompleta e quale campo
- [ ] Evidenziazione visiva (bordo rosso, icona errore)
- [ ] Test RED → GREEN
- [ ] Type-check PASS

---

### TASK 1.4: Rimuovi Frequenza "custom"

**Priority**: MEDIUM  
**Time**: 30min  
**Dependencies**: Task 1.2 COMPLETED (giorni settimana implementati)

#### Obiettivo

Rimuovere opzione "custom" dal select frequenze dopo implementazione altre frequenze.

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (select frequenza, linee ~166-180)
- `src/components/onboarding-steps/TasksStep.tsx` (allineare se presente)

#### Implementation

**Rimuovi opzione custom**:
```typescript
<select
  value={task.frequenza}
  onChange={e => updateTask('frequenza', e.target.value as MaintenanceFrequency)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  required
>
  <option value="">Seleziona frequenza...</option>
  <option value="giornaliera">Giornaliera</option>
  <option value="settimanale">Settimanale</option>
  <option value="mensile">Mensile</option>
  <option value="annuale">Annuale</option>
  {/* Rimuovi: <option value="custom">Personalizzata</option> */}
</select>
```

**Rimuovi validazione custom**:
```typescript
// In validateForm, rimuovi:
// if (task.frequenza === 'custom' && (!task.giorniCustom || task.giorniCustom.length === 0)) {
//   errors.maintenanceTasks = 'Seleziona almeno un giorno per le frequenze personalizzate'
//   break
// }
```

**Rimuovi tipo custom da type** (se non usato altrove):
```typescript
type MaintenanceFrequency =
  | 'giornaliera'
  | 'settimanale'
  | 'mensile'
  | 'annuale'
  // Rimuovi: | 'custom'
```

**Verifica dipendenze**:
```bash
grep -r "custom.*frequency\|frequency.*custom" src/
# Verifica che nessun altro file usa 'custom'
```

---

#### Acceptance Criteria

- [ ] Opzione "custom" rimossa dal select
- [ ] Validazione custom rimossa
- [ ] Tipo 'custom' rimosso (se non usato)
- [ ] Test passano (nessuna regressione)
- [ ] Type-check PASS
- [ ] Verifica: nessun riferimento a "custom" nel codice

---

## WORKER 2: Database/Data - FASE 1

### TASK 2.1: Carica Campi Assegnazione Manutenzioni

**Priority**: CRITICAL  
**Time**: 30min  
**Dependencies**: None

#### Obiettivo

Aggiornare query `useMaintenanceTasks` per includere tutti i campi assegnazione mancanti.

#### File da Modificare

- `src/features/conservation/hooks/useMaintenanceTasks.ts` (query SELECT, linee ~100-132)

#### Implementation

**PRIMA (campi mancanti)**:
```typescript
.select(`
  *,
  conservation_point:conservation_points(
    id,
    name,
    department:departments(id, name)
  ),
  assigned_user:staff(id, name)
`)
```

**DOPO (campi completi)**:
```typescript
.select(`
  *,
  assignment_type,
  assigned_to_role,
  assigned_to_category,
  assigned_to_staff_id,
  conservation_point:conservation_points(
    id,
    name,
    department:departments(id, name)
  ),
  assigned_user:staff(id, name),
  department:conservation_points.departments(id, name)
`)
```

**Nota**: `department` già presente tramite `conservation_point.departments`, potrebbe essere necessario includere anche direttamente se necessario

**Aggiorna type MaintenanceTask** (se necessario):
```typescript
// In src/types/conservation.ts
export interface MaintenanceTask {
  // ... campi esistenti ...
  assignment_type?: string
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  assigned_to?: string // Mantenere per retrocompatibilità
  // ... altri campi ...
}
```

---

#### Acceptance Criteria

- [ ] Query include tutti i campi assegnazione
- [ ] Type MaintenanceTask aggiornato
- [ ] Test query passano
- [ ] Type-check PASS
- [ ] Verifica: query ritorna campi corretti

**Comando Verifica**:
```bash
# Esegui query in console browser o test
# Verifica che campi assegnazione sono presenti nei dati
npm run test -- useMaintenanceTasks.test.ts --run
```

---

### TASK 2.2: Salva Campi Assegnazione da AddPointModal

**Priority**: CRITICAL  
**Time**: 1h  
**Dependencies**: Task 2.1 COMPLETED

#### Obiettivo

Aggiornare trasformazione dati in AddPointModal per includere tutti i campi assegnazione nel payload.

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (trasformazione dati prima di onSave)
- `src/features/conservation/hooks/useConservationPoints.ts` (verificare payload, linee ~101-117)

#### Implementation

**Verifica mapping esistente in useConservationPoints**:
File: `src/features/conservation/hooks/useConservationPoints.ts` (linee 101-117)

Il codice già salva alcuni campi:
```typescript
assigned_to: task.assigned_to || 'role',
assignment_type: task.assigned_to_role ? 'role' : task.assigned_to_staff_id ? 'staff' : 'role',
assigned_to_role: task.assigned_to_role || null,
assigned_to_staff_id: task.assigned_to_staff_id || null,
assigned_to_category: task.assigned_to_category || null,
```

**Problema**: AddPointModal non passa questi campi nel formato corretto.

**Aggiorna trasformazione in AddPointModal** (prima di onSave):

File: `src/features/conservation/components/AddPointModal.tsx` (handleSubmit)

**PRIMA**:
```typescript
onSave(
  {
    name: formData.name,
    // ... altri campi punto ...
  },
  maintenanceTasks // Passa direttamente array MandatoryMaintenanceTask
)
```

**DOPO**:
```typescript
// Trasforma maintenanceTasks nel formato atteso da useConservationPoints
const transformedMaintenanceTasks = maintenanceTasks.map(task => ({
  type: task.manutenzione, // Mapping: 'rilevamento_temperatura' → 'temperature'
  frequency: task.frequenza,
  assigned_to_role: task.assegnatoARuolo,
  assigned_to_category: task.assegnatoACategoria,
  assigned_to_staff_id: task.assegnatoADipendenteSpecifico,
  // ... altri campi necessari
}))

onSave(
  {
    name: formData.name,
    // ... altri campi punto ...
  },
  transformedMaintenanceTasks
)
```

**Verifica mapping tipo manutenzione**:
```typescript
const MAINTENANCE_TYPE_MAPPING: Record<StandardMaintenanceType, string> = {
  'rilevamento_temperatura': 'temperature',
  'sanificazione': 'sanitization',
  'sbrinamento': 'defrosting',
  'controllo_scadenze': 'expiry_check',
}
```

**Aggiorna trasformazione completa**:
```typescript
const transformedMaintenanceTasks = maintenanceTasks.map(task => ({
  type: MAINTENANCE_TYPE_MAPPING[task.manutenzione],
  frequency: task.frequenza,
  assigned_to: task.assegnatoARuolo || 'role', // Fallback
  assigned_to_role: task.assegnatoARuolo || null,
  assigned_to_category: task.assegnatoACategoria || null,
  assigned_to_staff_id: task.assegnatoADipendenteSpecifico || null,
  // ... altri campi (title, priority, next_due calcolato, ecc.)
}))
```

---

#### Acceptance Criteria

- [ ] AddPointModal passa tutti i campi assegnazione nel formato corretto
- [ ] useConservationPoints salva tutti i campi correttamente
- [ ] Test creazione punto con manutenzioni passano
- [ ] Verifica DB: campi salvati correttamente
- [ ] Type-check PASS

**Comando Verifica DB**:
```sql
-- Dopo creazione punto con manutenzioni, verifica:
SELECT 
  id,
  type,
  assigned_to_role,
  assigned_to_category,
  assigned_to_staff_id,
  assignment_type
FROM maintenance_tasks
WHERE conservation_point_id = '<point_id>'
LIMIT 1;
```

---

## WORKER 2: Database/Data - FASE 2

### TASK 2.3: Salva Campi Form Temperatura (metodo, note, foto)

**Priority**: HIGH  
**Time**: 30min  
**Dependencies**: FASE 1 COMPLETED

#### Obiettivo

Utilizzare campi migration 015 (method, notes, photo_evidence, recorded_by) nel form AddTemperatureModal.

#### File da Modificare

- `src/features/conservation/components/AddTemperatureModal.tsx` (handleSubmit, linee ~134-165)
- `src/features/conservation/hooks/useTemperatureReadings.ts` (payload, linee ~58-102)

#### Implementation

**PRIMA (campi non salvati)**:
```typescript
onSave({
  conservation_point_id: conservationPoint.id,
  temperature: formData.temperature,
  recorded_at: new Date(),
  // TODO: method, notes, photo_evidence non salvati
})
```

**DOPO (campi salvati)**:
```typescript
// In AddTemperatureModal handleSubmit
const { user } = useAuth()

onSave({
  conservation_point_id: conservationPoint.id,
  temperature: formData.temperature,
  recorded_at: new Date(),
  method: formData.method, // Nuovo
  notes: formData.notes || null, // Nuovo
  photo_evidence: formData.photo_evidence || null, // Nuovo
  recorded_by: user?.id || null, // Nuovo
})
```

**Aggiorna useTemperatureReadings payload**:
File: `src/features/conservation/hooks/useTemperatureReadings.ts` (linee 72-78)

```typescript
const payload = {
  ...data,
  company_id: companyId,
  recorded_at: recordedAtString,
  method: data.method || 'digital_thermometer', // Default
  notes: data.notes || null,
  photo_evidence: data.photo_evidence || null,
  recorded_by: data.recorded_by || null,
  conservation_point: undefined, // Escludi join
}
```

**Aggiorna type TemperatureReading** (se necessario):
File: `src/types/conservation.ts`

Verifica che type include:
```typescript
interface TemperatureReading {
  // ... campi esistenti ...
  method?: 'manual' | 'digital_thermometer' | 'automatic_sensor'
  notes?: string
  photo_evidence?: string
  recorded_by?: string
}
```

---

#### Acceptance Criteria

- [ ] Form passa method, notes, photo_evidence, recorded_by
- [ ] Hook salva tutti i campi nel database
- [ ] Test creazione lettura passano
- [ ] Verifica DB: campi salvati correttamente
- [ ] Type-check PASS

**Comando Verifica DB**:
```sql
SELECT method, notes, photo_evidence, recorded_by
FROM temperature_readings
ORDER BY created_at DESC
LIMIT 1;
```

---

## WORKER 3: Maintenance/Logic - FASE 1

### TASK 3.1: Visualizza Dettagli Assegnazione Manutenzioni

**Priority**: CRITICAL  
**Time**: 1h  
**Dependencies**: Task 2.1 COMPLETED (campi caricati)

#### Obiettivo

Aggiornare visualizzazione "Assegnato a" in ScheduledMaintenanceCard per mostrare dettagli completi.

#### File da Modificare

- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (visualizzazione assegnazione, linee ~263-268)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

File: `src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx`

```typescript
test('Visualizza dettagli completi assegnazione (ruolo + categoria + reparto + dipendente)', async () => {
  const mockTask: MaintenanceTask = {
    // ... campi base ...
    assigned_to_role: 'responsabile',
    assigned_to_category: 'cucina',
    assigned_to_staff_id: 'staff-id-123',
    assigned_user: { id: 'staff-id-123', name: 'Mario Rossi' },
    conservation_point: {
      id: 'point-id',
      name: 'Frigo A',
      department: { id: 'dept-id', name: 'Cucina' }
    }
  }

  render(<ScheduledMaintenanceCard />) // Mock useMaintenanceTasks per ritornare mockTask

  // Verifica formato completo
  expect(screen.getByText(/Ruolo: Responsabile/i)).toBeInTheDocument()
  expect(screen.getByText(/Reparto: Cucina/i)).toBeInTheDocument()
  expect(screen.getByText(/Categoria: cucina/i)).toBeInTheDocument()
  expect(screen.getByText(/Dipendente: Mario Rossi/i)).toBeInTheDocument()
})
```

---

##### 2. GREEN - Implementa Visualizzazione Completa

File: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`

**PRIMA (solo stringa generica)**:
```typescript
<div className="flex items-center gap-1.5 text-gray-600">
  <User className="h-3.5 w-3.5" aria-hidden="true" />
  <span>
    Assegnato a: {task.assigned_to || 'Non assegnato'}
  </span>
</div>
```

**DOPO (dettagli completi)**:
```typescript
<div className="flex items-center gap-1.5 text-gray-600">
  <User className="h-3.5 w-3.5" aria-hidden="true" />
  <span className="text-sm">
    {formatAssignmentDetails(task)}
  </span>
</div>

// Aggiungi funzione helper
function formatAssignmentDetails(task: MaintenanceTask): string {
  const parts: string[] = []

  // Ruolo
  if (task.assigned_to_role) {
    const roleLabel = STAFF_ROLES.find(r => r.value === task.assigned_to_role)?.label || task.assigned_to_role
    parts.push(`Ruolo: ${roleLabel}`)
  }

  // Reparto (da conservation_point.department)
  if (task.conservation_point?.department?.name) {
    parts.push(`Reparto: ${task.conservation_point.department.name}`)
  }

  // Categoria
  if (task.assigned_to_category) {
    const categoryLabel = STAFF_CATEGORIES.find(c => c.value === task.assigned_to_category)?.label || task.assigned_to_category
    parts.push(`Categoria: ${categoryLabel}`)
  }

  // Dipendente specifico
  if (task.assigned_user?.name) {
    parts.push(`Dipendente: ${task.assigned_user.name}`)
  }

  return parts.length > 0 
    ? parts.join(' | ')
    : 'Non assegnato'
}
```

**Import necessari**:
```typescript
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'
```

**Formato alternativo (più compatto)**:
```typescript
function formatAssignmentDetails(task: MaintenanceTask): string {
  const parts: string[] = []

  if (task.assigned_to_role) {
    const roleLabel = STAFF_ROLES.find(r => r.value === task.assigned_to_role)?.label || task.assigned_to_role
    parts.push(roleLabel)
  }

  if (task.conservation_point?.department?.name) {
    parts.push(task.conservation_point.department.name)
  }

  if (task.assigned_to_category) {
    parts.push(STAFF_CATEGORIES.find(c => c.value === task.assigned_to_category)?.label || task.assigned_to_category)
  }

  if (task.assigned_user?.name) {
    parts.push(task.assigned_user.name)
  }

  return parts.length > 0 ? parts.join(' • ') : 'Non assegnato'
}
```

---

##### 3. REFACTOR - Cleanup

- Estrai funzione helper in file separato se riutilizzabile
- Gestisci casi edge (campi null/undefined)
- Ottimizza lookup STAFF_ROLES/CATEGORIES (useMemo se necessario)

---

##### 4. VERIFY

```bash
npm run test -- ScheduledMaintenanceCard.test.tsx --run
npm run type-check
```

---

#### Acceptance Criteria

- [ ] Visualizzazione mostra dettagli completi (ruolo | reparto | categoria | dipendente)
- [ ] Formato corretto con separatori
- [ ] Campi opzionali gestiti correttamente (non mostrati se null)
- [ ] Test RED → GREEN
- [ ] Type-check PASS

---

### TASK 3.2: Ordina Manutenzioni per Scadenza

**Priority**: CRITICAL  
**Time**: 30min  
**Dependencies**: None

#### Obiettivo

Ordinare manutenzioni per `next_due` ascendente (più prossime prima).

#### File da Modificare

- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (ordinamento array, linee ~125-142)

#### Implementation

**PRIMA (ordine caricamento)**:
```typescript
const pointsWithStatus = useMemo<ConservationPointWithStatus[]>(() => {
  if (!conservationPoints || !maintenanceTasks) return []
  
  return conservationPoints.map(point => {
    const pointMaintenances = maintenanceTasks.filter(
      task => task.conservation_point_id === point.id &&
              Object.keys(MANDATORY_MAINTENANCE_TYPES).includes(task.type)
    )
    
    return {
      id: point.id,
      name: point.name,
      status: calculateWeeklyStatus(pointMaintenances),
      maintenances: pointMaintenances, // Non ordinato
    }
  })
}, [conservationPoints, maintenanceTasks])
```

**DOPO (ordinato per scadenza)**:
```typescript
const pointsWithStatus = useMemo<ConservationPointWithStatus[]>(() => {
  if (!conservationPoints || !maintenanceTasks) return []
  
  return conservationPoints.map(point => {
    const pointMaintenances = maintenanceTasks
      .filter(
        task => task.conservation_point_id === point.id &&
                Object.keys(MANDATORY_MAINTENANCE_TYPES).includes(task.type)
      )
      .sort((a, b) => {
        // Ordina per next_due ascendente (più prossime prima)
        const dateA = new Date(a.next_due).getTime()
        const dateB = new Date(b.next_due).getTime()
        return dateA - dateB
      })
    
    return {
      id: point.id,
      name: point.name,
      status: calculateWeeklyStatus(pointMaintenances),
      maintenances: pointMaintenances, // Ordinato per scadenza
    }
  })
}, [conservationPoints, maintenanceTasks])
```

**Nota**: La query già ordina per `next_due` (linea 117 di useMaintenanceTasks), ma questo garantisce ordinamento anche dopo filtri/raggruppamenti.

---

#### Acceptance Criteria

- [ ] Manutenzioni ordinate per scadenza (più prossime prima)
- [ ] Ordinamento corretto (data ascendente)
- [ ] Test ordinamento passano
- [ ] Type-check PASS

**Test Manuale**:
- Crea punto con 4 manutenzioni con scadenze diverse
- Verifica che prima manutenzione mostrata è quella con scadenza più prossima

---

## WORKER 3: Maintenance/Logic - FASE 2

### TASK 3.3: Raggruppa Manutenzioni per Tipo con Solo Prima Visibile

**Priority**: HIGH  
**Time**: 1h  
**Dependencies**: FASE 1 COMPLETED

#### Obiettivo

Raggruppare manutenzioni per tipo e mostrare solo prima per tipo (più prossima), espandibile per vedere prossime 2.

#### File da Modificare

- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (raggruppamento, linee ~220-280)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

```typescript
test('Manutenzioni raggruppate per tipo con solo prima visibile', async () => {
  const mockTasks: MaintenanceTask[] = [
    { id: '1', type: 'temperature', next_due: new Date('2026-01-20') },
    { id: '2', type: 'temperature', next_due: new Date('2026-01-15') }, // Prima
    { id: '3', type: 'sanitization', next_due: new Date('2026-01-25') },
    { id: '4', type: 'sanitization', next_due: new Date('2026-01-18') }, // Prima
  ]

  render(<ScheduledMaintenanceCard />) // Mock useMaintenanceTasks

  // Verifica che solo prima manutenzione per tipo è visibile
  expect(screen.getByText(/Rilevamento Temperature.*15.*gennaio/i)).toBeInTheDocument()
  expect(screen.queryByText(/Rilevamento Temperature.*20.*gennaio/i)).not.toBeInTheDocument()
  
  expect(screen.getByText(/Sanificazione.*18.*gennaio/i)).toBeInTheDocument()
  expect(screen.queryByText(/Sanificazione.*25.*gennaio/i)).not.toBeInTheDocument()
})

test('Espansione mostra prossime 2 manutenzioni per tipo', async () => {
  // ... test espansione ...
})
```

---

##### 2. GREEN - Implementa Raggruppamento

**Aggiungi state per espansione**:
```typescript
const [expandedMaintenanceTypes, setExpandedMaintenanceTypes] = useState<Set<string>>(new Set())
```

**Funzione raggruppamento**:
```typescript
function groupMaintenancesByType(tasks: MaintenanceTask[]) {
  const grouped: Record<string, MaintenanceTask[]> = {}
  
  tasks.forEach(task => {
    if (!grouped[task.type]) {
      grouped[task.type] = []
    }
    grouped[task.type].push(task)
  })

  // Ordina ogni gruppo per next_due
  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => {
      const dateA = new Date(a.next_due).getTime()
      const dateB = new Date(b.next_due).getTime()
      return dateA - dateB
    })
  })

  return grouped
}
```

**Rendering raggruppato**:
```typescript
{/* In ScheduledMaintenanceCard, sostituisci rendering manutenzioni */}
{pointMaintenances.length > 0 && (() => {
  const grouped = groupMaintenancesByType(pointMaintenances)
  
  return Object.entries(grouped).map(([type, tasks]) => {
    const firstTask = tasks[0]
    const nextTasks = tasks.slice(1, 3) // Prossime 2
    const isExpanded = expandedMaintenanceTypes.has(`${point.id}-${type}`)
    const typeName = MANDATORY_MAINTENANCE_TYPES[type as keyof typeof MANDATORY_MAINTENANCE_TYPES] || type

    return (
      <div key={type} className="mb-3">
        {/* Prima manutenzione (sempre visibile) */}
        <div className="border rounded-lg p-3">
          {/* ... rendering prima manutenzione ... */}
        </div>

        {/* Prossime 2 manutenzioni (espandibile) */}
        {nextTasks.length > 0 && (
          <>
            <button
              onClick={() => {
                const key = `${point.id}-${type}`
                setExpandedMaintenanceTypes(prev => {
                  const next = new Set(prev)
                  if (next.has(key)) {
                    next.delete(key)
                  } else {
                    next.add(key)
                  }
                  return next
                })
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Nascondi' : `Mostra altre ${nextTasks.length} manutenzioni ${typeName}`}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-2">
                {nextTasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-3">
                    {/* ... rendering manutenzioni successive ... */}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  })
})()}
```

---

##### 3. REFACTOR - Cleanup

- Estrai funzione raggruppamento se complessa
- Ottimizza rendering (useMemo se necessario)
- Migliora UI espansione/collasso

---

##### 4. VERIFY

```bash
npm run test -- ScheduledMaintenanceCard.test.tsx --run
npm run type-check
```

---

#### Acceptance Criteria

- [ ] Manutenzioni raggruppate per tipo
- [ ] Solo prima manutenzione per tipo visibile di default
- [ ] Espansione mostra prossime 2 per tipo
- [ ] Test RED → GREEN
- [ ] Type-check PASS

---

## WORKER 3: Maintenance/Logic - FASE 3

### TASK 3.4: Modifica Punto con Manutenzioni

**Priority**: MEDIUM  
**Time**: 1h  
**Dependencies**: FASE 2 COMPLETED

#### Obiettivo

Caricare e permettere modifica manutenzioni quando AddPointModal è in modalità edit.

#### File da Modificare

- `src/features/conservation/components/AddPointModal.tsx` (caricamento manutenzioni in edit)
- `src/features/conservation/hooks/useMaintenanceTasks.ts` (query per punto, se necessario)

#### Implementation (TDD Workflow)

##### 1. RED - Scrivi Test che Fallisce

```typescript
test('AddPointModal carica manutenzioni esistenti in modalità edit', async () => {
  const mockPoint: ConservationPoint = {
    id: 'point-id',
    name: 'Frigo Test',
    // ... altri campi ...
  }

  const mockMaintenances: MaintenanceTask[] = [
    {
      id: 'task-1',
      type: 'temperature',
      frequency: 'daily',
      assigned_to_role: 'dipendente',
      // ... altri campi ...
    }
  ]

  // Mock useMaintenanceTasks per ritornare mockMaintenances
  render(<AddPointModal isOpen={true} point={mockPoint} onClose={vi.fn()} onSave={vi.fn()} />)

  // Verifica che form è precompilato con manutenzioni esistenti
  await waitFor(() => {
    expect(screen.getByDisplayValue('Frigo Test')).toBeInTheDocument()
    expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
  })
})
```

---

##### 2. GREEN - Implementa Caricamento Manutenzioni

**Aggiungi hook useMaintenanceTasks in AddPointModal**:
```typescript
const { maintenanceTasks: existingMaintenances } = useMaintenanceTasks(point?.id)

// Trasforma manutenzioni esistenti nel formato MandatoryMaintenanceTask
useEffect(() => {
  if (point && existingMaintenances && existingMaintenances.length > 0) {
    const transformed = existingMaintenances.map(task => ({
      manutenzione: mapMaintenanceTypeToStandard(task.type),
      frequenza: task.frequency as MaintenanceFrequency,
      assegnatoARuolo: task.assigned_to_role as StaffRole,
      assegnatoACategoria: task.assigned_to_category,
      assegnatoADipendenteSpecifico: task.assigned_to_staff_id,
      giornoMese: task.giornoMese,
      giornoAnno: task.giornoAnno,
      giorniSettimana: task.giorniSettimana,
      note: task.note,
    }))
    setMaintenanceTasks(transformed)
  }
}, [point, existingMaintenances])
```

**Funzione mapping tipo**:
```typescript
function mapMaintenanceTypeToStandard(type: string): StandardMaintenanceType {
  const mapping: Record<string, StandardMaintenanceType> = {
    'temperature': 'rilevamento_temperatura',
    'sanitization': 'sanificazione',
    'defrosting': 'sbrinamento',
    'expiry_check': 'controllo_scadenze',
  }
  return mapping[type] || 'rilevamento_temperatura'
}
```

**Gestisci modalità edit vs creazione**:
```typescript
// In useEffect inizializzazione
useEffect(() => {
  if (point) {
    // Modalità edit: precompila form
    setFormData({
      name: point.name,
      departmentId: point.department_id,
      targetTemperature: point.setpoint_temp.toString(),
      pointType: point.type,
      isBlastChiller: point.is_blast_chiller || false,
      productCategories: point.product_categories || [],
    })
    // Manutenzioni caricate da useMaintenanceTasks (vedi sopra)
  } else {
    // Modalità creazione: reset form
    setFormData({
      name: '',
      departmentId: '',
      targetTemperature: '',
      pointType: 'fridge',
      isBlastChiller: false,
      productCategories: [],
    })
    setMaintenanceTasks(getRequiredMaintenanceTasks('fridge'))
  }
}, [point, isOpen])
```

---

##### 3. Aggiorna handleSave per gestire update manutenzioni

**Nota**: Potrebbe essere necessario:
- Eliminare manutenzioni rimosse
- Creare nuove manutenzioni
- Aggiornare manutenzioni modificate

**Approccio semplificato**: Elimina tutte e ricrea (se accettabile)

**Approccio completo**: Confronta manutenzioni esistenti vs nuove e applica update/delete/insert

---

##### 4. VERIFY

```bash
npm run test -- AddPointModal.test.tsx --run
npm run type-check
```

---

#### Acceptance Criteria

- [ ] Manutenzioni caricate in modalità edit
- [ ] Form precompilato con manutenzioni esistenti
- [ ] Modifica manutenzioni funziona
- [ ] Test RED → GREEN
- [ ] Type-check PASS

---

# FASE 3: MIGLIORAMENTI (Workers 1, 3)

**PREREQUISITO**: FASE 2 COMPLETED + Test core GREEN

---

## WORKER 1: UI/Forms - FASE 3

### TASK 1.5: Aggiungi Aria-Label a Pulsanti Icona

**Priority**: MEDIUM  
**Time**: 30min  
**Dependencies**: FASE 2 COMPLETED

#### Obiettivo

Aggiungere aria-label descrittivi ai pulsanti icona per accessibilità.

#### File da Modificare

- `src/features/conservation/components/ConservationPointCard.tsx` (pulsanti edit/delete)

#### Implementation

**PRIMA (senza aria-label)**:
```typescript
<button
  onClick={() => onEdit(point)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
  <Edit className="w-4 h-4" />
</button>

<button
  onClick={() => onDelete(point.id)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
>
  <Trash2 className="w-4 h-4" />
</button>
```

**DOPO (con aria-label)**:
```typescript
<button
  onClick={() => onEdit(point)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
  aria-label={`Modifica punto ${point.name}`}
>
  <Edit className="w-4 h-4" aria-hidden="true" />
</button>

<button
  onClick={() => onDelete(point.id)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
  aria-label={`Elimina punto ${point.name}`}
>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
```

**Verifica altri componenti**:
- `TemperatureReadingCard.tsx` (se ha pulsanti icona)
- Altri componenti con pulsanti icona

---

#### Acceptance Criteria

- [ ] Tutti i pulsanti icona hanno aria-label
- [ ] Screen reader compatibility verificata
- [ ] Test accessibilità passano (se presenti)
- [ ] Type-check PASS

---

### TASK 1.6: Modifica Lettura Temperatura

**Priority**: MEDIUM  
**Time**: 30min  
**Dependencies**: FASE 2 COMPLETED

#### Obiettivo

Implementare handler `handleEditReading` per aprire modal in modalità edit.

#### File da Modificare

- `src/features/conservation/ConservationPage.tsx` (handleEditReading, linee ~320-327)
- `src/features/conservation/components/AddTemperatureModal.tsx` (modalità edit, se necessario)
- `src/features/conservation/hooks/useTemperatureReadings.ts` (update, se necessario)

#### Implementation

**PRIMA (non implementato)**:
```typescript
const handleEditReading = (reading: TemperatureReading) => {
  alert('Funzionalità in arrivo')
}
```

**DOPO (implementato)**:
```typescript
const handleEditReading = (reading: TemperatureReading) => {
  setEditingReading(reading)
  setSelectedPointForTemperature(
    conservationPoints.find(p => p.id === reading.conservation_point_id) || null
  )
  setShowTemperatureModal(true)
}
```

**Aggiorna AddTemperatureModal per modalità edit**:
```typescript
interface AddTemperatureModalProps {
  // ... props esistenti ...
  reading?: TemperatureReading // Nuovo prop per edit
}

// In componente
const [formData, setFormData] = useState({
  temperature: reading?.temperature || conservationPoint.setpoint_temp,
  method: reading?.method || 'digital_thermometer',
  notes: reading?.notes || '',
  photo_evidence: reading?.photo_evidence || '',
})

useEffect(() => {
  if (reading) {
    setFormData({
      temperature: reading.temperature,
      method: reading.method || 'digital_thermometer',
      notes: reading.notes || '',
      photo_evidence: reading.photo_evidence || '',
    })
  }
}, [reading])
```

**Aggiorna useTemperatureReadings per update** (se necessario):
Verifica se `updateReadingMutation` esiste (linee ~104-140)

---

#### Acceptance Criteria

- [ ] Handler implementato correttamente
- [ ] Modal supporta modalità edit
- [ ] Modifica lettura funziona
- [ ] Test RED → GREEN
- [ ] Type-check PASS

---

# FASE 4: INTEGRATION (Worker 4)

**PREREQUISITO**: FASE 3 COMPLETED + Tutti i test unit GREEN

---

## WORKER 4: Integration & Testing

### TASK 4.1: Test E2E Nuove Feature

**Priority**: HIGH  
**Time**: 1h  
**Dependencies**: FASE 3 COMPLETED

#### Obiettivo

Testare tutte le nuove feature implementate con test E2E completi.

#### File da Creare

- `tests/conservation/completamento-feature-e2e.spec.ts` (nuovo file)

#### Implementation (Playwright)

**Test Scenario 1: Mini Calendario Mensile**:
```typescript
test('E2E: Selezione giorno mese con MiniCalendar', async ({ page }) => {
  await page.goto('/conservation')
  await page.click('button:has-text("Aggiungi Punto")')

  // Compila form base
  await page.fill('input[name="name"]', 'Test Calendar')
  // ... altri campi ...

  // Seleziona frequenza mensile per prima manutenzione
  const frequenzaSelect = page.locator('[data-testid="frequenza-select-0"]')
  await frequenzaSelect.click()
  await page.click('text=Mensile')

  // Verifica che MiniCalendar appare
  await expect(page.locator('[data-testid="mini-calendar-month"]')).toBeVisible()

  // Seleziona giorno 15
  await page.locator('[data-testid="mini-calendar-day-15"]').click()

  // Verifica selezione
  await expect(page.locator('[data-testid="mini-calendar-day-15"]')).toHaveClass(/bg-blue-600/)
})
```

**Test Scenario 2: Dettagli Assegnazione Completi**:
```typescript
test('E2E: Visualizzazione dettagli assegnazione completi', async ({ page }) => {
  // Crea punto con manutenzioni complete
  // ... setup ...

  await page.goto('/conservation')

  // Espandi sezione manutenzioni programmate
  await page.click('text=Manutenzioni Programmate')

  // Verifica formato completo
  await expect(page.locator('text=/Ruolo: Responsabile.*Reparto: Cucina.*Categoria: cucina.*Dipendente: Mario/i')).toBeVisible()
})
```

**Test Scenario 3: Ordinamento Manutenzioni**:
```typescript
test('E2E: Manutenzioni ordinate per scadenza', async ({ page }) => {
  // Crea punto con 4 manutenzioni scadenze diverse
  // ... setup ...

  await page.goto('/conservation')
  await page.click('text=Manutenzioni Programmate')

  // Verifica che prima manutenzione è quella con scadenza più prossima
  const firstMaintenance = page.locator('[data-testid="maintenance-0"]')
  await expect(firstMaintenance).toContainText('15/01/2026') // Scadenza più prossima
})
```

**Test Scenario 4: Configurazione Giorni Settimana**:
```typescript
test('E2E: Configurazione giorni settimana giornaliera', async ({ page }) => {
  await page.goto('/conservation')
  await page.click('button:has-text("Aggiungi Punto")')

  // Seleziona frequenza giornaliera
  await page.selectOption('[data-testid="frequenza-select-0"]', 'giornaliera')

  // Verifica che checkbox giorni appaiono e tutte selezionate
  const checkboxLunedi = page.locator('input[type="checkbox"][value="lunedi"]')
  await expect(checkboxLunedi).toBeChecked()

  // Verifica tutte le checkbox
  const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica']
  for (const giorno of giorni) {
    await expect(page.locator(`input[type="checkbox"][value="${giorno}"]`)).toBeChecked()
  }
})
```

**Test Scenario 5: Raggruppamento Manutenzioni per Tipo**:
```typescript
test('E2E: Raggruppamento manutenzioni per tipo', async ({ page }) => {
  // Crea punto con 4 manutenzioni (2 temperature, 2 sanitization)
  // ... setup ...

  await page.goto('/conservation')
  await page.click('text=Manutenzioni Programmate')
  await page.click('text=Frigo Test') // Espandi punto

  // Verifica che solo prima manutenzione per tipo è visibile
  const temperatureMaintenances = page.locator('[data-maintenance-type="temperature"]')
  await expect(temperatureMaintenances).toHaveCount(1) // Solo prima

  // Espandi tipo temperature
  await page.click('text=Mostra altre manutenzioni Rilevamento Temperature')

  // Verifica che prossime 2 sono visibili
  await expect(temperatureMaintenances).toHaveCount(3) // Prima + 2 successive
})
```

**Test Scenario 6: Salvataggio Campi Temperatura**:
```typescript
test('E2E: Salvataggio campi temperatura (metodo, note, foto)', async ({ page }) => {
  await page.goto('/conservation')
  
  // Registra temperatura
  await page.click('text=Registra temperatura')
  await page.click('text=Frigo Test')

  await page.fill('input[name="temperature"]', '5.0')
  await page.click('input[value="digital_thermometer"]') // Metodo
  await page.fill('textarea[name="notes"]', 'Test note')
  await page.fill('input[name="photo_evidence"]', 'https://example.com/photo.jpg')

  await page.click('button:has-text("Registra")')

  // Verifica DB
  const response = await page.request.get('/api/temperature-readings')
  const readings = await response.json()
  const lastReading = readings[0]

  expect(lastReading.method).toBe('digital_thermometer')
  expect(lastReading.notes).toBe('Test note')
  expect(lastReading.photo_evidence).toBe('https://example.com/photo.jpg')
})
```

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Scrittura test
- `condition-based-waiting/SKILL.md` - Attese condizionali (no timeout fissi)

---

#### Acceptance Criteria

- [ ] Test E2E passano per tutte le nuove feature
- [ ] Screenshot evidenza salvati (10+)
- [ ] Database verification dopo ogni test
- [ ] Tempo esecuzione < 15s
- [ ] Cleanup automatico (afterEach)

---

# FASE 5: FINAL VERIFICATION (Worker 5)

**PREREQUISITO**: FASE 4 APPROVED + E2E tests GREEN

---

## WORKER 5: Supervisor

### TASK 5.1: Final Quality Check

**Priority**: CRITICAL  
**Time**: 1h  
**Dependencies**: FASE 4 COMPLETED

#### Obiettivo

Eseguire GATE FUNCTION completa con tutti i comandi FRESH.

#### Checklist GATE FUNCTION

Esegui TUTTI i comandi FRESH (no cache):

```bash
# 1. TypeScript
npm run type-check 2>&1 | tee logs/type-check-completamento.log
# ✅ PASS se: 0 errors (o solo pre-esistenti documentati)

# 2. Lint
npm run lint 2>&1 | tee logs/lint-completamento.log
# ✅ PASS se: 0 errors

# 3. Build
npm run build 2>&1 | tee logs/build-completamento.log
# ✅ PASS se: SUCCESS

# 4. Unit Tests
npm run test 2>&1 | tee logs/test-completamento.log
# ✅ PASS se: ALL PASS

# 5. E2E Tests
npm run test:e2e -- conservation 2>&1 | tee logs/e2e-completamento.log
# ✅ PASS se: ALL PASS

# 6. Database Integrity
node scripts/verify-conservation-db.js 2>&1 | tee logs/db-check-completamento.log
# ✅ PASS se: 0 orphans, migrations applied
```

#### Deliverable

File: `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/SUPERVISOR_FINAL_REPORT_COMPLETAMENTO_[DATA].md`

**Template Report**:

```markdown
# SUPERVISOR FINAL REPORT - Completamento Feature Conservation

**Data**: [DATA]
**Worker**: 5 (Supervisor)
**Fase**: Completamento Feature v3.0

---

## GATE FUNCTION RESULTS

### 1. TypeScript Check
**Comando**: `npm run type-check`
**Output**: [file log]
**Risultato**: ✅ PASS / ❌ FAIL
**Errori**: [lista errori se FAIL]

### 2. Lint Check
**Comando**: `npm run lint`
**Output**: [file log]
**Risultato**: ✅ PASS / ❌ FAIL
**Errori**: [lista errori se FAIL]

### 3. Build Check
**Comando**: `npm run build`
**Output**: [file log]
**Risultato**: ✅ PASS / ❌ FAIL
**Errori**: [lista errori se FAIL]

### 4. Unit Tests
**Comando**: `npm run test`
**Output**: [file log]
**Risultato**: ✅ PASS (X/X test) / ❌ FAIL
**Test Falliti**: [lista test se FAIL]

### 5. E2E Tests
**Comando**: `npm run test:e2e -- conservation`
**Output**: [file log]
**Risultato**: ✅ PASS / ❌ FAIL
**Test Falliti**: [lista test se FAIL]

### 6. Database Integrity
**Comando**: `node scripts/verify-conservation-db.js`
**Output**: [file log]
**Risultato**: ✅ PASS / ❌ FAIL
**Problemi**: [lista problemi se FAIL]

---

## SUMMARY

**Fase 1**: ✅ / ❌
**Fase 2**: ✅ / ❌
**Fase 3**: ✅ / ❌
**Fase 4**: ✅ / ❌

**Totale Task Completate**: X/Y
**Totale Test Passati**: X/Y

---

## FINAL VERDICT

### ✅ APPROVED - Ready for Merge

**Condizioni**:
- Tutti comandi passano
- No nuovi errori
- Tutte le feature implementate
- E2E confermano funzionalità

**Merge Instructions**:
1. Verifica branch corrente
2. git add .
3. git commit -m "feat(conservation): complete feature and fixes"
4. git push
5. Create PR to main

---

### ❌ REJECTED - Fix Required

**Condizioni**:
- Almeno UN comando fallisce
- Nuovi errori introdotti
- Regressioni rilevate

**Action Items**:
- Lista problemi bloccanti
- Worker responsabile per fix
- Fase a cui tornare
- ETA fix
```

---

#### Acceptance Criteria

- [ ] Tutti 6 comandi eseguiti FRESH
- [ ] Output salvato in file log
- [ ] Verdict chiaro: APPROVED / REJECTED
- [ ] Se REJECTED: action items dettagliati
- [ ] Se APPROVED: merge instructions complete

---

**Fine TASKS_COMPLETAMENTO.md v3.0**
