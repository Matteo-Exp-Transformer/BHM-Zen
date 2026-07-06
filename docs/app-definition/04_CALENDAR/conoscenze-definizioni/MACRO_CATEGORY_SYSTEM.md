> **Stato Fase 3** (2026-07-06): `verificato-ok` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.3  
> **Motivo**: macro-categorie + `MacroCategoryModal` verificati in codice; fix modal vuoto mese successivo OK.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# MACRO CATEGORY SYSTEM - DOCUMENTAZIONE

**Data Creazione**: 2026-01-30
**Versione**: 1.0.0
**Hook Principale**: `src/features/calendar/hooks/useMacroCategoryEvents.ts`
**Modal**: `src/features/calendar/components/MacroCategoryModal.tsx`

---

## 🎯 SCOPO

### Cos'è una MacroCategory?

Una **MacroCategory** è un'aggregazione visiva di eventi per:
- **Data** (YYYY-MM-DD)
- **Categoria** (maintenance | generic_tasks | product_expiry)

Invece di mostrare ogni singolo evento sul calendario (che diventerebbe illeggibile con molti eventi), il sistema aggrega gli eventi della stessa categoria nello stesso giorno in un **unico badge con conteggio**.

### Esempio Visivo

```
Senza MacroCategory (illeggibile):
┌──────────────────────────────────┐
│ Lunedì 30 Gennaio                │
├──────────────────────────────────┤
│ ✅ Controllo Temp. Frigo 1       │
│ ✅ Controllo Temp. Frigo 2       │
│ ⏳ Sanificazione Cucina          │
│ ✅ Pulizia Piano Lavoro          │
│ ⏳ Controllo Scadenze            │
│ ⚠️ Scadenza Mozzarella          │
│ ... (troppi eventi)              │
└──────────────────────────────────┘

Con MacroCategory (leggibile):
┌──────────────────────────────────┐
│ Lunedì 30 Gennaio                │
├──────────────────────────────────┤
│ 🔧 Manutenzioni (3)              │
│ 📋 Mansioni (2)                  │
│ 📦 Scadenze Prodotti (1)         │
└──────────────────────────────────┘
```

Al **click** sulla MacroCategory, si apre il **MacroCategoryModal** con la lista dettagliata di tutti gli eventi.

---

## 📝 CATEGORIE DISPONIBILI

### 1. 🔧 Manutenzioni (maintenance)

Eventi di tipo manutenzione punti conservazione:
- Controllo temperatura
- Sanificazione
- Sbrinamento
- Controllo scadenze

**Colori**: Background giallo (#FEF3C7), Border arancione (#F59E0B)

### 2. 📋 Mansioni (generic_tasks)

Attività generiche ricorrenti:
- Pulizie
- Controlli periodici
- Attività assegnate ai dipendenti

**Colori**: Background blu (#DBEAFE), Border blu (#3B82F6)

### 3. 📦 Scadenze Prodotti (product_expiry)

Scadenze prodotti inventario:
- Prodotti in scadenza
- Prodotti scaduti

**Colori**: Background rosso (#FEE2E2), Border rosso (#EF4444)

---

## 🔧 HOOK: useMacroCategoryEvents

### Scopo
Trasforma array di CalendarEvent[] in MacroCategoryEvent[] aggregando per data + categoria.

### Utilizzo

```typescript
const {
  events: macroCategoryEvents,
  getEventsForDate,
  getCategoryForDate
} = useMacroCategoryEvents(fiscalYearEnd, filters, refreshKey)
```

### Parametri

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `fiscalYearEnd` | `Date \| undefined` | Fine anno fiscale per limite espansione |
| `filters` | `CalendarFilters` | Filtri visuali attivi |
| `refreshKey` | `number` | Key per forzare refresh |

### Output

```typescript
interface MacroCategoryEvent {
  date: string                    // 'YYYY-MM-DD'
  category: MacroCategory         // 'maintenance' | 'generic_tasks' | 'product_expiry'
  count: number                   // Solo eventi attivi (non completati)
  items: MacroCategoryItem[]      // Tutti gli eventi (anche completati)
}
```

### Logica Aggregazione

```typescript
// 1. Raggruppa eventi per data
const eventsByDate = new Map<string, CalendarEvent[]>()
events.forEach(event => {
  const dateKey = event.start.toISOString().split('T')[0]
  eventsByDate.set(dateKey, [...(eventsByDate.get(dateKey) || []), event])
})

// 2. Per ogni data, raggruppa per categoria
eventsByDate.forEach((dayEvents, dateKey) => {
  const byCategory = new Map<MacroCategory, MacroCategoryItem[]>()

  dayEvents.forEach(event => {
    const category = determineCategory(event)
    byCategory.set(category, [...(byCategory.get(category) || []), event])
  })

  // 3. Crea MacroCategoryEvent per ogni categoria
  byCategory.forEach((items, category) => {
    const activeCount = items.filter(i => i.status !== 'completed').length
    result.push({
      date: dateKey,
      category,
      count: activeCount,
      items
    })
  })
})
```

### Determinazione Categoria

```typescript
function determineCategory(event: CalendarEvent): MacroCategory {
  if (event.source === 'maintenance') return 'maintenance'
  if (event.source === 'general_task') return 'generic_tasks'
  if (event.metadata?.product_id) return 'product_expiry'
  return 'generic_tasks' // fallback
}
```

---

## 🎨 MODAL: MacroCategoryModal

### Scopo
Mostrare lista dettagliata degli eventi per una specifica data + categoria.

### Props

```typescript
interface MacroCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: MacroCategory
  date: Date
  events: MacroCategoryItem[]
  highlightMaintenanceTaskId?: string  // Per evidenziare manutenzione specifica
  onDataUpdated: () => void            // Callback dopo completamento
}
```

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Manutenzioni - 30 Gennaio 2026                  [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⏳ Controllo Temperatura - Frigo 1                  │ │
│ │ Assegnato a: Mario Rossi                            │ │
│ │ Priorità: Alta                                      │ │
│ │                              [Completa] [Dettagli]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ Sanificazione Cucina (Completato)                │ │  ← Sfondo verde
│ │ Completato da: Luigi Bianchi alle 09:30             │ │
│ │                              [Annulla Completamento]│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 Sbrinamento Freezer (ring-2 ring-blue-500)      │ │  ← Evidenziato
│ │ Assegnato a: Tutti i dipendenti                     │ │
│ │ Priorità: Media                                     │ │
│ │                              [Completa] [Dettagli]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Totale: 3 eventi (2 da completare, 1 completato)       │
└─────────────────────────────────────────────────────────┘
```

### Evidenziamento

Quando `highlightMaintenanceTaskId` è fornito (navigazione da Conservation):

```typescript
{items.map(item => (
  <div
    key={item.id}
    className={cn(
      'p-4 border rounded-lg',
      item.metadata.sourceId === highlightMaintenanceTaskId &&
        'ring-2 ring-blue-500 bg-blue-50'
    )}
  >
    {/* Contenuto item */}
  </div>
))}
```

### Completamento Evento

```typescript
const handleComplete = async (item: MacroCategoryItem) => {
  const category = item.metadata.category

  if (category === 'maintenance') {
    // UPDATE maintenance_tasks SET status='completed', completed_at=NOW()
    await completeMaintenanceTask(item.metadata.maintenance_id)
  }
  else if (category === 'generic_tasks') {
    // INSERT task_completions
    await completeGenericTask({
      task_id: item.metadata.task_id,
      completed_by: currentUserId,
      completed_at: new Date(),
      period_start: getPeriodStart(item.dueDate),
      period_end: getPeriodEnd(item.dueDate)
    })
  }
  else if (category === 'product_expiry') {
    // INSERT product_expiry_completions
    await completeProductExpiry(item.metadata.product_id)
  }

  // Notifica CalendarPage di refresh
  onDataUpdated()
}
```

### Uncomplete (Annulla Completamento)

```typescript
const handleUncomplete = async (item: MacroCategoryItem) => {
  const category = item.metadata.category

  if (category === 'maintenance') {
    // UPDATE maintenance_tasks SET status='pending', completed_at=NULL
    await uncompleteMaintenanceTask(item.metadata.maintenance_id)
  }
  else if (category === 'generic_tasks') {
    // DELETE task_completions WHERE task_id AND period
    await uncompleteGenericTask(item.metadata.task_id, item.dueDate)
  }

  onDataUpdated()
}
```

---

## 🔄 FLUSSO CLICK

```
┌────────────────────────────────────────────────────────┐
│                 Utente clicca su                        │
│         "🔧 Manutenzioni (3)" sul calendario           │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│           Calendar.handleEventClick()                   │
│                                                         │
│ if (extendedProps.type === 'macro_category') {         │
│   const { category, items } = extendedProps            │
│   onMacroCategorySelect(category, date, items)         │
│ }                                                       │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│        CalendarPage.setSelectedMacroCategory()         │
│                                                         │
│ setSelectedMacroCategory({                              │
│   category: 'maintenance',                              │
│   date: clickedDate,                                    │
│   events: items,                                        │
│   highlightMaintenanceTaskId: navState?.highlightId    │
│ })                                                      │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│              MacroCategoryModal si apre                 │
│                                                         │
│ Mostra lista di 3 manutenzioni per quella data         │
│ Se highlightId fornito, evidenzia quella specifica     │
└────────────────────────────────────────────────────────┘
```

---

## 📊 STRUTTURA DATI

### MacroCategoryItem

```typescript
interface MacroCategoryItem {
  id: string                          // ID univoco con occorrenza
  title: string                       // Nome evento
  dueDate: Date                       // Data scadenza
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Assegnazione
  assignedToStaffId?: string
  assignedToRole?: string
  assignedToCategory?: string
  departmentId?: string

  // Ricorrenza
  frequency?: string                  // 'daily' | 'weekly' | 'monthly' | etc.

  // Metadata per completamento
  metadata: {
    category: MacroCategory
    sourceId: string                  // ID entità originale
    task_id?: string
    maintenance_id?: string
    conservation_point_id?: string
    product_id?: string
    department_id?: string
  }
}
```

### Trasformazione FullCalendar

Quando `useMacroCategories=true` in Calendar.tsx:

```typescript
// Trasforma MacroCategoryEvent → FullCalendar Event
const fullCalendarEvent = {
  id: `macro-${category}-${date}`,
  title: getCategoryLabel(category),   // "Manutenzioni", "Mansioni", etc.
  start: new Date(date),
  allDay: true,

  backgroundColor: getCategoryColors(category).bg,
  borderColor: getCategoryColors(category).border,
  textColor: getCategoryColors(category).text,

  extendedProps: {
    type: 'macro_category',
    category: category,
    count: count,                      // Mostrato in badge
    items: items                       // Usato al click per modal
  }
}
```

---

## 🎨 COLORI E STYLING

### Colori per Categoria

```typescript
const CATEGORY_COLORS = {
  maintenance: {
    bg: '#FEF3C7',      // yellow-100
    border: '#F59E0B',  // yellow-500
    text: '#92400E'     // yellow-800
  },
  generic_tasks: {
    bg: '#DBEAFE',      // blue-100
    border: '#3B82F6',  // blue-500
    text: '#1E40AF'     // blue-800
  },
  product_expiry: {
    bg: '#FEE2E2',      // red-100
    border: '#EF4444',  // red-500
    text: '#991B1B'     // red-800
  }
}
```

### Badge Conteggio

```css
.macro-category-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
}
```

### Item Status Colors

```typescript
const STATUS_COLORS = {
  completed: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✅'
  },
  pending: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: '⏳'
  },
  overdue: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '⚠️'
  }
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [x] MacroCategory aggrega eventi per data + categoria
- [x] Badge mostra conteggio eventi attivi (non completati)
- [x] Click su badge apre MacroCategoryModal
- [x] Modal mostra lista dettagliata eventi
- [x] Completamento evento funzionante
- [x] Annulla completamento funzionante
- [x] Evidenziamento manutenzione specifica (da Conservation)
- [x] Filtri applicati correttamente a items
- [x] Colori distinti per categoria
- [x] Responsive su mobile

---

## 📚 RIFERIMENTI

### File Correlati
- **Hook**: `src/features/calendar/hooks/useMacroCategoryEvents.ts`
- **Modal**: `src/features/calendar/components/MacroCategoryModal.tsx`
- **Calendar**: `src/features/calendar/Calendar.tsx`
- **Page**: `src/features/calendar/CalendarPage.tsx`

### Documentazione Correlata
- [00_MASTER_INDEX_CALENDAR.md](./00_MASTER_INDEX_CALENDAR.md)
- [CALENDAR_PAGE.md](./CALENDAR_PAGE.md)
- [EVENT_AGGREGATION.md](./EVENT_AGGREGATION.md)

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 1.0.0
