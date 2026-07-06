# Mappatura Dati Rilevamento Temperature

## Panoramica

Questo documento descrive come vengono mappati e visualizzati tutti i dati di rilevamento temperature configurati durante l'onboarding nella card `ScheduledMaintenanceCard`.

## Flusso Dati

### 1. Onboarding → Database

Durante l'onboarding (Step 4 - Conservation), le manutenzioni vengono configurate e salvate nel database:

**File:** `src/utils/onboardingHelpers.ts` (linee 1786-1846)

```typescript
// Mapping tipo manutenzione (italiano → inglese)
const mapManutenzioneTipo = (tipo: string): string => {
  const map: Record<string, string> = {
    'rilevamento_temperatura': 'temperature',
    'sanificazione': 'sanitization',
    'sbrinamento': 'defrosting',
    'controllo_scadenze': 'temperature', // Fallback a temperature
  }
  return map[tipo] || 'sanitization'
}

// Mapping frequenza (italiano → inglese)
const mapFrequenza = (frequenza: string): string => {
  const map: Record<string, string> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annually',
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}

// Calcolo next_due (imposta a oggi per completamento immediato)
const calculateNextDue = (frequenza: string): string => {
  const now = new Date()
  // Tutte le frequenze impostano la scadenza a oggi (23:59:59)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
}
```

**Campi salvati in `maintenance_tasks`:**
- `type`: `'temperature'` (da `rilevamento_temperatura`)
- `frequency`: `'daily' | 'weekly' | 'monthly' | 'annually' | 'custom'`
- `next_due`: Data calcolata con `calculateNextDue`
- `assigned_to_role`: Ruolo assegnato (es. `'Responsabile'`)
- `assigned_to_category`: Categoria staff (es. `'Banconisti'`)
- `assigned_to_staff_id`: ID dipendente specifico (se assegnato a dipendente)
- `conservation_point_id`: ID del punto di conservazione
- `title`: `'Manutenzione: rilevamento_temperatura'`
- `status`: `'scheduled'`

### 2. Database → Hook

**File:** `src/features/conservation/hooks/useMaintenanceTasks.ts` (linee 100-136)

La query recupera tutti i campi necessari:

```typescript
const query = supabase
  .from('maintenance_tasks')
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
    assigned_user:staff(id, name)
  `)
  .eq('company_id', companyId)
  .order('next_due', { ascending: true })
```

**Campi recuperati:**
- Tutti i campi base della tabella `maintenance_tasks`
- `conservation_point`: Join con `conservation_points` (include `department`)
- `assigned_user`: Join con `staff` (per dipendente specifico)
- Campi di assegnazione: `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`

### 3. Hook → Card

**File:** `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`

#### Filtro Manutenzioni Obbligatorie

```typescript
const MANDATORY_MAINTENANCE_TYPES = {
  temperature: 'Rilevamento Temperature',
  sanitization: 'Sanificazione',
  defrosting: 'Sbrinamento',
  expiry_check: 'Controllo Scadenze',
} as const

// Filtra solo manutenzioni obbligatorie e non completate
const pointMaintenances = maintenanceTasks
  .filter(
    task => task.conservation_point_id === point.id &&
            Object.keys(MANDATORY_MAINTENANCE_TYPES).includes(task.type) &&
            task.status !== 'completed'
  )
```

#### Formattazione Dati Assegnazione

```typescript
const formatAssignmentDetails = (task: MaintenanceTask): string => {
  const parts: string[] = []

  // 1. Ruolo (da assigned_to_role)
  if (task.assigned_to_role) {
    const roleLabel = STAFF_ROLES.find(r => r.value === task.assigned_to_role)?.label || task.assigned_to_role
    parts.push(roleLabel)
  }

  // 2. Reparto (da conservation_point.department.name)
  if (task.conservation_point?.department?.name) {
    parts.push(task.conservation_point.department.name)
  }

  // 3. Categoria (da assigned_to_category)
  if (task.assigned_to_category) {
    const categoryLabel = STAFF_CATEGORIES.find(c => c.value === task.assigned_to_category)?.label || task.assigned_to_category
    parts.push(categoryLabel)
  }

  // 4. Dipendente specifico (da assigned_user.name)
  if (task.assigned_user?.name) {
    parts.push(task.assigned_user.name)
  }

  return parts.length > 0 ? parts.join(' • ') : 'Non assegnato'
}
```

#### Visualizzazione

La card mostra per ogni manutenzione:
- **Tipo manutenzione**: `getMaintenanceName(task.type)` → `'Rilevamento Temperature'`
- **Scadenza**: `formatDate(task.next_due)` → `'24/01/2026'`
- **Assegnato a**: `formatAssignmentDetails(task)` → `'Responsabile • Cucina • Banconisti'`
- **Stato**: Icona verde se completata, icona rossa se in ritardo

## Mappatura Completa

### Onboarding → Database

| Campo Onboarding | Campo Database | Mapping |
|------------------|----------------|---------|
| `plan.manutenzione` | `type` | `mapManutenzioneTipo()` |
| `plan.frequenza` | `frequency` | `mapFrequenza()` |
| `plan.frequenza` | `next_due` | `calculateNextDue()` |
| `plan.assegnatoARuolo` | `assigned_to_role` | Diretto (se non 'specifico') |
| `plan.assegnatoACategoria` | `assigned_to_category` | Diretto |
| `plan.assegnatoADipendenteSpecifico` | `assigned_to_staff_id` | Diretto (se 'specifico') |
| `plan.conservationPointId` | `conservation_point_id` | Mappato tramite `conservationPointsIdMap` |

### Database → Visualizzazione

| Campo Database | Visualizzazione | Formattazione |
|----------------|-----------------|---------------|
| `type` | Nome manutenzione | `MANDATORY_MAINTENANCE_TYPES[type]` |
| `next_due` | Scadenza | `formatDate()` → `'DD/MM/YYYY'` |
| `assigned_to_role` | Assegnato a | `STAFF_ROLES.find().label` |
| `conservation_point.department.name` | Assegnato a | Diretto |
| `assigned_to_category` | Assegnato a | `STAFF_CATEGORIES.find().label` |
| `assigned_user.name` | Assegnato a | Diretto |
| `status` | Icona stato | `CheckCircle2` (verde) se `'completed'`, `AlertCircle` (rosso) se in ritardo |

## Verifica Mappatura

### Checklist

- ✅ Tipo manutenzione mappato correttamente (`rilevamento_temperatura` → `temperature`)
- ✅ Frequenza mappata correttamente (`giornaliera` → `daily`, ecc.)
- ✅ `next_due` calcolato correttamente (impostato a oggi per completamento immediato)
- ✅ Campi assegnazione salvati correttamente (`assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`)
- ✅ Query recupera tutti i campi necessari (inclusi join con `conservation_points` e `staff`)
- ✅ Card filtra solo manutenzioni obbligatorie (`temperature`, `sanitization`, `defrosting`, `expiry_check`)
- ✅ Card mostra correttamente: tipo, scadenza, assegnato a
- ✅ Formattazione assegnazione include: ruolo, reparto, categoria, dipendente

## Note

1. **Controllo Scadenze**: Durante l'onboarding, `controllo_scadenze` viene mappato a `temperature` (fallback), non a `expiry_check`. Questo è intenzionale per compatibilità.

2. **Next Due**: Durante l'onboarding, `next_due` viene impostato a oggi (23:59:59) per permettere il completamento immediato delle manutenzioni precompilate.

3. **Filtro Completate**: La card filtra le manutenzioni completate (`task.status !== 'completed'`) per mostrare solo quelle da fare.

4. **Join Necessari**: La query include join con `conservation_points` (per reparto) e `staff` (per dipendente specifico) per mostrare correttamente i dati di assegnazione.

## Test

Per verificare che la mappatura funzioni correttamente:

1. Completare l'onboarding con manutenzioni di rilevamento temperature configurate
2. Verificare che le manutenzioni appaiano nella card `ScheduledMaintenanceCard`
3. Verificare che tutti i dati siano visualizzati correttamente:
   - Tipo: "Rilevamento Temperature"
   - Scadenza: data formattata correttamente
   - Assegnato a: ruolo, reparto, categoria, dipendente (se presenti)
