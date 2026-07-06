> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.5  
> **Motivo**: link rotto a `Generic-Task-creation_assignation/`; submit usa `frequency`+`custom_days`, non `recurrence_config` come doc maintenance.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# GENERIC TASK FORM - DOCUMENTAZIONE

**Data Creazione**: 2026-01-30
**Versione**: 1.0.0
**File Componente**: `src/features/calendar/components/GenericTaskForm.tsx`
**Tipo**: Form / Componente

---

## 🎯 SCOPO

### Scopo Business
Il **GenericTaskForm** permette di creare **mansioni ricorrenti** (attività generiche) che vengono automaticamente espanse in eventi sul calendario per tutto l'anno lavorativo.

**Esempi di mansioni**:
- "Pulizia cucina" - settimanale ogni lunedì
- "Controllo fornelli" - mensile il giorno 15
- "Riunione team" - ogni martedì e giovedì
- "Manutenzione frigorifero" - annuale

### Scopo Tecnico
Il componente:
- Raccoglie dati per creare una `GenericTask` nel database
- Valida input (nome, frequenza, assegnazione, reparto)
- Supporta **time management** per orari specifici
- Triggera `useGenericTasks().createTask()` mutation
- Gli eventi vengono poi espansi da `useAggregatedEvents()`

---

## 📚 DOCUMENTAZIONE COMPLETA

La documentazione dettagliata del GenericTaskForm è disponibile in:

**[../Generic-Task-creation_assignation/GENERIC_TASK_FORM_DEFINITION.md](../Generic-Task-creation_assignation/GENERIC_TASK_FORM_DEFINITION.md)**

Questa documentazione include:
- Tutti i campi del form con validazioni
- Logica filtri a cascata (Ruolo → Categoria → Dipendente)
- Gestione orario attività (Time Management)
- Selezione giorni e frequenze
- Gestione conflitti
- Struttura dati completa
- Test da eseguire

---

## 🔄 FLUSSO UTENTE

### Creazione nuova mansione

```
1. Utente espande sezione "Nuova Attività" su CalendarPage
   ↓
2. Compila GenericTaskForm:
   - Nome attività (obbligatorio)
   - Frequenza (giornaliera/settimanale/mensile/annuale/custom)
   - Assegnazione (ruolo/categoria/dipendente)
   - Reparto (obbligatorio)
   - Note (opzionale)
   - Time management (opzionale)
   ↓
3. Validazione:
   - Nome non vuoto
   - Frequenza selezionata
   - Reparto selezionato
   - Se custom: almeno un giorno selezionato
   - Se mensile: giorno del mese valido (1-31)
   ↓
4. Submit → createTask mutation
   ↓
5. INSERT generic_tasks
   ↓
6. useAggregatedEvents() espande per ricorrenza
   ↓
7. Eventi generati per tutto l'anno lavorativo
   ↓
8. Calendario aggiornato automaticamente
```

---

## 📊 STRUTTURA DATI

### GenericTaskFormData (Input)

```typescript
interface GenericTaskFormData {
  name: string
  frequenza: 'giornaliera' | 'settimanale' | 'mensile' | 'annuale' | 'custom'
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: string[]           // Per custom, settimanale, giornaliera
  giornoMese?: number               // Per mensile (1-31)
  departmentId: string
  note?: string
  timeManagement?: {
    timeRange?: {
      startTime: string             // HH:MM
      endTime: string               // HH:MM
      isOvernight: boolean
    }
    completionType?: 'timeRange' | 'startTime' | 'endTime' | 'none'
    completionStartTime?: string
    completionEndTime?: string
  }
}
```

### GenericTask (Database)

```typescript
interface GenericTask {
  id: string
  company_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'as_needed' | 'custom'
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  department_id?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration?: number       // minuti
  next_due?: Date
  time_management?: TimeManagement
  created_at: Date
  updated_at: Date
}
```

### Mapping Frequenza IT → EN

```typescript
'giornaliera' → 'daily'
'settimanale' → 'weekly'
'mensile' → 'monthly'
'annuale' → 'annually'
'custom' → 'custom'
```

---

## 🎨 LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│ + Nuova Attività                                   [▼]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Nome attività *                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Pulizia cucina                                       ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ Frequenza *                                              │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Settimanale                                      ▼   ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ Giorni della settimana *                                 │
│ [Lun] [Mar] [Mer] [Gio] [Ven] [Sab] [Dom]              │
│   ✓                ✓                                    │
│                                                          │
│ Assegnazione                                             │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Ruolo: Dipendente                                ▼   ││
│ │ Categoria: Cucina                                ▼   ││
│ │ Dipendente: Mario Rossi                          ▼   ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ Reparto *                                                │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Cucina                                           ▼   ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ▼ Time Management (opzionale)                            │
│ ┌──────────────────────────────────────────────────────┐│
│ │ ○ Orario di Apertura                                 ││
│ │ ● Fascia Oraria: [09:00] - [17:00]                  ││
│ │ ○ Orario di Inizio: [__:__]                         ││
│ │ ○ Orario Fine: [__:__]                              ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ Note                                                     │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Da fare prima dell'apertura                          ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│                              [Annulla] [Crea Attività]   │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ VALIDAZIONI

### Campi Obbligatori
- **Nome attività**: Non vuoto
- **Frequenza**: Deve essere selezionata
- **Reparto**: Deve essere selezionato (o "Tutti")

### Validazioni Specifiche

| Campo | Validazione |
|-------|-------------|
| Nome | Non vuoto, max 100 caratteri |
| Frequenza | Una delle opzioni valide |
| Giorni Custom | Almeno uno selezionato (se frequenza = custom/settimanale/giornaliera) |
| Giorno Mese | 1-31 (se frequenza = mensile) |
| Note | Max 2000 caratteri |
| Time Range | endTime > startTime (o isOvernight = true) |

### Conflitti Gestiti
- **Nome duplicato**: Blocca se stesso nome + reparto + frequenza già esistente
- **Stesso dipendente**: Warning (non blocca) se stesso dipendente ha mansione con frequenza diversa

---

## 🔗 INTEGRAZIONE

### Con CalendarPage

```typescript
// In CalendarPage.tsx
<GenericTaskForm
  staffOptions={staffOptions}
  departmentOptions={departmentOptions}
  existingTasks={genericTasks}
  calendarSettings={calendarSettings}
  onSubmit={handleCreateTask}
  onCancel={() => setIsFormOpen(false)}
  isLoading={isCreating}
/>
```

### Con useGenericTasks

```typescript
const { createTask, isCreating } = useGenericTasks()

const handleCreateTask = async (data: GenericTaskFormData) => {
  await createTask({
    name: data.name,
    frequency: mapFrequency(data.frequenza),
    assigned_to_role: data.assegnatoARuolo,
    assigned_to_category: data.assegnatoACategoria,
    assigned_to_staff_id: data.assegnatoADipendenteSpecifico,
    department_id: data.departmentId === 'all' ? null : data.departmentId,
    time_management: data.timeManagement,
    notes: data.note
  })

  setIsFormOpen(false)
  toast.success('Attività creata!')
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [x] Form crea mansione con tutti i campi
- [x] Validazione nome obbligatorio
- [x] Validazione reparto obbligatorio
- [x] Frequenze supportate (daily/weekly/monthly/annually/custom)
- [x] Selezione giorni per settimanale/custom
- [x] Mini calendario per mensile
- [x] Filtri a cascata (Ruolo → Categoria → Dipendente)
- [x] Time management opzionale
- [x] Orari notturni supportati
- [x] Reset form dopo submit
- [x] Blocco nomi duplicati
- [x] Warning per conflitti

---

## 📚 RIFERIMENTI

### Documentazione Completa
- **[GENERIC_TASK_FORM_DEFINITION.md](../Generic-Task-creation_assignation/GENERIC_TASK_FORM_DEFINITION.md)** - Documentazione dettagliata
- **[IMPLEMENTAZIONE_COMPLETA_GENERICTASKFORM.md](../Generic-Task-creation_assignation/IMPLEMENTAZIONE_COMPLETA_GENERICTASKFORM.md)** - Implementazione completa

### File Correlati
- **Componente**: `src/features/calendar/components/GenericTaskForm.tsx`
- **Hook**: `src/features/calendar/hooks/useGenericTasks.ts`
- **Page**: `src/features/calendar/CalendarPage.tsx`
- **Types**: `src/types/calendar.ts`

### Documentazione Correlata
- [00_MASTER_INDEX_CALENDAR.md](./00_MASTER_INDEX_CALENDAR.md)
- [CALENDAR_PAGE.md](./CALENDAR_PAGE.md)
- [EVENT_AGGREGATION.md](./EVENT_AGGREGATION.md)

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 1.0.0
