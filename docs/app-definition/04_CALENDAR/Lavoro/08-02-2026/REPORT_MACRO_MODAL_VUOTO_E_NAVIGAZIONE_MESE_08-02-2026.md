# Report: MacroCategoryModal vuoto per date mese successivo e calendario forzato a mese corrente

**Data:** 08-02-2026  
**Contesto:** Calendario – apertura MacroCategoryModal su date dal 1° marzo in poi; navigazione al prossimo mese.  
**Componenti:** CalendarPage, Calendar, viewBasedEvents, sync modal, key FullCalendar.

---

## 1. Problema: modal si apre vuoto per date dal 1° marzo in poi

### Sintomo

Cliccando su una data del **prossimo mese** (es. dal 1° marzo in poi) su un evento macro (Manutenzioni, Mansioni/Attività, Scadenze), il **MacroCategoryModal** si apriva **vuoto** anche in presenza di manutenzioni, mansioni o scadenze per quel giorno.

### Causa

Due cause combinate:

1. **`viewBasedEvents` filtrato solo per mese corrente**  
   In `CalendarPage.tsx`, in vista `month`, gli eventi erano filtrati con:
   - `eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()`  
   Quindi `viewBasedEvents` conteneva **solo** gli eventi del mese di “oggi” (es. febbraio). Le date di marzo non avevano mai eventi in `viewBasedEvents`.

2. **useEffect di sync che sovrascriveva gli eventi del modal**  
   Un `useEffect` aggiornava `selectedMacroCategory.events` in base a `viewBasedEvents` (per riflettere completamenti, ecc.). Per una data di marzo:
   - `dayEvents = viewBasedEvents.filter(...)` restituiva `[]` (nessun evento di marzo in `viewBasedEvents`).
   - Si faceva `setSelectedMacroCategory(prev => ({ ...prev, events: dayEvents }))` → `events` diventava `[]`.
   - Gli **items** corretti passati dal click sull’evento macro (da `useMacroCategoryEvents`) venivano quindi sostituiti da una lista vuota.

Il modal riceveva così `events={[]}` e si apriva vuoto.

---

## 2. Fix: non sovrascrivere con lista vuota + intervallo visibile

### 2.1 Non sovrascrivere gli eventi quando dayEvents è vuoto ma il modal aveva già eventi

**File:** `src/features/calendar/CalendarPage.tsx`

Nell’`useEffect` che sincronizza `selectedMacroCategory.events` con `viewBasedEvents` è stata aggiunta una guard:

- Se `dayEvents.length === 0` **e** `(prev.events?.length ?? 0) > 0`, **non** si aggiorna lo stato (si mantiene `prev`).
- In questo modo, quando l’utente apre il modal cliccando su un evento macro in un giorno di un mese “futuro”, gli `items` passati dal click (e già presenti in `prev.events`) non vengono più sostituiti da una lista vuota derivata da `viewBasedEvents`.

```ts
// Non sovrascrivere con lista vuota quando gli eventi vengono dal click su macro (es. mese successivo)
if (dayEvents.length === 0 && (prev.events?.length ?? 0) > 0) return prev
```

**Risultato:** Il modal mostra correttamente manutenzioni/mansioni/scadenze anche per date dal 1° marzo in poi (e in generale per date fuori dal mese corrente), perché gli eventi passati al click non vengono più azzerati.

---

### 2.2 Intervallo visibile e viewBasedEvents per il mese mostrato

Per allineare `viewBasedEvents` al **mese effettivamente mostrato** nel calendario (e non solo a “oggi”), è stato introdotto l’uso dell’intervallo di date visibile (FullCalendar).

#### Calendar.tsx

- Aggiunta prop opzionale:  
  `onDatesSet?: (start: Date, end: Date) => void`
- Su FullCalendar:  
  `datesSet={onDatesSet ? (arg) => onDatesSet(arg.start, arg.end) : undefined}`  
  così il parent viene notificato a ogni cambio di intervallo visibile (es. cambio mese/settimana).

#### CalendarPage.tsx

- Nuovo stato:  
  `visibleRange: { start: Date; end: Date } | null`  
  aggiornato con `onDatesSet={(start, end) => setVisibleRange({ start, end })}`.
- Calcolo di **viewBasedEvents** in vista `month`:
  - Se `visibleRange?.start` e `visibleRange?.end` sono valorizzati: si filtrano gli eventi con  
    `eventDate >= rangeStart && eventDate <= rangeEnd` (con `rangeStart`/`rangeEnd` normalizzati a inizio/fine giorno).
  - Altrimenti si mantiene il comportamento precedente (filtro per `now.getMonth()` e `now.getFullYear()`).
- Dipendenze del `useMemo` di `viewBasedEvents` estese con  
  `visibleRange?.start?.getTime()` e `visibleRange?.end?.getTime()`.

**Risultato:** Quando l’utente naviga al mese successivo (o precedente), `viewBasedEvents` contiene gli eventi del mese **visibile**. La sync del modal può quindi aggiornare correttamente gli eventi del giorno anche dopo un completamento, quando si è in un mese diverso da quello corrente.

---

## 3. Problema: passando al prossimo mese la vista tornava al mese corrente

### Sintomo

Dopo aver risolto il modal vuoto, passando al **prossimo mese** (es. da febbraio a marzo) il calendario **forzava di nuovo la vista al mese corrente** (febbraio).

### Causa

- FullCalendar è montato con una `key`:  
  `key={\`${calendarView}-${calendarKey}\`}`  
  e `calendarKey` viene incrementato in un `useEffect` che dipende da `events.length`.
- Al cambio mese:
  1. FullCalendar emette `datesSet` con il nuovo intervallo (marzo).
  2. Si aggiorna `visibleRange` → si ricalcola `viewBasedEvents` (eventi di marzo) → cambia `events.length` passato a `Calendar`.
  3. L’`useEffect` in Calendar incrementa `calendarKey`.
  4. La `key` di FullCalendar cambia → il componente **si smonta e rimonta**.
  5. Al remount, FullCalendar riparte dalla vista/data iniziale (mese corrente).

Quindi il remount causato dalla key faceva “perdere” la navigazione al mese successivo.

---

## 4. Fix: key stabile in modalità macro

**File:** `src/features/calendar/Calendar.tsx`

Con **macro categories** attive, gli eventi mostrati in calendario sono `fullCalendarEvents` (da `useMacroCategoryEvents`), non la prop `events` (viewBasedEvents). Non è necessario remontare FullCalendar quando cambia `events.length` (es. per cambio mese visibile).

- La `key` di FullCalendar è stata resa condizionale:
  - **Con macro categories:**  
    `key={\`${calendarView}-${macroEventsKey}\`}`  
    (`macroEventsKey` cambia solo in seguito a aggiornamento dati macro, es. completamento.)
  - **Senza macro categories:**  
    `key={\`${calendarView}-${calendarKey}\`}`  
    (comportamento invariato: remount quando cambia `events.length`.)

```ts
key={useMacroCategories ? `${calendarView}-${macroEventsKey}` : `${calendarView}-${calendarKey}`}
```

**Risultato:** In modalità macro, la navigazione al prossimo (o precedente) mese non cambia più la key, quindi non c’è remount e la vista resta sul mese scelto dall’utente.

---

## 5. Riepilogo modifiche per file

| File | Modifiche |
|------|-----------|
| **CalendarPage.tsx** | 1) Guard nell’useEffect di sync: non sostituire `events` con `dayEvents` se `dayEvents` è vuoto e c’erano già eventi. 2) Stato `visibleRange` e callback `onDatesSet` per aggiornarlo. 3) In vista month, filtro `viewBasedEvents` per `visibleRange` quando disponibile. 4) Passaggio di `onDatesSet` a `Calendar`. |
| **Calendar.tsx** | 1) Prop `onDatesSet` e chiamata a `datesSet` su FullCalendar. 2) Key di FullCalendar: con `useMacroCategories` usa solo `macroEventsKey`, altrimenti `calendarKey`. |

---

## 6. Comportamento atteso dopo gli interventi

- Clic su un evento macro (Manutenzioni / Mansioni / Scadenze) in una **data del mese successivo** (es. 1° marzo): il **MacroCategoryModal** si apre con l’elenco corretto di attività per quel giorno.
- **Navigazione** al prossimo o al precedente mese: il calendario **resta sul mese selezionato** e non torna al mese corrente.
- Dopo un **completamento** nel modal, la lista nel modal e gli eventi in calendario si aggiornano come prima (invalidation query e sync tramite `viewBasedEvents` quando si è nel mese visibile).

---

**Fine report.**
