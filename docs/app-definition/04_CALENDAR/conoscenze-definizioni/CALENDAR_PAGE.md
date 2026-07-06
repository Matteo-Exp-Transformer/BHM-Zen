> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.5  
> **Motivo**: metriche righe obsolete (doc: 1095/996 — codice reale ~665/1052); architettura core OK.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# CALENDAR_PAGE - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-30
**Ultima Modifica**: 2026-01-30
**Versione**: 1.0.0
**File Componente**: `src/features/calendar/CalendarPage.tsx`
**Tipo**: Pagina

---

## 🎯 SCOPO

### Scopo Business
La pagina **Attività (Calendar)** è il centro di controllo per tutte le attività e scadenze dell'azienda. Permette di:

- **Visualizzare** tutti gli eventi aggregati da 6 fonti diverse
- **Gestire** manutenzioni, mansioni ricorrenti, scadenze prodotti
- **Monitorare** alert per eventi urgenti (entro 72 ore)
- **Filtrare** per reparto (solo admin) e tipo evento
- **Completare** attività direttamente dal calendario
- **Creare** nuove mansioni ricorrenti

### Scopo Tecnico
`CalendarPage.tsx` è un componente React di **1095 righe** che:

- **Aggrega** eventi da 6 fonti tramite `useAggregatedEvents()`
- **Filtra** per permessi (Layer 1) e visuale (Layer 2)
- **Visualizza** calendario con macro-categorie tramite FullCalendar
- **Gestisce** modal per dettagli evento e completamento
- **Auto-refresh** ogni 3 minuti
- **Integra** navigazione da Conservation

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
La pagina viene mostrata quando:

- L'utente naviga alla sezione "Attività" dal menu principale
- L'utente clicca "Visualizza nel Calendario" da Conservation
- L'utente ha completato l'onboarding e configurato il calendario

**Condizioni di accesso:**
- Utente autenticato
- `company_id` valido
- Calendar settings configurati (altrimenti mostra overlay configurazione)

**Ruoli utente:**
- **Admin/Responsabile**: Vedono tutti gli eventi
- **Dipendente**: Vedono solo eventi assegnati a loro

### Casi d'Uso Principali

1. **Consultare eventi del giorno**
   - **Scenario**: Un responsabile vuole vedere tutte le attività di oggi
   - **Azione**: Apre pagina Attività, vede calendario con macro-categorie
   - **Risultato**: Clicca su giorno corrente, vede lista eventi

2. **Completare una manutenzione**
   - **Scenario**: Un dipendente deve completare il controllo temperatura
   - **Azione**: Clicca macro-categoria "Manutenzioni", seleziona evento, clicca "Completa"
   - **Risultato**: Evento marcato come completato, calendario aggiornato

3. **Creare nuova mansione ricorrente**
   - **Scenario**: Manager vuole aggiungere "Pulizia cucina" settimanale
   - **Azione**: Espande form "Nuova Attività", compila dati, salva
   - **Risultato**: Mansione creata, eventi generati per tutto l'anno

4. **Filtrare per reparto**
   - **Scenario**: Utente vuole vedere solo eventi del reparto "Cucina"
   - **Azione**: Seleziona "Cucina" nel filtro Reparto
   - **Risultato**: Calendario mostra solo eventi di quel reparto

5. **Navigare da Conservation**
   - **Scenario**: Utente è in Conservazione e vuole vedere manutenzione nel calendario
   - **Azione**: Clicca "Visualizza nel Calendario"
   - **Risultato**: Calendario apre modal con manutenzione evidenziata

---

## 🔄 FLUSSI UTENTE

### Flusso principale - Visualizzazione calendario

```
1. Utente naviga a /attivita
   ↓
2. CalendarPage carica useAggregatedEvents()
   ↓
3. Eventi aggregati da 6 fonti
   ↓
4. useFilteredEvents() applica filtri permessi (Layer 1)
   ↓
5. displayEvents filtra per calendarFilters (Layer 2)
   ↓
6. useMacroCategoryEvents() aggrega per data+categoria
   ↓
7. Calendar.tsx renderizza con macro-categorie
   ↓
8. Utente vede calendario con badge conteggio
```

### Flusso completamento evento

```
1. Utente clicca macro-categoria (es: "🔧 Manutenzioni (3)")
   ↓
2. MacroCategoryModal si apre con lista eventi
   ↓
3. Utente clicca "Completa" su evento specifico
   ↓
4. Sistema determina tipo evento:
   - Manutenzione → UPDATE maintenance_tasks SET status='completed'
   - Mansione → INSERT task_completions
   - Prodotto → INSERT product_expiry_completions
   ↓
5. onDataUpdated() callback → refresh macro-categorie
   ↓
6. Calendario aggiornato automaticamente
```

### Flusso navigazione da Conservation

```
1. Utente in ConservationPage clicca "Vedi nel Calendario"
   ↓
2. navigate('/attivita', { state: {
     openMacroCategory: 'maintenance',
     date: '2026-01-30',
     highlightMaintenanceTaskId: 'uuid'
   }})
   ↓
3. CalendarPage riceve location.state
   ↓
4. useEffect detecta navState
   ↓
5. Filtra eventi per data + source='maintenance'
   ↓
6. setSelectedMacroCategory({ category, date, events, highlightId })
   ↓
7. MacroCategoryModal si apre
   ↓
8. Manutenzione specifica evidenziata con ring-2 ring-blue-500
```

### Flusso creazione mansione

```
1. Utente espande sezione "Nuova Attività"
   ↓
2. Compila GenericTaskForm:
   - Nome attività
   - Frequenza (giornaliera/settimanale/mensile/annuale/custom)
   - Assegnazione (ruolo/categoria/dipendente)
   - Reparto
   - Note
   - Time management (opzionale)
   ↓
3. Validazione:
   - Nome obbligatorio
   - Frequenza obbligatoria
   - Reparto obbligatorio
   ↓
4. onSubmit() → createTask mutation
   ↓
5. Database INSERT generic_tasks
   ↓
6. useAggregatedEvents espande per ricorrenza
   ↓
7. Eventi generati per tutto l'anno lavorativo
```

---

## ⚙️ STATE MANAGEMENT

### State Locale (useState)

```typescript
// View management
const [view, setView] = useCalendarView('month')

// Filtri visuali (Layer 2)
const [calendarFilters, setCalendarFilters] = useState<CalendarFilters>({
  departments: [],
  statuses: [],
  types: []
})

// Modal MacroCategory
const [selectedMacroCategory, setSelectedMacroCategory] = useState<{
  category: string
  date: Date
  events?: any[]
  highlightMaintenanceTaskId?: string
} | null>(null)

// Modal EventDetails
const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

// Modal Alert
const [showAlertModal, setShowAlertModal] = useState(false)

// Form GenericTask (collapsible)
const [isGenericTaskFormOpen, setIsGenericTaskFormOpen] = useState(false)

// Forza re-mount calendario
const [calendarKey, setCalendarKey] = useState(0)
```

### State Globale (Hooks)

```typescript
// Aggregazione eventi
const { events: aggregatedEvents, isLoading } = useAggregatedEvents(fiscalYearEnd)

// Filtri permessi (Layer 1)
const { filteredEvents } = useFilteredEvents(aggregatedEvents)

// Statistiche
const { todayEvents, tomorrowEvents, overdueEvents, eventsInWaiting } =
  useCalendarStats(viewBasedEvents, view)

// Alert
const { alerts, alertCount, criticalCount, dismissAlert } =
  useCalendarAlerts(displayEvents)

// Auto-refresh
const { isRefreshing, refreshKey, handleManualRefresh, triggerRefresh } =
  useCalendarRefresh()

// MacroCategory
const { events: macroCategoryEvents } =
  useMacroCategoryEvents(fiscalYearEnd, calendarFilters, refreshKey)
```

---

## 🔧 FUNZIONAMENTO

### Flusso di Filtraggio 2-Layer

```
aggregatedEvents (da useAggregatedEvents)
        │
        ▼
┌───────────────────────────────────┐
│ LAYER 1 - useFilteredEvents       │
│ Filtra per permessi utente:       │
│ - Admin/Resp → tutto              │
│ - Dipendente → solo assegnati     │
└───────────────┬───────────────────┘
                │
                ▼
        filteredEvents
                │
        ┌───────▼───────┐
        │ BYPASS CHECK  │
        │ Se vuoto, usa │
        │ aggregatedEvents │
        └───────┬───────┘
                │
                ▼
        eventsForFiltering
                │
                ▼
┌───────────────────────────────────┐
│ LAYER 2 - calendarFilters         │
│ Filtra per preferenza visiva:     │
│ - Reparto (OR)                    │
│ - Stato (OR)                      │
│ - Tipo (OR)                       │
│ (AND tra categorie diverse)       │
└───────────────┬───────────────────┘
                │
                ▼
        displayEvents
                │
                ▼
┌───────────────────────────────────┐
│ VIEW FILTER                       │
│ Filtra per view corrente:         │
│ - day: solo oggi                  │
│ - week: settimana corrente        │
│ - month: mese corrente            │
│ - year: anno corrente             │
└───────────────┬───────────────────┘
                │
                ▼
        viewBasedEvents → Calendario
```

### Auto-Refresh Meccanismo

```typescript
// Ogni 3 minuti
useEffect(() => {
  const REFRESH_INTERVAL = 3 * 60 * 1000

  const intervalId = setInterval(() => {
    handleManualRefresh()
  }, REFRESH_INTERVAL)

  return () => clearInterval(intervalId)
}, [queryClient])

// handleManualRefresh()
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
  queryClient.invalidateQueries({ queryKey: ['generic-tasks'] }),
  queryClient.invalidateQueries({ queryKey: ['task-completions'] }),
  queryClient.invalidateQueries({ queryKey: ['calendar-events'] }),
  queryClient.invalidateQueries({ queryKey: ['staff'] }),
  queryClient.invalidateQueries({ queryKey: ['products'] }),
  queryClient.invalidateQueries({ queryKey: ['conservation-points'] }),
])
setRefreshKey(prev => prev + 1)
```

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Attività" + Pulsante Alert (se ci sono alert)  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CalendarStatsPanel                                  │ │
│ │ - Eventi da completare                              │ │
│ │ - Completati oggi                                   │ │
│ │ - In ritardo                                        │ │
│ │ - Pulsante Refresh                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CalendarQuickOverview                               │ │
│ │ Cards: Overdue | Today | Tomorrow                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ NewCalendarFilters                                  │ │
│ │ [Reparto ▼] [Stato chips] [Tipo chips]             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ GenericTaskForm (collapsible)                       │ │
│ │ [+ Nuova Attività]                                  │ │
│ │ Form per creare mansione ricorrente                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Calendar (FullCalendar)                             │ │
│ │                                                     │ │
│ │ ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐ │ │
│ │ │ Lun  │ Mar  │ Mer  │ Gio  │ Ven  │ Sab  │ Dom  │ │ │
│ │ ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤ │ │
│ │ │ 🔧(3)│      │ 📋(2)│      │ 🔧(1)│      │      │ │ │
│ │ │ 📋(1)│      │      │      │ 📦(1)│      │      │ │ │
│ │ └──────┴──────┴──────┴──────┴──────┴──────┴──────┘ │ │
│ │                                                     │ │
│ │ [◀ Prev] [Oggi] [Month ▼] [Next ▶]                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [MacroCategoryModal - quando aperto]                    │
│ [AlertModal - quando aperto]                            │
│ [EventDetailsModal - quando aperto]                     │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 640px):**
- Layout a colonna singola
- Filtri in accordion
- Calendario compatto

**Tablet (640px - 1024px):**
- Layout misto
- Filtri visibili
- Calendario normale

**Desktop (> 1024px):**
- Layout ottimizzato
- Filtri inline
- Calendario full-width

---

## 🔗 COMPONENTI COLLEGATI

### Componenti Interni
- **Calendar.tsx**: Wrapper FullCalendar con macro-categorie
- **MacroCategoryModal.tsx**: Lista eventi per data+categoria
- **GenericTaskForm.tsx**: Form creazione mansioni
- **NewCalendarFilters.tsx**: Filtri Reparto/Stato/Tipo
- **CalendarStatsPanel.tsx**: Pannello statistiche
- **AlertModal.tsx**: Modal alert urgenti

### Hooks Utilizzati
- **useAggregatedEvents()**: Aggregazione 6 fonti
- **useFilteredEvents()**: Filtri permessi
- **useMacroCategoryEvents()**: Aggregazione data+categoria
- **useCalendarStats()**: Statistiche
- **useCalendarAlerts()**: Alert urgenze
- **useCalendarRefresh()**: Auto-refresh
- **useCalendarSettings()**: Configurazione calendario
- **useGenericTasks()**: CRUD mansioni

### Integrazione Esterna
- **Conservation**: Navigazione tramite location.state
- **Dashboard**: Link rapido a Attività

---

## 📊 DATI

### CalendarEvent (Struttura Unificata)

```typescript
interface CalendarEvent {
  id: string                    // Univoco con occorrenza
  title: string
  description?: string
  start: Date
  end?: Date
  allDay?: boolean

  type: 'maintenance' | 'general_task' | 'custom'
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: string               // 'maintenance' | 'general_task' | 'custom'
  sourceId: string             // ID entità originale

  assigned_to: string[]
  department_id?: string
  conservation_point_id?: string

  metadata: {
    task_id?: string
    maintenance_id?: string
    assigned_to_staff_id?: string
    assigned_to_role?: string
    assigned_to_category?: string
  }

  backgroundColor: string
  borderColor: string
  textColor: string
}
```

### CalendarFilters

```typescript
interface CalendarFilters {
  departments: string[]      // UUID reparti
  statuses: EventStatus[]    // 'to_complete' | 'completed' | 'overdue' | 'future' — non esposto in UI (rimosso 05-02-2026)
  types: EventType[]         // 'generic_task' | 'maintenance' | 'product_expiry'
}
```

L'UI dei filtri (NewCalendarFilters) espone solo **Reparto** (solo admin) e **Tipo**; il campo `statuses` resta nel tipo per compatibilità e logica interna.

---

## ✅ ACCEPTANCE CRITERIA

- [x] Pagina carica e mostra calendario con eventi aggregati
- [x] 6 fonti evento correttamente aggregate
- [x] Filtri permessi (Layer 1) funzionanti
- [x] Filtri visuali (Layer 2) funzionanti
- [x] MacroCategory visualizzate con badge conteggio
- [x] Click su MacroCategory apre modal con lista eventi
- [x] Completamento eventi funzionante
- [x] Auto-refresh ogni 3 minuti
- [x] Navigazione da Conservation funzionante
- [x] Evidenziamento manutenzione specifica
- [x] Creazione nuova mansione funzionante
- [x] Alert per eventi urgenti (72 ore)
- [x] 4 views supportate (anno/mese/settimana/giorno)

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/calendar/CalendarPage.tsx`
- **Wrapper FullCalendar**: `src/features/calendar/Calendar.tsx`
- **Hooks**: `src/features/calendar/hooks/`
- **Components**: `src/features/calendar/components/`
- **Types**: `src/types/calendar.ts`

### Documentazione Correlata
- [00_MASTER_INDEX_CALENDAR.md](./00_MASTER_INDEX_CALENDAR.md)
- [MACRO_CATEGORY_SYSTEM.md](./MACRO_CATEGORY_SYSTEM.md)
- [FILTERS_AND_PERMISSIONS.md](./FILTERS_AND_PERMISSIONS.md)
- [EVENT_AGGREGATION.md](./EVENT_AGGREGATION.md)

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 1.0.0
