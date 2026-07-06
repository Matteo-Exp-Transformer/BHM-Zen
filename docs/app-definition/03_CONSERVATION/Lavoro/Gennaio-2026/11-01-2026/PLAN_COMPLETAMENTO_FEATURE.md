# PLAN - Completamento Feature Conservation v3.0

> **Data Creazione**: 2026-01-16  
> **Versione**: 3.0.0 - "Completamento Feature e Fix"
> **Workers**: 5 (Worker 1-5)
> **Fasi Sequenziali**: 5 (FASE 1-5)
> **Tempo Stimato**: ~12h (variabile in base a complessità)
> **Fonte Problemi**: `STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md`

---

## 📋 INDICE

1. [Overview](#overview)
2. [Workflow Completo](#workflow-completo)
3. [Fase 1: Fix Critici (Workers 1-3)](#fase-1-fix-critici-workers-1-3)
4. [Fase 2: Completa Feature Core (Workers 1-3)](#fase-2-completa-feature-core-workers-1-3)
5. [Fase 3: Miglioramenti (Workers 1, 3)](#fase-3-miglioramenti-workers-1-3)
6. [Fase 4: Integration (Worker 4)](#fase-4-integration-worker-4)
7. [Fase 5: Final Verification (Worker 5)](#fase-5-final-verification-worker-5)
8. [Gate Functions](#gate-functions)
9. [Dipendenze Critiche](#dipendenze-critiche)
10. [Success Criteria](#success-criteria)

---

## 🎯 OVERVIEW

### Contesto

**Problema**: Analisi completa (`STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md`) ha identificato 15 problemi parzialmente implementati e 13 non implementati su 81 feature totali.

**Stato Attuale**:
- ✅ **Completato**: 65.4% (53/81)
- ⚠️ **Parziale**: 18.5% (15/81)
- ❌ **Mancante**: 16.0% (13/81)
- **Totale Implementato**: 83.9% (68/81)

**Obiettivi**:
1. ✅ Completare 3 problemi CRITICI (requisiti specifici utente)
2. ✅ Completare 8 problemi ALTI (funzionalità core)
3. ✅ Implementare 4 miglioramenti MEDI (UX e accessibilità)
4. ✅ Verificare tutto con test E2E e supervisor check

### Problemi da Risolvere

**🔴 CRITICI (3)**:
1. Mini calendario per frequenza mensile/annuale
2. Dettagli assegnazione manutenzioni incompleti
3. Ordinamento manutenzioni per scadenza

**🟡 ALTI (8)**:
4. Configurazione giorni settimana (giornaliera/settimanale)
5. Raggruppamento manutenzioni per tipo
6. Campi form temperatura non salvati (metodo, note, foto)
7. Validazione manutenzioni specifica
8. Modifica punto con manutenzioni
9. Modifica lettura temperatura
10. Accessibilità (aria-label)
11. Frequenza "custom" da rimuovere

**🟢 MEDI (4)**:
12. Visualizzazione ingredienti (da definire)
13. Real-time updates
14. Optimistic locking
15. Upload foto diretto

---

## 🔄 WORKFLOW COMPLETO

```
┌──────────────────────────────────────────────────────────┐
│                    INIZIO WORKFLOW                       │
│          (Problemi identificati da analisi)              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  FASE 1: FIX CRITICI (Workers 1-3)                      │
│  Tempo: 5h                                              │
│  ──────────────────────────────────────────────────────  │
│  Worker 1 (UI/Forms) - 2h                               │
│    Task 1.1: Mini Calendario Component (1.5h)          │
│    └─> Componente MiniCalendar per mensile/annuale      │
│  ──────────────────────────────────────────────────────  │
│  Worker 2 (Database/Data) - 1.5h                        │
│    Task 2.1: Carica campi assegnazione (30min)         │
│    Task 2.2: Salva campi assegnazione (1h)              │
│  ──────────────────────────────────────────────────────  │
│  Worker 3 (Maintenance/Logic) - 1.5h                    │
│    Task 3.1: Visualizza dettagli assegnazione (1h)     │
│    Task 3.2: Ordina manutenzioni per scadenza (30min)  │
│  ──────────────────────────────────────────────────────  │
│  OUTPUT: Fix critici implementati + Test GREEN          │
└────────────┬─────────────────────────────────────────────┘
             │
        ╔════▼════╗
        ║ GATE 1  ║
        ╚════╤════╝
             │
    ┌────────┴────────┐
    │                 │
❌ REJECTED      ✅ APPROVED
(test falliti)   (fix OK)
    │                 │
    ▼                 ▼
⬅️ FASE 1     ┌────────────────────────────────────────┐
              │  FASE 2: COMPLETA CORE (Workers 1-3)  │
              │  Tempo: 4h                             │
              │  ────────────────────────────────────  │
              │  Worker 1 (UI/Forms) - 2h 30min        │
              │    Task 1.2: Config giorni settimana (1h)│
              │    Task 1.3: Validazione specifica (1h) │
              │    Task 1.4: Rimuovi frequenza custom (30min)│
              │  ────────────────────────────────────  │
              │  Worker 2 (Database/Data) - 30min      │
              │    Task 2.3: Salva campi temperatura (30min)│
              │  ────────────────────────────────────  │
              │  Worker 3 (Maintenance/Logic) - 1h     │
              │    Task 3.3: Raggruppa manutenzioni (1h)│
              │  ────────────────────────────────────  │
              │  OUTPUT: Feature core completate        │
              └────────────┬─────────────────────────────┘
                           │
                      ╔════▼════╗
                      ║ GATE 2  ║
                      ╚════╤════╝
                           │
              ┌────────────┴────────────┐
              │                         │
         ❌ REJECTED              ✅ APPROVED
         (test falliti)           (core OK)
              │                         │
              ▼                         ▼
         ⬅️ FASE 1/2         ┌───────────────────────────┐
                             │  FASE 3: MIGLIORAMENTI   │
                             │  (Workers 1, 3)          │
                             │  Tempo: 2h               │
                             │  ──────────────────────  │
                             │  Worker 1 (UI/Forms) - 1h│
                             │    Task 1.5: Aria-label (30min)│
                             │    Task 1.6: Modifica lettura (30min)│
                             │  ──────────────────────  │
                             │  Worker 3 (Logic) - 1h   │
                             │    Task 3.4: Modifica punto manutenzioni (1h)│
                             │  ──────────────────────  │
                             │  OUTPUT: Miglioramenti OK │
                             └────────────┬──────────────┘
                                          │
                                     ╔════▼════╗
                                     ║ GATE 3  ║
                                     ╚════╤════╝
                                          │
                            ┌─────────────┴─────────────┐
                            │                           │
                       ❌ REJECTED                ✅ APPROVED
                       (test falliti)            (tutto OK)
                            │                           │
                            ▼                           ▼
                       ⬅️ FASE X         ┌───────────────────────────┐
                                        │  FASE 4: INTEGRATION      │
                                        │  (Worker 4)               │
                                        │  Tempo: 1h                │
                                        │  ───────────────────────  │
                                        │  Task 4.1: Test E2E (1h)  │
                                        │    └─> Test nuove feature │
                                        │  ───────────────────────  │
                                        │  OUTPUT: E2E PASS         │
                                        └────────────┬──────────────┘
                                                     │
                                                ╔════▼════╗
                                                ║ GATE 4  ║
                                                ╚════╤════╝
                                                     │
                                      ┌──────────────┴──────────────┐
                                      │                             │
                                 ❌ REJECTED                  ✅ APPROVED
                                 (E2E falliti)                (E2E PASS)
                                      │                             │
                                      ▼                             ▼
                                 ⬅️ FASE X         ┌─────────────────────────────┐
                                                   │  FASE 5: FINAL VERIFICATION│
                                                   │  (Worker 5 - Supervisor)   │
                                                   │  Tempo: 1h                 │
                                                   │  ────────────────────────  │
                                                   │  Task 5.1: Quality Check   │
                                                   │    └─> Comandi FRESH       │
                                                   │  ────────────────────────  │
                                                   │  OUTPUT:                  │
                                                   │  SUPERVISOR_FINAL_REPORT  │
                                                   └────────────┬──────────────┘
                                                                │
                                                           ╔════▼════╗
                                                           ║ VERDICT ║
                                                           ╚════╤════╝
                                                                │
                                                  ┌─────────────┴─────────────┐
                                                  │                           │
                                             ❌ REJECTED                ✅ APPROVED
                                                  │                           │
                                                  ▼                           ▼
                                             ⬅️ FASE X                  🎉 MERGE
```

**Principio**: Ogni fase BLOCCATA dalla precedente. NO parallelismo tra fasi.

---

## 📍 FASE 1: FIX CRITICI (Workers 1-3)

### Obiettivo
Risolvere 3 problemi CRITICI che bloccano requisiti specifici utente.

### Workers Responsabili
- **Worker 1**: UI/Forms Specialist (2h)
- **Worker 2**: Database/Data Specialist (1.5h)
- **Worker 3**: Maintenance/Logic Specialist (1.5h)

### Task Worker 1

**Task 1.1**: Mini Calendario Component per Frequenza Mensile/Annuale (1.5h, CRITICAL)

**Problema**: Frequenza mensile/annuale usa input numerico invece di vero mini calendario (requisito specifico utente)

**File da Creare**:
- `src/components/ui/MiniCalendar.tsx` (nuovo componente)

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (linee frequenza manutenzioni)
- `src/components/onboarding-steps/TasksStep.tsx` (allineare con stesso componente)

**Implementation (TDD Workflow)**:
1. **RED**: Test componente MiniCalendar
   - Test selezione giorno mese (1-31)
   - Test selezione giorno anno (1-365)
   - Test validazione input

2. **GREEN**: Implementa componente
   - Mini calendario mensile (grid 31 giorni)
   - Mini calendario annuale (calendar view con giorno dell'anno)
   - Integra in AddPointModal per frequenza mensile/annuale

3. **REFACTOR**: Cleanup e ottimizzazione

**Skills Richieste**:
- `test-driven-development/SKILL.md` - TDD workflow
- `Tailwind-CSS-design/SKILL.md` - Layout responsive

**Pattern Riferimento**: Componenti calendario esistenti (verificare se presenti)

**Acceptance Criteria**:
- [ ] Componente MiniCalendar creato e funzionante
- [ ] Integrato in AddPointModal per frequenza mensile
- [ ] Integrato in AddPointModal per frequenza annuale (solo sbrinamento)
- [ ] Test passano (GREEN)
- [ ] Responsive design mobile/tablet/desktop

### Task Worker 2

**Task 2.1**: Carica campi assegnazione manutenzioni (30min, CRITICAL)

**Problema**: Hook `useMaintenanceTasks` non carica campi assegnazione (`assignment_type`, `assigned_to_role`, `assigned_to_category`, `assigned_to_staff_id`, `department_id`)

**File da Modificare**:
- `src/features/conservation/hooks/useMaintenanceTasks.ts` (query SELECT)

**Implementation**:
- Aggiornare SELECT per includere tutti i campi assegnazione
- Aggiornare type `MaintenanceTask` se necessario
- Includere join con `staff` per nome dipendente se `assigned_to_staff_id`

**Skills Richieste**:
- `systematic-debugging/SKILL.md` - Analisi query
- `root-cause-tracing/SKILL.md` - Tracciamento campi mancanti

**Acceptance Criteria**:
- [ ] Query include tutti i campi assegnazione
- [ ] Type `MaintenanceTask` aggiornato
- [ ] Test query passano
- [ ] Type-check PASS

**Task 2.2**: Salva campi assegnazione da AddPointModal (1h, CRITICAL)

**Problema**: Hook `useConservationPoints` salva solo `assigned_to` generico invece di campi specifici

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (trasformazione dati)
- `src/features/conservation/hooks/useConservationPoints.ts` (payload salvataggio)

**Implementation**:
- Aggiornare trasformazione `maintenanceTasks` in `AddPointModal` per includere tutti i campi
- Verificare che `useConservationPoints` salvi correttamente tutti i campi (già presente linea 109-112, verificare mapping)

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test salvataggio
- `defense-in-depth/SKILL.md` - Validazione campi

**Acceptance Criteria**:
- [ ] AddPointModal passa tutti i campi assegnazione
- [ ] useConservationPoints salva tutti i campi correttamente
- [ ] Test creazione punto con manutenzioni passano
- [ ] Verifica DB: campi salvati correttamente

### Task Worker 3

**Task 3.1**: Visualizza dettagli assegnazione manutenzioni (1h, CRITICAL)

**Problema**: `ScheduledMaintenanceCard` mostra solo stringa generica invece di ruolo + categoria + reparto + dipendente

**File da Modificare**:
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (visualizzazione assegnazione)

**Implementation**:
- Aggiornare rendering "Assegnato a" per mostrare formato: "Ruolo: [ruolo] | Reparto: [reparto] | Categoria: [categoria] | Dipendente: [nome]"
- Mostrare solo campi disponibili (se categoria mancante, non mostrare)
- Formattazione condizionale

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test visualizzazione
- `systematic-debugging/SKILL.md` - Debug rendering

**Acceptance Criteria**:
- [ ] Visualizzazione mostra dettagli completi
- [ ] Formato corretto con separatori
- [ ] Campi opzionali gestiti correttamente
- [ ] Test visualizzazione passano

**Task 3.2**: Ordina manutenzioni per scadenza (30min, CRITICAL)

**Problema**: Manutenzioni mostrate nell'ordine caricamento invece di ordinate per `next_due` ascendente

**File da Modificare**:
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (ordinamento array)

**Implementation**:
- Ordinare array `pointMaintenances` per `next_due` ascendente prima di renderizzare
- Usare `useMemo` per performance

**Skills Richieste**:
- `systematic-debugging/SKILL.md` - Analisi ordinamento

**Acceptance Criteria**:
- [ ] Manutenzioni ordinate per scadenza (più prossime prima)
- [ ] Ordinamento corretto (data ascendente)
- [ ] Test ordinamento passano

### Deliverable Fase 1
- Fix critici implementati
- Test unit GREEN
- Type-check PASS
- Verifica funzionalità manuale

**Dettagli completi**: Vedi `TASKS_COMPLETAMENTO.md` - Fase 1

---

## 🔧 FASE 2: COMPLETA FEATURE CORE (Workers 1-3)

### ⚠️ PREREQUISITI
- ✅ Fase 1 COMPLETED
- ✅ Test critici GREEN
- ✅ Type-check PASS

### Workers Responsabili
- **Worker 1**: UI/Forms Specialist (2h 30min)
- **Worker 2**: Database/Data Specialist (30min)
- **Worker 3**: Maintenance/Logic Specialist (1h)

### Task Worker 1

**Task 1.2**: Configurazione giorni settimana (giornaliera/settimanale) (1h, HIGH)

**Problema**: Frequenza giornaliera/settimanale non ha configurazione giorni settimana

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (frequenza manutenzioni)

**Implementation (TDD)**:
1. **RED**: Test checkbox giorni settimana
   - Test giornaliera: tutte selezionate di default
   - Test settimanale: solo lunedì selezionato di default

2. **GREEN**: Implementa checkbox giorni settimana
   - Componente checkbox giorni (Lun-Dom)
   - Default: tutte per giornaliera, lunedì per settimanale
   - Salvataggio configurazione giorni

3. **REFACTOR**: Cleanup

**Skills Richieste**:
- `test-driven-development/SKILL.md` - TDD workflow

**Acceptance Criteria**:
- [ ] Checkbox giorni settimana implementati
- [ ] Default corretti (tutte/lunedì)
- [ ] Salvataggio configurazione giorni
- [ ] Test passano (GREEN)

**Task 1.3**: Validazione manutenzioni specifica (1h, HIGH)

**Problema**: Errore generico invece di errore specifico per manutenzione incompleta

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (validazione)

**Implementation (TDD)**:
1. **RED**: Test validazione specifica
   - Test errore indica quale manutenzione è incompleta

2. **GREEN**: Migliora validazione
   - Validazione per ogni manutenzione separatamente
   - Errore specifico per manutenzione (es. "Manutenzione 'Rilevamento Temperature': seleziona frequenza")
   - Evidenziazione visiva manutenzioni incomplete

3. **REFACTOR**: Cleanup

**Skills Richieste**:
- `test-driven-development/SKILL.md` - TDD workflow
- `systematic-debugging/SKILL.md` - Analisi validazione

**Acceptance Criteria**:
- [ ] Validazione specifica per manutenzione
- [ ] Errore indica quale manutenzione è incompleta
- [ ] Evidenziazione visiva (bordo rosso, icona errore)
- [ ] Test passano (GREEN)

**Task 1.4**: Rimuovi frequenza "custom" (30min, MEDIUM)

**Problema**: Opzione "custom" ancora presente nel select frequenze

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (select frequenza)
- `src/components/onboarding-steps/TasksStep.tsx` (allineare)

**Implementation**:
- Rimuovere opzione "custom" dal select frequenze
- Rimuovere logica validazione per "custom"
- Rimuovere tipo `custom` da type se non più usato

**Skills Richieste**:
- `systematic-debugging/SKILL.md` - Verifica dipendenze

**Acceptance Criteria**:
- [ ] Opzione "custom" rimossa
- [ ] Nessun riferimento a "custom" nel codice
- [ ] Test passano (nessuna regressione)
- [ ] Type-check PASS

### Task Worker 2

**Task 2.3**: Salva campi form temperatura (metodo, note, foto) (30min, HIGH)

**Problema**: Migration 015 aggiunge campi ma non vengono salvati dal form

**File da Modificare**:
- `src/features/conservation/components/AddTemperatureModal.tsx` (salvataggio)
- `src/features/conservation/hooks/useTemperatureReadings.ts` (payload)

**Implementation**:
- Aggiornare payload `createReadingMutation` per includere `method`, `notes`, `photo_evidence`, `recorded_by`
- Aggiornare form per salvare questi campi (già presenti nel form, verificare binding)

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test salvataggio
- `defense-in-depth/SKILL.md` - Validazione campi

**Acceptance Criteria**:
- [ ] Form salva metodo, note, foto evidenza
- [ ] Hook salva tutti i campi nel database
- [ ] Test creazione lettura passano
- [ ] Verifica DB: campi salvati correttamente

### Task Worker 3

**Task 3.3**: Raggruppa manutenzioni per tipo con solo prima visibile (1h, HIGH)

**Problema**: Tutte le manutenzioni mostrate, non raggruppate per tipo con solo prima visibile

**File da Modificare**:
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` (raggruppamento)

**Implementation**:
- Raggruppa manutenzioni per tipo (rilevamento_temperatura, sanificazione, sbrinamento, controllo_scadenze)
- Mostra solo prima manutenzione per tipo (più prossima)
- Espandibile per vedere prossime 2 manutenzioni per tipo

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test raggruppamento
- `systematic-debugging/SKILL.md` - Analisi logica

**Acceptance Criteria**:
- [ ] Manutenzioni raggruppate per tipo
- [ ] Solo prima manutenzione per tipo visibile di default
- [ ] Espansione mostra prossime 2 per tipo
- [ ] Test passano (GREEN)

### Deliverable Fase 2
- Feature core completate
- Test unit GREEN
- Type-check PASS

**Dettagli completi**: Vedi `TASKS_COMPLETAMENTO.md` - Fase 2

---

## ⚙️ FASE 3: MIGLIORAMENTI (Workers 1, 3)

### ⚠️ PREREQUISITI
- ✅ Fase 2 COMPLETED
- ✅ Test core GREEN

### Workers Responsabili
- **Worker 1**: UI/Forms Specialist (1h)
- **Worker 3**: Maintenance/Logic Specialist (1h)

### Task Worker 1

**Task 1.5**: Aggiungi aria-label a pulsanti icona (30min, MEDIUM)

**Problema**: Pulsanti icona (edit/delete) non hanno aria-label descrittivi

**File da Modificare**:
- `src/features/conservation/components/ConservationPointCard.tsx` (aria-label)

**Implementation**:
- Aggiungere `aria-label` a pulsanti edit: "Modifica [nome punto]"
- Aggiungere `aria-label` a pulsanti delete: "Elimina [nome punto]"
- Verificare altri componenti per consistenza

**Skills Richieste**:
- `systematic-debugging/SKILL.md` - Verifica accessibilità

**Acceptance Criteria**:
- [ ] Tutti i pulsanti icona hanno aria-label
- [ ] Screen reader compatibility verificata
- [ ] Test accessibilità passano

**Task 1.6**: Modifica lettura temperatura (30min, MEDIUM)

**Problema**: Handler `handleEditReading` esiste ma non implementato (mostra solo alert)

**File da Modificare**:
- `src/features/conservation/ConservationPage.tsx` (handleEditReading)
- `src/features/conservation/components/AddTemperatureModal.tsx` (modalità edit)

**Implementation**:
- Implementare `handleEditReading` per aprire modal in modalità edit
- Aggiornare `AddTemperatureModal` per supportare modalità edit (se necessario)
- Aggiornare `useTemperatureReadings` per update (se necessario)

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test modifica
- `systematic-debugging/SKILL.md` - Analisi handler

**Acceptance Criteria**:
- [ ] Handler implementato correttamente
- [ ] Modal supporta modalità edit
- [ ] Modifica lettura funziona
- [ ] Test passano (GREEN)

### Task Worker 3

**Task 3.4**: Modifica punto con manutenzioni (1h, MEDIUM)

**Problema**: Manutenzioni non vengono caricate/modificate in modalità edit

**File da Modificare**:
- `src/features/conservation/components/AddPointModal.tsx` (caricamento manutenzioni in edit)
- `src/features/conservation/hooks/useMaintenanceTasks.ts` (query per punto)

**Implementation**:
- Caricare manutenzioni quando `point` prop è presente (modalità edit)
- Precompilare form manutenzioni con dati esistenti
- Permettere modifica manutenzioni esistenti

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Test modifica
- `systematic-debugging/SKILL.md` - Analisi caricamento

**Acceptance Criteria**:
- [ ] Manutenzioni caricate in modalità edit
- [ ] Form precompilato con manutenzioni esistenti
- [ ] Modifica manutenzioni funziona
- [ ] Test passano (GREEN)

### Deliverable Fase 3
- Miglioramenti implementati
- Test unit GREEN
- Type-check PASS

**Dettagli completi**: Vedi `TASKS_COMPLETAMENTO.md` - Fase 3

---

## 🧪 FASE 4: INTEGRATION (Worker 4)

### ⚠️ PREREQUISITI
- ✅ Fase 3 COMPLETED
- ✅ Tutti i test unit GREEN

### Worker Responsabile
**Worker 4**: Integration & Testing Specialist (1h)

### Task

**Task 4.1**: Test E2E nuove feature (1h, HIGH)

**Focus**: Testare tutte le nuove feature implementate

**Scenario critici (Playwright)**:
1. Test mini calendario: selezione giorno mese/anno
2. Test dettagli assegnazione: visualizzazione completa
3. Test ordinamento manutenzioni: ordine scadenza
4. Test configurazione giorni settimana: checkbox giornaliera/settimanale
5. Test raggruppamento manutenzioni: per tipo con espansione
6. Test salvataggio campi temperatura: metodo, note, foto
7. Test modifica punto con manutenzioni: caricamento e modifica

**Skills Richieste**:
- `test-driven-development/SKILL.md` - Scrittura test
- `condition-based-waiting/SKILL.md` - Attese condizionali

**Acceptance Criteria**:
- [ ] Test E2E passano per tutte le nuove feature
- [ ] Screenshot evidenza salvati
- [ ] Database verification dopo ogni test
- [ ] Tempo esecuzione < 15s

### Deliverable Fase 4
- Test E2E PASS
- Screenshot evidenza (10+)
- Performance report

**Dettagli completi**: Vedi `TASKS_COMPLETAMENTO.md` - Fase 4

---

## ✅ FASE 5: FINAL VERIFICATION (Worker 5)

### ⚠️ PREREQUISITI
- ✅ Fase 4 APPROVED
- ✅ E2E tests GREEN
- ✅ Performance OK

### Worker Responsabile
**Worker 5**: Supervisor (1h)

### Task

**Task 5.1**: Final Quality Check (1h, CRITICAL)

Esegui FRESH (no cache):
- `npm run type-check` → 0 errors
- `npm run lint` → 0 errors
- `npm run build` → SUCCESS
- `npm run test` → ALL PASS
- `npm run test:e2e` → ALL PASS
- `node scripts/verify-conservation-db.js` → 0 orphans

### Deliverable
`SUPERVISOR_FINAL_REPORT_COMPLETAMENTO.md` con verdict:
- ✅ APPROVED → Ready to merge
- ❌ REJECTED → Torna a fase X con action items

**Dettagli completi**: Vedi `TASKS_COMPLETAMENTO.md` - Fase 5

---

## 🚦 GATE FUNCTIONS

### Gate 1: Fase 1 → Fase 2
**Condizioni PASS**:
- ✅ Task 1.1, 2.1, 2.2, 3.1, 3.2 COMPLETED
- ✅ Test critici GREEN
- ✅ Type-check PASS

**Se FAIL**: ⬅️ TORNA A FASE 1

---

### Gate 2: Fase 2 → Fase 3
**Condizioni PASS**:
- ✅ Task 1.2, 1.3, 1.4, 2.3, 3.3 COMPLETED
- ✅ Test core GREEN
- ✅ Type-check PASS

**Se FAIL**: ⬅️ TORNA A FASE 1/2

---

### Gate 3: Fase 3 → Fase 4
**Condizioni PASS**:
- ✅ Task 1.5, 1.6, 3.4 COMPLETED
- ✅ Test miglioramenti GREEN
- ✅ Type-check PASS

**Se FAIL**: ⬅️ TORNA A FASE X

---

### Gate 4: Fase 4 → Fase 5
**Condizioni PASS**:
- ✅ E2E tests PASS
- ✅ Screenshot evidenza salvati

**Se FAIL**: ⬅️ TORNA A FASE X (se regressione) o FASE 4 (se flaky test)

---

### Verdict: Fase 5 → Merge/Reject
**Condizioni APPROVED**:
- ✅ type-check: 0 errors
- ✅ lint: 0 errors
- ✅ build: SUCCESS
- ✅ test: ALL PASS
- ✅ test:e2e: ALL PASS
- ✅ db-check: 0 orphans

**Se APPROVED**: 🎉 MERGE to main
**Se REJECTED**: ⬅️ TORNA A FASE indicata

---

## 🔗 DIPENDENZE CRITICHE

### Critical Path

```
Task 1.1 (Mini Calendario)
  └─> Componente creato
        │
        ▼ RICHIESTO DA
        │
Task 1.2 (Config giorni settimana)
  └─> Completa configurazione frequenze
        │
        ▼ RICHIESTO DA
        │
Task 4.1 (E2E Test)
  └─> Verifica tutte le feature funzionanti
```

```
Task 2.1 (Carica campi assegnazione)
  └─> Query aggiornata
        │
        ▼ RICHIESTO DA
        │
Task 2.2 (Salva campi assegnazione)
  └─> Salvataggio completo
        │
        ▼ RICHIESTO DA
        │
Task 3.1 (Visualizza dettagli assegnazione)
  └─> Visualizzazione completa
        │
        ▼ RICHIESTO DA
        │
Task 4.1 (E2E Test)
  └─> Verifica flusso completo
```

**⚠️ Se Task 2.1/2.2 FAIL → blocca Task 3.1**

---

## ✅ SUCCESS CRITERIA

### Workflow APPROVED se:

**Fase 1**:
- [ ] Mini calendario implementato e funzionante
- [ ] Dettagli assegnazione visualizzati correttamente
- [ ] Ordinamento manutenzioni per scadenza funzionante
- [ ] Test critici GREEN
- [ ] Type-check PASS

**Fase 2**:
- [ ] Configurazione giorni settimana funzionante
- [ ] Validazione manutenzioni specifica implementata
- [ ] Frequenza custom rimossa
- [ ] Campi temperatura salvati correttamente
- [ ] Raggruppamento manutenzioni per tipo funzionante
- [ ] Test core GREEN
- [ ] Type-check PASS

**Fase 3**:
- [ ] Aria-label aggiunti
- [ ] Modifica lettura temperatura funzionante
- [ ] Modifica punto con manutenzioni funzionante
- [ ] Test miglioramenti GREEN
- [ ] Type-check PASS

**Fase 4**:
- [ ] E2E tests PASS
- [ ] Screenshot evidenza (10+)
- [ ] Performance OK

**Fase 5**:
- [ ] Tutti i comandi FRESH GREEN
- [ ] SUPERVISOR_FINAL_REPORT = APPROVED

### Merge Requirements
- [x] type-check: 0 errors
- [x] lint: 0 errors
- [x] build: SUCCESS
- [x] test: ALL PASS
- [x] test:e2e: ALL PASS
- [x] db-check: 0 orphans
- [x] Documentazione aggiornata
- [x] Screenshot evidenza E2E

---

## 📅 TIMELINE

| Fase | Tempo | Cumulativo |
|------|-------|------------|
| FASE 1: Fix Critici | 5h | 5h |
| FASE 2: Completa Core | 4h | 9h |
| FASE 3: Miglioramenti | 2h | 11h |
| FASE 4: Integration | 1h | 12h |
| FASE 5: Final Check | 1h | 13h |
| **TOTALE** | **~13h** | |

**Nota**: Tempo può variare in base a complessità implementazione (es. mini calendario).

---

## 📝 SUMMARY

### Workflow v3.0 Key Points

1. **Fase per Fase**: Ogni fase completata prima della successiva
2. **Gate Functions**: Blocco rigido tra fasi
3. **TDD Obbligatorio**: RED-GREEN-REFACTOR per ogni feature
4. **Skills Richieste**: Ogni worker usa skills appropriate
5. **E2E Evidenza**: Screenshot obbligatori
6. **Fresh Commands**: No cache in Fase 5

### Files Prodotti

1. **Fase 1-3**: Fix e feature implementati nel codice
2. **Fase 4**: E2E test + screenshot
3. **Fase 5**: SUPERVISOR_FINAL_REPORT_COMPLETAMENTO.md

### Success Path

```
FASE 1 ✅ → GATE 1 ✅ → FASE 2 ✅ → GATE 2 ✅ → FASE 3 ✅ → GATE 3 ✅ → FASE 4 ✅ → GATE 4 ✅ → FASE 5 ✅ → APPROVED ✅ → MERGE 🎉
```

---

## 📚 RIFERIMENTI

- [WORKER_PROMPTS.md](WORKER_PROMPTS.md) - Prompts workers (esempio struttura)
- [STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md](STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md) - Analisi problemi
- [TASKS_COMPLETAMENTO.md](TASKS_COMPLETAMENTO.md) - Task dettagliate (da creare)
- [00_MASTER_INDEX.md](00_MASTER_INDEX.md) - Index generale

---

**Fine PLAN_COMPLETAMENTO_FEATURE.md v3.0**
