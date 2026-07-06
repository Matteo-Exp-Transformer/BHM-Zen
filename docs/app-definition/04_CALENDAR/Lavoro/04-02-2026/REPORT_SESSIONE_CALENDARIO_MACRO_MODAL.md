# Report lavoro sessione – Calendario e MacroCategoryModal
**Data:** 04-02-2026  
**Contesto:** Interventi su pagina Calendario, pannello statistiche, MacroCategoryModal, completamento/annullamento mansioni, refresh dati e classificazione eventi.

---

## 1. Rimozione sezione "Eventi da Completare" (Statistiche)

**Problema:** L’utente chiedeva di eliminare la sezione nel pannello Statistiche che mostrava "Eventi da Completare" con le card Oggi / Questa Settimana / Questo Mese / Quest’Anno.

**Modifiche:**
- **`src/features/calendar/components/CalendarStatsPanel.tsx`**
  - Rimossa l’intera sezione (titolo "Eventi da Completare" + griglia 4 card).
  - Rimossa la prop `eventsForTemporalStats` dall’interfaccia e dalla destructuring.
  - Rimossa la variabile `temporalEvents`.
- **`src/features/calendar/CalendarPage.tsx`**
  - Rimosso il `useMemo` che calcolava `eventsForTemporalStats`.
  - Rimossa la prop `eventsForTemporalStats` passata a `CalendarStatsPanel`.

**Risultato:** Il pannello Statistiche mostra solo overview (Attività/Mansioni, Completate, In Attesa, In Ritardo), Tasso di completamento e breakdown Per tipologia / Urgenti.

---

## 2. Refresh del MacroCategoryModal senza chiudere/riaprire

**Problema:** Dopo aver completato una mansione nel modal, la lista non si aggiornava; bisognava chiudere e riaprire il modal per vedere lo stato aggiornato.

**Causa:**  
- Gli eventi del modal arrivano da `selectedMacroCategory.events` (stato in CalendarPage), impostato all’apertura e mai aggiornato.  
- `useAggregatedEvents` caricava `task_completions` e `product_expiry_completions` in `useEffect` con dipendenze solo `[companyId]`, quindi non rifetchava dopo invalidazione query.

**Modifiche:**
- **`src/features/calendar/Calendar.tsx`**
  - Aggiunta prop opzionale `onMacroDataUpdated?: () => void`.
  - In `handleMacroDataUpdated` viene chiamata anche `onMacroDataUpdated?.()`.
- **`src/features/calendar/CalendarPage.tsx`**
  - `handleMacroDataUpdated`: invalida le query (`maintenance-tasks`, `generic-tasks`, `task-completions`, `macro-category-events`, `maintenance-completions`) e chiama `triggerRefresh()`.
  - Passaggio di `refreshKey` a `useAggregatedEvents(..., refreshKey)`.
  - `useEffect` di sincronizzazione: quando cambiano `viewBasedEvents` o `refreshKey`, se è aperto `selectedMacroCategory`, si ricalcolano gli eventi del giorno/categoria e si aggiorna `selectedMacroCategory.events` **solo se la “firma” (id+status) cambia**, così il modal si aggiorna anche quando cambia solo lo stato (es. da pending a completed).
- **`src/features/calendar/hooks/useAggregatedEvents.ts`**
  - Firma: `useAggregatedEvents(fiscalYearEnd?, refreshKey?)`.
  - Aggiunto `refreshKey` alle dipendenze degli `useEffect` che caricano `task_completions` e `product_expiry_completions`.

**Risultato:** Completando una mansione, le query si invalidano, i dati si ricaricano, la firma cambia e il modal aggiorna la lista senza chiudersi.

---

## 3. Errore "Task not found" al completamento mansione

**Problema:** In console: `Error completing task: Error: Task not found` (useGenericTasks, mutationFn). La mansione non veniva completata.

**Causa:**  
- Per le ricorrenze, l’evento ha `id` tipo `generic-task-{uuid}-{YYYY-MM-DD}` (occurrence id).  
- Il modal usava `item.metadata.taskId || item.id`; in metadata è presente `task_id` (snake_case), non `taskId`, e in alternativa passava l’occurrence id, che non esiste in `tasks` in useGenericTasks.

**Modifiche:**
- **`src/features/calendar/components/MacroCategoryModal.tsx`**
  - Aggiunto helper `getGenericTaskId(item)`:
    - legge `metadata.task_id` o `metadata.taskId` o `item.id`;
    - se il valore è nel formato `generic-task-{uuid}-{date}`, rimuove prefisso e data e restituisce l’uuid del task;
    - altrimenti restituisce il valore così com’è.
  - Tutte le chiamate a `completeTask` e `uncompleteTask` usano `getGenericTaskId(item)` per ottenere l’id reale del task.

**Risultato:** Il completamento e l’annullamento usano sempre l’id corretto del task; l’errore "Task not found" non si presenta più.

---

## 4. 404 su RPC `log_user_activity`

**Problema:** Dopo il completamento mansione, in console: `POST .../rpc/log_user_activity 404 (Not Found)` e messaggio tipo "Could not find the function public.log_user_activity...".

**Modifiche:**
- **`src/services/activityTrackingService.ts`**
  - In `logActivity`, in caso di errore:
    - se il codice è `PGRST202` o il messaggio indica "Could not find the function", in **DEV** si logga solo un warning chiaro (es. "Activity logging skipped: log_user_activity RPC not found..."); in produzione non si logga nulla;
    - per gli altri errori si continua a usare `console.error`.
  - Stessa logica nel `catch`: se il messaggio indica 404 / log_user_activity / PGRST202, in DEV solo warning, altrimenti `console.error`.

**Risultato:** Il completamento della mansione non è più accompagnato da errori in console; il logging attività resta opzionale finché la RPC non è deployata.

---

## 5. Manutenzioni (Controllo Temperatura) in "Mansioni/Attività generiche"

**Problema:** Gli eventi "🌡️ Controllo Temperatura: Frigo A" comparivano sotto Mansioni/Attività generiche invece che sotto Manutenzioni.

**Causa:**  
- Gli eventi temperatura sono creati con `source: 'temperature_reading'` e senza `maintenance_id`/`task_id`.  
- In `determineEventType` non c’era un caso per `temperature_reading`, quindi finivano nel default `'generic_task'`.

**Modifiche:**
- **`src/types/calendar-filters.ts`**
  - Dopo il controllo per `maintenance` / `maintenance_id`, aggiunto:  
    `if (source === 'temperature_reading') return 'maintenance'`.
  - Aggiornato il commento per indicare che le manutenzioni includono anche i controlli temperatura.

**Risultato:** I controlli temperatura sono classificati come manutenzione e compaiono nel modal Manutenzioni; non compaiono più tra le Mansioni/Attività generiche.

---

## 6. Pulsante "Ancora da Completare" per mansioni completate

**Richiesta:** Nella card espansa di una mansione completata, un pulsante per riportarla "Ancora da Completare", con vincolo: solo chi ha completato o un admin.

**Modifiche:**
- **`src/features/calendar/components/MacroCategoryModal.tsx`**
  - Aggiunto `userRole` da `useAuth()`.
  - Nella sezione "Mansioni/Attività Completate", nel blocco dettagli (card espansa):
    - `canUncomplete = (item.metadata.completedBy === user?.id) || (userRole === 'admin')`.
    - Il pulsante è reso visibile solo se `canUncomplete`.
  - Testo pulsante: "Ancora da Completare" (in loading: "Ripristinando...").
  - Sottotesto: "Annulla il completamento: la mansione tornerà in elenco come da completare."
  - Dopo successo: **non** si chiude più il modal, così l’utente vede la lista aggiornarsi (mansione che torna in "Da completare").

**Risultato:** Solo chi ha completato o un admin vede il pulsante; al click la mansione torna in stato da completare e la lista nel modal si aggiorna senza chiudere.

---

## 7. Annullamento completamento non effettivo ("ripristinata" ma resta completata)

**Problema:** Il toast "Mansione ripristinata" appariva ma la mansione restava completata (0 attive, tutte completate).

**Cause individuate:**
1. Senza `completionId`, la delete filtrava per **periodo = giorno corrente**; se la mansione era completata in un altro giorno (es. data scadenza), non si trovava nessuna riga.
2. Per task **settimanali/mensili**, il completamento in DB ha `period_start`/`period_end` su tutta la settimana o il mese; il filtro "periodo = singolo giorno" non matchava mai.

**Modifiche:**
- **`src/features/calendar/components/MacroCategoryModal.tsx`**
  - In chiamata a `uncompleteTask` si passano:
    - `completionId: item.metadata?.completionId` (quando disponibile da useMacroCategoryEvents).
    - `periodDate: item.dueDate` (data della mansione, usata quando non c’è completionId).
- **`src/features/calendar/hooks/useGenericTasks.ts`**
  - Mutation `uncompleteTask`:
    - Aggiunto parametro opzionale `periodDate?: Date`.
    - Se è presente `completionId`, si elimina con `eq('id', completionId)`.
    - Se non c’è `completionId`, si usa `periodDate` (o oggi) per calcolare `dayStart`/`dayEnd` e si cercano le righe il cui periodo **contiene** quel giorno:  
      `period_start <= dayEnd` **e** `period_end >= dayStart` (overlap), così si trovano completamenti daily, weekly e monthly.
  - Delete con `.select('id')` per poter verificare quante righe sono state eliminate.
- **Debug (temporanei):**
  - In modal: `console.log('[MacroCategoryModal] Uncomplete payload:', { taskId, completionId, periodDate, itemId, metadataKeys })`.
  - In useGenericTasks: log parametri e, dopo la delete, `deleted rows =` e eventuale warning se nessuna riga eliminata.

**Risultato:** La delete agisce sulla riga corretta (per id o per periodo); la mansione torna davvero "da completare" e la lista si aggiorna.

---

## Riepilogo file toccati

| File | Interventi |
|------|------------|
| `src/features/calendar/components/CalendarStatsPanel.tsx` | Rimossa sezione Eventi da Completare e prop `eventsForTemporalStats` |
| `src/features/calendar/CalendarPage.tsx` | Refresh macro, sync eventi modal (firma id+status), `handleMacroDataUpdated`, passaggio `refreshKey` a useAggregatedEvents |
| `src/features/calendar/Calendar.tsx` | Prop `onMacroDataUpdated`, chiamata in `handleMacroDataUpdated` |
| `src/features/calendar/hooks/useAggregatedEvents.ts` | Parametro `refreshKey`, dipendenze negli useEffect per task_completions e product_expiry_completions |
| `src/features/calendar/components/MacroCategoryModal.tsx` | `getGenericTaskId`, pulsante "Ancora da Completare" (solo completer/admin), passaggio completionId/periodDate a uncompleteTask, log debug |
| `src/features/calendar/hooks/useGenericTasks.ts` | uncomplete: parametro `periodDate`, filtro periodo per overlap, `.select('id')`, log debug |
| `src/types/calendar-filters.ts` | `determineEventType`: caso `source === 'temperature_reading'` → `'maintenance'` |
| `src/services/activityTrackingService.ts` | Gestione 404/PGRST202 su `log_user_activity` senza errori in console |

---

## Note operative

- I **log di debug** in MacroCategoryModal e useGenericTasks (uncomplete) possono essere rimossi o messi dietro `import.meta.env.DEV` quando non servono più.
- Per avere il tracking attività effettivo in produzione va creata e deployata la RPC `log_user_activity` in Supabase con la firma usata dal client.
