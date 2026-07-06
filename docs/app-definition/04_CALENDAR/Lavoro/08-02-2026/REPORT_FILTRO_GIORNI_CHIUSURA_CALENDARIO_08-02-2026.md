# Report: Filtro eventi calendario nei giorni di chiusura aziendale

**Data:** 08-02-2026
**Contesto:** Calendario – eventi mostrati erroneamente nei giorni di chiusura aziendale configurati in onboarding.
**Componenti:** useAggregatedEvents, useMacroCategoryEvents, Calendar, useCalendarSettings, calendarUtils.

---

## 1. Problema: eventi visibili nei giorni di chiusura

### Sintomo

Il calendario mostrava manutenzioni, mansioni, scadenze prodotti e controlli temperatura anche nei giorni in cui l'azienda risultava chiusa (sia chiusure settimanali ricorrenti da `open_weekdays`, sia date di chiusura specifiche da `closure_dates` configurate nell'ultimo step dell'onboarding).

Esempio: il 21 febbraio configurato come giorno di ferie mostrava l'icona 🏖️ correttamente, ma gli eventi apparivano lo stesso.

### Causa

**Due problemi distinti:**

#### A) Assenza totale di filtro per giorni di chiusura

L'infrastruttura per i giorni di chiusura era completa (tabella `company_calendar_settings`, hook `useCalendarSettings` con `isDateOpen()`, utility `isClosureDate()`/`isOpenWeekday()` in `calendarUtils.ts`), ma **nessuna di queste funzioni veniva usata per filtrare gli eventi del calendario**.

Le due pipeline di eventi (`useAggregatedEvents` e `useMacroCategoryEvents`) non consideravano i giorni di chiusura.

#### B) Bug di timezone nella funzione `isClosureDate`

La funzione `isClosureDate` usava `date.toISOString().split('T')[0]` per convertire una data in stringa `YYYY-MM-DD`. Questo metodo converte in UTC, causando uno shift di giorno per il fuso orario italiano (CET, UTC+1):

```
Evento: 2026-02-21T00:00:00 CET (mezzanotte locale)
  → toISOString(): "2026-02-20T23:00:00.000Z"
  → split('T')[0]: "2026-02-20"  ← SBAGLIATO!

Data chiusura salvata: "2026-02-21"
  → Confronto: "2026-02-20" !== "2026-02-21" → NON MATCHA
```

Lo stesso bug era presente in 3 punti del codice:
- `isClosureDate()` in `calendarUtils.ts`
- `isDateOpen()` in `useCalendarSettings.ts`
- `dayCellDidMount` in `Calendar.tsx`

---

## 2. Soluzione implementata

### Regola business

Nei giorni di chiusura aziendale:
- **NASCONDERE**: manutenzioni, mansioni generiche, scadenze prodotti, controlli temperatura
- **MOSTRARE SEMPRE**: scadenze HACCP (certificazioni personale), scadenze relative al personale

### File modificati

#### `src/utils/calendarUtils.ts`

**Fix timezone:** Sostituito `toISOString().split('T')[0]` con formattazione locale in `isClosureDate()`:

```typescript
// PRIMA (bug):
const dateString = date.toISOString().split('T')[0]

// DOPO (fix):
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
const dateString = `${year}-${month}-${day}`
```

**Nuove funzioni:**

- `isCompanyClosedOnDate(date, openWeekdays, closureDates)` — combina `isOpenWeekday()` + `isClosureDate()` per determinare se una data cade in un giorno di chiusura
- `shouldShowEventOnClosureDay(event)` — determina se un evento va mostrato anche nei giorni chiusi (true solo per scadenze HACCP/personale, identificate tramite prefisso ID `haccp-expiry-`/`haccp-deadline-` o `type === 'custom'` con `metadata.staff_id`)

#### `src/features/calendar/hooks/useAggregatedEvents.ts`

Aggiunto filtro centrale nel `allEvents` useMemo (punto di merge di tutti gli eventi):

```typescript
const { settings: calendarSettings } = useCalendarSettings()

// Nel allEvents useMemo:
if (!calendarSettings?.is_configured) return merged

return merged.filter(event => {
  const eventDate = new Date(event.start)
  if (!isCompanyClosedOnDate(eventDate, open_weekdays, closure_dates)) return true
  return shouldShowEventOnClosureDay(event)
})
```

#### `src/features/calendar/hooks/useMacroCategoryEvents.ts`

Aggiunto filtro nella pipeline parallela macro-categorie (contiene solo maintenance, generic_tasks, product_expiry — nessun evento HACCP/personale):

```typescript
const { settings: calendarSettings } = useCalendarSettings()

const filteredItems = (calendarSettings?.is_configured)
  ? allItems.filter(item => !isCompanyClosedOnDate(
      item.dueDate, calendarSettings.open_weekdays, calendarSettings.closure_dates
    ))
  : allItems
```

#### `src/features/calendar/Calendar.tsx`

- Fix timezone in `dayCellDidMount` (stessa sostituzione `toISOString` → formato locale)
- Esteso per segnare visivamente anche i giorni di chiusura settimanale (non solo le `closure_dates` specifiche) con classe CSS `fc-day-closed`
- L'icona 🏖️ appare solo per chiusure specifiche (non per chiusure settimanali ricorrenti come la domenica)

#### `src/hooks/useCalendarSettings.ts`

Fix timezone nella funzione `isDateOpen()` (stessa sostituzione `toISOString` → formato locale).

---

## 3. Comportamento risultante

| Tipo evento | Giorno aperto | Giorno chiuso (settimanale) | Giorno chiuso (specifico) |
|---|---|---|---|
| Manutenzioni | Visibile | Nascosto | Nascosto |
| Mansioni generiche | Visibile | Nascosto | Nascosto |
| Controlli temperatura | Visibile | Nascosto | Nascosto |
| Scadenze prodotti | Visibile | Nascosto | Nascosto |
| Scadenze HACCP personale | Visibile | Visibile | Visibile |
| Scadenze personale | Visibile | Visibile | Visibile |
| Stile cella calendario | Normale | `fc-day-closed` | `fc-day-closed` + 🏖️ |

---

## 4. Flusso dati completo

```
Onboarding (CalendarConfigStep, step 6)
  → company_calendar_settings (DB: open_weekdays, closure_dates)
    → useCalendarSettings() hook (React Query)
      → useAggregatedEvents: filtro su allEvents
      → useMacroCategoryEvents: filtro su allItems
      → Calendar.tsx: stile visivo celle chiuse
```

---

## 5. Graceful degradation

Se `calendarSettings` non e' configurato (`is_configured === false`) o non ancora caricato (`null`), il filtro viene saltato e tutti gli eventi sono mostrati (comportamento precedente). Nessun rischio di eventi mancanti se i settings non sono disponibili.

---

## 6. Verifica

- `npm run build` — completato senza errori
- Nessun nuovo errore TypeScript introdotto (errori pre-esistenti non toccati)
- Test manuale richiesto:
  - Verificare che giorni chiusi (es. domenica se non in open_weekdays) non mostrino eventi operativi
  - Verificare che date chiusura specifiche (es. 21 febbraio) non mostrino eventi operativi
  - Verificare che scadenze HACCP personale appaiano anche nei giorni chiusi
  - Verificare che macro-category dots non appaiano nei giorni chiusi
