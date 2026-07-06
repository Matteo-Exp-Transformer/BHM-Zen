> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A3`](../../META/FASE3_REPORT_A3_CALENDAR.md) §5.5  
> **Motivo**: tabella bug weekend «Parzialmente risolto» contraddice report 15-02 «RISOLTO»; codice+DB ok, doc interna in conflitto.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# MASTER INDEX - Calendar/Attività Feature

> **DOCUMENTAZIONE DETTAGLIATA**: [conoscenze-definizioni/](./conoscenze-definizioni/) per specifiche complete
> **LAVORO SVOLTO**: [Lavoro/](./Lavoro/) per report implementazione

---

## Status Generale

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Pagina Attività | Presente | `src/features/calendar/CalendarPage.tsx` |
| Aggregazione eventi | 6 fonti | `useAggregatedEvents.ts` |
| Filtri permessi | Layer 1 | `useFilteredEvents.ts` |
| Filtri visuali | Layer 2 | `NewCalendarFilters.tsx` |
| Macro-categorie | Data + categoria | `useMacroCategoryEvents.ts`, `MacroCategoryModal.tsx` |
| Form mansioni | Creazione ricorrenti | `GenericTaskForm.tsx`, `useGenericTasks.ts` |

---

## Struttura Directory Codice

```
src/features/calendar/
├── CalendarPage.tsx              # Entry point pagina
├── Calendar.tsx                  # Wrapper FullCalendar
├── hooks/
│   ├── useAggregatedEvents.ts
│   ├── useFilteredEvents.ts
│   ├── useMacroCategoryEvents.ts
│   ├── useCalendarStats.ts
│   ├── useCalendarAlerts.ts
│   ├── useCalendarRefresh.ts
│   ├── useGenericTasks.ts
│   └── useCalendar.ts
├── components/
│   ├── MacroCategoryModal.tsx
│   ├── GenericTaskForm.tsx
│   ├── NewCalendarFilters.tsx
│   ├── CalendarStatsPanel.tsx
│   ├── AlertModal.tsx
│   └── [altri componenti UI]
├── utils/
│   ├── eventTransform.ts
│   ├── colorUtils.ts
│   ├── recurrenceScheduler.ts
│   ├── temperatureCheckGenerator.ts
│   └── haccpDeadlineGenerator.ts
└── calendar-custom.css
```

---

## Fonti Evento (6)

| # | Fonte | Descrizione |
|---|-------|-------------|
| 1 | Maintenance Tasks | Manutenzioni punti conservazione |
| 2 | Generic Tasks | Mansioni ricorrenti |
| 3 | Product Expiry | Scadenze prodotti |
| 4 | HACCP Expiry | Scadenze certificazioni dipendenti |
| 5 | Temperature Checks | Controlli temperatura da conservation points |
| 6 | HACCP Deadlines | Scadenze formazione |

---

## Sistema Filtri

- **Layer 1 (Permessi)**: Admin/Responsabile vedono tutto; Dipendente solo eventi assegnati
- **Layer 2 (Visuale)**: Reparto, Stato (to_complete/completed/overdue/future), Tipo (maintenance/generic_task/product_expiry)

---

## Macro-categorie

Aggregazione per **data** + **categoria** (maintenance | generic_tasks | product_expiry). Badge con conteggio sul calendario; click → modal con lista eventi.

---

## Documentazione (conoscenze-definizioni)

| File | Descrizione |
|------|-------------|
| [00_MASTER_INDEX_CALENDAR.md](./conoscenze-definizioni/00_MASTER_INDEX_CALENDAR.md) | Overview sintetico (dentro conoscenze-definizioni) |
| [CALENDAR_PAGE.md](./conoscenze-definizioni/CALENDAR_PAGE.md) | Pagina principale e flussi |
| [EVENT_AGGREGATION.md](./conoscenze-definizioni/EVENT_AGGREGATION.md) | Aggregazione 6 fonti |
| [FILTERS_AND_PERMISSIONS.md](./conoscenze-definizioni/FILTERS_AND_PERMISSIONS.md) | Filtri 2-layer |
| [MACRO_CATEGORY_SYSTEM.md](./conoscenze-definizioni/MACRO_CATEGORY_SYSTEM.md) | Sistema macro-categorie |
| [GENERIC_TASK_FORM.md](./conoscenze-definizioni/GENERIC_TASK_FORM.md) | Form creazione mansioni |

---

## Bug riscontrati (Calendario / vista mese)

| Bug | Celle interessate | Stato | Dettaglio |
|-----|-------------------|--------|-----------|
| **Weekend unito** | Sab/Dom (giorni chiusi) | Parzialmente risolto | `fc-day-closed` applicata via DOM; visivamente celle ancora “unite” per CSS specificity (regole `.fc-day-sat`/`.fc-day-sun` vincono). Fix proposta: alzare specificity e/o `box-shadow` inset in `calendar-custom.css`. |
| **Lampeggiamento (flicker) al passaggio del mouse** | Stesse celle (Sab/Dom / `.fc-day-closed`) | **Risolto** | Hover con `transform: translateY(-1px)` causava loop enter/leave. Fix: `.fc-daygrid-day.fc-day-closed:hover { transform: none }` in `calendar-custom.css`. |
| **Highlight sulla cella adiacente** | Stesse celle | **Risolto** | FullCalendar mostrava `.fc-highlight` sulla cella sbagliata. Fix: `.fc-daygrid .fc-highlight { display: none }`; feedback hover/click solo con stili custom. |

**Report analisi e piano:** [Lavoro/12-02-2026/REPORT_BUG_WEEKEND_UNITO_ANALISI_APPROFONDITA_12-02-2026.md](./Lavoro/12-02-2026/REPORT_BUG_WEEKEND_UNITO_ANALISI_APPROFONDITA_12-02-2026.md) (include §11 mappatura hover/lampeggio e highlight 15-02-2026).

---

## Lavoro (report implementazione)

| Cartella | Contenuto |
|----------|-----------|
| [Lavoro/29-01-2026/](./Lavoro/29-01-2026/) | GenericTaskForm: recurrence_config, giorni custom, giorno mese, validazioni duplicati |
| [Lavoro/04-02-2026/](./Lavoro/04-02-2026/) | **UI e Statistiche**: rimozione header Calendar, CollapsibleCard (spaziatura, hideHeader, stato controllato), correzione statistiche temporali (Questo Mese/Anno), sottotitolo vista su card Statistiche, testi/etichette pannello, casella "In Attesa" legata alla vista. Report: [REPORT_CALENDARIO_UI_E_STATISTICHE.md](./Lavoro/04-02-2026/REPORT_CALENDARIO_UI_E_STATISTICHE.md). Stesso giorno: anche [REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md](./Lavoro/04-02-2026/REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md) (MacroCategoryModal, refresh, completamento mansioni). |
| [Lavoro/12-02-2026/](./Lavoro/12-02-2026/) | **Bug weekend unito + hover**: analisi root cause (race `dayCellDidMount`, CSS specificity), fix `fc-day-closed` via DOM, mappatura bug hover (lampeggio + highlight cella adiacente) e fix CSS. Report: [REPORT_BUG_WEEKEND_UNITO_ANALISI_APPROFONDITA_12-02-2026.md](./Lavoro/12-02-2026/REPORT_BUG_WEEKEND_UNITO_ANALISI_APPROFONDITA_12-02-2026.md). |

---

## Integrazione Conservation → Calendar

Navigazione da Conservation con pulsante "Visualizza nel Calendario": passa state (`openMacroCategory`, `date`, `highlightMaintenanceTaskId`) a `/attivita`; CalendarPage apre MacroCategoryModal con manutenzione evidenziata.

---

## Quick Reference

### Comandi
```bash
npm run dev          # Avvia app
npm run type-check   # Verifica TypeScript
npm run build        # Build production
```

### File chiave
1. `src/features/calendar/CalendarPage.tsx` — Entry point
2. `src/features/calendar/hooks/useAggregatedEvents.ts` — Aggregazione
3. `src/features/calendar/hooks/useMacroCategoryEvents.ts` — Macro-categorie

---

## Note per aggiornamento

- Aggiornare questo file quando cambia l’architettura (nuovi hook, componenti, fonti evento)
- Verificare che conoscenze-definizioni e codice siano allineati
- Aggiungere voci in "Lavoro" per nuove sessioni di implementazione

---

**Ultimo aggiornamento**: 2026-02-15
