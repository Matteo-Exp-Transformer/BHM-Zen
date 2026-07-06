# Report: Pulsante "Visualizza nel Calendario" e fix correlati

**Data**: 29 Gennaio 2026
**Contesto**: Conservazione / Calendario – collegamento card manutenzioni → pagina Attività con modal macro categoria ed evidenziazione.
**Stato**: ✅ COMPLETATO

---

## 1. Obiettivo

Aggiungere un pulsante **"Visualizza nel Calendario"** nella card manutenzioni (`ScheduledMaintenanceCard`), navigare alla pagina **Attività** con il `MacroCategoryModal` aperto sulla **data di scadenza** della manutenzione e **evidenziare** la manutenzione scelta (bordi animati con pulse + auto-scroll).

> **Nota (fix 30-01-2026):** L'auto-scroll è stato implementato con un sistema di flag (`scrolledRef`) per evitare scroll ripetuto dopo il completamento. Lo scroll avviene solo all'apertura iniziale del modal, non quando gli item cambiano stato (vedi REPORT_MACRO_CATEGORY_MODAL sezione 6).

---

## 2. Implementazione principale

### 2.1 File modificati

| File | Modifiche |
|------|-----------|
| **ScheduledMaintenanceCard.tsx** | Import `useNavigate`, icona `Calendar`; pulsante a destra nella card che naviga a `/attivita` con `state`: `openMacroCategory: 'maintenance'`, `date` (ISO), `highlightMaintenanceTaskId: task.id`. |
| **CalendarPage.tsx** | `useLocation` / `useNavigate`; stato `selectedMacroCategory` esteso con `highlightMaintenanceTaskId`; chiave primitiva `maintenanceNavKey` da `location.state`; `useEffect` che alla navigazione con state apre il modal (filtra eventi del giorno, imposta `selectedMacroCategory`, poi `navigate(..., state: {})`). |
| **Calendar.tsx** | Tipo `selectedMacroCategory` con `highlightMaintenanceTaskId`; prop `highlightMaintenanceTaskId` passata a `MacroCategoryModal`. |
| **MacroCategoryModal.tsx** | Prop `highlightMaintenanceTaskId`; `scrollContainerRef`; `useEffect` auto-scroll con `scrolledRef` (flag per evitare scroll ripetuto); helper `shouldHighlight(item)`; tre sezioni (Attive, In Ritardo, Completate) con `id` e classe condizionale (bordo blu, ring, `animate-pulse`) per l'item da evidenziare; stato `highlightDismissed` per fermare il pulse al click. *(Fix 30-01: scroll controllato con ref – vedi REPORT_MACRO sezione 6)* |

### 2.2 Flusso dati

1. Utente clicca icona Calendario su una manutenzione in `ScheduledMaintenanceCard`.
2. `navigate('/attivita', { state: { openMacroCategory: 'maintenance', date, highlightMaintenanceTaskId } })`.
3. `CalendarPage` monta; quando `!isLoading` e `maintenanceNavKey` valorizzato, l'effect filtra gli eventi del giorno per quella data e `source === 'maintenance'`, imposta `selectedMacroCategory` (con `highlightMaintenanceTaskId`) e pulisce lo state con `navigate(..., state: {})`.
4. `Calendar` riceve `selectedMacroCategory` e passa `highlightMaintenanceTaskId` a `MacroCategoryModal`.
5. Il modal applica highlight (bordo blu + pulse) e **auto-scroll** all'elemento con `id="maintenance-item-${metadata.maintenance_id}"` usando `scrollIntoView` con `scrolledRef` (flag che impedisce scroll ripetuto).
6. Al click sulla card evidenziata, `highlightDismissed` diventa `true` e il pulse si ferma.

---

## 3. Fix applicati (bug emersi in sessione)

### 3.1 Maximum update depth exceeded (loop)

- **Causa**: L'`useEffect` in `CalendarPage` dipendeva da `location.state` e `viewBasedEvents`. Dopo `setSelectedMacroCategory` e `navigate()` il re-render faceva ripartire l'effect (riferimenti oggetto/array cambiati).
- **Fix**: Dipendenze dell'effect ridotte a **valori primitivi**: `maintenanceNavKey` (stringa derivata da `location.state`: `openMacroCategory-date-highlightMaintenanceTaskId` o `null`), `isLoading`, `navigate`. Rimosso `viewBasedEvents` dalle dipendenze; gli eventi del giorno vengono letti da `displayEvents` in closure.

### 3.2 "Cannot convert object to primitive value" ✅ RISOLTO

- **Causa**: In dev, React (o strumenti) prova a convertire in stringa le dipendenze degli hook (es. per un warning). Se in un array di dipendenze c'è un **oggetto** (o un Proxy, es. da React Query / router), la conversione fallisce con questo messaggio.
- **Root cause identificato**: Gli hook `useCalendarStats` e `useCalendarAlerts` avevano **array** (`viewBasedEvents`, `events`, `dismissedAlerts`) come dipendenze dirette nei loro `useMemo`.
- **Fix definitivo**:
  - **useCalendarStats.ts**: Convertite le dipendenze da `[viewBasedEvents, view, refreshKey]` a `[eventsKey, view, refreshKey]` dove `eventsKey` è una stringa primitiva derivata da `eventsLength-firstId-lastId`.
  - **useCalendarAlerts.ts**: Convertite le dipendenze da `[events, dismissedAlerts]` a `[eventsKey, dismissedAlertsKey]` dove entrambe sono stringhe primitive.

### 3.3 406 Not Acceptable su `user_profiles`

- **Causa**: La query in `useAuth` usava `.single()`; PostgREST restituisce **406** quando la query restituisce **0 righe** con `.single()`.
- **Fix**: Sostituito `.single()` con **`.maybeSingle()`** nella query `user_profiles` in `src/hooks/useAuth.ts`. Con 0 righe si ottiene `{ data: null, error: null }` (200) invece di 406.

### 3.4 Console intasata da log GoTrue (Supabase Auth)

- **Causa**: Nel client Supabase era impostato `debug: import.meta.env.DEV`, quindi in sviluppo tutti i log di GoTrue (SIGNED_IN, _recoverAndRefresh, _handleVisibilityChange, ecc.) riempivano la console.
- **Fix**: In `src/lib/supabase/client.ts` impostato **`debug: import.meta.env.VITE_SUPABASE_DEBUG === 'true'`**. I log di debug partono solo se in `.env.local` è presente `VITE_SUPABASE_DEBUG=true`. In `env.example` aggiunto commento per questa variabile opzionale.

### 3.5 Modal vuoto alla apertura dopo il click

- **Causa**: Gli eventi passati al modal erano costruiti filtrando **`viewBasedEvents`**, che contiene solo gli eventi della **vista corrente** (mese/settimana/giorno). Se la data di scadenza della manutenzione era in un altro mese o settimana, il filtro restituiva 0 eventi e il modal risultava vuoto.
- **Fix**: Nel `useEffect` di gestione navigazione da card manutenzioni, il filtro per gli eventi del giorno usa **`eventsForFiltering`** (tutti gli eventi già caricati) invece di `viewBasedEvents`. Aggiunta normalizzazione date a mezzanotte per confronto corretto.

### 3.6 Pulse animazione continua dopo click ✅ RISOLTO

- **Causa**: L'animazione `animate-pulse` continuava anche dopo che l'utente aveva cliccato sulla card evidenziata.
- **Fix**: Aggiunto stato `highlightDismissed` in `MacroCategoryModal`. Quando l'utente clicca sulla card evidenziata, `setHighlightDismissed(true)` viene chiamato e la funzione `shouldHighlight()` restituisce `false`, fermando l'animazione.

### 3.7 Nome punto di conservazione non visualizzato ✅ RISOLTO

- **Causa**: Il metadata degli eventi manutenzione usa la convenzione **snake_case** (`conservation_point_id`), ma il codice in `MacroCategoryModal.tsx` cercava solo la versione **camelCase** (`conservationPointId`).
- **Impatto**: Il nome del punto di conservazione non veniva mostrato accanto al nome della manutenzione nel modal.
- **Fix**: Modificato il codice in 5 punti nel file `MacroCategoryModal.tsx` per supportare **entrambi** i formati:
  1. **`getMaintenanceDisplayTitle`** (linea 144-148): Funzione helper per il titolo – già fixato
  2. **Sezione "Reparto" attività attive** (linea 575-588): IIFE che cerca entrambe le chiavi
  3. **Dettagli "Punto di Conservazione"** (linea 624-636): IIFE che mostra nome o ID
  4. **Sezione "Reparto" attività in ritardo** (linea 841-854): IIFE che cerca entrambe le chiavi
  5. **Sezione "Reparto" attività completate** (linea 985-996): IIFE che cerca entrambe le chiavi

```typescript
// ✅ Pattern usato per supportare entrambi i formati
const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
const pointName = pointId ? conservationPointNameById.get(pointId) : undefined
```

### 3.8 Scroll automatico controllato ✅ IMPLEMENTATO (30-01-2026)

- **Contesto**: L'auto-scroll è necessario per la funzionalità "Visualizza nel Calendario", ma causava scroll indesiderato dopo il completamento di una manutenzione.
- **Problema**: Un `useEffect` con dipendenza su `items` faceva scattare lo scroll ogni volta che gli item cambiavano (es. dopo completamento).
- **Fix**: Aggiunto `scrolledRef` (useRef) per tracciare se lo scroll è già stato eseguito per un dato `highlightMaintenanceTaskId`:
  - **Primo useEffect**: resetta il flag quando cambia l'ID o il modal si chiude
  - **Secondo useEffect**: esegue lo scroll solo se modal aperto, ID presente, flag false, e items caricati
  - Dopo lo scroll, imposta `scrolledRef.current = true`
  - Timeout 300ms per aspettare rendering completo
- **Risultato**: Lo scroll funziona all'apertura da "Visualizza nel Calendario", ma non si riattiva dopo completamento (perché il flag rimane `true`).

---

## 4. Riepilogo file toccati

| File | Modifiche |
|------|-----------|
| `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` | Pulsante e navigazione |
| `src/features/calendar/CalendarPage.tsx` | State, chiave primitiva, effect, filtro su `eventsForFiltering`, normalizzazione date |
| `src/features/calendar/Calendar.tsx` | Tipo e prop `highlightMaintenanceTaskId` |
| `src/features/calendar/components/MacroCategoryModal.tsx` | Prop, ref, `shouldHighlight`, `highlightDismissed`, tre div con id e classe highlight, **scroll controllato con `scrolledRef`** (fix 30-01 – vedi REPORT_MACRO sezione 6 e 3.8) |
| `src/features/calendar/hooks/useCalendarStats.ts` | Dipendenze primitive (`eventsKey`) |
| `src/features/calendar/hooks/useCalendarAlerts.ts` | Dipendenze primitive (`eventsKey`, `dismissedAlertsKey`) |
| `src/features/calendar/hooks/useFilteredEvents.ts` | Dipendenze primitive (già fixato in precedenza) |
| `src/hooks/useAuth.ts` | `.maybeSingle()` su `user_profiles` |
| `src/lib/supabase/client.ts` | `debug` condizionato a `VITE_SUPABASE_DEBUG` |
| `src/components/OnboardingGuard.tsx` | Dipendenze primitive (già fixato in precedenza) |
| `env.example` | Commento per `VITE_SUPABASE_DEBUG` |

---

## 5. Verifiche completate

- ✅ Dalla Dashboard (o Conservazione), clic su icona Calendario di una manutenzione → navigazione a `/attivita` → modal Manutenzioni aperto sulla data di scadenza → manutenzione evidenziata (bordo blu animato) e **auto-scroll** alla card. *(Fix 30-01: scroll controllato con `scrolledRef` – vedi sezione 3.8)*
- ✅ Refresh su `/attivita` dopo la navigazione → il modal non si riapre (state pulito).
- ✅ Manutenzione in sezione "In Ritardo" o "Completate" → evidenziazione corretta.
- ✅ Click sulla card evidenziata → animazione pulse si ferma.
- ✅ Completamento manutenzione evidenziata → item passa in "Completati", **nessuno scroll automatico indesiderato** (flag `scrolledRef` impedisce ripetizione).
- ✅ Nessun crash "Cannot convert object to primitive value".
- ✅ Nome del punto di conservazione visualizzato correttamente accanto al nome della manutenzione (supporto snake_case e camelCase).

---

## 6. Pattern fix dipendenze (riferimento futuro)

Per evitare l'errore "Cannot convert object to primitive value" in dev, **mai usare oggetti/array come dipendenze dirette** nei hook React (`useEffect`, `useMemo`, `useCallback`).

### Pattern corretto:

```typescript
// ❌ SBAGLIATO - array come dipendenza
const result = useMemo(() => {
  return events.filter(...)
}, [events])  // events è un array!

// ✅ CORRETTO - chiave primitiva derivata
const eventsLength = events?.length ?? 0
const eventsKey = eventsLength > 0
  ? `${eventsLength}-${events[0]?.id ?? ''}-${events[eventsLength - 1]?.id ?? ''}`
  : '0'

const result = useMemo(() => {
  return events.filter(...)
}, [eventsKey])  // eventsKey è una stringa!
```

### Hook fixati con questo pattern:

- `useCalendarStats.ts`
- `useCalendarAlerts.ts`
- `useFilteredEvents.ts`
- `OnboardingGuard.tsx`
- `CalendarPage.tsx`

---

## 7. Note

- **Inviti / is_admin**: Gli errori relativi a `rpc/is_admin` (404) e "Solo gli admin possono inviare inviti" sono **fuori ambito** da questo report; la RPC `is_admin` va creata o esposta nel progetto Supabase se si vuole usare il flusso inviti dall'onboarding.
- **Evidenziazione e scroll**: L'id usato per highlight e scroll è `maintenance-item-${item.metadata?.maintenance_id}`; gli eventi manutenzione devono avere `metadata.maintenance_id` valorizzato (es. da `useAggregatedEvents`). Lo scroll automatico è controllato con `scrolledRef` per evitare scroll indesiderato dopo il completamento (vedi REPORT_MACRO_CATEGORY_MODAL sezione 6 e sezione 3.8 di questo report).
- **Debug logging**: È presente logging di debug in CalendarPage per diagnosticare eventuali problemi futuri (prefisso `🔍`). Può essere rimosso dopo validazione completa.
