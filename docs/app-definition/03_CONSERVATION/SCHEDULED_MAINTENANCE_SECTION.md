> **Stato Fase 3** (2026-07-06): `verificato-ok` · Fonte: [`FASE3_REPORT_A2`](../../META/FASE3_REPORT_A2_CONSERVATION.md) §5.5  
> **Motivo**: copia legacy (v1.1.0); contenuto sostituito da `Conoscenze-Definizioni/SCHEDULED_MAINTENANCE_SECTION.md` (v3.1). Trigger/manutenzioni OK su DB live.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# SCHEDULED_MAINTENANCE_SECTION - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16  
**Ultima Modifica**: 2026-01-16  
**Versione**: 1.1.0

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
- **Consultare** rapidamente lo stato settimanale (verde/giallo/rosso) di ogni punto
- **Visualizzare** la prossima manutenzione in scadenza per ogni punto (basata sul calendario)
- **Verificare** chi è assegnato alle manutenzioni (ruolo, categoria, reparto, dipendente specifico)
- **Organizzare** le manutenzioni per punto in una struttura scalabile e facilmente consultabile

### Scopo Tecnico
La sezione è implementata tramite il componente `ScheduledMaintenanceCard` e include:

- **CollapsibleCard principale**: "Manutenzioni Programmate" con sottotitolo "Situazione settimanale per punto di conservazione"
- **CollapsibleCard annidate per punto**: Ogni punto di conservazione ha la propria sezione espandibile
- **Badge stato settimanale**: Pallino colorato (verde/giallo/rosso) che indica lo stato delle manutenzioni per questa settimana
- **Conteggio manutenzioni**: Numero di manutenzioni obbligatorie associate al punto
- **Lista manutenzioni espandibile**: Quando si clicca su un punto, mostra le manutenzioni con dettagli

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

1. **Consultare stato settimanale manutenzioni**
   - **Scenario**: Un responsabile HACCP vuole verificare rapidamente quali punti hanno manutenzioni in scadenza questa settimana
   - **Azione**: Apre la pagina Conservazione, visualizza la sezione "Manutenzioni Programmate", vede i pallini colorati (verde = tutto regolare, giallo = in scadenza, rosso = in ritardo)
   - **Risultato**: Identifica rapidamente i punti che richiedono attenzione

2. **Visualizzare prossima manutenzione in scadenza**
   - **Scenario**: Un manager vuole sapere quale è la prossima manutenzione in scadenza per "Frigo A"
   - **Azione**: Clicca sulla sezione espandibile "Frigo A" nella lista, vede le manutenzioni ordinate per scadenza, la prima è la prossima
   - **Risultato**: Vede tipo manutenzione ("Rilevamento Temperature"), scadenza ("19/01/2026"), assegnato a ("responsabile")

3. **Verificare assegnazione manutenzione**
   - **Scenario**: Un dipendente vuole sapere se è assegnato a una manutenzione specifica
   - **Azione**: Visualizza le manutenzioni programmate, clicca su un punto, vede dettagli assegnazione
   - **Risultato**: Vede "Assegnato a: [ruolo/categoria/reparto/dipendente specifico]" - **PROBLEMA ATTUALE**: Vede solo stringa generica invece di dettagli completi

4. **Verificare manutenzioni completate**
   - **Scenario**: Un responsabile vuole verificare se tutte le manutenzioni previste per questa settimana sono state completate
   - **Azione**: Visualizza la sezione "Manutenzioni Programmate", vede pallino verde su punti con tutte manutenzioni completate
   - **Risultato**: Identifica rapidamente punti con manutenzioni ancora in sospeso

### Flusso Utente

**Flusso principale - Consultazione:**
1. Utente naviga a "Conservazione" dal menu principale
2. La pagina carica automaticamente tutti i punti di conservazione e le manutenzioni obbligatorie
3. Utente vede la sezione "Manutenzioni Programmate" (di default espansa)
4. Nella lista, vede ogni punto di conservazione con:
   - Badge stato settimanale (pallino verde/giallo/rosso)
   - Nome punto (es. "Frigo A")
   - Numero manutenzioni (es. "4 manutenzioni")
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

#### Conflitto 2: Calcolo stato settimanale con manutenzioni multiple
- **Quando si verifica**: Un punto ha 4 manutenzioni con scadenze diverse (alcune completate, alcune in ritardo, alcune in scadenza)
- **Cosa succede**: Lo stato viene calcolato con priorità: rosso (in ritardo) > giallo (in scadenza) > verde (tutto regolare)
- **Come viene gestito**: **GESTITO CORRETTAMENTE** - La funzione `calculateWeeklyStatus()` calcola lo stato correttamente:
  - Se almeno una manutenzione è in ritardo (scadenza < now && status !== 'completed') → rosso
  - Se almeno una manutenzione è in scadenza questa settimana (scadenza >= now && scadenza <= fine settimana && status !== 'completed') → giallo
  - Altrimenti → verde (tutto regolare)

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

#### `calculateWeeklyStatus(maintenances: MaintenanceTask[])`
- **Scopo**: Calcola stato settimanale per un punto di conservazione basato sulle sue manutenzioni
- **Parametri**: `maintenances: MaintenanceTask[]` - array manutenzioni per il punto
- **Ritorna**: `'green' | 'yellow' | 'red'` - stato settimanale
- **Logica**: 
  1. Ottiene fine settimana corrente
  2. Per ogni manutenzione, verifica:
     - Se scadenza è questa settimana o precedente (`next_due <= weekEnd`)
     - Se è in ritardo (`next_due < now && status !== 'completed'`)
     - Se è in scadenza (`next_due >= now && next_due <= weekEnd && status !== 'completed'`)
  3. Se almeno una manutenzione è in ritardo → `'red'` (priorità massima)
  4. Se almeno una manutenzione è in scadenza → `'yellow'`
  5. Altrimenti → `'green'` (tutto regolare)

**Regole stato:**
- **Verde**: Tutte le manutenzioni previste per questa settimana sono completate, oppure non ci sono manutenzioni in scadenza questa settimana
- **Giallo**: Almeno una manutenzione in scadenza questa settimana ma non in ritardo (scadenza >= now && scadenza <= fine settimana && status !== 'completed')
- **Rosso**: Almeno una manutenzione in ritardo (scadenza < now && status !== 'completed')

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
   - Ordina manutenzioni per `next_due` (più prossime prima) - **ATTUALMENTE NON IMPLEMENTATO**: le manutenzioni vengono mostrate nell'ordine in cui vengono caricate dal database
   - Mostra per ogni manutenzione:
     - Tipo manutenzione (tradotto in nome leggibile)
     - Scadenza formattata (DD/MM/YYYY)
     - Assegnato a (solo `task.assigned_to` - PROBLEMA: mancano dettagli)
     - Stato (icona verde se completata, icona rossa se in ritardo)
     - Data completamento (se completata)

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

### Integrazione con Calendario

**Relazione con calendario:**
- Le manutenzioni vengono programmate nel calendario quando vengono create tramite `AddPointModal`
- Il calendario mostra le manutenzioni come eventi basati su `next_due`
- La sezione "Manutenzioni Programmate" legge gli stessi dati (`maintenance_tasks`) per mostrare la prossima scadenza
- Entrambi usano la stessa tabella `maintenance_tasks` come fonte dati

**Sincronizzazione:**
- Quando una manutenzione viene completata/modificata, sia il calendario che questa sezione dovrebbero aggiornarsi
- Attualmente sincronizzati tramite cache React Query (stesso query key)
- **Rischio**: Se query keys sono diversi o cache non viene invalidata correttamente, potrebbero mostrare dati diversi

**Soluzione proposta**: 
- Garantire che entrambi usino stesso query key o che cache venga invalidata correttamente
- Implementare real-time subscriptions per sincronizzazione automatica

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
5. **Ordinamento manutenzioni mancante**: Le manutenzioni non sono ordinate per scadenza, quindi la prima visualizzata non è sempre la più prossima
6. **Real-time updates non implementati**: La sezione non si aggiorna automaticamente quando altri utenti completano/modificano manutenzioni
7. **Calendario non sincronizzato**: Non c'è sincronizzazione esplicita con calendario (entrambi leggono dalla stessa tabella ma potrebbero avere cache diverse)
8. **Pulsante "Completa" mancante**: Le card manutenzioni non hanno pulsante per completare la manutenzione direttamente dalla card (verificato 2026-01-16)
9. **Card non espandibili**: Le card manutenzioni non sono cliccabili/espandibili per vedere le prossime 2 manutenzioni programmate per tipo e punto (verificato 2026-01-16)
10. **Visualizzazione limitata**: Utente vede solo prima manutenzione in scadenza per tipo, non può vedere prossime 2 senza espansione card (verificato 2026-01-16)

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

**Ultimo Aggiornamento**: 2026-01-16  
**Versione**: 1.0.0