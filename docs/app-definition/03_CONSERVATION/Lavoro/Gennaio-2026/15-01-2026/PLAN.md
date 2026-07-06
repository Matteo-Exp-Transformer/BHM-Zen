# PIANO DETTAGLIATO - Conservation Feature Fix
## Data: 2026-01-15
## Versione: 1.0

---

## CONTESTO TECNICO

### Stack Tecnologico
- **React 18.3** + TypeScript 5.6
- **Radix UI** per componenti Select
- **TanStack Query** (React Query) per data fetching
- **Supabase** per database

### File Principali
```
src/features/conservation/
├── components/
│   ├── AddPointModal.tsx          # Modal creazione/modifica punto
│   ├── AddTemperatureModal.tsx    # Modal registrazione temperatura
│   └── ...
├── hooks/
│   ├── useMaintenanceTasks.ts     # CRUD manutenzioni
│   ├── useTemperatureReadings.ts  # CRUD letture temperatura
│   └── useConservationPoints.ts   # CRUD punti conservazione
├── ConservationPage.tsx           # Pagina principale
└── ...

src/components/ui/
├── Select.tsx                     # Componente Select Radix UI
└── ...

src/features/dashboard/components/
├── ScheduledMaintenanceCard.tsx   # Card manutenzioni programmate
└── ...
```

---

## SOLUZIONE TASK-C1: Fix Select Ruolo

### Problema
Il Select Radix UI per il ruolo non si apre. Il `SelectContent` usa `Portal` ma potrebbe essere tagliato da `overflow: hidden` sul modal container.

### Diagnosi
1. `Select.tsx` riga 72-96: `SelectContent` usa `SelectPrimitive.Portal` con `z-[10000]`
2. `AddPointModal.tsx`: Modal ha `overflow-y-auto` che potrebbe causare problemi

### Soluzione Implementativa

**File**: `src/features/conservation/components/AddPointModal.tsx`

**Verifica 1**: Controllare che il Select sia configurato correttamente:
```tsx
// CORRETTO - deve avere value e onValueChange
<Select
  value={task.assegnatoARuolo || ''}
  onValueChange={(value) => updateMaintenanceTask(index, { ...task, assegnatoARuolo: value })}
>
  <SelectTrigger id={`role-select-${index}`}>
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

**Verifica 2**: Se il problema persiste, aggiungere `position="popper"` e `sideOffset`:
```tsx
<SelectContent position="popper" sideOffset={5}>
```

**Verifica 3**: Se ancora non funziona, verificare che il container del modal non abbia `pointer-events: none` o `overflow: hidden` che taglia il Portal. Soluzione:
```tsx
// Nel modal container, assicurarsi che overflow sia solo su scroll area interna
<div className="fixed inset-0 z-[9999] flex items-center justify-center">
  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] flex flex-col">
    <div className="p-6 overflow-y-auto flex-1">
      {/* Form content qui - overflow qui, non sul container esterno */}
    </div>
  </div>
</div>
```

### Test di Verifica
```bash
npm run test -- --run src/features/conservation/components/__tests__/AddPointModal.test.tsx
```

---

## SOLUZIONE TASK-A1: Fix Manutenzione Completata

### Problema
Dopo `completeTask()`, la manutenzione rimane visibile perché la cache React Query non viene invalidata.

### Diagnosi
File `src/features/conservation/hooks/useMaintenanceTasks.ts`:
- La mutation `completeTask` deve invalidare la query `maintenanceTasks`

### Soluzione Implementativa

**File**: `src/features/conservation/hooks/useMaintenanceTasks.ts`

Cercare la mutation `completeTask` e assicurarsi che invalidi la cache:

```tsx
const completeTaskMutation = useMutation({
  mutationFn: async (data: CompleteMaintenanceInput) => {
    // ... logica esistente
  },
  onSuccess: () => {
    // IMPORTANTE: Invalidare TUTTE le query correlate
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] })
    queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    toast.success('Manutenzione completata')
  },
  onError: (error) => {
    console.error('Errore completamento:', error)
    toast.error('Errore nel completamento della manutenzione')
  }
})
```

**Alternativa con refetch immediato**:
```tsx
onSuccess: async () => {
  // Forza refetch immediato invece di solo invalidare
  await queryClient.refetchQueries({ queryKey: ['maintenanceTasks'] })
  toast.success('Manutenzione completata')
}
```

### Test di Verifica
1. Completare una manutenzione
2. Verificare che scompaia dalla lista senza refresh
3. Verificare che la prossima manutenzione dello stesso tipo appaia

---

## SOLUZIONE TASK-A2: Fix Visualizzazione Assegnazione

### Problema
La funzione `formatAssignmentDetails()` in `ScheduledMaintenanceCard.tsx` non riceve i dati corretti perché la query non fa JOIN con le tabelle correlate.

### Diagnosi
File `src/features/conservation/hooks/useMaintenanceTasks.ts`:
- La query deve includere JOIN con `conservation_points`, `departments`, e `staff` (per assigned_user)

### Soluzione Implementativa

**File**: `src/features/conservation/hooks/useMaintenanceTasks.ts`

Modificare la query per includere i JOIN necessari:

```tsx
const { data, error } = await supabase
  .from('maintenance_tasks')
  .select(`
    *,
    conservation_point:conservation_points (
      id,
      name,
      department:departments (
        id,
        name
      )
    ),
    assigned_user:staff (
      id,
      name
    )
  `)
  .eq('company_id', companyId)
  .order('next_due', { ascending: true })
```

**Nota**: Verificare che i campi `assigned_to_role`, `assigned_to_category`, `assigned_user_id` esistano nella tabella `maintenance_tasks`. Se non esistono, potrebbero dover essere aggiunti via migration.

### Test di Verifica
1. Creare manutenzione con ruolo + categoria + dipendente
2. Verificare che nella card appaia: "Responsabile • Cucina • Mario Rossi"

---

## SOLUZIONE TASK-M1: Temperatura Target Default

### Problema
Campo temperatura vuoto quando si seleziona tipo punto.

### Soluzione Implementativa

**File**: `src/features/conservation/components/AddPointModal.tsx`

Aggiungere `useEffect` che imposta temperatura default quando tipo cambia:

```tsx
const DEFAULT_TEMPERATURES: Record<ConservationPointType, number> = {
  fridge: 4,
  freezer: -18,
  blast: -30,
  ambient: 20,
}

// useEffect per impostare temperatura default
useEffect(() => {
  if (formData.pointType && !point) { // Solo in modalità creazione
    const defaultTemp = DEFAULT_TEMPERATURES[formData.pointType]
    if (defaultTemp !== undefined && !formData.targetTemperature) {
      setFormData(prev => ({
        ...prev,
        targetTemperature: String(defaultTemp)
      }))
    }
  }
}, [formData.pointType, point])
```

**Alternativa**: Impostare nel handler del cambio tipo:

```tsx
const handleTypeChange = (type: ConservationPointType) => {
  setFormData(prev => ({
    ...prev,
    pointType: type,
    targetTemperature: prev.targetTemperature || String(DEFAULT_TEMPERATURES[type])
  }))
}
```

---

## SOLUZIONE TASK-M2: Giorni Default da Calendar Settings

### Problema
Frequenza giornaliera seleziona tutti i giorni invece dei soli giorni apertura.

### Soluzione Implementativa

**File**: `src/features/conservation/components/AddPointModal.tsx`

1. Importare e usare hook calendar settings:

```tsx
import { useCalendarSettings } from '@/hooks/useCalendarSettings'

// Nel componente
const { calendarSettings } = useCalendarSettings()

// Ottenere giorni apertura
const openWeekdays = useMemo(() => {
  if (calendarSettings?.open_weekdays?.length > 0) {
    return calendarSettings.open_weekdays
  }
  // Fallback: tutti i giorni
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
}, [calendarSettings])
```

2. Usare `openWeekdays` come default per frequenza giornaliera:

```tsx
// Quando frequenza cambia a 'daily'
if (newFrequency === 'daily') {
  updateMaintenanceTask(index, {
    ...task,
    frequenza: 'daily',
    giorniCustom: openWeekdays // Usa giorni apertura come default
  })
}
```

---

## SOLUZIONE TASK-M3: Modifica Lettura Temperatura

### Problema
Click "Modifica" mostra alert invece di permettere modifica.

### Soluzione Implementativa

**File**: `src/features/conservation/ConservationPage.tsx`

1. Aggiungere state per lettura in modifica:

```tsx
const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null)
```

2. Modificare AddTemperatureModal per supportare modalità edit:

```tsx
<AddTemperatureModal
  isOpen={showTemperatureModal}
  onClose={() => {
    setShowTemperatureModal(false)
    setEditingReading(null) // Reset editing state
  }}
  conservationPoint={selectedPointForTemperature}
  editingReading={editingReading} // Nuova prop
  onSave={async (data) => {
    if (editingReading) {
      // UPDATE
      await updateReading({ id: editingReading.id, ...data })
    } else {
      // CREATE
      await createReading(data)
    }
  }}
/>
```

3. Nel handler del pulsante "Modifica":

```tsx
const handleEditReading = (reading: TemperatureReading) => {
  setEditingReading(reading)
  setSelectedPointForTemperature(/* punto della lettura */)
  setShowTemperatureModal(true)
}
```

**File**: `src/features/conservation/components/AddTemperatureModal.tsx`

4. Aggiungere prop `editingReading` e pre-compilare form:

```tsx
interface AddTemperatureModalProps {
  // ... props esistenti
  editingReading?: TemperatureReading | null
}

// Nel componente
useEffect(() => {
  if (editingReading) {
    setFormData({
      temperature: editingReading.temperature,
      method: editingReading.method || 'digital_thermometer',
      notes: editingReading.notes || '',
      photo_evidence: editingReading.photo_evidence || ''
    })
  }
}, [editingReading])
```

---

## CHECKLIST PRE-IMPLEMENTAZIONE

- [ ] Backup branch: `git checkout -b fix/conservation-issues-20260115`
- [ ] Verificare che build passi: `npm run build`
- [ ] Verificare che test passino: `npm run test -- --run src/features/conservation`

## CHECKLIST POST-IMPLEMENTAZIONE

- [ ] Build passa: `npm run build`
- [ ] Test unitari passano: `npm run test -- --run src/features/conservation`
- [ ] Type check passa: `npm run type-check`
- [ ] Lint passa: `npm run lint`
- [ ] Test manuale su browser (desktop + mobile)

---

## RISCHI E MITIGAZIONI

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Select ancora non funziona dopo fix | Media | Testare con dev tools aperti per vedere errori console |
| Query JOIN rallenta performance | Bassa | Usare `select` con solo campi necessari |
| Invalidazione cache causa flash UI | Bassa | Usare optimistic updates |
| Breaking change tipi TypeScript | Media | Aggiornare tipi in conservation.ts prima di modificare componenti |

---

## ROLLBACK PLAN

Se qualcosa va storto:
```bash
git stash  # Salva modifiche locali
git checkout main  # Torna a main
git branch -D fix/conservation-issues-20260115  # Elimina branch problematico
```

---

**Piano creato da**: Claude Opus 4.5
**Data**: 2026-01-15
