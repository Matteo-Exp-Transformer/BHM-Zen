# Report: Manutenzioni ricorrenti visibili nel calendario

**Data:** 15-02-2026  
**Riferimento piano:** `calendario_manutenzioni_ricorrenti_f8dc5c34.plan.md`  
**Stato:** Implementazione completata — **testing ancora da eseguire**  
**Sessione:** Esecuzione piano (skill executing-plans)

---

## 1. Obiettivo

Le manutenzioni programmate con ripetizione (giornaliera/settimanale/mensile/annuale) devono comparire nel calendario **nei giorni corretti** del mese/anno in base alla configurazione scelta, non concentrate in un solo giorno.

---

## 2. Lavoro svolto (documentazione completa)

### 2.1 Tipo TypeScript

**File:** `src/types/conservation.ts`

- **Aggiunta** interfaccia `MaintenanceRecurrenceConfig`:
  - `weekdays?: string[]` — giorni settimana (lunedi, martedi, …) per daily/weekly
  - `day_of_month?: number` — giorno del mese (1–31) per monthly
  - `day_of_year?: string` — data ISO (YYYY-MM-DD) per annually
- **Aggiunto** in `MaintenanceTask` il campo opzionale:  
  `recurrence_config?: MaintenanceRecurrenceConfig | null`

*(Nessuna modifica alla tabella DB: la colonna `recurrence_config` JSONB esiste già dalla migration 019.)*

---

### 2.2 Add Point Modal (Conservazione) — persistenza e form edit

**File:** `src/features/conservation/components/AddPointModal.tsx`

**A) Funzione `transformMaintenanceTasks` (invocata in submit):**

- Per ogni task del form viene costruito un oggetto da inviare a `useConservationPoints`; a tale oggetto è stato aggiunto il campo `recurrence_config` quando applicabile:
  - **daily / weekly / custom** e `task.giorniSettimana` valorizzato →  
    `recurrence_config = { weekdays: [...task.giorniSettimana] }`
  - **monthly** e `task.giornoMese` in 1–31 →  
    `recurrence_config = { day_of_month: task.giornoMese }`
  - **annually** e `task.giornoAnno` in 1–366 →  
    conversione in data ISO (anno 2024 come template) e  
    `recurrence_config = { day_of_year: template.toISOString().slice(0, 10) }`
- L’oggetto restituito include `...(recurrence_config && { recurrence_config })` in modo che il campo sia presente solo quando valorizzato.

**B) Funzione `transformMaintenanceTaskToForm` (caricamento in modalità edit):**

- Quando si apre il modal in modifica, i task esistenti (dal DB) vengono trasformati nel formato `MandatoryMaintenanceTask` del form. Sono stati aggiunti:
  - **giorniSettimana:** da `task.recurrence_config?.weekdays` (filtrati sui valori ammessi `Weekday[]`)
  - **giornoMese:** da `task.recurrence_config?.day_of_month` se in 1–31
  - **giornoAnno:** da `task.recurrence_config?.day_of_year` (data ISO) convertito in giorno dell’anno 1–366 con  
    `Math.floor((d.getTime() - start.getTime()) / 86400000) + 1` dove `start = new Date(d.getFullYear(), 0, 1)`

In questo modo il form in edit mostra correttamente i giorni già salvati e permette di modificarli.

---

### 2.3 Insert manutenzioni in useConservationPoints

**File:** `src/features/conservation/hooks/useConservationPoints.ts`

- Nell’array `tasksToInsert` usato per l’insert in `maintenance_tasks` è stato aggiunto, per ogni elemento, il campo:  
  `recurrence_config: task.recurrence_config ?? null`  
  così che il valore restituito da `transformMaintenanceTasks` venga persistito in DB.

*(L’update dei singoli task avviene tramite `useMaintenanceTasks.updateTaskMutation`, che già invia `...data` al backend; includendo `recurrence_config` nel tipo `MaintenanceTask`, il campo viene inviato quando presente.)*

---

### 2.4 Persistenza manutenzioni da Onboarding

**File:** `src/utils/onboardingHelpers.ts`

- Nel blocco che, a partire da `formData.tasks.conservationMaintenancePlans`, costruisce gli oggetti per l’insert in `maintenance_tasks` (circa righe 1810–1870):
  - **Costruzione di `recurrence_config`:**  
    se `plan.frequenza` è `'custom'`, `'giornaliera'` o `'settimanale'` e `plan.giorniCustom` è un array non vuoto, viene impostato  
    `recurrence_config = { weekdays: [...plan.giorniCustom] }`.
  - L’oggetto restituito dalla `map` include  
    `...(recurrence_config && { recurrence_config })`.
- Per **mensile** e **annuale** l’onboarding al momento non raccoglie `giornoMese`/`giornoAnno` nello step TasksStep; quindi non viene costruito `day_of_month`/`day_of_year` (coerente con il piano). Il calendario, in assenza di questi campi, usa il fallback basato solo su `frequency`.

---

### 2.5 Calendario: range di espansione e uso di recurrence_config

**File:** `src/features/calendar/hooks/useAggregatedEvents.ts`

**A) Import e costanti:**

- Aggiunti import da `date-fns`: `addYears`, `startOfYear`, `endOfYear`.
- Aggiunto import del tipo `MaintenanceRecurrenceConfig` da `@/types/conservation`.
- Aggiunta mappatura **`WEEKDAY_IT_TO_DAY`** (nomi giorni italiani → `getDay()`: domenica=0, lunedi=1, … sabato=6) per interpretare `recurrence_config.weekdays`.

**B) Nuova funzione `getMaintenanceRecurrenceDates(task, rangeStart, rangeEnd)`:**

- Restituisce un array di `Date` di occorrenze della manutenzione nell’intervallo `[rangeStart, rangeEnd]` usando **solo** `task.recurrence_config` e `task.frequency`:
  - **daily:** iterazione giorno per giorno nel range; incluse solo le date il cui `getDay()` è in `recurrence_config.weekdays` (tradotti con `WEEKDAY_IT_TO_DAY`).
  - **weekly:** stessa logica (più occorrenze per settimana se sono più giorni in `weekdays`).
  - **monthly:** per ogni mese nel range, una data il giorno `day_of_month` (con cap al last day del mese se il mese è più corto).
  - **annually:** parsing di `day_of_year` come ISO o MM-DD; per ogni anno nel range, una data con stesso mese/giorno.
- Se `recurrence_config` non è valorizzato per quella frequenza, la funzione restituisce `[]` e il chiamante usa il fallback.

**C) Nuova funzione `getMaintenanceExpansionRange(fiscalYearEnd?)`:**

- **rangeStart:** `startOfYear(now)` (inizio anno corrente).
- **rangeEnd:** `endOfYear(addYears(now, 1))`, oppure `endOfDay(fiscalYearEnd)` se `fiscalYearEnd` è oltre la fine dell’anno successivo.
- Usata solo per le **manutenzioni**; i generic task continuano a usare la logica precedente (end_date da description, fiscal_year_end, o +90 giorni).

**D) Modifica a `expandRecurringTask`:**

- Per `type === 'maintenance'`:
  1. Si ottiene il range con `getMaintenanceExpansionRange(fiscalYearEnd)`.
  2. Si chiama `getMaintenanceRecurrenceDates(maintTask, rangeStart, rangeEnd)`.
  3. Se restituisce almeno una data, per ogni data si crea un evento con `convertMaintenanceTaskToEvent(..., occurrenceDate)` e si restituisce l’array di eventi.
  4. Se restituisce array vuoto (nessun `recurrence_config` o frequenza non gestita), si usa il **fallback**: stesso `while` di prima (addDays/addWeeks/addMonths/addMonths(12)) ma con **rangeStart/rangeEnd** come sopra; gli eventi sono generati solo per le date nel range.
- Per i **generic task** la logica è invariata (stesso calcolo di `endDate` e stesso loop).

**E) Filtro giorni di apertura:**

- Il blocco che filtra `allEvents` con `isCompanyClosedOnDate` e `shouldShowEventOnClosureDay` (circa righe 206–220) **non è stato modificato**: le manutenzioni restano visibili solo nei giorni aperti quando il calendario è configurato.

---

## 3. Riepilogo file modificati

| File | Modifiche |
|------|-----------|
| `src/types/conservation.ts` | `MaintenanceRecurrenceConfig` + `recurrence_config` in `MaintenanceTask` |
| `src/features/conservation/components/AddPointModal.tsx` | `transformMaintenanceTasks` costruisce `recurrence_config`; `transformMaintenanceTaskToForm` ripopola `giorniSettimana`, `giornoMese`, `giornoAnno` da `recurrence_config` |
| `src/features/conservation/hooks/useConservationPoints.ts` | Insert `maintenance_tasks` con `recurrence_config: task.recurrence_config ?? null` |
| `src/utils/onboardingHelpers.ts` | Insert manutenzioni da onboarding: costruzione e inclusione di `recurrence_config` da `plan.giorniCustom` per custom/giornaliera/settimanale |
| `src/features/calendar/hooks/useAggregatedEvents.ts` | `WEEKDAY_IT_TO_DAY`; `getMaintenanceRecurrenceDates`; `getMaintenanceExpansionRange`; `expandRecurringTask` per manutenzioni con nuovo range e uso di `recurrence_config` + fallback; filtro giorni apertura invariato |

---

## 4. Testing

**Stato:** **Non ancora eseguito.**

Verifiche da fare (come da piano):

- **Modal Conservazione:** Creare/modificare un punto con manutenzioni giornaliera (con giorni), settimanale, mensile, annuale; controllare in DB che `recurrence_config` sia compilato; in modifica verificare che i giorni si ripopolino correttamente.
- **Onboarding:** Completare un flusso con almeno un punto di conservazione e manutenzioni custom/giornaliera/settimanale con giorni selezionati; controllare in DB `recurrence_config.weekdays`.
- **Calendario:** Navigare a più mesi/anni; le manutenzioni devono comparire nei giorni corretti (non in un solo giorno).
- **Giorni di apertura:** Con calendario configurato, verificare che le manutenzioni compaiano solo nelle celle dei giorni aperti.

---

## 5. Bug segnalato: modal manutenzioni in onboarding

### 5.1 Descrizione

Il **modal di modifica/creazione manutenzioni** nello step onboarding (assegnazione manutenzioni ai punti di conservazione) **non mostra** in modo coerente la possibilità di selezionare **un giorno** o **i giorni** in base alla frequenza scelta. L’utente dovrebbe poter configurare, come nel modal Conservazione (Add Point Modal, sezione manutenzioni obbligatorie):

- **Giornaliera / settimanale / custom:** selezione giorni della settimana (uno o più).
- **Mensile:** giorno del mese (1–31).
- **Annuale:** giorno dell’anno (o data, es. per sbrinamento).

Oggi nell’onboarding la selezione giorni è visibile **solo** per la frequenza **custom**; per giornaliera e settimanale non compare nulla; per mensile e annuale non esiste alcun selettore.

---

### 5.2 Prima mappatura del bug

#### Componenti e file coinvolti

| Ruolo | File / componente | Note |
|-------|-------------------|------|
| Step onboarding manutenzioni | `src/components/onboarding-steps/TasksStep.tsx` | Contiene lo stato `maintenancePlans` e il modal “Assegna Manutenzioni” |
| Form dentro il modal | Stesso file: `MaintenanceAssignmentForm` (interno a TasksStep) | Form per frequenza, ruolo, categoria, dipendente, **e** giorni solo se `frequenza === 'custom'` |
| Tipo piano onboarding | `src/types/onboarding.ts` → `ConservationMaintenanceTask` / `ConservationMaintenancePlan` | Ha `giorniCustom?: CustomFrequencyDays[]`; **non** ha `giornoMese` né `giornoAnno` |
| Riferimento corretto (Add Point Modal) | `src/features/conservation/components/AddPointModal.tsx` → `MaintenanceTaskForm` | Mostra giorni per giornaliera/settimanale/mensile/annuale come da tabella sotto |

#### Comportamento UI: AddPointModal (riferimento) vs Onboarding

| Frequenza | AddPointModal (MaintenanceTaskForm) | Onboarding (MaintenanceAssignmentForm) |
|-----------|-------------------------------------|----------------------------------------|
| **Giornaliera** | Checkbox **“Giorni della settimana”** (`giorniSettimana`) — più giorni | Nessuna UI giorni; utente non può selezionare giorni |
| **Settimanale** | Select **“Giorno della settimana”** (`giorniSettimana[0]`) — un giorno | Nessuna UI giorni |
| **Custom** | Stesso schema giorni (checkbox) | Checkbox **“Giorni della settimana”** (`giorniCustom`) — solo qui è presente |
| **Mensile** | **“Giorno del mese”** con `MiniCalendar` mode month (`giornoMese` 1–31) | Nessuna UI; tipo piano non ha `giornoMese` |
| **Annuale** | **“Giorno dell’anno”** con `MiniCalendar` mode year (`giornoAnno` 1–366), mostrato se `manutenzione === 'sbrinamento'` | Nessuna UI; tipo piano non ha `giornoAnno` |

#### Dettaglio codice onboarding (riferimento per fix)

- **TasksStep.tsx**  
  - Il modal “Assegna Manutenzioni” è renderizzato da `renderMaintenanceAssignmentModal()` e usa `MaintenanceAssignmentForm` (stesso file, circa righe 504–780).
  - Validazione: `plan.frequenza === 'custom'` richiede `plan.giorniCustom?.length > 0` (righe 562–569, 741).
  - La sezione **“Giorni della settimana”** (checkbox con `CUSTOM_DAYS`) è mostrata **solo** con la condizione `plan.frequenza === 'custom'` (riga 741). Non c’è blocco condizionato a `giornaliera` o `settimanale`.
  - Non è presente alcun controllo per “giorno del mese” o “giorno dell’anno”.

- **ConservationMaintenanceTask** (`src/types/onboarding.ts`, righe 96–119)  
  - Campi presenti: `giorniCustom?: CustomFrequencyDays[]`.  
  - Campi **assenti**: `giornoMese`, `giornoAnno` (o equivalenti per giorno mese/anno).

- **onboardingHelpers.ts** (insert manutenzioni)  
  - Usa solo `plan.giorniCustom` per costruire `recurrence_config.weekdays` (custom/giornaliera/settimanale).  
  - Non legge `giornoMese`/`giornoAnno` perché il tipo e il form onboarding non li forniscono.

#### Azioni consigliate per il fix

1. **Tipi (`src/types/onboarding.ts`)**  
   - Estendere `ConservationMaintenanceTask` (e quindi `ConservationMaintenancePlan`) con campi opzionali per la ricorrenza allineati al form:
     - `giornoMese?: number` (1–31)
     - `giornoAnno?: number` (1–366)  
   (oppure usare gli stessi nomi del form Conservazione se si vuole massima simmetria.)

2. **UI in `TasksStep.tsx` (MaintenanceAssignmentForm)**  
   - Per **giornaliera**: mostrare la stessa griglia di checkbox giorni della settimana (usare `giorniCustom` o un unico campo condiviso) e obbligare almeno un giorno.
   - Per **settimanale**: mostrare un unico selettore “Giorno della settimana” (stesso valore in `giorniCustom[0]` o campo dedicato).
   - Per **custom**: lasciare il comportamento attuale (checkbox giorni).
   - Per **mensile**: aggiungere un selettore “Giorno del mese” (1–31), es. `MiniCalendar` mode month o select numerico; valorizzare `giornoMese`.
   - Per **annuale**: aggiungere selettore “Giorno dell’anno” (1–366) o data (es. per sbrinamento); valorizzare `giornoAnno` (e in backend convertire in ISO per `recurrence_config.day_of_year` se necessario).

3. **Validazione**  
   - Estendere `validatePlans` (e eventuale validazione inline) per richiedere:
     - per **giornaliera** e **settimanale**: almeno un giorno selezionato (come per custom);
     - per **mensile**: `giornoMese` in 1–31;
     - per **annuale**: `giornoAnno` (o data) valorizzato quando la manutenzione lo richiede (es. sbrinamento).

4. **Persistenza in `onboardingHelpers.ts`**  
   - Nella costruzione dell’oggetto insert per `maintenance_tasks`, oltre a `recurrence_config.weekdays` da `giorniCustom`:
     - da `plan.giornoMese` (se presente) impostare `recurrence_config.day_of_month`;
     - da `plan.giornoAnno` (o data) impostare `recurrence_config.day_of_year` in formato ISO (stessa convenzione usata in AddPointModal).

5. **Precompilazione / edit**  
   - Se in futuro l’onboarding permetterà di “modificare” piani già salvati (es. da DB), ripopolare `giorniCustom`, `giornoMese`, `giornoAnno` da `recurrence_config` (come fatto in AddPointModal con `transformMaintenanceTaskToForm`).

Questa mappatura può essere usata come base per un task di fix e per allineare completamente il modal onboarding al modal Conservazione (sezione manutenzioni obbligatorie).

---

## 6. Riferimenti

- Piano: `.cursor/plans/calendario_manutenzioni_ricorrenti_f8dc5c34.plan.md`
- Migration DB: `database/migrations/019_add_recurrence_config_to_maintenance_tasks.sql`
- Report implementazione recurrence_config: `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/Gennaio-2026/22-01-2026-evento/REPORT_RECURRENCE_CONFIG_IMPLEMENTATION.md`
