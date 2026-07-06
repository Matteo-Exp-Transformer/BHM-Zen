# Report: MacroCategoryModal – Scadenza, titolo manutenzione, Reparto, completamento e refresh

**Data:** 29-01-2026  
**Contesto:** Calendario – modal macro categoria (Manutenzioni / Mansioni / Scadenze prodotti)  
**File principali:** `MacroCategoryModal.tsx`, `CategoryEventsModal.tsx`, `useMacroCategoryEvents.ts`

---

## 1. Problema "Scadenza: Invalid Date"

### Causa
Due percorsi diversi alimentano il modal:
- **Click sulla bolla macro** (useMacroCategories = true): il Calendar passa `extendedProps.items`, che sono già **MacroCategoryItem[]** (con `dueDate`, non `start`).
- **Click su singolo evento**: CalendarPage passa `dayEvents` (CalendarEvent[]), ciascuno con `start`.

Il modal applicava sempre `convertEventToItem(event)` ai `passedEvents`, pensando fossero CalendarEvent. Per i MacroCategoryItem non esiste `event.start`, quindi `dueDate: new Date(event.start)` diventava `new Date(undefined)` → data non valida → "Invalid Date" in etichetta Scadenza.

### Interventi
1. **Riconoscimento del tipo di payload**
   - Aggiunta la funzione `isMacroCategoryItem(obj)` che verifica presenza di `dueDate` e `metadata`.
   - Se il primo elemento di `passedEvents` è un MacroCategoryItem, gli item non vengono convertiti; si usa solo `normalizeDueDate(item.dueDate)` per gestire stringhe (es. serializzazione FullCalendar).

2. **Formattazione difensiva della data**
   - Aggiunta `formatDueDate(d, format)` che restituisce `"—"` per valori null/undefined/invalidi; altrimenti formatta con `toLocaleDateString('it-IT', ...)`.
   - Formati: `'full'` (giorno/mese/anno/ora/minuto), `'short'` (giorno + mese breve), `'medium'` (giorno + mese lungo, per toast).
   - Tutte le visualizzazioni di Scadenza e i messaggi toast che usavano la data usano ora `formatDueDate`, così non compare mai "Invalid Date".

3. **Normalizzazione `dueDate`**
   - Aggiunta `normalizeDueDate(d)` che converte stringhe in `Date` e, in caso di valore non valido, usa l'inizio del giorno corrente come fallback.

---

## 2. Nome punto di conservazione nel titolo (manutenzioni)

### Richiesta
Nel titolo delle card delle **manutenzioni attive** (e coerente nelle sezioni In ritardo e Completate) mostrare anche il **nome del punto di conservazione** a cui è assegnata la manutenzione.

### Implementazione
- Utilizzo di `useConservationPoints()` per ottenere l'elenco dei punti.
- Mappa `conservationPointNameById` (id punto → nome) derivata da tale elenco.
- Funzione `getMaintenanceDisplayTitle(item)`:
  - legge **entrambi** i formati: `item.metadata.conservationPointId` (camelCase) **oppure** `item.metadata.conservation_point_id` (snake_case);
  - recupera il nome dalla mappa;
  - restituisce `"Titolo – Nome punto"` se il punto c'è, altrimenti solo `item.title`.

> **Nota (fix 30-01-2026):** Il supporto a entrambi i formati (camelCase e snake_case) è stato aggiunto perché gli eventi calendario usano snake_case mentre gli item da `useMacroCategoryEvents` usano camelCase.

Applicata in:
- Sezione **Manutenzioni attive** (h3 della card).
- Sezione **Manutenzioni in ritardo** (h3).
- Sezione **Manutenzioni completate** (h3).

Esempio: da "Rilevamento Temperature" a "Rilevamento Temperature – Frigo cucina".

---

## 3. Reparto sulla card (manutenzioni)

### Richiesta
Sulla card mostrare anche il **Reparto** a cui è assegnato il punto di conservazione.

### Implementazione
- I punti di conservazione sono caricati con la relazione `department:departments(id, name)` (hook `useConservationPoints`).
- Aggiunta la mappa `conservationPointDepartmentById` (id punto → nome reparto) a partire da `conservationPoints` e da `(p as { department?: { id: string; name: string } }).department?.name`.
- Nelle tre sezioni (Attive, In ritardo, Completate), per le manutenzioni con `item.metadata.conservationPointId` **oppure** `item.metadata.conservation_point_id` e reparto disponibile nella mappa, viene mostrata una riga:
  - **Reparto:** `{nome reparto}`

> **Nota (fix 30-01-2026):** Il lookup del reparto supporta entrambi i formati (camelCase e snake_case) per `conservationPointId`, coerentemente con `getMaintenanceDisplayTitle`.

Posizionamento:
- **Attive e In ritardo:** nella stessa riga di Frequenza / Assegnato a / Scadenza (flex-wrap), tra "Assegnato a" e "Scadenza".
- **Completate:** sotto il titolo, come riga di testo "Reparto: {nome}".

---

## 4. Completamento manutenzione (fix 400 e ID corretto)

### Problema
Al click su "Completa Manutenzione" Supabase restituiva **400**. L'update su `maintenance_tasks` usava `item.id` come chiave. Per gli eventi da calendario (es. Visualizza calendario) `item.id` è l'ID composito `maintenance-{uuid}-{data}` (es. `maintenance-c4665e88-...-2026-01-28`), mentre la colonna `id` in DB è **UUID**. Il filtro `.eq('id', ...)` con una stringa non-UUID causava l'errore.

### Interventi
- In **MacroCategoryModal** e **CategoryEventsModal**, alla chiamata di `handleCompleteMaintenance` si usa sempre l'UUID del task:  
  `item.metadata?.maintenance_id ?? item.id`.  
  Con eventi da calendario è presente `maintenance_id`; con item da `useMacroCategoryEvents` spesso `id` è già l'UUID.
- In **useMacroCategoryEvents** (`convertMaintenanceToItem`) è stato aggiunto `maintenance_id: task.id` in `metadata`, così anche gli item da macro-category hanno l'UUID esplicito per il completamento.

**File toccati:** `MacroCategoryModal.tsx`, `CategoryEventsModal.tsx`, `useMacroCategoryEvents.ts`.

---

## 5. Refresh del modal dopo "Completa Manutenzione"

### Problema
Dopo aver completato una manutenzione il modal non si aggiornava: bisognava chiuderlo e riaprirlo per vedere l'item in "Completati".

### Approccio scartato
Inizialmente si è provato a passare, dopo il completamento, da `passedEvents` a `getCategoryForDate(date, category)` per mostrare dati “freschi”. In quel caso il modal poteva risultare **vuoto**: `getCategoryForDate` può restituire `null` (mismatch di `dateKey` UTC vs locale, o assenza di evento per quella data). Inoltre si sarebbe **cambiata** la fonte dei dati, in contrasto con la logica del report (due percorsi distinti: bolla macro vs singolo evento, senza mescolarli).

### Soluzione adottata (allineata al report)
- **Nessuno switch di fonte:** si continua a usare sempre `passedEvents` (se presenti) oppure `getCategoryForDate`, come prima.
- **Aggiornamento ottimistico sulla lista corrente:**
  - Stato `maintenanceCompletedIds: Set<string>`, azzerato alla chiusura del modal (`useEffect` su `isOpen`).
  - Dopo "Completa Manutenzione" si aggiunge l'id della manutenzione completata (quello usato per l'update, cioè `metadata?.maintenance_id ?? item.id`) a `maintenanceCompletedIds`.
  - Da `categoryEvent` si derivano `baseItems`; se `category === 'maintenance'` e `maintenanceCompletedIds` non è vuoto, si mappano gli item e si imposta `status: 'completed'` per quelli il cui `metadata?.maintenance_id ?? item.id` è nel set. Il risultato è `rawItems`, da cui si applicano filtri e si ottiene `items`.
- L'item completato passa subito in "Completati" senza cambiare fonte dati; invalidazione delle query (maintenance-tasks, calendar-events, macro-category-events, maintenance-completions) e `onDataUpdated` restano per aggiornare il calendario e i dati in background.

**File toccati:** `MacroCategoryModal.tsx`.

---

## 6. Scroll automatico controllato (fix 30-01-2026)

### Problema originale
Dopo il completamento si verificava uno scroll automatico verso la sezione "Manutenzioni completate", fastidioso per l'utente.

### Causa
Un `useEffect` eseguiva `scrollIntoView({ behavior: 'smooth', block: 'center' })` sull'elemento `maintenance-item-${highlightMaintenanceTaskId}`. Quando l'item completato passava in "Completati", `items` cambiava, l'effetto si rieseguiva e faceva scroll proprio a quella sezione.

### Soluzione definitiva (30-01-2026)
Lo scroll automatico **è necessario** per la funzionalità "Visualizza nel Calendario" (altrimenti l'utente deve cercare manualmente la card evidenziata). Il problema era che si riattivava dopo il completamento.

**Implementazione con `useRef`:**
- Aggiunto `scrolledRef` per tracciare se lo scroll è già stato eseguito per un dato `highlightMaintenanceTaskId`
- **Primo `useEffect`**: resetta `scrolledRef.current = false` quando cambia `highlightMaintenanceTaskId` o il modal si chiude
- **Secondo `useEffect`**: esegue lo scroll **solo se**:
  1. Modal è aperto (`isOpen`)
  2. C'è un ID da evidenziare (`highlightMaintenanceTaskId`)
  3. Non abbiamo già scrollato (`scrolledRef.current === false`)
  4. Gli items sono caricati (dipendenza `items.length`)
- Dopo lo scroll, imposta `scrolledRef.current = true`
- Timeout di 300ms per aspettare il rendering completo

**Risultato:** Lo scroll funziona all'apertura del modal da "Visualizza nel Calendario", ma **non si riattiva** dopo il completamento (perché il flag è già `true`).

**File toccati:** `MacroCategoryModal.tsx`.

---

## 7. Riepilogo modifiche tecniche

| Intervento | Dettaglio |
|------------|-----------|
| Helper `isMacroCategoryItem` | Type guard per distinguere MacroCategoryItem da CalendarEvent. |
| Helper `normalizeDueDate` | Converte stringa → Date; invalido → inizio giornata corrente. |
| Helper `formatDueDate(d, 'full' \| 'short' \| 'medium')` | Formattazione sicura; invalido → "—". |
| Logica `categoryEvent` | Se `passedEvents[0]` è MacroCategoryItem → item usati così come sono + `normalizeDueDate`; altrimenti `convertEventToItem`. **Mai** switch a `getCategoryForDate` dopo completamento. |
| `useConservationPoints` | Usato nel modal per nome punto e nome reparto. |
| `conservationPointNameById`, `conservationPointDepartmentById` | Mappe id → nome punto / nome reparto. |
| `getMaintenanceDisplayTitle(item)` | Titolo manutenzione con eventuale " – Nome punto"; supporta `conservationPointId` (camelCase) e `conservation_point_id` (snake_case). |
| Blocco "Reparto" | Solo per `category === 'maintenance'` e quando il punto ha reparto; nelle tre sezioni (Attive, In ritardo, Completate); supporta entrambi i formati di ID. |
| Completamento manutenzione | `handleCompleteMaintenance(metadata?.maintenance_id ?? item.id)` in MacroCategoryModal e CategoryEventsModal; `metadata.maintenance_id` in `convertMaintenanceToItem`. |
| Refresh ottimistico | `maintenanceCompletedIds`; override `status: 'completed'` sugli item completati; reset al close. |
| Scroll controllato (fix 30-01) | `useEffect` con `scrollIntoView` su `maintenance-item-*` + `scrolledRef` per evitare scroll ripetuto dopo completamento; scroll solo all'apertura iniziale. |

---

## 8. Verifica

- Con **useMacroCategories = true**: click sulla bolla macro di un giorno → modal aperto con item già MacroCategoryItem → Scadenza corretta (o "—" se assente).
- Con click su **singolo evento**: modal con item da CalendarEvent → Scadenza da `event.start` corretta.
- **Manutenzioni:** titolo con "Titolo – Nome punto" quando il punto è assegnato; riga "Reparto: Nome reparto" quando il punto ha un reparto.
- **Completa Manutenzione:** nessun 400; uso di UUID per l'update; modal si aggiorna subito (item in "Completati") senza chiudere/riaprire; nessuno scroll automatico dopo il completamento.
- **Scroll automatico (fix 30-01):** Click su "Visualizza nel Calendario" → scroll automatico alla card evidenziata; completamento manutenzione → nessuno scroll indesiderato (flag `scrolledRef` impedisce ripetizione).
- Nessuna modifica a backend o API; solo componenti e hook indicati (MacroCategoryModal, CategoryEventsModal, useMacroCategoryEvents) e `useConservationPoints` per punto/reparto.
