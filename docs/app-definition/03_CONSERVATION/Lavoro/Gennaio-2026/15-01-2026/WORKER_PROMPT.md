# WORKER PROMPT - Conservation Feature Fix
## Data: 2026-01-15
## Versione: 2.0 - Multi-Agent

---

## ARCHITETTURA AGENTI

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPERVISOR (Tu)                          │
│         Coordina e verifica completamento task              │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   AGENTE 1    │     │   AGENTE 2    │     │   AGENTE 3    │
│  UI/Component │     │  Hooks/Query  │     │   Feature     │
│               │     │               │     │               │
│ Task: C1, M1  │     │ Task: A1, A2  │     │ Task: M2, M3  │
│               │     │               │     │               │
│ Skill:        │     │ Skill:        │     │ Skill:        │
│ - Radix UI    │     │ - React Query │     │ - React State │
│ - z-index     │     │ - Supabase    │     │ - Custom Hooks│
│ - Forms       │     │ - Mutations   │     │ - Modals      │
└───────────────┘     └───────────────┘     └───────────────┘
```

---

## ORDINE DI ESECUZIONE

1. **AGENTE 1** (Task C1) → Sblocca creazione punti
2. **AGENTE 2** (Task A1, A2) → Fix gestione manutenzioni
3. **AGENTE 3** (Task M2, M3) → Miglioramenti UX
4. **AGENTE 1** (Task M1) → Temperatura default (dopo C1)

---

# AGENTE 1: UI/Component Specialist

## Profilo
- **Nome**: Agent-UI-Fix
- **Competenze**: Radix UI, z-index, CSS, Form handling, React components
- **Task Assegnate**: C1 (CRITICO), M1 (MEDIO)

## PROMPT DI AVVIO AGENTE 1

```
Sei un agente specializzato in fix UI React con Radix UI.

## CONTESTO
Stai lavorando sul progetto BHM v.2, un'app React + TypeScript per gestione HACCP.
Il problema principale è che il Select Radix UI per selezionare il ruolo nelle manutenzioni non si apre.

## TASK ASSEGNATE

### TASK C1: Fix Select Ruolo (CRITICO)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Click su "Seleziona ruolo..." non apre il dropdown

**Passi da seguire**:
1. Leggi il file AddPointModal.tsx
2. Cerca i Select per ruolo (cerca "assegnatoARuolo" o "role-select")
3. Verifica che la struttura sia corretta:
   - Select deve avere `value` e `onValueChange`
   - SelectContent deve essere dentro SelectPrimitive.Portal
4. Se il problema è z-index, modifica SelectContent aggiungendo:
   ```tsx
   <SelectContent position="popper" sideOffset={5} className="z-[10001]">
   ```
5. Se il problema è overflow, verifica che il container form abbia `overflow-y-auto` solo sulla parte scrollabile

**Verifica**:
```bash
npm run build && npm run type-check
```

### TASK M1: Temperatura Target Default (dopo C1)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Campo temperatura vuoto invece di valore default per tipo

**Passi da seguire**:
1. Aggiungi costante dopo gli import:
   ```tsx
   const DEFAULT_TEMPERATURES: Record<string, number> = {
     fridge: 4,
     freezer: -18,
     blast: -30,
     ambient: 20,
   }
   ```
2. Trova handler cambio tipo o aggiungi useEffect:
   ```tsx
   useEffect(() => {
     if (!point && formData.pointType && !formData.targetTemperature) {
       const defaultTemp = DEFAULT_TEMPERATURES[formData.pointType]
       if (defaultTemp !== undefined) {
         setFormData(prev => ({
           ...prev,
           targetTemperature: String(defaultTemp)
         }))
       }
     }
   }, [formData.pointType, point])
   ```

**Verifica**:
```bash
npm run build && npm run type-check
```

## OUTPUT RICHIESTO
- File modificati con descrizione cambiamenti
- Risultato build/type-check
- Eventuali problemi riscontrati

## REGOLE
- NON modificare file non elencati
- Se trovi errori, documentali ma prosegui
- Esegui sempre verifica dopo ogni modifica
```

---

# AGENTE 2: Hooks/Query Specialist

## Profilo
- **Nome**: Agent-Hooks-Fix
- **Competenze**: React Query, Supabase, Mutations, Cache invalidation
- **Task Assegnate**: A1 (ALTO), A2 (ALTO)

## PROMPT DI AVVIO AGENTE 2

```
Sei un agente specializzato in React Query e Supabase.

## CONTESTO
Stai lavorando sul progetto BHM v.2, un'app React + TypeScript per gestione HACCP.
I problemi riguardano la gestione cache e query delle manutenzioni.

## TASK ASSEGNATE

### TASK A1: Fix Manutenzione Completata Rimane Visibile (ALTO)
**File**: `src/features/conservation/hooks/useMaintenanceTasks.ts`
**Problema**: Dopo click "Completa", la manutenzione non scompare dalla lista

**Passi da seguire**:
1. Leggi il file useMaintenanceTasks.ts
2. Cerca la mutation per completare manutenzioni (cerca "completeTask" o "useMutation")
3. Verifica che `onSuccess` invalidi la cache:
   ```tsx
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] })
     queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
     toast.success('Manutenzione completata')
   }
   ```
4. Se già presente ma non funziona, usa refetch:
   ```tsx
   onSuccess: async () => {
     await queryClient.refetchQueries({ queryKey: ['maintenanceTasks'] })
     toast.success('Manutenzione completata')
   }
   ```

**Verifica**:
```bash
npm run build && npm run test -- --run src/features/conservation/hooks
```

### TASK A2: Fix Visualizzazione Assegnazione (ALTO)
**File**: `src/features/conservation/hooks/useMaintenanceTasks.ts`
**Problema**: Mostra solo "responsabile" invece di ruolo+categoria+reparto+dipendente

**Passi da seguire**:
1. Trova la query che carica le manutenzioni (useQuery con `from('maintenance_tasks')`)
2. Verifica che includa i JOIN necessari:
   ```tsx
   const { data, error } = await supabase
     .from('maintenance_tasks')
     .select(`
       *,
       conservation_point:conservation_points (
         id,
         name,
         type,
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
   ```
3. Se i JOIN non sono presenti, aggiungili
4. Verifica che i tipi TypeScript siano aggiornati per includere i campi joinati

**Verifica**:
```bash
npm run build && npm run type-check
```

## OUTPUT RICHIESTO
- File modificati con descrizione cambiamenti
- Risultato build/test
- Query prima e dopo modifica

## REGOLE
- NON modificare logica business, solo query e cache
- Verifica sempre che i JOIN siano corretti
- Documenta se trovi campi mancanti nel DB
```

---

# AGENTE 3: Feature Specialist

## Profilo
- **Nome**: Agent-Feature-Dev
- **Competenze**: React state management, Custom hooks, Modal implementation
- **Task Assegnate**: M2 (MEDIO), M3 (MEDIO)

## PROMPT DI AVVIO AGENTE 3

```
Sei un agente specializzato in implementazione feature React.

## CONTESTO
Stai lavorando sul progetto BHM v.2, un'app React + TypeScript per gestione HACCP.
Devi implementare miglioramenti UX per la sezione Conservation.

## TASK ASSEGNATE

### TASK M2: Giorni Default da Calendar Settings (MEDIO)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Frequenza giornaliera seleziona tutti i giorni invece dei soli giorni apertura

**Passi da seguire**:
1. Aggiungi import:
   ```tsx
   import { useCalendarSettings } from '@/hooks/useCalendarSettings'
   ```
2. Nel componente, usa l'hook:
   ```tsx
   const { calendarSettings } = useCalendarSettings()
   ```
3. Crea memo per giorni apertura:
   ```tsx
   const openWeekdays = useMemo(() => {
     if (calendarSettings?.open_weekdays?.length > 0) {
       return calendarSettings.open_weekdays
     }
     return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
   }, [calendarSettings])
   ```
4. Usa `openWeekdays` quando frequenza è 'daily':
   ```tsx
   if (newFrequency === 'daily') {
     updateMaintenanceTask(index, {
       ...task,
       frequenza: 'daily',
       giorniCustom: openWeekdays
     })
   }
   ```

**Verifica**:
```bash
npm run build && npm run type-check
```

### TASK M3: Modifica Lettura Temperatura (MEDIO)
**File 1**: `src/features/conservation/ConservationPage.tsx`
**File 2**: `src/features/conservation/components/AddTemperatureModal.tsx`
**Problema**: Click "Modifica" mostra alert invece di permettere modifica

**Passi da seguire**:

**In ConservationPage.tsx**:
1. Aggiungi state:
   ```tsx
   const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null)
   ```
2. Crea handler per modifica:
   ```tsx
   const handleEditReading = (reading: TemperatureReading) => {
     const point = conservationPoints?.find(p => p.id === reading.conservation_point_id)
     if (point) {
       setEditingReading(reading)
       setSelectedPointForTemperature(point)
       setShowTemperatureModal(true)
     }
   }
   ```
3. Modifica props AddTemperatureModal:
   ```tsx
   <AddTemperatureModal
     isOpen={showTemperatureModal}
     onClose={() => {
       setShowTemperatureModal(false)
       setEditingReading(null)
     }}
     conservationPoint={selectedPointForTemperature}
     editingReading={editingReading}
     onSave={async (data) => {
       if (editingReading) {
         await updateReading({ id: editingReading.id, ...data })
       } else {
         await createReading(data)
       }
       setShowTemperatureModal(false)
       setEditingReading(null)
     }}
   />
   ```
4. Trova dove c'è `alert('Funzionalità in arrivo')` e sostituisci con `handleEditReading(reading)`

**In AddTemperatureModal.tsx**:
1. Aggiungi prop interface:
   ```tsx
   interface AddTemperatureModalProps {
     // ... props esistenti
     editingReading?: TemperatureReading | null
   }
   ```
2. Pre-compila form se editing:
   ```tsx
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
3. Cambia titolo modal:
   ```tsx
   const modalTitle = editingReading ? 'Modifica Temperatura' : 'Registra Temperatura'
   ```

**Verifica**:
```bash
npm run build && npm run type-check && npm run test -- --run src/features/conservation
```

## OUTPUT RICHIESTO
- File modificati con descrizione cambiamenti
- Risultato build/test
- Screenshot se possibile (test manuale)

## REGOLE
- Mantieni retrocompatibilità (nuove props opzionali)
- Testa sia modalità creazione che modifica
- Documenta se trovi hook mancanti
```

---

# COMANDI PER AVVIARE AGENTI

## Avvio Sequenziale (Consigliato)

### Passo 1: Avvia Agente 1
```
/task Agent-UI-Fix: Esegui TASK C1 (Fix Select Ruolo) seguendo il prompt in WORKER_PROMPT.md sezione AGENTE 1. File principale: src/features/conservation/components/AddPointModal.tsx. Dopo completamento, esegui anche TASK M1 (Temperatura Default).
```

### Passo 2: Avvia Agente 2 (dopo Agente 1)
```
/task Agent-Hooks-Fix: Esegui TASK A1 e A2 seguendo il prompt in WORKER_PROMPT.md sezione AGENTE 2. File principale: src/features/conservation/hooks/useMaintenanceTasks.ts. Focus su cache invalidation e query JOIN.
```

### Passo 3: Avvia Agente 3 (dopo Agente 2)
```
/task Agent-Feature-Dev: Esegui TASK M2 e M3 seguendo il prompt in WORKER_PROMPT.md sezione AGENTE 3. File: AddPointModal.tsx, ConservationPage.tsx, AddTemperatureModal.tsx.
```

---

## Avvio Parallelo (Se indipendenti)

```
# Avvia tutti gli agenti contemporaneamente
/task parallel Agent-UI-Fix Agent-Hooks-Fix Agent-Feature-Dev
```

**ATTENZIONE**: L'avvio parallelo può causare conflitti se gli agenti modificano lo stesso file. Consigliato solo se le task sono su file diversi.

---

# VERIFICA FINALE (Post-Agenti)

Dopo che tutti gli agenti hanno completato, esegui:

```bash
# 1. Build completo
npm run build

# 2. Type check
npm run type-check

# 3. Lint
npm run lint

# 4. Test Conservation
npm run test -- --run src/features/conservation

# 5. Test completi
npm run test
```

---

# CHECKLIST SUPERVISOR

- [ ] Agente 1 completato (C1, M1)
- [ ] Agente 2 completato (A1, A2)
- [ ] Agente 3 completato (M2, M3)
- [ ] Build finale PASS
- [ ] Type-check finale PASS
- [ ] Test finale PASS
- [ ] EXECUTION_LOG.md compilato

---

# TROUBLESHOOTING

## Se Agente 1 fallisce su C1 (Select)
Possibili cause:
1. z-index non sufficiente → aumenta a z-[10002]
2. overflow:hidden sul modal → sposta overflow solo su scroll area
3. evento bloccato → verifica stopPropagation

## Se Agente 2 fallisce su A1 (Cache)
Possibili cause:
1. queryKey errato → verifica che sia esattamente `['maintenanceTasks']`
2. queryClient non importato → aggiungi `const queryClient = useQueryClient()`

## Se Agente 3 fallisce su M3 (Edit)
Possibili cause:
1. updateReading non esiste → cerca funzione esistente o creala in useTemperatureReadings
2. tipo TemperatureReading non importato → aggiungi import

---

**Prompt creato da**: Claude Opus 4.5
**Data**: 2026-01-15
**Versione**: 2.0
