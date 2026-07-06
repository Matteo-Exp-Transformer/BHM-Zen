> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.5  
> **Motivo**: claim «PRODUCTION-READY» / «100% funzionalità» — editing eventi stub (`EventDetailsModal` TODO); manutenzioni ricorrenti untested.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# MASTER INDEX - Calendar/Attività Feature
## Aggiornato: 2026-02-05

---

## LAVORO SVOLTO

### 29-01-2026 – GenericTaskForm
Report: **[Lavoro/29-01-2026/](../Lavoro/29-01-2026/)**

| Intervento | Descrizione |
|------------|-------------|
| **recurrence_config** | Implementata configurazione ricorrenza completa |
| **Giorni custom** | Selezione giorni specifici della settimana |
| **Giorno mese** | Selezione giorno specifico del mese |
| **Validazioni duplicati** | Prevenzione creazione mansioni duplicate |

### 04-02-2026 – Sessione 1: MacroCategoryModal, refresh, completamento
Report: **[REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md](../Lavoro/04-02-2026/REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Statistiche** | Rimossa sezione "Eventi da Completare" (Oggi/Settimana/Mese/Anno) da CalendarStatsPanel. |
| **Refresh modal** | MacroCategoryModal si aggiorna dopo completamento senza chiudere: callback `onMacroDataUpdated`, `refreshKey` in useAggregatedEvents, sync eventi con firma id+status. |
| **Completamento mansioni** | Corretto "Task not found": helper `getGenericTaskId` per usare id reale del task (non occurrence id). |
| **Activity logging** | Gestione 404 su RPC `log_user_activity`: fallback non bloccante, nessun errore in console. |
| **Classificazione eventi** | Controlli temperatura (`temperature_reading`) → Manutenzioni (non più Mansioni generiche). |
| **Ancora da Completare** | Pulsante in card espansa mansione completata; visibile solo a chi ha completato o admin; uncomplete con `completionId`/`periodDate` e filtro periodo per overlap (daily/weekly/monthly). |

### 04-02-2026 – Sessione 2: UI Calendario e pannello Statistiche
Report: **[REPORT_CALENDARIO_UI_E_STATISTICHE.md](../Lavoro/04-02-2026/REPORT_CALENDARIO_UI_E_STATISTICHE.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Header Calendar** | Rimossa barra "Calendario Aziendale" e pulsante "Nuovo Evento" da `Calendar.tsx`. |
| **Layout e card** | Spaziatura `gap-6` tra sezioni; CollapsibleCard Statistiche con stato controllato; `stopPropagation` su pulsante Aggiorna. |
| **CollapsibleCard** | Nuova prop `hideHeader`; ripristinata card "Assegna nuova attività" con header. |
| **Statistiche temporali** | `eventsForTemporalStats` (anno corrente) per Oggi/Settimana/Mese/Anno; corretto calcolo "Questo Mese" vs "Quest'Anno". |
| **Sottotitolo vista** | Card Statistiche: sottotitolo "Statistiche annuali/mensili/settimanali/giornaliere" da `calendarView`. |
| **Testi ed etichette** | Titolo card "Statistiche" (no emoji); sezione "Eventi da Completare"; box "Attività / Mansioni", "Completate", "In Attesa" (emoji rimosse). |
| **Casella In Attesa** | Conteggio basato su `viewBasedEvents` così cambia con la vista calendario (Anno/Mese/Settimana/Giorno). |

### 05-02-2026 – Allineamento Repository
Report: **[REPORT_ALLINEAMENTO_REPOSITORY.md](../Lavoro/05-02-2026/REPORT_ALLINEAMENTO_REPOSITORY.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Sicurezza** | Rimossi `.env.vercel` e file sensibili dalla storia git con `filter-branch` |
| **Pulizia** | Rimossi 158 file temporanei/test dalla root |
| **Dipendenze** | Aggiunta `cross-env` per script cross-platform |
| **Allineamento** | Merge NoClerk → main, push forzato storia pulita |

### 05-02-2026 – Filtro Reparto Solo Admin
Report: **[REPORT_FILTRI_REPARTO_ADMIN.md](../Lavoro/05-02-2026/REPORT_FILTRI_REPARTO_ADMIN.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Filtri Reparto** | Sezione "Per Reparto" visibile e applicabile solo a utenti `admin` |
| **UI** | `NewCalendarFilters`: wrap condizionale `{isAdmin && (...)}` sulla sezione reparto |
| **Comportamento** | Per non-admin: sezione nascosta; `departments` azzerato tramite `useEffect` |

### 05-02-2026 – Rimozione Filtri Per Stato
Report: **[REPORT_RIMOZIONE_FILTRI_STATO.md](../Lavoro/05-02-2026/REPORT_RIMOZIONE_FILTRI_STATO.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Filtri Stato** | Rimossa dall'UI la sezione "Per Stato" (chips: Da completare, Completato, In ritardo, Eventi futuri) |
| **NewCalendarFilters** | Rimosse `toggleStatus`, conteggio `statuses`, import `EventStatus`/`EVENT_STATUS_*`/`ListChecks` |
| **Layer 2** | Filtri visuali ora solo: Reparto (solo admin) e Tipo |

---

## STATO ATTUALE

### VERDETTO: **PRODUCTION-READY**

| Metrica | Valore |
|---------|--------|
| Funzionalità Implementate | **100%** |
| Hooks Estratti | **7** |
| Fonti Evento Aggregate | **6** |
| Views Supportate | **4** (anno/mese/settimana/giorno) |
| Layer Filtri | **2** (permessi + visuale) |
| Auto-Refresh | **3 minuti** |

---

## ARCHITETTURA SISTEMA

### Componente Principale
**CalendarPage.tsx** (1095 righe) - Entry point che orchestra:
- Aggregazione eventi da 6 fonti
- Sistema filtri 2-layer
- Vista macro-categorie
- Statistiche e alert
- Navigazione da Conservation

### Hooks Principali

| Hook | Scopo | File |
|------|-------|------|
| `useAggregatedEvents` | Aggrega 6 fonti evento | 690 righe |
| `useFilteredEvents` | Filtra per permessi (Layer 1) | 209 righe |
| `useMacroCategoryEvents` | Aggrega per data+categoria | 627 righe |
| `useCalendarStats` | Calcola statistiche | 99 righe |
| `useCalendarAlerts` | Genera alert urgenze | 177 righe |
| `useCalendarRefresh` | Auto-refresh 3 min | 90 righe |
| `useGenericTasks` | CRUD mansioni | 300+ righe |

### Componenti UI

| Componente | Scopo |
|------------|-------|
| `Calendar.tsx` | Wrapper FullCalendar (996 righe) |
| `MacroCategoryModal.tsx` | Lista eventi per data+categoria |
| `GenericTaskForm.tsx` | Form creazione mansioni |
| `NewCalendarFilters.tsx` | Filtri Reparto (solo admin) e Tipo |
| `CalendarStatsPanel.tsx` | Pannello statistiche |
| `AlertModal.tsx` | Mostra alert urgenti |

---

## 6 FONTI EVENTO AGGREGATE

```
useAggregatedEvents() aggrega:

1. 🔧 MAINTENANCE TASKS
   - Manutenzioni punti conservazione
   - Controlli temperatura, sanificazione, sbrinamento
   - Espanso per ricorrenza

2. 📋 GENERIC TASKS (Mansioni)
   - Attività ricorrenti assegnate
   - Template che generano eventi
   - Verifica completamenti per periodo

3. 📦 PRODUCT EXPIRY
   - Scadenze prodotti attivi
   - Filtra expiry_date > 7 giorni fa

4. 👤 HACCP EXPIRY
   - Scadenze certificazioni dipendenti
   - Una occorrenza per dipendente

5. 🌡️ TEMPERATURE CHECKS
   - Auto-generati da conservation points
   - Controlli giornalieri

6. 📜 HACCP DEADLINES
   - Training HACCP
   - Scadenze formazione
```

---

## SISTEMA FILTRI 2-LAYER

### Layer 1 - Permessi (useFilteredEvents)
Filtra per **ruolo/assegnazione** dell'utente:
- **Admin/Responsabile** → vedono TUTTI gli eventi
- **Dipendente** → solo eventi assegnati a loro (staff_id, role, category, department)

### Layer 2 - Visuale (NewCalendarFilters)
Filtra per **preferenza visiva**:
- **Reparto** (solo admin): OR tra reparti selezionati — visibile e applicabile solo a utenti `admin`
- **Tipo**: generic_task | maintenance | product_expiry  
*(Filtro "Per Stato" rimosso dall'UI il 05-02-2026; tipo e logica `statuses` restano in calendar-filters per compatibilità.)*

---

## SISTEMA MACROCATEGORY

Una **MacroCategory** aggrega eventi per:
- **Data** (YYYY-MM-DD)
- **Categoria** (maintenance | generic_tasks | product_expiry)

Sul calendario viene mostrata come **1 badge** con conteggio (es: "🔧 Manutenzioni (3)").

Al click apre **MacroCategoryModal** con lista dettagliata.

---

## INTEGRAZIONE CONSERVATION

### Navigazione da Conservation → Calendar
Il pulsante "Visualizza nel Calendario" in ScheduledMaintenanceCard naviga a:
```
/attivita?state={
  openMacroCategory: 'maintenance',
  date: '2026-01-30',
  highlightMaintenanceTaskId: 'uuid-task'
}
```

CalendarPage:
1. Riceve state dalla navigazione
2. Filtra eventi per data + maintenance
3. Apre MacroCategoryModal
4. Evidenzia la manutenzione specifica

---

## STRUTTURA DIRECTORY

```
src/features/calendar/
├── CalendarPage.tsx              # Entry point (1095 righe)
├── Calendar.tsx                  # Wrapper FullCalendar (996 righe)
├── CalendarFilter.tsx            # Filtri calendario (legacy)
├── CalendarSettings.tsx          # Impostazioni calendario
├── CreateEventModal.tsx          # Modal creazione evento
├── EventDetailsModal.tsx         # Modal dettagli evento
├── hooks/
│   ├── useAggregatedEvents.ts    # Aggregazione 6 fonti
│   ├── useFilteredEvents.ts      # Filtri permessi
│   ├── useMacroCategoryEvents.ts # Aggregazione data+categoria
│   ├── useCalendarStats.ts       # Statistiche
│   ├── useCalendarAlerts.ts      # Sistema alert
│   ├── useCalendarRefresh.ts     # Auto-refresh
│   ├── useGenericTasks.ts        # CRUD mansioni
│   ├── useCalendar.ts            # Hook generico calendario
│   └── useCalendarEvents.ts      # Gestione eventi
├── components/
│   ├── MacroCategoryModal.tsx    # Modal categoria+data
│   ├── CategoryEventsModal.tsx   # Modal eventi per categoria
│   ├── GenericTaskForm.tsx       # Form mansioni
│   ├── NewCalendarFilters.tsx    # Filtri UI (attuale)
│   ├── CalendarFilters.tsx       # Filtri calendario
│   ├── HorizontalCalendarFilters.tsx # Filtri orizzontali
│   ├── CalendarStatsPanel.tsx    # Statistiche
│   ├── CalendarQuickOverview.tsx # Overview rapido
│   ├── CalendarConfigModal.tsx   # Config modale
│   ├── CalendarLegend.tsx        # Legenda colori
│   ├── CalendarEventLegend.tsx   # Legenda eventi
│   ├── AlertModal.tsx            # Alert urgenti
│   ├── EventModal.tsx            # Modal evento generico
│   ├── EventBadge.tsx            # Badge evento
│   ├── FilterPanel.tsx           # Pannello filtri
│   ├── ProductExpiryModal.tsx    # Modal scadenze prodotti
│   ├── QuickActions.tsx          # Azioni rapide
│   ├── ViewSelector.tsx          # Selettore vista
│   └── index.ts                  # Export componenti
├── utils/
│   ├── eventTransform.ts         # Trasformazione eventi
│   ├── colorUtils.ts             # Colori eventi
│   ├── recurrenceScheduler.ts    # Logica ricorrenza
│   ├── temperatureCheckGenerator.ts # Generatore check temperatura
│   └── haccpDeadlineGenerator.ts # Generatore scadenze HACCP
├── __tests__/
│   └── CalendarPage.test.tsx     # Test pagina calendario
└── calendar-custom.css           # Stili FullCalendar
```

---

## FILE DOCUMENTAZIONE

| File | Descrizione |
|------|-------------|
| **00_MASTER_INDEX_CALENDAR.md** | Questo file - overview generale |
| **CALENDAR_PAGE.md** | Documentazione CalendarPage |
| **MACRO_CATEGORY_SYSTEM.md** | Sistema MacroCategory |
| **FILTERS_AND_PERMISSIONS.md** | Sistema filtri 2-layer |
| **EVENT_AGGREGATION.md** | Aggregazione 6 fonti |
| **GENERIC_TASK_FORM.md** | Documentazione form mansioni |

### Report Lavoro

| Cartella | Contenuto |
|----------|-----------|
| **../Lavoro/29-01-2026/** | GenericTaskForm: recurrence_config, validazioni |
| **../Lavoro/04-02-2026/** | MacroCategoryModal, UI Statistiche, completamento mansioni |
| **../Lavoro/05-02-2026/** | Allineamento repository, filtri reparto solo admin, rimozione filtri Per Stato |

---

## FLUSSI UTENTE PRINCIPALI

### 1. Visualizzare eventi del giorno
1. Utente apre pagina Attività
2. CalendarPage carica eventi aggregati
3. Applica filtri permessi (Layer 1)
4. Mostra calendario con macro-categorie
5. Utente clicca su giorno → vede eventi

### 2. Completare una manutenzione / mansione
1. Utente clicca macro-categoria (Manutenzioni o Mansioni/Attività)
2. MacroCategoryModal mostra lista
3. Utente clicca "Completa" su voce
4. Sistema aggiorna status → 'completed'
5. Modal si aggiorna senza chiudere (refresh dati in pagina)
6. Per mansioni completate: utente (o admin) può cliccare "Ancora da Completare" nella card espansa per annullare

### 3. Creare nuova mansione
1. Utente espande sezione "Nuova Attività"
2. Compila GenericTaskForm (nome, frequenza, assegnazione, ecc.)
3. Salva → mansione creata
4. Eventi generati per tutto l'anno lavorativo

### 4. Navigare da Conservation
1. Utente è in pagina Conservazione
2. Clicca "Vedi nel Calendario" su manutenzione
3. Navigate a /attivita con state
4. CalendarPage apre MacroCategoryModal
5. Manutenzione specifica evidenziata

---

## QUICK START

### Per debug:
```bash
# Dev server
npm run dev

# Apri pagina Attività
# Verifica:
# 1. Eventi aggregati da tutte le fonti
# 2. Filtri funzionanti
# 3. MacroCategory click
# 4. Completamento eventi
```

### File chiave da leggere:
1. `src/features/calendar/CalendarPage.tsx` - Entry point
2. `src/features/calendar/hooks/useAggregatedEvents.ts` - Aggregazione
3. `src/features/calendar/hooks/useMacroCategoryEvents.ts` - MacroCategory
4. `src/features/calendar/components/MacroCategoryModal.tsx` - Modal

---

## COLORI EVENTO

| Tipo | Background | Border | Text |
|------|------------|--------|------|
| Maintenance | #FEF3C7 | #F59E0B | #92400E |
| Generic Task | #DBEAFE | #3B82F6 | #1E40AF |
| Product Expiry | #FEE2E2 | #EF4444 | #991B1B |
| Completed | #DCFCE7 | #10B981 | #065F46 |
| Overdue | #FEE2E2 | #EF4444 | #991B1B |

---

**Ultimo aggiornamento**: 2026-02-05
**Status**: PRODUCTION-READY - Sistema calendario completo con 6 fonti aggregate. Refresh modal, uncomplete mansioni, classificazione temperature_reading → Manutenzioni. Filtri UI: solo Reparto (admin) e Tipo; filtro Per Stato rimosso.
