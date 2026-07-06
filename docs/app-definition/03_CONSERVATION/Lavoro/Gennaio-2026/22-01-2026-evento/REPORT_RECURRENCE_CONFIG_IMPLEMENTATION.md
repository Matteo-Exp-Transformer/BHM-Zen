# Report: Implementazione recurrence_config per Manutenzioni

**Data:** 22 Gennaio 2026  
**Obiettivo:** Persistere e utilizzare i dati di ricorrenza configurati durante l'onboarding per il ricalcolo corretto di `next_due` dopo completamento manutenzioni  
**Status:** ✅ Completato e applicato al database

---

## 📋 Riepilogo Esecutivo

È stata implementata la persistenza della configurazione di ricorrenza (`recurrence_config`) per le manutenzioni programmate. Questo permette di:

1. **Salvare** i giorni specifici configurati durante l'onboarding (giorni settimana, giorno mese, giorno anno)
2. **Ricalcolare correttamente** `next_due` dopo il completamento di una manutenzione, rispettando i giorni configurati
3. **Ripopolare** il form in modalità edit con i dati di ricorrenza salvati

---

## 🔍 Problema Identificato

### Situazione Precedente

Prima di questa implementazione, quando una manutenzione veniva completata, il sistema ricalcolava `next_due` usando solo la frequenza (daily, weekly, monthly, annually) senza considerare:

- **Giornaliera:** quali giorni della settimana erano stati selezionati (es. solo lunedì, mercoledì, venerdì)
- **Settimanale:** quale giorno specifico della settimana era stato configurato
- **Mensile:** quale giorno del mese (1-31) era stato selezionato
- **Annuale:** quale data specifica era stata configurata (per sbrinamento)

**Risultato:** Le scadenze successive non rispettavano la configurazione originale, causando manutenzioni programmate in giorni non previsti.

### Esempio Pratico

- **Configurazione onboarding:** Rilevamento Temperature ogni **lunedì, mercoledì, venerdì**
- **Completamento:** Lunedì 20 Gennaio
- **Problema:** `next_due` veniva calcolato come "domani" (martedì 21) invece di "mercoledì 22"
- **Dopo fix:** `next_due` viene calcolato correttamente come "mercoledì 22"

---

## ✅ Modifiche Implementate

### 1. Migration Database

**File:** `database/migrations/019_add_recurrence_config_to_maintenance_tasks.sql`

Aggiunta colonna `recurrence_config JSONB` alla tabella `maintenance_tasks`:

```sql
ALTER TABLE public.maintenance_tasks
  ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;

COMMENT ON COLUMN public.maintenance_tasks.recurrence_config IS
  'Configurazione ricorrenza manutenzione: {
    weekdays: ["lunedi", "martedi", ...],  -- Giorni settimana per daily/weekly
    day_of_month: 15,                       -- Giorno del mese (1-31) per monthly
    day_of_year: "2026-03-15"              -- Data specifica per annually (sbrinamento)
  }';

-- Indice GIN per query JSONB efficienti
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_recurrence_config
  ON public.maintenance_tasks USING gin(recurrence_config);
```

**Status:** ✅ Applicata al database Supabase il 22/01/2026

**Verifica:**
- ✅ Colonna `recurrence_config` creata (tipo: JSONB, nullable: YES)
- ✅ Indice GIN creato per query efficienti

---

### 2. Tipo TypeScript

**File:** `src/types/conservation.ts` (righe 114-125)

Aggiunto tipo `MaintenanceRecurrenceConfig` e campo `recurrence_config` a `MaintenanceTask`:

```typescript
/**
 * Configurazione ricorrenza per manutenzioni
 * Usato per calcolare correttamente il next_due dopo completamento
 */
export interface MaintenanceRecurrenceConfig {
  /** Giorni della settimana per frequenze daily/weekly */
  weekdays?: ('lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica')[]
  /** Giorno del mese (1-31) per frequenza monthly */
  day_of_month?: number
  /** Data ISO per frequenza annually (usato per sbrinamento) */
  day_of_year?: string
}

export interface MaintenanceTask {
  // ... altri campi ...
  recurrence_config?: MaintenanceRecurrenceConfig | null
}
```

---

### 3. Salvataggio Dati Ricorrenza

**File:** `src/features/conservation/components/AddPointModal.tsx`

#### 3.1 Funzione `transformMaintenanceTasks` (righe 990-1046)

Costruisce e salva `recurrence_config` durante la creazione/modifica di un punto di conservazione:

```typescript
const transformMaintenanceTasks = (tasks: MandatoryMaintenanceTask[]) => {
  return tasks.map(task => {
    // ... mapping altri campi ...
    
    // Costruisci recurrence_config per persistere i dati di ricorrenza
    const recurrence_config: {
      weekdays?: string[]
      day_of_month?: number
      day_of_year?: string
    } = {}

    // Salva giorni settimana per frequenze giornaliera/settimanale
    if (task.giorniSettimana && task.giorniSettimana.length > 0) {
      recurrence_config.weekdays = task.giorniSettimana
    }

    // Salva giorno del mese per frequenza mensile
    if (task.giornoMese && task.giornoMese >= 1 && task.giornoMese <= 31) {
      recurrence_config.day_of_month = task.giornoMese
    }

    // Salva giorno dell'anno per frequenza annuale (sbrinamento)
    if (task.giornoAnno) {
      const year = new Date().getFullYear()
      const date = new Date(year, 0) // 1 gennaio
      date.setDate(task.giornoAnno)
      recurrence_config.day_of_year = date.toISOString().split('T')[0]
    }

    return {
      // ... altri campi ...
      recurrence_config: Object.keys(recurrence_config).length > 0 ? recurrence_config : null,
    }
  })
}
```

#### 3.2 Funzione `transformMaintenanceTaskToForm` (righe 674-700)

Legge `recurrence_config` dal database per ripopolare il form in modalità edit:

```typescript
const transformMaintenanceTaskToForm = (task: DBMaintenanceTask): MandatoryMaintenanceTask => {
  // ... mapping altri campi ...
  
  // Estrai dati di ricorrenza da recurrence_config se presente
  const recurrenceConfig = task.recurrence_config
  let giorniSettimana: Weekday[] | undefined = undefined
  let giornoMese: number | undefined = undefined
  let giornoAnno: number | undefined = undefined

  if (recurrenceConfig) {
    // Leggi weekdays (giorni settimana)
    if (recurrenceConfig.weekdays && Array.isArray(recurrenceConfig.weekdays)) {
      giorniSettimana = recurrenceConfig.weekdays as Weekday[]
    }
    // Leggi day_of_month (giorno del mese)
    if (recurrenceConfig.day_of_month && typeof recurrenceConfig.day_of_month === 'number') {
      giornoMese = recurrenceConfig.day_of_month
    }
    // Leggi day_of_year e convertilo in numero 1-365
    if (recurrenceConfig.day_of_year && typeof recurrenceConfig.day_of_year === 'string') {
      const date = new Date(recurrenceConfig.day_of_year)
      const startOfYear = new Date(date.getFullYear(), 0, 0)
      const diff = date.getTime() - startOfYear.getTime()
      giornoAnno = Math.floor(diff / (1000 * 60 * 60 * 24))
    }
  }

  return {
    // ... altri campi ...
    giorniSettimana,
    giornoMese,
    giornoAnno,
  }
}
```

---

### 4. Ricalcolo next_due dopo Completamento

**File:** `src/features/conservation/hooks/useMaintenanceTasks.ts`

#### 4.1 Funzione `calculateNextDueWithRecurrence` (righe 95-173)

Nuova funzione che calcola `next_due` rispettando `recurrence_config`:

```typescript
export const calculateNextDueWithRecurrence = (
  frequency: MaintenanceFrequency,
  recurrenceConfig: MaintenanceRecurrenceConfig | null | undefined,
  fromDate: Date = new Date()
): string => {
  // Se non c'è recurrence_config, usa il calcolo semplice
  if (!recurrenceConfig) {
    return calculateNextDue(frequency, fromDate)
  }

  const today = new Date(fromDate)
  today.setHours(0, 0, 0, 0)

  // DAILY: trova il prossimo giorno lavorativo tra quelli configurati
  if (frequency === 'daily' && recurrenceConfig.weekdays && recurrenceConfig.weekdays.length > 0) {
    const targetDays = new Set(recurrenceConfig.weekdays.map(w => WEEKDAY_TO_JS_DAY[w]))
    const next = new Date(today)
    next.setDate(next.getDate() + 1) // Parti da domani

    for (let i = 0; i < 8; i++) {
      if (targetDays.has(next.getDay())) {
        return next.toISOString()
      }
      next.setDate(next.getDate() + 1)
    }
    // Fallback: usa domani
    const fallback = new Date(today)
    fallback.setDate(fallback.getDate() + 1)
    return fallback.toISOString()
  }

  // WEEKLY: trova la prossima occorrenza del giorno configurato
  if (frequency === 'weekly' && recurrenceConfig.weekdays && recurrenceConfig.weekdays.length > 0) {
    const targetDay = WEEKDAY_TO_JS_DAY[recurrenceConfig.weekdays[0]]
    const next = new Date(today)
    next.setDate(next.getDate() + 1) // Parti da domani

    const currentDay = next.getDay()
    let daysToAdd = targetDay - currentDay
    if (daysToAdd <= 0) {
      daysToAdd += 7 // Vai alla prossima settimana
    }
    next.setDate(next.getDate() + daysToAdd)
    return next.toISOString()
  }

  // MONTHLY: usa il giorno del mese configurato
  if (frequency === 'monthly' && recurrenceConfig.day_of_month) {
    const dayOfMonth = recurrenceConfig.day_of_month
    const next = new Date(today)

    // Se siamo già oltre il giorno target nel mese corrente, vai al mese prossimo
    if (today.getDate() >= dayOfMonth) {
      next.setMonth(next.getMonth() + 1)
    }

    // Imposta il giorno del mese (gestendo mesi corti)
    const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
    next.setDate(Math.min(dayOfMonth, lastDayOfMonth))

    return next.toISOString()
  }

  // ANNUALLY: usa la data specifica configurata
  if (frequency === 'annually' && recurrenceConfig.day_of_year) {
    const targetDate = new Date(recurrenceConfig.day_of_year)
    const next = new Date(today.getFullYear(), targetDate.getMonth(), targetDate.getDate())

    // Se la data è già passata quest'anno, vai all'anno prossimo
    if (next <= today) {
      next.setFullYear(next.getFullYear() + 1)
    }

    return next.toISOString()
  }

  // Fallback: usa calcolo semplice
  return calculateNextDue(frequency, fromDate)
}
```

#### 4.2 Utilizzo in `completeTaskMutation` (righe 363-452)

La funzione viene chiamata quando una manutenzione viene completata:

```typescript
const completeTaskMutation = useMutation({
  mutationFn: async (completion: Omit<MaintenanceCompletion, ...>) => {
    // ... validazioni ...
    
    // 1. Recupera il task corrente dal database
    const { data: task, error: taskError } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('id', completion.maintenance_task_id)
      .single()

    // 2. Calcola la nuova scadenza basata sulla frequenza e recurrence_config
    const completedAt = completion.completed_at ? new Date(completion.completed_at) : new Date()
    const recurrenceConfig = (task as any).recurrence_config as MaintenanceRecurrenceConfig | null
    const nextDue = calculateNextDueWithRecurrence(
      task.frequency as MaintenanceTask['frequency'],
      recurrenceConfig,
      completedAt
    )

    // 3. Crea il record di completamento con next_due calcolato
    // ...
  }
})
```

---

### 5. Insert nel Database

**File:** `src/features/conservation/hooks/useConservationPoints.ts` (riga 123)

Il campo `recurrence_config` viene ora incluso nell'insert delle manutenzioni:

```typescript
const tasksToInsert = maintenanceTasks.map(task => ({
  // ... altri campi ...
  // Persisti recurrence_config per ricalcolo next_due dopo completamento
  recurrence_config: (task as any).recurrence_config || null,
}))

const { error: tasksError } = await supabase
  .from('maintenance_tasks')
  .insert(tasksToInsert)
```

---

## 🔄 Flusso Dati Completo

### Creazione/Modifica Punto di Conservazione

1. **Form (AddPointModal):** Utente compila manutenzioni con:
   - Frequenza (giornaliera, settimanale, mensile, annuale)
   - Giorni settimana (per giornaliera/settimanale)
   - Giorno mese (per mensile)
   - Giorno anno (per annuale)

2. **Transform (`transformMaintenanceTasks`):**
   - Costruisce `recurrence_config` con i dati del form
   - Calcola `next_due` iniziale usando `computeNextDueFromFormTask`

3. **Salvataggio (`useConservationPoints.createConservationPoint`):**
   - Insert in `conservation_points`
   - Insert in `maintenance_tasks` con `recurrence_config`

### Completamento Manutenzione

1. **Completamento (`useMaintenanceTasks.completeTaskMutation`):**
   - Recupera task dal database (include `recurrence_config`)
   - Chiama `calculateNextDueWithRecurrence` con:
     - Frequenza
     - `recurrence_config` dal database
     - Data di completamento

2. **Calcolo (`calculateNextDueWithRecurrence`):**
   - **Daily:** trova prossimo giorno tra `weekdays` configurati
   - **Weekly:** trova prossima occorrenza del giorno in `weekdays[0]`
   - **Monthly:** usa `day_of_month` (gestisce mesi corti)
   - **Annually:** usa `day_of_year` (data ISO)

3. **Update:**
   - Crea record in `maintenance_completions`
   - Aggiorna `maintenance_tasks.next_due` con il nuovo valore

### Edit Punto di Conservazione

1. **Caricamento (`transformMaintenanceTaskToForm`):**
   - Legge `recurrence_config` dal database
   - Estrae `weekdays`, `day_of_month`, `day_of_year`
   - Ripopola il form con i valori salvati

2. **Modifica:**
   - Utente può modificare i valori
   - `transformMaintenanceTasks` salva i nuovi valori in `recurrence_config`

---

## 📊 Formato Dati recurrence_config

### Esempio: Giornaliera (lunedì, mercoledì, venerdì)

```json
{
  "weekdays": ["lunedi", "mercoledi", "venerdi"]
}
```

### Esempio: Settimanale (ogni lunedì)

```json
{
  "weekdays": ["lunedi"]
}
```

### Esempio: Mensile (giorno 15)

```json
{
  "day_of_month": 15
}
```

### Esempio: Annuale (sbrinamento - 15 marzo)

```json
{
  "day_of_year": "2026-03-15"
}
```

### Esempio: Completo (giornaliera con giorni specifici)

```json
{
  "weekdays": ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi"]
}
```

---

## 🧪 Test e Verifica

### Verifica Database

✅ **Migration applicata:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'maintenance_tasks'
  AND column_name = 'recurrence_config';
```

**Risultato:**
- `column_name`: `recurrence_config`
- `data_type`: `jsonb`
- `is_nullable`: `YES`

✅ **Indice creato:**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'maintenance_tasks'
  AND indexname = 'idx_maintenance_tasks_recurrence_config';
```

**Risultato:**
- Indice GIN creato correttamente

### Test Funzionali

1. ✅ **Creazione punto con manutenzioni:** `recurrence_config` viene salvato correttamente
2. ✅ **Completamento manutenzione:** `next_due` viene ricalcolato rispettando i giorni configurati
3. ✅ **Edit punto:** Form viene ripopolato con i dati di ricorrenza salvati

---

## 📁 File Modificati

| File | Modifiche | Righe |
|------|----------|-------|
| `database/migrations/019_add_recurrence_config_to_maintenance_tasks.sql` | Nuova migration | 1-40 |
| `src/types/conservation.ts` | Aggiunto `MaintenanceRecurrenceConfig` e campo `recurrence_config` | 114-125 |
| `src/features/conservation/components/AddPointModal.tsx` | `transformMaintenanceTasks`: salva `recurrence_config` | 1001-1043 |
| `src/features/conservation/components/AddPointModal.tsx` | `transformMaintenanceTaskToForm`: legge `recurrence_config` | 678-700 |
| `src/features/conservation/hooks/useMaintenanceTasks.ts` | `calculateNextDueWithRecurrence`: nuovo calcolo con ricorrenza | 95-173 |
| `src/features/conservation/hooks/useMaintenanceTasks.ts` | `completeTaskMutation`: usa `calculateNextDueWithRecurrence` | 380-391 |
| `src/features/conservation/hooks/useConservationPoints.ts` | Insert include `recurrence_config` | 123-124 |

---

## 🎯 Risultati Ottenuti

### Prima dell'Implementazione

- ❌ `next_due` ricalcolato senza considerare giorni specifici
- ❌ Manutenzioni programmate in giorni non previsti
- ❌ Dati di ricorrenza persi dopo il salvataggio
- ❌ Form edit non ripopolato con giorni configurati

### Dopo l'Implementazione

- ✅ `next_due` ricalcolato rispettando giorni configurati
- ✅ Manutenzioni programmate solo nei giorni previsti
- ✅ Dati di ricorrenza persistiti in database
- ✅ Form edit ripopolato correttamente

---

## 🔮 Possibili Estensioni Future

1. **Gestione giorni festivi:** Escludere giorni festivi dal calcolo per frequenze giornaliere
2. **Ricorrenze complesse:** Supporto per pattern più complessi (es. "ogni 2 settimane", "ultimo giorno del mese")
3. **Validazione:** Verificare che i giorni configurati siano compatibili con le impostazioni aziendali (giorni di apertura)
4. **Notifiche:** Avvisare quando una manutenzione viene programmata in un giorno non previsto

---

## 📝 Note Tecniche

### Gestione Mesi Corti

Per frequenze mensili, se `day_of_month` è maggiore dell'ultimo giorno del mese (es. 31 in febbraio), viene usato l'ultimo giorno disponibile:

```typescript
const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
```

### Conversione Giorno Anno

Il form usa un numero 1-365 per il giorno dell'anno, ma nel database viene salvato come data ISO (`YYYY-MM-DD`) per maggiore precisione e gestione degli anni bisestili.

### Indice GIN

L'indice GIN su `recurrence_config` permette query efficienti su campi JSONB, utile per future funzionalità di ricerca/filtro per ricorrenze.

---

## ✅ Checklist Completamento

- [x] Migration database creata e applicata
- [x] Tipo TypeScript definito
- [x] Salvataggio `recurrence_config` in `transformMaintenanceTasks`
- [x] Lettura `recurrence_config` in `transformMaintenanceTaskToForm`
- [x] Funzione `calculateNextDueWithRecurrence` implementata
- [x] Utilizzo in `completeTaskMutation`
- [x] Insert include `recurrence_config` in `useConservationPoints`
- [x] Verifica database completata
- [x] Documentazione completa

---

**Fine Report**
