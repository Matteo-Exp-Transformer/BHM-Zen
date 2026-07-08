# MAPPA — 🕐 Oggi · Calendar / Attività (diario, mansioni, completamenti)
**Data:** 2026-07-06 · **Fonte verità:** codice + snapshot DB live A0/A3 (05-07) · **Report Fase 3 base:** A3

> 🕰️ **Fotografia storica pre-Fable** (legacy BHM-v.2). L'area è VIVA in `src/features/oggi/` +
> `src/features/calendario/` (CP8–CP10): stato reale in `docs/guide/HEALTH_CHECK_POST_FABLE.md`.
> La mappa resta come razionale dei verdetti di riuso — non aggiornarla al presente.

> ⚠️ **Accesso DB**: schema live = **snapshot A3/A0 del 2026-07-05** (token MCP di sessione non
> raggiunge `hjteuounjwkadmsbsmdm`). Schema target di riferimento: [`MAPPA_Fondamenta_DB-tipi.md`](./MAPPA_Fondamenta_DB-tipi.md).

---

## 1. Dove vive nel prodotto nuovo
- **Casa/lente (§12):** 🕐 **Oggi** (Tempo) — **schermata di default** (95% degli accessi §9.1): cosa c'è da fare/controllare oggi. Assorbe calendario/diario, mansioni, alert, **timbro fine turno**.
- **Ruoli coinvolti:** **dipendente** (vede le sue mansioni, le completa) · **titolare/responsabile** (vede tutto, filtra per reparto/tipo, crea mansioni generiche).
- **Punto del loop §9.1:** ② **faccio** (completo mansioni, timbro) + ③ **controllo** (il titolare vede lo stato di oggi). ① l'impostazione delle ricorrenze avviene in onboarding/Regia.

> **Confini**: le **manutenzioni** nascono in Reparti (A2) ma **scadono qui** (doppia lente §12.1). I
> **prodotti in scadenza** nascono in Scorte (A5) e compaiono qui come eventi. Oggi è la lente che
> **aggrega** — non possiede le tabelle sorgente, le legge.

---

## 2. Flusso utente (as-is → to-be)

| Passo | Cosa fa l'utente | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|------------------|---------------|--------------------|
| Apre "Attività" | vede il calendario con gli eventi del giorno/mese | ✅ `CalendarPage` aggrega 7 fonti; badge macro-categoria per data | La lente Oggi = default; vista "cosa oggi" prima del calendario mensile |
| Filtra | per reparto (solo admin), per tipo | ✅ `CalendarHeaderFilters` + `useFilteredEvents` (Layer 1 permessi, Layer 2 reparto/tipo) | Riuso; filtri per ruolo confermati |
| Crea mansione generica | nome, frequenza, reparto, assegnatario, orario | ✅ `GenericTaskForm` → `useGenericTasks.createTask` → tabella `tasks` | Riuso; ricorrenza via `frequency`+`custom_days` (⚠️ non `recurrence_config`, vedi §4) |
| **Completa una mansione** | segna fatto | ✅ `completeTask` → insert `task_completions` + `activityTrackingService.logActivity` | Riuso; ma il completamento deve diventare **append-only** (vedi §4/§6) |
| Annulla un completamento | "ripristina" | ⚠️ `uncompleteTask` → **DELETE** su `task_completions` | 🔴 red-flag audit: cancellare una prova è problema di conformità (vedi §6) |
| Apre dettaglio evento | modal con info + "Modifica" | 🔴 **editing = stub** (`EventDetailsModal.tsx:422` handler vuoto); completamento sì per `general_task` | Implementare editing o rimuovere il pulsante |
| Weekend/chiusure | i giorni chiusi non mostrano mansioni | ✅ fix weekend multi-layer feb-2026 in codice; `open_weekdays` live OK (BUG-009 **chiuso**) | Runtime da testare in browser; doc interna da riallineare |
| Timbro fine turno | apre/chiude il turno e **sigilla** la giornata | ⚪ non esiste una feature "timbro" dedicata; il primitivo più vicino è l'attribuzione `completed_by_name` sui completamenti | ✅ **DECISO** (dec.7 «sigilla la giornata»): orario + attestazione «tutto registrato» → `shift_seals` append-only; UI = gesto 🔖 in fondo a Oggi (vedi §5) |

---

## 3. Flusso dati (verità = codice + snapshot DB live)

### Tabelle / RPC toccate — stato LIVE (snapshot A0/A3 05-07)

| Tabella | Stato live | Nota |
|---------|-----------|------|
| `tasks` (mansioni generiche) | ✅ + `time_management`, `recurrence_config` | tipi generati non le hanno |
| `task_completions` | ✅ (`company_id, task_id, completed_by, completed_by_name, period_start, period_end, notes`) | scrittura da completeTask; **DELETE** da uncomplete |
| `maintenance_tasks` / `maintenance_completions` | ✅ | fonte manutenzioni (vedi Reparti) |
| `company_calendar_settings` | ✅ `open_weekdays` + `working_days` (2 righe, allineate `[1..6]`) | BUG-009 **chiuso**; drift solo nei tipi |
| `products` / `staff` / `conservation_points` | ✅ | sorgenti per eventi derivati (scadenze, certificazioni, temp-check) |

> **Nessuna tabella "calendario"**: gli eventi sono **derivati** in `useAggregatedEvents` da 7 fonti:
> `maintenance`, `haccpExpiry`, `productExpiry`, `haccpDeadlines`, `temperatureChecks`, `genericTasks`, `custom`.

### Hook / service — riuso o no

| Path | Ruolo | Verdetto |
|------|-------|----------|
| `useAggregatedEvents.ts` (770 righe) | aggrega 7 fonti + closure filter + espansione ricorrenze | ♻️ Riuso (cuore dell'area) · ✍️ pesante, candidato a decomposizione |
| `useMacroCategoryEvents.ts` (563) | pipeline parallela per i pallini macro-categoria | ♻️ Riuso · ⚠️ **pipeline gemella**: ogni filtro calendario va aggiornato in entrambe |
| `useFilteredEvents.ts` | permessi (Layer 1) + filtri reparto/tipo (Layer 2) | ♻️ Riuso |
| `useGenericTasks.ts` | CRUD mansioni + complete/uncomplete | ♻️ Riuso · ✍️ uncomplete→soft (vedi §4) |
| `useCalendarSettings.ts` | legge/scrive `open_weekdays` (fallback client `[1..6]`) | ♻️ Riuso |
| `useCalendarRefresh.ts`, `useCalendarStats.ts` | auto-refresh 3 min + statistiche | ♻️ Riuso |
| `utils/haccpDeadlineGenerator.ts`, `temperatureCheckGenerator.ts`, `recurrenceScheduler.ts`, `eventTransform.ts` | generatori eventi derivati | ♻️ Riuso |
| `EventDetailsModal.tsx` | dettaglio evento — "Modifica" **stub** (LOCKED 2025-01-16) | ✍️ implementare editing o togliere il pulsante |
| `CalendarFilter.tsx`, `components/FilterPanel.tsx`, `HorizontalCalendarFilters.tsx`, `components/CalendarFilters.tsx` | filtri legacy fuori dal flusso (`Calendar.tsx` usa solo `CalendarHeaderFilters`) | 🗑️ **dead code potenziale** (A3) |
| `useCalendar.ts`, `useCalendarEvents.ts`, `useCalendarAlerts.ts`, `CreateEventModal.tsx`, `EventModal.tsx` | possibili duplicati/legacy | ❓ da confermare prima del verdetto |

### Ingresso → destinazione del dato
```
CREA MANSIONE: GenericTaskForm → useGenericTasks.createTask
   → insert tasks {name, frequency, assigned_to, assignment_type, department_id, next_due, time_management, description}
   → (ricorrenza via frequency+custom_days, NON recurrence_config)

LEGGI CALENDARIO: useAggregatedEvents (+ useMacroCategoryEvents in parallelo)
   → legge maintenance_tasks, tasks, products, staff, conservation_points, task/maintenance_completions
   → espande ricorrenze, applica closure filter (isCompanyClosedOnDate / shouldShowEventOnClosureDay)
   → CalendarEvent[] → FullCalendar (Calendar.tsx)

COMPLETA: completeTask → insert task_completions {task_id, completed_by, completed_by_name, period_start/end, notes}
   → activityTrackingService.logActivity('task_completed', …)
ANNULLA: uncompleteTask → DELETE task_completions (per id o per finestra period_start/end)  ⚠️ audit
```

---

## 4. Schema target audit-grade (delta vs live)

| Campo/tabella | Live oggi | Target (audit-grade §3) | Migration/gap |
|---------------|-----------|--------------------------|---------------|
| `task_completions` (annullamento) | `uncompleteTask` fa **DELETE** fisico | **append-only**: annullare = registrare una riga di storno, non cancellare la prova | soft-delete / reversal row |
| `task_completions` (attribuzione) | `completed_by` + `completed_by_name` + `period_start/end` | ok come chi-cosa-quando; renderla **immutabile** | vincolo no-UPDATE/DELETE |
| `tasks.recurrence_config` | colonna live ✅ ma le mansioni generiche usano `frequency`+`custom_days` (non `recurrence_config`) | **modello ricorrenza unico** con le manutenzioni, o motivare la divergenza | allineamento codice (non DB) |
| Metadati in `description` | `[END_DATE:YYYY-MM-DD]` **parsato dal testo** della description (`extractEndDate`) | end-date = **colonna** vera, non stringa dentro un campo note | migration colonna `end_date` |
| `company_calendar_settings` | `open_weekdays` **e** `working_days` (duplicati, allineati) | **una** fonte per i giorni di apertura (evitare drift futuro) | consolidare le due colonne |
| `database.types.ts` per quest'area | manca `open_weekdays`, `time_management`, `recurrence_config` | rigenerare dal live | post-migration |

> ⚠️ Frequenze/scadenze HACCP normative **non** qui: `src/compliance/haccp-rules.ts` (§14.3). Qui solo struttura.

---

## 5. Verdetto riuso
- ♻️ **Riuso:** `useAggregatedEvents`, `useMacroCategoryEvents`, `useFilteredEvents`, `useGenericTasks`, `useCalendarSettings`, `useCalendarRefresh/Stats`, i generatori `utils/*`, `Calendar.tsx` (FullCalendar + fix weekend), `MacroCategoryModal`. Architettura **solida** (A3: 🟡, per doc/editing, non per l'impianto).
- ✍️ **Riscrivo:** `EventDetailsModal` editing (stub) · `uncompleteTask` DELETE → storno append-only · metadati `[END_DATE:…]` in description → colonna · valutare decomposizione di `useAggregatedEvents` (770 righe) · ricondurre `tasks` a `recurrence_config` unico.
- 🗑️ **Butto (dead code):** filtri legacy `CalendarFilter.tsx` / `FilterPanel.tsx` / `HorizontalCalendarFilters.tsx` / `components/CalendarFilters.tsx` · ~19 `console.log` diagnostici weekend in `Calendar.tsx` + 14 in `CalendarPage.tsx` (debito PRE_PRODUCTION).
- ✅ **DECISO** ([`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md)): (dec.7) **timbro fine turno = «sigilla la giornata»** [NUOVO SCOPE, def. 2026-07-06]: orario apertura/chiusura + attestazione «tutto registrato» → `shift_seals` append-only (firma audit-grade); UI = gesto 🔖 in fondo a Oggi con conferma di chiusura · (dec.1) annullo completamento = **storno tracciato**, mai DELETE · (default) `[END_DATE:]` → **colonna** vera · (dec.12) **«Inventario» = nuovo tipo di mansione ricorrente**: appare in Oggi come task assegnata col suo reminder (giro dei punti in Reparti) → vedi [`MAPPA_Scorte`](./MAPPA_Scorte_inventory-shopping.md) §1-bis.
- ❓ **Dipende da owner (residuo):** (a) editing evento — quali eventi modificabili e da chi? (b) sabato aperto/chiuso: la config `[1..6]` tiene domenica chiusa e sabato aperto — default giusto?

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ **Ufficiale-HACCP:** il calendario **è il diario** dei controlli → i **completamenti sono le prove**. Due buchi: (1) `uncompleteTask` **cancella** un completamento (una prova non deve sparire — serve storno tracciato); (2) l'assenza di editing/versioning sugli eventi va bene *solo se* i completamenti restano immutabili. La **doppia pipeline** (aggregated + macro) rischia incoerenze tra ciò che si vede e ciò che è registrato: definire quale è la fonte di verità per l'audit.
- 👨‍🍳 **Ristoratore:** la lente Oggi deve dire in un colpo d'occhio "cosa devo fare adesso" — la vista mensile FullCalendar è ottima per il titolare ma forse troppo per il dipendente in servizio. Completare deve essere **un tap**. Il "timbro fine turno" è automatizzabile? (es. completando l'ultima mansione del turno). Le mansioni ricorrenti vanno impostate una volta (onboarding) e non ripensate ogni giorno.

## 7. Non verificato / rimandato
- **Schema live NON ri-verificato in sessione** (token MCP): stati ✅/❌ da snapshot A0/A3 05-07.
- **Runtime UI weekend/chiusure**: fix solo verificati su codice, mai in browser/E2E.
- **Manutenzioni ricorrenti in calendario** (`getMaintenanceRecurrenceDates`): codice presente, **test non eseguiti** (A3).
- **Timbro fine turno**: concetto di visione (§4) senza implementazione verificata — mappato come domanda owner, non come as-is.
- **Duplicati hook/modal** (`useCalendar`, `useCalendarEvents`, `CreateEventModal`, `EventModal`): da confermare prima del verdetto 🗑️.
- **Doc interna calendario** (`00_MASTER_INDEX` "PRODUCTION-READY", metriche righe): contraddittoria → da **marcare** (non riscrivere), §9 handoff.
