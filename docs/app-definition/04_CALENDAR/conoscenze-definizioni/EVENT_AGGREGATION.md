> **Stato Fase 3** (2026-07-06): `verificato-ok` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.3  
> **Motivo**: aggregazione 6 fonti implementata in `useAggregatedEvents.ts`; manutenzioni ricorrenti presenti ma untested.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# EVENT AGGREGATION - DOCUMENTAZIONE

**Data Creazione**: 2026-01-30
**Versione**: 1.0.0
**Hook Principale**: `src/features/calendar/hooks/useAggregatedEvents.ts`
**Linee di codice**: ~690

---

## 🎯 SCOPO

### Cos'è l'Event Aggregation?

Il sistema Calendar aggrega eventi da **6 fonti diverse** in un unico array `CalendarEvent[]` standardizzato. Questo permette di:

- Visualizzare tutti gli eventi aziendali in un unico calendario
- Applicare filtri uniformi su tutti i tipi di evento
- Gestire completamenti in modo consistente
- Espandere eventi ricorrenti per tutto l'anno lavorativo

### Le 6 Fonti Evento

| # | Fonte | Descrizione | Source ID |
|---|-------|-------------|-----------|
| 1 | **Maintenance Tasks** | Manutenzioni punti conservazione | `maintenance` |
| 2 | **Generic Tasks** | Mansioni ricorrenti assegnate | `general_task` |
| 3 | **Product Expiry** | Scadenze prodotti inventario | `custom` |
| 4 | **HACCP Expiry** | Scadenze certificazioni dipendenti | `custom` |
| 5 | **Temperature Checks** | Controlli temperatura auto-generati | `custom` |
| 6 | **HACCP Deadlines** | Scadenze formazione HACCP | `custom` |

---

## 🔧 HOOK: useAggregatedEvents

### Utilizzo

```typescript
const {
  events,           // CalendarEvent[] aggregati
  isLoading,        // boolean caricamento
  sources           // Conteggio per fonte
} = useAggregatedEvents(fiscalYearEnd)
```

### Parametri

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `fiscalYearEnd` | `Date \| undefined` | Fine anno fiscale per limite espansione ricorrenza |

### Output

```typescript
interface UseAggregatedEventsReturn {
  events: CalendarEvent[]
  isLoading: boolean
  sources: {
    maintenance: number
    haccpExpiry: number
    productExpiry: number
    haccpDeadlines: number
    temperatureChecks: number
    genericTasks: number
  }
}
```

---

## 📊 LE 6 FONTI IN DETTAGLIO

### 1. 🔧 Maintenance Tasks (Manutenzioni)

**Origine dati**: `maintenance_tasks` table

**Tipi di manutenzione**:
- Controllo temperatura
- Sanificazione
- Sbrinamento
- Controllo scadenze

**Query**:
```typescript
const { data: maintenanceTasks } = useMaintenanceTasks()

// Filtra per company_id (RLS automatico)
// Include: conservation_point, department
```

**Espansione Ricorrenza**:
```typescript
function expandMaintenanceTask(task: MaintenanceTask): CalendarEvent[] {
  const events: CalendarEvent[] = []

  // Calcola range
  const startDate = task.next_due || task.created_at
  const endDate = fiscalYearEnd || addDays(new Date(), 90)

  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // ID univoco per occorrenza
    const eventId = `maintenance-${task.id}-${currentDate.toISOString().split('T')[0]}`

    // Calcola status per questa occorrenza
    const status = task.frequency === 'as_needed'
      ? task.status
      : (currentDate < now ? 'overdue' : 'pending')

    events.push({
      id: eventId,
      title: task.name,
      start: currentDate,
      type: 'maintenance',
      source: 'maintenance',
      sourceId: task.id,
      status,
      priority: task.priority,
      metadata: {
        maintenance_id: task.id,
        conservation_point_id: task.conservation_point_id,
        department_id: task.department_id,
        assigned_to_staff_id: task.assigned_to_staff_id,
        assigned_to_role: task.assigned_to_role,
        assigned_to_category: task.assigned_to_category
      }
    })

    // Avanza alla prossima occorrenza
    currentDate = getNextOccurrence(currentDate, task.frequency)
  }

  return events
}
```

**Frequenze supportate**:
- `daily` - Ogni giorno
- `weekly` - Ogni settimana
- `monthly` - Ogni mese
- `quarterly` - Ogni 3 mesi
- `biannually` - Ogni 6 mesi
- `annually` - Ogni anno
- `as_needed` - Su richiesta (non espanso)

---

### 2. 📋 Generic Tasks (Mansioni)

**Origine dati**: `generic_tasks` table + `task_completions` table

**Query**:
```typescript
const { data: genericTasks } = useGenericTasks()
const { data: taskCompletions } = useTaskCompletions()
```

**Espansione con verifica completamento**:
```typescript
function expandGenericTask(
  task: GenericTask,
  completions: TaskCompletion[]
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  let currentDate = new Date(task.next_due || task.created_at)
  const endDate = fiscalYearEnd || addDays(new Date(), 90)

  while (currentDate <= endDate) {
    const eventId = `generic-${task.id}-${currentDate.toISOString().split('T')[0]}`

    // Verifica se completato in questo periodo
    const periodStart = getPeriodStart(currentDate, task.frequency)
    const periodEnd = getPeriodEnd(currentDate, task.frequency)

    const isCompletedInPeriod = completions.some(c =>
      c.task_id === task.id &&
      new Date(c.completed_at) >= periodStart &&
      new Date(c.completed_at) <= periodEnd
    )

    // Determina status
    let status: 'pending' | 'completed' | 'overdue'
    if (isCompletedInPeriod) {
      status = 'completed'
    } else if (currentDate < new Date()) {
      status = 'overdue'
    } else {
      status = 'pending'
    }

    events.push({
      id: eventId,
      title: task.name,
      start: currentDate,
      type: 'general_task',
      source: 'general_task',
      sourceId: task.id,
      status,
      priority: task.priority,
      metadata: {
        task_id: task.id,
        department_id: task.department_id,
        assigned_to_staff_id: task.assigned_to_staff_id,
        assigned_to_role: task.assigned_to_role,
        assigned_to_category: task.assigned_to_category,
        frequency: task.frequency
      }
    })

    currentDate = getNextOccurrence(currentDate, task.frequency)
  }

  return events
}
```

**Calcolo Periodo Completamento**:
```typescript
// Per verificare se una mansione è completata in un certo periodo
function getPeriodStart(date: Date, frequency: string): Date {
  switch (frequency) {
    case 'daily':
      return startOfDay(date)
    case 'weekly':
      return startOfWeek(date, { weekStartsOn: 1 })
    case 'monthly':
      return startOfMonth(date)
    default:
      return startOfDay(date)
  }
}

function getPeriodEnd(date: Date, frequency: string): Date {
  switch (frequency) {
    case 'daily':
      return endOfDay(date)
    case 'weekly':
      return endOfWeek(date, { weekStartsOn: 1 })
    case 'monthly':
      return endOfMonth(date)
    default:
      return endOfDay(date)
  }
}
```

---

### 3. 📦 Product Expiry (Scadenze Prodotti)

**Origine dati**: `products` table

**Query**:
```typescript
const { data: products } = useProducts()

// Filtra prodotti attivi con scadenza
const expiringProducts = products?.filter(p =>
  p.is_active &&
  p.expiry_date &&
  new Date(p.expiry_date) > subDays(new Date(), 7) // Mostra fino a 7 giorni dopo scadenza
)
```

**Conversione**:
```typescript
function convertProductExpiry(product: Product): CalendarEvent {
  const expiryDate = new Date(product.expiry_date)
  const now = new Date()

  // Determina status
  let status: 'pending' | 'overdue'
  if (expiryDate < now) {
    status = 'overdue'
  } else {
    status = 'pending'
  }

  // Determina priorità in base a giorni rimanenti
  const daysUntilExpiry = differenceInDays(expiryDate, now)
  let priority: 'low' | 'medium' | 'high' | 'critical'
  if (daysUntilExpiry < 0) {
    priority = 'critical'  // Già scaduto
  } else if (daysUntilExpiry <= 3) {
    priority = 'high'      // Scade entro 3 giorni
  } else if (daysUntilExpiry <= 7) {
    priority = 'medium'    // Scade entro 7 giorni
  } else {
    priority = 'low'       // Scade oltre 7 giorni
  }

  return {
    id: `product-expiry-${product.id}`,
    title: `Scadenza: ${product.name}`,
    start: expiryDate,
    type: 'custom',
    source: 'custom',
    sourceId: product.id,
    status,
    priority,
    metadata: {
      product_id: product.id,
      category: 'product_expiry'
    }
  }
}
```

---

### 4. 👤 HACCP Expiry (Scadenze Certificazioni)

**Origine dati**: `staff` table (campo `haccp_certification`)

**Query**:
```typescript
const { data: staff } = useStaff()

// Filtra dipendenti con certificazione HACCP in scadenza
const expiringCertifications = staff?.filter(member =>
  member.haccp_certification?.expiry_date &&
  new Date(member.haccp_certification.expiry_date) > subDays(new Date(), 30)
)
```

**Conversione**:
```typescript
function convertHaccpExpiry(member: StaffMember): CalendarEvent {
  const expiryDate = new Date(member.haccp_certification.expiry_date)

  return {
    id: `haccp-expiry-${member.id}`,
    title: `Scadenza HACCP: ${member.name}`,
    start: expiryDate,
    type: 'custom',
    source: 'custom',
    sourceId: member.id,
    status: expiryDate < new Date() ? 'overdue' : 'pending',
    priority: 'high',
    metadata: {
      staff_id: member.id,
      category: 'haccp_expiry'
    }
  }
}
```

---

### 5. 🌡️ Temperature Checks (Controlli Temperatura)

**Origine dati**: `conservation_points` table

**Generazione automatica**: Per ogni punto di conservazione, genera eventi giornalieri di controllo temperatura.

```typescript
function generateTemperatureCheckEvents(
  conservationPoints: ConservationPoint[]
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  conservationPoints.forEach(point => {
    // Genera per ogni giorno dell'anno lavorativo
    let currentDate = new Date()
    const endDate = fiscalYearEnd || addDays(new Date(), 90)

    while (currentDate <= endDate) {
      events.push({
        id: `temp-check-${point.id}-${currentDate.toISOString().split('T')[0]}`,
        title: `Controllo Temp. ${point.name}`,
        start: currentDate,
        type: 'custom',
        source: 'custom',
        sourceId: point.id,
        status: 'pending',
        priority: 'medium',
        metadata: {
          conservation_point_id: point.id,
          category: 'temperature_check'
        }
      })

      currentDate = addDays(currentDate, 1)
    }
  })

  return events
}
```

---

### 6. 📜 HACCP Deadlines (Scadenze Formazione)

**Origine dati**: Generato da `generateHaccpDeadlineEvents()`

**Esempio eventi generati**:
- Scadenze training HACCP
- Aggiornamenti normativi
- Verifiche periodiche

```typescript
function generateHaccpDeadlineEvents(staff: StaffMember[]): CalendarEvent[] {
  // Genera eventi per training HACCP in scadenza
  // Basato su data assunzione + periodicità formazione
}
```

---

## 🔄 FLUSSO AGGREGAZIONE COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│              useAggregatedEvents()                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 1. useMaintenanceTasks()                            │ │
│  │    → expandRecurringTask()                          │ │
│  │    → maintenanceEvents[]                            │ │
│  └─────────────────────────────────────────────────────┘ │
│                         +                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 2. useGenericTasks() + useTaskCompletions()         │ │
│  │    → expandGenericTask()                            │ │
│  │    → genericTaskEvents[]                            │ │
│  └─────────────────────────────────────────────────────┘ │
│                         +                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 3. useProducts()                                    │ │
│  │    → filter(active + expiry_date)                   │ │
│  │    → convertProductExpiry()                         │ │
│  │    → productExpiryEvents[]                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                         +                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 4. useStaff()                                       │ │
│  │    → filter(haccp_certification.expiry_date)        │ │
│  │    → convertHaccpExpiry()                           │ │
│  │    → haccpExpiryEvents[]                            │ │
│  └─────────────────────────────────────────────────────┘ │
│                         +                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 5. useConservationPoints()                          │ │
│  │    → generateTemperatureCheckEvents()               │ │
│  │    → temperatureCheckEvents[]                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                         +                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 6. generateHaccpDeadlineEvents(staff)               │ │
│  │    → haccpDeadlineEvents[]                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               MERGE & SORT                          │ │
│  │                                                      │ │
│  │ allEvents = [                                        │ │
│  │   ...maintenanceEvents,                              │ │
│  │   ...genericTaskEvents,                              │ │
│  │   ...productExpiryEvents,                            │ │
│  │   ...haccpExpiryEvents,                              │ │
│  │   ...temperatureCheckEvents,                         │ │
│  │   ...haccpDeadlineEvents                             │ │
│  │ ].sort((a, b) => a.start - b.start)                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                │
│                         ▼                                │
│                   return allEvents                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 STRUTTURA CalendarEvent (OUTPUT)

```typescript
interface CalendarEvent {
  // Identificazione
  id: string                    // Univoco con occorrenza (es: maintenance-uuid-2026-01-30)
  title: string
  description?: string

  // Temporalità
  start: Date
  end?: Date
  allDay?: boolean

  // Tipologia
  type: 'maintenance' | 'general_task' | 'custom'
  source: 'maintenance' | 'general_task' | 'custom'
  sourceId: string              // ID entità originale (senza data)

  // Stato
  status: 'pending' | 'completed' | 'overdue' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Ricorrenza
  recurring: boolean

  // Colori (calcolati)
  backgroundColor: string
  borderColor: string
  textColor: string

  // Metadati per completamento e filtri
  metadata: {
    // Identificatori fonte
    task_id?: string
    maintenance_id?: string
    conservation_point_id?: string
    product_id?: string
    staff_id?: string

    // Assegnazione
    department_id?: string
    assigned_to_staff_id?: string
    assigned_to_role?: string
    assigned_to_category?: string

    // Categoria per MacroCategory
    category?: 'maintenance' | 'generic_tasks' | 'product_expiry' | 'haccp_expiry' | 'temperature_check'

    // Altro
    frequency?: string
    notes?: string
  }

  // Audit
  created_at: Date
  updated_at: Date
  company_id: string
}
```

---

## 🔢 CALCOLO STATUS

### Per Manutenzioni

```typescript
function calculateMaintenanceStatus(
  task: MaintenanceTask,
  occurrenceDate: Date
): 'pending' | 'completed' | 'overdue' {
  // Se frequenza 'as_needed', usa status dal DB
  if (task.frequency === 'as_needed') {
    return task.status
  }

  // Altrimenti, calcola in base alla data
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const occurrence = new Date(occurrenceDate)
  occurrence.setHours(0, 0, 0, 0)

  if (occurrence < now) {
    return 'overdue'
  }

  return 'pending'
}
```

### Per Generic Tasks

```typescript
function calculateGenericTaskStatus(
  task: GenericTask,
  occurrenceDate: Date,
  completions: TaskCompletion[]
): 'pending' | 'completed' | 'overdue' {
  // Verifica se completato nel periodo
  const periodStart = getPeriodStart(occurrenceDate, task.frequency)
  const periodEnd = getPeriodEnd(occurrenceDate, task.frequency)

  const isCompleted = completions.some(c =>
    c.task_id === task.id &&
    new Date(c.completed_at) >= periodStart &&
    new Date(c.completed_at) <= periodEnd
  )

  if (isCompleted) return 'completed'

  const now = new Date()
  if (occurrenceDate < now) return 'overdue'

  return 'pending'
}
```

---

## 🎨 CALCOLO COLORI

```typescript
function getEventColors(event: CalendarEvent): EventColors {
  // Prima controlla status
  if (event.status === 'completed') {
    return {
      backgroundColor: '#DCFCE7',  // green-100
      borderColor: '#10B981',      // green-500
      textColor: '#065F46'         // green-800
    }
  }

  if (event.status === 'overdue') {
    return {
      backgroundColor: '#FEE2E2',  // red-100
      borderColor: '#EF4444',      // red-500
      textColor: '#991B1B'         // red-800
    }
  }

  // Poi controlla tipo
  switch (event.source) {
    case 'maintenance':
      return {
        backgroundColor: '#FEF3C7',  // yellow-100
        borderColor: '#F59E0B',      // yellow-500
        textColor: '#92400E'         // yellow-800
      }

    case 'general_task':
      return {
        backgroundColor: '#DBEAFE',  // blue-100
        borderColor: '#3B82F6',      // blue-500
        textColor: '#1E40AF'         // blue-800
      }

    default:
      return {
        backgroundColor: '#F3E8FF',  // purple-100
        borderColor: '#8B5CF6',      // purple-500
        textColor: '#5B21B6'         // purple-800
      }
  }
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [x] Aggregazione 6 fonti evento funzionante
- [x] Espansione ricorrenza per manutenzioni
- [x] Espansione ricorrenza per mansioni
- [x] Verifica completamento mansioni per periodo
- [x] Scadenze prodotti filtrate correttamente
- [x] Scadenze HACCP dipendenti
- [x] Controlli temperatura auto-generati
- [x] ID univoci per ogni occorrenza
- [x] Status calcolato correttamente
- [x] Colori assegnati per tipo/status
- [x] Metadati completi per filtri e completamento

---

## 📚 RIFERIMENTI

### File Correlati
- **Hook**: `src/features/calendar/hooks/useAggregatedEvents.ts`
- **Maintenance Hook**: `src/features/conservation/hooks/useMaintenanceTasks.ts`
- **Generic Tasks Hook**: `src/features/calendar/hooks/useGenericTasks.ts`
- **Products Hook**: `src/features/inventory/hooks/useProducts.ts`
- **Staff Hook**: `src/features/management/hooks/useStaff.ts`
- **Conservation Hook**: `src/features/conservation/hooks/useConservationPoints.ts`

### Documentazione Correlata
- [00_MASTER_INDEX_CALENDAR.md](./00_MASTER_INDEX_CALENDAR.md)
- [CALENDAR_PAGE.md](./CALENDAR_PAGE.md)
- [MACRO_CATEGORY_SYSTEM.md](./MACRO_CATEGORY_SYSTEM.md)

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 1.0.0
