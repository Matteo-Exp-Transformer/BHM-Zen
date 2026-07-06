# Report FASE 3 — Area A3 Calendar / Attività

**Data**: 2026-07-05 (supplemento DB live: 2026-07-05 sera)  
**Agente**: A3  
**Modalità**: read-only (nessuna modifica a `src/`, migrations, DB)  
**Scope codice**: `src/features/calendar/`  
**Scope docs**: `APP_DEFINITION/04_CALENDAR/conoscenze-definizioni/`, `APP_DEFINITION/04_CALENDAR/Lavoro/` (Feb 2026)  
**Baseline FASE 2**: `CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md` riga 27613 (matrice Calendario)

---

## 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 18 |
| Allineati doc↔codice | 9 |
| Gap critici | 1 |
| Gap medi/bassi | 6 |
| Non verificato (runtime UI) | 1 |

**Esito area**: 🟡 **verificato-gap** — architettura calendario solida e fix feb 2026 presenti nel codice; documentazione interna contraddittoria su weekend; editing eventi non implementato. **DB live**: colonna `open_weekdays` presente e popolata (BUG-009 **non confermato**); resta drift solo in `database.types.ts` (TYPE-001 / A7).

---

## 5.2 Matrice verifica

| Feature/Componente | Doc dice (FASE 2 / conoscenze) | Codice reale | DB/Schema | Esito |
|--------------------|----------------------------------|--------------|-----------|-------|
| **Aggregazione 6 fonti** | maintenance, generic, product expiry, HACCP expiry, temperature checks, HACCP deadlines | `useAggregatedEvents.ts` unisce tutte e 6 (`maintenanceEvents`, `haccpExpiryEvents`, `productExpiryEvents`, `haccpDeadlineEvents`, `temperatureEvents`, `genericTaskEvents`) righe 200-205 | Dipende da tabelle `maintenance_tasks`, `tasks`, `products`, `staff`, `conservation_points` | ✅ verificato-ok |
| **Macro-categorie** | Badge per data+categoria, click → MacroCategoryModal | `useMacroCategoryEvents.ts` + `MacroCategoryModal.tsx` (1163 righe) | N/A | ✅ verificato-ok |
| **Filtri Layer 1 (permessi)** | Admin/responsabile tutto; dipendente solo assegnati | `useFilteredEvents.ts:38-39` `canViewAllEvents` per admin/responsabile; filtro assegnazione righe 77+ | N/A | ✅ verificato-ok |
| **Filtri Layer 2 — Reparto solo admin** | Sezione reparto visibile solo admin (05-02) | `NewCalendarFilters.tsx:178` `hasRole('admin')`; `CalendarHeaderFilters` in `Calendar.tsx:504` | N/A | ✅ verificato-ok |
| **Filtri Layer 2 — Tipo** | Chips tipo (maintenance, generic_task, product_expiry) | `CalendarHeaderFilters` righe 71-93; stato in `CalendarPage.tsx:79` | N/A | ✅ verificato-ok |
| **Filtri Per Stato rimossi da UI pagina** | Rimossi 05-02 da `NewCalendarFilters` | `NewCalendarFilters.tsx`: nessun `toggleStatus`, nessun import `EventStatus` | `calendar-filters.ts` mantiene `statuses[]` per compatibilità | ✅ verificato-ok (pagina) |
| **Filtri Per Stato nel modal** | Doc 05-02: "rimossi dall'UI" (implicito globale) | `MacroCategoryModal.tsx:512-538` — sezione "Stato" con chips `to_complete/completed/overdue` ancora presente | N/A | ⚠️ verificato-gap |
| **Bug weekend "unito"** | FASE 2: **risolto** 15-02; `00_MASTER_INDEX.md`: **parzialmente risolto** | Triplo fix in codice: `useEffect` DOM `fc-day-closed` (`Calendar.tsx:206-261`), `dayCellDidMount` (545-560), stili inline (1033-1059) + `calendar-custom.css` | **Live** (MCP `supabase-bhm`): `open_weekdays` presente; 2/2 righe con `[1,2,3,4,5,6]` → solo **domenica (0)** chiusa; sabato ancora aperto per config azienda | ⚠️ verificato-gap (codice+DB ok; doc contraddittoria; UI weekend non testata in browser) |
| **Bug flicker/highlight weekend** | Risolto 12-02 / 15-02 | `calendar-custom.css`: hover `transform: none` su `.fc-day-closed`; `.fc-highlight { display: none }` | N/A | ✅ verificato-ok (codice) |
| **MacroCategoryModal vuoto mese successivo** | Risolto 08-02 | Guard `dayEvents.length === 0 && prev.events?.length > 0` (`CalendarPage.tsx:207`); `visibleRange` + `onDatesSet` (righe 74, 629) | N/A | ✅ verificato-ok |
| **Navigazione Conservation → Calendario** | State `openMacroCategory`, `date`, `highlightMaintenanceTaskId` | `CalendarPage.tsx:216-280` — attende `eventsForFilteringLength > 0` prima di aprire modal | N/A | ✅ verificato-ok |
| **GenericTaskForm completo** | recurrence_config, giorni custom (29-01) | Form ha `frequenza`, `giorniCustom`, `timeManagement`; submit mappa `custom_days` (`CalendarPage.tsx:426-448`); **no** campo `recurrence_config` nel payload `useGenericTasks.createTask` | Tabella `tasks` | ⚠️ verificato-gap (funziona via `frequency`+`custom_days`, non via `recurrence_config` come doc maintenance) |
| **Manutenzioni ricorrenti in calendario** | Implementato 15-02, **testing da eseguire** | `expandRecurringTask` + `getMaintenanceRecurrenceDates` con `recurrence_config` (`useAggregatedEvents.ts:266-398`) | Colonna `recurrence_config` JSONB su `maintenance_tasks` (migration 019) | ⚠️ verificato-gap (codice presente, test non eseguiti) |
| **EventDetailsModal — editing** | BUG_TRACKER TODO riga 422 | Pulsante "Modifica" con handler vuoto `/* TODO: Implement editing mode */` (`EventDetailsModal.tsx:420-423`) | N/A | ❌ verificato-rotto (stub UI) |
| **EventDetailsModal — completamento** | Completamento mansioni da modal | Implementato per `source === 'general_task'` righe 405-417 | N/A | ✅ verificato-ok |
| **Auto-refresh 3 min** | Documentato | `useCalendarRefresh.ts` hook presente e usato in CalendarPage | N/A | ✅ verificato-ok |
| **Calendar settings `open_weekdays`** | Giorni apertura 0=dom…6=sab | `useCalendarSettings.ts:52` legge/scrive `open_weekdays`; fallback client `[1,2,3,4,5,6]` se assente | **Live**: entrambe `open_weekdays` (nullable, default `{1..6}`) e `working_days` (NOT NULL) presenti; 2 righe, 0 NULL su `open_weekdays`, 0 mismatch vs `working_days` — coerente con patch `apply-missing-schema-migrations.sql:67-80` | ✅ verificato-ok (DB live); ⚠️ drift tipi `database.types.ts:209` (`working_days` only, no `open_weekdays`) → A7 |
| **Test automatici CalendarPage** | Archive: test Playwright blindati | `__tests__/CalendarPage.test.tsx`: solo test utility date-fns, **non** testa CalendarPage | N/A | ⚠️ verificato-gap |
| **DEBUG console in produzione** | Non documentato | `Calendar.tsx` 19 occorrenze `console.log/error` diagnostici weekend (righe 184-256); `CalendarPage.tsx` 14 occorrenze nav/modal | N/A | ⚠️ verificato-gap (debito PRE_PRODUCTION) |

---

## 5.3 Bug confermati (nuovi o aggiornati)

| ID suggerito | Severity | Evidenza | File:Riga | Note |
|--------------|----------|----------|-----------|------|
| *(esistente BUG_TRACKER TODO)* | LOW | Pulsante Modifica senza logica | `EventDetailsModal.tsx:422` | Già in BUG_TRACKER area Calendar |
| **BUG-007** (proposta) | MEDIUM | Doc `00_MASTER_INDEX.md` tabella bug weekend dice "Parzialmente risolto" ma report 15-02 dice "RISOLTO"; utente/owner potrebbe credere bug ancora aperto | `04_CALENDAR/00_MASTER_INDEX.md:97` vs `Lavoro/15-02-2026/REPORT_RISOLUZIONE_BUG_WEEKEND_UNITO_15-02-2026.md:4` | Solo documentazione — codice ha fix |
| **BUG-008** (proposta) | LOW | Link rotto in definizione form | `GENERIC_TASK_FORM.md:35` punta a `../Generic-Task-creation_assignation/` — cartella inesistente; file reale in `Lavoro/29-01-2026/` | Doc only |
| ~~**BUG-009**~~ | — | **NON CONFERMATO su DB live** — vedi § Supplemento DB sotto | MCP `supabase-bhm` 2026-07-05 | **Chiuso**: colonna presente e popolata; scenario restore senza patch non si applica al progetto attuale |

**Non promossi a bug** (comportamento intenzionale o fuori scope):
- Filtri stato nel MacroCategoryModal: feature locale del modal, non contraddice rimozione dai filtri header pagina.

---

## 5.4 Documentazione obsoleta

| Path doc | Claim errato / obsoleto | Evidenza codice | Azione suggerita |
|----------|-------------------------|-----------------|------------------|
| `04_CALENDAR/00_MASTER_INDEX.md` | Weekend "Parzialmente risolto" + fix CSS "proposta" | Report 15-02 + fix inline `Calendar.tsx:1033-1059` | Aggiornare tabella bug a "Risolto (codice)" o allineare a report 15-02 |
| `04_CALENDAR/conoscenze-definizioni/00_MASTER_INDEX_CALENDAR.md` | "PRODUCTION-READY", "100% funzionalità", ultimo aggiornamento **05-02** | Fix weekend 15-02, manutenzioni ricorrenti untested, editing TODO | Aggiornare data, rimuovere claim PRODUCTION-READY o condizionarlo |
| `04_CALENDAR/conoscenze-definizioni/CALENDAR_PAGE.md` | "1095 righe" CalendarPage; "996 righe" Calendar.tsx | Conteggio reale: 665 e 1052 righe (2026-07-05) | Aggiornare metriche o rimuovere conteggio righe |
| `04_CALENDAR/conoscenze-definizioni/GENERIC_TASK_FORM.md` | Link a `Generic-Task-creation_assignation/` | File in `Lavoro/29-01-2026/GENERIC_TASK_FORM_DEFINITION.md` | Correggere path |
| `04_CALENDAR/conoscenze-definizioni/FILTERS_AND_PERMISSIONS.md` | Aggiornato implicitamente 05-02 per rimozione stato | MacroCategoryModal ha ancora filtri stato | Aggiungere nota: "filtri stato solo dentro MacroCategoryModal" |
| `Lavoro/15-02-2026/REPORT_MANUTENZIONI_RICORRENTI_CALENDARIO_15-02-2026.md` | "Implementazione completata — testing ancora da eseguire" | Codice `getMaintenanceRecurrenceDates` presente | Mantenere fino a test E2E/manuali |

---

## 5.5 Aggiornamenti catalogo (`stato_percepito`)

| DOC-id / path | Campo | Nuovo `stato_percepito` |
|---------------|-------|-------------------------|
| DOC-0128 `04_CALENDAR/00_MASTER_INDEX.md` | tabella bug weekend | `verificato-gap` |
| DOC-0129 `00_MASTER_INDEX_CALENDAR.md` | status PRODUCTION-READY | `verificato-gap` |
| DOC-0130 `CALENDAR_PAGE.md` | metriche righe | `verificato-gap` |
| DOC-0132 `FILTERS_AND_PERMISSIONS.md` | filtri stato | `verificato-ok` (con nota modal) |
| DOC-0133 `GENERIC_TASK_FORM.md` | link definizione | `verificato-gap` |
| DOC-0141 `REPORT_MACRO_MODAL_VUOTO_08-02` | fix modal vuoto | `verificato-ok` |
| DOC-0146 `REPORT_RISOLUZIONE_BUG_WEEKEND_15-02` | weekend risolto | `verificato-gap` (codice sì, runtime no) |
| DOC-0145 `REPORT_MANUTENZIONI_RICORRENTI_15-02` | manutenzioni ricorrenti | `verificato-gap` |
| DOC-1171 `EventDetailsModal.tsx` (CODE-DOC) | editing mode | `verificato-rotto` |

### Append catalogo — sezione 3.3 Calendar (per A8)

```markdown
### 3.3 — Calendar / Attività (2026-07-05)
**Agente**: A3  
**Esito area**: 🟡 verificato-gap  
**Report**: [FASE3_REPORT_A3_CALENDAR.md](./FASE3_REPORT_A3_CALENDAR.md)

| Feature | Doc FASE 2 | Verifica codice | Verifica DB | Stato finale |
|---------|------------|-----------------|-------------|--------------|
| Vista macro-categorie + 6 fonti | ✅ | ✅ implementato | non-verificato | 🟢 OK |
| Filtri reparto/tipo (admin) | ✅ | ✅ CalendarHeaderFilters | N/A | 🟢 OK |
| Filtri stato pagina | ✅ rimossi 05-02 | ✅ assenti in header | N/A | 🟢 OK |
| Bug weekend unito | ✅ risolto 15-02 | ✅ fix CSS+DOM in Calendar.tsx | ✅ `open_weekdays` live OK; config `[1-6]` = dom chiusa | 🟡 GAP (solo doc/UI) |
| Modal vuoto mese successivo | ✅ risolto 08-02 | ✅ guard CalendarPage:207 | N/A | 🟢 OK |
| Editing EventDetailsModal | ⚠️ TODO | ❌ stub riga 422 | N/A | 🔴 BLOCCATO UX |
| Manutenzioni ricorrenti calendario | ✅ 15-02 | ✅ expandRecurringTask | recurrence_config JSONB | 🟡 untested |
```

---

## 5.6 Non verificato / fuori scope

| Voce | Motivo |
|------|--------|
| **Runtime UI weekend** | Nessuna esecuzione browser/E2E in Fase 3; fix verificati solo su codice sorgente |
| ~~**Schema DB remoto `company_calendar_settings`**~~ | **Verificato** in supplemento DB live (§ sotto) via MCP `supabase-bhm` |
| **Completamento manutenzioni da calendario** | Dipende da insert temperature/conservation (A2 / BUG-005) per alcuni flussi |
| **Esecuzione test Playwright** | Citati in Archive; non rieseguiti |
| **Componenti legacy filtri** | `CalendarFilter.tsx`, `FilterPanel.tsx`, `HorizontalCalendarFilters.tsx`, `CalendarFilters.tsx` esistono ma non sono nel flusso principale (`Calendar.tsx` usa solo `CalendarHeaderFilters`) — dead code potenziale, non rimosso |
| **File LOCKED** | `EventDetailsModal.tsx` marcato LOCKED 2025-01-16 — conflitto con TODO editing; non modificato (read-only) |

---

## Seed verifica FASE 2 — esiti

| Seed (piano A3) | Esito |
|-----------------|-------|
| Bug weekend risolto? | **Codice: sì** (fix multi-layer feb 2026). **Doc: contraddittoria** (`00_MASTER_INDEX` vs report 15-02). **Runtime: non testato**. |
| Editing EventDetailsModal TODO? | **Confermato** — pulsante presente, handler vuoto (`EventDetailsModal.tsx:422`). |
| Filtri rimossi 05-02? | **Confermato** per filtri pagina/header (`NewCalendarFilters` / `CalendarHeaderFilters`). **Eccezione**: filtri stato ancora nel `MacroCategoryModal`. |

---

## Architettura — dove vive il Calendario nell'app

Per chi non conosce il codice:

- **Pagina "Attività"** (`CalendarPage.tsx`): è la schermata principale del calendario HACCP. La trovi nel menu come Attività (`/attivita`). Orchestra tutto: carica eventi, filtri, statistiche, form nuove mansioni.
- **Storage dati**: gli eventi **non** stanno in una tabella "calendario". Il calendario **aggrega** dati da più tabelle Supabase (`maintenance_tasks`, `tasks`, `products`, certificazioni staff, punti conservazione). Le **impostazioni** calendario (quali giorni l'azienda è aperta, orari, chiusure) stanno in `company_calendar_settings` — nel DB storico la colonna si chiamava `working_days`, l'app oggi usa `open_weekdays`.
- **FullCalendar** (`Calendar.tsx`): il widget visivo del calendario; gestisce anche lo stile dei weekend chiusi (giorni in cui il ristorante non lavora).

---

## Riferimenti file chiave verificati

```
src/features/calendar/
├── CalendarPage.tsx          (665 righe) — entry point
├── Calendar.tsx              (1052 righe) — FullCalendar + fix weekend inline
├── EventDetailsModal.tsx     (436 righe) — TODO editing :422
├── hooks/
│   ├── useAggregatedEvents.ts    (770 righe) — 6 fonti
│   ├── useFilteredEvents.ts      (181 righe) — permessi
│   └── useMacroCategoryEvents.ts (563 righe)
└── components/
    ├── NewCalendarFilters.tsx    (356 righe) — filtri header
    └── MacroCategoryModal.tsx    (1163 righe) — filtri stato interni
```

---

## Supplemento DB live (2026-07-05)

**MCP**: `project-0-BHM-v.2-supabase-bhm` · tool `execute_sql` · read-only

### Query 1 — Schema colonne

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'company_calendar_settings'
  AND column_name IN ('open_weekdays', 'working_days');
```

| column_name | data_type | column_default | is_nullable |
|-------------|-----------|----------------|-------------|
| `open_weekdays` | ARRAY | `{1,2,3,4,5,6}` | YES |
| `working_days` | ARRAY | `{1,2,3,4,5,6}` | NO |

### Query 2 — Dati e allineamento

```sql
SELECT COUNT(*) AS total,
  COUNT(*) FILTER (WHERE open_weekdays IS NULL) AS null_open_weekdays,
  COUNT(*) FILTER (WHERE open_weekdays IS DISTINCT FROM working_days) AS mismatched
FROM public.company_calendar_settings;
```

| total | null_open_weekdays | mismatched |
|-------|-------------------|------------|
| 2 | 0 | 0 |

Campione righe: entrambe le company con `open_weekdays = working_days = [1,2,3,4,5,6]`, `is_configured = true`.

### Confronto con codice e patch

| Layer | Atteso | Esito live |
|-------|--------|------------|
| `useCalendarSettings.ts:52` | Legge `data.open_weekdays` | ✅ Colonna esiste; nessuna riga NULL → nessun fallback client mascherante |
| `apply-missing-schema-migrations.sql:67-80` | ADD `open_weekdays`, backfill da `working_days` | ✅ Stato coerente: entrambe le colonne presenti, valori allineati |
| `database/migrations/009_company_calendar_settings.sql` | Schema canonico con `open_weekdays` | ✅ Allineato sul remoto |
| `BackupDB/restore-bhm-public.sql` | Solo `working_days` (stato pre-patch) | ⚠️ Storico restore; **non** riflette DB live attuale |

### Esito BUG-009

**Chiuso / non confermato.** L'ipotesi «`open_weekdays` assente e patch non applicata» **non** si verifica sul progetto Supabase BHM live. Resta nota per **nuovi ambienti** ripristinati da backup Nov 2025 senza eseguire `apply-missing-schema-migrations.sql` — fuori scope runtime attuale.

**Residuo per A7/A8**: `src/types/database.types.ts` dichiara solo `working_days` — drift tipi generati, non blocco runtime calendario.

---

**Fine report A3** — pronto per consolidatore A8.
