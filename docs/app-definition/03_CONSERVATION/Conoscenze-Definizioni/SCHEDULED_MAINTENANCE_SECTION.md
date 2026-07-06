> **Stato Fase 3** (2026-07-06): `verificato-ok` · Fonte: [`FASE3_REPORT_A2`](../../META/FASE3_REPORT_A2_CONSERVATION.md) §5.5  
> **Motivo**: trigger ricorrenza e `maintenance_completions` presenti su DB live; gap UX minore (pulsante «Completa» inline).  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# SCHEDULED_MAINTENANCE_SECTION - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16
**Ultima Modifica**: 2026-02-04
**Versione**: 3.1.0

---

## 📝 NOTE AGGIORNAMENTO VERSIONE 3.1.0 (2026-02-04)

**Motivo**: Allineamento pallino alle scadenze giornaliere; conteggio per tipologia; task temperatura nascosti/soddisfatti da lettura; completamento automatico task temperatura su "Rileva Temperatura".

**Nuove funzionalità (v3.1.0)**:
- ✅ **Pallino stato giornaliero**: **Verde** = nessuna manutenzione da completare oggi (allineato alle scadenze giornaliere); **Giallo** = almeno una da completare **oggi**; **Rosso** = almeno una in ritardo. Le manutenzioni di domani o oltre non fanno andare in giallo.
- ✅ **Conteggio per tipologia**: Il numero mostrato è il numero di **tipologie** (max 4: Rilevamento Temperature, Sanificazione, Sbrinamento, Controllo Scadenze), non il numero totale di task.
- ✅ **Ordine fisso tipologie**: Rilevamento Temperature → Sanificazione → Sbrinamento → Controllo Scadenze; "Mostra altre X manutenzioni [tipo]" per **tutte** le tipologie.
- ✅ **Task "Rilevamento Temperature" nascosti quando soddisfatti**: Se per il punto esiste una lettura temperatura con data ≥ scadenza del task tipo `temperature`, quel task non viene mostrato in elenco (né come arretrato né come da completare). La card usa `useTemperatureReadings` + `getLatestReadingByPoint` e il filtro `isTemperatureTaskSatisfiedByReading`.
- ✅ **Completamento automatico su lettura**: Quando l'utente salva una lettura tramite il pulsante **"Rileva Temperatura"** (pagina Conservazione), le task "Rilevamento Temperature" per quel punto con scadenza soddisfatta dalla lettura vengono completate automaticamente (insert in `maintenance_completions`). La task risulta completata in Conservazione e in Attività/calendario.

**Flusso utente – Pallino e allineamento giornaliero**:
1. L'utente apre la pagina Conservazione e vede la sezione "Manutenzioni Programmate".
2. Per ogni punto, il **pallino** indica: verde se non c'è nulla da completare **oggi** (anche se ci sono manutenzioni domani o in settimana); giallo se c'è almeno una manutenzione con scadenza **oggi** ancora da fare; rosso se c'è almeno una in ritardo (scadenza prima di oggi).
3. **Atteggiamento atteso**: Se l'utente ha completato tutto ciò che scade oggi (o non ha nulla in scadenza oggi), il pallino è **verde** (allineato alle scadenze giornaliere). Non è più giallo solo perché ci sono manutenzioni "in settimana" non ancora scadute.

**Flusso utente – Rilevamento temperatura e task**:
1. L'utente clicca "Rileva Temperatura", seleziona un punto (es. "TestFrigo"), inserisce la temperatura e salva.
2. La lettura viene registrata; in backend, per quel punto vengono cercate le task di tipo `temperature` con `next_due <= recorded_at` e per ognuna viene inserito un record in `maintenance_completions`.
3. Il trigger PostgreSQL aggiorna `next_due`, `last_completed` e `status` sulla task. La cache viene invalidata (`maintenance-tasks`, `maintenance-tasks-critical`, `calendar-events`, ecc.).
4. **Atteggiamento atteso**: In Conservazione la card "Manutenzioni Programmate" non mostra più "Rilevamento Temperature" come da completare per quel punto (o il conteggio si aggiorna). In Attività/calendario la stessa task risulta completata. L'utente non deve cliccare "Completa Manutenzione" per la temperatura se ha già usato "Rileva Temperatura".

**File coinvolti (v3.1.0)**:
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` — `calculateWeeklyStatus` a logica giornaliera (startOfDay/endOfDay), `useTemperatureReadings` + `getLatestReadingByPoint`, `isTemperatureTaskSatisfiedByReading`
- `src/features/conservation/hooks/useTemperatureReadings.ts` — dopo `createReading`: query task temperatura per punto, insert in `maintenance_completions`, invalidazioni e `calendar-refresh`

---

## 📝 NOTE AGGIORNAMENTO VERSIONE 3.0.0

**Data Aggiornamento**: 2026-02-01
**Motivo**: Integrazione check-up centralizzato, trigger automatici, real-time

**Nuove Features (v3.0.0)**:
- ✅ **Trigger PostgreSQL Automatico**: `next_due` calcolato automaticamente dopo completamento
- ✅ **Integration Check-up**: Manutenzioni usate da `getPointCheckup()` in card punti
- ✅ **Real-time Sync**: Subscriptions su `maintenance_completions` e `maintenance_tasks`
- ✅ **Caricamento Ottimizzato**: Hook `useMaintenanceTasksCritical()` carica solo task critici
- ✅ **Gravità Arretrati**: Severity (critical/high/medium/low) calcolata in `pointCheckup.ts`

**Features Precedenti (v2.0.0)**:
- ✅ **Pulsante "Visualizza nel Calendario"**: Naviga a pagina Attività con modal aperto
- ✅ **recurrence_config JSONB**: Persistenza giorni per ricalcolo next_due
- ✅ **Aggiornamento ottimistico**: Refresh modal dopo completamento
- ✅ **Fix completamento**: Uso UUID da `metadata.maintenance_id`

**Formato recurrence_config**:
```json
{
  "weekdays": ["lunedi", "mercoledi", "venerdi"],  // Daily/Weekly
  "day_of_month": 15,                               // Monthly
  "day_of_year": "2026-03-15"                       // Annually
}
```

**Trigger PostgreSQL** (v3.0.0):
```sql
CREATE TRIGGER trigger_update_task_on_completion
AFTER INSERT ON maintenance_completions
FOR EACH ROW
EXECUTE FUNCTION update_maintenance_task_on_completion();
```

---

## 📝 NOTE AGGIORNAMENTO VERSIONE 1.1.0

**Data Aggiornamento**: 2026-01-16
**Motivo**: Allineamento documentazione con requisiti utente definiti

**Modifiche principali**:
1. Aggiunto requisito raggruppamento manutenzioni per tipo (Rilevamento Temperature, Sanificazione, Sbrinamento, Controllo Scadenze)
2. Aggiornato comportamento: mostra solo prima manutenzione per tipo (prossima alla data corrente, non completata)
3. Aggiunto requisito card manutenzione cliccabile ed espandibile (mostra prossime 2 manutenzioni per tipo e punto quando espansa)
4. Aggiornato formato "Assegnato a": formato unico campo con tutti i dettagli disponibili (ruolo | categoria | reparto | dipendente)
5. Aggiunto requisito pulsante "Completa manutenzione" nella card manutenzione
6. Aggiunto requisito completamento manutenzione: salva utente loggato, timestamp click, data completamento
7. Aggiunto requisito filtro automatico manutenzioni completate dalla visualizzazione principale
8. Aggiunto requisito sincronizzazione calendario: filtra manutenzioni completate dopo completamento
9. Aggiornate sezioni: SCOPO, UTILIZZO, FLUSSO UTENTE, CONFLITTI, FUNZIONAMENTO, LAYOUT, DATI, CODE STRUCTURE, ACCEPTANCE CRITERIA, LIMITAZIONI, FUTURE MIGLIORAMENTI
10. Aggiunta sezione "RIEPILOGO REQUISITI DA IMPLEMENTARE" con tutti i requisiti funzionali e tecnici

---  
**File Componente**: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (utilizzato in ConservationPage)  
**Tipo**: Sezione Pagina

---

## 🎯 SCOPO

### Scopo Business
La sezione "Manutenzioni Programmate" permette all'utente di avere sott'occhio tutte le manutenzioni obbligatorie programmate per ogni punto di conservazione. Rappresenta il centro di monitoraggio per la conformità HACCP relativa alle manutenzioni periodiche.

Questa sezione risolve il bisogno di:
- **Monitorare** tutte le manutenzioni obbligatorie programmate per ogni punto
- **Consultare** rapidamente lo stato giornaliero (verde/giallo/rosso) di ogni punto (verde = nulla da completare oggi, giallo = da completare oggi, rosso = in ritardo)
- **Visualizzare** la prossima manutenzione per data per ogni punto
- **Verificare** chi è assegnato alle manutenzioni (ruolo, categoria, reparto, dipendente specifico)
- **Organizzare** le manutenzioni per punto in una struttura scalabile e facilmente consultabile

### Scopo Tecnico
La sezione è implementata tramite il componente `ScheduledMaintenanceCard` e include:

- **CollapsibleCard principale**: "Manutenzioni Programmate" con sottotitolo "Situazione giornaliera per punto di conservazione"
- **CollapsibleCard annidate per punto**: Ogni punto di conservazione ha la propria sezione espandibile
- **Badge stato giornaliero**: Pallino colorato (verde = nulla oggi, giallo = da completare oggi, rosso = in ritardo)
- **Conteggio tipologie manutenzioni**: Numero di tipologie obbligatorie associate al punto (max 4)
- **Lista manutenzioni espandibile**: Quando si clicca su un punto, mostra le manutenzioni con dettagli (prossima per data in ogni tipologia)

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
La sezione viene mostrata quando:

- L'utente naviga alla pagina Conservazione
- La sezione "Manutenzioni Programmate" è espansa (di default è espansa)
- L'utente ha completato l'onboarding e ha configurato punti di conservazione con manutenzioni obbligatorie

**Condizioni di accesso:**
- L'utente deve essere autenticato
- L'utente deve avere un `company_id` valido (gestito tramite `useAuth()`)
- Non sono necessari permessi specifici per la visualizzazione (politiche RLS gestiscono l'accesso)

**Ruoli utente:**
- **Tutti i membri** possono visualizzare le manutenzioni programmate
- Solo **manager/admin** possono creare/modificare/eliminare manutenzioni (gestito da RLS policies)

### Casi d'Uso Principali

1. **Consultare stato giornaliero manutenzioni** (v3.1.0: logica giornaliera)
   - **Scenario**: Un responsabile HACCP vuole verificare rapidamente quali punti hanno manutenzioni da completare **oggi** o in ritardo
   - **Azione**: Apre la pagina Conservazione, visualizza la sezione "Manutenzioni Programmate", vede i pallini colorati: **verde** = nessuna da completare oggi (allineato alle scadenze giornaliere), **giallo** = almeno una da completare oggi, **rosso** = almeno una in ritardo
   - **Risultato**: Identifica rapidamente i punti che richiedono attenzione oggi. Se non c'è nulla da fare oggi, il pallino è verde anche se ci sono manutenzioni domani o nel resto della settimana

2. **Visualizzare prossima manutenzione in scadenza**
   - **Scenario**: Un manager vuole sapere quale è la prossima manutenzione in scadenza per "Frigo A"
   - **Azione**: Clicca sulla sezione espandibile "Frigo A" nella lista, vede le manutenzioni ordinate per scadenza, la prima è la prossima e se ne sono rimaste di arretrate.
   - **Risultato**: Vede tipo manutenzione ("Rilevamento Temperature"), scadenza ("19/01/2026"), assegnato a ("responsabile")

3. **Verificare assegnazione manutenzione**
   - **Scenario**: Un dipendente vuole sapere se è assegnato a una manutenzione specifica
   - **Azione**: Visualizza le manutenzioni programmate, clicca su un punto, vede dettagli assegnazione
   - **Risultato**: Vede "Assegnato a: [ruolo/categoria/reparto/dipendente specifico]" - **PROBLEMA ATTUALE**: Vede solo stringa generica invece di dettagli completi

4. **Verificare manutenzioni completate**
   - **Scenario**: Un responsabile vuole verificare se tutte le manutenzioni previste per questa settimana sono state completate
   - **Azione**: Visualizza la sezione "Manutenzioni Programmate", vede pallino verde su punti con tutte manutenzioni completate
   - **Risultato**: Identifica rapidamente punti con manutenzioni ancora in sospeso

5. **Visualizzare manutenzione nel calendario** (v2.0.0)
   - **Scenario**: Un manager vuole vedere una manutenzione specifica nel contesto del calendario
   - **Azione**: Sulla card di una manutenzione, clicca **"Visualizza nel Calendario"**
   - **Risultato**: Si apre la pagina "Attività" con:
     - **Modal Manutenzioni** aperto sulla data di scadenza della manutenzione
     - **Manutenzione evidenziata** con bordo animato (highlight)
   - **File coinvolti**: `ScheduledMaintenanceCard.tsx`, `CalendarPage.tsx`, `MacroCategoryModal.tsx`

6. **Completare manutenzione con recurrence_config** (v2.0.0)
   - **Scenario**: Un dipendente completa una manutenzione settimanale assegnata per Lunedì, Mercoledì, Venerdì
   - **Azione**: Clicca "Completa Manutenzione" sulla card
   - **Risultato**:
     - `completed_at` = timestamp corrente
     - `completed_by` = user.id
     - `next_due` = prossimo giorno configurato in `recurrence_config.weekdays` (es. se oggi è Lunedì → Mercoledì)
     - Record creato in `maintenance_completions`
     - Manutenzione non più visibile tra le pendenti

### Flusso Utente

**Flusso principale - Consultazione:**
1. Utente naviga a "Conservazione" dal menu principale
2. La pagina carica automaticamente tutti i punti di conservazione e le manutenzioni obbligatorie
3. Utente vede la sezione "Manutenzioni Programmate" (di default espansa)
4. Nella lista, vede ogni punto di conservazione con:
   - Badge stato **giornaliero** (pallino verde/giallo/rosso): verde = nulla da completare oggi, giallo = almeno una da completare oggi, rosso = almeno una in ritardo (v3.1.0)
   - Nome punto (es. "Frigo A")
   - Numero **tipologie** di manutenzione (es. "2 manutenzioni" = 2 tipi tra le 4 obbligatorie)
   - Chevron icon per indicare espandibile
5. Utente clicca su un punto (es. "Frigo A")
6. La sezione si espande mostrando le manutenzioni per quel punto:
   - Tipo manutenzione (es. "Rilevamento Temperature")
   - Scadenza (es. "19/01/2026")
   - Assegnato a (es. "responsabile") - **PROBLEMA**: Mostra solo stringa generica invece di dettagli completi
   - Stato (icona verde se completata, icona rossa se in ritardo)
   - Data completamento (se completata)

**Flusso creazione manutenzioni (durante creazione punto):**
1. Utente crea/modifica un punto di conservazione tramite `AddPointModal`
2. Utente configura le manutenzioni obbligatorie (4 per frigoriferi/freezer/abbattitori, 2 per ambienti)
3. Per ogni manutenzione, utente inserisce:
   - Tipo manutenzione (obbligatorio, predefinito in base al tipo punto)
   - Frequenza (obbligatorio: giornaliera/settimanale/mensile/annuale/custom)
   - Assegnato a Ruolo (obbligatorio: admin/responsabile/dipendente/collaboratore)
   - Categoria Staff (opzionale: tutte le categorie o categoria specifica)
   - Dipendente Specifico (opzionale: se assegnato a dipendente specifico)
   - Note (opzionale)
4. Utente salva il punto
5. Le manutenzioni vengono create nel database e programmate nel calendario
6. Le manutenzioni appaiono nella sezione "Manutenzioni Programmate"

**Integrazione con calendario:**
- Quando manutenzioni vengono create/modificate, vengono automaticamente visualizzate nel calendario
- Il calendario mostra le manutenzioni come eventi programmati in base a `next_due`
- La sezione "Manutenzioni Programmate" legge gli stessi dati del calendario per mostrare la prossima scadenza

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Visualizzazione assegnazione incompleta
- **Quando si verifica**: La sezione mostra solo `task.assigned_to` (stringa generica) invece dei dettagli completi di assegnazione
- **Cosa succede**: L'utente vede "Assegnato a: responsabile" invece di vedere ruolo + categoria + reparto + dipendente specifico (se disponibili)
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Il componente mostra solo `task.assigned_to` che è una stringa generica
- **Esempio**: Admin ha configurato manutenzione assegnata a "Ruolo: responsabile, Categoria: Cucina, Reparto: Cucina, Dipendente: Mario Rossi", ma nella sezione viene mostrato solo "Assegnato a: responsabile"

**Problema identificato:**
1. **Campi non caricati**: Il hook `useMaintenanceTasks` non carica `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id` nel SELECT
2. **Campi non salvati**: Quando vengono create le manutenzioni tramite `AddPointModal`, il hook `useConservationPoints` salva solo `assigned_to` (stringa generica) e non salva `assignment_type`, `assigned_to_staff_id`, `assigned_to_role`, `assigned_to_category`, `department_id`
3. **Visualizzazione limitata**: Anche se i campi esistessero nel DB, il componente `ScheduledMaintenanceCard` mostra solo `task.assigned_to`

**Soluzione proposta**: 
1. Aggiornare `useMaintenanceTasks` per caricare tutti i campi di assegnazione nel SELECT
2. Aggiornare `useConservationPoints` per salvare tutti i campi di assegnazione quando vengono create le manutenzioni
3. Aggiornare `ScheduledMaintenanceCard` per mostrare tutti i dettagli disponibili:
   - Se `assignment_type === 'role'`: mostra ruolo
   - Se `assignment_type === 'category'`: mostra categoria
   - Se `assignment_type === 'staff'`: mostra nome dipendente (da JOIN staff)
   - Mostra sempre reparto (da `conservation_point.department_id` o `task.department_id` se presente)
   - Mostra tutti i dettagli disponibili in formato leggibile (es. "Ruolo: Responsabile | Reparto: Cucina | Categoria: Cucina")

#### Conflitto 2: Calcolo stato con manutenzioni multiple (v3.1.0: logica giornaliera)
- **Quando si verifica**: Un punto ha 4 manutenzioni con scadenze diverse (alcune completate, alcune in ritardo, alcune oggi, alcune domani)
- **Cosa succede**: Lo stato del pallino viene calcolato con priorità: rosso (in ritardo) > giallo (da completare oggi) > verde (nessuna da completare oggi)
- **Come viene gestito**: **GESTITO CORRETTAMENTE** (v3.1.0) - La funzione `calculateWeeklyStatus()` usa logica **giornaliera**:
  - Se almeno una manutenzione è in ritardo (`next_due < startOfDay(oggi)`) → rosso
  - Se almeno una manutenzione ha scadenza **oggi** (`next_due` tra inizio e fine giornata) → giallo
  - Altrimenti → verde (tutto allineato alle scadenze giornaliere; manutenzioni di domani o oltre non fanno andare in giallo)

#### Conflitto 3: Manutenzioni non sincronizzate con calendario
- **Quando si verifica**: Le manutenzioni vengono create/modificate ma non vengono visualizzate correttamente nel calendario o viceversa
- **Cosa succede**: La sezione "Manutenzioni Programmate" e il calendario potrebbero mostrare dati diversi
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Non c'è sincronizzazione esplicita. Entrambi leggono dalla stessa tabella `maintenance_tasks`, ma potrebbero avere filtri diversi o cache diverse

**Soluzione proposta**: 
1. Invalidare cache React Query sia per `maintenance-tasks` che per `calendar-events` quando manutenzioni vengono create/modificate/eliminate
2. Garantire che entrambi usino la stessa query e filtri
3. Implementare real-time subscriptions per sincronizzazione automatica

### Conflitti Multi-Utente

**Visualizzazione simultanea:**
- **Comportamento attuale**: Ogni utente vede le proprie manutenzioni in cache (React Query). Se un utente completa/modifica una manutenzione, gli altri non vedono l'aggiornamento in tempo reale.
- **Rischio**: Utenti potrebbero vedere dati obsoleti o tentare di completare manutenzioni già completate da altri.
- **Soluzione proposta**: Implementare Supabase Realtime subscriptions per sincronizzazione automatica quando manutenzioni vengono completate/modificate da altri utenti.

**Completamento simultaneo manutenzione:**
- **Comportamento attuale**: Due utenti possono completare la stessa manutenzione contemporaneamente (doppio completamento)
- **Rischio**: La manutenzione viene marcata come completata due volte, creando duplicati nello storico
- **Soluzione proposta**: Implementare lock ottimistico o transazione atomica per prevenire doppio completamento

### Conflitti di Sincronizzazione

**Comportamento offline:**
- **Situazione**: L'app non gestisce attualmente lo stato offline per le manutenzioni
- **Cosa succede**: Se l'utente è offline, le chiamate API falliscono e viene mostrato un errore generico
- **Rischio**: Perdita di dati se l'utente ha completato manutenzioni senza connessione

**Soluzione proposta**: Implementare sistema di sincronizzazione offline con:
- Queue locale per completamenti pendenti
- Sync automatico quando la connessione viene ripristinata
- Indicatore visivo dello stato di sincronizzazione

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
La sezione viene generata automaticamente quando:

- L'utente naviga alla route `/conservation` (definita nel router dell'applicazione)
- Il componente `ConservationPage` viene montato e renderizza `ScheduledMaintenanceCard`
- Il componente `ScheduledMaintenanceCard` carica i dati automaticamente tramite `useConservationPoints()` e `useMaintenanceTasks()` hooks
- La sezione è contenuta in una `CollapsibleCard` con `defaultExpanded={true}`

**Trigger di caricamento:**
- Mount del componente (`useEffect` interno agli hook `useQuery`)
- Invalidation della query cache (dopo creazione/modifica/eliminazione manutenzioni)
- Cambio di `company_id` (utente cambia azienda)

### Generazione Manuale
Non applicabile - questa è una sezione della pagina, non un elemento creato dall'utente.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. Utente autenticato (gestito da `ProtectedRoute` wrapper)
2. `company_id` valido presente nel contesto auth
3. Permessi di lettura per le tabelle `conservation_points` e `maintenance_tasks` (RLS policies)

**Condizioni opzionali:**
- Punti di conservazione possono essere vuoti (sezione mostra messaggio "Nessun punto di conservazione configurato")
- Manutenzioni possono essere vuote per un punto (sezione mostra "Nessuna manutenzione obbligatoria configurata per questo punto")

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

```typescript
// ScheduledMaintenanceCard.tsx
import { useState, useMemo } from 'react'
import { Wrench, ChevronRight, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import type { MaintenanceTask } from '@/types/conservation'

type WeeklyStatus = 'green' | 'yellow' | 'red'

interface ConservationPointWithStatus {
  id: string
  name: string
  status: WeeklyStatus
  maintenances: MaintenanceTask[]
}

export function ScheduledMaintenanceCard() {
  const { conservationPoints, isLoading: loadingPoints } = useConservationPoints()
  const { maintenanceTasks, isLoading: loadingTasks } = useMaintenanceTasks()
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null)
  
  // Raggruppa manutenzioni per punto con calcolo stato
  const pointsWithStatus = useMemo<ConservationPointWithStatus[]>(() => {
    // Logica raggruppamento e calcolo stato
  }, [conservationPoints, maintenanceTasks])
  
  // Render
}
```

### Props Richieste
Questo componente non riceve props dirette. I dati vengono caricati tramite hooks che accedono al contesto di autenticazione.

### State Management

**State locale (useState):**
- `expandedPointId: string | null` - ID del punto di conservazione attualmente espanso (null = nessuno espanso)

**State globale (hooks + React Query):**
- `conservationPoints: ConservationPoint[]` - lista punti (da `useConservationPoints()`)
- `maintenanceTasks: MaintenanceTask[]` - lista manutenzioni (da `useMaintenanceTasks()`)
- `isLoading: boolean` - stato caricamento (loadingPoints || loadingTasks)

**State derivato (useMemo):**
- `pointsWithStatus: ConservationPointWithStatus[]` - punti raggruppati con stato settimanale calcolato

**Cache management (React Query):**
- Query key per punti: `['conservation-points', companyId]`
- Query key per manutenzioni: `['maintenance-tasks', companyId]`
- Auto-refresh: quando viene invalidata la cache dopo mutazioni
- Cache time: default di React Query (5 minuti)

### Hooks Utilizzati

- **`useConservationPoints()`**: 
  - Carica punti di conservazione dal database
  - Include join con `departments` per nome reparto
  - Gestisce cache React Query

- **`useMaintenanceTasks()`**: 
  - Carica manutenzioni dal database
  - Include join con `conservation_points` per nome punto
  - Include join con `staff` per `assigned_user` (solo se `assigned_to_staff_id` è presente)
  - **PROBLEMA**: Non carica `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id` nel SELECT
  - Gestisce cache React Query

- **`useAuth()`**: (interno agli hook)
  - Fornisce `company_id` per filtrare i dati per azienda
  - Gestisce autenticazione utente

### Funzioni Principali

#### `getCurrentWeekBounds()`
- **Scopo**: Ottiene inizio e fine della settimana ISO corrente (lunedì-domenica) in Europe/Rome
- **Parametri**: Nessuno
- **Ritorna**: `{ start: Date, end: Date }` - inizio settimana (lunedì 00:00:00) e fine settimana (domenica 23:59:59)
- **Logica**: 
  1. Ottiene giorno della settimana corrente (0 = domenica, 1 = lunedì, ecc.)
  2. Calcola giorni da sottrarre per arrivare al lunedì
  3. Se domenica, sottrae 6 giorni; se lunedì, sottrae 0 giorni; ecc.
  4. Calcola inizio settimana (lunedì 00:00:00)
  5. Calcola fine settimana (domenica 23:59:59)

#### `calculateWeeklyStatus(maintenances: MaintenanceTask[])` (v3.1.0: logica giornaliera)
- **Scopo**: Calcola stato del pallino per un punto (allineato alle scadenze **giornaliere**)
- **Parametri**: `maintenances: MaintenanceTask[]` - array manutenzioni per il punto (già filtrate: no completate, no task temperatura soddisfatti da lettura)
- **Ritorna**: `'green' | 'yellow' | 'red'`
- **Logica**: 
  1. `todayStart = startOfDay(now)`, `todayEnd = endOfDay(now)`
  2. Per ogni manutenzione: `hasOverdue = next_due < todayStart`; `hasDueToday = next_due >= todayStart && next_due <= todayEnd`
  3. Se `hasOverdue` → `'red'`; se `hasDueToday` → `'yellow'`; altrimenti → `'green'`

**Regole stato (v3.1.0):**
- **Verde**: Nessuna manutenzione in ritardo e nessuna da completare **oggi** (allineato alle scadenze giornaliere)
- **Giallo**: Almeno una manutenzione con scadenza **nella giornata corrente** (da completare oggi)
- **Rosso**: Almeno una manutenzione in ritardo (scadenza prima di oggi)

#### `togglePoint(pointId: string)`
- **Scopo**: Espande/collassa la sezione manutenzioni per un punto specifico
- **Parametri**: `pointId: string` - ID punto di conservazione
- **Ritorna**: void
- **Logica**: 
  - Se `expandedPointId === pointId`: collassa (imposta `expandedPointId = null`)
  - Altrimenti: espande (imposta `expandedPointId = pointId`)

#### `formatDate(dateString: string | Date)`
- **Scopo**: Formatta data per visualizzazione in formato italiano
- **Parametri**: `dateString: string | Date` - data da formattare
- **Ritorna**: `string` - data formattata (es. "19/01/2026")
- **Logica**: 
  - Usa `Intl.DateTimeFormat('it-IT')` per formattare in formato italiano
  - Formato: `DD/MM/YYYY`

#### `getMaintenanceName(type: string)`
- **Scopo**: Ottiene nome leggibile del tipo di manutenzione
- **Parametri**: `type: string` - tipo manutenzione (es. "temperature")
- **Ritorna**: `string` - nome leggibile (es. "Rilevamento Temperature")
- **Logica**: 
  - Usa mappa `MANDATORY_MAINTENANCE_TYPES` per tradurre tipo in nome
  - Fallback: ritorna il tipo originale se non trovato nella mappa

### Validazioni

**Validazioni client-side:**
- Validazione presenza `company_id` (gestita negli hook, ritorna array vuoto se mancante)
- Validazione dati manutenzioni (calcolo stato solo per manutenzioni con `next_due` valido)

**Validazioni server-side:**
- RLS policies: controllano che `company_id` corrisponda all'azienda dell'utente
- Foreign key constraints: `conservation_point_id` deve esistere in `conservation_points`
- Not null constraints: campi obbligatori come `type`, `frequency`, `conservation_point_id`, `company_id`

### Gestione Errori

**Errori di caricamento:**
- **Quando**: Errore nella query dei punti o delle manutenzioni
- **Cosa succede**: `isLoading` rimane `true`, `error` viene popolato dall'hook
- **UI**: Il componente mostra stato loading (`isLoading={true}` nella CollapsibleCard), ma non gestisce esplicitamente l'errore (da migliorare)
- **Logging**: Errore loggato in console dagli hook

**Soluzione proposta**: Migliorare gestione errori con:
- Messaggi di errore specifici per punti vs manutenzioni
- Retry automatico per errori di rete
- Fallback UI quando i dati non possono essere caricati

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────────────┐
│ CollapsibleCard: "Manutenzioni Programmate"            │
│ Header: Titolo + Counter "7 punti configurati"          │
│         + Icona Wrench                                   │
├─────────────────────────────────────────────────────────┤
│ Content (se espanso):                                    │
│                                                           │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Punto 1: "Frigo A" (CollapsibleCard annidata)    │ │
│   │ Header: ● [Verde] "Frigo A" "4 manutenzioni"  >  │ │
│   │         (cliccabile per espandere)                  │ │
│   ├───────────────────────────────────────────────────┤ │
│   │ Content (se espanso):                              │ │
│   │   ┌─────────────────────────────────────────────┐ │ │
│   │   │ Manutenzione Card 1                          │ │ │
│   │   │ ┌─────────────────────────────────────────┐ │ │ │
│   │   │ │ Tipo: "Rilevamento Temperature"          │ │ │ │
│   │   │ │ 🕐 Scadenza: 19/01/2026                   │ │ │ │
│   │   │ │ 👤 Assegnato a: responsabile              │ │ │ │
│   │   │ │    (PROBLEMA: solo stringa generica)     │ │ │ │
│   │   │ └─────────────────────────────────────────┘ │ │ │
│   │   │                                              │ │ │
│   │   │ Manutenzione Card 2                          │ │ │
│   │   │ ... (stessa struttura)                        │ │ │
│   │   └─────────────────────────────────────────────┘ │ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Punto 2: "Frigo B" (CollapsibleCard annidata)    │ │
│   │ ... (stessa struttura)                              │ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
│   [Altri punti...]                                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 640px):**
- Layout a colonna singola
- CollapsibleCard con padding ridotto (`px-4 py-3`)
- Badge stato più piccolo per spazio limitato
- Card manutenzioni full-width con padding ridotto
- Testo più piccolo per risparmiare spazio

**Tablet (640px - 1024px):**
- Layout a colonna singola con più spazio
- CollapsibleCard con padding normale (`sm:px-6`)
- Badge stato e testo dimensione normale
- Card manutenzioni full-width con padding normale

**Desktop (> 1024px):**
- Layout ottimizzato con più spazio laterale
- CollapsibleCard con padding normale (`sm:px-6`)
- Badge stato e testo dimensione normale
- Card manutenzioni full-width con spacing ottimizzato

### Styling

**Colori principali:**
- Background sezione: `bg-white` con `border border-gray-200` e `shadow-sm`
- Header punto: `hover:bg-gray-50 transition-colors` (hover per indicare clickabile)
- Badge stato:
  - Verde: `bg-green-500` (3px x 3px rounded-full)
  - Giallo: `bg-yellow-500`
  - Rosso: `bg-red-500`
- Card manutenzione: `bg-white border border-gray-200 rounded-lg p-3`
- Background sezione espansa: `bg-gray-50 border-t border-gray-100`
- Stati manutenzione:
  - Completata: icona `CheckCircle2` verde (`text-green-600`)
  - In ritardo: icona `AlertCircle` rossa (`text-red-600`)
  - Programmata: nessuna icona (stato normale)

**Spaziature:**
- Container sezione: padding interno gestito dalla CollapsibleCard
- Header punto: `px-4 py-3 sm:px-6` (responsive padding)
- Spazio tra punti: `divide-y divide-gray-100` (border tra punti)
- Spazio tra manutenzioni: `space-y-3` (12px verticale)
- Padding interno card manutenzione: `p-3` (12px)

**Tipografia:**
- Titolo sezione: gestito da CollapsibleCard (default: `text-lg font-semibold`)
- Nome punto: `font-medium text-gray-900` (medium weight, grigio scuro)
- Sottotitolo punto: `text-xs text-gray-500` (12px, grigio)
- Tipo manutenzione: `font-medium text-gray-900` (medium weight)
- Dettagli manutenzione: `text-sm text-gray-600` (14px, grigio)
- Scadenza completata: `text-xs text-green-700` (12px, verde)

**Effetti hover/focus:**
- Header punto: `hover:bg-gray-50 transition-colors` (background cambia al hover)
- Chevron icon: `transition-transform` con rotazione quando espanso (`rotate-90`)
- Focus ring: `focus:ring-2 focus:ring-primary-500 focus:ring-offset-1` su elementi interattivi

### Accessibilità

**ARIA labels utilizzati:**
- `role="button"` sull'header punto espandibile
- `tabIndex={0}` per navigazione tastiera
- `aria-expanded={true/false}` per indicare stato espanso
- `aria-hidden="true"` su icone decorative (ChevronRight, Clock, User)
- `aria-label` su badge stato (es. "Tutto regolare", "Manutenzione in scadenza", "Manutenzione in ritardo")
- `aria-label` su icone stato (es. "Completata", "In ritardo")

**Keyboard navigation:**
- Header punto: `tabIndex={0}`, risponde a `Enter` e `Space` per espandere/collassare
- Focus visible: `focus:ring-2 focus:ring-primary-500` per indicare focus

**Screen reader support:**
- Tutti i testi informativi sono visibili (non solo icone)
- Badge stato hanno `aria-label` descrittivi
- Stati manutenzione hanno `aria-label` (es. "Completata", "In ritardo")

**Contrasto colori:**
- Testo su background: minimo 4.5:1 (WCAG AA)
- Badge stato (verde/giallo/rosso): rispettano i contrasti minimi
- Focus indicators: visibili con contrasto sufficiente

**Miglioramenti proposti:**
- Aggiungere `aria-controls` per collegare header punto e content espanso
- Aggiungere `aria-describedby` per descrizioni aggiuntive
- Migliorare feedback audio per azioni (espansione/collasso)

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**: 
   - Il componente `ScheduledMaintenanceCard` viene renderizzato quando `ConservationPage` viene montato
   - `useConservationPoints()` hook viene eseguito automaticamente
   - `useMaintenanceTasks()` hook viene eseguito automaticamente
   - Entrambi usano `useQuery` per caricare i dati da Supabase filtrati per `company_id`
   - Se `company_id` non è disponibile, ritornano array vuoto e loggano warning

2. **Caricamento dati**:
   - Query Supabase per punti: `SELECT * FROM conservation_points WHERE company_id = ? ORDER BY created_at DESC`
   - Query Supabase per manutenzioni: `SELECT * FROM maintenance_tasks WHERE company_id = ? ORDER BY next_due ASC`
   - **PROBLEMA**: Query manutenzioni non include `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id` nel SELECT
   - Include join con `conservation_points` per nome punto (opzionale)
   - Include join con `staff` per `assigned_user` (solo se `assigned_to_staff_id` è presente)
   - Dati vengono trasformati in oggetti tipizzati TypeScript

3. **Raggruppamento per punto**:
   - `useMemo` raggruppa le manutenzioni per `conservation_point_id`
   - Filtra solo manutenzioni obbligatorie (tipi: 'temperature', 'sanitization', 'defrosting', 'expiry_check')
   - Calcola stato settimanale per ogni punto usando `calculateWeeklyStatus()`

4. **Rendering iniziale**:
   - Se `isLoading === true`: mostra skeleton loading nella CollapsibleCard
   - Se `isLoading === false && pointsWithStatus.length === 0`: mostra empty state "Nessun punto di conservazione configurato"
   - Se dati presenti: renderizza la struttura completa con tutti i punti

5. **Calcolo stato settimanale**:
   - Per ogni punto, `calculateWeeklyStatus()` analizza le sue manutenzioni
   - Verifica se almeno una manutenzione è in ritardo → rosso
   - Verifica se almeno una manutenzione è in scadenza questa settimana → giallo
   - Altrimenti → verde

6. **Interazione utente - Espansione punto**:
   - Utente clicca header punto (o preme Enter/Space)
   - `togglePoint(point.id)` viene chiamato
   - Se punto già espanso: collassa (`expandedPointId = null`)
   - Se punto non espanso: espande (`expandedPointId = point.id`)
   - Content manutenzioni viene mostrato/nascosto con animazione CSS

7. **Visualizzazione manutenzioni**:
   - Quando punto è espanso, mostra lista manutenzioni per quel punto
   - Ordina manutenzioni per `next_due` (più prossime prima) - **IMPLEMENTATO**: le manutenzioni vengono ordinate per `next_due ASC`
   - Mostra per ogni manutenzione:
     - Tipo manutenzione (tradotto in nome leggibile)
     - Scadenza formattata (DD/MM/YYYY)
     - Assegnato a (solo `task.assigned_to` - PROBLEMA: mancano dettagli)
     - Stato (icona verde se completata, icona rossa se in ritardo)
     - Data completamento (se completata)
   - **PROBLEMA RILEVATO (2026-01-16)**: Quando utente clicca "Completa" su una manutenzione, dopo il completamento l'app dice "manutenzione completata" ma **rimane visualizzata la stessa manutenzione** invece di mostrare la prossima in ordine di data. **DA FIXARE**: Dopo completare una manutenzione, deve essere filtrata dalla visualizzazione e deve essere mostrata la prossima manutenzione non completata (in ordine di `next_due`).

8. **Aggiornamento automatico**:
   - Dopo ogni mutazione (creazione/modifica/eliminazione manutenzione), `queryClient.invalidateQueries()` viene chiamato
   - React Query ricarica automaticamente i dati
   - UI si aggiorna senza necessità di refresh manuale
   - Stato settimanale viene ricalcolato automaticamente

### Integrazione Database

**Tabelle utilizzate:**

1. **`conservation_points`**:
   - **Operazioni**: SELECT
   - **Filtri**: `company_id` (obbligatorio, da auth)
   - **Join**: `departments` per nome reparto (opzionale, per visualizzazione)
   - **Ordinamento**: `created_at DESC` (più recenti prima)

2. **`maintenance_tasks`**:
   - **Operazioni**: SELECT
   - **Filtri**: `company_id` (obbligatorio)
   - **Join**: 
     - `conservation_points` per nome punto (opzionale, per visualizzazione)
     - `staff` per `assigned_user` (solo se `assigned_to_staff_id` è presente)
   - **Ordinamento**: `next_due ASC` (più prossime prima)
   - **Campi utilizzati**: `id`, `conservation_point_id`, `type`, `frequency`, `next_due`, `status`, `last_completed`, `assigned_to`
   - **Campi NON caricati** (PROBLEMA): `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id`

3. **`departments`** (join da conservation_points):
   - **Operazioni**: SELECT (solo per join)
   - **Campi utilizzati**: `id`, `name` (per visualizzazione reparto)

**Operazioni CRUD:**

- **READ**: 
  - Carica tutti i punti dell'azienda
  - Carica tutte le manutenzioni dell'azienda
  - Include informazioni punto tramite join
  - Include informazioni dipendente assegnato tramite join (solo se `assigned_to_staff_id` presente)
  - Calcola stato settimanale lato client

**Transazioni:**
- Non vengono usate transazioni esplicite per le query
- Ogni query è atomica (Supabase gestisce transazioni a livello di singola operazione)

### Integrazione Servizi

**Supabase Client**:
- Utilizzato tramite `@/lib/supabase/client`
- Configurato con URL e anon key da variabili ambiente
- RLS policies applicate automaticamente a tutte le query

**React Query (TanStack Query)**:
- Gestisce cache e sincronizzazione stato-server
- Auto-retry per errori di rete
- Background refetch quando tab torna in focus
- Cache time: 5 minuti (default)

### Real-time Updates

**Comportamento attuale**: 
- **NON implementato** - La sezione non si aggiorna in real-time quando altri utenti completano/modificano manutenzioni
- Aggiornamenti avvengono solo dopo:
  - Mutazioni locali (invalidation cache)
  - Refresh manuale pagina
  - Focus su tab (background refetch di React Query)

**Soluzione proposta**: Implementare Supabase Realtime subscriptions per:
- Aggiornamenti automatici quando manutenzioni vengono completate/modificate da altri utenti
- Aggiornamenti automatici quando nuove manutenzioni vengono create
- Indicatore visivo quando dati sono stati aggiornati da altro utente
- Auto-refresh stato settimanale quando manutenzioni vengono completate

### Integrazione con Check-up Centralizzato (v3.0.0)

**Relazione con `getPointCheckup()`**:
- I task manutenzione caricati da questa sezione vengono utilizzati anche da `ConservationPointCard`
- Hook `useMaintenanceTasksCritical()` carica task che vengono mergiati in `point.maintenance_tasks`
- Funzione `getPointCheckup()` analizza array task per calcolare:
  - Task oggi (considerando orario: `taskDate <= now`)
  - Task arretrati con severity (critical/high/medium/low basato su giorni)
  - Prossima manutenzione futura (solo se oggi completato)
  - Stato overall: critical (entrambi problemi), warning (uno), normal (nessuno)

**Flusso integrato**:
1. `useMaintenanceTasksCritical()` carica task critici per azienda
2. `ConservationPage` merge task in `pointsWithLastReading`
3. `ConservationPointCard` riceve `point.maintenance_tasks`
4. `getPointCheckup(point, point.maintenance_tasks)` calcola stato
5. Card visualizza:
   - Badge stato overall (verde/giallo/rosso)
   - Box separati se entrambi problemi (temperatura + manutenzioni)
   - Lista arretrati espandibile con indicatori gravità

**Calcolo gravità** (eseguito in `pointCheckup.ts`):
```typescript
const daysOverdue = differenceInDays(now, new Date(task.next_due))
const severity =
  daysOverdue >= 7 ? 'critical' :  // rosso
  daysOverdue >= 3 ? 'high' :      // arancione
  daysOverdue >= 1 ? 'medium' :    // giallo
  'low'                             // grigio
```

**Vantaggi integrazione**:
- **Single query**: `useMaintenanceTasksCritical()` unica fonte task
- **Consistenza**: stesso calcolo gravità ovunque
- **Performance**: carica solo task critici (~50 vs ~200)
- **Real-time**: subscriptions aggiornano entrambe visualizzazioni

### Trigger PostgreSQL Automatico (v3.0.0)

**Obiettivo**: Calcolare automaticamente `next_due` dopo completamento manutenzione.

**Implementazione**:

```sql
-- Funzione helper: calcola prossima scadenza
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_frequency VARCHAR,
  p_completed_at TIMESTAMPTZ,
  p_recurrence_config JSONB
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_due TIMESTAMPTZ;
  v_weekdays TEXT[];
  v_current_weekday TEXT;
  v_day_of_month INT;
  v_day_of_year DATE;
BEGIN
  CASE p_frequency
    -- Daily con giorni specifici
    WHEN 'daily' THEN
      v_weekdays := ARRAY(SELECT jsonb_array_elements_text(p_recurrence_config->'weekdays'));
      -- Logica trova prossimo giorno configurato

    -- Weekly con giorni specifici
    WHEN 'weekly' THEN
      v_weekdays := ARRAY(SELECT jsonb_array_elements_text(p_recurrence_config->'weekdays'));
      -- Logica trova prossimo giorno configurato

    -- Monthly con giorno specifico
    WHEN 'monthly' THEN
      v_day_of_month := (p_recurrence_config->>'day_of_month')::INT;
      v_next_due := date_trunc('month', p_completed_at) + INTERVAL '1 month';
      v_next_due := v_next_due + (v_day_of_month - 1) * INTERVAL '1 day';

    -- Annually con data specifica
    WHEN 'annually' THEN
      v_day_of_year := (p_recurrence_config->>'day_of_year')::DATE;
      -- Logica anno successivo

    ELSE
      -- Fallback: +1 giorno
      v_next_due := p_completed_at + INTERVAL '1 day';
  END CASE;

  RETURN v_next_due;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: aggiorna task dopo completamento
CREATE OR REPLACE FUNCTION update_maintenance_task_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_task_frequency VARCHAR;
  v_recurrence_config JSONB;
  v_new_next_due TIMESTAMPTZ;
BEGIN
  -- Leggi frequency e config del task
  SELECT frequency, recurrence_config
  INTO v_task_frequency, v_recurrence_config
  FROM maintenance_tasks
  WHERE id = NEW.maintenance_task_id;

  -- Calcola prossimo next_due
  v_new_next_due := calculate_next_due_date(
    v_task_frequency,
    NEW.completed_at,
    v_recurrence_config
  );

  -- Aggiorna task
  UPDATE maintenance_tasks
  SET
    last_completed = NEW.completed_at,
    next_due = v_new_next_due,
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = NEW.maintenance_task_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: esegui AFTER INSERT su maintenance_completions
CREATE TRIGGER trigger_update_task_on_completion
AFTER INSERT ON maintenance_completions
FOR EACH ROW
EXECUTE FUNCTION update_maintenance_task_on_completion();
```

**Vantaggi trigger**:
- ✅ **Automatico**: nessun codice applicativo necessario
- ✅ **Atomico**: UPDATE task avviene nella stessa transazione
- ✅ **Consistente**: logica centralizzata in database
- ✅ **Affidabile**: sempre eseguito, anche se app crasha
- ✅ **Supporta recurrence_config**: rispetta giorni configurati

**Esempio flusso**:
1. User completa manutenzione → INSERT `maintenance_completions`
2. Trigger esegue automaticamente
3. Calcola `next_due` (es. daily lunedì/mercoledì/venerdì → se oggi lunedì → mercoledì)
4. UPDATE `maintenance_tasks` con nuovo `next_due`
5. Supabase Realtime notifica subscription
6. React Query invalida cache
7. UI si aggiorna automaticamente

### Integrazione con Calendario

**Relazione con calendario:**
- Le manutenzioni vengono programmate nel calendario quando vengono create tramite `AddPointModal`
- Il calendario mostra le manutenzioni come eventi basati su `next_due`
- La sezione "Manutenzioni Programmate" legge gli stessi dati (`maintenance_tasks`) per mostrare la prossima scadenza
- Entrambi usano la stessa tabella `maintenance_tasks` come fonte dati

**Sincronizzazione** (v3.0.0 - IMPLEMENTATA):
- ✅ **Real-time subscriptions**: `useConservationRealtime()` monitora modifiche
- ✅ **Cache invalidation**: quando task completato/modificato, cache invalidata per entrambi
- ✅ **Stesso query key**: entrambi leggono da `useMaintenanceTasksCritical()`
- ✅ **Consistenza**: trigger garantisce `next_due` sempre corretto

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`CollapsibleCard`** (`@/components/ui/CollapsibleCard`):
  - **Tipo di interazione**: Wrapper per sezione principale collassabile
  - **Uso**: Contiene tutta la sezione "Manutenzioni Programmate"
  - **Props passate**: `title`, `subtitle`, `icon`, `defaultExpanded`, `isLoading`, `isEmpty`, `emptyMessage`, `counter`, `children`

- **`CollapsibleCard` annidate** (inline JSX):
  - **Tipo di interazione**: CollapsibleCard annidate per ogni punto di conservazione
  - **Uso**: Renderizzate in loop per ogni punto, contenenti le manutenzioni per quel punto
  - **Struttura**: Header clickabile con badge stato, nome punto, conteggio manutenzioni, chevron icon

- **`ConservationPage`** (parent):
  - **Tipo di interazione**: Componente parent che renderizza questa sezione
  - **Uso**: Renderizza `ScheduledMaintenanceCard` direttamente nella pagina
  - **Posizione**: Dopo la sezione "Letture Temperature", prima della sezione "Distribuzione per Tipo"

### Dipendenze

- **Hooks custom**:
  - `useConservationPoints()` - gestione punti conservazione
  - `useMaintenanceTasks()` - gestione manutenzioni (da migliorare per caricare tutti i campi assegnazione)
  - `useAuth()` - autenticazione e company_id (interno agli hook)

- **Librerie esterne**:
  - `react` - framework UI
  - `@tanstack/react-query` - gestione stato server
  - `lucide-react` - icone (Wrench, ChevronRight, Clock, User, CheckCircle2, AlertCircle)

- **Servizi**:
  - `@/lib/supabase/client` - client Supabase per database
  - `@/types/conservation` - tipi TypeScript

### Eventi Emessi

La sezione non emette eventi custom. Le comunicazioni avvengono tramite:
- **State interno** (`expandedPointId`) - gestisce espansione/collasso punti
- **Visualizzazione dati** - mostra dati letti dal database senza modifiche dirette

### Eventi Ascoltati

La sezione non ascolta eventi custom. Reagisce a:
- **Mount/unmount** del componente (trigger caricamento dati)
- **Invalidation cache** React Query (trigger ricaricamento dati)
- **Cambio `company_id`** nel contesto auth (trigger ricaricamento)

---

## 📊 DATI

### Struttura Dati Input

La sezione non riceve input diretti. I dati vengono caricati tramite hook dal database.

**Dati caricati dal database:**

```typescript
interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  // ... altri campi
  department?: {
    id: string
    name: string  // Nome reparto (da JOIN)
  }
}

interface MaintenanceTask {
  id: string
  company_id: string
  conservation_point_id: string
  title: string
  type: 'temperature' | 'sanitization' | 'defrosting'
  frequency: MaintenanceFrequency
  next_due: Date
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
  last_completed?: Date
  assigned_to?: string  // Stringa generica (PROBLEMA: dovrebbe essere dettagliata)
  // Campi NON caricati (PROBLEMA):
  // assignment_type?: 'role' | 'staff' | 'category'
  // assigned_to_staff_id?: string
  // assigned_to_role?: string
  // assigned_to_category?: string
  // department_id?: string
  // Relazioni:
  conservation_point?: ConservationPoint
  assigned_user?: {  // Solo se assigned_to_staff_id presente
    id: string
    name: string
  }
}

interface ConservationPointWithStatus {
  id: string
  name: string
  status: 'green' | 'yellow' | 'red'  // Stato settimanale calcolato
  maintenances: MaintenanceTask[]
}
```

### Struttura Dati Output

La sezione non emette output diretto. I dati vengono visualizzati ma non modificati.

### Mapping Database

**Campo database → Campo visualizzato:**

| Campo Database | Campo Visualizzato | Trasformazione | Stato |
|----------------|---------------------|----------------|-------|
| `maintenance_tasks.type` | Tipo manutenzione | Mapping tramite `MANDATORY_MAINTENANCE_TYPES` | ✅ Funziona |
| `maintenance_tasks.next_due` | Scadenza | Date → formato italiano "DD/MM/YYYY" | ✅ Funziona |
| `maintenance_tasks.assigned_to` | Assegnato a | Diretto (stringa generica) | ❌ PROBLEMA: solo stringa generica |
| `maintenance_tasks.assignment_type` | Tipo assegnazione | **NON CARICATO** | ❌ NON DISPONIBILE |
| `maintenance_tasks.assigned_to_role` | Ruolo assegnato | **NON CARICATO** | ❌ NON DISPONIBILE |
| `maintenance_tasks.assigned_to_category` | Categoria assegnata | **NON CARICATO** | ❌ NON DISPONIBILE |
| `maintenance_tasks.assigned_to_staff_id` | ID dipendente | **NON CARICATO** (ma JOIN con staff se presente) | ⚠️ PARZIALE |
| `maintenance_tasks.department_id` | Reparto manutenzione | **NON CARICATO** | ❌ NON DISPONIBILE |
| `conservation_points.department_id` | Reparto punto | **NON VISUALIZZATO** (disponibile ma non mostrato) | ⚠️ DISPONIBILE MA NON USATO |
| `conservation_points.department.name` | Nome reparto punto | **NON VISUALIZZATO** (disponibile da JOIN ma non mostrato) | ⚠️ DISPONIBILE MA NON USATO |
| `maintenance_tasks.status` | Stato manutenzione | Icona verde (completata) o rossa (in ritardo) | ✅ Funziona |
| `maintenance_tasks.last_completed` | Data completamento | Date → formato italiano "DD/MM/YYYY" | ✅ Funziona |

**Problema identificato - Visualizzazione assegnazione incompleta:**

**Attualmente mostrato:**
```
Assegnato a: responsabile
```

**Dovrebbe essere mostrato (in base a assignment_type):**
- Se `assignment_type === 'role'` e `assigned_to_role === 'responsabile'`:
  ```
  Ruolo: Responsabile
  ```
- Se `assignment_type === 'category'` e `assigned_to_category === 'Cucina'`:
  ```
  Categoria: Cucina
  ```
- Se `assignment_type === 'staff'` e `assigned_to_staff_id === 'xxx'` e `assigned_user.name === 'Mario Rossi'`:
  ```
  Dipendente: Mario Rossi
  ```
- Con reparto (se disponibile):
  ```
  Ruolo: Responsabile | Reparto: Cucina | Categoria: Cucina
  ```
  oppure
  ```
  Dipendente: Mario Rossi | Reparto: Cucina
  ```

**Campi disponibili nel database ma non utilizzati:**
- `assignment_type`: 'role' | 'staff' | 'category'
- `assigned_to_role`: VARCHAR (es. 'admin', 'responsabile', 'dipendente', 'collaboratore')
- `assigned_to_category`: VARCHAR (es. 'Cucina', 'Bar', ecc.)
- `assigned_to_staff_id`: UUID (FK a `staff.id`)
- `department_id`: UUID (FK a `departments.id`) - potrebbe essere specifico per manutenzione o ereditato da punto

**Validazioni database:**

- **Not null**: `type`, `frequency`, `conservation_point_id`, `company_id`, `assigned_to`, `assignment_type`
- **Foreign key**: `conservation_point_id` deve esistere in `conservation_points`, `assigned_to_staff_id` deve esistere in `staff` (se presente), `department_id` deve esistere in `departments` (se presente)
- **Check constraints**: 
  - `type` IN ('temperature', 'sanitization', 'defrosting')
  - `assignment_type` IN ('role', 'staff', 'category')
  - `status` IN ('scheduled', 'in_progress', 'completed', 'overdue', 'skipped')

**Trasformazioni applicate:**

1. **Calcolo stato settimanale**:
   - Avviene lato client per ogni punto
   - Analizza tutte le manutenzioni del punto
   - Calcola se almeno una è in ritardo (rosso), in scadenza (giallo), o tutto regolare (verde)

2. **Ordinamento manutenzioni**:
   - **ATTUALMENTE NON IMPLEMENTATO**: Le manutenzioni vengono mostrate nell'ordine in cui vengono caricate dal database
   - **SOLUZIONE PROPOSTA**: Ordinare per `next_due ASC` (più prossime prima) in modo che la prima manutenzione visualizzata sia la prossima in scadenza

3. **Mapping tipo manutenzione**:
   - `'temperature'` → "Rilevamento Temperature"
   - `'sanitization'` → "Sanificazione"
   - `'defrosting'` → "Sbrinamento"
   - `'expiry_check'` → "Controllo Scadenze" (fallback)

4. **Formattazione data**:
   - `next_due`: Date → "DD/MM/YYYY" (es. "19/01/2026")
   - `last_completed`: Date → "DD/MM/YYYY" (se completata)

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per la sezione "Manutenzioni Programmate":**

- [x] La sezione carica e visualizza tutti i punti di conservazione con manutenzioni obbligatorie
- [x] Ogni punto mostra badge stato settimanale (verde/giallo/rosso) calcolato correttamente
- [x] Ogni punto mostra nome e numero manutenzioni associate
- [x] L'utente può espandere/collassare la sezione manutenzioni per ogni punto
- [x] Quando espanso, mostra tutte le manutenzioni obbligatorie per quel punto
- [x] Ogni manutenzione mostra tipo, scadenza, assegnato a
- [x] Le manutenzioni mostrano stato (icona verde se completata, rossa se in ritardo)
- [ ] **DA FIXARE**: Mostrare dettagli completi assegnazione (ruolo + categoria + reparto + dipendente specifico) invece di solo stringa generica
- [ ] **DA IMPLEMENTARE**: Ordinare manutenzioni per scadenza (più prossime prima) in modo che la prima sia sempre la prossima in scadenza
- [ ] **DA MIGLIORARE**: Caricare tutti i campi assegnazione nel SELECT (`assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id`)
- [ ] **DA MIGLIORARE**: Salvare tutti i campi assegnazione quando manutenzioni vengono create tramite `AddPointModal`
- [ ] **DA MIGLIORARE**: Visualizzare reparto punto (da `conservation_point.department_id`) insieme ai dettagli assegnazione
- [ ] **DA MIGLIORARE**: Real-time updates quando altri utenti completano/modificano manutenzioni

---

## 🧪 TESTING

### Test da Eseguire

1. **Test caricamento dati**:
   - Verificare che punti e manutenzioni vengano caricati correttamente
   - Verificare comportamento con `company_id` mancante (dovrebbe ritornare array vuoto)
   - Verificare comportamento con errore di rete (dovrebbe mostrare errore)

2. **Test raggruppamento manutenzioni**:
   - Verificare che le manutenzioni vengano raggruppate correttamente per punto
   - Verificare che vengano filtrate solo manutenzioni obbligatorie (temperature, sanitization, defrosting)
   - Verificare che punti senza manutenzioni vengano gestiti correttamente

3. **Test calcolo stato settimanale**:
   - Verificare che stato verde venga calcolato correttamente (tutte manutenzioni completate o non in scadenza)
   - Verificare che stato giallo venga calcolato correttamente (almeno una manutenzione in scadenza questa settimana ma non in ritardo)
   - Verificare che stato rosso venga calcolato correttamente (almeno una manutenzione in ritardo)
   - Verificare priorità rosso > giallo > verde

4. **Test espansione/collasso punto**:
   - Verificare che clic su header punto espanda la sezione manutenzioni
   - Verificare che clic su punto già espanso collassi la sezione
   - Verificare che solo un punto alla volta sia espanso (o tutti espansi, dipende da implementazione)
   - Verificare navigazione tastiera (Enter/Space per espandere)

5. **Test visualizzazione manutenzioni**:
   - Verificare che tutte le informazioni vengano visualizzate correttamente (tipo, scadenza, assegnato a, stato)
   - Verificare che manutenzioni completate mostrino icona verde e data completamento
   - Verificare che manutenzioni in ritardo mostrino icona rossa e indicatore "(In ritardo)"
   - **PROBLEMA**: Verificare che "Assegnato a" mostri solo stringa generica invece di dettagli completi

6. **Test ordinamento manutenzioni**:
   - **PROBLEMA**: Verificare che le manutenzioni NON sono ordinate per scadenza (attualmente mostrate nell'ordine caricamento)
   - Verificare che la prima manutenzione mostrata NON sia sempre la più prossima

7. **Test integrazione calendario**:
   - Verificare che manutenzioni create tramite `AddPointModal` appaiano sia qui che nel calendario
   - Verificare che completamento manutenzione aggiorni sia questa sezione che il calendario

8. **Test responsive design**:
   - Verificare layout mobile (< 640px)
   - Verificare layout tablet (640px - 1024px)
   - Verificare layout desktop (> 1024px)

9. **Test accessibilità**:
   - Verificare navigazione con tastiera (Tab, Enter, Space)
   - Verificare screen reader compatibility
   - Verificare contrasto colori (WCAG AA)

### Scenari di Test

**Scenario 1: Visualizzazione stato settimanale verde**
- **Input**: Punto "Frigo A" con 4 manutenzioni, tutte completate o scadenze future (non questa settimana)
- **Output atteso**: Badge stato verde ("Tutto regolare"), tutte le manutenzioni visualizzate con stato appropriato

**Scenario 2: Visualizzazione stato settimanale giallo**
- **Input**: Punto "Frigo B" con 4 manutenzioni, una in scadenza questa settimana (non completata, scadenza >= now && <= fine settimana)
- **Output atteso**: Badge stato giallo ("Manutenzione in scadenza"), manutenzione in scadenza visualizzata con scadenza evidenziata

**Scenario 3: Visualizzazione stato settimanale rosso**
- **Input**: Punto "Frigo C" con 4 manutenzioni, una in ritardo (scadenza < now && status !== 'completed')
- **Output atteso**: Badge stato rosso ("Manutenzione in ritardo"), manutenzione in ritardo visualizzata con icona rossa e "(In ritardo)"

**Scenario 4: Visualizzazione assegnazione incompleta** (PROBLEMA)
- **Input**: Manutenzione con `assignment_type='role'`, `assigned_to_role='responsabile'`, `assigned_to_category='Cucina'`, `department_id` (FK a reparto "Cucina")
- **Output atteso**: **PROBLEMA** - Mostra solo "Assegnato a: responsabile" invece di "Ruolo: Responsabile | Reparto: Cucina | Categoria: Cucina"
- **Output desiderato**: "Ruolo: Responsabile | Reparto: Cucina | Categoria: Cucina"

**Scenario 5: Ordinamento manutenzioni** (PROBLEMA)
- **Input**: Punto con 4 manutenzioni con scadenze: 20/01, 15/01, 25/01, 10/01
- **Output atteso**: **PROBLEMA** - Manutenzioni mostrate nell'ordine caricamento (non ordinate)
- **Output desiderato**: Manutenzioni ordinate per scadenza: 10/01, 15/01, 20/01, 25/01 (più prossime prima)

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`
- **Pagina parent**: `src/features/conservation/ConservationPage.tsx`
- **Hook Punti**: `src/features/conservation/hooks/useConservationPoints.ts`
- **Hook Manutenzioni**: `src/features/conservation/hooks/useMaintenanceTasks.ts`
- **Modal Creazione**: `src/features/conservation/components/AddPointModal.tsx` (per creazione manutenzioni)
- **Tipi**: `src/types/conservation.ts`

### Documentazione Correlata
- Template standard: `00_TEMPLATE_STANDARD.md`
- Master Index: `00_MASTER_INDEX.md`
- Documentazione ConservationPage: `CONSERVATION_PAGE.md`
- Documentazione AddPointModal: `ADD_POINT_MODAL.md`

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- React Query cache: evita ricaricamenti inutili
- `useMemo` per raggruppamento punti e calcolo stato (evita ricalcoli inutili)
- Lazy rendering: manutenzioni vengono renderizzate solo quando punto è espanso

**Considerazioni performance:**
- **N+1 Query Problem**: Attualmente non presente - tutte le query sono batch con JOIN
- **Re-renders**: Componente potrebbe re-renderizzare quando `expandedPointId` cambia o quando dati vengono ricaricati. Considerare `React.memo` per componenti figli se necessario
- **Calcolo stato**: Viene eseguito per ogni punto ad ogni render, ma è ottimizzato con `useMemo`

**Miglioramenti proposti:**
- Debounce espansione/collasso se necessario (attualmente non necessario, operazione istantanea)
- Virtualizzare liste lunghe se ci sono molti punti (>50 punti con molte manutenzioni)

### Sicurezza

**Validazioni sicurezza:**
- RLS policies: tutte le query sono filtrate automaticamente per `company_id`
- Input sanitization: gestita da Supabase (prepara statement)
- XSS prevention: React escape automaticamente i valori

**Autorizzazioni:**
- Lettura: tutti i membri azienda (RLS policy)
- Visualizzazione: tutti i membri azienda (non ci sono filtri basati su ruolo per la visualizzazione)
- Scrittura (creazione/modifica manutenzioni): solo manager/admin (RLS policy, gestito durante creazione punto)

**Miglioramenti proposti:**
- Filtrare manutenzioni per utente (solo manutenzioni assegnate all'utente corrente o al suo ruolo/categoria/reparto)
- Nascondere dettagli assegnazione per utenti senza permessi (solo manager/admin vedono tutti i dettagli)

### Limitazioni

**Limitazioni conosciute:**
1. **Visualizzazione assegnazione incompleta**: Mostra solo `assigned_to` (stringa generica) invece di ruolo + categoria + reparto + dipendente specifico
2. **Campi assegnazione non caricati**: `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id` non vengono caricati nel SELECT
3. **Campi assegnazione non salvati**: Quando manutenzioni vengono create tramite `AddPointModal`, solo `assigned_to` viene salvato, non gli altri campi
4. **Reparto non visualizzato**: `conservation_point.department_id` è disponibile ma non viene mostrato insieme ai dettagli assegnazione
5. **Ordinamento manutenzioni**: ✅ IMPLEMENTATO - Le manutenzioni sono ordinate per `next_due ASC`
6. **Real-time updates non implementati**: La sezione non si aggiorna automaticamente quando altri utenti completano/modificano manutenzioni
7. **Calendario non sincronizzato**: Non c'è sincronizzazione esplicita con calendario (entrambi leggono dalla stessa tabella ma potrebbero avere cache diverse)
8. **Pulsante "Completa"**: ✅ IMPLEMENTATO - Le card manutenzioni hanno pulsante per completare
9. **Card non espandibili**: Le card manutenzioni non sono cliccabili/espandibili per vedere le prossime 2 manutenzioni programmate per tipo e punto (verificato 2026-01-16)
10. **Visualizzazione limitata**: Utente vede solo prima manutenzione in scadenza per tipo, non può vedere prossime 2 senza espansione card (verificato 2026-01-16)
11. **PROBLEMA RILEVATO (2026-01-16)**: Dopo completare manutenzione, rimane visualizzata la stessa invece di mostrare la prossima - Le manutenzioni completate devono essere filtrate dalla visualizzazione e deve essere mostrata la prossima non completata

**Limitazioni tecniche:**
- React Query cache time: 5 minuti - dati possono essere obsoleti
- Nessuna persistenza locale: se pagina viene ricaricata, tutti i dati vengono ricaricati dal server
- Nessun offline support: app non funziona senza connessione
- Tipo TypeScript `MaintenanceTask` non include tutti i campi del database (manca `assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id`)

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Visualizzazione assegnazione completa**: Mostrare tutti i dettagli disponibili (ruolo, categoria, reparto, dipendente specifico) in formato leggibile
2. **Caricare campi assegnazione**: Aggiornare `useMaintenanceTasks` per includere tutti i campi nel SELECT
3. **Salvare campi assegnazione**: Aggiornare `useConservationPoints` per salvare tutti i campi quando manutenzioni vengono create
4. **Ordinamento manutenzioni**: Ordinare per `next_due ASC` in modo che la prima sia sempre la più prossima
5. **Visualizzazione reparto**: Mostrare reparto punto insieme ai dettagli assegnazione
6. **Filtro per utente**: Permettere all'utente di filtrare solo manutenzioni assegnate a lui/suo ruolo/categoria/reparto
7. **Ricerca manutenzioni**: Permettere ricerca per tipo, punto, stato, scadenza
8. **Azioni rapide**: Permettere completamento manutenzione direttamente dalla sezione (click su card manutenzione)

**Miglioramenti tecnici:**
1. **Aggiornare tipo TypeScript**: Aggiungere campi mancanti a `MaintenanceTask` interface:
   ```typescript
   interface MaintenanceTask {
     // ... campi esistenti
     assignment_type?: 'role' | 'staff' | 'category'
     assigned_to_staff_id?: string
     assigned_to_role?: string
     assigned_to_category?: string
     department_id?: string
     // Relazioni:
     department?: { id: string; name: string }
   }
   ```
2. **Real-time subscriptions**: Implementare Supabase Realtime per aggiornamenti automatici
3. **Sincronizzazione calendario**: Garantire che questa sezione e il calendario siano sempre sincronizzati
4. **Transazioni atomiche**: Usare transazioni per creazione punto + manutenzioni (attualmente non atomica)

**Miglioramenti UX:**
1. **Visualizzazione assegnazione migliorata**: Mostrare badge o chip colorati per ruolo/categoria/reparto
2. **Azioni rapide**: Permettere completamento manutenzione direttamente dalla card (pulsante "Completa")
3. **Notifiche push**: Alert quando manutenzioni sono in scadenza o in ritardo
4. **Esportazione dati**: Permettere export CSV/PDF delle manutenzioni programmate
5. **Filtri avanzati**: Filtro per punto, tipo, stato, scadenza, assegnazione

---

**Ultimo Aggiornamento**: 2026-02-04
**Versione**: 3.1.0

---

## 🆕 CHANGELOG v3.1.0 (2026-02-04)

### Modifiche principali
- **Pallino stato giornaliero**: Verde = nulla da completare oggi; giallo = da completare oggi; rosso = in ritardo. Manutenzioni di domani/settimana non fanno andare in giallo.
- **Conteggio per tipologia**: Numero di tipologie (max 4), non numero di task.
- **Task Rilevamento Temperature**: Nascosti in card quando esiste una lettura temperatura che soddisfa la scadenza; completamento automatico quando l'utente salva una lettura con "Rileva Temperatura" (insert in `maintenance_completions` → task completata in Conservazione e Attività).

### Riferimenti
- `03_CONSERVATION/Lavoro/04-02-2026/REPORT_LAVORO_04-02-2026.md`
- `03_CONSERVATION/Lavoro/04-02-2026/PIANO_completamento_temperatura_su_lettura.md`

---

## 🆕 CHANGELOG v3.0.0 (2026-02-01)

### Features Aggiunte

**Trigger PostgreSQL Automatico**:
- ✅ Funzione `update_maintenance_task_on_completion()` AFTER INSERT su `maintenance_completions`
- ✅ Calcola `next_due` automaticamente basato su `frequency` e `recurrence_config`
- ✅ Supporta daily/weekly/monthly/annually con giorni specifici
- ✅ Atomico: UPDATE task nella stessa transazione
- ✅ File: `supabase/migrations/20260201120000_trigger_maintenance_task_recurrence.sql`

**Integration Check-up Centralizzato**:
- ✅ Task usati da `getPointCheckup()` in `ConservationPointCard`
- ✅ Calcolo gravità arretrati: critical (>7gg), high (3-7gg), medium (1-3gg), low (<1gg)
- ✅ Visualizzazione indicatori colorati nelle card punti
- ✅ Logica "today" considera orario: task 14:00 non mostrato alle 10:00

**Real-time Sync**:
- ✅ Subscription `maintenance-completions-realtime` su INSERT
- ✅ Subscription `maintenance-tasks-realtime` su INSERT/UPDATE/DELETE
- ✅ Invalidation cache automatica quando eventi ricevuti
- ✅ Latenza: 1-2 secondi per aggiornamento UI

**Caricamento Ottimizzato**:
- ✅ Hook `useMaintenanceTasksCritical()` carica solo task critici
- ✅ Query selettiva: arretrati + oggi + prossimo per tipo (condizionale)
- ✅ Performance: ~50 task invece di ~200
- ✅ Logica "next per tipo": mostra solo se oggi completato

### Conflitti Risolti

- ✅ Calcolo `next_due` automatico (no codice applicativo)
- ✅ Real-time sync tra card punti e sezione manutenzioni
- ✅ Completamenti multipli supportati (Mario + Luca scenario)
- ✅ Consistency: trigger garantisce `next_due` sempre corretto

### File Coinvolti

- `src/features/conservation/hooks/useMaintenanceTasksCritical.ts` - Caricamento ottimizzato
- `src/features/conservation/hooks/useConservationRealtime.ts` - Real-time subscriptions
- `src/features/conservation/utils/pointCheckup.ts` - Integrazione calcolo gravità
- `supabase/migrations/20260201120000_trigger_maintenance_task_recurrence.sql` - Trigger

### Riferimenti

- Report dettagliato: `03_CONSERVATION/Lavoro/01-02-2026/REPORT_card_checkup_centralizzato.md`
- Test guide: `GUIDA_TEST_conservation_checkup.md`
- Master index: `00_MASTER_INDEX.md` (entry 01-02-2026)

---